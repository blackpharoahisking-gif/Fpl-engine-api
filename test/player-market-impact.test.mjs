import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const layer=fs.readFileSync(new URL('../market-impact-inspector.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

function runtime({marketApplied=true}={}){
  let bumps=0,inspects=0;
  const player={id:1,n:'Example',t:'AAA'};
  const context={
    console,
    Date,
    Number,
    String,
    Math,
    MARKET_SUSPEND:false,
    MARKET_WEIGHT:.5,
    S:{gw:2},
    __OTB_SCORING_INTEGRITY__:{version:'test'},
    byId:id=>id===1?player:null,
    fixtureListFor:()=>[{opp:'BBB',home:true}],
    fixtureContext:()=>({marketApplied:marketApplied&&!context.MARKET_SUSPEND}),
    marketActive:()=>true,
    marketAgeMinutes:()=>18.4,
    bumpCache(){bumps++},
    project(){return{x:context.MARKET_SUSPEND?4.67:5.18}},
    inspectPlayer(){inspects++;return'ok'},
    document:{getElementById(){return null}},
    setTimeout(){return 1},
  };
  context.globalThis=context;
  vm.runInNewContext(layer,context,{filename:'market-impact-inspector.js'});
  return{context,player,get bumps(){return bumps},get inspects(){return inspects}};
}

test('production loader adds explainability after scoring integrity without changing projection layers',()=>{
  assert.match(loader,/const BUILD='2026\.08\.26\.6'/);
  const scoringAt=loader.indexOf('scoring-integrity.js?v=2026.08.26.4-scoring');
  const impactAt=loader.indexOf('market-impact-inspector.js?v=2026.08.26.6-market-impact');
  assert.ok(scoringAt>=0,'scoring integrity must remain loaded');
  assert.ok(impactAt>scoringAt,'market-impact inspector must load after the scoring layer');
  assert.doesNotMatch(layer,/Gabriel|ARS\|AVL|AVL\|ARS/,'market-impact explainability must remain player and club agnostic');
});

test('market impact is the exact same-model no-market counterfactual and restores normal state',()=>{
  const r=runtime({marketApplied:true});
  const out=r.context.inspectPlayer(1);
  assert.equal(out,'ok');
  assert.equal(r.inspects,1,'the existing player inspector should still execute exactly once');
  const impact=r.context.__OTB_LAST_PLAYER_MARKET_IMPACT__;
  assert.equal(impact.applied,true);
  assert.equal(impact.modelOnly,4.67);
  assert.equal(impact.blended,5.18);
  assert.ok(Math.abs(impact.delta-.51)<1e-12);
  assert.equal(impact.weight,.5);
  assert.equal(impact.ageMinutes,18.4);
  assert.equal(r.context.MARKET_SUSPEND,false,'market suspension must never leak past the counterfactual');
  assert.equal(r.bumps,2,'counterfactual should clear caches once before and once after market suspension');
});

test('unpriced players do not trigger a market-off recalculation',()=>{
  const r=runtime({marketApplied:false});
  r.context.inspectPlayer(1);
  const impact=r.context.__OTB_LAST_PLAYER_MARKET_IMPACT__;
  assert.equal(impact.applied,false);
  assert.equal(impact.blended,5.18);
  assert.equal(impact.delta,0);
  assert.equal(r.context.MARKET_SUSPEND,false);
  assert.equal(r.bumps,0,'no counterfactual cache churn is needed when market is not applied');
});

test('market-impact copy states the requested model-only to blended delta explicitly',()=>{
  const r=runtime({marketApplied:true});
  const prepared=r.context.__OTB_PLAYER_MARKET_IMPACT__.prepareImpact(r.player,2);
  const impact=r.context.__OTB_PLAYER_MARKET_IMPACT__.finalizeImpact(prepared,r.player,2);
  const html=r.context.__OTB_PLAYER_MARKET_IMPACT__.impactMarkup(impact);
  assert.match(html,/Model-only<\/b> 4\.67 → <b>blended<\/b> 5\.18/);
  assert.match(html,/\+0\.51 xPts/);
  assert.match(html,/50% fixture blend/);
  assert.match(html,/18m old/);
});

test('null counterfactuals remain unavailable rather than being coerced to zero',()=>{
  const r=runtime({marketApplied:true});
  const html=r.context.__OTB_PLAYER_MARKET_IMPACT__.impactMarkup({
    applied:true,modelOnly:null,blended:5.18,delta:null,ageMinutes:null,weight:.5
  });
  assert.match(html,/counterfactual unavailable/);
  assert.doesNotMatch(html,/Model-only<\/b> 0\.00/);
  assert.doesNotMatch(html,/0m old/);
});
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const core=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const sync=readFileSync(new URL('../market-projection-sync.js',import.meta.url),'utf8');

test('production loader installs the global market projection lifecycle bridge',()=>{
  assert.match(app,/market-projection-sync\.js\?v=[^']+-market/,
    'market lifecycle bridge must have an explicit cache-busted semantic layer version');
  assert.match(app,/market projection sync/,
    'production loader should name the market bridge for runtime load errors');
  const liveAt=app.indexOf('app-live-points.js');
  const marketAt=app.indexOf('market-projection-sync.js');
  assert.ok(liveAt>=0&&marketAt>liveAt,'market lifecycle bridge must remain downstream of live/core');
  assert.doesNotThrow(()=>new Function(sync));
});

test('low-power/mobile projection hydration is not gated by the active rail tab',()=>{
  assert.match(sync,/if\(isLowPower\(\)\)void refreshProjectionMarket\('startup-low-power',\{force:true\}\)/);
  assert.match(sync,/setInterval\(\(\)=>void refreshProjectionMarket\('hourly'/);
  assert.match(sync,/visibilitychange/);
  assert.match(sync,/refreshProjectionMarket\('resume'/);
  assert.doesNotMatch(sync,/activeRailTab/);
});

test('market lookup and projection propagation remain generic for both fixture sides and every player',()=>{
  assert.match(core,/MARKET\.byKey\.set\(marketKey\(f\.home,f\.away,true\)/);
  assert.match(core,/MARKET\.byKey\.set\(marketKey\(f\.away,f\.home,false\)/);
  assert.match(core,/function projectFixture\(pl,fx\)\{const ctx=fixtureContext\(pl\.t,fx\)/);
  assert.match(sync,/for\(const \[key,mkt\] of MARKET\.byKey\.entries\(\)\)/);
  assert.doesNotMatch(sync,/Gabriel|ARS\|AVL|AVL\|ARS/,
    'the lifecycle repair must never contain a player- or club-specific exception');
});

test('runtime audit covers every priced team-side and verifies market-sensitive context changes',()=>{
  assert.match(core,/attackM=clamp\(\(1-w\)\*attackM\+w\*mktAttackM/);
  assert.match(core,/lambdaAgainst=clamp\(\(1-w\)\*lambdaAgainst\+w\*mkt\.xgAgainst/);
  assert.match(core,/pCS=clamp\(\(1-w\)\*pCS\+w\*mkt\.pCS/);
  assert.match(core,/dAtk=clamp\(\(1-w\)\*dAtk\+w\*clamp/);
  assert.match(core,/dCS\s*=clamp\(\(1-w\)\*dCS\s*\+w\*clamp/);
  assert.match(sync,/blended\.marketApplied/);
  assert.match(sync,/blended\.attackM/);
  assert.match(sync,/blended\.lambdaAgainst/);
  assert.match(sync,/blended\.pCS/);
  assert.match(sync,/blended\.dAtk/);
  assert.match(sync,/blended\.dCS/);
  assert.match(sync,/__OTB_MARKET_PROPAGATION_AUDIT__/);
});

test('a low-power session hydrates market data immediately, audits both fixture sides, and re-renders projections',async()=>{
  let loads=0,renders=0;
  const events=[];
  const context={
    console,
    Date,
    Math,
    Number,
    String,
    navigator:{onLine:true},
    document:{visibilityState:'visible',addEventListener(){}},
    window:{addEventListener(){}},
    setInterval(){return 1},
    setTimeout(){return 1},
    lowPowerMode:()=>true,
    MARKET_LEAGUE_XG:1.45,
    MARKET_SUSPEND:false,
    MARKET:{
      loading:false,
      byKey:new Map([
        ['AAA|BBB|H',{xgFor:1.9,xgAgainst:.8,pCS:.46}],
        ['BBB|AAA|A',{xgFor:.8,xgAgainst:1.9,pCS:.15}]
      ])
    },
    marketAgeMinutes:()=>null,
    marketActive:()=>true,
    loadMarketData:async()=>{loads++;return true},
    fixtureContext(team,fx){
      if(context.MARKET_SUSPEND)return{attackM:1,lambdaAgainst:1.3,pCS:.27,dAtk:3.5,dCS:3.4,marketApplied:false};
      return team==='AAA'
        ?{attackM:1.15,lambdaAgainst:1.05,pCS:.36,dAtk:3.05,dCS:2.95,marketApplied:true}
        :{attackM:.78,lambdaAgainst:1.6,pCS:.20,dAtk:4.05,dCS:4.2,marketApplied:true};
    },
    render(opts){renders++;context.renderOpts=opts},
    pipelineEvent(...args){events.push(args)}
  };
  context.globalThis=context;
  vm.runInNewContext(sync,context);
  await new Promise(resolve=>setImmediate(resolve));
  await Promise.resolve();

  assert.equal(loads,1,'mobile startup should fetch the market without opening Verdict/Model');
  assert.equal(renders,1,'successful hydration should invalidate/re-render projections through the core loader');
  assert.equal(context.renderOpts.deferPool,true);
  assert.equal(context.__OTB_MARKET_PROPAGATION_AUDIT__.ok,true);
  assert.equal(context.__OTB_MARKET_PROPAGATION_AUDIT__.checked,2);
  assert.equal(context.__OTB_MARKET_PROPAGATION_AUDIT__.applied,2);
  assert.equal(context.__OTB_MARKET_PROPAGATION_AUDIT__.changed,2);
  assert.ok(events.some(e=>e[0]==='MARKET-PROJECTION'&&e[1]==='ok'));
});

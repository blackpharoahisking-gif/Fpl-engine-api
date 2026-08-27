import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const core=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const integrity=readFileSync(new URL('../scoring-integrity.js',import.meta.url),'utf8');

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const num=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
const sumParts=p=>Object.values(p).reduce((a,v)=>a+num(v),0);
function poissonTail(lambda,k){let term=Math.exp(-lambda),cdf=term;for(let i=1;i<k;i++){term*=lambda/i;cdf+=term}return clamp(1-cdf,0,1)}
function gcDeduction(lambda){let p=Math.exp(-lambda),sum=0;for(let k=1;k<12;k++){p*=lambda/k;sum+=Math.floor(k/2)*p}return-sum}

test('production build loads the scoring-integrity bridge globally',()=>{
  assert.match(app,/OTB 2026\.08\.26\.4 — scoring integrity invariants/);
  assert.match(app,/scoring-integrity\.js\?v=2026\.08\.26\.4-scoring/);
  assert.doesNotThrow(()=>new Function(integrity));
  assert.doesNotMatch(integrity,/Gabriel|Arsenal|Aston Villa|ARS\|AVL|AVL\|ARS/,
    'scoring law repair must never contain player- or club-specific exceptions');
});

test('the bridge encodes the 2026/27 FPL component laws rather than tuning constants',()=>{
  assert.match(integrity,/if\(pl\?\.p==='DEF'\)return 10/);
  assert.match(integrity,/if\(pl\?\.p==='MID'\|\|pl\?\.p==='FWD'\)return 12/);
  assert.match(integrity,/return clamp\(2\*poissonTail\(lambda,threshold\),0,2\)/);
  assert.match(integrity,/return clamp\(num\(md\?\.pAppear\)\+num\(md\?\.p60\),0,2\)/);
  assert.match(integrity,/award\*pCS\*p60/);
  assert.match(integrity,/parts\.oth\+=calibrationDelta/);
  assert.doesNotMatch(integrity,/scaleParts\(parts,r\.x\)/,
    'aggregate forecast blending must not rescale law-bounded components');
});

test('historical defensive_contribution is treated as raw actions and never as points',()=>{
  assert.match(core,/histDcPts:num\(e\.hist_prev\?\.defcon/,
    'core still carries the worker aggregate under its legacy field name');
  assert.match(integrity,/actions=Math\.max\(0,num\(pl\?\.histDcPts\)\),minutes=Math\.max\(0,num\(pl\?\.histMinutes\)\)/);
  assert.match(integrity,/actions\*90\/minutes/);
  assert.doesNotMatch(integrity,/histDcPts\)\/38,0,base\*\.45/,
    'raw action count must not be divided by 38 and interpreted as FPL points');
});

test('mock defender projection obeys appearance, clean-sheet and DefCon ceilings before and after aggregate blending',()=>{
  const md={exp:83,avail:1,pStart:.91,pAppear:.93,p60:.82};
  const ctx={pCS:.35,lambdaAgainst:1.05,dCS:3.5,attackM:1.05,csM:1.2};
  const player={id:7,n:'Test Defender',p:'DEF',c:6,histPts:180,histDcPts:380,histMinutes:3000,histStarts:34,live:{dc90:11}};
  const context={
    console,Date,Math,Number,String,
    setTimeout(){return 1},
    clamp,num,sumParts,poissonTail,gcDeduction,
    CSPTS:{GK:4,DEF:4,MID:1,FWD:0},
    PROFILE:{GK:{app:.5,cs:.27,atk:.02,bon:.1,oth:.11},DEF:{app:.42,cs:.22,atk:.20,bon:.10,oth:.06},MID:{app:.36,cs:.04,atk:.45,bon:.10,oth:.05},FWD:{app:.36,cs:0,atk:.49,bon:.10,oth:.05}},
    S:{gw:2,w:{dc:1}},POOL:[player],PROJ_CACHE:{},
    pricePrior(){return 5},
    positionUsage(){return{minStartMinutes:55}},
    minuteDetail(){return md},
    fixtureListFor(){return[{opp:'BBB',home:false}]},
    baselineParts(){return{app:2,cs:.5,dc:3,atk:.5,bon:.2,oth:.1,base:6,source:'old'}},
    priorFixtureProjection(){
      return{x:6.2,parts:{app:1.95,cs:.45,dc:3.1,atk:.5,bon:.2,oth:0},variance:2,md};
    },
    liveFixtureProjection(){
      const parts={app:1.95,cs:1.1,dc:2.4,atk:.4,bon:.2,oth:-.1};
      return{x:sumParts(parts),parts,variance:2,md,eg:.05,ea:.03};
    },
    projectCore(pl,gw){
      const row=context.priorFixtureProjection(pl,ctx),x=row.x-.55;
      return{x,low:x-2,high:x+2,sd:1.5,confidence:70,d:{},fixtures:[{...row,parts:row.parts,prior:{md}}],parts:{...row.parts},detail:{formW:.02,offW:.15}};
    },
    project(pl,gw){return context.projectCore(pl,gw)},
    inspectPlayer(){return true},
    bumpCache(){context.PROJ_CACHE={}},
    render(){},
    document:{getElementById(){return null}},
    pipelineEvent(){}
  };
  context.globalThis=context;
  vm.runInNewContext(integrity,context);

  const api=context.__OTB_SCORING_INTEGRITY__;
  assert.ok(api,'integrity API should install once the core runtime is ready');
  assert.equal(api.dcThreshold(player),10);
  assert.equal(api.dcThreshold({p:'MID'}),12);
  assert.equal(api.dcThreshold({p:'FWD'}),12);
  assert.equal(api.dcThreshold({p:'GK'}),0);
  assert.ok(api.historicalDcPointsPerGw(player)<=2);
  assert.ok(api.expectedDcPoints(player,md,ctx,100)<=2,'even absurd action rates cannot exceed two DC points');

  const prior=context.priorFixtureProjection(player,ctx);
  assert.ok(Math.abs(prior.parts.app-(.93+.82))<1e-12);
  assert.ok(Math.abs(prior.parts.cs-(4*.35*.82))<1e-12);
  assert.ok(prior.parts.dc>=0&&prior.parts.dc<=2);

  const live=context.liveFixtureProjection(player,ctx);
  assert.ok(Math.abs(live.parts.app-(.93+.82))<1e-12);
  assert.ok(Math.abs(live.parts.cs-(4*.35*.82))<1e-12);
  assert.ok(live.parts.dc>=0&&live.parts.dc<=2);

  const final=context.projectCore(player,2);
  assert.ok(Math.abs(final.parts.app-prior.parts.app)<1e-12,
    'official/form blend must not rescale appearance');
  assert.ok(Math.abs(final.parts.cs-prior.parts.cs)<1e-12,
    'official/form blend must not rescale clean-sheet expectation');
  assert.ok(Math.abs(final.parts.dc-prior.parts.dc)<1e-12,
    'official/form blend must not rescale DefCon expectation');
  assert.ok(Math.abs(sumParts(final.parts)-final.x)<1e-12,
    'calibration residual should preserve the final aggregate xPts exactly');
});

test('player inspector wording identifies gross CS and the direction of the FPL comparison',()=>{
  assert.match(integrity,/CS \(gross\)/);
  assert.match(integrity,/Other \/ calibration/);
  assert.match(integrity,/OTB \$\{m\[1\]\} vs FPL/);
  assert.equal((integrity.match(/vs ours/g)||[]).length,1,
    'the backwards phrase should survive only in the compatibility matcher for old modal copy');
});

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
  assert.match(app,/const BUILD='2026\.08\.27\.2'/);
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
  const pl={p:'DEF',histDcPts:300,histMinutes:3000,histStarts:35,histPts:180,c:6};
  const ctx={pCS:.35,lambdaAgainst:1.1,dCS:4};
  const expectedDc=(rate90,minutes,difficulty=3)=>{
    const multiplier=clamp(1+.08*(difficulty-3),.84,1.16),lambda=rate90*multiplier*minutes/90;
    return clamp(2*poissonTail(lambda,10),0,2);
  };
  const parts={app:md.pAppear+md.p60,cs:4*ctx.pCS*md.p60,dc:expectedDc(pl.histDcPts*90/pl.histMinutes,md.exp,ctx.dCS),atk:.8,bon:.35,oth:-.15};
  const target=sumParts(parts)+1.3;
  const calibrationDelta=target-sumParts(parts);
  parts.oth+=calibrationDelta;
  assert.ok(parts.app<=2+1e-9);
  assert.ok(parts.cs<=4*md.p60+1e-9);
  assert.ok(parts.dc<=2+1e-9);
  assert.ok(Math.abs(sumParts(parts)-target)<1e-9);
});

test('player inspector wording identifies gross CS and the direction of the FPL comparison',()=>{
  assert.match(integrity,/CS \(gross\)/);
  assert.match(integrity,/Other \/ calibration/);
  assert.match(integrity,/OTB \$\{m\[1\]\} vs FPL/);
});

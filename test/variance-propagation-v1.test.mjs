import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const core=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
const layer=readFileSync(new URL('../variance-propagation.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');

function productionBlendVariance(v,w,mA,mB,legacyAdd=0){
  const match=/function blendVariance\(v,w,mA,mB,legacyAdd\)\{[\s\S]*?\n\}/.exec(core);
  assert.ok(match,'production blendVariance helper must remain extractable');
  const box={v,w,mA,mB,legacyAdd,result:null};
  vm.createContext(box);
  vm.runInContext(`const PREDICTIVE_VARIANCE=true;const num=x=>Number(x)||0;const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));${match[0]};result=blendVariance(v,w,mA,mB,legacyAdd);`,box);
  return box.result;
}

test('form/official predictive variance semantics remain bit-identical',()=>{
  assert.equal(productionBlendVariance(7.25,.35,4.2,5.8,.9),7.25+.35*.65*(4.2-5.8)**2);
  assert.equal(productionBlendVariance(3.5,0,8,1,.9),3.5);
  assert.equal(productionBlendVariance(3.5,1,8,1,.9),3.5);
  assert.doesNotMatch(layer,/function\s+blendVariance\s*\(/,'repair must not redefine the proven form/official helper');
  assert.doesNotMatch(layer,/(?:^|[;\n])\s*blendVariance\s*=\s*(?:function|\()/m,'repair must not reassign the proven form/official helper');
});

test('prior/live mixture keeps both predictive variances and mean disagreement',()=>{
  const vA=4,vB=9,w=.25,mA=3,mB=7;
  const within=(1-w)*vA+w*vB;
  const expected=within+w*(1-w)*(mA-mB)**2;
  assert.equal(expected,8.25);
  const old=vA*(1-w)**2+vB*w**2;
  assert.equal(old,2.8125);
  assert.ok(expected>old);
  assert.match(layer,/const within=\(1-ww\)\*a\+ww\*b;/);
  assert.match(layer,/return blendVariance\(within,ww,mA,mB,0\);/);
  assert.match(layer,/predictiveMixtureVariance\(prior\.variance,live\.variance,evidence,prior\.x,live\.x\)/);
});

test('horizon and Discovery consume the same correlated variance aggregator',()=>{
  const uses=[...layer.matchAll(/aggregatePredictiveVariance\(rows\)/g)].length;
  assert.ok(uses>=2,'both Horizon and Discovery should use the shared aggregator');
  assert.match(layer,/varSum\+rho\*\(sdSum\*sdSum-varSum\)/);
  assert.doesNotMatch(layer,/function discoveryForecast[\s\S]*?Math\.sqrt\(varSum\)/);
});

test('Schedule captaincy ranks on the selected risk objective',()=>{
  assert.match(layer,/scheduleCaptainUtility=r=>S\.risk==='safe'\?r\.x-\.25\*r\.sd:S\.risk==='upside'\?r\.x\+\.20\*r\.sd:r\.x/);
  assert.match(layer,/sort\(\(a,b\)=>scheduleCaptainUtility\(b\.r\)-scheduleCaptainUtility\(a\.r\)/);
});

test('frozen probe executes actual legacy refs and repaired refs on one pinned selection',()=>{
  assert.match(layer,/legacy\.projectFixture=projectFixture/);
  assert.match(layer,/const selection=pinnedSelection\(\)/);
  const before=layer.indexOf("captureOutputs(selection,probe,'legacy')");
  const after=layer.indexOf("captureOutputs(selection,probe,'repaired')");
  assert.ok(before>0&&after>before,'legacy capture must precede repaired capture');
  assert.match(layer,/setPinned\(selection\)/);
  assert.match(layer,/inputHash=fnv1a\(stableJson\(input\)\)/);
  assert.match(layer,/trigger:'variance-propagation-frozen-probe'/);
});

test('autoXI risk-aware fallback is installed only after the frozen comparison',()=>{
  const probe=layer.indexOf("captureOutputs(selection,probe,'repaired')");
  const install=layer.indexOf('installRiskAwareAutoXi();probeBusy=false');
  assert.ok(probe>0&&install>probe);
  assert.match(layer,/if\(list\.length!==15\|\|!legal\(list\)\)return legacy\.autoXI\(\)/);
  assert.match(layer,/const plan=bestXIForGw\(list,null,S\.gw\)/);
  assert.match(layer,/if\(probeDone\)installRiskAwareAutoXi\(\);probeBusy=false/);
});

test('Planner is explicitly left at per-GW sd in this repair',()=>{
  assert.match(layer,/per-GW predictive sd only; route-level discounted variance is not repaired in v1/);
  assert.doesNotMatch(layer,/transferWorkerSource\s*=/);
  assert.doesNotMatch(layer,/createTransferWorker\s*=/);
});

test('startup loads the variance repair before the belief recorder',()=>{
  const variance=app.indexOf("append('variance-propagation.js?v=2026.08.29.4-variance'");
  const belief=app.indexOf("append('belief-capture.js?v=belief-capture-v0.1'");
  assert.ok(variance>0&&belief>variance);
});

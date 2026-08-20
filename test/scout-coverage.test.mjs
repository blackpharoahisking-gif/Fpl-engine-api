import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const start=html.indexOf('const ROLE_INTEL=');
const end=html.indexOf('\nfunction poissonTail',start);
assert.ok(start>=0&&end>start,'role-intelligence + scout-coverage block must be present');
const source=html.slice(start,end);

function makeContext(events){
  const context={
    clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
    num:(x,d=0)=>Number.isFinite(Number(x))?Number(x):d,
    S:{roleIntel:{events}},
    POOL:[],
    stableKey:p=>p.apiId!=null?'api:'+p.apiId:'p:'+p.n,
    Date,Math,Object,Array,String,Number,console,
  };
  vm.createContext(context);
  vm.runInContext(`${source};globalThis.__coverage={scoutCoverageFor,roleIntelFor};`,context);
  return context.__coverage;
}

function stubPlayer(){return {id:1,apiId:501,n:'Test Player',p:'FWD'};}

test('a player with zero active role-intelligence events shows no scout coverage',()=>{
  const {scoutCoverageFor}=makeContext([]);
  const cov=scoutCoverageFor(stubPlayer());
  assert.equal(cov.hasAnyEvidence,false);
  assert.equal(cov.hasWorkerEvidence,false);
  assert.equal(cov.count,0);
  assert.equal(cov.workerCount,0);
});

test('a live scout-scanned event is distinguished from a manual-only one',()=>{
  const key='api:501';
  const workerEvent={id:'e1',affectedKey:key,type:'injury',confidence:.8,overlap:.8,hierarchy:.8,worker:true,createdAt:Date.now()};
  const {scoutCoverageFor}=makeContext([workerEvent]);
  const cov=scoutCoverageFor(stubPlayer());
  assert.equal(cov.hasAnyEvidence,true);
  assert.equal(cov.hasWorkerEvidence,true);
  assert.equal(cov.count,1);
  assert.equal(cov.workerCount,1);
});

test('a manual (non-worker) role event counts as evidence but not live scout coverage',()=>{
  const key='api:501';
  const manualEvent={id:'e2',affectedKey:key,type:'observed_role',confidence:.7,overlap:.7,hierarchy:.7,worker:false,createdAt:Date.now()};
  const {scoutCoverageFor}=makeContext([manualEvent]);
  const cov=scoutCoverageFor(stubPlayer());
  assert.equal(cov.hasAnyEvidence,true);
  assert.equal(cov.hasWorkerEvidence,false);
  assert.equal(cov.count,1);
  assert.equal(cov.workerCount,0);
});

test('events for a different player do not count as this player\'s coverage',()=>{
  const otherEvent={id:'e3',affectedKey:'api:999',type:'injury',confidence:.9,overlap:.9,hierarchy:.9,worker:true,createdAt:Date.now()};
  const {scoutCoverageFor}=makeContext([otherEvent]);
  const cov=scoutCoverageFor(stubPlayer());
  assert.equal(cov.hasAnyEvidence,false);
  assert.equal(cov.count,0);
});

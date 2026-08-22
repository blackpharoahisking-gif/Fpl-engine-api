import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html=readFileSync(new URL('../app-core.js',import.meta.url),'utf8');
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

/* Marcus, 21 Aug: "If a player keeps starting, I need it reflected in the
   engine. If a player no longer starts... that needs to be reflected too."
   Non-starts arrived as rotation_warning on the MANAGER channel, where
   resolveRoleIntelEvents keeps only the single most recent event per player,
   while starts arrive as observed_role on the SELECTION channel which keeps
   three. Three benchings therefore counted once while three starts counted
   three times, so a dropped player could only ever drift upward. */

const TEST_NOW=Date.parse('2026-08-22T12:00:00.000Z');
class FixedDate extends Date{
  static now(){return TEST_NOW;}
}

function policyContext(){
  const start=html.indexOf('const ROLE_INTEL=');
  const end=html.indexOf('\nfunction poissonTail',start);
  const context={
    clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
    num:(x,d=0)=>Number.isFinite(Number(x))?Number(x):d,
    S:{roleIntel:{events:[]}},POOL:[],stableKey:p=>'api:'+p.apiId,
    Date:FixedDate,Math,Object,Array,String,Number,console,
  };
  vm.createContext(context);
  vm.runInContext(`${html.slice(start,end)};globalThis.__p={ROLE_EVIDENCE_POLICY,roleEventLogOdds,resolveRoleIntelEvents,roleSelectionEvidenceDirection};`,context);
  return context.__p;
}

const obs=(type,round,ageHours=0)=>({
  id:`e${type}${round}`,affectedKey:'api:1',affected:'Keeper',subject:'Keeper',type,rawType:type,
  overlap:1,hierarchy:1,confidence:.95,evidenceClass:'selection',
  evidenceDate:new Date(TEST_NOW-ageHours*3600000).toISOString(),
  createdAt:TEST_NOW-ageHours*3600000,
});

test('a start and a non-start are mirror images on the same channel',()=>{
  const {ROLE_EVIDENCE_POLICY}=policyContext();
  const up=ROLE_EVIDENCE_POLICY.observed_role,down=ROLE_EVIDENCE_POLICY.observed_bench;
  assert.ok(down,'observed_bench must exist or scout events silently score zero');
  assert.equal(down.k,-up.k,'equal and opposite');
  assert.equal(down.channel,up.channel,'same channel or they accumulate differently');
  assert.equal(down.halfLife,up.halfLife);
  assert.equal(down.ttl,up.ttl);
});

test('three consecutive benchings all count, where before only the latest did',()=>{
  const {resolveRoleIntelEvents}=policyContext();
  const benches=[obs('observed_bench',3,1),obs('observed_bench',2,170),obs('observed_bench',1,340)];
  assert.equal(resolveRoleIntelEvents(benches).length,3);
  const warnings=[{...obs('observed_bench',3,1),type:'rotation_warning',rawType:'rotation_warning',evidenceClass:'manager'},
                  {...obs('observed_bench',2,170),type:'rotation_warning',rawType:'rotation_warning',evidenceClass:'manager'}];
  assert.equal(resolveRoleIntelEvents(warnings).length,1,'the old manager-channel path kept only one');
});

test('an irregular starter nets out between the two, not pinned to either',()=>{
  const {roleEventLogOdds,resolveRoleIntelEvents}=policyContext();
  const sum=rows=>resolveRoleIntelEvents(rows).reduce((a,e)=>a+roleEventLogOdds(e),0);
  const nailed=sum([obs('observed_role',3,1),obs('observed_role',2,170),obs('observed_role',1,340)]);
  const dropped=sum([obs('observed_bench',3,1),obs('observed_bench',2,170),obs('observed_bench',1,340)]);
  const irregular=sum([obs('observed_role',3,1),obs('observed_bench',2,170),obs('observed_role',1,340)]);
  assert.ok(nailed>0&&dropped<0,'the two extremes must point opposite ways');
  assert.ok(Math.abs(nailed+dropped)<1e-9,'and be symmetric');
  assert.ok(irregular<nailed&&irregular>dropped,'start-miss-start sits between the extremes');
});

test('only the three most recent observations decide, whatever they were',()=>{
  const {resolveRoleIntelEvents}=policyContext();
  const rows=[obs('observed_bench',5,1),obs('observed_bench',4,170),obs('observed_bench',3,340),
              obs('observed_role',2,510),obs('observed_role',1,680)];
  const kept=resolveRoleIntelEvents(rows);
  assert.equal(kept.length,3);
  assert.deepEqual([...kept].map(e=>e.type),['observed_bench','observed_bench','observed_bench'],
    'a player dropped for three straight games must not still be carrying old starts');
});

test('a non-start is presented as negative selection evidence',()=>{
  const {roleSelectionEvidenceDirection}=policyContext();
  assert.equal(roleSelectionEvidenceDirection({type:'observed_bench'}),-1);
  assert.equal(roleSelectionEvidenceDirection({type:'observed_role'}),1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const client=fs.readFileSync(new URL('../belief-capture.js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../belief-capture-worker.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('belief capture is a write-side observer and does not alter live maths or UI',()=>{
  assert.match(client,/Observer only/);
  assert.doesNotMatch(client,/Math\.random\s*=/);
  assert.doesNotMatch(client,/\b(?:project|minuteDetail|transferPlannerPayload|verdictContext|verdictDecisionState)\s*=(?!=)/);
  assert.doesNotMatch(client,/innerHTML\s*=|appendChild\(/);
});

test('capture writes locally before remote upload and verification never vetoes a row',()=>{
  assert.ok(client.indexOf('await queuePut(row)')<client.indexOf('void flush()'));
  assert.match(worker,/Verification is descriptive, never a veto/);
  assert.match(worker,/claimedSnapshotHash/);
  assert.match(worker,/snapshotError/);
});

test('snapshot is content-addressed and runtime decision code is hashed',()=>{
  assert.match(client,/decisionRuntimeHash=await sha256Value\(identity\)/);
  assert.match(client,/transferWorkerSource/);
  assert.match(client,/snapshotHash=await sha256Value\(snapshot\)/);
  assert.match(worker,/belief\/snapshots\/sha256\/\$\{hash\}\.json/);
});

test('planner evidence preserves exact semantic payload and existing stress output',()=>{
  assert.match(client,/payload=plain\(transferPlannerPayload\(\)\)/);
  assert.match(client,/const last=S\.transfer\?\.last\?plain\(S\.transfer\.last\):null/);
  assert.doesNotMatch(client,/mulberry32|perturbPlayers|gauss\(/);
});

test('R2 event objects are immutable-keyed and no delete path exists',()=>{
  assert.match(worker,/belief\/events\/gw-/);
  assert.match(worker,/OTB_IRRECOVERABLE\.put\(key/);
  assert.doesNotMatch(worker,/\.delete\(/);
});

test('loader keeps belief capture after decision layers and non-critical',()=>{
  assert.match(loader,/belief-capture\.js/);
  assert.ok(loader.indexOf('decision-interface-integrity.js')<loader.indexOf('belief-capture.js'));
});

class FakeR2{
  constructor(){this.objects=new Map()}
  async head(key){return this.objects.has(key)?{key}:null}
  async put(key,value,opts={}){this.objects.set(key,{value:String(value),opts});return{key}}
}
async function hashStable(value){
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.keys(v).sort().reduce((o,k)=>(o[k]=stable(v[k]),o),{}):v;
  const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(value))));
  return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

test('writer records degraded evidence instead of rejecting a hash mismatch',async()=>{
  const {handleRequest}=await import('../belief-capture-worker.js');
  const bucket=new FakeR2(),snapshot={schemaVersion:'otb-belief-event-v0',gw:3,runtime:{decisionRuntimeHash:'abc'},x:1};
  const row={id:'row-1',snapshotHash:'wrong',snapshot,event:{gw:3,capturedAt:'2026-08-28T20:00:00.000Z',trigger:'test'}};
  const response=await handleRequest(new Request('https://writer.test/api/belief-capture/v0/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(row)}),{OTB_IRRECOVERABLE:bucket});
  assert.equal(response.status,201);
  const body=await response.json();
  assert.equal(body.reproducible,false);
  assert.equal(body.checks.snapshotHash,false);
  assert.equal(body.snapshotHash,await hashStable(snapshot));
  assert.ok([...bucket.objects.keys()].some(k=>k.startsWith('belief/events/gw-03/')));
  assert.ok(bucket.objects.has(`belief/snapshots/sha256/${body.snapshotHash}.json`));
});

test('writer retries are idempotent and do not overwrite an existing event key',async()=>{
  const {handleRequest}=await import('../belief-capture-worker.js');
  const bucket=new FakeR2(),snapshot={schemaVersion:'otb-belief-event-v0',gw:4,runtime:{decisionRuntimeHash:'def'},x:2},snapshotHash=await hashStable(snapshot);
  const row={id:'row-2',snapshotHash,snapshot,event:{gw:4,capturedAt:'2026-08-28T21:00:00.000Z',trigger:'test'}};
  const req=()=>new Request('https://writer.test/api/belief-capture/v0/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(row)});
  const first=await handleRequest(req(),{OTB_IRRECOVERABLE:bucket});
  const second=await handleRequest(req(),{OTB_IRRECOVERABLE:bucket});
  assert.equal(first.status,201);
  assert.equal(second.status,200);
  assert.equal((await second.json()).duplicate,true);
  assert.equal([...bucket.objects.keys()].filter(k=>k.startsWith('belief/events/gw-04/')).length,1);
});

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

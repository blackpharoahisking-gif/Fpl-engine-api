import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = name => readFile(new URL(`../${name}`, import.meta.url), 'utf8');

test('production loader preserves live scoring and keeps legacy D1 accountability available downstream', async () => {
  const [loader, live] = await Promise.all([read('app.js'), read('app-live-points.js')]);
  assert.match(loader, /const BUILD='2026\.08\.26\.9'/);
  assert.match(loader, /app-live-points\.js\?v=2026\.08\.26\.9-live/);
  assert.match(loader, /cloud-accountability\.js\?v=2026\.08\.26\.2-cloud/);
  assert.match(loader, /live\.onload=\(\)=>\{/,'downstream layers must still be gated by successful live/core startup');
  assert.match(live, /OTB 2026\.08\.26\.1/);
  assert.match(live, /script\.src='app-core\.js\?v=2026\.08\.26\.1-core'/);
});

test('browser accountability uses a non-exportable signing credential and no persisted owner secret', async () => {
  const cloud = await read('cloud-accountability.js');
  assert.match(cloud, /indexedDB\.open\(DB_NAME,1\)/);
  assert.match(cloud, /importKey\('jwk',privateJwk,\{name:'ECDSA',namedCurve:'P-256'\},false,\['sign'\]\)/);
  assert.match(cloud, /x-evaluation-device/);
  assert.match(cloud, /x-evaluation-timestamp/);
  assert.match(cloud, /x-evaluation-signature/);
  assert.doesNotMatch(cloud, /localStorage\.setItem\([^\n]*(owner|evaluation|credential|key)/i);
});

test('every local accountable capture is mirrored and the no-market counterfactual survives', async () => {
  const cloud = await read('cloud-accountability.js');
  assert.match(cloud, /const baseCapture=performProjectionSnapshotCapture/);
  assert.match(cloud, /setTimeout\(\(\)=>void commitSnapshot\(snapshot\),0\)/);
  assert.match(cloud, /noMarketXpts:Number\.isFinite\(noMarket\)\?noMarket:null/);
  assert.doesNotMatch(cloud, /noMarketXPts:/);
  assert.match(cloud, /Math\.abs\(localAt-serverAt\)>5\*60\*1000/);
  for (const label of ['D1 VERIFIED','D1 COMMITTED','D1 SOURCE OLD','ACCOUNTABILITY AT RISK','LOCAL ONLY','NO FORECAST']) {
    assert.ok(cloud.includes(label), `missing accountability UI state: ${label}`);
  }
});

test('Worker canonical ingest enforces signature, current source, coverage and pre-deadline finality', async () => {
  const worker = await read('src/evaluation-device.js');
  for (const route of ['/api/evaluation/device-enrol','/api/evaluation/browser-projections','/api/evaluation/browser-status']) {
    assert.ok(worker.includes(route), `missing route ${route}`);
  }
  assert.match(worker, /crypto\.subtle\.verify\(\{name:'ECDSA',hash:'SHA-256'\}/);
  assert.match(worker, /receivedMs>=deadlineMs/);
  assert.match(worker, /localMs>=deadlineMs/);
  assert.match(worker, /serverHash!==clientSourceHash/);
  assert.match(worker, /Math\.max\(MIN_PLAYERS,Math\.floor\(ctx\.players\.length\*\.9\)\)/);
  assert.match(worker, /evaluation_browser_commits/);
  assert.match(worker, /evaluation_personal_snapshots/);
  assert.match(worker, /no_market_xpts/);
  assert.match(worker, /client_snapshot_checksum/);
});

test('signed routes are dispatched before legacy Worker routing', async () => {
  const index = await read('src/index.js');
  const importAt = index.indexOf("import { handleBrowserEvaluationRoute } from './evaluation-device.js'");
  const dispatchAt = index.indexOf('handleBrowserEvaluationRoute(request,env)');
  const legacyOptionsAt = index.indexOf("if(request.method==='OPTIONS')", dispatchAt);
  assert.ok(importAt >= 0);
  assert.ok(dispatchAt > importAt);
  assert.ok(legacyOptionsAt > dispatchAt, 'signed route must own its CORS preflight before legacy routing');
});

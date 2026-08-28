import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {freezeDecision} from '../scripts/check-release-freeze.mjs';

const server=readFileSync(new URL('../src/evaluation-ledger-v2.js',import.meta.url),'utf8');
const client=readFileSync(new URL('../accountability-v2.js',import.meta.url),'utf8');
const governance=readFileSync(new URL('../accountability-governance.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const release=readFileSync(new URL('../release-identity.js',import.meta.url),'utf8');

test('v2 ledger is append-only and canonical selection queries immutable snapshots',()=>{
  assert.match(server,/evaluation_v2_snapshots[\s\S]*snapshot_id TEXT PRIMARY KEY/);
  assert.match(server,/capture_key TEXT NOT NULL UNIQUE/);
  assert.match(server,/evaluation_v2_predictions[\s\S]*PRIMARY KEY\(snapshot_id,player_id\)/);
  assert.match(server,/ORDER BY local_captured_at DESC,committed_at DESC LIMIT 1/);
  assert.doesNotMatch(server,/INSERT INTO evaluation_v2_snapshots[\s\S]{0,800}ON CONFLICT\(season,gw,model_version,weights_hash\)/);
});

test('model identity hashes the projection-semantic content, not only weights',()=>{
  for(const path of ['app-core.js','app-live-points.js','scoring-integrity.js','market-projection-sync.js'])assert.match(client,new RegExp(path.replaceAll('.','\\.')));
  assert.match(client,/modelCodeHash:await sha256\(stableJson\(rows\)\)/);
  assert.match(server,/sha256\(stableJson\(manifestClean\)\)\!==modelCodeHash/);
  assert.match(server,/sha256\(configJson\)\!==weightsHash/);
});

test('v2 route runs before the legacy overwrite-compatible route',()=>{
  const v2=index.indexOf('handleBrowserEvaluationV2Route(request,env)');
  const legacy=index.indexOf('handleBrowserEvaluationRoute(request,env)');
  assert.ok(v2>=0&&legacy>v2);
});

test('decision drift is acknowledgement-based, squad-level and build changes are unconditional',()=>{
  assert.match(governance,/ACK_KEY='otb-verdict-ack-v2'/);
  assert.match(governance,/xiDelta:cur\.xiTotal-n\(prev\.xiTotal\)/);
  assert.match(governance,/if\(d\.buildChanged\)rows\.push/);
  assert.match(governance,/Acknowledge current state/);
  assert.doesNotMatch(governance,/verdictSaveSeen\(/);
  assert.doesNotMatch(governance,/new\s+MutationObserver|MutationObserver\s*\(/);
});

test('Decision Memory keeps build provenance visible on mobile and separates attribution',()=>{
  assert.match(governance,/\.dm-build\{display:inline!important\}/);
  assert.match(governance,/Decision:<\/b>/);
  assert.match(governance,/Projection\/data:<\/b>/);
  assert.match(governance,/unconditional provenance break/);
});

test('governance layer never replaces projection functions or market/scoring coefficients',()=>{
  assert.doesNotMatch(governance,/(?:^|[;\n])\s*project\s*=/m);
  assert.doesNotMatch(governance,/(?:^|[;\n])\s*fixtureContext\s*=/m);
  assert.doesNotMatch(governance,/MARKET_WEIGHT\s*=/);
  assert.doesNotMatch(governance,/S\.w\.[A-Za-z]+\s*=/);
});

test('release freeze blocks semantic changes inside T-6h and all production changes inside T-90m',()=>{
  const now=Date.UTC(2026,7,27,12);
  assert.equal(freezeDecision({deadlineMs:now+7*3600e3,nowMs:now,files:['scoring-integrity.js']}).allowed,true);
  assert.equal(freezeDecision({deadlineMs:now+5*3600e3,nowMs:now,files:['scoring-integrity.js']}).allowed,false);
  assert.equal(freezeDecision({deadlineMs:now+5*3600e3,nowMs:now,files:['test/foo.test.mjs']}).allowed,true);
  assert.equal(freezeDecision({deadlineMs:now+80*60e3,nowMs:now,files:['accountability-governance.js']}).allowed,false);
  assert.equal(freezeDecision({deadlineMs:now+80*60e3,nowMs:now,files:['accountability-governance.js'],breakGlass:true}).allowed,true);
});

test('production loader preserves live/core-first boot and advances build coherently',()=>{
  const live=app.indexOf("live.src='app-live-points.js");
  const role=app.indexOf('role-freshness-sync.js');
  const v2=app.indexOf('accountability-v2.js');
  const decision=app.indexOf('decision-interface-integrity.js');
  assert.ok(live>=0&&role>live&&v2>role&&decision>v2);
  assert.match(app,/const BUILD='2026\.08\.28\.1'/);
  assert.match(release,/const RELEASE='2026\.08\.28\.1'/);
  assert.doesNotMatch(release,/new\s+MutationObserver|MutationObserver\s*\(/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sync=fs.readFileSync(new URL('../role-freshness-sync.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const core=fs.readFileSync(new URL('../app-core.js',import.meta.url),'utf8');

test('role freshness remains downstream of the proven live/core startup path',()=>{
  const live=loader.indexOf('app-live-points.js?v=2026.08.29.3-live');
  const role=loader.indexOf('role-freshness-sync.js?v=2026.08.26.9-role-freshness');
  assert.ok(live>=0);
  assert.ok(role>live);
  assert.match(sync,/runtimeReady\(\).*applyScoutReport/s);
});

test('client uses explicit freshness status and priority request contracts',()=>{
  assert.match(sync,/\/api\/role-freshness\/status/);
  assert.match(sync,/\/api\/role-freshness\/request/);
  assert.match(sync,/reason:'app-startup',priority:8/);
  assert.match(sync,/reason:'planner-open',priority:7/);
  assert.match(sync,/reason:dm<=90\?'deadline-t90':'deadline-t6h'/);
});

test('planner requests league-wide freshness while squad views prioritise owned clubs',()=>{
  assert.match(sync,/requestTeams\(allTeams\(\),\{reason:'planner-open',priority:7\}\)/);
  assert.match(sync,/const teams=squadTeams\(\)/);
  assert.match(sync,/requestTeams\(teams,\{reason,priority:8\}\)/);
});

test('automatic hydration reads cached role reports without forcing expensive scans',()=>{
  const hydrateStart=sync.indexOf('async function hydrateTeam');
  const hydrateEnd=sync.indexOf('async function hydrateNewer',hydrateStart);
  const hydrate=sync.slice(hydrateStart,hydrateEnd);
  assert.match(hydrate,/\/api\/role-intelligence\?team=/);
  assert.doesNotMatch(hydrate,/force=1/);
  assert.match(hydrate,/applyScoutReport\(data\)/);
});

test('existing applyScoutReport remains the single downstream invalidation path',()=>{
  const start=core.indexOf('function applyScoutReport');
  const end=core.indexOf('function renderScoutReport',start);
  const fn=core.slice(start,end);
  assert.match(fn,/S\.roleIntel\.events=\[\.\.\.manual,\.\.\.applied\]/);
  assert.match(fn,/bumpCache\(\)/);
  assert.match(fn,/saveUserState\(\)/);
  assert.match(fn,/renderRoleIntelligence\(\)/);
  assert.match(fn,/render\(\)/);
});

test('transfer planner fingerprints projection inputs so role changes invalidate old routes',()=>{
  assert.match(core,/function transferPlanIsStale\(last=S\.transfer\?\.last\)/);
  assert.match(core,/return last\.verdictFingerprint!==verdictPlannerFingerprint\(\)/);
  assert.match(core,/function transferPlannerPayload\(\).*project\(p,g\).*minuteDetail\(p\)/s);
});

test('role freshness bridge does not define projection coefficients or scoring maths',()=>{
  assert.doesNotMatch(sync,/MARKET_WEIGHT\s*=/);
  assert.doesNotMatch(sync,/S\.w\s*=/);
  assert.doesNotMatch(sync,/function\s+projectFixture\s*\(/);
  assert.doesNotMatch(sync,/function\s+projectCore\s*\(/);
  assert.doesNotMatch(sync,/GOALPTS\s*=/);
  assert.doesNotMatch(sync,/CSPTS\s*=/);
});

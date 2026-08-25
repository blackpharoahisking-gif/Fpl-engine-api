import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  GAMEWEEK_FINALITY_GRACE_MS,
  gameweekCompletionStatus,
} from '../src/index-core.js';

const core = readFileSync(new URL('../app-core.js', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../src/index-core.js', import.meta.url), 'utf8');

const kickoff = '2026-08-24T19:00:00Z';
const completedFixture = (overrides = {}) => ({
  id: 10,
  event: 1,
  kickoff_time: kickoff,
  finished: true,
  finished_provisional: true,
  team_h_score: 2,
  team_a_score: 1,
  ...overrides,
});

test('the official event-level finality signal remains authoritative', () => {
  const result = gameweekCompletionStatus(
    { id: 1, finished: true, data_checked: true },
    [],
    Date.parse('2026-08-24T20:00:00Z'),
  );
  assert.equal(result.complete, true);
  assert.equal(result.official, true);
  assert.equal(result.source, 'official-data-checked');
});

test('stale event flags fall back only after every scored fixture is final and the grace window elapsed', () => {
  const event = { id: 1, finished: false, data_checked: false };
  const before = gameweekCompletionStatus(
    event,
    [completedFixture()],
    Date.parse(kickoff) + GAMEWEEK_FINALITY_GRACE_MS - 1,
  );
  const after = gameweekCompletionStatus(
    event,
    [completedFixture()],
    Date.parse(kickoff) + GAMEWEEK_FINALITY_GRACE_MS,
  );
  assert.equal(before.complete, false);
  assert.equal(after.complete, true);
  assert.equal(after.official, false);
  assert.equal(after.source, 'completed-fixtures-grace');
});

test('the fallback rejects unfinished, unscored, non-provisional, or malformed fixture sets', () => {
  const event = { id: 1, finished: false, data_checked: false };
  const afterGrace = Date.parse(kickoff) + GAMEWEEK_FINALITY_GRACE_MS + 1;
  for (const fixtures of [
    [],
    [completedFixture({ finished: false })],
    [completedFixture({ finished_provisional: false })],
    [completedFixture({ team_h_score: null })],
    [completedFixture({ kickoff_time: null })],
  ]) {
    assert.equal(gameweekCompletionStatus(event, fixtures, afterGrace).complete, false);
  }
});

test('fallback actuals remain distinguishable and are upgraded when FPL later data-checks them', () => {
  assert.match(worker, /MIN\(data_checked\) AS data_checked/);
  assert.match(worker, /data_checked:status\.official\?1:0/);
  assert.match(worker, /status\.official && !stored\.official/);
  assert.match(worker, /evaluation_actual_finality_gw_/);
  assert.match(worker, /gameweek_intelligence_finality_gw_/);
  assert.match(worker, /official-data-checked/);
  assert.match(worker, /completed-fixtures-grace/);
});

test('future-Gameweek result sync is disabled and cannot store empty or live rows as final', () => {
  assert.match(core, /provisional:!!f\.finished_provisional/);
  assert.match(core, /scoreReady:f\.team_h_score!==null/);
  assert.match(core, /if\(!accuracyFinished\(gw\)\)throw new Error\(`GW\$\{gw\} results are not final yet/);
  assert.match(core, /if\(!accuracyFinished\(gw\)\)\{ACCURACY\.error='';renderAccuracy\(\)/);
  assert.match(core, /OFFICIAL RESULTS NOT YET AVAILABLE/);
  assert.match(core, /if\(responded\)throw new Error\(`Official GW\$\{gw\} results are not complete yet/);
});

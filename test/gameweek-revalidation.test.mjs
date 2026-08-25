import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  gameweekIntelligenceSourceHash,
  processGameweekBatch,
  selectGameweekCandidates,
} from '../src/index-core.js';
import { FPL_SCORING_POLICY } from '../src/fpl-scoring.js';

const sourceRow = (overrides = {}) => ({
  gw: 1,
  player_id: 7,
  web_name: 'Signal',
  team_code: 'AAA',
  position: 3,
  price: 55,
  ownership: 4.2,
  status: 'a',
  total_points: 8,
  minutes: 90,
  starts: 1,
  goals_scored: 1,
  assists: 0,
  clean_sheets: 1,
  goals_conceded: 0,
  saves: 0,
  bonus: 2,
  bps: 28,
  creativity: 20,
  threat: 50,
  defensive_contribution: 12,
  expected_goals: .5,
  expected_assists: .1,
  expected_goal_involvements: .6,
  expected_goals_conceded: .7,
  captured_at: '2026-08-25T13:00:00Z',
  ...overrides,
});

const fixture = (overrides = {}) => ({
  id: 1,
  event: 1,
  team_h: 1,
  team_a: 2,
  team_h_score: 2,
  team_a_score: 1,
  kickoff_time: '2026-08-24T13:00:00Z',
  finished: true,
  finished_provisional: true,
  ...overrides,
});

test('a broken short payload cannot abort the next Gameweek in the batch', async () => {
  const visited = [];
  const batch = await processGameweekBatch([{ gw: 1 }, { gw: 2 }], async ({ gw }) => {
    visited.push(gw);
    if (gw === 1) throw new Error('short payload');
    return { gw, captured: 600 };
  });
  assert.deepEqual(visited, [1, 2]);
  assert.deepEqual(batch.results, [{ gw: 2, captured: 600 }]);
  assert.deepEqual(batch.errors, [{ gw: 1, error: 'short payload' }]);
});

test('required refreshes are prioritised while recent completed Gameweeks are still revalidated', () => {
  const completed = [1, 2, 3, 4].map((gw) => ({ gw, complete: true }));
  assert.deepEqual(
    selectGameweekCandidates(completed, [completed[0]], 2).map((row) => row.gw),
    [1, 4],
  );
  assert.deepEqual(
    selectGameweekCandidates(completed, [], 2).map((row) => row.gw),
    [4, 1],
  );
  const checkedAt = new Map([
    [1, '2026-08-25T12:30:00Z'],
    [2, '2026-08-25T12:00:00Z'],
    [3, '2026-08-25T12:20:00Z'],
    [4, '2026-08-25T12:40:00Z'],
  ]);
  assert.deepEqual(
    selectGameweekCandidates(completed, [], 2, checkedAt).map((row) => row.gw),
    [4, 2],
  );
});

test('the review source hash is stable for capture metadata but changes with report-driving revisions', async () => {
  const base = {
    rows: [sourceRow()],
    historyRows: [sourceRow({ gw: 0, total_points: 2 })],
    fixtures: [fixture()],
    gw: 1,
  };
  const hash = await gameweekIntelligenceSourceHash(base);
  const reorderedMetadata = await gameweekIntelligenceSourceHash({
    ...base,
    rows: [sourceRow({ captured_at: '2099-01-01T00:00:00Z' })],
  });
  const playerRevision = await gameweekIntelligenceSourceHash({
    ...base,
    rows: [sourceRow({ ownership: 4.3 })],
  });
  const historyRevision = await gameweekIntelligenceSourceHash({
    ...base,
    historyRows: [sourceRow({ gw: 0, total_points: 3 })],
  });
  const scoreRevision = await gameweekIntelligenceSourceHash({
    ...base,
    fixtures: [fixture({ team_h_score: 3 })],
  });
  assert.equal(hash, reorderedMetadata);
  assert.notEqual(hash, playerRevision);
  assert.notEqual(hash, historyRevision);
  assert.notEqual(hash, scoreRevision);
});

test('frontend and Worker share the same versioned position scoring', async () => {
  const core = await readFile(new URL('../app-core.js', import.meta.url), 'utf8');
  assert.match(core, new RegExp(`FPL_SCORING_POLICY_VERSION='${FPL_SCORING_POLICY.version}'`));
  assert.match(core, /GOALPTS=\{GK:10,DEF:6,MID:5,FWD:4\}/);
  assert.match(core, /scoringPolicy:FPL_SCORING_POLICY_VERSION/);
});

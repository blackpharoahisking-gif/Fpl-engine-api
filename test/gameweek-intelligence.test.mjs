import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GAMEWEEK_INTELLIGENCE_VERSION,
  buildGameweekIntelligence,
  normalizeGameweekStats,
} from '../src/gameweek-intelligence.js';

const bootstrap = {
  teams: [
    { id: 1, short_name: 'AAA' },
    { id: 2, short_name: 'BBB' },
    { id: 3, short_name: 'CCC' },
  ],
  elements: [
    { id: 1, web_name: 'Gem', team: 1, element_type: 3, now_cost: 55, selected_by_percent: '4.2', status: 'a' },
    { id: 2, web_name: 'Process', team: 1, element_type: 4, now_cost: 70, selected_by_percent: '8.0', status: 'a' },
    { id: 3, web_name: 'Haul', team: 2, element_type: 3, now_cost: 80, selected_by_percent: '25.0', status: 'a' },
    { id: 4, web_name: 'Faller', team: 2, element_type: 2, now_cost: 50, selected_by_percent: '6.0', status: 'a' },
    { id: 5, web_name: 'Blank', team: 3, element_type: 3, now_cost: 50, selected_by_percent: '2.0', status: 'a' },
  ],
};

function liveRow(id, overrides = {}) {
  return {
    id,
    stats: {
      total_points: 0, minutes: 90, starts: 1, goals_scored: 0, assists: 0,
      clean_sheets: 0, goals_conceded: 0, own_goals: 0, penalties_saved: 0,
      penalties_missed: 0, yellow_cards: 0, red_cards: 0, saves: 0, bonus: 0,
      bps: 10, influence: '10.0', creativity: '10.0', threat: '10.0', ict_index: '3.0',
      clearances_blocks_interceptions: 0, recoveries: 2, tackles: 1,
      defensive_contribution: 3, expected_goals: '0.00', expected_assists: '0.00',
      expected_goal_involvements: '0.00', expected_goals_conceded: '1.00',
      in_dreamteam: false,
      ...overrides,
    },
  };
}

test('normalizer joins official identity and keeps the full decision-stat row', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 2, bootstrap,
    live: { elements: [liveRow(1, { total_points: 9, expected_goals: '0.61', defensive_contribution: 12 })] },
    capturedAt: '2026-08-31T00:00:00.000Z',
  });
  assert.equal(rows.length, 1);
  assert.deepEqual(
    [rows[0].player_id, rows[0].web_name, rows[0].team_code, rows[0].position, rows[0].price],
    [1, 'Gem', 'AAA', 3, 55],
  );
  assert.equal(rows[0].expected_goals, 0.61);
  assert.equal(rows[0].defensive_contribution, 12);
  assert.equal(rows[0].captured_at, '2026-08-31T00:00:00.000Z');
});

test('review separates low-owned, underlying, role and noisy-haul signals', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 2, bootstrap,
    live: { elements: [
      liveRow(1, { total_points: 9, goals_scored: 1, expected_goals: '0.70', expected_goal_involvements: '0.75', threat: '62.0' }),
      liveRow(2, { total_points: 2, expected_goals: '0.58', expected_goal_involvements: '0.64', threat: '71.0' }),
      liveRow(3, { total_points: 12, goals_scored: 2, expected_goals: '0.05', expected_goal_involvements: '0.05', bonus: 0 }),
      liveRow(4, { total_points: 1, minutes: 20, starts: 0 }),
    ] },
    capturedAt: '2026-08-31T00:00:00.000Z',
  });
  const historyRows = rows.map((row) => ({
    ...row, gw: 1, total_points: 1, minutes: row.player_id === 1 ? 20 : 90,
    starts: row.player_id === 1 ? 0 : 1, expected_goal_involvements: .1,
  }));
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 2, generatedAt: '2026-08-31T00:00:00.000Z',
    rows, historyRows,
    teams: bootstrap.teams,
    fixtures: [{ event: 2, team_h: 1, team_a: 2, team_h_score: 2, team_a_score: 1 }],
  });
  assert.equal(report.version, GAMEWEEK_INTELLIGENCE_VERSION);
  assert.equal(report.status, 'ready');
  assert.equal(report.sections.hiddenGems[0].name, 'Gem');
  assert.equal(report.sections.underlyingWatch[0].name, 'Process');
  assert.ok(report.sections.roleRisers.some((row) => row.name === 'Gem'));
  assert.ok(report.sections.roleFallers.some((row) => row.name === 'Faller'));
  assert.ok(report.sections.haulCautions.some((row) => row.name === 'Haul'));
  assert.equal(report.teamTrends.find((row) => row.team === 'AAA').goalsFor, 2);
  assert.match(report.sections.hiddenGems[0].why, /4\.2% owned/);
  assert.equal(report.sections.hiddenGems[0].evidence.priorGameweeks, 1);
});

test('first-gameweek reviews declare their limited sample instead of overstating certainty', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 1, bootstrap,
    live: { elements: [liveRow(1, { total_points: 8, expected_goal_involvements: '.50' })] },
    capturedAt: '2026-08-24T00:00:00.000Z',
  });
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 1, generatedAt: '2026-08-24T00:00:00.000Z',
    rows, historyRows: [], teams: bootstrap.teams, fixtures: [],
  });
  assert.equal(report.confidence, 'LOW');
  assert.equal(report.sample.priorGameweeks, 0);
  assert.equal(report.sections.hiddenGems[0].confidence, 'LOW');
  assert.equal(report.sections.roleRisers.length, 0);
  assert.match(report.methodology.warning, /not automatic transfer instructions/i);
});

test('blank clubs do not distort league attack baselines or create false role-loss flags', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 2, bootstrap,
    live: { elements: [
      liveRow(1, { expected_goals: '1.00', expected_goal_involvements: '1.00' }),
      liveRow(3, { expected_goals: '1.00', expected_goal_involvements: '1.00' }),
      liveRow(5, { minutes: 0, starts: 0 }),
    ] },
    capturedAt: '2026-08-31T00:00:00.000Z',
  });
  const blankHistory = [{ ...rows.find((row) => row.player_id === 5), gw: 1, minutes: 90, starts: 1 }];
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 2, generatedAt: '2026-08-31T00:00:00.000Z', rows,
    historyRows: blankHistory, teams: bootstrap.teams,
    fixtures: [{ event: 2, team_h: 1, team_a: 2, team_h_score: 1, team_a_score: 1 }],
  });
  assert.equal(report.teamTrends.find((row) => row.team === 'AAA').attackDirection, 'STEADY');
  assert.equal(report.teamTrends.find((row) => row.team === 'CCC').attackDirection, 'BLANK');
  assert.ok(!report.sections.roleFallers.some((row) => row.name === 'Blank'));
});

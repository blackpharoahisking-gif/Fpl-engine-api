import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GAMEWEEK_INTELLIGENCE_VERSION,
  buildGameweekIntelligence,
  normalizeGameweekStats,
} from '../src/gameweek-intelligence.js';
import {
  FPL_SCORING_POLICY,
  repeatableProcessBreakdown,
} from '../src/fpl-scoring.js';

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
  assert.equal(report.evidenceLabel, 'FIRST_WEEK');
  assert.equal(report.sample.priorGameweeks, 0);
  assert.equal(report.sections.hiddenGems[0].evidenceLabel, 'FIRST_WEEK');
  assert.deepEqual(report.sections.hiddenGems[0].persistence, {
    status: 'NEW',
    signalGameweeks: 1,
    sampleGameweeks: 1,
    priorSignalGameweeks: 0,
    recentPriorSignalGameweeks: 0,
    rollingXGI: .5,
    rollingMinutes: 90,
    rollingStarts: 1,
    windowGameweeks: [1],
  });
  assert.equal(report.sections.roleRisers.length, 0);
  assert.equal(report.final, false);
  assert.equal(report.dataChecked, false);
  assert.equal(report.methodology.scoringPolicy.version, FPL_SCORING_POLICY.version);
  assert.match(report.methodology.warning, /not automatic transfer instructions/i);
});

test('visible low-owned cards balance persistent evidence with the strongest new signals', () => {
  const elements = Array.from({ length: 7 }, (_, index) => ({
    id: 101 + index,
    web_name: `Signal ${index + 1}`,
    team: 1,
    element_type: 3,
    now_cost: 50,
    selected_by_percent: String(2 + index),
    status: 'a',
  }));
  const signalBootstrap = { teams: bootstrap.teams, elements };
  const xgi = [1.05, .95, .85, .75, .65, .55, .45];
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 2, bootstrap: signalBootstrap,
    live: { elements: elements.map((player, index) => liveRow(player.id, {
      total_points: 6,
      expected_goal_involvements: String(xgi[index]),
    })) },
    capturedAt: '2026-08-31T00:00:00.000Z',
  });
  const priorPersistent = {
    ...rows.find((row) => row.player_id === 107),
    gw: 1,
    expected_goal_involvements: .60,
  };
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 2, generatedAt: '2026-08-31T00:00:00.000Z',
    rows, historyRows: [priorPersistent], teams: bootstrap.teams,
  });
  const visible = report.sections.hiddenGems.slice(0, 6);
  assert.deepEqual(visible.map((row) => row.name), [
    'Signal 1', 'Signal 2', 'Signal 3', 'Signal 4', 'Signal 5', 'Signal 7',
  ]);
  assert.equal(visible[0].persistence.status, 'NEW');
  assert.equal(visible.at(-1).persistence.status, 'REPEATED');
  assert.equal(visible.at(-1).persistence.signalGameweeks, 2);
  assert.ok(!visible.some((row) => row.name === 'Signal 6'));
  assert.match(report.methodology.hiddenGemRanking, /No composite score/);
});

test('GW1 low-owned golden order is unchanged when every signal is new', () => {
  const snapshot = [
    ['De Cuyper', 2, 17, 77, 1.68, 5.5],
    ['Hinshelwood', 3, 16, 63, 1.43, 1.7],
    ['Wissa', 4, 4, 90, 1.02, 2.6],
    ['Lewis-Potter', 3, 10, 90, .89, .8],
    ['Emersonn', 4, 9, 65, .88, 1.2],
    ['Gonzalo', 4, 6, 90, .74, 2.8],
    ['Saka', 3, 5, 90, .72, 8.0],
  ];
  const snapshotBootstrap = {
    teams: bootstrap.teams,
    elements: snapshot.map(([name, position, , , , ownership], index) => ({
      id: 201 + index, web_name: name, team: 1, element_type: position,
      now_cost: 50, selected_by_percent: String(ownership), status: 'a',
    })),
  };
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 1, bootstrap: snapshotBootstrap,
    live: { elements: snapshot.map(([, , points, minutes, xgi], index) => liveRow(201 + index, {
      total_points: points, minutes, expected_goal_involvements: String(xgi),
    })) },
    capturedAt: '2026-08-24T00:00:00.000Z',
  });
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 1, generatedAt: '2026-08-24T00:00:00.000Z',
    rows, teams: bootstrap.teams,
  });
  assert.deepEqual(report.sections.hiddenGems.slice(0, 6).map((row) => row.name), [
    'De Cuyper', 'Hinshelwood', 'Wissa', 'Lewis-Potter', 'Emersonn', 'Gonzalo',
  ]);
  assert.ok(report.sections.hiddenGems.every((row) => row.persistence.status === 'NEW'));
});

test('three qualifying weeks become established and expose rolling five-GW evidence', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 5, bootstrap,
    live: { elements: [liveRow(1, {
      total_points: 6,
      expected_goal_involvements: '.55',
    })] },
    capturedAt: '2026-09-21T00:00:00.000Z',
  });
  const current = rows[0];
  const historyRows = [
    { ...current, gw: 4, minutes: 80, starts: 1, expected_goal_involvements: .50 },
    { ...current, gw: 3, minutes: 90, starts: 1, expected_goal_involvements: .10 },
    { ...current, gw: 2, minutes: 70, starts: 1, expected_goal_involvements: .46 },
    { ...current, gw: 1, minutes: 20, starts: 0, expected_goal_involvements: .20 },
  ];
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 5, generatedAt: '2026-09-21T00:00:00.000Z',
    rows, historyRows, teams: bootstrap.teams,
  });
  const persistence = report.sections.hiddenGems[0].persistence;
  assert.deepEqual(persistence, {
    status: 'ESTABLISHED',
    signalGameweeks: 3,
    sampleGameweeks: 5,
    priorSignalGameweeks: 2,
    recentPriorSignalGameweeks: 1,
    rollingXGI: 1.81,
    rollingMinutes: 350,
    rollingStarts: 4,
    windowGameweeks: [5, 4, 3, 2, 1],
  });
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
  assert.equal(report.teamTrends.find((row) => row.team === 'AAA').attackDirection, 'INSUFFICIENT');
  assert.equal(report.teamTrends.find((row) => row.team === 'AAA').attackLevel, 'AVERAGE');
  assert.equal(report.teamTrends.find((row) => row.team === 'CCC').attackDirection, 'BLANK');
  assert.ok(!report.sections.roleFallers.some((row) => row.name === 'Blank'));
});

test('the versioned 2026/27 scoring table gives process credit by position and excludes bonus', () => {
  assert.equal(FPL_SCORING_POLICY.goal[1], 10);
  assert.equal(FPL_SCORING_POLICY.goal[2], 6);
  assert.equal(FPL_SCORING_POLICY.goal[3], 5);
  assert.equal(FPL_SCORING_POLICY.goal[4], 4);
  const goalkeeper = repeatableProcessBreakdown({
    position: 1, minutes: 90, starts: 1, expected_goals: .2, expected_assists: .1,
    clean_sheets: 1, saves: 7, defensive_contribution: 30, bonus: 3,
  });
  assert.equal(goalkeeper.appearance, 2);
  assert.equal(goalkeeper.expectedAttack, 2.3);
  assert.equal(goalkeeper.cleanSheet, 4);
  assert.equal(goalkeeper.saves, 2);
  assert.equal(goalkeeper.defensiveContribution, 0);
  assert.equal(goalkeeper.repeatable, 10.3);
  assert.equal(goalkeeper.bonusExcluded, 3);

  const midfielder = repeatableProcessBreakdown({
    position: 3, minutes: 90, starts: 1, expected_goals: .2, expected_assists: .1,
    clean_sheets: 1, saves: 0, defensive_contribution: 12, bonus: 2,
  });
  assert.equal(midfielder.expectedAttack, 1.3);
  assert.equal(midfielder.cleanSheet, 1);
  assert.equal(midfielder.defensiveContribution, 2);
  assert.equal(midfielder.repeatable, 6.3);
});

test('haul cautions expose their rule-aware baseline and do not use actual bonus as process', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 1, bootstrap,
    live: { elements: [liveRow(3, {
      total_points: 13, expected_goals: '.10', expected_assists: '.05',
      expected_goal_involvements: '.15', defensive_contribution: 16, bonus: 3,
    })] },
    capturedAt: '2026-08-24T00:00:00.000Z',
  });
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 1, generatedAt: '2026-08-24T00:00:00.000Z',
    rows, teams: bootstrap.teams,
  });
  const caution = report.sections.haulCautions[0];
  assert.equal(caution.name, 'Haul');
  assert.equal(caution.processBreakdown.scoringVersion, FPL_SCORING_POLICY.version);
  assert.equal(caution.processBreakdown.appearance, 2);
  assert.equal(caution.processBreakdown.expectedAttack, .65);
  assert.equal(caution.processBreakdown.defensiveContribution, 2);
  assert.equal(caution.processBreakdown.bonusExcluded, 3);
  assert.equal(caution.processBaseline, 4.65);
  assert.equal(caution.outcomeGap, 8.35);
  assert.match(caution.why, /Actual bonus is excluded/);
});

test('missing fixture scores remain unknown rather than becoming goals conceded or clean sheets', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 2, bootstrap,
    live: { elements: [liveRow(1), liveRow(3)] },
    capturedAt: '2026-08-31T00:00:00.000Z',
  });
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 2, generatedAt: '2026-08-31T00:00:00.000Z', rows,
    teams: bootstrap.teams,
    fixtures: [{ event: 2, team_h: 1, team_a: 2, team_h_score: null, team_a_score: null }],
  });
  for (const team of ['AAA', 'BBB']) {
    const trend = report.teamTrends.find((row) => row.team === team);
    assert.equal(trend.scoreComplete, false);
    assert.equal(trend.goalsFor, null);
    assert.equal(trend.goalsAgainst, null);
    assert.equal(trend.cleanSheets, null);
  }
});

test('team directions need two prior Gameweeks and are distinct from current levels', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 3, bootstrap,
    live: { elements: [liveRow(1, { starts: 1, expected_goals: '1.00' })] },
    capturedAt: '2026-09-07T00:00:00.000Z',
  });
  const priorBase = { ...rows[0], starts: 11, expected_goals: .10 };
  const historyRows = [{ ...priorBase, gw: 1 }, { ...priorBase, gw: 2 }];
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 3, generatedAt: '2026-09-07T00:00:00.000Z', rows,
    historyRows, teams: bootstrap.teams,
    fixtures: [{ event: 3, team_h: 1, team_a: 2, team_h_score: 1, team_a_score: 0 }],
  });
  const team = report.teamTrends.find((row) => row.team === 'AAA');
  assert.equal(team.priorGameweeks, 2);
  assert.equal(team.attackDirection, 'UP');
  assert.equal(team.attackDelta, .9);
  assert.notEqual(team.attackLevel, 'UP');
});

test('missing prior capture never masquerades as a role gain', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 2, bootstrap,
    live: { elements: [liveRow(1, { starts: 1, minutes: 90, expected_goal_involvements: '.70' })] },
    capturedAt: '2026-08-31T00:00:00.000Z',
  });
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 2, generatedAt: '2026-08-31T00:00:00.000Z', rows,
    historyRows: [], teams: bootstrap.teams,
    fixtures: [{ event: 2, team_h: 1, team_a: 2, team_h_score: 1, team_a_score: 0 }],
  });
  assert.equal(report.sections.roleRisers.length, 0);
});

test('role changes require a same-club baseline', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 2, bootstrap,
    live: { elements: [
      liveRow(1, { starts: 1, minutes: 90, expected_goal_involvements: '.70' }),
      liveRow(4, { starts: 0, minutes: 0 }),
    ] },
    capturedAt: '2026-08-31T00:00:00.000Z',
  });
  const historyRows = [
    { ...rows.find((row) => row.player_id === 1), gw: 1, team_code: 'BBB', starts: 0, minutes: 0 },
    { ...rows.find((row) => row.player_id === 4), gw: 1, team_code: 'AAA', starts: 1, minutes: 90 },
  ];
  const report = buildGameweekIntelligence({
    season: '2026/27', gw: 2, generatedAt: '2026-08-31T00:00:00.000Z', rows,
    historyRows, teams: bootstrap.teams,
    fixtures: [{ event: 2, team_h: 1, team_a: 2, team_h_score: 1, team_a_score: 0 }],
  });
  assert.equal(report.sections.roleRisers.length, 0);
  assert.equal(report.sections.roleFallers.length, 0);
  assert.match(report.methodology.roleContinuity, /same club/i);
});

test('report finality is supplied by the completion gate rather than hardcoded', () => {
  const rows = normalizeGameweekStats({
    season: '2026/27', gw: 1, bootstrap, live: { elements: [liveRow(1)] },
    capturedAt: '2026-08-24T00:00:00.000Z',
  });
  const pending = buildGameweekIntelligence({
    season: '2026/27', gw: 1, generatedAt: '2026-08-24T00:00:00.000Z', rows,
  });
  const graceFinal = buildGameweekIntelligence({
    season: '2026/27', gw: 1, generatedAt: '2026-08-24T00:00:00.000Z', rows,
    finality: { complete: true, officialDataChecked: false },
  });
  assert.equal(pending.final, false);
  assert.equal(graceFinal.final, true);
  assert.equal(graceFinal.dataChecked, false);
});

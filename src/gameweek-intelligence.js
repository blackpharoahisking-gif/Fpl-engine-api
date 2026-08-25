/**
 * Deterministic post-Gameweek intelligence.
 *
 * This module deliberately contains no network or database I/O. The Worker
 * supplies verified bootstrap, fixture and event-live payloads; the pure
 * functions below turn them into auditable rows and a compact review.
 */

import {
  defensiveContributionProcessPoints,
  FPL_SCORING_POLICY,
  repeatableProcessBreakdown,
} from './fpl-scoring.js';

export const GAMEWEEK_INTELLIGENCE_VERSION = 'gw-intelligence-v4-persistence';

const POSITION = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
const number = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const round = (value, digits = 2) => Number(number(value).toFixed(digits));
const median = (values) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const average = (values) => values.length ? values.reduce((sum, value) => sum + number(value), 0) / values.length : 0;
const sum = (rows, key) => rows.reduce((total, row) => total + number(row[key]), 0);

function evidenceLabel(priorGameweeks) {
  if (priorGameweeks >= 3) return 'MULTI_WEEK';
  if (priorGameweeks >= 1) return 'EARLY_SAMPLE';
  return 'FIRST_WEEK';
}

function compactPlayer(row, extra = {}) {
  return {
    playerId: row.player_id,
    name: row.web_name,
    team: row.team_code,
    position: POSITION[row.position] || '—',
    price: round(row.price / 10, 1),
    ownership: round(row.ownership, 1),
    points: round(row.total_points, 1),
    minutes: round(row.minutes, 0),
    starts: round(row.starts, 0),
    xG: round(row.expected_goals, 2),
    xA: round(row.expected_assists, 2),
    xGI: round(row.expected_goal_involvements, 2),
    bonus: round(row.bonus, 0),
    defensiveContribution: round(row.defensive_contribution, 0),
    ...extra,
  };
}

export function normalizeGameweekStats({ season, gw, bootstrap, live, capturedAt }) {
  const players = new Map((bootstrap?.elements || []).map((player) => [number(player.id), player]));
  const teams = new Map((bootstrap?.teams || []).map((team) => [number(team.id), team.short_name]));
  const rows = [];
  for (const item of live?.elements || []) {
    const player = players.get(number(item?.id));
    if (!player || !teams.has(number(player.team))) continue;
    const stats = item?.stats || {};
    rows.push({
      season,
      gw: number(gw),
      player_id: number(item.id),
      web_name: String(player.web_name || ''),
      team_code: teams.get(number(player.team)),
      position: number(player.element_type),
      price: number(player.now_cost),
      ownership: number(player.selected_by_percent),
      status: String(player.status || 'a'),
      total_points: number(stats.total_points),
      minutes: number(stats.minutes),
      starts: number(stats.starts),
      goals_scored: number(stats.goals_scored),
      assists: number(stats.assists),
      clean_sheets: number(stats.clean_sheets),
      goals_conceded: number(stats.goals_conceded),
      own_goals: number(stats.own_goals),
      penalties_saved: number(stats.penalties_saved),
      penalties_missed: number(stats.penalties_missed),
      yellow_cards: number(stats.yellow_cards),
      red_cards: number(stats.red_cards),
      saves: number(stats.saves),
      bonus: number(stats.bonus),
      bps: number(stats.bps),
      influence: number(stats.influence),
      creativity: number(stats.creativity),
      threat: number(stats.threat),
      ict_index: number(stats.ict_index),
      clearances_blocks_interceptions: number(stats.clearances_blocks_interceptions),
      recoveries: number(stats.recoveries),
      tackles: number(stats.tackles),
      defensive_contribution: number(stats.defensive_contribution ?? stats.defensive_contributions),
      expected_goals: number(stats.expected_goals),
      expected_assists: number(stats.expected_assists),
      expected_goal_involvements: number(stats.expected_goal_involvements),
      expected_goals_conceded: number(stats.expected_goals_conceded),
      in_dreamteam: stats.in_dreamteam ? 1 : 0,
      captured_at: capturedAt,
    });
  }
  return rows.sort((a, b) => a.player_id - b.player_id);
}

function historyByPlayer(historyRows, gw) {
  const activeTeamWeeks = new Set((historyRows || [])
    .filter((row) => number(row.minutes) > 0)
    .map((row) => `${number(row.gw)}:${row.team_code}`));
  const grouped = new Map();
  for (const row of historyRows || []) {
    if (number(row.gw) >= number(gw)) continue;
    if (!activeTeamWeeks.has(`${number(row.gw)}:${row.team_code}`)) continue;
    if (!grouped.has(number(row.player_id))) grouped.set(number(row.player_id), []);
    grouped.get(number(row.player_id)).push(row);
  }
  for (const rows of grouped.values()) rows.sort((a, b) => number(b.gw) - number(a.gw));
  return grouped;
}

function playerHistoryEvidence(rows) {
  const recent = (rows || []).slice(0, 4);
  return {
    gameweeks: recent.length,
    appearances: recent.filter((row) => number(row.minutes) > 0).length,
    starts: sum(recent, 'starts'),
    minutes: sum(recent, 'minutes'),
    avgMinutes: average(recent.map((row) => number(row.minutes))),
    startRate: recent.length ? sum(recent, 'starts') / recent.length : 0,
    xGI: sum(recent, 'expected_goal_involvements'),
    points: sum(recent, 'total_points'),
  };
}

function isLowOwnedEmergingSignal(row) {
  return number(row?.minutes) >= 60
    && number(row?.ownership, 100) <= 12
    && (
      number(row?.expected_goal_involvements) >= .45
      || defensiveContributionProcessPoints(row) > 0
      || (number(row?.position) === 1 && number(row?.saves) >= 4)
    );
}

function lowOwnedSignalPersistence(row, historyRows) {
  const prior = (historyRows || []).slice(0, 4);
  const sample = [row, ...prior];
  const priorTwo = prior.slice(0, 2);
  const signalGameweeks = sample.filter(isLowOwnedEmergingSignal).length;
  const recentPriorSignalGameweeks = priorTwo.filter(isLowOwnedEmergingSignal).length;
  const status = signalGameweeks >= 3 && recentPriorSignalGameweeks >= 1
    ? 'ESTABLISHED'
    : recentPriorSignalGameweeks >= 1 ? 'REPEATED' : 'NEW';
  return {
    status,
    signalGameweeks,
    sampleGameweeks: sample.length,
    priorSignalGameweeks: prior.filter(isLowOwnedEmergingSignal).length,
    recentPriorSignalGameweeks,
    rollingXGI: round(sum(sample, 'expected_goal_involvements'), 2),
    rollingMinutes: round(sum(sample, 'minutes'), 0),
    rollingStarts: round(sum(sample, 'starts'), 0),
    windowGameweeks: sample.map((sampleRow) => number(sampleRow.gw)).filter((sampleGw) => sampleGw > 0),
  };
}

function balanceLowOwnedSignals(ranked, visibleLimit = 6, totalLimit = 10) {
  const rankedRows = ranked.map((candidate, rank) => ({ ...candidate, currentRank: rank }));
  const persistent = rankedRows.filter((candidate) => candidate.persistence.status !== 'NEW').slice(0, 3);
  const fresh = rankedRows.filter((candidate) => candidate.persistence.status === 'NEW').slice(0, 3);
  const visible = [...persistent, ...fresh];
  const chosen = new Set(visible.map((candidate) => candidate.row.player_id));
  for (const candidate of rankedRows) {
    if (visible.length >= visibleLimit) break;
    if (chosen.has(candidate.row.player_id)) continue;
    visible.push(candidate);
    chosen.add(candidate.row.player_id);
  }
  visible.sort((a, b) => a.currentRank - b.currentRank);
  const remainder = rankedRows.filter((candidate) => !chosen.has(candidate.row.player_id));
  return [...visible, ...remainder].slice(0, totalLimit);
}

function fixtureScoreByTeam(fixtures, gw, teamIdByCode) {
  const result = new Map();
  const add = (code, goalsFor, goalsAgainst) => {
    if (!result.has(code)) result.set(code, {
      fixtures: 0,
      scoredFixtures: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      cleanSheets: 0,
    });
    const row = result.get(code);
    row.fixtures += 1;
    const parsedFor = goalsFor === null || goalsFor === undefined || goalsFor === '' ? null : Number(goalsFor);
    const parsedAgainst = goalsAgainst === null || goalsAgainst === undefined || goalsAgainst === '' ? null : Number(goalsAgainst);
    if (!Number.isFinite(parsedFor) || !Number.isFinite(parsedAgainst)) return;
    row.scoredFixtures += 1;
    row.goalsFor += parsedFor;
    row.goalsAgainst += parsedAgainst;
    if (parsedAgainst === 0) row.cleanSheets += 1;
  };
  const codeById = new Map([...teamIdByCode.entries()].map(([code, id]) => [id, code]));
  for (const fixture of fixtures || []) {
    if (number(fixture.event ?? fixture.event_id, -1) !== number(gw, -2)) continue;
    const home = fixture.home_code || codeById.get(number(fixture.team_h));
    const away = fixture.away_code || codeById.get(number(fixture.team_a));
    if (!home || !away) continue;
    add(home, fixture.team_h_score ?? fixture.home_score, fixture.team_a_score ?? fixture.away_score);
    add(away, fixture.team_a_score ?? fixture.away_score, fixture.team_h_score ?? fixture.home_score);
  }
  return result;
}

function teamMetrics(rows, scores) {
  const byTeam = new Map();
  for (const row of rows) {
    if (!byTeam.has(row.team_code)) byTeam.set(row.team_code, []);
    byTeam.get(row.team_code).push(row);
  }
  const out = new Map();
  for (const [team, players] of byTeam) {
    const representativeXgc = players
      .filter((player) => number(player.minutes) >= 60)
      .map((player) => number(player.expected_goals_conceded));
    const result = scores?.get(team) || {};
    const inferredFixtures = Math.max(0, Math.round(sum(players, 'starts') / 11));
    const fixtureCount = result.fixtures === undefined ? inferredFixtures : number(result.fixtures);
    const scoreComplete = number(result.fixtures) > 0
      && number(result.scoredFixtures) === number(result.fixtures);
    out.set(team, {
      team,
      fixtures: fixtureCount,
      scoredFixtures: number(result.scoredFixtures),
      scoreComplete,
      goalsFor: scoreComplete ? number(result.goalsFor) : null,
      goalsAgainst: scoreComplete ? number(result.goalsAgainst) : null,
      cleanSheets: scoreComplete ? number(result.cleanSheets) : null,
      xG: sum(players, 'expected_goals'),
      xA: sum(players, 'expected_assists'),
      xGI: sum(players, 'expected_goal_involvements'),
      xGC: median(representativeXgc),
      points: sum(players, 'total_points'),
    });
  }
  return out;
}

function priorTeamMetrics(historyRows, gw) {
  const byGw = new Map();
  for (const row of historyRows || []) {
    const rowGw = number(row.gw);
    if (rowGw >= number(gw) || rowGw < number(gw) - 4) continue;
    if (!byGw.has(rowGw)) byGw.set(rowGw, []);
    byGw.get(rowGw).push(row);
  }
  const byTeam = new Map();
  for (const rows of byGw.values()) {
    const metrics = teamMetrics(rows, new Map());
    for (const [team, metric] of metrics) {
      if (metric.fixtures <= 0) continue;
      if (!byTeam.has(team)) byTeam.set(team, []);
      byTeam.get(team).push(metric);
    }
  }
  return byTeam;
}

function teamReview(current, prior) {
  const active = [...current.values()].filter((row) => row.fixtures > 0);
  const leagueXg = average(active.map((row) => row.xG / row.fixtures));
  const leagueXgc = average(active.map((row) => row.xGC / row.fixtures));
  const rows = [];
  for (const metric of current.values()) {
    const history = prior.get(metric.team) || [];
    if (metric.fixtures <= 0) {
      rows.push({
        team: metric.team, fixtures: 0, scoredFixtures: 0, scoreComplete: false,
        goalsFor: null, goalsAgainst: null, cleanSheets: null,
        xG: 0, xGC: 0, attackLevel: 'BLANK', defenseLevel: 'BLANK',
        attackDirection: 'BLANK', defenseDirection: 'BLANK',
        attackDelta: null, defenseDelta: null, priorGameweeks: history.length,
        evidenceLabel: evidenceLabel(history.length),
      });
      continue;
    }
    const priorXg = average(history.map((row) => row.xG / Math.max(1, row.fixtures)));
    const priorXgc = average(history.map((row) => row.xGC / Math.max(1, row.fixtures)));
    const xgPerFixture = metric.xG / Math.max(1, metric.fixtures);
    const xgcPerFixture = metric.xGC / Math.max(1, metric.fixtures);
    const trendReady = history.length >= 2;
    const attackDelta = trendReady ? xgPerFixture - priorXg : null;
    const defenseDelta = trendReady ? priorXgc - xgcPerFixture : null;
    const attackLevel = xgPerFixture >= leagueXg + .25
      ? 'ABOVE'
      : xgPerFixture <= leagueXg - .25 ? 'BELOW' : 'AVERAGE';
    const defenseLevel = xgcPerFixture <= leagueXgc - .25
      ? 'STRONG'
      : xgcPerFixture >= leagueXgc + .25 ? 'WEAK' : 'AVERAGE';
    const attackDirection = !trendReady
      ? 'INSUFFICIENT'
      : attackDelta >= .30 ? 'UP' : attackDelta <= -.30 ? 'DOWN' : 'STEADY';
    const defenseDirection = !trendReady
      ? 'INSUFFICIENT'
      : defenseDelta >= .30 ? 'UP' : defenseDelta <= -.30 ? 'DOWN' : 'STEADY';
    rows.push({
      team: metric.team,
      fixtures: metric.fixtures,
      scoredFixtures: metric.scoredFixtures,
      scoreComplete: metric.scoreComplete,
      goalsFor: metric.goalsFor,
      goalsAgainst: metric.goalsAgainst,
      cleanSheets: metric.cleanSheets,
      xG: round(xgPerFixture, 2),
      xGC: round(xgcPerFixture, 2),
      attackLevel,
      defenseLevel,
      attackDirection,
      defenseDirection,
      attackDelta: trendReady ? round(attackDelta, 2) : null,
      defenseDelta: trendReady ? round(defenseDelta, 2) : null,
      priorGameweeks: history.length,
      evidenceLabel: evidenceLabel(history.length),
    });
  }
  return rows.sort((a, b) => b.xG - a.xG || a.xGC - b.xGC || a.team.localeCompare(b.team));
}

function signalLists(rows, history, currentTeams) {
  const evidence = (row) => playerHistoryEvidence(history.get(row.player_id));
  const decorate = (row, why, signal, extra = {}) => {
    const prior = evidence(row);
    return compactPlayer(row, {
      signal,
      why,
      evidenceLabel: evidenceLabel(prior.gameweeks),
      evidence: {
        currentGameweek: 1,
        priorGameweeks: prior.gameweeks,
        priorAppearances: prior.appearances,
        sampleMinutes: round(prior.minutes + row.minutes, 0),
      },
      ...extra,
    });
  };

  const topPerformers = [...rows]
    .filter((row) => row.minutes > 0)
    .sort((a, b) => b.total_points - a.total_points || b.expected_goal_involvements - a.expected_goal_involvements)
    .slice(0, 10)
    .map((row) => decorate(row, `${row.total_points} points from ${row.minutes} minutes; ${round(row.expected_goal_involvements, 2)} xGI.`, 'GAMEWEEK_HAUL'));

  const hiddenGemCandidates = rows
    .filter(isLowOwnedEmergingSignal)
    .map((row) => {
      const prior = evidence(row);
      return {
        row,
        prior,
        defensivePoints: defensiveContributionProcessPoints(row),
        persistence: lowOwnedSignalPersistence(row, history.get(row.player_id)),
      };
    })
    .sort((a, b) => b.row.expected_goal_involvements - a.row.expected_goal_involvements
      || b.defensivePoints - a.defensivePoints
      || b.row.saves - a.row.saves
      || b.row.total_points - a.row.total_points
      || a.row.ownership - b.row.ownership
      || a.row.player_id - b.row.player_id);

  const hiddenGems = balanceLowOwnedSignals(hiddenGemCandidates)
    .map(({ row, prior, defensivePoints, persistence }) => decorate(
      row,
      `${round(row.ownership, 1)}% owned, ${round(row.expected_goal_involvements, 2)} xGI, ${defensivePoints} DC points and ${row.minutes} minutes${prior.gameweeks ? `; ${round(prior.xGI, 2)} xGI across the prior ${prior.gameweeks} GW` : '; first-week evidence only'}. Current-week strength is ranked by xGI, then DC points, saves, Gameweek points and lower ownership.`,
      'LOW_OWNED_EMERGING',
      {
        rankRule: 'BALANCED_PERSISTENCE_AND_NEW_THEN_XGI_DC_SAVES_POINTS_OWNERSHIP',
        persistence,
      },
    ));

  const underlyingWatch = rows
    .filter((row) => row.minutes >= 60 && row.total_points <= 5 && (row.expected_goal_involvements >= .45 || row.threat >= 45 || row.creativity >= 35))
    .sort((a, b) => b.expected_goal_involvements - a.expected_goal_involvements || b.threat - a.threat)
    .slice(0, 10)
    .map((row) => decorate(row, `Only ${row.total_points} points, but ${round(row.expected_goal_involvements, 2)} xGI with threat ${round(row.threat, 0)} and creativity ${round(row.creativity, 0)}.`, 'PROCESS_OVER_OUTCOME'));

  const roleRisers = rows
    .map((row) => ({ row, prior: evidence(row) }))
    .filter(({ row, prior }) => prior.gameweeks >= 1 && row.starts > 0 && row.minutes >= 60 && (prior.avgMinutes < 55 || prior.startRate < .6))
    .sort((a, b) => (b.row.minutes - b.prior.avgMinutes) - (a.row.minutes - a.prior.avgMinutes) || b.row.expected_goal_involvements - a.row.expected_goal_involvements)
    .slice(0, 10)
    .map(({ row, prior }) => decorate(row, `Started and played ${row.minutes} minutes after averaging ${round(prior.avgMinutes, 0)} minutes and a ${round(prior.startRate * 100, 0)}% start rate over the prior ${prior.gameweeks} GW.`, 'ROLE_GAIN'));

  const roleFallers = rows
    .map((row) => ({ row, prior: evidence(row) }))
    .filter(({ row, prior }) => currentTeams.get(row.team_code)?.fixtures > 0 && prior.gameweeks >= 1 && prior.avgMinutes >= 60 && prior.startRate >= .6 && row.starts === 0 && row.minutes < 45)
    .sort((a, b) => (b.prior.avgMinutes - b.row.minutes) - (a.prior.avgMinutes - a.row.minutes) || b.prior.startRate - a.prior.startRate)
    .slice(0, 10)
    .map(({ row, prior }) => decorate(row, `Did not start and played ${row.minutes} minutes after averaging ${round(prior.avgMinutes, 0)} minutes with a ${round(prior.startRate * 100, 0)}% start rate over the prior ${prior.gameweeks} GW. Check injury, suspension, rotation and tactical context before reacting.`, 'ROLE_LOSS'));

  const defensiveWatch = rows
    .filter((row) => row.position <= 2 && row.minutes >= 60 && row.total_points <= 5 && (row.defensive_contribution >= 10 || row.saves >= 4 || row.expected_goals_conceded <= .8))
    .sort((a, b) => b.defensive_contribution + b.saves * 2 - (a.defensive_contribution + a.saves * 2) || a.expected_goals_conceded - b.expected_goals_conceded)
    .slice(0, 10)
    .map((row) => decorate(row, `${row.total_points} points hid ${round(row.defensive_contribution, 0)} defensive contributions, ${round(row.saves, 0)} saves and ${round(row.expected_goals_conceded, 2)} xGC. Check role security and fixtures before the points arrive.`, 'DEFENSIVE_PROCESS'));

  const haulCautions = rows
    .filter((row) => row.total_points >= 8)
    .map((row) => {
      const process = repeatableProcessBreakdown(row);
      return { row, process, gap: row.total_points - process.repeatable };
    })
    .filter(({ row, gap }) => gap >= 3.5 || row.minutes < 60)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10)
    .map(({ row, process, gap }) => decorate(
      row,
      `${row.total_points} points versus a ${round(process.repeatable, 2)} process-credit baseline: ${round(process.appearance, 1)} appearance, ${round(process.expectedAttack, 2)} expected attack, ${round(process.cleanSheet, 1)} clean sheet, ${round(process.saves, 1)} saves and ${round(process.defensiveContribution, 1)} DC. Actual bonus is excluded; ${round(gap, 2)} points remain outcome-led.`,
      'HAUL_CAUTION',
      {
        processBaseline: round(process.repeatable, 2),
        outcomeGap: round(gap, 2),
        processBreakdown: Object.fromEntries(Object.entries(process).map(([key, value]) => [key, typeof value === 'number' ? round(value, 2) : value])),
      },
    ));

  return { topPerformers, hiddenGems, underlyingWatch, defensiveWatch, roleRisers, roleFallers, haulCautions };
}

export function buildGameweekIntelligence({
  season,
  gw,
  generatedAt,
  rows,
  historyRows = [],
  fixtures = [],
  teams = [],
  finality = null,
}) {
  const history = historyByPlayer(historyRows, gw);
  const teamIdByCode = new Map((teams || []).map((team) => [team.short_name, number(team.id)]));
  const scores = fixtureScoreByTeam(fixtures, gw, teamIdByCode);
  const currentTeams = teamMetrics(rows, scores);
  const priorTeams = priorTeamMetrics(historyRows, gw);
  const lists = signalLists(rows, history, currentTeams);
  const priorGameweeks = new Set((historyRows || []).filter((row) => number(row.gw) < number(gw)).map((row) => number(row.gw))).size;
  const appeared = rows.filter((row) => row.minutes > 0);
  const starters = rows.filter((row) => row.starts > 0);
  const totalGoals = sum(rows, 'goals_scored');
  const totalAssists = sum(rows, 'assists');
  const totalXg = sum(rows, 'expected_goals');
  const totalXa = sum(rows, 'expected_assists');
  const headline = lists.hiddenGems[0]
    ? `${lists.hiddenGems[0].name} leads the low-owned watchlist; separate repeatable role and underlying numbers from one-week points.`
    : 'Use the role, underlying and team-process sections to separate repeatable signals from one-week points.';
  return {
    status: 'ready',
    version: GAMEWEEK_INTELLIGENCE_VERSION,
    season,
    gw: number(gw),
    generatedAt,
    final: finality?.complete === true,
    dataChecked: finality?.officialDataChecked === true,
    evidenceLabel: evidenceLabel(priorGameweeks),
    sample: { currentGameweeks: 1, priorGameweeks, players: rows.length, appeared: appeared.length, starters: starters.length },
    headline,
    overview: {
      playerPoints: round(sum(rows, 'total_points'), 0),
      goals: round(totalGoals, 0),
      assists: round(totalAssists, 0),
      xG: round(totalXg, 2),
      xA: round(totalXa, 2),
      dreamTeamPlayers: rows.filter((row) => row.in_dreamteam).length,
    },
    methodology: {
      nature: 'deterministic',
      scope: 'Official, data-checked FPL event-live statistics plus up to four prior completed Gameweeks.',
      warning: 'Signals describe evidence to investigate for future planning; they are not automatic transfer instructions.',
      evidenceLabels: 'FIRST_WEEK, EARLY_SAMPLE and MULTI_WEEK describe sample volume only; they are not calibrated probabilities.',
      scoringPolicy: FPL_SCORING_POLICY,
      haulCaution: 'Appearance, position-specific expected goals, expected assists, all-position clean sheets, save points and defensive-contribution points receive process credit. Actual bonus is excluded.',
      hiddenGemPersistence: 'NEW has no qualifying hit in the prior two sampled Gameweeks. REPEATED has at least one. ESTABLISHED has at least three qualifying hits in the rolling five-Gameweek sample and at least one in the prior two. Club blanks are excluded from the sample.',
      hiddenGemRanking: 'Eligible low-owned players are ranked lexicographically by current-GW xGI, defensive-contribution points, saves, Gameweek points, then lower ownership. The visible six reserve up to three places for repeated or established signals and up to three for new signals, with unused places filled by current-GW rank. No composite score is used.',
    },
    sections: lists,
    teamTrends: teamReview(currentTeams, priorTeams),
  };
}

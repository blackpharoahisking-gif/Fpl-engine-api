/**
 * Deterministic post-Gameweek intelligence.
 *
 * This module deliberately contains no network or database I/O. The Worker
 * supplies verified bootstrap, fixture and event-live payloads; the pure
 * functions below turn them into auditable rows and a compact review.
 */

export const GAMEWEEK_INTELLIGENCE_VERSION = 'gw-intelligence-v1';

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

function confidenceLabel(priorGameweeks, minutes, evidenceStrength = 0) {
  if (priorGameweeks >= 3 && minutes >= 180 && evidenceStrength >= 1) return 'HIGH';
  if (priorGameweeks >= 1 && minutes >= 120 && evidenceStrength >= 1) return 'MEDIUM';
  if (priorGameweeks >= 2 || minutes >= 180) return 'MEDIUM';
  return 'LOW';
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

function fixtureScoreByTeam(fixtures, gw, teamIdByCode) {
  const result = new Map();
  const add = (code, goalsFor, goalsAgainst) => {
    if (!result.has(code)) result.set(code, { fixtures: 0, goalsFor: 0, goalsAgainst: 0, cleanSheets: 0 });
    const row = result.get(code);
    row.fixtures += 1;
    row.goalsFor += number(goalsFor);
    row.goalsAgainst += number(goalsAgainst);
    if (number(goalsAgainst) === 0) row.cleanSheets += 1;
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
    out.set(team, {
      team,
      fixtures: fixtureCount,
      goalsFor: number(result.goalsFor, sum(players, 'goals_scored')),
      goalsAgainst: number(result.goalsAgainst),
      cleanSheets: number(result.cleanSheets),
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
  const leagueXg = average([...current.values()].filter((row) => row.fixtures > 0).map((row) => row.xG / row.fixtures));
  const rows = [];
  for (const metric of current.values()) {
    const history = prior.get(metric.team) || [];
    if (metric.fixtures <= 0) {
      rows.push({
        team: metric.team, fixtures: 0, goalsFor: 0, goalsAgainst: 0, cleanSheets: 0,
        xG: 0, xGC: 0, attackDirection: 'BLANK', defenseDirection: 'BLANK',
        attackDelta: null, defenseDelta: null, priorGameweeks: history.length, confidence: 'LOW',
      });
      continue;
    }
    const priorXg = average(history.map((row) => row.xG / Math.max(1, row.fixtures)));
    const priorXgc = average(history.map((row) => row.xGC / Math.max(1, row.fixtures)));
    const xgPerFixture = metric.xG / Math.max(1, metric.fixtures);
    const xgcPerFixture = metric.xGC / Math.max(1, metric.fixtures);
    const attackDelta = history.length ? xgPerFixture - priorXg : 0;
    const defenseDelta = history.length ? priorXgc - xgcPerFixture : 0;
    const attackDirection = xgPerFixture >= leagueXg + .25 || attackDelta >= .30 ? 'UP' : xgPerFixture <= leagueXg - .25 || attackDelta <= -.30 ? 'DOWN' : 'STEADY';
    const defenseDirection = xgcPerFixture <= 1.05 || defenseDelta >= .30 ? 'UP' : xgcPerFixture >= 1.75 || defenseDelta <= -.30 ? 'DOWN' : 'STEADY';
    rows.push({
      team: metric.team,
      fixtures: metric.fixtures,
      goalsFor: metric.goalsFor,
      goalsAgainst: metric.goalsAgainst,
      cleanSheets: metric.cleanSheets,
      xG: round(xgPerFixture, 2),
      xGC: round(xgcPerFixture, 2),
      attackDirection,
      defenseDirection,
      attackDelta: history.length ? round(attackDelta, 2) : null,
      defenseDelta: history.length ? round(defenseDelta, 2) : null,
      priorGameweeks: history.length,
      confidence: history.length
        ? confidenceLabel(history.length, metric.fixtures * 90, Math.abs(attackDelta) >= .3 || Math.abs(defenseDelta) >= .3 ? 1 : 0)
        : 'LOW',
    });
  }
  return rows.sort((a, b) => b.xG - a.xG || a.xGC - b.xGC || a.team.localeCompare(b.team));
}

function signalLists(rows, history, currentTeams) {
  const evidence = (row) => playerHistoryEvidence(history.get(row.player_id));
  const decorate = (row, why, signal, strength = 0) => {
    const prior = evidence(row);
    return compactPlayer(row, {
      signal,
      why,
      confidence: confidenceLabel(prior.gameweeks, prior.minutes + row.minutes, strength),
      evidence: {
        currentGameweek: 1,
        priorGameweeks: prior.gameweeks,
        priorAppearances: prior.appearances,
        sampleMinutes: round(prior.minutes + row.minutes, 0),
      },
    });
  };

  const topPerformers = [...rows]
    .filter((row) => row.minutes > 0)
    .sort((a, b) => b.total_points - a.total_points || b.expected_goal_involvements - a.expected_goal_involvements)
    .slice(0, 10)
    .map((row) => decorate(row, `${row.total_points} points from ${row.minutes} minutes; ${round(row.expected_goal_involvements, 2)} xGI.`, 'GAMEWEEK_HAUL', 1));

  const hiddenGems = rows
    .filter((row) => row.minutes >= 60 && row.ownership <= 12 && (row.total_points >= 6 || row.expected_goal_involvements >= .45 || row.defensive_contribution >= 10))
    .map((row) => {
      const prior = evidence(row);
      const score = row.total_points + row.expected_goal_involvements * 5 + Math.min(3, row.defensive_contribution / 5) - row.ownership * .08 + prior.xGI;
      return { row, prior, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ row, prior }) => decorate(row, `${round(row.ownership, 1)}% owned, ${round(row.expected_goal_involvements, 2)} xGI and ${row.minutes} minutes${prior.gameweeks ? `; ${round(prior.xGI, 2)} xGI across the prior ${prior.gameweeks} GW` : '; first-week evidence only'}.`, 'LOW_OWNED_EMERGING', 1));

  const underlyingWatch = rows
    .filter((row) => row.minutes >= 60 && row.total_points <= 5 && (row.expected_goal_involvements >= .45 || row.threat >= 45 || row.creativity >= 35))
    .sort((a, b) => b.expected_goal_involvements - a.expected_goal_involvements || b.threat - a.threat)
    .slice(0, 10)
    .map((row) => decorate(row, `Only ${row.total_points} points, but ${round(row.expected_goal_involvements, 2)} xGI with threat ${round(row.threat, 0)} and creativity ${round(row.creativity, 0)}.`, 'PROCESS_OVER_OUTCOME', 1));

  const roleRisers = rows
    .map((row) => ({ row, prior: evidence(row) }))
    .filter(({ row, prior }) => row.starts > 0 && row.minutes >= 60 && (prior.gameweeks === 0 ? row.gw > 1 : prior.avgMinutes < 55 || prior.startRate < .6))
    .sort((a, b) => (b.row.minutes - b.prior.avgMinutes) - (a.row.minutes - a.prior.avgMinutes) || b.row.expected_goal_involvements - a.row.expected_goal_involvements)
    .slice(0, 10)
    .map(({ row, prior }) => decorate(row, prior.gameweeks ? `Started and played ${row.minutes} minutes after averaging ${round(prior.avgMinutes, 0)} minutes and a ${round(prior.startRate * 100, 0)}% start rate over the prior ${prior.gameweeks} GW.` : `Started and played ${row.minutes} minutes; no earlier current-season role sample exists yet.`, 'ROLE_GAIN', 1));

  const roleFallers = rows
    .map((row) => ({ row, prior: evidence(row) }))
    .filter(({ row, prior }) => currentTeams.get(row.team_code)?.fixtures > 0 && prior.gameweeks >= 1 && prior.avgMinutes >= 60 && prior.startRate >= .6 && row.starts === 0 && row.minutes < 45)
    .sort((a, b) => (b.prior.avgMinutes - b.row.minutes) - (a.prior.avgMinutes - a.row.minutes) || b.prior.startRate - a.prior.startRate)
    .slice(0, 10)
    .map(({ row, prior }) => decorate(row, `Did not start and played ${row.minutes} minutes after averaging ${round(prior.avgMinutes, 0)} minutes with a ${round(prior.startRate * 100, 0)}% start rate over the prior ${prior.gameweeks} GW. Check injury, suspension, rotation and tactical context before reacting.`, 'ROLE_LOSS', 1));

  const defensiveWatch = rows
    .filter((row) => row.position <= 2 && row.minutes >= 60 && row.total_points <= 5 && (row.defensive_contribution >= 10 || row.saves >= 4 || row.expected_goals_conceded <= .8))
    .sort((a, b) => b.defensive_contribution + b.saves * 2 - (a.defensive_contribution + a.saves * 2) || a.expected_goals_conceded - b.expected_goals_conceded)
    .slice(0, 10)
    .map((row) => decorate(row, `${row.total_points} points hid ${round(row.defensive_contribution, 0)} defensive contributions, ${round(row.saves, 0)} saves and ${round(row.expected_goals_conceded, 2)} xGC. Check role security and fixtures before the points arrive.`, 'DEFENSIVE_PROCESS', 1));

  const haulCautions = rows
    .filter((row) => row.total_points >= 8)
    .map((row) => {
      const repeatable = row.expected_goal_involvements * 5 + row.bonus + ((row.position <= 2) ? row.clean_sheets * 3 + row.saves / 3 : 0);
      return { row, gap: row.total_points - repeatable };
    })
    .filter(({ row, gap }) => gap >= 3.5 || row.minutes < 60)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10)
    .map(({ row }) => decorate(row, `${row.total_points} points came with ${round(row.expected_goal_involvements, 2)} xGI and ${row.minutes} minutes. Treat the haul as an outcome to verify, not proof of a new baseline.`, 'HAUL_CAUTION'));

  return { topPerformers, hiddenGems, underlyingWatch, defensiveWatch, roleRisers, roleFallers, haulCautions };
}

export function buildGameweekIntelligence({ season, gw, generatedAt, rows, historyRows = [], fixtures = [], teams = [] }) {
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
    final: true,
    dataChecked: true,
    confidence: priorGameweeks >= 3 ? 'MEDIUM' : 'LOW',
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
    },
    sections: lists,
    teamTrends: teamReview(currentTeams, priorTeams),
  };
}

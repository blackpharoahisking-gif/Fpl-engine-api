/**
 * FPL Engine API — Cloudflare Worker
 * RC2.1.4 Quota and Reliability Repair
 *
 * Preserves the existing state, watchlist, history and backfill APIs while
 * adding the News Intelligence contract required by the RC2.0.1 frontend.
 */

const FPL = 'https://fantasy.premierleague.com/api';
const UA = 'FPLEngine/2.1 (personal fantasy tool)';

const POS = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
const WORKER_SCHEMA_VERSION = 5;
const DEFAULT_SEASON = '2026/27';
const PUBLIC_SYNC_COOLDOWN_MS = 35 * 60 * 1000;
const PIPELINE_LOCK_TTL_MS = 15 * 60 * 1000;
const BACKFILL_BATCH = 30;
const DEFAULT_PREVIOUS_SEASON = '2025/26';
const PRICE_WINDOWS = [6, 12, 24, 48, 168];
const CHECKPOINT_RETENTION_DAYS = 9;

const json = (body, status = 200, extra = {}) => {
  const noBody = status === 204 || status === 205 || status === 304;
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization, x-admin-key',
    'cache-control': status >= 400 ? 'no-store' : 'public, max-age=60',
    ...extra,
  };
  if (noBody) delete headers['content-type'];
  return new Response(noBody ? null : JSON.stringify(body), { status, headers });
};

const now = () => new Date().toISOString();
const num = (v, d = 0) =>
  v === null || v === undefined || v === '' || Number.isNaN(+v) ? d : +v;

function configuredSeason(env) {
  return String(env?.FPL_SEASON || DEFAULT_SEASON);
}

function previousSeasonName(season) {
  const year = Number(String(season || DEFAULT_SEASON).slice(0, 4));
  return Number.isFinite(year) ? `${year - 1}/${String(year % 100).padStart(2, '0')}` : DEFAULT_PREVIOUS_SEASON;
}

function seasonWindowStartValue(season) {
  const year = Number(String(season || DEFAULT_SEASON).slice(0, 4));
  return Number.isFinite(year) ? new Date(Date.UTC(year, 6, 1)).toISOString() : null;
}

function suppliedAdminKey(request, url, env) {
  const bearer = String(request.headers.get('authorization') || '');
  if (/^Bearer\s+/i.test(bearer)) return bearer.replace(/^Bearer\s+/i, '').trim();
  const header = String(request.headers.get('x-admin-key') || '');
  if (header) return header;
  return env.ALLOW_LEGACY_QUERY_KEY === '1' ? String(url.searchParams.get('key') || '') : '';
}

function adminAuthorised(request, url, env) {
  return Boolean(env.ADMIN_KEY) && suppliedAdminKey(request, url, env) === String(env.ADMIN_KEY);
}

async function fplGet(path) {
  const res = await fetch(`${FPL}${path}`, {
    headers: { 'user-agent': UA, accept: 'application/json' },
    cf: { cacheTtl: 30, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`FPL ${path} returned ${res.status}`);
  return res.json();
}

function validateBootstrap(b) {
  const problems = [];
  if (!b || typeof b !== 'object') return ['payload was not an object'];
  if (!Array.isArray(b.elements) || b.elements.length < 300)
    problems.push(`elements missing or implausibly short (${b?.elements?.length})`);
  if (!Array.isArray(b.teams) || b.teams.length !== 20)
    problems.push(`expected 20 teams, saw ${b?.teams?.length}`);
  if (!Array.isArray(b.events) || b.events.length !== 38)
    problems.push(`expected 38 events, saw ${b?.events?.length}`);

  const required = ['id', 'web_name', 'team', 'element_type', 'now_cost', 'status', 'total_points'];
  const sample = b?.elements?.[0] || {};
  const missing = required.filter((k) => !(k in sample));
  if (missing.length) problems.push(`element is missing fields: ${missing.join(', ')}`);
  return problems;
}

function validateFixtures(fixtures, boot) {
  const problems = [];
  if (!Array.isArray(fixtures)) return ['fixtures payload was not an array'];
  if (fixtures.length !== 380) problems.push(`expected 380 fixtures, saw ${fixtures.length}`);
  const teamIds = new Set((boot?.teams || []).map((t) => t.id));
  const ids = new Set();
  const counts = new Map([...teamIds].map((id) => [id, { home: 0, away: 0, total: 0 }]));
  const directed = new Set();
  for (const f of fixtures) {
    if (!Number.isInteger(f?.id) || ids.has(f.id)) problems.push(`duplicate or invalid fixture id ${f?.id}`);
    ids.add(f?.id);
    if (!teamIds.has(f?.team_h) || !teamIds.has(f?.team_a) || f.team_h === f.team_a) {
      problems.push(`fixture ${f?.id} has invalid teams`);
      continue;
    }
    const key = `${f.team_h}>${f.team_a}`;
    if (directed.has(key)) problems.push(`repeated home/away pairing ${key}`);
    directed.add(key);
    const h = counts.get(f.team_h), a = counts.get(f.team_a);
    h.home++; h.total++; a.away++; a.total++;
  }
  for (const [id, c] of counts) {
    if (c.total !== 38 || c.home !== 19 || c.away !== 19) {
      problems.push(`team ${id} has ${c.total} fixtures (${c.home} home, ${c.away} away)`);
    }
  }
  return [...new Set(problems)].slice(0, 25);
}

async function scheduleDataHash(boot, fixtures) {
  return sha256(JSON.stringify({
    teams: (boot.teams || []).map((t) => [
      t.id, t.short_name, t.name, t.strength,
      t.strength_attack_home, t.strength_attack_away,
      t.strength_defence_home, t.strength_defence_away,
    ]),
    events: (boot.events || []).map((e) => [e.id, e.name, e.deadline_time]),
    fixtures: (fixtures || []).map((f) => [
      f.id, f.event ?? null, f.team_h, f.team_a, f.kickoff_time ?? null,
      f.team_h_difficulty, f.team_a_difficulty,
    ]),
  }));
}

async function acquirePipelineLock(env, ttlMs = PIPELINE_LOCK_TTL_MS) {
  const token = crypto.randomUUID();
  const acquiredAt = now();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  const result = await env.DB.prepare(
    `INSERT INTO meta (key,value,updated_at) VALUES ('pipeline_lock',?1,?2)
     ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?2
     WHERE meta.updated_at < ?3`
  ).bind(token, expiresAt, acquiredAt).run();
  return num(result?.meta?.changes) > 0 ? token : null;
}

async function releasePipelineLock(env, token) {
  if (!token) return;
  await env.DB.prepare("DELETE FROM meta WHERE key='pipeline_lock' AND value=?1").bind(token).run();
}

async function renewPipelineLock(env, token, ttlMs = PIPELINE_LOCK_TTL_MS) {
  if (!token) return false;
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  const result = await env.DB.prepare(
    "UPDATE meta SET updated_at=?1 WHERE key='pipeline_lock' AND value=?2"
  ).bind(expiresAt, token).run();
  return num(result?.meta?.changes) > 0;
}

async function ownsPipelineLock(env, token) {
  if (!token) return false;
  const row = await env.DB.prepare(
    "SELECT value, updated_at FROM meta WHERE key='pipeline_lock'"
  ).first();
  return row?.value === token && Date.parse(row.updated_at || '') > Date.now();
}


function seasonFromBootstrap(boot) {
  const deadlines = (boot?.events || [])
    .map((event) => Date.parse(event?.deadline_time || ''))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (!deadlines.length) return DEFAULT_SEASON;
  const year = new Date(deadlines[0]).getUTCFullYear();
  return `${year}/${String((year + 1) % 100).padStart(2, '0')}`;
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function dataHash(boot, fixtures) {
  const compact = {
    teams: (boot.teams || []).map((t) => [t.id, t.short_name, t.name]),
    events: (boot.events || []).map((e) => [
      e.id,
      e.deadline_time,
      Boolean(e.finished),
      Boolean(e.is_current),
      Boolean(e.is_next),
    ]),
    players: (boot.elements || []).map((e) => [
      e.id,
      e.code,
      e.team,
      e.element_type,
      e.now_cost,
      e.status,
      e.chance_of_playing_next_round ?? null,
      (e.news || '').trim(),
      e.total_points,
      e.selected_by_percent,
      e.transfers_in_event,
      e.transfers_out_event,
      e.cost_change_event,
      e.cost_change_start,
    ]),
    fixtures: (fixtures || []).map((f) => [
      f.id,
      f.event ?? null,
      f.team_h,
      f.team_a,
      f.kickoff_time ?? null,
      Boolean(f.finished),
    ]),
  };
  return sha256(JSON.stringify(compact));
}

const MATERIAL = [
  ['now_cost', (e) => num(e.now_cost), 'price'],
  ['status', (e) => e.status || 'a', 'status'],
  ['chance_next', (e) => e.chance_of_playing_next_round ?? null, 'chance'],
  ['team_code', (e, m) => m[e.team] || '?', 'team'],
  ['element_type', (e) => num(e.element_type), 'position'],
  ['news', (e) => (e.news || '').trim(), 'news'],
];

function diffPlayer(prev, e, teamMap) {
  if (!prev) return [];
  const out = [];
  for (const [col, get, kind] of MATERIAL) {
    const next = get(e, teamMap);
    const before = prev[col];
    const same =
      before === next ||
      (before === null && next === null) ||
      String(before ?? '') === String(next ?? '');
    if (same) continue;
    out.push({
      kind,
      old_value: before === null ? null : String(before),
      new_value: next === null ? null : String(next),
    });
  }
  return out;
}

async function fetchPlayerHistory(apiId, code, webName, targetSeason = DEFAULT_PREVIOUS_SEASON) {
  const data = await fplGet(`/element-summary/${apiId}/`);
  const past = Array.isArray(data?.history_past) ? data.history_past : [];
  if (!past.length) return null;
  const row = past.find((h) => h.season_name === targetSeason) || past[past.length - 1];
  if (!row) return null;
  return {
    code, season_name: row.season_name, api_id: apiId, web_name: webName,
    total_points: num(row.total_points), minutes: num(row.minutes), starts: num(row.starts),
    goals: num(row.goals_scored), assists: num(row.assists), clean_sheets: num(row.clean_sheets),
    goals_conceded: num(row.goals_conceded), saves: num(row.saves), bonus: num(row.bonus),
    bps: num(row.bps), yellow_cards: num(row.yellow_cards), red_cards: num(row.red_cards),
    xg: num(row.expected_goals), xa: num(row.expected_assists), xgc: num(row.expected_goals_conceded),
    defcon: num(row.defensive_contribution ?? row.defensive_contributions),
    start_cost: row.start_cost ?? null, end_cost: row.end_cost ?? null,
  };
}

async function backfillHistory(env) {
  const startedAt = now();
  const boot = await fplGet('/bootstrap-static/');
  const problems = validateBootstrap(boot);
  if (problems.length) throw new Error(`schema guard tripped: ${problems.join(' | ')}`);
  const targetSeason = previousSeasonName(configuredSeason(env));
  const all = boot.elements
    .filter((e) => e.id != null && e.code != null)
    .sort((a, b) => a.id - b.id);
  const cur = await env.DB.prepare("SELECT value FROM meta WHERE key='backfill_cursor'").first();
  const cursor = Math.max(0, num(cur?.value));
  if (cursor >= all.length) {
    const done = await env.DB.prepare(
      'SELECT COUNT(*) AS n FROM player_history WHERE season_name = ?1'
    ).bind(targetSeason).first();
    return {
      ok: true,
      complete: true,
      stored: num(done?.n),
      total_players: all.length,
      message: 'Backfill already complete. Reset with POST /api/backfill?reset=1 using Authorization: Bearer <ADMIN_KEY>.',
    };
  }
  const slice = all.slice(cursor, cursor + BACKFILL_BATCH);
  const stmts = [];
  let fetched = 0, skipped = 0;
  for (const e of slice) {
    let row = null;
    try { row = await fetchPlayerHistory(e.id, e.code, e.web_name, targetSeason); }
    catch { skipped++; continue; }
    if (!row) { skipped++; continue; }
    fetched++;
    stmts.push(env.DB.prepare(
      `INSERT INTO player_history (
         code, season_name, api_id, web_name, total_points, minutes, starts,
         goals, assists, clean_sheets, goals_conceded, saves, bonus, bps,
         yellow_cards, red_cards, xg, xa, xgc, defcon, start_cost, end_cost, updated_at)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23)
       ON CONFLICT(code, season_name) DO UPDATE SET
         api_id=?3, web_name=?4, total_points=?5, minutes=?6, starts=?7,
         goals=?8, assists=?9, clean_sheets=?10, goals_conceded=?11, saves=?12,
         bonus=?13, bps=?14, yellow_cards=?15, red_cards=?16, xg=?17, xa=?18,
         xgc=?19, defcon=?20, start_cost=?21, end_cost=?22, updated_at=?23`
    ).bind(
      row.code, row.season_name, row.api_id, row.web_name, row.total_points,
      row.minutes, row.starts, row.goals, row.assists, row.clean_sheets,
      row.goals_conceded, row.saves, row.bonus, row.bps, row.yellow_cards,
      row.red_cards, row.xg, row.xa, row.xgc, row.defcon,
      row.start_cost, row.end_cost, startedAt
    ));
  }
  const nextCursor = cursor + slice.length;
  stmts.push(metaUpsert(env, 'backfill_cursor', nextCursor, startedAt));
  for (let i = 0; i < stmts.length; i += 60) await env.DB.batch(stmts.slice(i, i + 60));
  return {
    ok: true,
    complete: nextCursor >= all.length,
    fetched, skipped, processed: nextCursor, total_players: all.length,
    percent: Math.round((nextCursor / all.length) * 100),
    message: nextCursor >= all.length ? 'Backfill complete.' : `Call the authenticated endpoint again to continue from player ${nextCursor}.`,
  };
}

async function handleBootstrapEnriched(env) {
  const boot = await fplGet('/bootstrap-static/');
  const targetSeason = previousSeasonName(configuredSeason(env));
  try {
    const rows = await env.DB.prepare(
      `SELECT code, total_points, minutes, starts, goals, assists,
              clean_sheets, bonus, bps, xg, xa, defcon
       FROM player_history WHERE season_name = ?1`
    ).bind(targetSeason).all();
    const byCode = new Map(rows.results.map((r) => [r.code, r]));
    let matched = 0;
    for (const e of boot.elements) {
      const h = byCode.get(e.code);
      if (!h) continue;
      matched++;
      e.hist_prev = {
        season: targetSeason, total_points: h.total_points, minutes: h.minutes,
        starts: h.starts, goals: h.goals, assists: h.assists,
        clean_sheets: h.clean_sheets, bonus: h.bonus, bps: h.bps,
        xg: h.xg, xa: h.xa, defcon: h.defcon,
      };
    }
    boot.hist_meta = { season: targetSeason, matched, available: rows.results.length };
  } catch (err) {
    boot.hist_meta = { season: targetSeason, matched: 0, error: String(err.message || err) };
  }
  return json(boot);
}

function metaUpsert(env, key, value, timestamp) {
  return env.DB.prepare(
    `INSERT INTO meta (key,value,updated_at) VALUES (?1,?2,?3)
     ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3`
  ).bind(key, String(value ?? ''), timestamp);
}


const PLAYER_MATERIAL_FIELDS = [
  'web_name','full_name','team_code','element_type','now_cost','cost_change_event','cost_change_start',
  'status','chance_next','news','news_added','minutes','starts','total_points','goals','assists',
  'clean_sheets','saves','bonus','bps','xg','xa','xgc','dc_per_90','form','points_per_game','ep_next',
  'penalties_order'
];

function incomingPlayerRow(e, code) {
  return {
    id: e.id, web_name: e.web_name,
    full_name: `${e.first_name || ''} ${e.second_name || ''}`.trim(),
    team_code: code, element_type: num(e.element_type), now_cost: num(e.now_cost),
    cost_change_event: num(e.cost_change_event), cost_change_start: num(e.cost_change_start),
    status: e.status || 'a', chance_next: e.chance_of_playing_next_round ?? null,
    news: (e.news || '').trim(), news_added: e.news_added ?? null,
    minutes: num(e.minutes), starts: num(e.starts), total_points: num(e.total_points),
    goals: num(e.goals_scored), assists: num(e.assists), clean_sheets: num(e.clean_sheets),
    saves: num(e.saves), bonus: num(e.bonus), bps: num(e.bps),
    xg: num(e.expected_goals), xa: num(e.expected_assists), xgc: num(e.expected_goals_conceded),
    dc_per_90: num(e.defensive_contribution_per_90), form: num(e.form),
    points_per_game: num(e.points_per_game), ep_next: num(e.ep_next),
    selected_by: num(e.selected_by_percent), transfers_in_event: num(e.transfers_in_event),
    transfers_out_event: num(e.transfers_out_event), penalties_order: e.penalties_order ?? null,
  };
}

function dbEqual(a, b) {
  return a === b || (a == null && b == null) || String(a ?? '') === String(b ?? '');
}

function playerMaterialChanged(prev, row) {
  return !prev || PLAYER_MATERIAL_FIELDS.some((field) => !dbEqual(prev[field], row[field]));
}

function playerUpsert(env, row, timestamp) {
  return env.DB.prepare(
    `INSERT INTO players (
       id, web_name, full_name, team_code, element_type, now_cost, cost_change_event, cost_change_start,
       status, chance_next, news, news_added, minutes, starts, total_points, goals, assists,
       clean_sheets, saves, bonus, bps, xg, xa, xgc, dc_per_90, form, points_per_game, ep_next,
       selected_by, transfers_in_event, transfers_out_event, penalties_order, updated_at)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29,?30,?31,?32,?33)
     ON CONFLICT(id) DO UPDATE SET
       web_name=?2, full_name=?3, team_code=?4, element_type=?5, now_cost=?6,
       cost_change_event=?7, cost_change_start=?8, status=?9, chance_next=?10,
       news=?11, news_added=?12, minutes=?13, starts=?14, total_points=?15,
       goals=?16, assists=?17, clean_sheets=?18, saves=?19, bonus=?20,
       bps=?21, xg=?22, xa=?23, xgc=?24, dc_per_90=?25, form=?26,
       points_per_game=?27, ep_next=?28, selected_by=?29, transfers_in_event=?30,
       transfers_out_event=?31, penalties_order=?32, updated_at=?33`
  ).bind(
    row.id,row.web_name,row.full_name,row.team_code,row.element_type,row.now_cost,
    row.cost_change_event,row.cost_change_start,row.status,row.chance_next,row.news,row.news_added,
    row.minutes,row.starts,row.total_points,row.goals,row.assists,row.clean_sheets,row.saves,row.bonus,
    row.bps,row.xg,row.xa,row.xgc,row.dc_per_90,row.form,row.points_per_game,row.ep_next,
    row.selected_by,row.transfers_in_event,row.transfers_out_event,row.penalties_order,timestamp
  );
}

function transferStateFromBootstrap(boot) {
  const state = {};
  for (const e of boot.elements || []) {
    state[e.id] = [num(e.now_cost), num(e.transfers_in_event), num(e.transfers_out_event), num(e.selected_by_percent)];
  }
  return state;
}

function checkpointKey(timestamp) {
  const d = new Date(timestamp);
  d.setUTCSeconds(0, 0);
  d.setUTCMinutes(Math.floor(d.getUTCMinutes() / 5) * 5);
  return `transfer_checkpoint_${d.toISOString().slice(0, 16)}`;
}

async function saveTransferCheckpoint(env, boot, timestamp) {
  const state = transferStateFromBootstrap(boot);
  const payload = JSON.stringify(state);
  await env.DB.batch([
    metaUpsert(env, 'transfer_sample_state', payload, timestamp),
    metaUpsert(env, checkpointKey(timestamp), payload, timestamp),
    metaUpsert(env, 'last_market_sample', timestamp, timestamp),
    metaUpsert(env, 'total_managers', num(boot.total_players), timestamp),
    metaUpsert(env, 'price_storage_mode', 'checkpoint-v1', timestamp),
  ]);
  return Object.keys(state).length;
}

async function maybePruneOperationalHistory(env, season, timestamp) {
  const last = await env.DB.prepare("SELECT value FROM meta WHERE key='last_maintenance_prune'").first();
  const lastMs = Date.parse(last?.value || '');
  if (Number.isFinite(lastMs) && Date.now() - lastMs < 20 * 3600e3) return;
  const checkpointCutoff = new Date(Date.now() - CHECKPOINT_RETENTION_DAYS * 86400e3).toISOString();
  const pollCutoff = new Date(Date.now() - 45 * 86400e3).toISOString();
  const eventCutoff = seasonWindowStartValue(season);
  const stmts = [
    env.DB.prepare("DELETE FROM meta WHERE key LIKE 'transfer_checkpoint_%' AND updated_at < ?1").bind(checkpointCutoff),
    env.DB.prepare('DELETE FROM poll_log WHERE started_at < ?1').bind(pollCutoff),
  ];
  if (eventCutoff) stmts.push(env.DB.prepare('DELETE FROM player_events WHERE detected_at < ?1').bind(eventCutoff));
  stmts.push(metaUpsert(env, 'last_maintenance_prune', timestamp, timestamp));
  await env.DB.batch(stmts);
}

async function poll(env, { sampleTransfers = false } = {}) {
  const t0 = Date.now();
  const startedAt = now();
  let changes = 0, seen = 0, playerWrites = 0, resultWrites = 0;
  const lockToken = await acquirePipelineLock(env);
  if (!lockToken) return { ok: true, skipped: true, reason: 'Another pipeline job is already running' };
  try {
    try {
      const [boot, fixtures] = await Promise.all([fplGet('/bootstrap-static/'), fplGet('/fixtures/')]);
      const problems = [...validateBootstrap(boot), ...validateFixtures(fixtures, boot)];
      if (problems.length) throw new Error(`schema guard tripped: ${problems.join(' | ')}`);
      const expected = configuredSeason(env);
      const season = seasonFromBootstrap(boot);
      if (season !== expected) throw new Error(`upstream season ${season} does not match configured season ${expected}; set FPL_SEASON and deploy the matching frontend at rollover`);
      const [hash, scheduleHash, previousSchedule, prevRows, storedEvents, storedFixtures] = await Promise.all([
        dataHash(boot, fixtures), scheduleDataHash(boot, fixtures),
        env.DB.prepare("SELECT value FROM meta WHERE key='schedule_hash'").first(),
        env.DB.prepare(`SELECT id, web_name, full_name, team_code, element_type, now_cost,
          cost_change_event, cost_change_start, status, chance_next, news, news_added,
          minutes, starts, total_points, goals, assists, clean_sheets, saves, bonus, bps,
          xg, xa, xgc, dc_per_90, form, points_per_game, ep_next, selected_by,
          transfers_in_event, transfers_out_event, penalties_order FROM players`).all(),
        env.DB.prepare('SELECT id, finished, is_current, is_next FROM events').all(),
        env.DB.prepare('SELECT id, finished, home_score, away_score FROM fixtures').all(),
      ]);
      const scheduleChanged = previousSchedule?.value !== scheduleHash;
      const teamMap = {};
      for (const t of boot.teams) teamMap[t.id] = t.short_name;
      const currentEvent = boot.events.find((e) => e.is_current)?.id ?? boot.events.find((e) => e.is_next)?.id ?? null;
      const prev = new Map(prevRows.results.map((r) => [r.id, r]));
      const eventState = new Map(storedEvents.results.map((r) => [r.id, r]));
      const fixtureState = new Map(storedFixtures.results.map((r) => [r.id, r]));
      const incomingPlayerIds = new Set();
      const stmts = [];

      if (scheduleChanged) {
        for (const t of boot.teams) stmts.push(env.DB.prepare(
          `INSERT INTO teams (code, fpl_id, name, strength, atk_home, atk_away, def_home, def_away, updated_at)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)
           ON CONFLICT(code) DO UPDATE SET fpl_id=?2, name=?3, strength=?4,
             atk_home=?5, atk_away=?6, def_home=?7, def_away=?8, updated_at=?9`
        ).bind(t.short_name,t.id,t.name,num(t.strength,3),num(t.strength_attack_home),num(t.strength_attack_away),num(t.strength_defence_home),num(t.strength_defence_away),startedAt));
        for (const ev of boot.events) stmts.push(env.DB.prepare(
          `INSERT INTO events (id,name,deadline_time,finished,is_current,is_next,updated_at)
           VALUES (?1,?2,?3,?4,?5,?6,?7)
           ON CONFLICT(id) DO UPDATE SET name=?2,deadline_time=?3,finished=?4,is_current=?5,is_next=?6,updated_at=?7`
        ).bind(ev.id,ev.name,ev.deadline_time,ev.finished?1:0,ev.is_current?1:0,ev.is_next?1:0,startedAt));
        for (const f of fixtures) {
          const h=teamMap[f.team_h], a=teamMap[f.team_a]; if(!h||!a) continue;
          stmts.push(env.DB.prepare(
            `INSERT INTO fixtures (id,event_id,kickoff_time,home_code,away_code,home_diff,away_diff,finished,home_score,away_score,updated_at)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)
             ON CONFLICT(id) DO UPDATE SET event_id=?2,kickoff_time=?3,home_code=?4,away_code=?5,
               home_diff=?6,away_diff=?7,finished=?8,home_score=?9,away_score=?10,updated_at=?11`
          ).bind(f.id,f.event??null,f.kickoff_time??null,h,a,num(f.team_h_difficulty,3),num(f.team_a_difficulty,3),f.finished?1:0,f.team_h_score??null,f.team_a_score??null,startedAt));
        }
      } else {
        for (const ev of boot.events) {
          const old=eventState.get(ev.id), next=[ev.finished?1:0,ev.is_current?1:0,ev.is_next?1:0];
          if(!old || !dbEqual(old.finished,next[0]) || !dbEqual(old.is_current,next[1]) || !dbEqual(old.is_next,next[2])) {
            resultWrites++;
            stmts.push(env.DB.prepare('UPDATE events SET finished=?1,is_current=?2,is_next=?3,updated_at=?4 WHERE id=?5').bind(...next,startedAt,ev.id));
          }
        }
        for (const f of fixtures) {
          const old=fixtureState.get(f.id), next=[f.finished?1:0,f.team_h_score??null,f.team_a_score??null];
          if(!old || !dbEqual(old.finished,next[0]) || !dbEqual(old.home_score,next[1]) || !dbEqual(old.away_score,next[2])) {
            resultWrites++;
            stmts.push(env.DB.prepare('UPDATE fixtures SET finished=?1,home_score=?2,away_score=?3,updated_at=?4 WHERE id=?5').bind(...next,startedAt,f.id));
          }
        }
      }

      for (const e of boot.elements) {
        const code=teamMap[e.team]; if(!code) continue;
        seen++; incomingPlayerIds.add(e.id);
        const old=prev.get(e.id), row=incomingPlayerRow(e,code);
        for (const c of diffPlayer(old,e,teamMap)) {
          changes++;
          stmts.push(env.DB.prepare(
            `INSERT INTO player_events (player_id,web_name,team_code,kind,old_value,new_value,detected_at,event_id)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
          ).bind(e.id,e.web_name,code,c.kind,c.old_value,c.new_value,startedAt,currentEvent));
        }
        if(playerMaterialChanged(old,row)) { playerWrites++; stmts.push(playerUpsert(env,row,startedAt)); }
      }
      for (const id of prev.keys()) if(!incomingPlayerIds.has(id)) stmts.push(env.DB.prepare('DELETE FROM players WHERE id=?1').bind(id));

      for (let i=0;i<stmts.length;i+=80) {
        if(!(await renewPipelineLock(env,lockToken))) throw new Error('pipeline lock ownership was lost during write batches');
        await env.DB.batch(stmts.slice(i,i+80));
      }
      if(!(await ownsPipelineLock(env,lockToken))) throw new Error('pipeline lock expired before structural cleanup');
      if(scheduleChanged) {
        await env.DB.batch([
          env.DB.prepare('DELETE FROM teams WHERE updated_at <> ?1').bind(startedAt),
          env.DB.prepare('DELETE FROM fixtures WHERE updated_at <> ?1').bind(startedAt),
          env.DB.prepare('DELETE FROM events WHERE updated_at <> ?1').bind(startedAt),
        ]);
      }
      if(sampleTransfers) await saveTransferCheckpoint(env,boot,startedAt);
      await maybePruneOperationalHistory(env,season,startedAt);
      await env.DB.batch([
        metaUpsert(env,'last_poll',startedAt,startedAt), metaUpsert(env,'last_official_fetch',startedAt,startedAt),
        metaUpsert(env,'current_event',currentEvent??'',startedAt), metaUpsert(env,'season',season,startedAt),
        metaUpsert(env,'schema_version',WORKER_SCHEMA_VERSION,startedAt), metaUpsert(env,'data_hash',hash,startedAt),
        metaUpsert(env,'schedule_hash',scheduleHash,startedAt), metaUpsert(env,'bootstrap_players',seen,startedAt),
        metaUpsert(env,'fixture_count',fixtures.length,startedAt), metaUpsert(env,'total_managers',num(boot.total_players),startedAt),
        env.DB.prepare(`INSERT INTO poll_log (started_at,ok,duration_ms,players_seen,changes,error)
          VALUES (?1,1,?2,?3,?4,NULL)`).bind(startedAt,Date.now()-t0,seen,changes),
      ]);
      return {ok:true,season,seen,fixtures:fixtures.length,changes,dataHash:hash,scheduleChanged,playerWrites,resultWrites,ms:Date.now()-t0};
    } catch(err) {
      try { await env.DB.prepare(`INSERT INTO poll_log (started_at,ok,duration_ms,players_seen,changes,error)
        VALUES (?1,0,?2,?3,?4,?5)`).bind(startedAt,Date.now()-t0,seen,changes,String(err.message||err)).run(); } catch {}
      return {ok:false,error:String(err.message||err)};
    }
  } finally { await releasePipelineLock(env,lockToken).catch(()=>{}); }
}

async function sampleTransferMarket(env) {
  const startedAt=now();
  const lockToken=await acquirePipelineLock(env,5*60*1000);
  if(!lockToken) return {ok:true,skipped:true,reason:'Another pipeline job is already running'};
  try {
    try {
      const boot=await fplGet('/bootstrap-static/');
      const problems=validateBootstrap(boot);
      if(problems.length) throw new Error(`schema guard tripped: ${problems.join(' | ')}`);
      const season=seasonFromBootstrap(boot), expected=configuredSeason(env);
      if(season!==expected) throw new Error(`upstream season ${season} does not match configured season ${expected}`);
      const sampled=await saveTransferCheckpoint(env,boot,startedAt);
      await metaUpsert(env,'last_market_error','',startedAt).run();
      await maybePruneOperationalHistory(env,season,startedAt);
      return {ok:true,sampled,storage:'checkpoint-v1',season,at:startedAt};
    } catch(err) {
      const message=String(err.message||err);
      await metaUpsert(env,'last_market_error',message,startedAt).run().catch(()=>{});
      return {ok:false,error:message,at:startedAt};
    }
  } finally { await releasePipelineLock(env,lockToken).catch(()=>{}); }
}

async function handleState(env) {
  const [players, teams, fixtures, events, meta] = await Promise.all([
    env.DB.prepare(
      `SELECT id, web_name, full_name, team_code, element_type, now_cost, cost_change_event,
              status, chance_next, news, minutes, starts, total_points, goals, assists,
              clean_sheets, saves, bonus, bps, xg, xa, xgc, dc_per_90, form, points_per_game,
              ep_next, selected_by, transfers_in_event, transfers_out_event, penalties_order,
              cost_change_start, updated_at
       FROM players ORDER BY total_points DESC`
    ).all(),
    env.DB.prepare('SELECT * FROM teams').all(),
    env.DB.prepare(
      'SELECT * FROM fixtures WHERE event_id IS NOT NULL ORDER BY event_id, kickoff_time'
    ).all(),
    env.DB.prepare('SELECT * FROM events ORDER BY id').all(),
    env.DB.prepare("SELECT key, value FROM meta WHERE key NOT LIKE 'transfer_checkpoint_%' AND key <> 'transfer_sample_state'").all(),
  ]);

  const m = Object.fromEntries(meta.results.map((r) => [r.key, r.value]));
  return json({
    updated_at: m.last_poll || null,
    current_event: m.current_event ? +m.current_event : null,
    season: m.season || configuredSeason(env),
    schemaVersion: WORKER_SCHEMA_VERSION,
    storedSchemaVersion: num(m.schema_version, 0),
    dataHash: m.data_hash || null,
    counts: { players: players.results.length, fixtures: fixtures.results.length },
    teams: teams.results,
    events: events.results,
    players: players.results.map((p) => ({ ...p, pos: POS[p.element_type] })),
    fixtures: fixtures.results,
  });
}

function seasonWindowStart(season) {
  return seasonWindowStartValue(season);
}

async function readDeltas(env, url, season) {
  const hours = Math.min(720, Math.max(1, +(url.searchParams.get('hours') || 24)));
  const kind = url.searchParams.get('kind');
  const requestedSince = new Date(Date.now() - hours * 3600e3).toISOString();
  const boundary = seasonWindowStart(season);
  const since = boundary && boundary > requestedSince ? boundary : requestedSince;

  const q = kind
    ? env.DB.prepare(
        `SELECT * FROM player_events
         WHERE detected_at >= ?1 AND kind = ?2
         ORDER BY detected_at DESC LIMIT 500`
      ).bind(since, kind)
    : env.DB.prepare(
        `SELECT * FROM player_events
         WHERE detected_at >= ?1
         ORDER BY detected_at DESC LIMIT 500`
      ).bind(since);

  const rows = await q.all();
  return { since, hours, count: rows.results.length, events: rows.results };
}

async function currentAlerts(env) {
  const rows = await env.DB.prepare(
    `SELECT id AS player_id, web_name, team_code, status,
            chance_next AS chance, news, now_cost, element_type, updated_at
     FROM players
     WHERE status <> 'a'
        OR chance_next IS NOT NULL
        OR TRIM(COALESCE(news,'')) <> ''
     ORDER BY
       CASE status WHEN 'i' THEN 0 WHEN 's' THEN 0 WHEN 'u' THEN 0
                   WHEN 'd' THEN 1 WHEN 'n' THEN 2 ELSE 3 END,
       COALESCE(chance_next,100), web_name`
  ).all();
  return rows.results;
}

async function healthData(env) {
  const [meta, recent, latestEvent, playerCount, fixtureCount, alertCount] = await Promise.all([
    env.DB.prepare("SELECT key, value FROM meta WHERE key NOT LIKE 'transfer_checkpoint_%' AND key <> 'transfer_sample_state'").all(),
    env.DB.prepare(
      `SELECT started_at, ok, duration_ms, players_seen, changes, error
       FROM poll_log ORDER BY id DESC LIMIT 10`
    ).all(),
    env.DB.prepare(
      'SELECT detected_at FROM player_events ORDER BY detected_at DESC LIMIT 1'
    ).first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM players').first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM fixtures WHERE event_id IS NOT NULL').first(),
    env.DB.prepare(
      `SELECT COUNT(*) AS n FROM players
       WHERE status <> 'a' OR chance_next IS NOT NULL OR TRIM(COALESCE(news,'')) <> ''`
    ).first(),
  ]);

  const m = Object.fromEntries(meta.results.map((r) => [r.key, r.value]));
  const lastSuccess = m.last_official_fetch || m.last_poll || null;
  const lastAttempt = recent.results[0]?.started_at || lastSuccess;
  const ageMin = lastSuccess
    ? Math.max(0, Math.round((Date.now() - Date.parse(lastSuccess)) / 60000))
    : null;
  const lastThree = recent.results.slice(0, 3);
  const failing = lastThree.length >= 3 && lastThree.every((r) => !r.ok);
  const status = !lastSuccess ? 'unknown' : failing ? 'failing' : ageMin > 90 ? 'stale' : 'ok';
  const lastFailure = recent.results.find((r) => !r.ok);
  const trackedPlayers = num(m.bootstrap_players, num(playerCount?.n));
  const fixtures = num(m.fixture_count, num(fixtureCount?.n));
  const latestEventAt = latestEvent?.detected_at || null;

  const pipeline = {
    status,
    lastSuccessAt: lastSuccess,
    lastPollAt: lastAttempt,
    latestEventAt,
    minutesSinceSuccess: ageMin,
    trackedPlayers,
    fixtureCount: fixtures,
    alertCount: num(alertCount?.n),
    database: 'D1 connected',
    lastError: lastFailure?.error || null,
    lastMarketSampleAt: m.last_market_sample || null,
    lastMarketError: m.last_market_error || null,
    recentPolls: recent.results,
  };

  return {
    status,
    service: 'FPL Engine API',
    release: 'RC2.1.4-quota-reliability-repair',
    season: m.season || configuredSeason(env),
    schemaVersion: WORKER_SCHEMA_VERSION,
    storedSchemaVersion: num(m.schema_version, 0),
    generatedAt: now(),
    lastOfficialFetch: lastSuccess,
    lastPollAt: lastAttempt,
    latestEventAt,
    bootstrapPlayers: trackedPlayers,
    fixtures,
    trackedPlayers,
    dataHash: m.data_hash || null,
    pipeline,
  };
}

async function handleDeltas(env, url) {
  const health = await healthData(env);
  const payload = await readDeltas(env, url, health.season);
  return json({
    ...payload,
    season: health.season,
    generatedAt: now(),
    pipeline: health.pipeline,
    schemaVersion: WORKER_SCHEMA_VERSION,
  });
}

async function handleNews(env, url) {
  const health = await healthData(env);
  const [alerts, deltas] = await Promise.all([
    currentAlerts(env),
    readDeltas(env, url, health.season),
  ]);
  return json({
    season: health.season,
    generatedAt: now(),
    alerts,
    events: deltas.events,
    pipeline: health.pipeline,
    schemaVersion: WORKER_SCHEMA_VERSION,
  });
}




function priceDirection(index, locked) {
  if (locked) return 'LOCKED';
  const a = Math.abs(index);
  if (a < 20) return 'QUIET';
  const side = index > 0 ? 'RISE' : 'FALL';
  if (a >= 90) return `VERY STRONG ${side}`;
  if (a >= 70) return `STRONG ${side}`;
  if (a >= 45) return `MODERATE ${side}`;
  return `MILD ${side}`;
}

function confidenceLabel(samples, durationHours) {
  if (samples >= 10 && durationHours >= 6) return 'HIGH';
  if (samples >= 4 && durationHours >= 2) return 'MEDIUM';
  return 'LOW';
}

async function priceLockState(env) {
  const [first, started] = await Promise.all([
    env.DB.prepare(
      `SELECT deadline_time FROM events WHERE id = 1 LIMIT 1`
    ).first(),
    env.DB.prepare(
      `SELECT MAX(CASE WHEN finished = 1 OR is_current = 1 THEN 1 ELSE 0 END) AS started
       FROM events`
    ).first(),
  ]);
  const firstDeadline = first?.deadline_time || null;
  const deadlineMs = Date.parse(firstDeadline || '');
  const seasonStarted = num(started?.started) === 1 || (Number.isFinite(deadlineMs) && Date.now() >= deadlineMs);
  return {
    pricesLocked: !seasonStarted,
    firstDeadline,
    status: seasonStarted ? 'ACTIVE' : 'LOCKED UNTIL GW1',
  };
}

async function priceIntelligenceData(env, url) {
  const hours=Math.min(168,Math.max(2,+(url.searchParams.get('hours')||24)));
  const limit=Math.min(800,Math.max(20,+(url.searchParams.get('limit')||800)));
  const since=new Date(Date.now()-hours*3600e3).toISOString();
  const [metaRows,playersResult,prior,recent,lock]=await Promise.all([
    env.DB.prepare("SELECT key,value FROM meta WHERE key NOT LIKE 'transfer_checkpoint_%'").all(),
    env.DB.prepare(`SELECT id,web_name,team_code,element_type,now_cost,cost_change_event,cost_change_start,
      status,chance_next,news FROM players ORDER BY id`).all(),
    env.DB.prepare("SELECT value,updated_at FROM meta WHERE key LIKE 'transfer_checkpoint_%' AND updated_at < ?1 ORDER BY updated_at DESC LIMIT 1").bind(since).first(),
    env.DB.prepare("SELECT value,updated_at FROM meta WHERE key LIKE 'transfer_checkpoint_%' AND updated_at >= ?1 ORDER BY updated_at").bind(since).all(),
    priceLockState(env),
  ]);
  const meta=Object.fromEntries(metaRows.results.map(r=>[r.key,r.value]));
  const totalManagers=Math.max(0,num(meta.total_managers));
  const checkpoints=[];
  if(prior?.value) checkpoints.push(prior);
  checkpoints.push(...recent.results);
  if(!checkpoints.length && meta.transfer_sample_state) checkpoints.push({value:meta.transfer_sample_state,updated_at:meta.last_market_sample||now()});
  const parsed=checkpoints.map(cp=>{try{return{at:cp.updated_at,state:JSON.parse(cp.value||'{}')}}catch{return null}}).filter(Boolean);
  const rows=[];
  for(const p of playersResult.results) {
    const samples=[];
    for(const cp of parsed) {
      const v=cp.state[String(p.id)]??cp.state[p.id];
      if(Array.isArray(v)&&v.length>=4) samples.push({at:cp.at,cost:num(v[0]),tin:num(v[1]),tout:num(v[2]),selected:num(v[3])});
    }
    if(!samples.length) samples.push({at:meta.last_market_sample||now(),cost:num(p.now_cost),tin:0,tout:0,selected:0});
    let inDelta=0,outDelta=0;
    for(let i=1;i<samples.length;i++) {
      const a=samples[i-1],b=samples[i];
      inDelta+=b.tin>=a.tin?b.tin-a.tin:b.tin;
      outDelta+=b.tout>=a.tout?b.tout-a.tout:b.tout;
    }
    const first=samples[0],last=samples[samples.length-1];
    const durationHours=Math.max(.01,(Date.parse(last.at)-Date.parse(first.at))/3600e3);
    const netDelta=inDelta-outDelta, velocityPerHour=netDelta/durationHours;
    const selected=last.selected, ownershipDelta=selected-first.selected;
    const estimatedOwners=totalManagers>0?totalManagers*selected/100:null;
    const turnoverPct=estimatedOwners&&estimatedOwners>0?100*Math.abs(netDelta)/estimatedOwners:null;
    rows.push({
      id:p.id,web_name:p.web_name,team_code:p.team_code,element_type:p.element_type,
      now_cost:p.now_cost,first_cost:first.cost,cost_change_event:p.cost_change_event,
      cost_change_start:p.cost_change_start,selected_by:selected,ownership_delta:ownershipDelta,
      status:p.status,chance:p.chance_next,news:p.news,first_at:first.at,last_at:last.at,
      sample_count:samples.length,duration_hours:durationHours,transfers_in_delta:inDelta,
      transfers_out_delta:outDelta,net_delta:netDelta,velocity_per_hour:velocityPerHour,
      estimated_owners:estimatedOwners,turnover_pct:turnoverPct,
      confidence:confidenceLabel(samples.length,durationHours),
    });
  }
  const positives=rows.filter(r=>r.velocity_per_hour>0).sort((a,b)=>b.velocity_per_hour-a.velocity_per_hour);
  const negatives=rows.filter(r=>r.velocity_per_hour<0).sort((a,b)=>a.velocity_per_hour-b.velocity_per_hour);
  const assign=(list,sign)=>list.forEach((r,i)=>{
    const rank=list.length<=1?100:100*(1-i/(list.length-1));
    const magnitude=Math.max(
      Math.min(1,Math.abs(r.net_delta)/500),
      Math.min(1,Math.abs(r.velocity_per_hour)/75),
      r.turnover_pct==null?0:Math.min(1,r.turnover_pct/1.5)
    );
    r.materiality=Math.round(100*magnitude);
    r.pressure_index=sign*Math.round(rank*magnitude);
  });
  assign(positives,1);assign(negatives,-1);
  rows.filter(r=>!Number.isFinite(r.pressure_index)).forEach(r=>{r.pressure_index=0;r.materiality=0});
  rows.forEach(r=>{r.direction=priceDirection(r.pressure_index,lock.pricesLocked)});
  rows.sort((a,b)=>Math.abs(b.pressure_index)-Math.abs(a.pressure_index)||Math.abs(b.net_delta)-Math.abs(a.net_delta));
  const sampleTimes=parsed.map(r=>Date.parse(r.at)).filter(Number.isFinite);
  return {
    season:meta.season||configuredSeason(env),generatedAt:now(),windowHours:hours,
    sampleStart:sampleTimes.length?new Date(Math.min(...sampleTimes)).toISOString():null,
    sampleEnd:sampleTimes.length?new Date(Math.max(...sampleTimes)).toISOString():null,
    sampledPlayers:rows.length,totalManagers:totalManagers||null,pricesLocked:lock.pricesLocked,
    priceStatus:lock.status,firstDeadline:lock.firstDeadline,officialFormulaKnown:false,
    storageMode:meta.price_storage_mode||'checkpoint-v1',
    note:'OTB pressure is a relative rank adjusted by an activity materiality floor using official transfer counters and ownership snapshots. Quiet market noise is suppressed. It is not the undisclosed official threshold or a guaranteed prediction.',
    players:rows.slice(0,limit),
  };
}

async function handlePriceIntelligence(request, env, url) {
  const bypass=url.searchParams.has('fresh');
  const cacheUrl=new URL(url.toString());
  cacheUrl.searchParams.delete('fresh');
  cacheUrl.searchParams.set('_schema',String(WORKER_SCHEMA_VERSION));
  const cacheKey=new Request(cacheUrl.toString(),{method:'GET'});
  const cache=typeof caches!=='undefined'?caches.default:null;
  if(cache&&!bypass) {
    const hit=await cache.match(cacheKey);
    if(hit) return hit;
  }
  const response=json(await priceIntelligenceData(env,url),200,{'cache-control':'public, max-age=300, stale-while-revalidate=300'});
  if(cache) await cache.put(cacheKey,response.clone()).catch(()=>{});
  return response;
}

async function handleWatchlist(env, url) {
  const data = await priceIntelligenceData(env, url);
  return json({
    since: data.sampleStart,
    note: data.note,
    priceStatus: data.priceStatus,
    pricesLocked: data.pricesLocked,
    players: data.players.map((p) => ({
      id: p.id,
      web_name: p.web_name,
      team_code: p.team_code,
      now_cost: p.now_cost,
      selected_by: p.selected_by,
      status: p.status,
      in_delta: p.transfers_in_delta,
      out_delta: p.transfers_out_delta,
      net_delta: p.net_delta,
      pressure_index: p.pressure_index,
      direction: p.direction,
      velocity_per_hour: p.velocity_per_hour,
      confidence: p.confidence,
    })),
  });
}

async function handleHealth(env) {
  return json(await healthData(env));
}

async function handlePublicSync(request, env) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);

  const allowedOrigin = String(env.ALLOWED_ORIGIN || '').trim();
  const origin = request.headers.get('origin') || '';
  if (allowedOrigin && origin !== allowedOrigin) {
    return json({ error: 'origin not allowed' }, 403);
  }

  const last = await env.DB.prepare("SELECT value FROM meta WHERE key='last_poll'").first();
  const lastMs = Date.parse(last?.value || '');
  if (Number.isFinite(lastMs) && Date.now() - lastMs < PUBLIC_SYNC_COOLDOWN_MS) {
    return json({
      ok: true,
      skipped: true,
      reason: 'A successful poll ran less than 35 minutes ago',
      pipeline: (await healthData(env)).pipeline,
    });
  }

  const result = await poll(env, { sampleTransfers: true });
  return json(result, result.ok ? 200 : 502);
}

export default {
  async scheduled(event, env, ctx) {
    const cron=String(event?.cron||'').trim();
    const scheduled=new Date(Number(event?.scheduledTime)||Date.now());
    if(/^\*\/30\b/.test(cron)) {
      ctx.waitUntil(poll(env,{sampleTransfers:true}));
      return;
    }
    if(/^\*\/5\b/.test(cron)) {
      if(scheduled.getUTCMinutes()%30===0) return;
      ctx.waitUntil(sampleTransferMarket(env));
      return;
    }
    // Fail safe: an unrecognised cron is lightweight, never a full pipeline poll.
    ctx.waitUntil(sampleTransferMarket(env));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return json({}, 204);

    try {
      switch (url.pathname) {
        case '/bootstrap-static/':
        case '/bootstrap-static':
          return await handleBootstrapEnriched(env);
        case '/fixtures/':
        case '/fixtures':
          return json(await fplGet('/fixtures/'));
        case '/api/state':
          return await handleState(env);
        case '/api/news':
          return await handleNews(env, url);
        case '/api/current-alerts':
          return json({
            season: (await healthData(env)).season,
            generatedAt: now(),
            alerts: await currentAlerts(env),
          });
        case '/api/deltas':
          return await handleDeltas(env, url);
        case '/api/price-intelligence':
          return await handlePriceIntelligence(request, env, url);
        case '/api/watchlist':
          return await handleWatchlist(env, url);
        case '/api/health':
        case '/api/metadata':
        case '/health':
          return await handleHealth(env);
        case '/api/sync':
          return await handlePublicSync(request, env);
        case '/api/refresh': {
          if (!adminAuthorised(request, url, env)) {
            return json({ error: 'unauthorised' }, 401, { 'cache-control': 'no-store' });
          }
          return json(await poll(env, { sampleTransfers: true }), 200, { 'cache-control': 'no-store' });
        }
        case '/api/backfill': {
          if (!adminAuthorised(request, url, env)) {
            return json({ error: 'unauthorised' }, 401, { 'cache-control': 'no-store' });
          }
          if (url.searchParams.get('reset') === '1') {
            await env.DB.prepare(
              `INSERT INTO meta (key,value,updated_at) VALUES ('backfill_cursor','0',?1)
               ON CONFLICT(key) DO UPDATE SET value='0', updated_at=?1`
            ).bind(now()).run();
            return json({
              ok: true,
              message: 'Cursor reset to 0. Call again without reset=1 to start.',
            }, 200, { 'cache-control': 'no-store' });
          }
          return json(await backfillHistory(env), 200, { 'cache-control': 'no-store' });
        }
        case '/api/history': {
          const season = previousSeasonName(configuredSeason(env));
          const rows = await env.DB.prepare(
            `SELECT code, web_name, total_points, defcon, minutes, starts
             FROM player_history WHERE season_name = ?1
             ORDER BY total_points DESC LIMIT 800`
          ).bind(season).all();
          return json({ season, count: rows.results.length, players: rows.results });
        }
        default:
          return json({
            service: 'FPL Engine API',
            release: 'RC2.1.4-quota-reliability-repair',
            frontendRoutes: [
              '/bootstrap-static/', '/fixtures/', '/api/news?hours=72',
              '/api/deltas?hours=24', '/api/price-intelligence?hours=24',
              '/api/health', '/api/metadata', '/api/sync',
            ],
            advancedRoutes: [
              '/api/state', '/api/current-alerts', '/api/watchlist?hours=24',
              '/api/history', '/api/refresh (Bearer or x-admin-key)',
              '/api/backfill (Bearer or x-admin-key)',
            ],
          });
      }
    } catch (err) {
      return json({ error: String(err.message || err) }, 500);
    }
  },
};

/**
 * FPL Engine API — Cloudflare Worker
 * RC2.2B Predictive Variance Calibration
 *
 * Preserves the existing state, watchlist, history and backfill APIs while
 * adding the News Intelligence contract required by the RC2.0.1 frontend.
 */

import {
  clubScheduleHealthFromMeta,
  maybeRefreshClubSchedule,
  readClubSchedule,
} from './club-schedule.js';

const FPL = 'https://fantasy.premierleague.com/api';
const UA = 'FPLEngine/2.2B (personal fantasy tool)';

const POS = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
const WORKER_SCHEMA_VERSION = 7;
const DEFAULT_SEASON = '2026/27';
const PUBLIC_SYNC_COOLDOWN_MS = 35 * 60 * 1000;
const PIPELINE_LOCK_TTL_MS = 15 * 60 * 1000;
const BACKFILL_BATCH = 30;
const DEFAULT_PREVIOUS_SEASON = '2025/26';
const PRICE_WINDOWS = [6, 12, 24, 48, 168];
const CHECKPOINT_RETENTION_DAYS = 9;
const EVALUATION_SCHEMA_VERSION = 2;
const EVALUATION_CAPTURE_WINDOW_HOURS = 96;
const EVALUATION_CAPTURE_MIN_COOLDOWN_MS = 20 * 60 * 1000;
const EVALUATION_BASELINE_WINDOW_MS = 35 * 60 * 1000;
const EVALUATION_MIN_PLAYERS = 300;
const EVALUATION_MAX_PLAYERS = 800;

function evaluationCaptureCooldownMs(hoursUntil) {
  if (hoursUntil > 24) return 12 * 3600e3;
  if (hoursUntil > 6) return 6 * 3600e3;
  if (hoursUntil > 2) return 2 * 3600e3;
  return EVALUATION_CAPTURE_MIN_COOLDOWN_MS;
}

const json = (body, status = 200, extra = {}) => {
  const noBody = status === 204 || status === 205 || status === 304;
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization, x-admin-key, x-evaluation-key',
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

function evaluationWriteAuthorised(request, env) {
  const expected=String(env.EVALUATION_KEY||'');
  if(!expected)return {ok:false,configured:false};
  const supplied=String(request.headers.get('x-evaluation-key')||'');
  return {ok:supplied===expected,configured:true};
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


let EVALUATION_SCHEMA_READY = false;

async function ensureEvaluationSchema(env) {
  if (EVALUATION_SCHEMA_READY) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS evaluation_predictions (
       season TEXT NOT NULL,
       gw INTEGER NOT NULL,
       model_version TEXT NOT NULL,
       weights_hash TEXT NOT NULL,
       snapshot_id TEXT NOT NULL,
       formula_revision TEXT,
       player_id INTEGER NOT NULL,
       web_name TEXT NOT NULL,
       team_code TEXT NOT NULL,
       position INTEGER NOT NULL,
       price INTEGER NOT NULL,
       ownership REAL,
       status TEXT,
       chance REAL,
       ep_next REAL,
       current_ppg REAL,
       prior_points REAL,
       prior_minutes REAL,
       prior_starts REAL,
       prior_points_per_start REAL,
       fixture_json TEXT NOT NULL DEFAULT '[]',
       client_source_hash TEXT,
       server_source_hash TEXT,
       xpts REAL,
       low REAL,
       high REAL,
       sd REAL,
       confidence REAL,
       expected_minutes REAL,
       availability REAL,
       capture_source TEXT NOT NULL,
       server_received_at TEXT NOT NULL,
       deadline_time TEXT NOT NULL,
       PRIMARY KEY (season, gw, model_version, weights_hash, player_id)
     )`
  ).run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS evaluation_models (
       season TEXT NOT NULL,
       model_version TEXT NOT NULL,
       weights_hash TEXT NOT NULL,
       formula_revision TEXT NOT NULL,
       config_json TEXT NOT NULL,
       first_seen_at TEXT NOT NULL,
       last_seen_at TEXT NOT NULL,
       PRIMARY KEY (season, model_version, weights_hash)
     )`
  ).run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS evaluation_actuals (
       season TEXT NOT NULL,
       gw INTEGER NOT NULL,
       player_id INTEGER NOT NULL,
       actual_points REAL NOT NULL,
       minutes REAL NOT NULL,
       goals REAL NOT NULL,
       assists REAL NOT NULL,
       clean_sheets REAL NOT NULL,
       goals_conceded REAL NOT NULL,
       saves REAL NOT NULL,
       bonus REAL NOT NULL,
       bps REAL NOT NULL,
       defensive_contribution REAL NOT NULL,
       yellow_cards REAL NOT NULL,
       red_cards REAL NOT NULL,
       captured_at TEXT NOT NULL,
       data_checked INTEGER NOT NULL,
       PRIMARY KEY (season, gw, player_id)
     )`
  ).run();
  EVALUATION_SCHEMA_READY = true;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = stableValue(value[key]);
      return out;
    }, {});
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(stableValue(value));
}

function evaluationFixtureContext(fixtures, teamMap, gw) {
  const out = new Map();
  const add = (code, row) => {
    if (!out.has(code)) out.set(code, []);
    out.get(code).push(row);
  };
  for (const f of fixtures || []) {
    if (num(f.event ?? f.event_id, -1) !== num(gw, -2)) continue;
    const home = f.home_code || teamMap?.[f.team_h];
    const away = f.away_code || teamMap?.[f.team_a];
    if (!home || !away) continue;
    add(home, {
      opponent: away,
      home: true,
      difficulty: num(f.team_h_difficulty ?? f.home_diff, 3),
      kickoff: f.kickoff_time ?? null,
      fixture_id: f.id,
    });
    add(away, {
      opponent: home,
      home: false,
      difficulty: num(f.team_a_difficulty ?? f.away_diff, 3),
      kickoff: f.kickoff_time ?? null,
      fixture_id: f.id,
    });
  }
  return out;
}

function priorPointsPerStart(history) {
  if (!history) return 0;
  const starts = num(history.starts);
  return starts > 0 ? num(history.total_points) / starts : 0;
}

async function acquireEvaluationLock(env, ttlMs = 2 * 60 * 1000) {
  const token = crypto.randomUUID();
  const acquiredAt = now();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  const result = await env.DB.prepare(
    `INSERT INTO meta (key,value,updated_at) VALUES ('evaluation_capture_lock',?1,?2)
     ON CONFLICT(key) DO UPDATE SET value=?1,updated_at=?2
     WHERE meta.updated_at < ?3`
  ).bind(token,expiresAt,acquiredAt).run();
  return num(result?.meta?.changes)>0?token:null;
}

async function releaseEvaluationLock(env, token) {
  if(!token)return;
  await env.DB.prepare("DELETE FROM meta WHERE key='evaluation_capture_lock' AND value=?1").bind(token).run();
}

function evaluationModelUpsert(env, row) {
  return env.DB.prepare(
    `INSERT INTO evaluation_models
       (season,model_version,weights_hash,formula_revision,config_json,first_seen_at,last_seen_at)
     VALUES (?1,?2,?3,?4,?5,?6,?6)
     ON CONFLICT(season,model_version,weights_hash) DO UPDATE SET
       formula_revision=excluded.formula_revision,config_json=excluded.config_json,
       last_seen_at=excluded.last_seen_at`
  ).bind(row.season,row.model_version,row.weights_hash,row.formula_revision,row.config_json,row.at);
}

function evaluationPredictionUpsert(env, row) {
  return env.DB.prepare(
    `INSERT INTO evaluation_predictions (
       season,gw,model_version,weights_hash,snapshot_id,formula_revision,
       player_id,web_name,team_code,position,price,ownership,status,chance,
       ep_next,current_ppg,prior_points,prior_minutes,prior_starts,prior_points_per_start,
       fixture_json,client_source_hash,server_source_hash,xpts,low,high,sd,confidence,
       expected_minutes,availability,capture_source,server_received_at,deadline_time)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29,?30,?31,?32,?33)
     ON CONFLICT(season,gw,model_version,weights_hash,player_id) DO UPDATE SET
       snapshot_id=excluded.snapshot_id,formula_revision=excluded.formula_revision,
       web_name=excluded.web_name,team_code=excluded.team_code,position=excluded.position,
       price=excluded.price,ownership=excluded.ownership,status=excluded.status,chance=excluded.chance,
       ep_next=excluded.ep_next,current_ppg=excluded.current_ppg,
       prior_points=excluded.prior_points,prior_minutes=excluded.prior_minutes,
       prior_starts=excluded.prior_starts,prior_points_per_start=excluded.prior_points_per_start,
       fixture_json=excluded.fixture_json,client_source_hash=excluded.client_source_hash,
       server_source_hash=excluded.server_source_hash,xpts=excluded.xpts,low=excluded.low,
       high=excluded.high,sd=excluded.sd,confidence=excluded.confidence,
       expected_minutes=excluded.expected_minutes,availability=excluded.availability,
       capture_source=excluded.capture_source,server_received_at=excluded.server_received_at,
       deadline_time=excluded.deadline_time`
  ).bind(
    row.season,row.gw,row.model_version,row.weights_hash,row.snapshot_id,row.formula_revision,
    row.player_id,row.web_name,row.team_code,row.position,row.price,row.ownership,row.status,row.chance,
    row.ep_next,row.current_ppg,row.prior_points,row.prior_minutes,row.prior_starts,row.prior_points_per_start,
    row.fixture_json,row.client_source_hash,row.server_source_hash,row.xpts,row.low,row.high,row.sd,row.confidence,
    row.expected_minutes,row.availability,row.capture_source,row.server_received_at,row.deadline_time
  );
}

function evaluationActualUpsert(env, row) {
  return env.DB.prepare(
    `INSERT INTO evaluation_actuals (
       season,gw,player_id,actual_points,minutes,goals,assists,clean_sheets,
       goals_conceded,saves,bonus,bps,defensive_contribution,yellow_cards,red_cards,
       captured_at,data_checked)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17)
     ON CONFLICT(season,gw,player_id) DO UPDATE SET
       actual_points=excluded.actual_points,minutes=excluded.minutes,goals=excluded.goals,
       assists=excluded.assists,clean_sheets=excluded.clean_sheets,
       goals_conceded=excluded.goals_conceded,saves=excluded.saves,bonus=excluded.bonus,
       bps=excluded.bps,defensive_contribution=excluded.defensive_contribution,
       yellow_cards=excluded.yellow_cards,red_cards=excluded.red_cards,
       captured_at=excluded.captured_at,data_checked=excluded.data_checked`
  ).bind(
    row.season,row.gw,row.player_id,row.actual_points,row.minutes,row.goals,row.assists,
    row.clean_sheets,row.goals_conceded,row.saves,row.bonus,row.bps,row.defensive_contribution,
    row.yellow_cards,row.red_cards,row.captured_at,row.data_checked
  );
}

async function captureOfficialBaselineIfDue(env, boot, fixtures, serverHash, timestamp) {
  await ensureEvaluationSchema(env);
  const season = seasonFromBootstrap(boot);
  const event = (boot.events || [])
    .filter((e) => !e.finished && Number.isFinite(Date.parse(e.deadline_time || '')))
    .sort((a, b) => Date.parse(a.deadline_time) - Date.parse(b.deadline_time))[0];
  if (!event) return { ok: true, skipped: true, reason: 'No future deadline' };
  const deadlineMs = Date.parse(event.deadline_time);
  const until = deadlineMs - Date.now();
  if (until <= 0 || until > EVALUATION_BASELINE_WINDOW_MS) {
    return { ok: true, skipped: true, reason: 'Baseline window is not open', gw: event.id };
  }
  const existing = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM evaluation_predictions
     WHERE season=?1 AND gw=?2 AND model_version='BASELINE' AND weights_hash='OFFICIAL'`
  ).bind(season, event.id).first();
  const baselineRequired = Math.max(EVALUATION_MIN_PLAYERS, Math.floor((boot.elements || []).length * .9));
  if (num(existing?.n) >= baselineRequired) {
    return { ok: true, skipped: true, reason: 'Official baseline already captured', gw: event.id };
  }
  const targetSeason = previousSeasonName(season);
  const historyRows = await env.DB.prepare(
    `SELECT api_id,total_points,minutes,starts FROM player_history WHERE season_name=?1`
  ).bind(targetSeason).all();
  const history = new Map(historyRows.results.map((r) => [num(r.api_id), r]));
  const teamMap = Object.fromEntries((boot.teams || []).map((t) => [t.id, t.short_name]));
  const fixtureMap = evaluationFixtureContext(fixtures, teamMap, event.id);
  const snapshotId = crypto.randomUUID();
  const statements = [evaluationModelUpsert(env,{
    season,model_version:'BASELINE',weights_hash:'OFFICIAL',formula_revision:'official-fpl-baselines-v1',
    config_json:JSON.stringify({baselines:['ep_next','current_ppg','prior_points','prior_minutes','prior_starts','prior_points_per_start']}),at:timestamp,
  })];
  for (const e of boot.elements || []) {
    const teamCode = teamMap[e.team];
    if (!teamCode || !Number.isInteger(e.id)) continue;
    statements.push(evaluationPredictionUpsert(env, {
      season,gw:event.id,model_version:'BASELINE',weights_hash:'OFFICIAL',snapshot_id:snapshotId,
      formula_revision:'official-fpl-baselines-v1',player_id:e.id,web_name:e.web_name || '',
      team_code:teamCode,position:num(e.element_type),price:num(e.now_cost),
      ownership:num(e.selected_by_percent),status:e.status || 'a',
      chance:e.chance_of_playing_next_round ?? null,ep_next:num(e.ep_next),
      current_ppg:num(e.points_per_game),prior_points:num(history.get(e.id)?.total_points),
      prior_minutes:num(history.get(e.id)?.minutes),prior_starts:num(history.get(e.id)?.starts),
      prior_points_per_start:priorPointsPerStart(history.get(e.id)),fixture_json:JSON.stringify(fixtureMap.get(teamCode) || []),client_source_hash:'',
      server_source_hash:serverHash || '',xpts:null,low:null,high:null,sd:null,confidence:null,
      expected_minutes:null,availability:null,capture_source:'worker-baseline',
      server_received_at:timestamp,deadline_time:event.deadline_time,
    }));
  }
  for (let i = 0; i < statements.length; i += 80) await env.DB.batch(statements.slice(i, i + 80));
  await env.DB.batch([
    metaUpsert(env,'evaluation_last_baseline_at',timestamp,timestamp),
    metaUpsert(env,'evaluation_last_baseline_gw',event.id,timestamp),
    metaUpsert(env,'evaluation_schema_version',EVALUATION_SCHEMA_VERSION,timestamp),
  ]);
  return { ok: true, captured: Math.max(0,statements.length-1), gw: event.id, snapshotId };
}

async function captureCheckedActuals(env, boot, timestamp) {
  await ensureEvaluationSchema(env);
  const season = seasonFromBootstrap(boot);
  const checked = (boot.events || []).filter((e) => e.finished && e.data_checked).map((e) => e.id);
  if (!checked.length) return { ok: true, skipped: true, reason: 'No checked gameweeks' };
  const existingRows = await env.DB.prepare(
    `SELECT gw,COUNT(*) AS n FROM evaluation_actuals WHERE season=?1 GROUP BY gw`
  ).bind(season).all();
  const required = Math.max(EVALUATION_MIN_PLAYERS,Math.floor((boot.elements||[]).length*.9));
  const complete = new Set(existingRows.results.filter((r)=>num(r.n)>=required).map((r) => num(r.gw)));
  const missing = checked.filter((gw) => !complete.has(gw)).slice(0, 2);
  if (!missing.length) return { ok: true, skipped: true, reason: 'Checked actuals already captured' };
  let captured = 0;
  const gameweeks = [];
  for (const gw of missing) {
    const live = await fplGet(`/event/${gw}/live/`);
    const elements = Array.isArray(live?.elements) ? live.elements : [];
    if (elements.length < EVALUATION_MIN_PLAYERS) throw new Error(`GW${gw} live payload has only ${elements.length} players`);
    const statements = [];
    for (const item of elements) {
      const st = item?.stats || {};
      statements.push(evaluationActualUpsert(env, {
        season,gw,player_id:num(item.id),actual_points:num(st.total_points),minutes:num(st.minutes),
        goals:num(st.goals_scored),assists:num(st.assists),clean_sheets:num(st.clean_sheets),
        goals_conceded:num(st.goals_conceded),saves:num(st.saves),bonus:num(st.bonus),bps:num(st.bps),
        defensive_contribution:num(st.defensive_contribution ?? st.defensive_contributions),
        yellow_cards:num(st.yellow_cards),red_cards:num(st.red_cards),captured_at:timestamp,data_checked:1,
      }));
    }
    for (let i = 0; i < statements.length; i += 80) await env.DB.batch(statements.slice(i, i + 80));
    captured += statements.length;
    gameweeks.push(gw);
    await metaUpsert(env,`evaluation_actual_gw_${gw}`,timestamp,timestamp).run();
  }
  await env.DB.batch([
    metaUpsert(env,'evaluation_last_actual_at',timestamp,timestamp),
    metaUpsert(env,'evaluation_last_actual_gw',Math.max(...gameweeks),timestamp),
    metaUpsert(env,'evaluation_schema_version',EVALUATION_SCHEMA_VERSION,timestamp),
  ]);
  return { ok: true, captured, gameweeks };
}

async function evaluationServerContext(env, gw, season) {
  const targetSeason = previousSeasonName(season);
  const [players, fixtures, meta] = await Promise.all([
    env.DB.prepare(
      `SELECT p.id,p.web_name,p.team_code,p.element_type,p.now_cost,p.selected_by,p.status,
              p.chance_next,p.ep_next,p.points_per_game,
              h.total_points AS prior_points,h.minutes AS prior_minutes,h.starts AS prior_starts
       FROM players p
       LEFT JOIN player_history h ON h.api_id=p.id AND h.season_name=?1
       ORDER BY p.id`
    ).bind(targetSeason).all(),
    env.DB.prepare(
      `SELECT id,event_id,kickoff_time,home_code,away_code,home_diff,away_diff
       FROM fixtures WHERE event_id=?1 ORDER BY kickoff_time,id`
    ).bind(gw).all(),
    env.DB.prepare("SELECT key,value FROM meta WHERE key IN ('data_hash','last_official_fetch')").all(),
  ]);
  const m = Object.fromEntries(meta.results.map((r) => [r.key, r.value]));
  return { players: players.results, fixtures: fixtures.results, meta: m };
}

async function handleEvaluationProjection(request, env) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);
  const allowedOrigin = String(env.EVALUATION_ALLOWED_ORIGIN || env.ALLOWED_ORIGIN || '').trim();
  const origin = request.headers.get('origin') || '';
  if (allowedOrigin && origin !== allowedOrigin) return json({ error: 'origin not allowed' }, 403);
  const evaluationAuth=evaluationWriteAuthorised(request,env);
  if(!evaluationAuth.configured)return json({error:'EVALUATION_KEY is not configured on the Worker'},503);
  if(!evaluationAuth.ok)return json({error:'evaluation capture key is invalid'},401);
  await ensureEvaluationSchema(env);
  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'invalid JSON body' }, 400); }
  const season = String(body?.season || '');
  const expectedSeason = configuredSeason(env);
  const gw = num(body?.gw, NaN);
  const modelVersion = String(body?.modelVersion || '').trim();
  const formulaRevision = String(body?.formulaRevision || '').trim().slice(0, 100);
  const weights = body?.weights;
  const weightsHash = String(body?.weightsHash || '').trim().toLowerCase();
  const clientSourceHash = String(body?.clientSourceHash || '').trim().slice(0, 128);
  const projections = Array.isArray(body?.projections) ? body.projections : [];
  if (season !== expectedSeason) return json({ error: `season ${season || 'missing'} does not match ${expectedSeason}` }, 409);
  if (!Number.isInteger(gw) || gw < 1 || gw > 38) return json({ error: 'invalid gameweek' }, 400);
  if (!/^[A-Za-z0-9._-]{2,60}$/.test(modelVersion)) return json({ error: 'invalid modelVersion' }, 400);
  if (!formulaRevision) return json({ error: 'formulaRevision is required' }, 400);
  if (!weights || typeof weights !== 'object' || Array.isArray(weights)) return json({ error: 'weights object is required' }, 400);
  const computedHash = await sha256(stableJson({ version:modelVersion, formulaRevision, weights }));
  if (weightsHash !== computedHash) return json({ error: 'weightsHash does not match the supplied model configuration' }, 400);
  if (projections.length < EVALUATION_MIN_PLAYERS || projections.length > EVALUATION_MAX_PLAYERS) {
    return json({ error: `projection vector must contain ${EVALUATION_MIN_PLAYERS}-${EVALUATION_MAX_PLAYERS} players` }, 400);
  }
  const ids = new Set();
  const projectionMap = new Map();
  for (const raw of projections) {
    const id = num(raw?.playerId, NaN);
    const xpts = num(raw?.xpts, NaN), low = num(raw?.low, NaN), high = num(raw?.high, NaN);
    const sd = num(raw?.sd, NaN), confidence = num(raw?.confidence, NaN);
    const expectedMinutes = num(raw?.expectedMinutes, NaN), availability = num(raw?.availability, NaN);
    if (!Number.isInteger(id) || ids.has(id)) return json({ error: `duplicate or invalid playerId ${raw?.playerId}` }, 400);
    if (![xpts,low,high,sd,confidence,expectedMinutes,availability].every(Number.isFinite)) return json({ error: `non-finite projection for player ${id}` }, 400);
    if (low > xpts || high < xpts || sd < 0 || confidence < 0 || confidence > 100 || expectedMinutes < 0 || expectedMinutes > 300 || availability < 0 || availability > 1 || xpts < -20 || xpts > 100) {
      return json({ error: `projection bounds are invalid for player ${id}` }, 400);
    }
    ids.add(id);
    projectionMap.set(id,{xpts,low,high,sd,confidence,expectedMinutes,availability});
  }
  let event = await env.DB.prepare('SELECT id,deadline_time FROM events WHERE id=?1').bind(gw).first();
  if (!event?.deadline_time) {
    const boot = await fplGet('/bootstrap-static/');
    event = (boot.events || []).find((e) => e.id === gw) || null;
  }
  const deadlineMs = Date.parse(event?.deadline_time || '');
  if (!Number.isFinite(deadlineMs)) return json({ error: 'deadline is unavailable' }, 503);
  const nowMs = Date.now();
  if (nowMs >= deadlineMs) return json({ error: `GW${gw} projection capture is closed` }, 409);
  const hoursUntil = (deadlineMs - nowMs) / 3600e3;
  if (hoursUntil > EVALUATION_CAPTURE_WINDOW_HOURS) {
    return json({ ok:true, skipped:true, reason:`Capture window opens ${EVALUATION_CAPTURE_WINDOW_HOURS} hours before the deadline`, gw, deadline:event.deadline_time }, 202);
  }
  const evaluationLock=await acquireEvaluationLock(env);
  if(!evaluationLock)return json({error:'Another evaluation capture is already running'},409);
  try {
  const last = await env.DB.prepare(
    `SELECT MAX(server_received_at) AS at FROM evaluation_predictions
     WHERE season=?1 AND gw=?2 AND model_version=?3 AND weights_hash=?4`
  ).bind(season,gw,modelVersion,weightsHash).first();
  const lastMs = Date.parse(last?.at || '');
  const captureCooldownMs=evaluationCaptureCooldownMs(hoursUntil);
  if (Number.isFinite(lastMs) && nowMs - lastMs < captureCooldownMs) {
    const nextEligibleAt=new Date(lastMs+captureCooldownMs).toISOString();
    return json({ ok:true, skipped:true, reason:'This model configuration is already current for this deadline phase', gw, lastCapturedAt:last.at, nextEligibleAt, deadline:event.deadline_time });
  }
  const context = await evaluationServerContext(env,gw,season);
  if (context.players.length < EVALUATION_MIN_PLAYERS) return json({ error:'server player context is incomplete' },503);
  const fixtureMap = evaluationFixtureContext(context.fixtures,null,gw);
  const snapshotId = crypto.randomUUID();
  const receivedAt = now();
  const statements = [evaluationModelUpsert(env,{
    season,model_version:modelVersion,weights_hash:weightsHash,formula_revision:formulaRevision,
    config_json:stableJson(weights),at:receivedAt,
  })];
  let matched = 0;
  for (const p of context.players) {
    const projection = projectionMap.get(num(p.id));
    if (!projection) continue;
    matched++;
    statements.push(evaluationPredictionUpsert(env, {
      season,gw,model_version:modelVersion,weights_hash:weightsHash,snapshot_id:snapshotId,
      formula_revision:formulaRevision,player_id:num(p.id),web_name:p.web_name || '',
      team_code:p.team_code || '?',position:num(p.element_type),price:num(p.now_cost),
      ownership:num(p.selected_by),status:p.status || 'a',chance:p.chance_next ?? null,
      ep_next:num(p.ep_next),current_ppg:num(p.points_per_game),prior_points:num(p.prior_points),
      prior_minutes:num(p.prior_minutes),prior_starts:num(p.prior_starts),
      prior_points_per_start:priorPointsPerStart({total_points:p.prior_points,starts:p.prior_starts}),
      fixture_json:JSON.stringify(fixtureMap.get(p.team_code) || []),
      client_source_hash:clientSourceHash,server_source_hash:context.meta.data_hash || '',
      xpts:projection.xpts,low:projection.low,high:projection.high,sd:projection.sd,
      confidence:projection.confidence,expected_minutes:projection.expectedMinutes,
      availability:projection.availability,capture_source:'frontend',
      server_received_at:receivedAt,deadline_time:event.deadline_time,
    }));
  }
  const required = Math.max(EVALUATION_MIN_PLAYERS,Math.floor(context.players.length*.9));
  if (matched < required) return json({ error:`only ${matched} of ${context.players.length} server players matched the projection vector` },400);
  for (let i=0;i<statements.length;i+=80) await env.DB.batch(statements.slice(i,i+80));
  await env.DB.batch([
    metaUpsert(env,'evaluation_last_projection_at',receivedAt,receivedAt),
    metaUpsert(env,'evaluation_last_projection_gw',gw,receivedAt),
    metaUpsert(env,'evaluation_last_model_version',modelVersion,receivedAt),
    metaUpsert(env,'evaluation_last_weights_hash',weightsHash,receivedAt),
    metaUpsert(env,'evaluation_schema_version',EVALUATION_SCHEMA_VERSION,receivedAt),
  ]);
  return json({ ok:true,captured:matched,season,gw,modelVersion,weightsHash,snapshotId,serverReceivedAt:receivedAt,deadline:event.deadline_time,hoursUntilDeadline:hoursUntil });
  } finally {
    await releaseEvaluationLock(env,evaluationLock).catch(()=>{});
  }
}


function conformalQuantile(values, alpha = 0.2) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 1.2815515655446004;
  const k = Math.ceil((1 - alpha) * (sorted.length + 1));
  return sorted[Math.min(k, sorted.length) - 1];
}

function evaluationCoverageSummary(rows) {
  const groups = { ALL: rows, GK: [], DEF: [], MID: [], FWD: [] };
  for (const row of rows) {
    const pos = POS[num(row.position)] || String(row.position || '?');
    if (groups[pos]) groups[pos].push(row);
  }
  const summarize = (list) => {
    const valid = list.filter((r) => [r.xpts, r.low, r.high, r.sd, r.actual_points].every((v) => Number.isFinite(num(v, NaN))) && num(r.sd) > 0);
    const n = valid.length;
    const gws = new Set(valid.map((r) => num(r.gw))).size;
    const covered = valid.filter((r) => num(r.actual_points) >= num(r.low) && num(r.actual_points) <= num(r.high)).length;
    const below = valid.filter((r) => num(r.actual_points) < num(r.xpts)).map((r) => (num(r.xpts) - num(r.actual_points)) / num(r.sd));
    const above = valid.filter((r) => num(r.actual_points) > num(r.xpts)).map((r) => (num(r.actual_points) - num(r.xpts)) / num(r.sd));
    const mae = n ? valid.reduce((a, r) => a + Math.abs(num(r.actual_points) - num(r.xpts)), 0) / n : null;
    return {
      n,
      gameweeks: gws,
      coverage: n ? covered / n : null,
      mae,
      qLo: conformalQuantile(below, 0.1),
      qHi: conformalQuantile(above, 0.1),
      belowN: below.length,
      aboveN: above.length,
    };
  };
  const pooled = summarize(groups.ALL);
  const positions = Object.fromEntries(['GK', 'DEF', 'MID', 'FWD'].map((p) => [p, summarize(groups[p])]));
  const calibrationReady = pooled.n >= 200 && pooled.gameweeks >= 8;
  return {
    nominalCoverage: 0.8,
    tolerance: [0.75, 0.85],
    calibrationReady,
    calibrationApplied: false,
    reason: calibrationReady ? 'Enough data to review conformal multipliers; RC2.2B does not apply them automatically.' : 'Collect at least 200 player-gameweeks across eight completed gameweeks.',
    pooled,
    positions,
  };
}

async function handleEvaluationCoverage(env, url) {
  await ensureEvaluationSchema(env);
  const season = configuredSeason(env);
  const modelVersion = String(url.searchParams.get('model_version') || '').trim();
  const weightsHash = String(url.searchParams.get('weights_hash') || '').trim().toLowerCase();
  const filters = ["p.season=?1", "p.model_version<>'BASELINE'"];
  const binds = [season];
  if (modelVersion) { filters.push(`p.model_version=?${binds.length + 1}`); binds.push(modelVersion); }
  if (weightsHash) { filters.push(`p.weights_hash=?${binds.length + 1}`); binds.push(weightsHash); }
  const maxGwRow = await env.DB.prepare('SELECT MAX(gw) AS gw FROM evaluation_actuals WHERE season=?1').bind(season).first();
  const maxGw = num(maxGwRow?.gw, 0);
  if (maxGw > 0) { filters.push(`p.gw>=?${binds.length + 1}`); binds.push(Math.max(1, maxGw - 9)); }
  const rows = await env.DB.prepare(
    `SELECT p.gw,p.position,p.price,p.ownership,p.expected_minutes,p.xpts,p.low,p.high,p.sd,a.actual_points
     FROM evaluation_predictions p
     JOIN evaluation_actuals a ON a.season=p.season AND a.gw=p.gw AND a.player_id=p.player_id
     WHERE ${filters.join(' AND ')}
     ORDER BY p.gw,p.position,p.player_id`
  ).bind(...binds).all();
  const all = evaluationCoverageSummary(rows.results);
  const decisionRows = rows.results.filter((r) => num(r.expected_minutes) >= 30 || num(r.ownership) >= 1 || num(r.price) > 45);
  const decision = evaluationCoverageSummary(decisionRows);
  const calibrationReady = decision.pooled.n >= 200 && decision.pooled.gameweeks >= 8 && Object.values(decision.positions).every((z) => z.n >= 40);
  return json({
    season,
    modelVersion: modelVersion || null,
    weightsHash: weightsHash || null,
    generatedAt: now(),
    rollingWindowGameweeks: 10,
    calibrationReady,
    calibrationApplied: false,
    nominalCoverage: 0.8,
    tolerance: [0.75, 0.85],
    reason: calibrationReady ? 'Decision-set coverage is ready for review; RC2.2B does not apply conformal multipliers automatically.' : 'Collect at least 200 decision-set player-gameweeks across eight completed gameweeks, with adequate position coverage.',
    pooled: all.pooled,
    decisionSet: decision.pooled,
    positions: decision.positions,
    schemaVersion: WORKER_SCHEMA_VERSION,
  }, 200, { 'cache-control': 'public, max-age=300' });
}

async function handleEvaluationStatus(env, url) {
  await ensureEvaluationSchema(env);
  const season = configuredSeason(env);
  let gw = num(url.searchParams.get('gw'), NaN);
  if (!Number.isInteger(gw)) {
    const ev = await env.DB.prepare('SELECT id FROM events WHERE is_next=1 ORDER BY id LIMIT 1').first();
    gw = num(ev?.id, 1);
  }
  const modelVersion = String(url.searchParams.get('model_version') || '').trim();
  const weightsHash = String(url.searchParams.get('weights_hash') || '').trim().toLowerCase();
  const event = await env.DB.prepare('SELECT id,deadline_time,finished FROM events WHERE id=?1').bind(gw).first();
  const deadlineMs = Date.parse(event?.deadline_time || '');
  const filters = ['season=?1','gw=?2'];
  const binds = [season,gw];
  if (modelVersion) { filters.push(`model_version=?${binds.length+1}`); binds.push(modelVersion); }
  if (weightsHash) { filters.push(`weights_hash=?${binds.length+1}`); binds.push(weightsHash); }
  const query = `SELECT model_version,weights_hash,snapshot_id,COUNT(*) AS player_count,
                        MAX(server_received_at) AS captured_at,MAX(deadline_time) AS deadline_time,
                        MAX(capture_source) AS capture_source
                 FROM evaluation_predictions WHERE ${filters.join(' AND ')}
                 GROUP BY model_version,weights_hash,snapshot_id
                 ORDER BY captured_at DESC LIMIT 12`;
  const [snapshots,baseline,actual] = await Promise.all([
    env.DB.prepare(query).bind(...binds).all(),
    env.DB.prepare(
      `SELECT model_version,weights_hash,snapshot_id,COUNT(*) AS player_count,
              MAX(server_received_at) AS captured_at,MAX(deadline_time) AS deadline_time,
              MAX(capture_source) AS capture_source
       FROM evaluation_predictions
       WHERE season=?1 AND gw=?2 AND model_version='BASELINE' AND weights_hash='OFFICIAL'
       GROUP BY model_version,weights_hash,snapshot_id
       ORDER BY captured_at DESC LIMIT 1`
    ).bind(season,gw).first(),
    env.DB.prepare(
      `SELECT COUNT(*) AS player_count,MAX(captured_at) AS captured_at
       FROM evaluation_actuals WHERE season=?1 AND gw=?2`
    ).bind(season,gw).first(),
  ]);
  const projection = snapshots.results.find((r) => r.model_version !== 'BASELINE') || null;
  return json({
    season,gw,generatedAt:now(),deadline:event?.deadline_time || null,finished:Boolean(event?.finished),
    captureOpen:Number.isFinite(deadlineMs) && Date.now()<deadlineMs && (deadlineMs-Date.now())<=EVALUATION_CAPTURE_WINDOW_HOURS*3600e3,
    captureClosed:Number.isFinite(deadlineMs) && Date.now()>=deadlineMs,
    baseline,projection,snapshots:snapshots.results,
    actuals:{player_count:num(actual?.player_count),captured_at:actual?.captured_at || null},
    schemaVersion:EVALUATION_SCHEMA_VERSION,
  });
}

async function handleEvaluationExport(request, env, url) {
  if (!adminAuthorised(request,url,env)) return json({error:'unauthorised'},401,{'cache-control':'no-store'});
  await ensureEvaluationSchema(env);
  const season=configuredSeason(env),gw=num(url.searchParams.get('gw'),NaN);
  if(!Number.isInteger(gw)||gw<1||gw>38) return json({error:'valid gw is required'},400,{'cache-control':'no-store'});
  const modelVersion=String(url.searchParams.get('model_version')||'').trim();
  const weightsHash=String(url.searchParams.get('weights_hash')||'').trim();
  const filters=['season=?1','gw=?2']; const binds=[season,gw];
  if(modelVersion){filters.push(`model_version=?${binds.length+1}`);binds.push(modelVersion)}
  if(weightsHash){filters.push(`weights_hash=?${binds.length+1}`);binds.push(weightsHash)}
  const [predictions,actuals,models]=await Promise.all([
    env.DB.prepare(`SELECT * FROM evaluation_predictions WHERE ${filters.join(' AND ')} ORDER BY model_version,weights_hash,player_id`).bind(...binds).all(),
    env.DB.prepare('SELECT * FROM evaluation_actuals WHERE season=?1 AND gw=?2 ORDER BY player_id').bind(season,gw).all(),
    env.DB.prepare('SELECT * FROM evaluation_models WHERE season=?1 ORDER BY model_version,weights_hash').bind(season).all(),
  ]);
  return json({season,gw,models:models.results,predictions:predictions.results,actuals:actuals.results},200,{'cache-control':'no-store'});
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
      let evaluation={baseline:null,actuals:null,error:null};
      try {
        evaluation.baseline=await captureOfficialBaselineIfDue(env,boot,fixtures,hash,startedAt);
        evaluation.actuals=await captureCheckedActuals(env,boot,startedAt);
        await metaUpsert(env,'evaluation_last_error','',startedAt).run();
      } catch(evalErr) {
        evaluation.error=String(evalErr.message||evalErr);
        await metaUpsert(env,'evaluation_last_error',evaluation.error,startedAt).run().catch(()=>{});
      }
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
      return {ok:true,season,seen,fixtures:fixtures.length,changes,dataHash:hash,scheduleChanged,playerWrites,resultWrites,evaluation,ms:Date.now()-t0};
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
  const clubSchedule = clubScheduleHealthFromMeta(m);
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
    evaluationLastProjectionAt: m.evaluation_last_projection_at || null,
    evaluationLastProjectionGw: num(m.evaluation_last_projection_gw, null),
    evaluationLastBaselineAt: m.evaluation_last_baseline_at || null,
    evaluationLastBaselineGw: num(m.evaluation_last_baseline_gw, null),
    evaluationLastActualAt: m.evaluation_last_actual_at || null,
    evaluationLastActualGw: num(m.evaluation_last_actual_gw, null),
    evaluationLastError: m.evaluation_last_error || null,
    evaluationWriteProtected: Boolean(env.EVALUATION_KEY),
    clubSchedule,
  };

  return {
    status,
    service: 'FPL Engine API',
    release: 'v2.24.0-calendar-yield-guard',
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
    clubSchedule,
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

async function handlePublicSync(request, env, ctx) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);

  const allowedOrigin = String(env.ALLOWED_ORIGIN || '').trim();
  const origin = request.headers.get('origin') || '';
  if (allowedOrigin && origin !== allowedOrigin) {
    return json({ error: 'origin not allowed' }, 403);
  }

  ctx.waitUntil(maybeRefreshClubSchedule(env));

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
      ctx.waitUntil(Promise.allSettled([
        poll(env,{sampleTransfers:true}),
        maybeRefreshClubSchedule(env),
      ]).then(() => undefined));
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
        case '/api/club-schedule':
          if (request.method !== 'GET') return json({ error: 'GET required' }, 405);
          return json(await readClubSchedule(env), 200, {
            'cache-control': 'public, max-age=900, stale-while-revalidate=86400',
          });
        case '/api/evaluation/projections':
          return await handleEvaluationProjection(request, env);
        case '/api/evaluation/status':
          return await handleEvaluationStatus(env, url);
        case '/api/evaluation/coverage':
          return await handleEvaluationCoverage(env, url);
        case '/api/evaluation/export':
          return await handleEvaluationExport(request, env, url);
        case '/api/watchlist':
          return await handleWatchlist(env, url);
        case '/api/health':
        case '/api/metadata':
        case '/health':
          return await handleHealth(env);
        case '/api/sync':
          return await handlePublicSync(request, env, ctx);
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
            release: 'v2.24.0-calendar-yield-guard',
            frontendRoutes: [
              '/bootstrap-static/', '/fixtures/', '/api/news?hours=72',
              '/api/deltas?hours=24', '/api/price-intelligence?hours=24',
              '/api/evaluation/status?gw=1', '/api/evaluation/coverage?model_version=…', '/api/evaluation/projections (POST)',
              '/api/club-schedule', '/api/health', '/api/metadata', '/api/sync',
            ],
            advancedRoutes: [
              '/api/state', '/api/current-alerts', '/api/watchlist?hours=24',
              '/api/history', '/api/evaluation/export?gw=1 (Bearer or x-admin-key)',
              '/api/refresh (Bearer or x-admin-key)', '/api/backfill (Bearer or x-admin-key)',
            ],
          });
      }
    } catch (err) {
      return json({ error: String(err.message || err) }, 500);
    }
  },
};

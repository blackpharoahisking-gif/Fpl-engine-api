/**
 * FPL Engine API — Cloudflare Worker 
 *
 * Two jobs:
 *   scheduled()  cron pulls the FPL API, diffs against stored state, logs changes
 *   fetch()      serves that state from your own origin, so the browser has no CORS problem
 *
 * The FPL API is undocumented and unversioned. It changes shape without notice,
 * usually over the summer. Everything below assumes it will break at some point
 * and tries to fail loudly and harmlessly rather than quietly writing nulls
 * over a good dataset.
 */

const FPL = 'https://fantasy.premierleague.com/api';

// FPL blocks some default clients. Identify yourself honestly.
const UA = 'FPLEngine/1.0 (personal fantasy tool; contact: you@example.com)';

const POS = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'cache-control': 'public, max-age=60',
      ...extra,
    },
  });

const now = () => new Date().toISOString();
const num = (v, d = 0) => (v === null || v === undefined || v === '' || Number.isNaN(+v) ? d : +v);

/* ------------------------------------------------------------------ *
 * Fetching                                                            *
 * ------------------------------------------------------------------ */

async function fplGet(path) {
  const res = await fetch(`${FPL}${path}`, {
    headers: { 'user-agent': UA, accept: 'application/json' },
    cf: { cacheTtl: 30, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`FPL ${path} returned ${res.status}`);
  return res.json();
}

/**
 * Guard against silent upstream changes. If the payload does not look like
 * what we expect, we abort the whole poll rather than half-writing it.
 */
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

/* ------------------------------------------------------------------ *
 * Diffing                                                             *
 * ------------------------------------------------------------------ */

const MATERIAL = [
  // [column, incoming value fn, event kind]
  ['now_cost',     (e) => num(e.now_cost),                                        'price'],
  ['status',       (e) => e.status || 'a',                                        'status'],
  ['chance_next',  (e) => (e.chance_of_playing_next_round ?? null),               'chance'],
  ['team_code',    (e, m) => m[e.team] || '?',                                    'team'],
  ['element_type', (e) => num(e.element_type),                                    'position'],
  ['news',         (e) => (e.news || '').trim(),                                  'news'],
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
    // An empty news string clearing is not worth logging on its own.
    if (kind === 'news' && !next) continue;
    out.push({ kind, old_value: before === null ? null : String(before), new_value: next === null ? null : String(next) });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * The poll                                                            *
 * ------------------------------------------------------------------ */

async function poll(env, { sampleTransfers = false } = {}) {
  const t0 = Date.now();
  const startedAt = now();
  let changes = 0;
  let seen = 0;

  try {
    const [boot, fixtures] = await Promise.all([fplGet('/bootstrap-static/'), fplGet('/fixtures/')]);

    const problems = validateBootstrap(boot);
    if (problems.length) throw new Error(`schema guard tripped: ${problems.join(' | ')}`);

    const teamMap = {};
    for (const t of boot.teams) teamMap[t.id] = t.short_name;

    const currentEvent =
      boot.events.find((e) => e.is_current)?.id ?? boot.events.find((e) => e.is_next)?.id ?? null;

    // ---- existing state, for diffing ----
    const prevRows = await env.DB.prepare(
      'SELECT id, now_cost, status, chance_next, team_code, element_type, news FROM players'
    ).all();
    const prev = new Map(prevRows.results.map((r) => [r.id, r]));

    const stmts = [];

    // ---- teams ----
    for (const t of boot.teams) {
      stmts.push(
        env.DB.prepare(
          `INSERT INTO teams (code, fpl_id, name, strength, atk_home, atk_away, def_home, def_away, updated_at)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)
           ON CONFLICT(code) DO UPDATE SET
             name=?3, strength=?4, atk_home=?5, atk_away=?6, def_home=?7, def_away=?8, updated_at=?9`
        ).bind(
          t.short_name, t.id, t.name, num(t.strength, 3),
          num(t.strength_attack_home), num(t.strength_attack_away),
          num(t.strength_defence_home), num(t.strength_defence_away),
          startedAt
        )
      );
    }

    // ---- events ----
    for (const ev of boot.events) {
      stmts.push(
        env.DB.prepare(
          `INSERT INTO events (id, name, deadline_time, finished, is_current, is_next, updated_at)
           VALUES (?1,?2,?3,?4,?5,?6,?7)
           ON CONFLICT(id) DO UPDATE SET
             name=?2, deadline_time=?3, finished=?4, is_current=?5, is_next=?6, updated_at=?7`
        ).bind(ev.id, ev.name, ev.deadline_time, ev.finished ? 1 : 0, ev.is_current ? 1 : 0, ev.is_next ? 1 : 0, startedAt)
      );
    }

    // ---- fixtures ----
    for (const f of fixtures) {
      const h = teamMap[f.team_h], a = teamMap[f.team_a];
      if (!h || !a) continue;
      stmts.push(
        env.DB.prepare(
          `INSERT INTO fixtures (id, event_id, kickoff_time, home_code, away_code, home_diff, away_diff, finished, home_score, away_score, updated_at)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)
           ON CONFLICT(id) DO UPDATE SET
             event_id=?2, kickoff_time=?3, home_diff=?6, away_diff=?7, finished=?8, home_score=?9, away_score=?10, updated_at=?11`
        ).bind(
          f.id, f.event ?? null, f.kickoff_time ?? null, h, a,
          num(f.team_h_difficulty, 3), num(f.team_a_difficulty, 3),
          f.finished ? 1 : 0, f.team_h_score ?? null, f.team_a_score ?? null, startedAt
        )
      );
    }

    // ---- players ----
    for (const e of boot.elements) {
      const code = teamMap[e.team];
      if (!code) continue;
      seen++;

      for (const c of diffPlayer(prev.get(e.id), e, teamMap)) {
        changes++;
        stmts.push(
          env.DB.prepare(
            `INSERT INTO player_events (player_id, web_name, team_code, kind, old_value, new_value, detected_at, event_id)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
          ).bind(e.id, e.web_name, code, c.kind, c.old_value, c.new_value, startedAt, currentEvent)
        );
      }

      stmts.push(
        env.DB.prepare(
          `INSERT INTO players (
             id, web_name, full_name, team_code, element_type, now_cost, cost_change_event, cost_change_start,
             status, chance_next, news, news_added, minutes, starts, total_points, goals, assists,
             clean_sheets, saves, bonus, bps, xg, xa, xgc, dc_per_90, form, points_per_game, ep_next,
             selected_by, transfers_in_event, transfers_out_event, penalties_order, updated_at)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29,?30,?31,?32,?33)
           ON CONFLICT(id) DO UPDATE SET
             web_name=?2, full_name=?3, team_code=?4, element_type=?5, now_cost=?6, cost_change_event=?7,
             cost_change_start=?8, status=?9, chance_next=?10, news=?11, news_added=?12, minutes=?13,
             starts=?14, total_points=?15, goals=?16, assists=?17, clean_sheets=?18, saves=?19, bonus=?20,
             bps=?21, xg=?22, xa=?23, xgc=?24, dc_per_90=?25, form=?26, points_per_game=?27, ep_next=?28,
             selected_by=?29, transfers_in_event=?30, transfers_out_event=?31, penalties_order=?32, updated_at=?33`
        ).bind(
          e.id, e.web_name, `${e.first_name || ''} ${e.second_name || ''}`.trim(), code,
          num(e.element_type), num(e.now_cost), num(e.cost_change_event), num(e.cost_change_start),
          e.status || 'a', e.chance_of_playing_next_round ?? null, (e.news || '').trim(), e.news_added ?? null,
          num(e.minutes), num(e.starts), num(e.total_points), num(e.goals_scored), num(e.assists),
          num(e.clean_sheets), num(e.saves), num(e.bonus), num(e.bps),
          num(e.expected_goals), num(e.expected_assists), num(e.expected_goals_conceded),
          num(e.defensive_contribution_per_90), num(e.form), num(e.points_per_game), num(e.ep_next),
          num(e.selected_by_percent), num(e.transfers_in_event), num(e.transfers_out_event),
          e.penalties_order ?? null, startedAt
        )
      );

      if (sampleTransfers) {
        stmts.push(
          env.DB.prepare(
            `INSERT OR REPLACE INTO transfer_samples (player_id, sampled_at, now_cost, transfers_in_event, transfers_out_event, selected_by)
             VALUES (?1,?2,?3,?4,?5,?6)`
          ).bind(e.id, startedAt, num(e.now_cost), num(e.transfers_in_event), num(e.transfers_out_event), num(e.selected_by_percent))
        );
      }
    }

    // D1 caps how much you can send at once. Chunk it.
    for (let i = 0; i < stmts.length; i += 80) await env.DB.batch(stmts.slice(i, i + 80));

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO meta (key,value,updated_at) VALUES ('last_poll',?1,?1)
                      ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?1`).bind(startedAt),
      env.DB.prepare(`INSERT INTO meta (key,value,updated_at) VALUES ('current_event',?1,?2)
                      ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?2`).bind(String(currentEvent ?? ''), startedAt),
      env.DB.prepare(`INSERT INTO poll_log (started_at, ok, duration_ms, players_seen, changes, error)
                      VALUES (?1,1,?2,?3,?4,NULL)`).bind(startedAt, Date.now() - t0, seen, changes),
    ]);

    return { ok: true, seen, changes, ms: Date.now() - t0 };
  } catch (err) {
    // Never clobber good data because of a bad payload. Log and leave state alone.
    await env.DB.prepare(
      `INSERT INTO poll_log (started_at, ok, duration_ms, players_seen, changes, error) VALUES (?1,0,?2,?3,?4,?5)`
    ).bind(startedAt, Date.now() - t0, seen, changes, String(err.message || err)).run();
    return { ok: false, error: String(err.message || err) };
  }
}

/* ------------------------------------------------------------------ *
 * API                                                                 *
 * ------------------------------------------------------------------ */

async function handleState(env) {
  const [players, teams, fixtures, events, meta] = await Promise.all([
    env.DB.prepare(
      `SELECT id, web_name, full_name, team_code, element_type, now_cost, cost_change_event,
              status, chance_next, news, minutes, starts, total_points, goals, assists,
              clean_sheets, saves, bonus, bps, xg, xa, xgc, dc_per_90, form, points_per_game,
              ep_next, selected_by, transfers_in_event, transfers_out_event, penalties_order
       FROM players ORDER BY total_points DESC`
    ).all(),
    env.DB.prepare('SELECT * FROM teams').all(),
    env.DB.prepare('SELECT * FROM fixtures WHERE event_id IS NOT NULL ORDER BY event_id, kickoff_time').all(),
    env.DB.prepare('SELECT * FROM events ORDER BY id').all(),
    env.DB.prepare("SELECT key, value FROM meta").all(),
  ]);

  const m = Object.fromEntries(meta.results.map((r) => [r.key, r.value]));

  return json({
    updated_at: m.last_poll || null,
    current_event: m.current_event ? +m.current_event : null,
    counts: { players: players.results.length, fixtures: fixtures.results.length },
    teams: teams.results,
    events: events.results,
    // price in tenths, as FPL gives it; the client divides by 10
    players: players.results.map((p) => ({ ...p, pos: POS[p.element_type] })),
    fixtures: fixtures.results,
  });
}

async function handleDeltas(env, url) {
  const hours = Math.min(720, Math.max(1, +(url.searchParams.get('hours') || 24)));
  const kind = url.searchParams.get('kind');
  const since = new Date(Date.now() - hours * 3600e3).toISOString();

  const q = kind
    ? env.DB.prepare(
        `SELECT * FROM player_events WHERE detected_at >= ?1 AND kind = ?2 ORDER BY detected_at DESC LIMIT 500`
      ).bind(since, kind)
    : env.DB.prepare(
        `SELECT * FROM player_events WHERE detected_at >= ?1 ORDER BY detected_at DESC LIMIT 500`
      ).bind(since);

  const rows = await q.all();
  return json({ since, hours, count: rows.results.length, events: rows.results });
}

/**
 * Price-move watchlist. Net transfers since the last sample, per player.
 * This is the thing a stateless client can never compute.
 */
async function handleWatchlist(env, url) {
  const hours = Math.min(48, Math.max(1, +(url.searchParams.get('hours') || 24)));
  const since = new Date(Date.now() - hours * 3600e3).toISOString();

  const rows = await env.DB.prepare(
    `WITH bounds AS (
       SELECT player_id, MIN(sampled_at) AS first_at, MAX(sampled_at) AS last_at
       FROM transfer_samples WHERE sampled_at >= ?1 GROUP BY player_id
     )
     SELECT p.id, p.web_name, p.team_code, p.now_cost, p.selected_by, p.status,
            (b_last.transfers_in_event - b_first.transfers_in_event)   AS in_delta,
            (b_last.transfers_out_event - b_first.transfers_out_event) AS out_delta,
            (b_last.transfers_in_event - b_first.transfers_in_event)
              - (b_last.transfers_out_event - b_first.transfers_out_event) AS net_delta
     FROM bounds
     JOIN transfer_samples b_first ON b_first.player_id = bounds.player_id AND b_first.sampled_at = bounds.first_at
     JOIN transfer_samples b_last  ON b_last.player_id  = bounds.player_id AND b_last.sampled_at  = bounds.last_at
     JOIN players p ON p.id = bounds.player_id
     ORDER BY ABS(net_delta) DESC LIMIT 60`
  ).bind(since).all();

  return json({
    since,
    note: 'net_delta is net transfers over the window. Positive is rise pressure, negative is fall pressure. This is directional evidence, not a threshold model.',
    players: rows.results,
  });
}

async function handleHealth(env) {
  const [last, recent] = await Promise.all([
    env.DB.prepare("SELECT value FROM meta WHERE key='last_poll'").first(),
    env.DB.prepare('SELECT started_at, ok, duration_ms, players_seen, changes, error FROM poll_log ORDER BY id DESC LIMIT 10').all(),
  ]);
  const lastPoll = last?.value || null;
  const ageMin = lastPoll ? Math.round((Date.now() - Date.parse(lastPoll)) / 60000) : null;
  const failing = recent.results.slice(0, 3).every((r) => !r.ok) && recent.results.length >= 3;

  return json(
    {
      status: failing ? 'failing' : ageMin !== null && ageMin > 90 ? 'stale' : 'ok',
      last_poll: lastPoll,
      minutes_since_poll: ageMin,
      recent_polls: recent.results,
    },
    failing ? 500 : 200
  );
}

/* ------------------------------------------------------------------ *
 * Entry points                                                        *
 * ------------------------------------------------------------------ */

export default {
  async scheduled(event, env, ctx) {
    // Sample transfer momentum during the nightly price window and hourly otherwise.
    const h = new Date().getUTCHours();
    const mm = new Date().getUTCMinutes();
    const sampleTransfers = (h >= 0 && h < 3) || mm < 5;
    ctx.waitUntil(poll(env, { sampleTransfers }));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return json({}, 204);

    try {
      switch (url.pathname) {
        case '/bootstrap-static/':
        case '/bootstrap-static':
          return json(await fplGet('/bootstrap-static/'));
        case '/fixtures/':
        case '/fixtures':
          return json(await fplGet('/fixtures/'));
        case '/api/state':     return await handleState(env);
        case '/api/deltas':    return await handleDeltas(env, url);
        case '/api/watchlist': return await handleWatchlist(env, url);
        case '/api/health':    return await handleHealth(env);
        case '/api/refresh': {
          // Manual trigger. Protect it so it is not a free DoS on the FPL API.
          if (url.searchParams.get('key') !== env.ADMIN_KEY) return json({ error: 'unauthorised' }, 401);
          return json(await poll(env, { sampleTransfers: true }));
        }
        default:
          return json({
            service: 'FPL Engine API',
            routes: ['/api/state', '/api/deltas?hours=24&kind=price', '/api/watchlist?hours=24', '/api/health'],
          });
      }
    } catch (err) {
      return json({ error: String(err.message || err) }, 500);
    }
  },
};


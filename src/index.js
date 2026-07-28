/**
 * FPL Engine API — Cloudflare Worker
 * RC2.0.1 merged News Pipeline Repair
 *
 * Preserves the existing state, watchlist, history and backfill APIs while
 * adding the News Intelligence contract required by the RC2.0.1 frontend.
 */

const FPL = 'https://fantasy.premierleague.com/api';
const UA = 'FPLEngine/2.0.1 (personal fantasy tool)';

const POS = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
const WORKER_SCHEMA_VERSION = 2;
const EXPECTED_SEASON = '2026/27';
const PUBLIC_SYNC_COOLDOWN_MS = 10 * 60 * 1000;
const BACKFILL_BATCH = 30;
const TARGET_SEASON = '2025/26';

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'cache-control': 'public, max-age=60',
      ...extra,
    },
  });

const now = () => new Date().toISOString();
const num = (v, d = 0) =>
  v === null || v === undefined || v === '' || Number.isNaN(+v) ? d : +v;

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

function seasonFromBootstrap(boot) {
  const deadlines = (boot?.events || [])
    .map((event) => Date.parse(event?.deadline_time || ''))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (!deadlines.length) return EXPECTED_SEASON;
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

async function fetchPlayerHistory(apiId, code, webName) {
  const data = await fplGet(`/element-summary/${apiId}/`);
  const past = Array.isArray(data?.history_past) ? data.history_past : [];
  if (!past.length) return null;
  const row = past.find((h) => h.season_name === TARGET_SEASON) || past[past.length - 1];
  if (!row) return null;
  return {
    code,
    season_name: row.season_name,
    api_id: apiId,
    web_name: webName,
    total_points: num(row.total_points),
    minutes: num(row.minutes),
    starts: num(row.starts),
    goals: num(row.goals_scored),
    assists: num(row.assists),
    clean_sheets: num(row.clean_sheets),
    goals_conceded: num(row.goals_conceded),
    saves: num(row.saves),
    bonus: num(row.bonus),
    bps: num(row.bps),
    yellow_cards: num(row.yellow_cards),
    red_cards: num(row.red_cards),
    xg: num(row.expected_goals),
    xa: num(row.expected_assists),
    xgc: num(row.expected_goals_conceded),
    defcon: num(row.defensive_contribution ?? row.defensive_contributions),
    start_cost: row.start_cost ?? null,
    end_cost: row.end_cost ?? null,
  };
}

async function backfillHistory(env) {
  const startedAt = now();
  const boot = await fplGet('/bootstrap-static/');
  const problems = validateBootstrap(boot);
  if (problems.length) throw new Error(`schema guard tripped: ${problems.join(' | ')}`);

  const all = boot.elements
    .filter((e) => e.id != null && e.code != null)
    .sort((a, b) => a.id - b.id);

  const cur = await env.DB.prepare("SELECT value FROM meta WHERE key='backfill_cursor'").first();
  const cursor = Math.max(0, num(cur?.value));

  if (cursor >= all.length) {
    const done = await env.DB.prepare(
      'SELECT COUNT(*) AS n FROM player_history WHERE season_name = ?1'
    ).bind(TARGET_SEASON).first();
    return {
      ok: true,
      complete: true,
      stored: num(done?.n),
      total_players: all.length,
      message: 'Backfill already complete. Reset with /api/backfill?key=…&reset=1',
    };
  }

  const slice = all.slice(cursor, cursor + BACKFILL_BATCH);
  const stmts = [];
  let fetched = 0;
  let skipped = 0;

  for (const e of slice) {
    let row = null;
    try {
      row = await fetchPlayerHistory(e.id, e.code, e.web_name);
    } catch {
      skipped++;
      continue;
    }
    if (!row) {
      skipped++;
      continue;
    }
    fetched++;
    stmts.push(
      env.DB.prepare(
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
        row.code,
        row.season_name,
        row.api_id,
        row.web_name,
        row.total_points,
        row.minutes,
        row.starts,
        row.goals,
        row.assists,
        row.clean_sheets,
        row.goals_conceded,
        row.saves,
        row.bonus,
        row.bps,
        row.yellow_cards,
        row.red_cards,
        row.xg,
        row.xa,
        row.xgc,
        row.defcon,
        row.start_cost,
        row.end_cost,
        startedAt
      )
    );
  }

  const nextCursor = cursor + slice.length;
  stmts.push(
    env.DB.prepare(
      `INSERT INTO meta (key,value,updated_at) VALUES ('backfill_cursor',?1,?2)
       ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?2`
    ).bind(String(nextCursor), startedAt)
  );
  for (let i = 0; i < stmts.length; i += 60) {
    await env.DB.batch(stmts.slice(i, i + 60));
  }

  const complete = nextCursor >= all.length;
  return {
    ok: true,
    complete,
    fetched,
    skipped,
    processed: nextCursor,
    total_players: all.length,
    percent: Math.round((nextCursor / all.length) * 100),
    message: complete ? 'Backfill complete.' : `Call this URL again to continue from player ${nextCursor}.`,
  };
}

async function handleBootstrapEnriched(env) {
  const boot = await fplGet('/bootstrap-static/');
  try {
    const rows = await env.DB.prepare(
      `SELECT code, total_points, minutes, starts, goals, assists,
              clean_sheets, bonus, bps, xg, xa, defcon
       FROM player_history WHERE season_name = ?1`
    ).bind(TARGET_SEASON).all();
    const byCode = new Map(rows.results.map((r) => [r.code, r]));
    let matched = 0;
    for (const e of boot.elements) {
      const h = byCode.get(e.code);
      if (!h) continue;
      matched++;
      e.hist_prev = {
        season: TARGET_SEASON,
        total_points: h.total_points,
        minutes: h.minutes,
        starts: h.starts,
        goals: h.goals,
        assists: h.assists,
        clean_sheets: h.clean_sheets,
        bonus: h.bonus,
        bps: h.bps,
        xg: h.xg,
        xa: h.xa,
        defcon: h.defcon,
      };
    }
    boot.hist_meta = { season: TARGET_SEASON, matched, available: rows.results.length };
  } catch (err) {
    boot.hist_meta = {
      season: TARGET_SEASON,
      matched: 0,
      error: String(err.message || err),
    };
  }
  return json(boot);
}

function metaUpsert(env, key, value, timestamp) {
  return env.DB.prepare(
    `INSERT INTO meta (key,value,updated_at) VALUES (?1,?2,?3)
     ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3`
  ).bind(key, String(value ?? ''), timestamp);
}

async function poll(env, { sampleTransfers = false } = {}) {
  const t0 = Date.now();
  const startedAt = now();
  let changes = 0;
  let seen = 0;

  try {
    const [boot, fixtures] = await Promise.all([
      fplGet('/bootstrap-static/'),
      fplGet('/fixtures/'),
    ]);

    const problems = validateBootstrap(boot);
    if (problems.length) throw new Error(`schema guard tripped: ${problems.join(' | ')}`);

    const season = seasonFromBootstrap(boot);
    const hash = await dataHash(boot, fixtures);
    const teamMap = {};
    for (const t of boot.teams) teamMap[t.id] = t.short_name;

    const currentEvent =
      boot.events.find((e) => e.is_current)?.id ??
      boot.events.find((e) => e.is_next)?.id ??
      null;

    const prevRows = await env.DB.prepare(
      'SELECT id, now_cost, status, chance_next, team_code, element_type, news FROM players'
    ).all();
    const prev = new Map(prevRows.results.map((r) => [r.id, r]));
    const stmts = [];

    for (const t of boot.teams) {
      stmts.push(
        env.DB.prepare(
          `INSERT INTO teams (code, fpl_id, name, strength, atk_home, atk_away, def_home, def_away, updated_at)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)
           ON CONFLICT(code) DO UPDATE SET
             fpl_id=?2, name=?3, strength=?4, atk_home=?5, atk_away=?6,
             def_home=?7, def_away=?8, updated_at=?9`
        ).bind(
          t.short_name,
          t.id,
          t.name,
          num(t.strength, 3),
          num(t.strength_attack_home),
          num(t.strength_attack_away),
          num(t.strength_defence_home),
          num(t.strength_defence_away),
          startedAt
        )
      );
    }

    for (const ev of boot.events) {
      stmts.push(
        env.DB.prepare(
          `INSERT INTO events (id, name, deadline_time, finished, is_current, is_next, updated_at)
           VALUES (?1,?2,?3,?4,?5,?6,?7)
           ON CONFLICT(id) DO UPDATE SET
             name=?2, deadline_time=?3, finished=?4, is_current=?5, is_next=?6, updated_at=?7`
        ).bind(
          ev.id,
          ev.name,
          ev.deadline_time,
          ev.finished ? 1 : 0,
          ev.is_current ? 1 : 0,
          ev.is_next ? 1 : 0,
          startedAt
        )
      );
    }

    for (const f of fixtures) {
      const h = teamMap[f.team_h];
      const a = teamMap[f.team_a];
      if (!h || !a) continue;
      stmts.push(
        env.DB.prepare(
          `INSERT INTO fixtures (id, event_id, kickoff_time, home_code, away_code, home_diff, away_diff, finished, home_score, away_score, updated_at)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)
           ON CONFLICT(id) DO UPDATE SET
             event_id=?2, kickoff_time=?3, home_code=?4, away_code=?5,
             home_diff=?6, away_diff=?7, finished=?8, home_score=?9, away_score=?10, updated_at=?11`
        ).bind(
          f.id,
          f.event ?? null,
          f.kickoff_time ?? null,
          h,
          a,
          num(f.team_h_difficulty, 3),
          num(f.team_a_difficulty, 3),
          f.finished ? 1 : 0,
          f.team_h_score ?? null,
          f.team_a_score ?? null,
          startedAt
        )
      );
    }

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
          ).bind(
            e.id,
            e.web_name,
            code,
            c.kind,
            c.old_value,
            c.new_value,
            startedAt,
            currentEvent
          )
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
             web_name=?2, full_name=?3, team_code=?4, element_type=?5, now_cost=?6,
             cost_change_event=?7, cost_change_start=?8, status=?9, chance_next=?10,
             news=?11, news_added=?12, minutes=?13, starts=?14, total_points=?15,
             goals=?16, assists=?17, clean_sheets=?18, saves=?19, bonus=?20,
             bps=?21, xg=?22, xa=?23, xgc=?24, dc_per_90=?25, form=?26,
             points_per_game=?27, ep_next=?28, selected_by=?29, transfers_in_event=?30,
             transfers_out_event=?31, penalties_order=?32, updated_at=?33`
        ).bind(
          e.id,
          e.web_name,
          `${e.first_name || ''} ${e.second_name || ''}`.trim(),
          code,
          num(e.element_type),
          num(e.now_cost),
          num(e.cost_change_event),
          num(e.cost_change_start),
          e.status || 'a',
          e.chance_of_playing_next_round ?? null,
          (e.news || '').trim(),
          e.news_added ?? null,
          num(e.minutes),
          num(e.starts),
          num(e.total_points),
          num(e.goals_scored),
          num(e.assists),
          num(e.clean_sheets),
          num(e.saves),
          num(e.bonus),
          num(e.bps),
          num(e.expected_goals),
          num(e.expected_assists),
          num(e.expected_goals_conceded),
          num(e.defensive_contribution_per_90),
          num(e.form),
          num(e.points_per_game),
          num(e.ep_next),
          num(e.selected_by_percent),
          num(e.transfers_in_event),
          num(e.transfers_out_event),
          e.penalties_order ?? null,
          startedAt
        )
      );

      if (sampleTransfers) {
        stmts.push(
          env.DB.prepare(
            `INSERT OR REPLACE INTO transfer_samples
             (player_id, sampled_at, now_cost, transfers_in_event, transfers_out_event, selected_by)
             VALUES (?1,?2,?3,?4,?5,?6)`
          ).bind(
            e.id,
            startedAt,
            num(e.now_cost),
            num(e.transfers_in_event),
            num(e.transfers_out_event),
            num(e.selected_by_percent)
          )
        );
      }
    }

    for (let i = 0; i < stmts.length; i += 80) {
      await env.DB.batch(stmts.slice(i, i + 80));
    }

    // Remove records that were not present in this successful current payload.
    // This is the critical season-rollover fix for stale players/news/fixtures.
    await env.DB.batch([
      env.DB.prepare('DELETE FROM players WHERE updated_at <> ?1').bind(startedAt),
      env.DB.prepare('DELETE FROM teams WHERE updated_at <> ?1').bind(startedAt),
      env.DB.prepare('DELETE FROM fixtures WHERE updated_at <> ?1').bind(startedAt),
      env.DB.prepare('DELETE FROM events WHERE updated_at <> ?1').bind(startedAt),
    ]);

    await env.DB.batch([
      metaUpsert(env, 'last_poll', startedAt, startedAt),
      metaUpsert(env, 'last_official_fetch', startedAt, startedAt),
      metaUpsert(env, 'current_event', currentEvent ?? '', startedAt),
      metaUpsert(env, 'season', season, startedAt),
      metaUpsert(env, 'schema_version', WORKER_SCHEMA_VERSION, startedAt),
      metaUpsert(env, 'data_hash', hash, startedAt),
      metaUpsert(env, 'bootstrap_players', seen, startedAt),
      metaUpsert(env, 'fixture_count', fixtures.length, startedAt),
      env.DB.prepare(
        `INSERT INTO poll_log (started_at, ok, duration_ms, players_seen, changes, error)
         VALUES (?1,1,?2,?3,?4,NULL)`
      ).bind(startedAt, Date.now() - t0, seen, changes),
    ]);

    return {
      ok: true,
      season,
      seen,
      fixtures: fixtures.length,
      changes,
      dataHash: hash,
      ms: Date.now() - t0,
    };
  } catch (err) {
    try {
      await env.DB.prepare(
        `INSERT INTO poll_log (started_at, ok, duration_ms, players_seen, changes, error)
         VALUES (?1,0,?2,?3,?4,?5)`
      ).bind(startedAt, Date.now() - t0, seen, changes, String(err.message || err)).run();
    } catch {
      // Preserve the original failure when the logging table itself is unavailable.
    }
    return { ok: false, error: String(err.message || err) };
  }
}

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
    env.DB.prepare(
      'SELECT * FROM fixtures WHERE event_id IS NOT NULL ORDER BY event_id, kickoff_time'
    ).all(),
    env.DB.prepare('SELECT * FROM events ORDER BY id').all(),
    env.DB.prepare('SELECT key, value FROM meta').all(),
  ]);

  const m = Object.fromEntries(meta.results.map((r) => [r.key, r.value]));
  return json({
    updated_at: m.last_poll || null,
    current_event: m.current_event ? +m.current_event : null,
    season: m.season || EXPECTED_SEASON,
    schemaVersion: num(m.schema_version, WORKER_SCHEMA_VERSION),
    dataHash: m.data_hash || null,
    counts: { players: players.results.length, fixtures: fixtures.results.length },
    teams: teams.results,
    events: events.results,
    players: players.results.map((p) => ({ ...p, pos: POS[p.element_type] })),
    fixtures: fixtures.results,
  });
}

function seasonWindowStart(season) {
  const year = Number(String(season || EXPECTED_SEASON).slice(0, 4));
  return Number.isFinite(year) ? new Date(Date.UTC(year, 6, 1)).toISOString() : null;
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
    env.DB.prepare('SELECT key, value FROM meta').all(),
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
    recentPolls: recent.results,
  };

  return {
    status,
    service: 'FPL Engine API',
    release: 'RC2.0.1-news-pipeline-merged',
    season: m.season || EXPECTED_SEASON,
    schemaVersion: num(m.schema_version, WORKER_SCHEMA_VERSION),
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

async function handleWatchlist(env, url) {
  const hours = Math.min(48, Math.max(1, +(url.searchParams.get('hours') || 24)));
  const since = new Date(Date.now() - hours * 3600e3).toISOString();

  const rows = await env.DB.prepare(
    `WITH bounds AS (
       SELECT player_id, MIN(sampled_at) AS first_at, MAX(sampled_at) AS last_at
       FROM transfer_samples WHERE sampled_at >= ?1 GROUP BY player_id
     )
     SELECT p.id, p.web_name, p.team_code, p.now_cost, p.selected_by, p.status,
            (b_last.transfers_in_event - b_first.transfers_in_event) AS in_delta,
            (b_last.transfers_out_event - b_first.transfers_out_event) AS out_delta,
            (b_last.transfers_in_event - b_first.transfers_in_event)
              - (b_last.transfers_out_event - b_first.transfers_out_event) AS net_delta
     FROM bounds
     JOIN transfer_samples b_first
       ON b_first.player_id = bounds.player_id AND b_first.sampled_at = bounds.first_at
     JOIN transfer_samples b_last
       ON b_last.player_id = bounds.player_id AND b_last.sampled_at = bounds.last_at
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
  return json(await healthData(env));
}

async function handlePublicSync(request, env) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);

  const allowedOrigin = String(env.ALLOWED_ORIGIN || '').trim();
  const origin = request.headers.get('origin') || '';
  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return json({ error: 'origin not allowed' }, 403);
  }

  const last = await env.DB.prepare("SELECT value FROM meta WHERE key='last_poll'").first();
  const lastMs = Date.parse(last?.value || '');
  if (Number.isFinite(lastMs) && Date.now() - lastMs < PUBLIC_SYNC_COOLDOWN_MS) {
    return json({
      ok: true,
      skipped: true,
      reason: 'A successful poll ran less than ten minutes ago',
      pipeline: (await healthData(env)).pipeline,
    });
  }

  const result = await poll(env, { sampleTransfers: true });
  return json(result, result.ok ? 200 : 502);
}

export default {
  async scheduled(event, env, ctx) {
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
        case '/api/watchlist':
          return await handleWatchlist(env, url);
        case '/api/health':
        case '/api/metadata':
        case '/health':
          return await handleHealth(env);
        case '/api/sync':
          return await handlePublicSync(request, env);
        case '/api/refresh': {
          if (url.searchParams.get('key') !== env.ADMIN_KEY) {
            return json({ error: 'unauthorised' }, 401);
          }
          return json(await poll(env, { sampleTransfers: true }));
        }
        case '/api/backfill': {
          if (url.searchParams.get('key') !== env.ADMIN_KEY) {
            return json({ error: 'unauthorised' }, 401);
          }
          if (url.searchParams.get('reset') === '1') {
            await env.DB.prepare(
              `INSERT INTO meta (key,value,updated_at) VALUES ('backfill_cursor','0',?1)
               ON CONFLICT(key) DO UPDATE SET value='0', updated_at=?1`
            ).bind(now()).run();
            return json({
              ok: true,
              message: 'Cursor reset to 0. Call again without reset=1 to start.',
            });
          }
          return json(await backfillHistory(env));
        }
        case '/api/history': {
          const rows = await env.DB.prepare(
            `SELECT code, web_name, total_points, defcon, minutes, starts
             FROM player_history WHERE season_name = ?1
             ORDER BY total_points DESC LIMIT 800`
          ).bind(TARGET_SEASON).all();
          return json({
            season: TARGET_SEASON,
            count: rows.results.length,
            players: rows.results,
          });
        }
        default:
          return json({
            service: 'FPL Engine API',
            release: 'RC2.0.1-news-pipeline-merged',
            routes: [
              '/bootstrap-static/',
              '/fixtures/',
              '/api/state',
              '/api/news?hours=72',
              '/api/current-alerts',
              '/api/deltas?hours=24&kind=price',
              '/api/watchlist?hours=24',
              '/api/health',
              '/api/metadata',
              '/api/sync',
              '/api/refresh?key=…',
              '/api/backfill?key=…',
              '/api/history',
            ],
          });
      }
    } catch (err) {
      return json({ error: String(err.message || err) }, 500);
    }
  },
};

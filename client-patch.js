/* ==========================================================================
   FPL Engine — client patch
   Paste this at the very END of the <script> block in your RC4 HTML file.
   It replaces the paste-JSON workflow with a live fetch from your own Worker.

   Your existing applyBootstrap() is untouched and still works — this adapts
   the API response back into bootstrap-static shape and hands it over, so
   the model, optimiser and ticker need no changes at all.
   ========================================================================== */

const API_BASE = 'https://fpl-engine-api.YOUR-SUBDOMAIN.workers.dev';

/** API rows use tenths for cost, same as FPL. Rebuild the shape applyBootstrap expects. */
function apiToBootstrap(state) {
  const teamIdByCode = {};
  const teams = state.teams.map((t, i) => {
    teamIdByCode[t.code] = t.fpl_id ?? i + 1;
    return {
      id: t.fpl_id ?? i + 1,
      short_name: t.code,
      name: t.name,
      strength: t.strength,
      strength_attack_home: t.atk_home,
      strength_attack_away: t.atk_away,
      strength_defence_home: t.def_home,
      strength_defence_away: t.def_away,
    };
  });

  const elements = state.players.map((p) => ({
    id: p.id,
    web_name: p.web_name,
    team: teamIdByCode[p.team_code],
    element_type: p.element_type,
    now_cost: p.now_cost,
    status: p.status,
    news: p.news,
    chance_of_playing_next_round: p.chance_next,
    minutes: p.minutes,
    starts: p.starts,
    total_points: p.total_points,
    goals_scored: p.goals,
    assists: p.assists,
    clean_sheets: p.clean_sheets,
    saves: p.saves,
    bonus: p.bonus,
    bps: p.bps,
    expected_goals: p.xg,
    expected_assists: p.xa,
    expected_goals_conceded: p.xgc,
    defensive_contribution_per_90: p.dc_per_90,
    form: p.form,
    points_per_game: p.points_per_game,
    ep_next: p.ep_next,
    selected_by_percent: p.selected_by,
    penalties_order: p.penalties_order,
  }));

  const events = state.events.map((e) => ({
    id: e.id,
    name: e.name,
    deadline_time: e.deadline_time,
    finished: !!e.finished,
    is_current: !!e.is_current,
    is_next: !!e.is_next,
  }));

  return { elements, teams, events };
}

/** Overlay real fixtures from the API onto the hard-coded FIX table. */
function applyApiFixtures(state) {
  if (!state.fixtures?.length) return 0;
  const next = {};
  for (const f of state.fixtures) {
    if (!f.event_id) continue;
    (next[f.event_id] ||= []).push([f.home_code, f.away_code]);
  }
  let n = 0;
  for (const gw in next) {
    if (next[gw].length) { FIX[gw] = next[gw]; n += next[gw].length; }
  }
  return n;
}

async function syncFromApi({ quiet = false } = {}) {
  const msg = document.getElementById('importMsg');
  const say = (html) => { if (msg && !quiet) msg.innerHTML = html; };
  try {
    say('<b style="color:var(--cyan)">Syncing…</b>');
    const res = await fetch(`${API_BASE}/api/state`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const state = await res.json();

    const fixCount = applyApiFixtures(state);
    applyBootstrap(apiToBootstrap(state));

    const age = state.updated_at
      ? Math.round((Date.now() - Date.parse(state.updated_at)) / 60000)
      : null;

    // Flag anyone in your squad who is now doubtful or worse.
    const flagged = squadPlayers().filter((p) => {
      const l = p.live || {};
      return (l.status && l.status !== 'a') || (l.chance != null && l.chance < 100);
    });

    say(
      `<b style="color:var(--mint)">Synced.</b> ${state.counts.players} players, ${fixCount} fixtures. ` +
      `Data is ${age === null ? 'of unknown age' : age + ' min old'}.` +
      (flagged.length
        ? `<br><b style="color:#FF6E9E">Squad flags:</b> ${flagged.map((p) => `${p.n} (${p.live.status}${p.live.chance != null ? ' ' + p.live.chance + '%' : ''})`).join(', ')}`
        : '<br>No availability flags in your squad.')
    );
    if (age !== null && age > 90) {
      say(msg.innerHTML + `<br><b style="color:#FF6E9E">Warning:</b> feed looks stale. Check /api/health.`);
    }
    return state;
  } catch (err) {
    say(`<b style="color:#FF6E9E">Sync failed:</b> ${err.message}. Falling back to the paste box below.`);
    return null;
  }
}

/** Recent price moves and injury news, for the Data tab. */
async function loadDeltas(hours = 48) {
  try {
    const res = await fetch(`${API_BASE}/api/deltas?hours=${hours}`);
    const d = await res.json();
    const label = { price: 'PRICE', status: 'STATUS', chance: 'ODDS', team: 'TRANSFER', position: 'POSITION', news: 'NEWS' };
    const colour = { price: 'var(--cyan)', status: '#FF6E9E', chance: '#FF6E9E', team: 'var(--mint)', position: 'var(--mint)', news: 'var(--muted)' };
    const rows = d.events.slice(0, 40).map((e) => {
      const v = e.kind === 'price'
        ? `£${(e.old_value / 10).toFixed(1)} → £${(e.new_value / 10).toFixed(1)}`
        : `${e.old_value || '—'} → ${e.new_value || '—'}`;
      return `<div class="lrow"><span style="font-size:11px">
                <b style="color:${colour[e.kind] || 'var(--paper)'};font-size:9px">${label[e.kind] || e.kind}</b>
                ${e.web_name} <span style="color:var(--muted)">${e.team_code}</span></span>
              <span class="mono" style="font-size:10px">${v}</span></div>`;
    }).join('');
    return rows || '<div class="help">Nothing has changed in that window.</div>';
  } catch (err) {
    return `<div class="help">Could not load changes: ${err.message}</div>`;
  }
}

// Sync on load, then quietly every 10 minutes while the tab is open.
window.addEventListener('load', () => {
  syncFromApi();
  setInterval(() => syncFromApi({ quiet: true }), 10 * 60 * 1000);
});

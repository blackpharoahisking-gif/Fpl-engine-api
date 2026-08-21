const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const EMPTY_RETRY_INTERVAL_MS = 30 * 60 * 1000;
/* lastAttempt is stamped when a refresh FINISHES, so a run taking ten seconds
   pushes the next eligible moment ten seconds past the cron boundary and the
   tick at exactly the interval is skipped -- a 6-hour cadence silently becomes
   6.5. Observed twice on 20 Aug: a 14:00:10 stamp made the 20:00 tick a no-op.
   A small grace lets the tick that was meant to fire, fire. */
const REFRESH_GRACE_MS = 2 * 60 * 1000;
const SOURCE_LOOKBACK_DAYS = 21;
const FETCH_LIMIT_BYTES = 12 * 1024 * 1024;
const FA_CUP_MAX_PAGES = 12;
const SOURCE_UA = 'OTB-FPL-Engine/2.23 (official fixture calendar)';
/* Team types that are genuinely not the senior men's first team. This is a
   BLOCKLIST on purpose. The previous allowlist accepted only the exact string
   'DOMESTIC_MEN_TEAM_A', so any label UEFA uses for a qualifying/playoff-round
   entrant silently dropped a real first-team tie -- and because a zero-row
   parse still counted as a successful fetch, nothing anywhere reported it. */
const NON_SENIOR_TEAM_TYPE_RE = /WOMEN|GIRLS|LADIES|YOUTH|JUNIOR|ACADEMY|RESERVE|AMATEUR|FUTSAL|_U\d{2}/i;

export const CLUB_SCHEDULE_SOURCES = Object.freeze({
  ucl: 'https://www.uefa.com/uefachampionsleague/fixtures-results/',
  uel: 'https://www.uefa.com/uefaeuropaleague/fixtures-results/',
  uecl: 'https://www.uefa.com/uefaconferenceleague/fixtures-results/',
  eflCup: 'https://www.efl.com/competitions/carabao-cup/',
  faCup: 'https://www.thefa.com/competitions/thefacup/fixtures',
});

/* `id` is a FALLBACK only. Telemetry on 21 Aug showed competitionId 1 returning
   34 matches while 3 and 2032 returned empty payloads at BOTH candidate season
   years -- so the season year is exonerated and these two identifiers are
   simply wrong or have moved. Rather than guess replacements, ask UEFA which
   ids exist and match on name; `match` is how a discovered competition is
   recognised. Discovery failing leaves the fallback id in place, so the worst
   case is exactly today's behaviour. */
const UEFA_COMPETITIONS = Object.freeze([
  { id: '1', name: 'UEFA Champions League', source: CLUB_SCHEDULE_SOURCES.ucl, match: /champions/ },
  { id: '3', name: 'UEFA Europa League', source: CLUB_SCHEDULE_SOURCES.uel, match: /europa/, exclude: /conference/ },
  { id: '2032', name: 'UEFA Conference League', source: CLUB_SCHEDULE_SOURCES.uecl, match: /conference/ },
]);

const CLUB_ALIASES = Object.freeze({
  arsenal: 'ARS',
  astonvilla: 'AVL',
  bournemouth: 'BOU',
  afcbournemouth: 'BOU',
  brentford: 'BRE',
  brighton: 'BHA',
  brightonandhovealbion: 'BHA',
  chelsea: 'CHE',
  coventrycity: 'COV',
  crystalpalace: 'CRY',
  everton: 'EVE',
  fulham: 'FUL',
  hullcity: 'HUL',
  ipswichtown: 'IPS',
  leeds: 'LEE',
  leedsunited: 'LEE',
  liverpool: 'LIV',
  mancity: 'MCI',
  manchestercity: 'MCI',
  manunited: 'MUN',
  manutd: 'MUN',
  manchesterunited: 'MUN',
  newcastle: 'NEW',
  newcastleunited: 'NEW',
  nottmforest: 'NFO',
  nottinghamforest: 'NFO',
  spurs: 'TOT',
  tottenham: 'TOT',
  tottenhamhotspur: 'TOT',
  sunderland: 'SUN',
});

function text(value) {
  return String(value ?? '').trim();
}

export function normalizeClubName(value) {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(?:association football club|football club|afc|fc)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '');
}

function normalizedIdentity(value) {
  return text(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function buildTeamIndex(teams) {
  const codes = new Set();
  const byName = new Map();
  for (const team of Array.isArray(teams) ? teams : []) {
    const code = text(team?.code).toUpperCase();
    if (!/^[A-Z]{2,4}$/.test(code)) continue;
    codes.add(code);
    const names = [team?.name, team?.short_name, team?.officialName, code];
    for (const name of names) {
      const key = normalizeClubName(name);
      if (key) byName.set(key, code);
    }
  }
  for (const [name, code] of Object.entries(CLUB_ALIASES)) {
    if (codes.has(code)) byName.set(name, code);
  }
  return { codes, byName };
}

export function resolveTeamCode(index, value) {
  const raw = text(value);
  const code = raw.toUpperCase();
  if (index?.codes?.has(code)) return code;
  return index?.byName?.get(normalizeClubName(raw)) || null;
}

export function hasExcludedSquadMarker(...values) {
  const joined = values.map(text).join(' ');
  return /\b(?:women(?:'s)?|ladies|girls|academy|reserves?|development squad|premier league 2|b team|under[ -]?(?:18|19|20|21|23)|u(?:18|19|20|21|23))\b/i.test(joined);
}

function fixtureKey(row) {
  return [
    row.team,
    Date.parse(row.kickoff),
    normalizedIdentity(row.opponent),
    normalizedIdentity(row.competition),
  ].join('|');
}

function validIso(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function sanitizeFixture(row) {
  const team = text(row?.team).toUpperCase();
  const kickoff = validIso(row?.kickoff);
  const competition = text(row?.competition).slice(0, 80);
  const opponent = text(row?.opponent).slice(0, 80);
  const source = text(row?.source).slice(0, 220);
  const updatedAt = validIso(row?.updatedAt);
  if (!/^[A-Z]{2,4}$/.test(team) || !kickoff || !competition || !opponent || !source || !updatedAt) return null;
  if (row?.confirmed !== true || hasExcludedSquadMarker(competition, opponent)) return null;
  return { team, kickoff, competition, opponent, home: row?.home === true, confirmed: true, source, updatedAt };
}

export function dedupeFixtures(fixtures) {
  const rows = new Map();
  for (const raw of Array.isArray(fixtures) ? fixtures : []) {
    const row = sanitizeFixture(raw);
    if (!row) continue;
    const key = fixtureKey(row);
    const previous = rows.get(key);
    if (!previous || Date.parse(row.updatedAt) >= Date.parse(previous.updatedAt)) rows.set(key, row);
  }
  return [...rows.values()].sort((a, b) =>
    Date.parse(a.kickoff) - Date.parse(b.kickoff) || a.team.localeCompare(b.team) || a.opponent.localeCompare(b.opponent)
  );
}

function sourceWindow(season, nowMs) {
  const configuredYear = Number(text(season).slice(0, 4));
  const current = new Date(nowMs);
  const fallbackYear = current.getUTCMonth() >= 6 ? current.getUTCFullYear() : current.getUTCFullYear() - 1;
  const year = Number.isInteger(configuredYear) && configuredYear >= 2020 ? configuredYear : fallbackYear;
  const seasonStart = Date.UTC(year, 6, 1);
  const from = Math.max(seasonStart, nowMs - SOURCE_LOOKBACK_DAYS * 86400e3);
  const to = Date.UTC(year + 1, 5, 30, 23, 59, 59);
  return { year, from, to, fromDate: isoDate(from), toDate: isoDate(to) };
}

function isoDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function sourceResult(source, ok, fixtures = [], error = '', detail = null) {
  const rows = ok ? dedupeFixtures(fixtures) : [];
  return { source, ok, fixtures: rows, error: text(error), yielded: rows.length, detail: detail || null };
}

function addClubMatch(out, index, details) {
  const homeName = text(details.homeName);
  const awayName = text(details.awayName);
  const competition = text(details.competition);
  if (!homeName || !awayName || !competition || hasExcludedSquadMarker(homeName, awayName, competition)) return;
  const kickoff = validIso(details.kickoff);
  if (!kickoff) return;
  const homeCode = resolveTeamCode(index, homeName);
  const awayCode = resolveTeamCode(index, awayName);
  const common = {
    kickoff,
    competition,
    confirmed: true,
    source: details.source,
    updatedAt: details.updatedAt,
  };
  if (homeCode) out.push({ ...common, team: homeCode, opponent: awayName, home: true });
  if (awayCode) out.push({ ...common, team: awayCode, opponent: homeName, home: false });
}

function teamName(team) {
  return text(
    team?.internationalName ||
    team?.translations?.displayName?.EN ||
    team?.translations?.shortName?.EN ||
    team?.teamCode
  );
}

function isSeniorMensUefaMatch(match, index = null) {
  const competition = match?.competition || {};
  const home = match?.homeTeam || {};
  const away = match?.awayTeam || {};
  if (competition.sex && competition.sex !== 'MALE') return false;
  if (competition.age && competition.age !== 'ADULT') return false;
  // No placeholder veto. A placeholder ('Winner of Q3') carries no usable
  // identity, but it cannot contribute a row anyway -- addClubMatch only
  // records a side whose name resolves to a tracked club. Vetoing the whole
  // match on either side's flag threw away the OTHER side's real fixture,
  // which is how an unresolved opponent could erase a Premier League club's
  // European date from the congestion calendar entirely.
  if (NON_SENIOR_TEAM_TYPE_RE.test(text(home.teamTypeDetail))) return false;
  if (NON_SENIOR_TEAM_TYPE_RE.test(text(away.teamTypeDetail))) return false;
  return !hasExcludedSquadMarker(teamName(home), teamName(away));
}

/* The request is already scoped to one competitionId, so re-checking the
   payload is only a sanity guard. Treat a related identifier (a qualifying or
   playoff-round variant that shares a prefix with the league-phase id) as the
   same competition: losing a real European tie from the congestion calendar is
   far more damaging than labelling one with the parent competition's name. */
function uefaCompetitionMatches(payloadId, definitionId) {
  const a = text(payloadId);
  const b = text(definitionId);
  if (!a || !b) return true;
  return a === b || a.startsWith(b) || b.startsWith(a);
}

export function parseUefaMatches(payload, teams, definition, updatedAt, stats = null) {
  if (!Array.isArray(payload)) throw new Error('UEFA payload was not an array');
  const index = buildTeamIndex(teams);
  const out = [];
  const drop = { total: payload.length, competition: 0, status: 0, nonSenior: 0, noTrackedClub: 0 };
  const rejectedStatuses = new Set(['CANCELLED', 'CANCELED', 'POSTPONED', 'SUSPENDED', 'ABANDONED']);
  for (const match of payload) {
    if (!uefaCompetitionMatches(match?.competition?.id, definition?.id)) { drop.competition += 1; continue; }
    if (rejectedStatuses.has(text(match?.status).toUpperCase())) { drop.status += 1; continue; }
    if (!isSeniorMensUefaMatch(match, index)) { drop.nonSenior += 1; continue; }
    const before = out.length;
    addClubMatch(out, index, {
      homeName: teamName(match.homeTeam),
      awayName: teamName(match.awayTeam),
      kickoff: match?.kickOffTime?.dateTime,
      competition: definition.name,
      source: definition.source,
      updatedAt,
    });
    if (out.length === before) drop.noTrackedClub += 1;
  }
  const rows = dedupeFixtures(out);
  // Why-was-it-empty telemetry. A silently empty parse is the exact failure
  // that hid a live Conference League playoff from the congestion model, so
  // the reason a row was dropped has to survive into the health surface.
  if (stats && typeof stats === 'object') Object.assign(stats, { ...drop, kept: rows.length });
  return rows;
}

function utcTimestamp(value) {
  const raw = text(value);
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) return validIso(`${raw.replace(' ', 'T')}Z`);
  return validIso(raw);
}

export function parseEflMatches(payload, teams, updatedAt) {
  if (!payload || !Array.isArray(payload.data)) throw new Error('EFL payload did not contain a data array');
  const index = buildTeamIndex(teams);
  const out = [];
  for (const item of payload.data) {
    const match = item?.attributes || {};
    const tbc = Array.isArray(match.TBC) ? match.TBC.filter(Boolean).join(',') : text(match.TBC);
    const period = text(match.matchPeriod).toUpperCase();
    if (tbc || match.postponementReason || /POSTPON|CANCEL|ABANDON|SUSPEND/.test(period)) continue;
    addClubMatch(out, index, {
      homeName: match?.homeTeam?.officialName || match?.homeTeam?.name,
      awayName: match?.awayTeam?.officialName || match?.awayTeam?.name,
      kickoff: utcTimestamp(match.kickOffDateUTC || match.kickOffUTC),
      competition: 'Carabao Cup',
      source: CLUB_SCHEDULE_SOURCES.eflCup,
      updatedAt,
    });
  }
  return dedupeFixtures(out);
}

function decodeHtml(value) {
  return text(value)
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

function tableCell(row, className) {
  const pattern = new RegExp(`<td[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/td>`, 'i');
  return decodeHtml(row.match(pattern)?.[1] || '');
}

function englishDateParts(value) {
  const months = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };
  const match = text(value).match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
  if (!match) return null;
  const month = months[match[2].toLowerCase()];
  if (!Number.isInteger(month)) return null;
  return { year: Number(match[3]), month, day: Number(match[1]) };
}

function lastSunday(year, month) {
  const last = new Date(Date.UTC(year, month + 1, 0));
  return last.getUTCDate() - last.getUTCDay();
}

function londonOffsetMinutes(year, month, day, hour) {
  const local = Date.UTC(year, month, day, hour);
  const bstStart = Date.UTC(year, 2, lastSunday(year, 2), 2);
  const bstEnd = Date.UTC(year, 9, lastSunday(year, 9), 2);
  return local >= bstStart && local < bstEnd ? 60 : 0;
}

function faKickoff(dateLabel, timeLabel) {
  const date = englishDateParts(dateLabel);
  const clock = text(timeLabel).match(/(\d{1,2}):(\d{2})/);
  if (!date || !clock || /TBC/i.test(timeLabel)) return null;
  const hour = Number(clock[1]);
  const minute = Number(clock[2]);
  const offset = londonOffsetMinutes(date.year, date.month, date.day, hour);
  return new Date(Date.UTC(date.year, date.month, date.day, hour, minute) - offset * 60000).toISOString();
}

export function parseFaCupHtml(html, teams, updatedAt) {
  if (!/mod-FACup-fixtures/i.test(text(html))) throw new Error('FA Cup fixture marker was missing');
  const index = buildTeamIndex(teams);
  const out = [];
  const tables = [...text(html).matchAll(/<table[^>]*class=["'][^"']*gTable[^"']*["'][^>]*>([\s\S]*?)<\/table>/gi)];
  for (const tableMatch of tables) {
    const table = tableMatch[1];
    const dateLabel = decodeHtml(table.match(/<td[^>]*class=["'][^"']*headl[^"']*["'][^>]*>([\s\S]*?)<\/td>/i)?.[1] || '');
    const rows = [...table.matchAll(/<tr[^>]*class=["'](?:even|odd)["'][^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const rowMatch of rows) {
      const row = rowMatch[1];
      addClubMatch(out, index, {
        homeName: tableCell(row, 'cThree'),
        awayName: tableCell(row, 'cFive'),
        kickoff: faKickoff(dateLabel, tableCell(row, 'cOne')),
        competition: 'FA Cup',
        source: CLUB_SCHEDULE_SOURCES.faCup,
        updatedAt,
      });
    }
  }
  return dedupeFixtures(out);
}

async function fetchText(fetchFn, url, init = {}) {
  const headers = {
    'user-agent': SOURCE_UA,
    accept: init.accept || 'text/html,application/xhtml+xml',
    ...(init.headers || {}),
  };
  const response = await fetchFn(url, { headers, cf: { cacheTtl: 900, cacheEverything: true } });
  if (!response.ok) throw new Error(`${new URL(url).hostname} returned ${response.status}`);
  const length = Number(response.headers.get('content-length') || 0);
  if (length > FETCH_LIMIT_BYTES) throw new Error(`${new URL(url).hostname} response exceeded the size limit`);
  const body = await response.text();
  if (body.length > FETCH_LIMIT_BYTES) throw new Error(`${new URL(url).hostname} response exceeded the size limit`);
  return body;
}

async function fetchJson(fetchFn, url, init = {}) {
  const body = await fetchText(fetchFn, url, { ...init, accept: 'application/json' });
  try { return JSON.parse(body); }
  catch { throw new Error(`${new URL(url).hostname} returned invalid JSON`); }
}

function uefaConfig(html) {
  const apiKey = text(html.match(/window\.apiKey\s*=\s*['"]([^'"]+)['"]/i)?.[1]);
  const seasonYear = Number(html.match(/window\.currentSeason\s*=\s*(\d{4})/i)?.[1]);
  if (!apiKey || !Number.isInteger(seasonYear)) throw new Error('UEFA public fixture configuration was incomplete');
  return { apiKey, seasonYear };
}

/* The apiKey and, crucially, the season year were read from the CHAMPIONS
   LEAGUE page and then reused for all three competitions. Each competition
   publishes its own configuration, so read each one's own page and keep the
   Champions League values only as a fallback. */
async function uefaConfigFor(fetchFn, definition, fallback) {
  try {
    return { ...uefaConfig(await fetchText(fetchFn, definition.source)), configSource: 'own-page' };
  } catch (error) {
    if (!fallback) throw error;
    return { ...fallback, configSource: 'ucl-fallback' };
  }
}

/** Authoritative competition ids straight from UEFA, keyed by lowercased name. */
export async function uefaCompetitionIndex(fetchFn, config) {
  /* Competitions live on a DIFFERENT HOST from matches. The first attempt used
     match.uefa.com/v5/competitions and got a clean 404, which the fail-safe
     absorbed into the hardcoded ids. The real path was read out of the
     published `uefa-api` package rather than guessed:
       apiMatches      https://match.uefa.com/v5/matches
       apiCompetitions https://comp.uefa.com/v2/competitions
     That package sends no api key and no seasonYear to this endpoint, so
     neither does this -- the call is matched to a working implementation
     instead of assumed. */
  void config;
  const url = new URL('https://comp.uefa.com/v2/competitions');
  const payload = await fetchJson(fetchFn, url.toString());
  const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.competitions) ? payload.competitions : []);
  const index = [];
  for (const row of rows) {
    const id = text(row?.id ?? row?.competitionId);
    const name = text(row?.displayName || row?.name || row?.internationalName || row?.translations?.name).toLowerCase();
    if (id && name) index.push({ id, name });
  }
  return index;
}

export function resolveUefaCompetitionId(index, definition) {
  for (const row of index || []) {
    if (!definition.match?.test(row.name)) continue;
    if (definition.exclude?.test(row.name)) continue;
    return row.id;
  }
  return null;
}

async function fetchUefaMatches(fetchFn, definition, config, window, seasonYear) {
  const url = new URL('https://match.uefa.com/v5/matches');
  url.searchParams.set('competitionId', definition.id);
  url.searchParams.set('seasonYear', String(seasonYear));
  url.searchParams.set('offset', '0');
  url.searchParams.set('limit', '500');
  url.searchParams.set('order', 'ASC');
  url.searchParams.set('fromDate', window.fromDate);
  url.searchParams.set('toDate', window.toDate);
  return fetchJson(fetchFn, url.toString(), { headers: { 'x-api-key': config.apiKey } });
}

export async function loadUefaSources(fetchFn, teams, window, updatedAt) {
  let baseConfig = null;
  let baseError = null;
  try {
    baseConfig = uefaConfig(await fetchText(fetchFn, CLUB_SCHEDULE_SOURCES.ucl));
  } catch (error) {
    baseError = error;
  }
  /* One lookup for the whole refresh, best-effort: a failure here must not
     stop three competitions from being fetched with their fallback ids. */
  let competitionIndex = [];
  let competitionIndexError = null;
  if (baseConfig) {
    try { competitionIndex = await uefaCompetitionIndex(fetchFn, baseConfig); }
    catch (error) { competitionIndexError = error?.message || String(error); }
  }
  return Promise.all(UEFA_COMPETITIONS.map(async (definition) => {
    try {
      const config = await uefaConfigFor(fetchFn, definition, baseConfig);
      const discoveredId = resolveUefaCompetitionId(competitionIndex, definition);
      const active = { ...definition, id: discoveredId || definition.id };
      let seasonYear = config.seasonYear;
      let payload = await fetchUefaMatches(fetchFn, active, config, window, seasonYear);
      let seasonYearRetried = null;
      /* An empty payload from a season-scoped sports API is far more often an
         off-by-one season year than a competition with no matches. The
         Conference League returned zero rows on 20 Aug 2026 while Brighton
         were playing in it, so try the adjacent year once before believing an
         emptiness. Bounded to a single extra request, and which year actually
         answered is recorded below. */
      if (Array.isArray(payload) && !payload.length) {
        const alternate = seasonYear - 1;
        const retry = await fetchUefaMatches(fetchFn, active, config, window, alternate).catch(() => null);
        seasonYearRetried = alternate;
        if (Array.isArray(retry) && retry.length) {
          payload = retry;
          seasonYear = alternate;
        }
      }
      const stats = {};
      const rows = parseUefaMatches(payload, teams, active, updatedAt, stats);
      /* Request parameters travel with the yield. "Zero rows" on its own is
         not a diagnosis; "zero rows for competitionId X at seasonYear Y" is. */
      return sourceResult(definition.source, true, rows, '', {
        ...stats,
        competitionId: active.id,
        competitionIdFallback: definition.id,
        competitionIdSource: discoveredId ? 'discovered' : 'hardcoded',
        competitionsIndexed: competitionIndex.length,
        competitionIndexError,
        seasonYear,
        seasonYearRetried,
        configSource: config.configSource,
        fromDate: window.fromDate,
        toDate: window.toDate,
      });
    } catch (error) {
      return sourceResult(definition.source, false, [], error || baseError);
    }
  }));
}

async function loadEflSource(fetchFn, teams, window, updatedAt) {
  try {
    const url = new URL('https://multi-club-matches.webapi.gc.eflservices.co.uk/v2/matches');
    url.searchParams.set('page.size', '200');
    url.searchParams.set('seasonID', String(window.year));
    url.searchParams.set('competitionID', '2');
    url.searchParams.set('from', window.fromDate);
    url.searchParams.set('to', window.toDate);
    const payload = await fetchJson(fetchFn, url.toString());
    return sourceResult(CLUB_SCHEDULE_SOURCES.eflCup, true, parseEflMatches(payload, teams, updatedAt));
  } catch (error) {
    return sourceResult(CLUB_SCHEDULE_SOURCES.eflCup, false, [], error);
  }
}

async function loadFaCupSource(fetchFn, teams, updatedAt) {
  const pages = [];
  try {
    for (let first = 1; first <= FA_CUP_MAX_PAGES; first += 4) {
      const pageNumbers = Array.from({ length: Math.min(4, FA_CUP_MAX_PAGES - first + 1) }, (_, index) => first + index);
      const batch = await Promise.all(pageNumbers.map(async (page) => {
        const url = `https://www.thefa.com/Competitions/Fixtures/Fixtures?competitionId=1&page=${page}`;
        return { page, html: await fetchText(fetchFn, url) };
      }));
      let finished = false;
      for (const item of batch.sort((a, b) => a.page - b.page)) {
        if (!/mod-FACup-fixtures/i.test(item.html)) { finished = true; break; }
        pages.push(item.html);
      }
      if (finished) break;
    }
    if (!pages.length) throw new Error('FA Cup fixture pages were unavailable');
    const fixtures = pages.flatMap((html) => parseFaCupHtml(html, teams, updatedAt));
    return sourceResult(CLUB_SCHEDULE_SOURCES.faCup, true, fixtures);
  } catch (error) {
    return sourceResult(CLUB_SCHEDULE_SOURCES.faCup, false, [], error);
  }
}

async function loadOfficialSources(fetchFn, teams, season, nowMs) {
  const window = sourceWindow(season, nowMs);
  const updatedAt = new Date(nowMs).toISOString();
  const uefa = await loadUefaSources(fetchFn, teams, window, updatedAt);
  const efl = await loadEflSource(fetchFn, teams, window, updatedAt);
  const fa = await loadFaCupSource(fetchFn, teams, updatedAt);
  return [...uefa, efl, fa];
}

function parseStoredCalendar(value) {
  if (!value) return [];
  try { return dedupeFixtures(JSON.parse(value)); }
  catch { return []; }
}

export function zeroYieldRegressions(previous, results) {
  const priorCounts = new Map();
  for (const row of dedupeFixtures(previous)) priorCounts.set(row.source, (priorCounts.get(row.source) || 0) + 1);
  return (results || [])
    .filter((result) => result?.ok && !(result.fixtures || []).length && (priorCounts.get(result.source) || 0) > 0)
    .map((result) => result.source);
}

export function mergeSourceResults(previous, results, window = null) {
  /* A source that parsed cleanly but produced nothing WHERE IT PREVIOUSLY
     PRODUCED FIXTURES is a regression, not an authoritative 'no fixtures'.
     Replacing its rows with an empty set is how an entire European calendar
     can disappear in one refresh without a single error being raised, so its
     last-known-good rows are retained exactly like a failed source's. A source
     that has never yielded rows still replaces normally, so a competition that
     is legitimately out of season never produces a false alarm. */
  const regressed = new Set(zeroYieldRegressions(previous, results));
  const successful = new Set(
    (results || []).filter((result) => result?.ok && !regressed.has(result.source)).map((result) => result.source)
  );
  const retained = dedupeFixtures(previous).filter((row) => !successful.has(row.source));
  const fresh = (results || []).filter((result) => result?.ok).flatMap((result) => result.fixtures || []);
  const merged = dedupeFixtures([...retained, ...fresh]);
  if (!window) return merged;
  const lower = window.from - 7 * 86400e3;
  const upper = window.to + 7 * 86400e3;
  return merged.filter((row) => {
    const kickoff = Date.parse(row.kickoff);
    return kickoff >= lower && kickoff <= upper;
  });
}

async function metaRows(env) {
  return env.DB.prepare(
    `SELECT key,value,updated_at FROM meta WHERE key IN (
       'club_schedule_json','club_schedule_updated_at','club_schedule_last_attempt_at','club_schedule_last_error',
       'club_schedule_source_report','season'
     )`
  ).all();
}

function metaMap(rows) {
  return Object.fromEntries((rows?.results || []).map((row) => [row.key, row.value]));
}

function metaUpsert(env, key, value, updatedAt) {
  return env.DB.prepare(
    `INSERT INTO meta (key,value,updated_at) VALUES (?1,?2,?3)
     ON CONFLICT(key) DO UPDATE SET value=?2,updated_at=?3`
  ).bind(key, String(value ?? ''), updatedAt);
}

export async function readClubSchedule(env) {
  const row = await env.DB.prepare("SELECT value FROM meta WHERE key='club_schedule_json'").first();
  return parseStoredCalendar(row?.value);
}

export async function refreshClubSchedule(env, options = {}) {
  const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
  const attemptedAt = new Date(nowMs).toISOString();
  const [teamRows, storedRows] = await Promise.all([
    env.DB.prepare('SELECT code,name FROM teams ORDER BY code').all(),
    metaRows(env),
  ]);
  const teams = teamRows?.results || [];
  const stored = metaMap(storedRows);
  const previous = parseStoredCalendar(stored.club_schedule_json);
  if (teams.length !== 20) {
    const error = `expected 20 current Premier League clubs, found ${teams.length}`;
    await env.DB.batch([
      metaUpsert(env, 'club_schedule_last_attempt_at', attemptedAt, attemptedAt),
      metaUpsert(env, 'club_schedule_last_error', error, attemptedAt),
    ]);
    return { ok: false, retained: previous.length, error, attemptedAt };
  }

  let results;
  try {
    if (Array.isArray(options.sourceLoaders)) {
      results = [];
      for (const loader of options.sourceLoaders) results.push(await loader({ teams, nowMs }));
    } else {
      results = await loadOfficialSources(options.fetchFn || fetch, teams, stored.season || '', nowMs);
    }
  } catch (error) {
    results = [sourceResult('source-loader', false, [], error)];
  }

  const errors = results.filter((result) => !result?.ok).map((result) => `${result.source}: ${result.error || 'failed'}`);
  const successful = results.filter((result) => result?.ok);
  if (!successful.length) {
    const error = errors.join(' | ') || 'all official calendar sources failed';
    await env.DB.batch([
      metaUpsert(env, 'club_schedule_last_attempt_at', attemptedAt, attemptedAt),
      metaUpsert(env, 'club_schedule_last_error', error, attemptedAt),
    ]);
    return { ok: false, retained: previous.length, error, attemptedAt };
  }

  const seasonRow = await env.DB.prepare("SELECT value FROM meta WHERE key='season'").first();
  const window = sourceWindow(seasonRow?.value || '', nowMs);
  const degraded = zeroYieldRegressions(previous, results);
  const sourceReport = results.map((result) => ({
    source: result?.source || 'unknown',
    ok: result?.ok === true,
    yielded: Number(result?.yielded) || 0,
    degraded: degraded.includes(result?.source),
    error: text(result?.error) || null,
    detail: result?.detail || null,
  }));
  const fixtures = mergeSourceResults(previous, results, window);
  await env.DB.batch([
    metaUpsert(env, 'club_schedule_json', JSON.stringify(fixtures), attemptedAt),
    metaUpsert(env, 'club_schedule_updated_at', attemptedAt, attemptedAt),
    metaUpsert(env, 'club_schedule_last_attempt_at', attemptedAt, attemptedAt),
    metaUpsert(env, 'club_schedule_last_error', errors.join(' | '), attemptedAt),
    metaUpsert(env, 'club_schedule_source_report', JSON.stringify(sourceReport), attemptedAt),
  ]);
  console.log(JSON.stringify({
    message: 'club schedule refresh completed',
    fixtures: fixtures.length,
    sourcesOk: successful.length,
    sourcesFailed: errors.length,
    updatedAt: attemptedAt,
  }));
  return {
    ok: true,
    fixtures: fixtures.length,
    sourcesOk: successful.length,
    sourcesFailed: errors.length,
    sourcesDegraded: degraded.length,
    degraded,
    staleSourcesRetained: errors.length > 0 || degraded.length > 0,
    updatedAt: attemptedAt,
    errors,
    sourceReport,
  };
}

export async function maybeRefreshClubSchedule(env, options = {}) {
  const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
  const stored = metaMap(await metaRows(env));
  const hasCalendar = parseStoredCalendar(stored.club_schedule_json).length > 0;
  const lastAttempt = Date.parse(stored.club_schedule_last_attempt_at || '');
  const interval = hasCalendar ? REFRESH_INTERVAL_MS : EMPTY_RETRY_INTERVAL_MS;
  if (!options.force && Number.isFinite(lastAttempt) && nowMs - lastAttempt < interval - REFRESH_GRACE_MS) {
    return {
      ok: true,
      skipped: true,
      reason: 'official calendar refresh is inside its cooldown',
      fixtures: parseStoredCalendar(stored.club_schedule_json).length,
      updatedAt: stored.club_schedule_updated_at || null,
    };
  }
  return refreshClubSchedule(env, { ...options, nowMs });
}

export function clubScheduleHealthFromMeta(meta, nowMs = Date.now()) {
  const fixtures = parseStoredCalendar(meta?.club_schedule_json);
  const updatedAt = meta?.club_schedule_updated_at || null;
  const ageHours = updatedAt ? Math.max(0, (nowMs - Date.parse(updatedAt)) / 3600e3) : null;
  let sources = [];
  try { const parsed = JSON.parse(meta?.club_schedule_source_report || '[]'); if (Array.isArray(parsed)) sources = parsed; }
  catch { sources = []; }
  const degradedSources = sources.filter((row) => row?.degraded).map((row) => row.source);
  const byCompetition = {};
  for (const row of fixtures) byCompetition[row.competition] = (byCompetition[row.competition] || 0) + 1;
  /* 'ok' now requires that nothing regressed to zero. Before this, a provider
     that quietly stopped matching any rows still reported a clean bill of
     health, because only a thrown error could move the status off 'ok'. */
  const status = !updatedAt
    ? 'empty'
    : ageHours > 24
      ? 'stale'
      : (meta?.club_schedule_last_error || degradedSources.length) ? 'partial' : 'ok';
  return {
    status,
    fixtures: fixtures.length,
    fixturesByCompetition: byCompetition,
    updatedAt,
    lastAttemptAt: meta?.club_schedule_last_attempt_at || null,
    ageHours: Number.isFinite(ageHours) ? Math.round(ageHours * 10) / 10 : null,
    lastError: meta?.club_schedule_last_error || null,
    degradedSources,
    sources,
  };
}

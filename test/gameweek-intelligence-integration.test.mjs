import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import engineWorker from '../src/index-core.js';
import { GAMEWEEK_INTELLIGENCE_VERSION } from '../src/gameweek-intelligence.js';

const root = new URL('../', import.meta.url);
const [core, workerSource, intelligence, html, schema, bridge] = await Promise.all([
  readFile(new URL('app-core.js', root), 'utf8'),
  readFile(new URL('src/index-core.js', root), 'utf8'),
  readFile(new URL('src/gameweek-intelligence.js', root), 'utf8'),
  readFile(new URL('FPL_Engine_OTB.html', root), 'utf8'),
  readFile(new URL('schema.sql', root), 'utf8'),
  readFile(new URL('app.js', root), 'utf8'),
]);

class LocalD1Statement {
  constructor(database, sql, values = []) { this.database = database; this.sql = sql; this.values = values; }
  bind(...values) { return new LocalD1Statement(this.database, this.sql, values); }
  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes || 0) } };
  }
  async all() { return { success: true, results: this.database.prepare(this.sql).all(...this.values) }; }
  async first() { return this.database.prepare(this.sql).get(...this.values) || null; }
}

class LocalD1 {
  constructor() { this.database = new DatabaseSync(':memory:'); }
  prepare(sql) { return new LocalD1Statement(this.database, sql); }
  async batch(statements) {
    this.database.exec('BEGIN');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      this.database.exec('COMMIT');
      return results;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
  close() { this.database.close(); }
}

test('completed Gameweeks automatically feed the versioned intelligence capture', () => {
  assert.match(workerSource, /gameweekCompletionStatus\(event,fixtures,currentMs\)/);
  assert.match(workerSource, /captureCheckedActuals\(env,boot,fixtures,startedAt\)/);
  assert.match(workerSource, /captureGameweekIntelligence\(env,boot,fixtures,startedAt\)/);
  assert.match(workerSource, /case '\/api\/gameweek-intelligence'/);
  assert.match(workerSource, /GAMEWEEK_INTELLIGENCE_VERSION/);
  assert.match(workerSource, /gameweekIntelligenceLastError/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS gameweek_player_stats/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS gameweek_reviews/);
});

test('the complete D1 schema applies cleanly with the intelligence tables and index', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(schema);
  const objects = new Map(db.prepare(
    "SELECT name,type FROM sqlite_master WHERE name IN ('gameweek_player_stats','gameweek_reviews','idx_gameweek_player_stats_player')",
  ).all().map((row) => [row.name, row.type]));
  assert.equal(objects.get('gameweek_player_stats'), 'table');
  assert.equal(objects.get('gameweek_reviews'), 'table');
  assert.equal(objects.get('idx_gameweek_player_stats_player'), 'index');
  const columns = db.prepare('PRAGMA table_info(gameweek_player_stats)').all().map((row) => row.name);
  for (const column of ['total_points', 'minutes', 'starts', 'expected_goal_involvements', 'defensive_contribution']) {
    assert.ok(columns.includes(column), `missing ${column}`);
  }
  db.close();
});

test('the public Worker route self-migrates, reports pending safely, and returns requested player detail', async () => {
  const DB = new LocalD1();
  const env = { DB, FPL_SEASON: '2026/27' };
  let response = await engineWorker.fetch(new Request('https://worker.test/api/gameweek-intelligence?gw=1'), env, {});
  assert.equal(response.status, 200);
  let body = await response.json();
  assert.equal(body.status, 'pending');
  response = await engineWorker.fetch(new Request('https://worker.test/api/gameweek-intelligence?gw=1.5'), env, {});
  assert.equal(response.status, 400);

  const report = { status: 'ready', season: '2026/27', gw: 1, generatedAt: '2026-08-24T00:00:00.000Z', sections: {}, teamTrends: [] };
  DB.database.prepare(
    'INSERT INTO gameweek_reviews (season,gw,review_version,source_hash,generated_at,report_json) VALUES (?,?,?,?,?,?)',
  ).run('2026/27', 1, GAMEWEEK_INTELLIGENCE_VERSION, 'hash', report.generatedAt, JSON.stringify(report));
  const columns = DB.database.prepare('PRAGMA table_info(gameweek_player_stats)').all().map((row) => row.name);
  const text = new Set(['season', 'web_name', 'team_code', 'status', 'captured_at']);
  const values = columns.map((column) => ({
    season: '2026/27', gw: 1, player_id: 42, web_name: 'Signal', team_code: 'AAA',
    position: 3, price: 55, ownership: 4.2, status: 'a', total_points: 8,
    minutes: 90, starts: 1, expected_goal_involvements: .61,
    captured_at: report.generatedAt,
  })[column] ?? (text.has(column) ? '' : 0));
  DB.database.prepare(
    `INSERT INTO gameweek_player_stats (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`,
  ).run(...values);

  response = await engineWorker.fetch(new Request('https://worker.test/api/gameweek-intelligence?gw=1&players=42,42,42.9,invalid'), env, {});
  body = await response.json();
  assert.equal(body.status, 'ready');
  assert.equal(body.players.length, 1);
  assert.deepEqual(
    [body.players[0].playerId, body.players[0].position, body.players[0].price, body.players[0].xGI],
    [42, 'MID', 5.5, .61],
  );
  assert.match(response.headers.get('cache-control'), /stale-while-revalidate/);
  DB.close();
});

test('mobile and desktop both schedule chunked automatic pre-deadline snapshots', () => {
  const scheduler = core.match(/function scheduleAccuracyCapture[\s\S]*?\nconst accuracyRound/)?.[0] || '';
  const autoCapture = core.match(/async function maybeAutoCaptureProjection[\s\S]*?\nfunction actualRowsFromPayload/)?.[0] || '';
  assert.match(core, /async function projectionSnapshotRowsAsync/);
  assert.match(core, /batchSize=lowPowerMode\(\)\?18:45/);
  assert.doesNotMatch(scheduler, /if\(lowPowerMode\(\)\)return/);
  assert.doesNotMatch(autoCapture, /if\(lowPowerMode\(\)\)return false/);
  assert.match(core, /runWhenIdle\(\(\)=>void maybeAutoCaptureProjection\(\)/);
  assert.match(core, /document\.addEventListener\('visibilitychange',[\s\S]*?maybeAutoCaptureProjection/);
  assert.match(core, /function loadMarketData\([\s\S]*?scheduleAccuracyCapture\(250\)/);
  assert.match(core, /finalTarget=deadline-90\*1000/);
  assert.match(core, /finalSnapshotDue/);
});

test('accountable snapshots preserve the user decision state without breaking v2 imports', () => {
  assert.match(core, /ACCURACY_SCHEMA=3/);
  assert.match(core, /function accuracySelectionSnapshot\(gw\)/);
  for (const field of ['squad:', 'xi:', 'bench:', 'captain:', 'vice:', 'formation:', 'chip:']) {
    assert.ok(core.includes(field), `missing selection field ${field}`);
  }
  assert.match(core, /if\(num\(s\.snapshotSchema,2\)>=3\)base\.push\(s\.selection\)/);
  assert.match(core, /snapshotSchema:ACCURACY_SCHEMA/);
  assert.match(core, /selectionFingerprint/);
  assert.match(core, /captain\.id!==vice\.id/);
});

test('the intelligence capture is isolated from unrelated accountability failures', () => {
  const pollBlock = workerSource.match(/const evaluationErrors=\[\][\s\S]*?evaluation\.error=evaluationErrors/)?.[0] || '';
  assert.match(pollBlock, /accountability:/);
  assert.match(pollBlock, /captureGameweekIntelligence/);
  assert.match(pollBlock, /gameweek intelligence:/);
});

test('review UI exposes global, personal, process, and team analysis with a fresh bundle', () => {
  for (const id of ['intelligenceStatus', 'intelligenceOverview', 'intelligencePersonal', 'intelligenceSignals', 'intelligenceTeams']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /What others may miss|Gameweek Review/);
  assert.match(intelligence, /PROCESS_OVER_OUTCOME/);
  assert.match(intelligence, /ROLE_LOSS/);
  assert.match(core, /Outcome only:/);
  assert.match(core, /before official autosubs/);
  assert.match(bridge, /app-core\.js\?v=2026\.08\.25\.1-core/);
  assert.match(html, /script\.src='app\.js\?v='\+encodeURIComponent\(requested\)/);
});

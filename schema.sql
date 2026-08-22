-- FPL Engine — D1 schema
-- Design note: we do NOT store every player on every poll. That would be
-- ~700 rows x 48 polls a day for no benefit. Instead:
--   players          current state, upserted in place
--   player_events    append-only, written ONLY when something material changes
--   transfer_samples a deliberate time series, for predicting price moves
-- This keeps the database small enough to stay inside D1's free tier all season.

PRAGMA foreign_keys = ON;

-- ---------- current state ----------
CREATE TABLE IF NOT EXISTS players (
  id                  INTEGER PRIMARY KEY,      -- FPL element id, stable across a season
  web_name            TEXT NOT NULL,
  full_name           TEXT,
  team_code           TEXT NOT NULL,
  element_type        INTEGER NOT NULL,         -- 1 GK, 2 DEF, 3 MID, 4 FWD
  now_cost            INTEGER NOT NULL,         -- tenths of a million: 155 = GBP 15.5m
  cost_change_event   INTEGER DEFAULT 0,
  cost_change_start   INTEGER DEFAULT 0,
  status              TEXT DEFAULT 'a',         -- a available, d doubtful, i injured, s suspended, u unavailable, n on loan
  chance_next         INTEGER,                  -- 0/25/50/75/100, or NULL when no doubt
  news                TEXT DEFAULT '',
  news_added          TEXT,
  minutes             INTEGER DEFAULT 0,
  starts              INTEGER DEFAULT 0,
  total_points        INTEGER DEFAULT 0,
  goals               INTEGER DEFAULT 0,
  assists             INTEGER DEFAULT 0,
  clean_sheets        INTEGER DEFAULT 0,
  saves               INTEGER DEFAULT 0,
  bonus               INTEGER DEFAULT 0,
  bps                 INTEGER DEFAULT 0,
  xg                  REAL DEFAULT 0,
  xa                  REAL DEFAULT 0,
  xgc                 REAL DEFAULT 0,
  dc_per_90           REAL DEFAULT 0,
  form                REAL DEFAULT 0,
  points_per_game     REAL DEFAULT 0,
  ep_next             REAL DEFAULT 0,
  selected_by         REAL DEFAULT 0,
  transfers_in_event  INTEGER DEFAULT 0,
  transfers_out_event INTEGER DEFAULT 0,
  penalties_order     INTEGER,
  updated_at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_players_team   ON players(team_code);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);

-- ---------- append-only change log ----------
CREATE TABLE IF NOT EXISTS player_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id   INTEGER NOT NULL,
  web_name    TEXT NOT NULL,
  team_code   TEXT NOT NULL,
  kind        TEXT NOT NULL,   -- price | status | chance | team | position | news
  old_value   TEXT,
  new_value   TEXT,
  detected_at TEXT NOT NULL,
  event_id    INTEGER,         -- gameweek in which it was detected
  FOREIGN KEY (player_id) REFERENCES players(id)
);
CREATE INDEX IF NOT EXISTS idx_events_time   ON player_events(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_kind   ON player_events(kind, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_player ON player_events(player_id, detected_at DESC);

-- ---------- transfer momentum, for predicting price moves ----------
-- A price change is a function of net transfers since the last change, so a
-- single snapshot tells you nothing. Sampling is the whole point of this table.
CREATE TABLE IF NOT EXISTS transfer_samples (
  player_id           INTEGER NOT NULL,
  sampled_at          TEXT NOT NULL,
  now_cost            INTEGER NOT NULL,
  transfers_in_event  INTEGER NOT NULL,
  transfers_out_event INTEGER NOT NULL,
  selected_by         REAL NOT NULL,
  PRIMARY KEY (player_id, sampled_at)
);
CREATE INDEX IF NOT EXISTS idx_samples_time ON transfer_samples(sampled_at DESC);

-- ---------- reference data ----------
CREATE TABLE IF NOT EXISTS teams (
  code        TEXT PRIMARY KEY,
  fpl_id      INTEGER UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  strength    INTEGER,
  atk_home    INTEGER, atk_away INTEGER,
  def_home    INTEGER, def_away INTEGER,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fixtures (
  id            INTEGER PRIMARY KEY,
  event_id      INTEGER,               -- NULL until scheduled
  kickoff_time  TEXT,
  home_code     TEXT NOT NULL,
  away_code     TEXT NOT NULL,
  home_diff     INTEGER,
  away_diff     INTEGER,
  finished      INTEGER DEFAULT 0,
  home_score    INTEGER,
  away_score    INTEGER,
  updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fixtures_event ON fixtures(event_id);

CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY,   -- gameweek number
  name          TEXT,
  deadline_time TEXT,
  finished      INTEGER DEFAULT 0,
  is_current    INTEGER DEFAULT 0,
  is_next       INTEGER DEFAULT 0,
  updated_at    TEXT NOT NULL
);

-- ---------- operational ----------
CREATE TABLE IF NOT EXISTS meta (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS poll_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at  TEXT NOT NULL,
  ok          INTEGER NOT NULL,
  duration_ms INTEGER,
  players_seen INTEGER,
  changes     INTEGER,
  error       TEXT
);
CREATE INDEX IF NOT EXISTS idx_polllog_time ON poll_log(started_at DESC);

-- ---------- final Gameweek intelligence ----------
-- One immutable, official row per player/Gameweek. Reviews are regenerated
-- only when the deterministic review version changes, keeping weekly storage
-- bounded while preserving enough history for role and process trends.
CREATE TABLE IF NOT EXISTS gameweek_player_stats (
  season TEXT NOT NULL,
  gw INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  web_name TEXT NOT NULL,
  team_code TEXT NOT NULL,
  position INTEGER NOT NULL,
  price INTEGER NOT NULL,
  ownership REAL NOT NULL,
  status TEXT NOT NULL,
  total_points REAL NOT NULL,
  minutes REAL NOT NULL,
  starts REAL NOT NULL,
  goals_scored REAL NOT NULL,
  assists REAL NOT NULL,
  clean_sheets REAL NOT NULL,
  goals_conceded REAL NOT NULL,
  own_goals REAL NOT NULL,
  penalties_saved REAL NOT NULL,
  penalties_missed REAL NOT NULL,
  yellow_cards REAL NOT NULL,
  red_cards REAL NOT NULL,
  saves REAL NOT NULL,
  bonus REAL NOT NULL,
  bps REAL NOT NULL,
  influence REAL NOT NULL,
  creativity REAL NOT NULL,
  threat REAL NOT NULL,
  ict_index REAL NOT NULL,
  clearances_blocks_interceptions REAL NOT NULL,
  recoveries REAL NOT NULL,
  tackles REAL NOT NULL,
  defensive_contribution REAL NOT NULL,
  expected_goals REAL NOT NULL,
  expected_assists REAL NOT NULL,
  expected_goal_involvements REAL NOT NULL,
  expected_goals_conceded REAL NOT NULL,
  in_dreamteam INTEGER NOT NULL,
  captured_at TEXT NOT NULL,
  PRIMARY KEY (season, gw, player_id)
);
CREATE INDEX IF NOT EXISTS idx_gameweek_player_stats_player
  ON gameweek_player_stats (season, player_id, gw DESC);

CREATE TABLE IF NOT EXISTS gameweek_reviews (
  season TEXT NOT NULL,
  gw INTEGER NOT NULL,
  review_version TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  report_json TEXT NOT NULL,
  PRIMARY KEY (season, gw)
);

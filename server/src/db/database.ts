import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/game.db';
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db: Database.Database = new Database(dbPath);

// Enable foreign keys and set encoding
db.pragma('foreign_keys = ON');
db.pragma('encoding = "UTF-8"');

// Initialize database schema
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      startColor TEXT NOT NULL,
      endColor TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      maxPlayers INTEGER DEFAULT 4,
      password TEXT,
      currentRound INTEGER NOT NULL DEFAULT 1,
      totalRounds INTEGER DEFAULT 3,
      currentTurnPlayerId TEXT,
      turnEndTime TEXT
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      username TEXT NOT NULL,
      joinedAt TEXT NOT NULL,
      completedRounds INTEGER NOT NULL DEFAULT 0,
      bestScore INTEGER NOT NULL DEFAULT 0,
      totalScore INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      isWaiting INTEGER NOT NULL DEFAULT 0,
      country TEXT,
      ip TEXT,
      FOREIGN KEY (sessionId) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      sessionId TEXT NOT NULL,
      roundNumber INTEGER NOT NULL,
      targetColor TEXT NOT NULL,
      selectedColor TEXT NOT NULL,
      distance REAL NOT NULL,
      score INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (playerId) REFERENCES players(id),
      FOREIGN KEY (sessionId) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      playerId TEXT NOT NULL,
      username TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (sessionId) REFERENCES sessions(id),
      FOREIGN KEY (playerId) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      playerId TEXT NOT NULL,
      eventType TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (sessionId) REFERENCES sessions(id),
      FOREIGN KEY (playerId) REFERENCES players(id)
    );

    CREATE TABLE IF NOT EXISTS solo_games (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      totalScore INTEGER NOT NULL,
      completedRounds INTEGER NOT NULL,
      country TEXT,
      ip TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_players_session ON players(sessionId);
    CREATE INDEX IF NOT EXISTS idx_rounds_player ON rounds(playerId);
    CREATE INDEX IF NOT EXISTS idx_rounds_session ON rounds(sessionId);
    CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(sessionId);
    CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(sessionId);
    CREATE INDEX IF NOT EXISTS idx_solo_games_score ON solo_games(totalScore DESC);
    CREATE INDEX IF NOT EXISTS idx_solo_games_timestamp ON solo_games(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_players_score ON players(totalScore DESC);
    CREATE INDEX IF NOT EXISTS idx_players_joined ON players(joinedAt DESC);
  `);

  console.log('✅ Database initialized successfully');
}

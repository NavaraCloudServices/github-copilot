import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SQLiteDatabase {
  constructor() {
    const dbPath = join(__dirname, '../../data/leaderboard.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
    this.prepareStatements();
  }

  initializeTables() {
    logger.info('Initializing SQLite tables...');
    
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS leaderboards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        host_code TEXT NOT NULL UNIQUE,
        access_code TEXT NOT NULL UNIQUE,
        challenges_json TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        ended_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        leaderboard_id TEXT NOT NULL,
        name TEXT NOT NULL,
        members TEXT NOT NULL,
        team_code TEXT NOT NULL UNIQUE,
        total_points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (leaderboard_id) REFERENCES leaderboards (id)
      );

      CREATE TABLE IF NOT EXISTS completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id TEXT NOT NULL,
        challenge_id TEXT NOT NULL,
        points INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams (id),
        UNIQUE(team_id, challenge_id)
      );

      CREATE INDEX IF NOT EXISTS idx_teams_leaderboard ON teams(leaderboard_id);
      CREATE INDEX IF NOT EXISTS idx_teams_points ON teams(total_points DESC);
      CREATE INDEX IF NOT EXISTS idx_completions_team ON completions(team_id);
      CREATE INDEX IF NOT EXISTS idx_completions_completed_at ON completions(completed_at);
    `);
    
    logger.info('SQLite tables initialized successfully');
  }

  prepareStatements() {
    logger.info('Preparing SQLite statements...');
    
    this.statements = {
      // Leaderboard statements
      createLeaderboard: this.db.prepare(`
        INSERT INTO leaderboards (id, name, host_code, access_code, challenges_json)
        VALUES (?, ?, ?, ?, ?)
      `),
      
      getLeaderboard: this.db.prepare(`
        SELECT * FROM leaderboards WHERE id = ?
      `),
      
      getLeaderboardByAccessCode: this.db.prepare(`
        SELECT * FROM leaderboards WHERE access_code = ?
      `),
      
      getLeaderboardByHostCode: this.db.prepare(`
        SELECT * FROM leaderboards WHERE host_code = ?
      `),
      
      updateLeaderboardStatus: this.db.prepare(`
        UPDATE leaderboards 
        SET status = ?1, 
            started_at = CASE WHEN ?1 = 'started' THEN CURRENT_TIMESTAMP ELSE started_at END,
            ended_at = CASE WHEN ?1 = 'ended' THEN CURRENT_TIMESTAMP ELSE ended_at END
        WHERE id = ?2
      `),

      // Team statements
      createTeam: this.db.prepare(`
        INSERT INTO teams (id, leaderboard_id, name, members, team_code)
        VALUES (?, ?, ?, ?, ?)
      `),
      
      getTeam: this.db.prepare(`
        SELECT * FROM teams WHERE id = ?
      `),
      
      getTeamByCode: this.db.prepare(`
        SELECT * FROM teams WHERE team_code = ?
      `),
      
      getTeamsByLeaderboard: this.db.prepare(`
        SELECT * FROM teams WHERE leaderboard_id = ? ORDER BY total_points DESC, created_at ASC
      `),
      
      updateTeamPoints: this.db.prepare(`
        UPDATE teams SET total_points = ? WHERE id = ?
      `),

      // Completion statements
      addCompletion: this.db.prepare(`
        INSERT INTO completions (team_id, challenge_id, points)
        VALUES (?, ?, ?)
      `),
      
      getTeamCompletions: this.db.prepare(`
        SELECT * FROM completions WHERE team_id = ? ORDER BY completed_at DESC
      `),
      
      getCompletionsByLeaderboard: this.db.prepare(`
        SELECT c.*, t.name as team_name, t.leaderboard_id
        FROM completions c
        JOIN teams t ON c.team_id = t.id
        WHERE t.leaderboard_id = ?
        ORDER BY c.completed_at DESC
      `),
      
      checkCompletion: this.db.prepare(`
        SELECT * FROM completions WHERE team_id = ? AND challenge_id = ?
      `),

      // Leaderboard data with rankings
      getLeaderboardData: this.db.prepare(`
        SELECT 
          t.id,
          t.name,
          t.members,
          t.total_points,
          t.created_at,
          COUNT(c.id) as completed_challenges,
          ROW_NUMBER() OVER (ORDER BY t.total_points DESC, t.created_at ASC) as rank
        FROM teams t
        LEFT JOIN completions c ON t.id = c.team_id
        WHERE t.leaderboard_id = ?
        GROUP BY t.id, t.name, t.members, t.total_points, t.created_at
        ORDER BY t.total_points DESC, t.created_at ASC
      `)
    };
    
    logger.info('SQLite statements prepared successfully');
  }

  async query(text, params = []) {
    try {
      const stmt = this.db.prepare(text);
      const result = stmt.all(...params);
      return { rows: result };
    } catch (error) {
      logger.error('SQLite query error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const transaction = this.db.transaction(() => {
      return callback(this.db);
    });
    return transaction();
  }

  async close() {
    this.db.close();
    logger.info('SQLite database connection closed');
  }
}

export default SQLiteDatabase;
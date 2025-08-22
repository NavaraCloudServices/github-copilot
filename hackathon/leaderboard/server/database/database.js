import pg from 'pg';
import logger from '../utils/logger.js';
import SQLiteDatabase from './sqlite-database.js';

const { Pool } = pg;

class LeaderboardDatabase {
  constructor() {
    // Use SQLite for local development if no DATABASE_URL is configured
    if (!process.env.DATABASE_URL || process.env.NODE_ENV === 'development') {
      logger.info('Using SQLite database for local development');
      this.sqlite = new SQLiteDatabase();
      this.statements = this.sqlite.statements;
      return;
    }

    // Use PostgreSQL for production
    logger.info('Using PostgreSQL database for production');
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Adjust based on your PostgreSQL server's SSL configuration
      }
    });
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
    this.prepareStatements();
  }

  async prepareStatements() {
    // Skip if using SQLite (already prepared)
    if (this.sqlite) return;
    
    logger.info('Preparing database statements...');
    // Create SQLite-compatible wrappers for PostgreSQL with proper context binding
    const createStatement = (sql) => {
      const pool = this.pool; // Capture pool reference
      const statement = {
        run: async (...params) => {
          try {
            const result = await pool.query(sql, params);
            return { lastInsertRowid: result.rowCount, changes: result.rowCount };
          } catch (error) {
            logger.error('Database query error:', error);
            throw error;
          }
        },
        get: async (...params) => {
          try {
            const result = await pool.query(sql, params);
            return result.rows[0] || null;
          } catch (error) {
            logger.error('Database query error:', error);
            throw error;
          }
        },
        all: async (...params) => {
          try {
            const result = await pool.query(sql, params);
            return result.rows;
          } catch (error) {
            logger.error('Database query error:', error);
            throw error;
          }
        }
      };
      statement.sql = sql;
      return statement;
    };

    // Leaderboard statements
    this.statements = {
      createLeaderboard: createStatement(`
        INSERT INTO leaderboards (id, name, host_code, access_code, challenges_json)
        VALUES ($1, $2, $3, $4, $5)
      `),
      
      getLeaderboard: createStatement(`
        SELECT * FROM leaderboards WHERE id = $1
      `),
      
      getLeaderboardByAccessCode: createStatement(`
        SELECT * FROM leaderboards WHERE access_code = $1
      `),
      
      getLeaderboardByHostCode: createStatement(`
        SELECT * FROM leaderboards WHERE host_code = $1
      `),
      
      updateLeaderboardStatus: createStatement(`
        UPDATE leaderboards SET status = $1, started_at = CASE WHEN $1 = 'started' THEN CURRENT_TIMESTAMP ELSE started_at END,
        ended_at = CASE WHEN $1 = 'ended' THEN CURRENT_TIMESTAMP ELSE ended_at END
        WHERE id = $2
      `),

      // Team statements
      createTeam: createStatement(`
        INSERT INTO teams (id, leaderboard_id, name, members, team_code)
        VALUES ($1, $2, $3, $4, $5)
      `),
      
      getTeam: createStatement(`
        SELECT * FROM teams WHERE id = $1
      `),
      
      getTeamByCode: createStatement(`
        SELECT * FROM teams WHERE team_code = $1
      `),
      
      getTeamsByLeaderboard: createStatement(`
        SELECT * FROM teams WHERE leaderboard_id = $1 ORDER BY total_points DESC, created_at ASC
      `),
      
      updateTeamPoints: createStatement(`
        UPDATE teams SET total_points = $1 WHERE id = $2
      `),

      // Completion statements
      addCompletion: createStatement(`
        INSERT INTO completions (team_id, challenge_id, points)
        VALUES ($1, $2, $3)
      `),
      
      getTeamCompletions: createStatement(`
        SELECT * FROM completions WHERE team_id = $1 ORDER BY completed_at DESC
      `),
      
      getCompletionsByLeaderboard: createStatement(`
        SELECT c.*, t.name as team_name, t.leaderboard_id
        FROM completions c
        JOIN teams t ON c.team_id = t.id
        WHERE t.leaderboard_id = $1
        ORDER BY c.completed_at DESC
      `),
      
      checkCompletion: createStatement(`
        SELECT * FROM completions WHERE team_id = $1 AND challenge_id = $2
      `),

      // Leaderboard data with rankings
      getLeaderboardData: createStatement(`
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
        WHERE t.leaderboard_id = $1
        GROUP BY t.id, t.name, t.members, t.total_points, t.created_at
        ORDER BY t.total_points DESC, t.created_at ASC
      `)
    };
    
    logger.info('Database statements prepared successfully', {
      createLeaderboard: typeof this.statements.createLeaderboard,
      createLeaderboardRun: typeof this.statements.createLeaderboard.run
    });
  }

  async query(text, params) {
    if (this.sqlite) {
      return this.sqlite.query(text, params);
    }
    
    const client = await this.pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      client.release();
    }
  }

  async transaction(callback) {
    if (this.sqlite) {
      return this.sqlite.transaction(callback);
    }
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.sqlite) {
      this.sqlite.close();
      return;
    }
    
    await this.pool.end();
    logger.info('Database connection pool closed');
  }
}

export default LeaderboardDatabase;

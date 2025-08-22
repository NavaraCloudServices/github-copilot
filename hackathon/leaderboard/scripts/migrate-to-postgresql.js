import pg from 'pg';
import logger from '../server/utils/logger.js';

const { Pool } = pg;

const createSchema = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const createLeaderboardsTable = `
      CREATE TABLE IF NOT EXISTS leaderboards (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        host_code VARCHAR(255) NOT NULL,
        access_code VARCHAR(255) NOT NULL,
        challenges_json TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP WITH TIME ZONE,
        ended_at TIMESTAMP WITH TIME ZONE
      );
    `;

    const createTeamsTable = `
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(255) PRIMARY KEY,
        leaderboard_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        members TEXT NOT NULL,
        team_code VARCHAR(255) NOT NULL,
        total_points INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (leaderboard_id) REFERENCES leaderboards(id) ON DELETE CASCADE,
        UNIQUE(leaderboard_id, name)
      );
    `;

    const createCompletionsTable = `
      CREATE TABLE IF NOT EXISTS completions (
        id SERIAL PRIMARY KEY,
        team_id VARCHAR(255) NOT NULL,
        challenge_id VARCHAR(255) NOT NULL,
        points INTEGER NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        UNIQUE(team_id, challenge_id)
      );
    `;

    const createSessionTable = `
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `;

    const createSessionIndex = `
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire);
    `;

    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_teams_leaderboard ON teams(leaderboard_id);',
      'CREATE INDEX IF NOT EXISTS idx_completions_team ON completions(team_id);',
      'CREATE INDEX IF NOT EXISTS idx_completions_challenge ON completions(challenge_id);',
      'CREATE INDEX IF NOT EXISTS idx_leaderboards_access_code ON leaderboards(access_code);',
      'CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(team_code);'
    ];

    logger.info('Creating database schema...');
    await client.query(createLeaderboardsTable);
    await client.query(createTeamsTable);
    await client.query(createCompletionsTable);
    await client.query(createSessionTable);
    await client.query(createSessionIndex);

    for (const indexQuery of createIndexes) {
      await client.query(indexQuery);
    }

    await client.query('COMMIT');
    logger.info('Database schema created successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to create database schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createSchema().catch(err => {
  logger.error('Migration script failed:', err);
  process.exit(1);
});

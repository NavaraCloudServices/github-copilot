import { Router } from 'express';
import LeaderboardDatabase from '../database/database.js';
import logger from '../utils/logger.js';

const router = Router();
const db = new LeaderboardDatabase();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Application is healthy' });
});

router.get('/health/database', async (req, res) => {
  try {
    // Attempt to query the database to check connectivity
    await db.query('SELECT 1');
    res.status(200).json({ status: 'UP', message: 'Database connection successful' });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(500).json({ status: 'DOWN', message: 'Database connection failed', error: error.message });
  }
});

// Placeholder for WebSocket health check. Actual WebSocket health might be harder to check via HTTP.
// This might require a more sophisticated check or be removed if not feasible.
router.get('/health/websocket', (req, res) => {
  // In a real scenario, you might check if the Socket.IO server is running and accepting connections
  // For now, we'll assume if the app is up, websockets are likely working.
  res.status(200).json({ status: 'UP', message: 'WebSocket functionality is likely healthy' });
});

export default router;

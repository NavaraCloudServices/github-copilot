import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import leaderboardRoutes from './leaderboard.js';
import teamRoutes from './team.js';
import authRoutes from './auth.js';
import uploadRoutes from './upload.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

export function setupRoutes(app) {
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/upload', uploadRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('API Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  // SPA catch-all route - serve React app for non-API routes
  app.get('*', (req, res) => {
    // Don't serve SPA for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    // Serve the React app for all other routes
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}
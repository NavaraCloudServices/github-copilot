import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import lusca from 'lusca';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from './database/database.js';
import logger from './utils/logger.js';
import { setupRoutes } from './routes/index.js';
import healthRouter from './routes/health.js';
import { setupWebSockets } from './websocket/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PostgreSQLStore = pgSession(session);

class LeaderboardServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.CLIENT_URL || ['http://localhost:5173', process.env.WEBSITE_HOSTNAME],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      allowEIO3: true
    });
    
    this.port = process.env.PORT || 3000;
    
    try {
      this.database = new Database();
      logger.info('Database connection initialized');
    } catch (error) {
      logger.error('Failed to initialize database connection:', error);
      throw error;
    }
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSockets();
  }

  setupMiddleware() {
    // Trust proxy only in production (Azure Container Apps)
    if (process.env.NODE_ENV === 'production') {
      this.app.set('trust proxy', true);
    }

    // Security middleware
    this.app.use(helmet());

    // Rate limiting with appropriate trust proxy configuration
    const limiter = rateLimit({
      windowMs: 1000 * 60, // 1 minute
      max: 100, // 100 requests per minute
      message: { error: 'Too many requests, please try again later.' },
      // Only use IP-based limiting in production with proper trust proxy
      keyGenerator: process.env.NODE_ENV === 'production' 
        ? undefined // Use default IP-based key generator in production
        : () => 'global' // Use global key for local development
    });
    this.app.use(limiter);

    // CORS
    this.app.use(cors({
      origin: process.env.CLIENT_URL || ['http://localhost:5173', process.env.WEBSITE_HOSTNAME],
      credentials: true
    }));

    // Serve static files from the public directory (frontend assets)
    this.app.use(express.static(join(__dirname, 'public')));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Session configuration - using memory store for local development
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // CSRF protection middleware
    this.app.use(lusca.csrf());

    // Make database and io available to routes
    this.app.use((req, res, next) => {
      req.db = this.database;
      req.io = this.io;
      next();
    });
  }

  setupRoutes() {
    setupRoutes(this.app);
    this.app.use('/', healthRouter);
  }

  setupWebSockets() {
    setupWebSockets(this.io, this.database);
  }

  start() {
    logger.info('Starting leaderboard server...', {
      port: this.port,
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      websiteHostname: process.env.WEBSITE_HOSTNAME
    });

    this.server.listen(this.port, () => {
      logger.info(`Server running on port ${this.port}`);
      logger.info(`WebSocket server ready for connections`);
      logger.info('Leaderboard application started successfully');
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      this.server.close(() => {
        this.database.close();
        process.exit(0);
      });
    });
  }
}

const server = new LeaderboardServer();
server.start();

export default LeaderboardServer;
# Real-Time Multi-Tenant Leaderboard

A modern web application for hosting team-based challenges and competitions with real-time updates, built with Node.js and React.

## Features

- **Multi-Tenant Support**: Host multiple independent leaderboards simultaneously
- **Real-Time Updates**: WebSocket-powered live score updates and notifications
- **Team Management**: Self-registration with teams
- **Custom Challenges**: Upload JSON-based challenge definitions with categories
- **Interactive Dashboards**: Separate interfaces for teams, hosts, and spectators
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leaderboard
   ```

2. **Start with Docker Compose**
   ```bash
   # Production deployment
   docker-compose up -d
   
   # Development with hot-reload
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application**
   - Application: http://localhost:3000
   - Development client: http://localhost:5173 (dev mode only)

### Manual Setup

1. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   ```

2. **Set environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   # Development mode (both server and client)
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## Project Structure

```
├── server/                 # Node.js backend
│   ├── database/          # SQLite database and schemas
│   ├── routes/            # API endpoints
│   ├── websocket/         # Socket.io handlers
│   └── utils/             # Helper functions and logging
├── client/                # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Common/    # Shared components (Button, Card, Modal, etc.)
│   │   │   └── Layout/    # Layout components (Header, Layout)
│   │   ├── pages/         # Main application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React context providers (Auth, Theme)
│   │   ├── services/      # API and WebSocket services
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── index.html         # Main HTML template
├── data/                  # SQLite database files
├── logs/                  # Application logs
├── scripts/               # Database migration scripts
├── terraform/             # Infrastructure as Code (Azure deployment)
└── docker-compose.yml     # Docker deployment configuration
```

## API Documentation

### Core Endpoints

- `POST /api/leaderboard/create` - Create a new leaderboard
- `GET /api/leaderboard/:id` - Get leaderboard details
- `POST /api/leaderboard/:id/join` - Register team for leaderboard
- `POST /api/team/:teamId/complete` - Mark challenge as complete
- `GET /api/team/:teamId/progress` - Get team progress

### WebSocket Events

**Client → Server:**
- `join:leaderboard` - Subscribe to leaderboard updates
- `complete:challenge` - Mark challenge complete
- `register:team` - Register new team

**Server → Client:**
- `leaderboard:update` - Updated team rankings
- `team:completed` - Challenge completion notification
- `competition:status` - Competition status change

## Challenge JSON Format

Create custom challenges using this JSON structure:

```json
{
  "metadata": {
    "title": "Your Challenge Name",
    "description": "Challenge description",
    "version": "1.0",
    "total_points": 500
  },
  "categories": [
    {
      "id": "beginner",
      "name": "Beginner Challenges",
      "icon": "🎯",
      "color": "#10B981"
    }
  ],
  "challenges": [
    {
      "id": "challenge_1",
      "category": "beginner",
      "title": "Your Challenge Title",
      "description": "Detailed challenge description",
      "points": 10,
      "skill_level": "Beginner",
      "hints": ["Helpful hint 1", "Helpful hint 2"],
      "success_criteria": "How to complete this challenge"
    }
  ]
}
```

Challenge JSON files should be uploaded through the web interface when creating a new leaderboard.

## User Roles

### Host/Administrator
- Create new leaderboards
- Upload challenge definitions
- Monitor team progress
- Control competition lifecycle (start/pause/end)
- Display public leaderboards

### Team Participants
- Register team with unique name
- View available challenges
- Mark challenges as complete
- Track team progress and ranking
- Receive real-time updates

### Spectators
- View public leaderboards
- See real-time score updates
- Watch competition progress

## Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-secret-key

# Client Configuration
VITE_API_URL=http://localhost:3000
VITE_SERVER_URL=http://localhost:3000

# Database (SQLite for development, PostgreSQL for production)
DATABASE_PATH=./data/leaderboard.db
DATABASE_URL=postgresql://username:password@host:5432/database

# Logging
LOG_LEVEL=info
```

### Docker Configuration

The application includes both production and development Docker configurations:

- `docker-compose.yml` - Production deployment with optimized builds
- `docker-compose.dev.yml` - Development with hot-reload and debugging

## Development

### Prerequisites
- Node.js 20+
- Docker (optional but recommended)

### Development Workflow

1. **Start development servers**
   ```bash
   npm run dev
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Code formatting**
   ```bash
   npm run lint
   npm run format
   ```

### Tech Stack

**Backend:**
- Node.js 20+ with Express.js
- Socket.io for real-time communication
- SQLite (development) / PostgreSQL (production)
- Session-based authentication with express-session
- Winston for structured logging
- Joi for input validation
- Helmet for security headers
- Rate limiting protection

**Frontend:**
- React 18+ with Vite build tool
- Tailwind CSS for styling
- Framer Motion for animations
- Socket.io-client for WebSocket communication
- React Router for navigation
- Axios for HTTP requests
- React Hot Toast for notifications
- Lucide React for icons

## Security

- Input validation and sanitization
- Rate limiting (100 requests/minute)
- Session-based authentication
- CORS protection
- Helmet security headers
- SQL injection prevention with prepared statements

## Performance

- SQLite with WAL mode for concurrent access
- Indexed database queries
- Optimized WebSocket connections
- Client-side caching
- Responsive design with lazy loading

## Deployment

### Local Development
```bash
# Start both server and client in development mode
npm run dev
```

### Production Deployment

#### Option 1: Docker (Recommended)
```bash
# Production deployment
docker-compose up -d

# Development with hot-reload
docker-compose -f docker-compose.dev.yml up -d
```

#### Option 2: Azure Container Apps (Cloud)
The repository includes Terraform configuration for Azure deployment:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

See `terraform/README.md` for detailed Azure deployment instructions.

#### Option 3: Manual Deployment
```bash
npm run build
NODE_ENV=production npm start
```

### Environment Setup

- Set secure `SESSION_SECRET`
- Configure proper CORS origins
- Enable HTTPS in production
- Set up log rotation (logs stored in `/logs` directory)
- Configure database backups (PostgreSQL for production)

## Monitoring

The application includes:
- Health check endpoints (`/health`)
- Structured logging with Winston
- WebSocket connection monitoring
- Database performance tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
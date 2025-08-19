import logger from '../utils/logger.js';

export function setupWebSockets(io, database) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join leaderboard room
    socket.on('join:leaderboard', async (leaderboardId) => {
      try {
        if (!leaderboardId) {
          socket.emit('error', { message: 'Leaderboard ID required' });
          return;
        }

        // Verify leaderboard exists
        const leaderboard = await database.statements.getLeaderboard.get(leaderboardId);
        if (!leaderboard) {
          socket.emit('error', { message: 'Leaderboard not found' });
          return;
        }

        // Join the room
        socket.join(`leaderboard:${leaderboardId}`);
        socket.leaderboardId = leaderboardId;

        logger.info(`Socket ${socket.id} joined leaderboard: ${leaderboardId}`);

        // Send initial leaderboard data
        const teams = await database.statements.getLeaderboardData.all(leaderboardId);
        const challenges = JSON.parse(leaderboard.challenges_json);
        const recentCompletions = await database.statements.getCompletionsByLeaderboard.all(leaderboardId);

        socket.emit('leaderboard:initial', {
          leaderboard: {
            id: leaderboard.id,
            name: leaderboard.name,
            status: leaderboard.status,
            createdAt: leaderboard.created_at,
            startedAt: leaderboard.started_at,
            endedAt: leaderboard.ended_at
          },
          teams,
          challenges,
          recentCompletions: recentCompletions.slice(0, 10)
        });

        // Notify others in the room about new connection
        socket.to(`leaderboard:${leaderboardId}`).emit('user:connected', {
          message: 'Someone joined the leaderboard',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        logger.error('Error joining leaderboard:', error);
        socket.emit('error', { message: 'Failed to join leaderboard' });
      }
    });

    // Leave leaderboard room
    socket.on('leave:leaderboard', (leaderboardId) => {
      if (leaderboardId) {
        socket.leave(`leaderboard:${leaderboardId}`);
        socket.leaderboardId = null;
        logger.info(`Socket ${socket.id} left leaderboard: ${leaderboardId}`);
      }
    });

    // Handle challenge completion from WebSocket
    socket.on('complete:challenge', async (data) => {
      try {
        const { challengeId, teamId } = data;

        if (!challengeId || !teamId) {
          socket.emit('error', { message: 'Challenge ID and Team ID required' });
          return;
        }

        // Verify team exists
        const team = await database.statements.getTeam.get(teamId);
        if (!team) {
          socket.emit('error', { message: 'Team not found' });
          return;
        }

        // Get leaderboard and challenges
        const leaderboard = await database.statements.getLeaderboard.get(team.leaderboard_id);
        if (!leaderboard) {
          socket.emit('error', { message: 'Leaderboard not found' });
          return;
        }

        if (leaderboard.status === 'ended') {
          socket.emit('error', { message: 'Competition has ended' });
          return;
        }

        const challenges = JSON.parse(leaderboard.challenges_json);
        const challenge = challenges.challenges?.find(c => c.id === challengeId);
        
        if (!challenge) {
          socket.emit('error', { message: 'Challenge not found' });
          return;
        }

        // Check if already completed
        const existingCompletion = await database.statements.checkCompletion.get(teamId, challengeId);
        if (existingCompletion) {
          socket.emit('error', { message: 'Challenge already completed' });
          return;
        }

        const points = challenge.points;

        // Use transaction for data consistency
        const newTotal = await database.transaction(async (client) => {
          // Add completion record
          await client.query('INSERT INTO completions (team_id, challenge_id, points) VALUES ($1, $2, $3)', [teamId, challengeId, points]);
          
          // Update team total points
          const updatedTotal = team.total_points + points;
          await client.query('UPDATE teams SET total_points = $1 WHERE id = $2', [updatedTotal, teamId]);
          
          return updatedTotal;
        });

        // Get updated leaderboard data
        const updatedTeams = await database.statements.getLeaderboardData.all(team.leaderboard_id);

        // Emit to all clients in the leaderboard room
        io.to(`leaderboard:${team.leaderboard_id}`).emit('leaderboard:update', {
          teams: updatedTeams
        });

        io.to(`leaderboard:${team.leaderboard_id}`).emit('team:completed', {
          teamId,
          teamName: team.name,
          challengeId,
          challengeTitle: challenge.title,
          points,
          newTotal,
          timestamp: new Date().toISOString()
        });

        // Confirm to the client
        socket.emit('challenge:completed', {
          challengeId,
          points,
          newTotal,
          completedAt: new Date().toISOString()
        });

        logger.info(`Challenge completed via WebSocket: ${challengeId} by team: ${teamId} for ${points} points`);

      } catch (error) {
        logger.error('Error completing challenge via WebSocket:', error);
        socket.emit('error', { message: 'Failed to complete challenge' });
      }
    });

    // Handle team registration via WebSocket
    socket.on('register:team', async (data) => {
      try {
        const { leaderboardId, teamName, members, accessCode } = data;

        if (!leaderboardId || !teamName || !members || !accessCode) {
          socket.emit('error', { message: 'All fields required for team registration' });
          return;
        }

        // Verify leaderboard and access code
        const leaderboard = await database.statements.getLeaderboardByAccessCode.get(accessCode);
        if (!leaderboard || leaderboard.id !== leaderboardId) {
          socket.emit('error', { message: 'Invalid access code' });
          return;
        }

        if (leaderboard.status !== 'active') {
          socket.emit('error', { message: 'Leaderboard is not accepting new teams' });
          return;
        }

        const teamId = generateUUID();
        const teamCode = generateUUID();

        try {
          await database.statements.createTeam.run(
            teamId,
            leaderboardId,
            teamName,
            JSON.stringify(members),
            teamCode
          );

          // Emit to all clients in the leaderboard room
          io.to(`leaderboard:${leaderboardId}`).emit('team:joined', {
            teamId,
            teamName,
            members,
            leaderboardId
          });

          // Send confirmation to registering client
          socket.emit('team:registered', {
            teamId,
            teamCode,
            teamName,
            members,
            leaderboardId
          });

          logger.info(`Team registered via WebSocket: ${teamId} for leaderboard: ${leaderboardId}`);

        } catch (dbError) {
          if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            socket.emit('error', { message: 'Team name already exists in this leaderboard' });
          } else {
            throw dbError;
          }
        }

      } catch (error) {
        logger.error('Error registering team via WebSocket:', error);
        socket.emit('error', { message: 'Failed to register team' });
      }
    });

    // Handle host actions
    socket.on('host:update_status', async (data) => {
      try {
        const { leaderboardId, status, hostCode } = data;

        if (!leaderboardId || !status || !hostCode) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        if (!['active', 'started', 'paused', 'ended'].includes(status)) {
          socket.emit('error', { message: 'Invalid status' });
          return;
        }

        // Verify host code
        const leaderboard = await database.statements.getLeaderboard.get(leaderboardId);
        if (!leaderboard || leaderboard.host_code !== hostCode) {
          socket.emit('error', { message: 'Invalid host code' });
          return;
        }

        await database.statements.updateLeaderboardStatus.run(status, leaderboardId);

        // Emit status change to all clients
        io.to(`leaderboard:${leaderboardId}`).emit('competition:status', { 
          status,
          timestamp: new Date().toISOString()
        });

        socket.emit('status:updated', { status });

        logger.info(`Leaderboard ${leaderboardId} status changed to: ${status} via WebSocket`);

      } catch (error) {
        logger.error('Error updating status via WebSocket:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle ping/pong for connection monitoring
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
      
      if (socket.leaderboardId) {
        socket.to(`leaderboard:${socket.leaderboardId}`).emit('user:disconnected', {
          message: 'Someone left the leaderboard',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Helper function to generate UUID (simple version)
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  logger.info('WebSocket server initialized');
}
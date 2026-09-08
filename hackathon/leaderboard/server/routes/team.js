import express from 'express';
import Joi from 'joi';
import logger from '../utils/logger.js';

const router = express.Router();

// Validation schemas
const completeSchema = Joi.object({
  challengeId: Joi.string().required(),
  points: Joi.number().integer().min(1).optional()
});

// Mark challenge as complete
router.post('/:teamId/complete', async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { error, value } = completeSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { challengeId, points: providedPoints } = value;

    // Verify team exists and user has access
    const team = await req.db.statements.getTeam.get(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is part of this team (session-based auth)
    if (req.session.teamId !== teamId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get leaderboard and challenges
    const leaderboard = await req.db.statements.getLeaderboard.get(team.leaderboard_id);
    if (!leaderboard) {
      return res.status(404).json({ error: 'Leaderboard not found' });
    }

    if (leaderboard.status === 'ended') {
      return res.status(400).json({ error: 'Competition has ended' });
    }

    const challenges = JSON.parse(leaderboard.challenges_json);
    const challenge = challenges.challenges?.find(c => c.id === challengeId);
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if already completed
    const existingCompletion = await req.db.statements.checkCompletion.get(teamId, challengeId);
    if (existingCompletion) {
      return res.status(400).json({ error: 'Challenge already completed' });
    }

    const points = providedPoints || challenge.points;

    // Use transaction to ensure data consistency
    let newTotal;
    
    if (req.db.sqlite) {
      // SQLite transaction - use synchronous callback
      newTotal = await req.db.transaction((dbOrClient) => {
        const updatedTotal = team.total_points + points;
        dbOrClient.prepare('INSERT INTO completions (team_id, challenge_id, points) VALUES (?, ?, ?)').run(teamId, challengeId, points);
        dbOrClient.prepare('UPDATE teams SET total_points = ? WHERE id = ?').run(updatedTotal, teamId);
        return updatedTotal;
      });
    } else {
      // PostgreSQL transaction - use async callback
      newTotal = await req.db.transaction(async (dbOrClient) => {
        const updatedTotal = team.total_points + points;
        await dbOrClient.query('INSERT INTO completions (team_id, challenge_id, points) VALUES ($1, $2, $3)', [teamId, challengeId, points]);
        await dbOrClient.query('UPDATE teams SET total_points = $1 WHERE id = $2', [updatedTotal, teamId]);
        return updatedTotal;
      });
    }

    // Get updated leaderboard data
    const updatedTeams = await req.db.statements.getLeaderboardData.all(team.leaderboard_id);

    // Emit real-time updates
    req.io.to(`leaderboard:${team.leaderboard_id}`).emit('leaderboard:update', {
      teams: updatedTeams
    });

    req.io.to(`leaderboard:${team.leaderboard_id}`).emit('team:completed', {
      teamId,
      teamName: team.name,
      challengeId,
      challengeTitle: challenge.title,
      points,
      newTotal,
      timestamp: new Date().toISOString()
    });

    logger.info(`Challenge completed: ${challengeId} by team: ${teamId} for ${points} points`);

    res.json({
      challengeId,
      points,
      newTotal,
      completedAt: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// Mark challenge as incomplete
router.post('/:teamId/incomplete', async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: 'Challenge ID is required' });
    }

    // Get team
    const team = await req.db.statements.getTeam.get(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is part of this team (session-based auth)
    if (req.session.teamId !== teamId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get leaderboard and challenges
    const leaderboard = await req.db.statements.getLeaderboard.get(team.leaderboard_id);
    if (!leaderboard) {
      return res.status(404).json({ error: 'Leaderboard not found' });
    }

    const challenges = JSON.parse(leaderboard.challenges_json);
    const challenge = challenges.challenges?.find(c => c.id === challengeId);
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if challenge is completed
    const existingCompletion = await req.db.statements.checkCompletion.get(teamId, challengeId);
    if (!existingCompletion) {
      return res.status(400).json({ error: 'Challenge is not completed' });
    }

    // Use transaction to ensure data consistency
    let newTotal;
    
    if (req.db.sqlite) {
      // SQLite transaction - use synchronous callback
      newTotal = await req.db.transaction((dbOrClient) => {
        const updatedTotal = team.total_points - existingCompletion.points;
        dbOrClient.prepare('DELETE FROM completions WHERE team_id = ? AND challenge_id = ?').run(teamId, challengeId);
        dbOrClient.prepare('UPDATE teams SET total_points = ? WHERE id = ?').run(updatedTotal, teamId);
        return updatedTotal;
      });
    } else {
      // PostgreSQL transaction - use async callback
      newTotal = await req.db.transaction(async (dbOrClient) => {
        const updatedTotal = team.total_points - existingCompletion.points;
        await dbOrClient.query('DELETE FROM completions WHERE team_id = $1 AND challenge_id = $2', [teamId, challengeId]);
        await dbOrClient.query('UPDATE teams SET total_points = $1 WHERE id = $2', [updatedTotal, teamId]);
        return updatedTotal;
      });
    }

    // Get updated leaderboard data
    const updatedTeams = await req.db.statements.getLeaderboardData.all(team.leaderboard_id);

    // Emit real-time updates
    req.io.to(`leaderboard:${team.leaderboard_id}`).emit('leaderboard:update', {
      teams: updatedTeams
    });

    req.io.to(`leaderboard:${team.leaderboard_id}`).emit('team:incomplete', {
      teamId,
      teamName: team.name,
      challengeId,
      challengeTitle: challenge.title,
      pointsRemoved: existingCompletion.points,
      newTotal,
      timestamp: new Date().toISOString()
    });

    logger.info(`Challenge marked incomplete: ${challengeId} by team: ${teamId}, removed ${existingCompletion.points} points`);

    res.json({
      challengeId,
      pointsRemoved: existingCompletion.points,
      newTotal,
      markedIncompleteAt: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// Get team progress
router.get('/:teamId/progress', async (req, res, next) => {
  try {
    const { teamId } = req.params;
    
    const team = await req.db.statements.getTeam.get(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const completions = await req.db.statements.getTeamCompletions.all(teamId);
    const leaderboard = await req.db.statements.getLeaderboard.get(team.leaderboard_id);
    const challenges = JSON.parse(leaderboard.challenges_json);
    
    // Filter out disabled challenges from counting
    const enabledChallenges = challenges.challenges?.filter(challenge => challenge.enabled !== false) || [];
    
    // Calculate progress stats (only counting enabled challenges)
    const totalChallenges = enabledChallenges.length;
    const completedChallenges = completions.filter(completion => {
      const challenge = enabledChallenges.find(c => c.id === completion.challenge_id);
      return challenge; // Only count completions for enabled challenges
    }).length;
    const totalPossiblePoints = enabledChallenges.reduce((sum, c) => sum + c.points, 0);

    // Get current rank
    const leaderboardData = await req.db.statements.getLeaderboardData.all(team.leaderboard_id);
    const currentRank = leaderboardData.find(t => t.id === teamId)?.rank || 0;

    // Progress by category (only considering enabled challenges)
    const categoryProgress = {};
    if (challenges.categories) {
      challenges.categories.forEach(category => {
        const categoryCompletions = completions.filter(completion => {
          const challenge = enabledChallenges.find(c => c.id === completion.challenge_id);
          return challenge && challenge.category === category.id;
        });
        
        const categoryChallenges = enabledChallenges.filter(c => c.category === category.id);
        
        categoryProgress[category.id] = {
          name: category.name,
          completed: categoryCompletions.length,
          total: categoryChallenges.length,
          points: categoryCompletions.reduce((sum, c) => sum + c.points, 0),
          totalPoints: categoryChallenges.reduce((sum, c) => sum + c.points, 0)
        };
      });
    }

    res.json({
      teamId,
      teamName: team.name,
      members: JSON.parse(team.members),
      totalPoints: team.total_points,
      currentRank,
      completedChallenges,
      totalChallenges,
      totalPossiblePoints,
      completions,
      categoryProgress,
      progressPercentage: totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0
    });
  } catch (err) {
    next(err);
  }
});

// Get team details
router.get('/:teamId', async (req, res, next) => {
  try {
    const { teamId } = req.params;
    
    const team = await req.db.statements.getTeam.get(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({
      id: team.id,
      name: team.name,
      members: JSON.parse(team.members),
      totalPoints: team.total_points,
      leaderboardId: team.leaderboard_id,
      createdAt: team.created_at
    });
  } catch (err) {
    next(err);
  }
});

export default router;
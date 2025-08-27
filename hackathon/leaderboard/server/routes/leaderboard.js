import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import logger from '../utils/logger.js';
import { generateAccessCode, validateChallengesJSON } from '../utils/helpers.js';

const router = express.Router();

// Validation schemas
const createLeaderboardSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  challenges: Joi.object().required()
});

const joinLeaderboardSchema = Joi.object({
  teamName: Joi.string().min(1).max(50).required(),
  members: Joi.array().items(Joi.string().min(1).max(50)).min(1).max(20).required(),
  accessCode: Joi.string().length(6).required()
});

// Create new leaderboard
router.post('/create', async (req, res, next) => {
  try {
    const { error, value } = createLeaderboardSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, challenges } = value;
    
    // Validate challenges JSON structure
    if (!validateChallengesJSON(challenges)) {
      return res.status(400).json({ error: 'Invalid challenges format' });
    }

    const leaderboardId = uuidv4();
    const hostCode = uuidv4();
    const accessCode = generateAccessCode();

    await req.db.statements.createLeaderboard.run(
      leaderboardId,
      name,
      hostCode,
      accessCode,
      JSON.stringify(challenges)
    );

    // Store host session
    req.session.hostCode = hostCode;
    req.session.leaderboardId = leaderboardId;

    logger.info(`Leaderboard created: ${leaderboardId} by host: ${hostCode}`);

    res.status(201).json({
      leaderboardId,
      hostCode,
      accessCode,
      name
    });
  } catch (err) {
    next(err);
  }
});

// Get leaderboard details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const leaderboard = await req.db.statements.getLeaderboard.get(id);
    if (!leaderboard) {
      return res.status(404).json({ error: 'Leaderboard not found' });
    }

    const teams = await req.db.statements.getLeaderboardData.all(id);
    const challenges = JSON.parse(leaderboard.challenges_json);
    const recentCompletions = await req.db.statements.getCompletionsByLeaderboard.all(id);

    // Filter out disabled challenges for counting purposes
    const enabledChallenges = challenges.challenges?.filter(challenge => challenge.enabled !== false) || [];
    const enabledChallengeIds = new Set(enabledChallenges.map(c => c.id));

    // Recalculate completed_challenges for each team considering only enabled challenges
    const teamsWithCorrectedCounts = await Promise.all(teams.map(async (team) => {
      const teamCompletions = await req.db.statements.getTeamCompletions.all(team.id);
      const enabledCompletions = teamCompletions.filter(completion => 
        enabledChallengeIds.has(completion.challenge_id)
      );
      
      return {
        ...team,
        completed_challenges: enabledCompletions.length
      };
    }));

    res.json({
      id: leaderboard.id,
      name: leaderboard.name,
      status: leaderboard.status,
      accessCode: leaderboard.access_code,
      challenges,
      teams: teamsWithCorrectedCounts,
      recentCompletions: recentCompletions.slice(0, 10),
      createdAt: leaderboard.created_at,
      startedAt: leaderboard.started_at,
      endedAt: leaderboard.ended_at
    });
  } catch (err) {
    next(err);
  }
});

// Join leaderboard (team registration) - legacy endpoint
router.post('/:id/join', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = joinLeaderboardSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { teamName, members, accessCode } = value;

    // Verify leaderboard exists and access code is correct
    const leaderboard = await req.db.statements.getLeaderboardByAccessCode.get(accessCode);
    if (!leaderboard || leaderboard.id !== id) {
      return res.status(400).json({ error: 'Invalid access code' });
    }

    if (leaderboard.status !== 'active') {
      return res.status(400).json({ error: 'Leaderboard is not accepting new teams' });
    }

    const teamId = uuidv4();
    const teamCode = uuidv4();

    try {
      await req.db.statements.createTeam.run(
        teamId,
        id,
        teamName,
        JSON.stringify(members),
        teamCode
      );

      // Store team session
      req.session.teamId = teamId;
      req.session.teamCode = teamCode;
      req.session.leaderboardId = id;

      logger.info(`Team registered: ${teamId} for leaderboard: ${id}`);

      // Emit to all clients in the leaderboard room
      req.io.to(`leaderboard:${id}`).emit('team:joined', {
        teamId,
        teamName,
        members,
        leaderboardId: id
      });

      res.status(201).json({
        teamId,
        teamCode,
        teamName,
        members,
        leaderboardId: id
      });
    } catch (dbError) {
      if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Team name already exists in this leaderboard' });
      }
      throw dbError;
    }
  } catch (err) {
    next(err);
  }
});

// Join leaderboard by access code only - simplified endpoint
router.post('/join', async (req, res, next) => {
  try {
    const { error, value } = joinLeaderboardSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { teamName, members, accessCode } = value;

    // Find leaderboard by access code
    const leaderboard = await req.db.statements.getLeaderboardByAccessCode.get(accessCode);
    if (!leaderboard) {
      return res.status(400).json({ error: 'Invalid access code' });
    }

    const leaderboardId = leaderboard.id;

    if (leaderboard.status !== 'active') {
      return res.status(400).json({ error: 'Leaderboard is not accepting new teams' });
    }

    const teamId = uuidv4();
    const teamCode = uuidv4();

    try {
      await req.db.statements.createTeam.run(
        teamId,
        leaderboardId,
        teamName,
        JSON.stringify(members),
        teamCode
      );

      // Store team session
      req.session.teamId = teamId;
      req.session.teamCode = teamCode;
      req.session.leaderboardId = leaderboardId;

      logger.info(`Team registered: ${teamId} for leaderboard: ${leaderboardId}`);

      // Emit to all clients in the leaderboard room
      req.io.to(`leaderboard:${leaderboardId}`).emit('team:joined', {
        teamId,
        teamName,
        members,
        leaderboardId
      });

      res.status(201).json({
        teamId,
        teamCode,
        teamName,
        members,
        leaderboardId
      });
    } catch (dbError) {
      if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Team name already exists in this leaderboard' });
      }
      throw dbError;
    }
  } catch (err) {
    next(err);
  }
});

// Get teams for leaderboard
router.get('/:id/teams', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const leaderboard = await req.db.statements.getLeaderboard.get(id);
    if (!leaderboard) {
      return res.status(404).json({ error: 'Leaderboard not found' });
    }

    const teams = await req.db.statements.getLeaderboardData.all(id);
    
    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

// Get challenges for leaderboard
router.get('/:id/challenges', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const leaderboard = await req.db.statements.getLeaderboard.get(id);
    if (!leaderboard) {
      return res.status(404).json({ error: 'Leaderboard not found' });
    }

    const challenges = JSON.parse(leaderboard.challenges_json);
    
    res.json({ challenges });
  } catch (err) {
    next(err);
  }
});

// Update leaderboard status (host only)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'started', 'paused', 'ended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user is host
    const leaderboard = await req.db.statements.getLeaderboard.get(id);
    if (!leaderboard) {
      return res.status(404).json({ error: 'Leaderboard not found' });
    }

    // Simple session-based auth (in production, use proper JWT)
    if (req.session.leaderboardId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await req.db.statements.updateLeaderboardStatus.run(status, id);

    // Emit status change to all clients
    req.io.to(`leaderboard:${id}`).emit('competition:status', { status });

    logger.info(`Leaderboard ${id} status changed to: ${status}`);

    res.json({ status });
  } catch (err) {
    next(err);
  }
});

export default router;
import express from 'express';
import Joi from 'joi';
import logger from '../utils/logger.js';

const router = express.Router();

// Validation schemas
const teamAuthSchema = Joi.object({
  teamCode: Joi.string().required()
});

const teamJoinSchema = Joi.object({
  teamCode: Joi.string().required(),
  memberName: Joi.string().min(1).max(50).optional(),
  existingMember: Joi.string().min(1).max(50).optional(),
  isNewMember: Joi.boolean().required()
});

const hostAuthSchema = Joi.object({
  hostCode: Joi.string().required()
});

// Team authentication
router.post('/team', async (req, res, next) => {
  try {
    const { error, value } = teamAuthSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { teamCode } = value;

    const team = await req.db.statements.getTeamByCode.get(teamCode);
    if (!team) {
      return res.status(404).json({ error: 'Invalid team code' });
    }

    // Set session
    req.session.teamId = team.id;
    req.session.teamCode = teamCode;
    req.session.leaderboardId = team.leaderboard_id;

    logger.info(`Team authenticated: ${team.id}`);

    res.json({
      teamId: team.id,
      teamCode: team.team_code,
      teamName: team.name,
      members: JSON.parse(team.members),
      leaderboardId: team.leaderboard_id,
      totalPoints: team.total_points
    });
  } catch (err) {
    next(err);
  }
});

// Get team info for join decision (don't authenticate yet)
router.post('/team/info', async (req, res, next) => {
  try {
    const { error, value } = teamAuthSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { teamCode } = value;

    const team = await req.db.statements.getTeamByCode.get(teamCode);
    if (!team) {
      return res.status(404).json({ error: 'Invalid team code' });
    }

    res.json({
      teamId: team.id,
      teamName: team.name,
      members: JSON.parse(team.members),
      totalPoints: team.total_points
    });
  } catch (err) {
    next(err);
  }
});

// Enhanced team join (existing or new member)
router.post('/team/join', async (req, res, next) => {
  try {
    const { error, value } = teamJoinSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { teamCode, memberName, existingMember, isNewMember } = value;

    const team = await req.db.statements.getTeamByCode.get(teamCode);
    if (!team) {
      return res.status(404).json({ error: 'Invalid team code' });
    }

    let members = JSON.parse(team.members);
    let selectedMember;

    if (isNewMember) {
      // Add new member to team
      if (!memberName || !memberName.trim()) {
        return res.status(400).json({ error: 'Member name is required for new members' });
      }
      
      // Check if member name already exists
      if (members.includes(memberName.trim())) {
        return res.status(400).json({ error: 'Member name already exists in this team' });
      }

      members.push(memberName.trim());
      selectedMember = memberName.trim();
      
      // Update team in database using transaction
      if (req.db.sqlite) {
        // SQLite transaction - use synchronous callback
        await req.db.transaction((dbOrClient) => {
          dbOrClient.prepare('UPDATE teams SET members = ? WHERE id = ?').run(JSON.stringify(members), team.id);
        });
      } else {
        // PostgreSQL transaction - use async callback
        await req.db.transaction(async (dbOrClient) => {
          await dbOrClient.query('UPDATE teams SET members = $1 WHERE id = $2', [JSON.stringify(members), team.id]);
        });
      }
      
      logger.info(`New member "${memberName}" added to team: ${team.id}`);
    } else {
      // Existing member
      if (!existingMember || !members.includes(existingMember)) {
        return res.status(400).json({ error: 'Selected member does not exist in this team' });
      }
      selectedMember = existingMember;
      
      logger.info(`Existing member "${existingMember}" joined team: ${team.id}`);
    }

    // Set session
    req.session.teamId = team.id;
    req.session.teamCode = teamCode;
    req.session.leaderboardId = team.leaderboard_id;
    req.session.memberName = selectedMember;

    res.json({
      teamId: team.id,
      teamCode: team.team_code,
      teamName: team.name,
      members: members,
      selectedMember: selectedMember,
      leaderboardId: team.leaderboard_id,
      totalPoints: team.total_points,
      isNewMember
    });
  } catch (err) {
    next(err);
  }
});

// Host authentication
router.post('/host', async (req, res, next) => {
  try {
    const { error, value } = hostAuthSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { hostCode } = value;

    const leaderboard = await req.db.statements.getLeaderboardByHostCode.get(hostCode);
    if (!leaderboard) {
      return res.status(404).json({ error: 'Invalid host code' });
    }

    // Set session
    req.session.hostCode = hostCode;
    req.session.leaderboardId = leaderboard.id;

    logger.info(`Host authenticated for leaderboard: ${leaderboard.id}`);

    res.json({
      hostCode: hostCode,
      leaderboardId: leaderboard.id,
      leaderboardName: leaderboard.name,
      accessCode: leaderboard.access_code,
      status: leaderboard.status
    });
  } catch (err) {
    next(err);
  }
});

// Get current session info
router.get('/session', async (req, res) => {
  try {
    const sessionInfo = {
      isAuthenticated: !!(req.session.teamId || req.session.hostCode),
      userType: req.session.teamId ? 'team' : req.session.hostCode ? 'host' : null,
      teamId: req.session.teamId || null,
      hostCode: req.session.hostCode || null,
      leaderboardId: req.session.leaderboardId || null
    };

    // If it's a team session, get additional team info
    if (req.session.teamId) {
      const team = await req.db.statements.getTeam.get(req.session.teamId);
      if (team) {
        sessionInfo.teamCode = team.team_code;
        sessionInfo.teamName = team.name;
        sessionInfo.members = JSON.parse(team.members);
        sessionInfo.totalPoints = team.total_points;
      }
    }

    // If it's a host session, get additional leaderboard info
    if (req.session.hostCode && req.session.leaderboardId) {
      const leaderboard = await req.db.statements.getLeaderboard.get(req.session.leaderboardId);
      if (leaderboard) {
        sessionInfo.leaderboardName = leaderboard.name;
        sessionInfo.accessCode = leaderboard.access_code;
        sessionInfo.status = leaderboard.status;
      }
    }

    res.json(sessionInfo);
  } catch (error) {
    console.error('Session info error:', error);
    res.json({
      isAuthenticated: false,
      userType: null,
      teamId: null,
      hostCode: null,
      leaderboardId: null
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destroy error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;
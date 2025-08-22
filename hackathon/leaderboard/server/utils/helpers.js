/**
 * Generate a 6-character access code
 */
export function generateAccessCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Calculate total points from challenges
 */
export function calculateTotalPoints(challenges) {
  if (!Array.isArray(challenges)) return 0;
  return challenges.reduce((total, challenge) => total + (challenge.points || 0), 0);
}

/**
 * Validate challenges JSON structure
 */
export function validateChallengesJSON(data) {
  try {
    // Check required top-level properties
    if (!data || typeof data !== 'object') return false;
    if (!data.metadata || !data.categories || !data.challenges) return false;
    
    // Calculate and add total_points to metadata if not present
    if (!data.metadata.total_points) {
      data.metadata.total_points = calculateTotalPoints(data.challenges);
    }
    
    // Validate metadata
    const { metadata } = data;
    if (!metadata.title || !metadata.description || !metadata.version) return false;
    
    // Validate categories
    const { categories } = data;
    if (!Array.isArray(categories) || categories.length === 0) return false;
    
    const categoryIds = new Set();
    for (const category of categories) {
      if (!category.id || !category.name || !category.icon || !category.color) return false;
      if (categoryIds.has(category.id)) return false; // Check for duplicates
      categoryIds.add(category.id);
    }
    
    // Validate challenges
    const { challenges } = data;
    if (!Array.isArray(challenges) || challenges.length === 0) return false;
    
    const challengeIds = new Set();
    for (const challenge of challenges) {
      if (!challenge.id || !challenge.category || !challenge.title || 
          !challenge.short_name || !challenge.description || !challenge.skill_level || 
          typeof challenge.points !== 'number') return false;
      
      if (challengeIds.has(challenge.id)) return false; // Check for duplicates
      challengeIds.add(challenge.id);
      
      // Check if category exists
      if (!categoryIds.has(challenge.category)) return false;
      
      // Points should be positive
      if (challenge.points <= 0) return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Calculate team statistics
 */
export function calculateTeamStats(completions, challenges) {
  const stats = {
    totalPoints: 0,
    challengesCompleted: completions.length,
    categoryBreakdown: {},
    recentActivity: completions.slice(0, 5).map(c => ({
      challengeId: c.challenge_id,
      points: c.points,
      completedAt: c.completed_at
    }))
  };

  // Calculate total points and category breakdown
  completions.forEach(completion => {
    stats.totalPoints += completion.points;
    
    const challenge = challenges.find(c => c.id === completion.challenge_id);
    if (challenge) {
      if (!stats.categoryBreakdown[challenge.category]) {
        stats.categoryBreakdown[challenge.category] = {
          completed: 0,
          points: 0
        };
      }
      stats.categoryBreakdown[challenge.category].completed += 1;
      stats.categoryBreakdown[challenge.category].points += completion.points;
    }
  });

  return stats;
}

/**
 * Format leaderboard data with rankings
 */
export function formatLeaderboardData(teams, completions, challenges) {
  return teams.map(team => {
    const teamCompletions = completions.filter(c => c.team_id === team.id);
    const stats = calculateTeamStats(teamCompletions, challenges);
    
    return {
      id: team.id,
      name: team.name,
      members: JSON.parse(team.members),
      totalPoints: team.total_points,
      challengesCompleted: stats.challengesCompleted,
      categoryBreakdown: stats.categoryBreakdown,
      recentActivity: stats.recentActivity,
      createdAt: team.created_at
    };
  }).sort((a, b) => {
    // Sort by points (desc), then by creation time (asc) for tiebreaker
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  }).map((team, index) => ({
    ...team,
    rank: index + 1
  }));
}

/**
 * Generate team initials for avatar
 */
export function generateTeamInitials(teamName) {
  return teamName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Generate color from string (for consistent team colors)
 */
export function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
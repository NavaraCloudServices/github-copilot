import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Target, 
  CheckCircle2,
  Circle,
  Star,
  Clock,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Filter,
  Search,
  Award,
  Eye,
  Copy,
  Check,
  Hash
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import { leaderboardApi, teamApi } from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/Common/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Common/Card';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Modal from '../components/Common/Modal';
import { TextWithLinks } from '../utils/textUtils.jsx';
// Removed additional tabs (PublicLeaderboard, Resources)

// Bingo Card Style Challenge Card Component
const ChallengeCard = ({ challenge, isCompleted, onComplete, onIncomplete, onShowDetails, categories }) => {
  // Find the category object to get the color
  const categoryObj = categories.find(cat => cat.id === challenge.category);
  const categoryColor = categoryObj?.color || '#10B981'; // Default to green if not found
  
  // Generate dynamic styles based on category color
  const getCategoryStyles = (color) => {
    // Convert hex to RGB for opacity effects
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 16, g: 185, b: 129 }; // Default green
    };
    
    const rgb = hexToRgb(color);
    
    // Check if we're in dark mode (simplified check)
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                       window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return {
      bg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDarkMode ? 0.2 : 0.1})`,
      border: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDarkMode ? 0.5 : 0.3})`,
      text: color
    };
  };

  const categoryStyle = getCategoryStyles(categoryColor);

  // Create CSS custom properties for dynamic theming
  const cssVariables = {
    '--category-color': categoryColor,
    '--category-bg': categoryStyle.bg,
    '--category-border': categoryStyle.border
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isCompleted ? 1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative aspect-square rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isCompleted 
          ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-600 shadow-green-200/50 dark:shadow-green-800/20 shadow-lg' 
          : ''
      }`}
      style={{
        ...cssVariables,
        backgroundColor: isCompleted ? undefined : categoryStyle.bg,
        borderColor: isCompleted ? undefined : categoryStyle.border
      }}
      onClick={onShowDetails}
    >
      {/* Completion Stamp */}
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-green-500/10">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 500 }}
            className="bg-green-500 text-white rounded-full p-3"
          >
            <CheckCircle2 className="h-8 w-8" />
          </motion.div>
        </div>
      )}

      <div className="p-4 h-full flex flex-col">
        {/* Header - Points only */}
        <div className="flex justify-end mb-3">
          <div className="flex items-center gap-1 text-sm font-bold text-gray-700 dark:text-gray-300">
            <Star className="h-3 w-3" />
            {challenge.points}
          </div>
        </div>

        {/* Skill Level Tag - Above Title */}
        <div className="flex justify-center mb-2">
          <div 
            className="px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: categoryColor }}
          >
            {challenge.skill_level}
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 flex items-center justify-center text-center px-2 min-h-0">
          <h3 className={`text-sm font-bold leading-none line-clamp-3 ${
            isCompleted ? 'text-green-700 dark:text-green-300' : 'text-navara-navy dark:text-white'
          }`}
          style={{
            color: isCompleted ? undefined : categoryColor,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {challenge.title || challenge.short_name}
          </h3>
        </div>

        {/* Category - Bottom Right Corner */}
        <div className="absolute bottom-2 right-2">
          <span className="text-xs italic text-gray-500 dark:text-gray-400">
            {categoryObj?.name || 'General'}
          </span>
        </div>

        {/* Action Buttons (show on hover) */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 left-2 right-2"
          >
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="w-full text-xs"
            >
              <Circle className="h-3 w-3 mr-1" />
              Complete
            </Button>
          </motion.div>
        )}
        
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 left-2 right-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onIncomplete();
              }}
              className="w-full text-xs"
            >
              <Circle className="h-3 w-3 mr-1" />
              Mark Incomplete
            </Button>
          </motion.div>
        )}
      </div>

      {/* Category Color Strip */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl`}
        style={{ backgroundColor: categoryColor }}
      />
    </motion.div>
  );
};

// Challenge Detail Modal
const ChallengeDetailModal = ({ challenge, isOpen, onClose, onComplete, onIncomplete, isCompleted, categories }) => {
  if (!challenge) return null;

  // Find the category object to get the color
  const categoryObj = categories?.find(cat => cat.id === challenge.category);
  const categoryColor = categoryObj?.color || '#10B981'; // Default to green if not found

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={challenge.title}
      size="full"
    >
      <div className="space-y-6">
        {/* Challenge Info */}
        <div className="flex items-center gap-4">
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: categoryColor }}
          >
            {challenge.skill_level}
          </span>
          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Star className="h-4 w-4" />
            {challenge.points} points
          </span>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-semibold text-navara-navy dark:text-white mb-2">Description</h4>
          <p className="text-github-dark-gray dark:text-github-light-gray">
            <TextWithLinks text={challenge.description} />
          </p>
        </div>

        {/* Goal */}
        {challenge.goal && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-navara-blue dark:text-blue-200 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goal
            </h4>
            <p className="text-navara-blue dark:text-blue-300">
              <TextWithLinks text={challenge.goal} />
            </p>
          </div>
        )}

        {/* Hints */}
        {challenge.hints && challenge.hints.length > 0 && (
          <div>
            <h4 className="font-semibold text-navara-navy dark:text-white mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              Hints
            </h4>
            <ul className="space-y-2">
              {challenge.hints.map((hint, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-github-dark-gray dark:text-github-light-gray">
                    <TextWithLinks text={hint} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Criteria */}
        {challenge.success_criteria && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Success Criteria
            </h4>
            <p className="text-green-800 dark:text-green-300">
              <TextWithLinks text={challenge.success_criteria} />
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {!isCompleted ? (
            <Button
              variant="primary"
              onClick={onComplete}
              className="flex-1"
            >
              Mark as Complete
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onIncomplete}
              className="flex-1"
            >
              Mark as Incomplete
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

const TeamView = () => {
  const { leaderboardId } = useParams();
  const { user, isTeam } = useAuth();
  const [leaderboard, setLeaderboard] = useState(null);
  const [teamProgress, setTeamProgress] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [skillLevelFilter, setSkillLevelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTeamCode, setCopiedTeamCode] = useState(false);
  // Single tab view – removed other tabs

  const {
    connected,
    teams,
    leaderboardData,
    recentCompletions,
    completeChallenge
  } = useWebSocket(leaderboardId);

  useEffect(() => {
    if (leaderboardId && user?.teamId) {
      loadData();
    }
  }, [leaderboardId, user?.teamId]);

  const loadData = async () => {
    try {
      const [leaderboardResponse, progressResponse] = await Promise.all([
        leaderboardApi.get(leaderboardId),
        teamApi.getProgress(user.teamId)
      ]);
      
      setLeaderboard(leaderboardResponse.data);
      setTeamProgress(progressResponse.data);
      
      // Set completed challenges
      const completed = new Set(progressResponse.data.completions.map(c => c.challenge_id));
      setCompletedChallenges(completed);
      
    } catch (error) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      await teamApi.completeChallenge(user.teamId, challengeId);
      
      // Update local state
      setCompletedChallenges(prev => new Set([...prev, challengeId]));
      
      // Refresh progress data
      const progressResponse = await teamApi.getProgress(user.teamId);
      setTeamProgress(progressResponse.data);
      
      setShowDetailModal(false);
      toast.success('Challenge completed! 🎉');
    } catch (error) {
      toast.error(error.message || 'Failed to complete challenge');
    }
  };

  const handleIncompleteChallenge = async (challengeId) => {
    try {
      await teamApi.incompleteChallenge(user.teamId, challengeId);
      
      // Update local state
      setCompletedChallenges(prev => {
        const newSet = new Set(prev);
        newSet.delete(challengeId);
        return newSet;
      });
      
      // Refresh progress data
      const progressResponse = await teamApi.getProgress(user.teamId);
      setTeamProgress(progressResponse.data);
      
      setShowDetailModal(false);
      toast.success('Challenge marked as incomplete');
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete challenge');
    }
  };

  const copyTeamCode = async () => {
    if (user?.teamCode) {
      try {
        await navigator.clipboard.writeText(user.teamCode);
        setCopiedTeamCode(true);
        toast.success('Team code copied! Share this with team members to let them join.');
        setTimeout(() => setCopiedTeamCode(false), 2000);
      } catch (error) {
        toast.error('Failed to copy team code');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading team dashboard..." />;
  }

  if (!isTeam || !leaderboard || !teamProgress) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this team dashboard.</p>
      </div>
    );
  }

  const currentStatus = leaderboardData?.status || leaderboard.status;
  const allChallenges = leaderboard.challenges?.challenges || [];
  // Filter out disabled challenges from the base set
  const challenges = allChallenges.filter(challenge => challenge.enabled !== false);
  const categories = leaderboard.challenges?.categories || [];
  // Removed resources tab: resources variable no longer needed
  const currentTeam = teams.find(t => t.id === user.teamId);
  const teamRank = teams.findIndex(t => t.id === user.teamId) + 1;

  // Get unique skill levels from enabled challenges only
  const skillLevels = [...new Set(challenges.map(challenge => challenge.skill_level))].filter(Boolean).sort();

  // Filter and sort challenges
  const filteredChallenges = challenges.filter(challenge => {
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && completedChallenges.has(challenge.id)) ||
      (filter === 'incomplete' && !completedChallenges.has(challenge.id)) ||
      (filter !== 'all' && filter !== 'completed' && filter !== 'incomplete' && challenge.category === filter);

    const matchesSkillLevel = skillLevelFilter === 'all' || challenge.skill_level === skillLevelFilter;

    const matchesSearch = searchQuery === '' || 
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSkillLevel && matchesSearch;
  }).sort((a, b) => {
    // First sort by category (alphabetically by category name)
    const categoryA = categories.find(cat => cat.id === a.category)?.name || a.category;
    const categoryB = categories.find(cat => cat.id === b.category)?.name || b.category;
    
    if (categoryA !== categoryB) {
      return categoryA.localeCompare(categoryB);
    }
    
    // Then sort by skill level (Beginner -> Intermediate -> Advanced)
    const skillLevelOrder = { 
      'beginner': 1, 
      'intermediate': 2, 
      'advanced': 3 
    };
    const skillA = skillLevelOrder[a.skill_level?.toLowerCase()] || 999;
    const skillB = skillLevelOrder[b.skill_level?.toLowerCase()] || 999;
    
    if (skillA !== skillB) {
      return skillA - skillB;
    }
    
    // Finally, sort by title as a tiebreaker
    return a.title.localeCompare(b.title);
  });

  // Tabs removed – only dashboard content is rendered

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-navara-navy dark:text-white mb-2">
            Team Dashboard{teamProgress?.teamName ? ` - ${teamProgress.teamName}` : ''}
          </h1>
          <div className="flex items-center gap-4 text-sm text-github-dark-gray dark:text-github-light-gray">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {teamProgress.teamName}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Rank #{teamRank} ({teamProgress.totalPoints} points)
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {teamProgress.completedChallenges}/{teamProgress.totalChallenges} challenges
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicators removed */}
        </div>
      </motion.div>

          {/* Footer Copilot Challenges Link */}

      {/* Dashboard Content (only tab) */}
      <motion.div
        key="dashboard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-navara-navy dark:text-white">
                      {teamProgress.totalPoints}
                    </div>
                    <div className="text-sm text-github-dark-gray dark:text-github-light-gray">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-navara-navy dark:text-white">
                      #{teamRank}
                    </div>
                    <div className="text-sm text-github-dark-gray dark:text-github-light-gray">Current Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-navara-navy dark:text-white">
                      {teamProgress.completedChallenges}
                    </div>
                    <div className="text-sm text-github-dark-gray dark:text-github-light-gray">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-navara-navy dark:text-white">
                      {teamProgress.progressPercentage}%
                    </div>
                    <div className="text-sm text-github-dark-gray dark:text-github-light-gray">Progress</div>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-github-dark-gray dark:text-github-light-gray mb-1">
                    <span>Overall Progress</span>
                    <span>{teamProgress.completedChallenges} / {teamProgress.totalChallenges}</span>
                  </div>
                  <div className="w-full bg-github-light-gray dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${teamProgress.progressPercentage}%` }}
                      transition={{ duration: 1 }}
                      className="h-3 bg-gradient-to-r from-navara-blue to-blue-600 rounded-full"
                    />
                  </div>
                </div>

                {/* Category Progress */}
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(teamProgress.categoryProgress || {}).map(([categoryId, progress]) => {
                    const category = categories.find(c => c.id === categoryId);
                    const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
                    
                    return (
                      <div key={categoryId} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category?.color || '#6B7280' }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-navara-navy dark:text-white">
                              {progress.name}
                            </span>
                            <span className="text-github-dark-gray dark:text-github-light-gray">
                              {progress.completed}/{progress.total}
                            </span>
                          </div>
                          <div className="w-full bg-github-light-gray dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: category?.color || '#6B7280'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Challenges Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Challenges ({filteredChallenges.length})
                  </CardTitle>
                  
                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search challenges..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 md:w-64"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="input md:w-48"
                    >
                      <option value="all">All Categories</option>
                      <option value="completed">Completed</option>
                      <option value="incomplete">Incomplete</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    {/* Skill Level Filter */}
                    <select
                      value={skillLevelFilter}
                      onChange={(e) => setSkillLevelFilter(e.target.value)}
                      className="input md:w-40"
                    >
                      <option value="all">All Levels</option>
                      {skillLevels.map(skillLevel => (
                        <option key={skillLevel} value={skillLevel}>
                          {skillLevel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Bingo Progress Indicator */}
                {filteredChallenges.length > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="font-semibold text-navara-navy dark:text-white">Challenge Bingo Progress</span>
                      </div>
                      <div className="text-sm text-github-dark-gray dark:text-github-light-gray">
                        {filteredChallenges.filter(c => completedChallenges.has(c.id)).length} / {filteredChallenges.length} completed
                      </div>
                    </div>
                    
                    {/* Category completion indicators */}
                    <div className="flex gap-2 flex-wrap">
                      {categories.map(category => {
                        const categorySteps = filteredChallenges.filter(c => c.category === category.id);
                        const completedInCategory = categorySteps.filter(c => completedChallenges.has(c.id)).length;
                        const isFullyCompleted = categorySteps.length > 0 && completedInCategory === categorySteps.length;
                        
                        return (
                          <div key={category.id} className="flex items-center gap-1 text-xs">
                            <div 
                              className={`w-3 h-3 rounded-full ${isFullyCompleted ? 'animate-pulse' : ''}`}
                              style={{ backgroundColor: category.color }}
                            />
                            <span className={`${isFullyCompleted ? 'font-bold text-green-600 dark:text-green-400' : 'text-github-dark-gray dark:text-github-light-gray'}`}>
                              {category.name.split(' ')[0]} {completedInCategory}/{categorySteps.length}
                              {isFullyCompleted && ' ✨'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredChallenges.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No challenges match your current filter.</p>
                    <p className="text-sm mt-2">Try adjusting your search or filter settings.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Challenge Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                      <AnimatePresence mode="popLayout">
                        {filteredChallenges.map((challenge, index) => (
                          <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ChallengeCard
                              challenge={challenge}
                              categories={categories}
                              isCompleted={completedChallenges.has(challenge.id)}
                              onComplete={() => handleCompleteChallenge(challenge.id)}
                              onIncomplete={() => handleIncompleteChallenge(challenge.id)}
                              onShowDetails={() => {
                                setSelectedChallenge(challenge);
                                setShowDetailModal(true);
                              }}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Completion Encouragement */}
                    {filteredChallenges.length > 0 && (
                      <div className="text-center mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          💡 <strong>Tip:</strong> Click on any challenge card to see full details, hints, and completion criteria!
                        </p>
                          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            If you did not bring any code, please visit
                            <a
                              href="https://github.com/NavaraCloudServices/github-copilot/tree/main/challenges"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-navara-blue underline ml-1"
                            >
                              https://github.com/NavaraCloudServices/github-copilot/tree/main/challenges 
                            </a>
                             for general GitHub Copilot challenges
                          </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Team Members */}
                  <div className="space-y-2">
                    {teamProgress.members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-navara-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {member.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-navara-navy dark:text-white font-medium">{member}</span>
                      </div>
                    ))}
                  </div>

                  {/* Team Code */}
                  {user?.teamCode && (
                    <div className="pt-4 border-t border-github-light-gray dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="h-4 w-4 text-github-dark-gray dark:text-github-light-gray" />
                        <span className="text-sm font-medium text-github-dark-gray dark:text-github-light-gray">Team Code</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-github-light-gray dark:bg-github-dark-gray border border-github-light-gray dark:border-gray-600 rounded-lg px-3 py-2 font-mono text-sm font-bold text-navara-navy dark:text-white">
                          {user.teamCode}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyTeamCode}
                          className="shrink-0"
                        >
                          {copiedTeamCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Share this code with team members so they can join
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mini Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.slice(0, 5).map((team, index) => (
                    <div
                      key={team.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        team.id === user.teamId 
                          ? 'bg-navara-blue/10 border border-navara-blue' 
                          : 'bg-github-light-gray dark:bg-github-dark-gray'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-500 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-navara-blue text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-navara-navy dark:text-white text-sm">
                          {team.name}
                          {team.id === user.teamId && <span className="text-navara-blue ml-1">(You)</span>}
                        </div>
                        <div className="text-xs text-github-dark-gray dark:text-github-light-gray">
                          {team.total_points || 0} points
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {teams.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" as="a" href={`/leaderboard/${leaderboardId}`} target="_blank">
                        View Full Leaderboard
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          {recentCompletions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCompletions.slice(0, 3).map((completion, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-navara-navy dark:text-white">
                          {completion.challengeTitle}
                        </div>
                        <div className="text-github-dark-gray dark:text-github-light-gray">
                          +{completion.points} points
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(completion.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
  </motion.div>

      {/* Challenge Detail Modal */}
      <ChallengeDetailModal
        challenge={selectedChallenge}
        categories={categories}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onComplete={() => handleCompleteChallenge(selectedChallenge?.id)}
        onIncomplete={() => handleIncompleteChallenge(selectedChallenge?.id)}
        isCompleted={selectedChallenge ? completedChallenges.has(selectedChallenge.id) : false}
      />
    </div>
  );
};

export default TeamView;
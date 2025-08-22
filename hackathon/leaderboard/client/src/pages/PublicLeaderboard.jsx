import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Target, 
  Zap, 
  Clock,
  Crown,
  Medal,
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
import { leaderboardApi } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import QRCodeJoin from '../components/Common/QRCodeJoin';

// Confetti animation component
const Confetti = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: -10,
            rotate: 0,
            opacity: 1
          }}
          animate={{
            y: window.innerHeight + 10,
            rotate: 720,
            opacity: 0
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            ease: "linear",
            delay: Math.random() * 0.5
          }}
        />
      ))}
    </div>
  );
};

// Animated rank change indicator
const RankChange = ({ previousRank, currentRank }) => {
  if (previousRank === currentRank) return null;
  
  const isUp = currentRank < previousRank;
  const change = Math.abs(currentRank - previousRank);
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`flex items-center gap-1 text-xs ${
        isUp ? 'text-green-500' : 'text-red-500'
      }`}
    >
      <TrendingUp className={`h-3 w-3 ${isUp ? '' : 'rotate-180'}`} />
      {change}
    </motion.div>
  );
};

// Team row component with animations
const TeamRow = ({ team, index, previousRanks, showConfetti }) => {
  const previousRank = previousRanks[team.id];
  const isNewLeader = index === 0 && previousRank && previousRank > 1;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.1,
        layout: { type: "spring", stiffness: 500, damping: 30 }
      }}
      className={`relative overflow-hidden rounded-lg p-6 transition-all duration-300 ${
        index === 0 
          ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-300 dark:border-yellow-600 shadow-lg shadow-yellow-200/50 dark:shadow-yellow-800/20' 
          : index === 1
          ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-2 border-gray-300 dark:border-gray-600'
          : index === 2
          ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-300 dark:border-orange-600'
          : 'bg-white dark:bg-github-dark-gray border border-github-light-gray dark:border-gray-700 hover:shadow-md'
      }`}
    >
      {/* Confetti for new leader */}
      {isNewLeader && <Confetti show={showConfetti} />}
      
      {/* Rank indicator */}
      <div className="flex items-center gap-6">
        <div className={`relative flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl ${
          index === 0 
            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' 
            : index === 1
            ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg'
            : index === 2
            ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg'
            : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
        }`}>
          {index < 3 ? (
            index === 0 ? <Crown className="h-8 w-8" /> :
            index === 1 ? <Medal className="h-8 w-8" /> :
            <Award className="h-8 w-8" />
          ) : (
            index + 1
          )}
          
          {/* Pulse animation for first place */}
          {index === 0 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-400 opacity-30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-2xl font-bold ${
              index === 0 ? 'text-yellow-800 dark:text-yellow-200' : 'text-navara-navy dark:text-white'
            }`}>
              {team.name}
            </h3>
            <RankChange previousRank={previousRank} currentRank={index + 1} />
          </div>
          
          <div className="flex items-center gap-4 text-sm text-github-dark-gray dark:text-github-light-gray">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {JSON.parse(team.members || '[]').join(', ')}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {team.completed_challenges || 0} challenges
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <motion.div
            key={team.total_points}
            initial={{ scale: 1.2, color: "#10B981" }}
            animate={{ scale: 1, color: index === 0 ? "#D97706" : "#000b3b" }}
            transition={{ duration: 0.3 }}
            className={`text-4xl font-bold ${
              index === 0 ? 'text-yellow-700 dark:text-yellow-300' : 'text-navara-navy dark:text-white'
            }`}>
            {team.total_points || 0}
          </motion.div>
          <div className="text-sm text-github-dark-gray dark:text-github-light-gray">points</div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-github-dark-gray dark:text-github-light-gray mb-1">
          <span>Progress</span>
          <span>{Math.round(((team.completed_challenges || 0) / (team.total_challenges || 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-github-light-gray dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${Math.min(((team.completed_challenges || 0) / (team.total_challenges || 1)) * 100, 100)}%` 
            }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className={`h-2 rounded-full ${
              index === 0 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                : index === 1
                ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                : index === 2
                ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                : 'bg-gradient-to-r from-navara-blue to-blue-600'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Recent activity ticker
const ActivityTicker = ({ recentCompletions }) => {
  if (recentCompletions.length === 0) return null;

  return (
    <div className="bg-github-light-gray dark:bg-github-dark-gray rounded-xl p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-5 w-5 text-green-500" />
        <span className="font-semibold text-navara-navy dark:text-white">Recent Activity</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {recentCompletions.slice(0, 5).map((completion, index) => (
            <motion.div
              key={`${completion.teamName}-${completion.challengeId}-${completion.timestamp}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 bg-white dark:bg-github-dark-gray rounded-lg text-sm"
            >
              <div>
                <span className="font-medium text-navara-navy dark:text-white">
                  {completion.teamName}
                </span>
                <span className="text-github-dark-gray dark:text-github-light-gray ml-1">
                  completed a challenge
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600 dark:text-green-400">
                  +{completion.points}
                </span>
                <Zap className="h-4 w-4 text-yellow-500" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PublicLeaderboard = () => {
  const { leaderboardId } = useParams();
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousRanks, setPreviousRanks] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    connected,
    teams,
    leaderboardData,
    recentCompletions
  } = useWebSocket(leaderboardId);

  useEffect(() => {
    if (leaderboardId) {
      loadLeaderboardData();
    }
  }, [leaderboardId]);

  // Track rank changes for animations
  useEffect(() => {
    if (teams.length > 0) {
      const newRanks = {};
      teams.forEach((team, index) => {
        newRanks[team.id] = index + 1;
      });
      
      // Check for new leader
      const newLeader = teams[0];
      const wasLeader = previousRanks[newLeader?.id] === 1;
      
      if (newLeader && !wasLeader && Object.keys(previousRanks).length > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      setPreviousRanks(newRanks);
    }
  }, [teams]);

  const loadLeaderboardData = async () => {
    try {
      const response = await leaderboardApi.get(leaderboardId);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading leaderboard..." />;
  }

  if (!leaderboard) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Leaderboard Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">This competition may have ended or been removed.</p>
      </div>
    );
  }

  const currentStatus = leaderboardData?.status || leaderboard.status;
  const totalChallenges = leaderboard.challenges?.challenges?.length || 0;
  const totalPoints = leaderboard.challenges?.metadata?.total_points || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-github-dark-gray border-b border-github-light-gray dark:border-gray-700 sticky top-16 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-navara-navy dark:text-white mb-2"
              >
                {leaderboard.name}
              </motion.h1>
              <div className="flex items-center gap-6 text-sm text-github-dark-gray dark:text-github-light-gray">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {teams.length} teams competing
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {totalChallenges} challenges
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {totalPoints} total points
                </span>
                {leaderboard.challenges?.metadata?.duration_hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {leaderboard.challenges.metadata.duration_hours}h duration
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live indicator */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  connected 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                {connected ? 'LIVE' : 'DISCONNECTED'}
              </motion.div>

              {/* Status badge */}
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                currentStatus === 'started' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                currentStatus === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                currentStatus === 'ended' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' :
                'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              }`}>
                {currentStatus === 'active' ? 'READY TO START' : 
                 currentStatus === 'started' ? 'IN PROGRESS' :
                 currentStatus === 'paused' ? 'PAUSED' : 'ENDED'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            {teams.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Teams Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Teams will appear here as they register for the competition.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {teams.map((team, index) => (
                    <TeamRow
                      key={team.id}
                      team={{ ...team, total_challenges: totalChallenges }}
                      index={index}
                      previousRanks={previousRanks}
                      showConfetti={showConfetti && index === 0}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ActivityTicker recentCompletions={recentCompletions} />
            </motion.div>

            {/* Competition Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-github-dark-gray rounded-xl p-6 border border-github-light-gray dark:border-gray-700"
            >
              <h3 className="font-semibold text-navara-navy dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Competition Info
              </h3>
              
              {leaderboard.challenges?.metadata?.description && (
                <p className="text-sm text-github-dark-gray dark:text-github-light-gray mb-4">
                  {leaderboard.challenges.metadata.description}
                </p>
              )}

              <div className="space-y-3">
                {leaderboard.challenges?.categories?.map((category) => (
                  <div key={category.id} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-github-dark-gray dark:text-github-light-gray">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>

              {leaderboard.challenges?.metadata?.recognition_categories && (
                <div className="mt-6">
                  <h4 className="font-medium text-navara-navy dark:text-white mb-2">Recognition Categories:</h4>
                  <ul className="text-sm text-github-dark-gray dark:text-github-light-gray space-y-1">
                    {leaderboard.challenges.metadata.recognition_categories.map((category, index) => (
                      <li key={index}>• {category}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* QR Code for joining */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <QRCodeJoin
                leaderboardId={leaderboardId}
                accessCode={leaderboard.accessCode}
                leaderboardName={leaderboard.name}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLeaderboard;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  Users, 
  Trophy, 
  Download, 
  Eye, 
  EyeOff,
  Settings,
  Clock,
  Target,
  Activity,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import { leaderboardApi } from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/Common/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Common/Card';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const HostView = () => {
  const { leaderboardId } = useParams();
  const { user, isHost } = useAuth();
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHostCode, setShowHostCode] = useState(false);
  const [copiedHostCode, setCopiedHostCode] = useState(false);
  
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

  const loadLeaderboardData = async () => {
    try {
      const response = await leaderboardApi.get(leaderboardId);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
      if (error.response?.status === 404) {
        toast.error('Leaderboard not found');
      } else {
        toast.error('Failed to load leaderboard data');
      }
    } finally {
      setLoading(false);
    }
  };


  const copyAccessCode = async () => {
    if (leaderboard?.accessCode) {
      await navigator.clipboard.writeText(leaderboard.accessCode);
      setCopiedCode(true);
      toast.success('Access code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyHostCode = async () => {
    if (user?.hostCode) {
      await navigator.clipboard.writeText(user.hostCode);
      setCopiedHostCode(true);
      toast.success('Host code copied!');
      setTimeout(() => setCopiedHostCode(false), 2000);
    }
  };

  const exportResults = () => {
    const csvContent = [
      ['Rank', 'Team Name', 'Members', 'Points', 'Challenges Completed'],
      ...teams.map((team, index) => [
        index + 1,
        team.name,
        JSON.parse(team.members).join('; '),
        team.total_points || 0,
        team.completed_challenges || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${leaderboard?.name}-results.csv`;
    a.click();
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading host dashboard..." />;
  }

  // Show access denied only if user is definitely not a host
  // Don't show access denied while leaderboard is still loading
  if (!loading && !isHost) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this host dashboard.</p>
        <p className="text-gray-500 dark:text-gray-500 mt-2">Please sign in with a valid host code.</p>
      </div>
    );
  }

  // Show loading if we're still fetching data and user might be a host
  if (loading || (isHost && !leaderboard)) {
    return <LoadingSpinner fullScreen text="Loading host dashboard..." />;
  }

  const currentStatus = leaderboardData?.status || leaderboard.status;
  const allChallenges = leaderboard.challenges?.challenges || [];
  // Only count enabled challenges for statistics
  const enabledChallenges = allChallenges.filter(challenge => challenge.enabled !== false);
  const totalChallenges = enabledChallenges.length;
  const totalPoints = leaderboard.challenges?.metadata?.total_points || 0;

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
            {leaderboard.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-github-dark-gray dark:text-github-light-gray">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {teams.length} teams
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {totalChallenges} challenges
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {totalPoints} total points
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            connected ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            {connected ? 'Live' : 'Disconnected'}
          </div>

          {/* Competition Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentStatus === 'started' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
            currentStatus === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
            currentStatus === 'ended' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          }`}>
            {currentStatus === 'active' ? 'Ready' : 
             currentStatus === 'started' ? 'In Progress' :
             currentStatus === 'paused' ? 'Paused' : 'Ended'}
          </div>
        </div>
      </motion.div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Competition Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Access Code */}
              <div>
                <label className="label mb-2">Team Access Code</label>
                <div className="flex items-center gap-2">
                  <div className="input bg-github-light-gray dark:bg-github-dark-gray font-mono text-lg">
                    {leaderboard.accessCode}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAccessCode}
                    className="shrink-0"
                  >
                    {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-github-dark-gray dark:text-github-light-gray mt-1">
                  Share this code with teams to let them join
                </p>
              </div>

              {/* Host Code */}
              <div>
                <label className="label mb-2">Host Code</label>
                <div className="flex items-center gap-2">
                  <div className="input bg-github-light-gray dark:bg-github-dark-gray font-mono text-lg">
                    {showHostCode ? user?.hostCode : '••••••••••••••••••••••••••••••••••••••••'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHostCode(!showHostCode)}
                    className="shrink-0"
                  >
                    {showHostCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyHostCode}
                    className="shrink-0"
                  >
                    {copiedHostCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-github-dark-gray dark:text-github-light-gray mt-1">
                  Your private host code - keep this secure
                </p>
              </div>
            </div>


            <div className="flex gap-3 mt-6 pt-6 border-t border-github-light-gray dark:border-gray-700">
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-1" />
                Export Results
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                as="a"
                href={`/leaderboard/${leaderboardId}`}
                target="_blank"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Public View
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <Card>
          <CardContent className="text-center p-6">
            <Users className="h-8 w-8 text-navara-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-navara-navy dark:text-white">
              {teams.length}
            </div>
            <div className="text-sm text-github-dark-gray dark:text-github-light-gray">
              Registered Teams
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center p-6">
            <Activity className="h-8 w-8 text-navara-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-navara-navy dark:text-white">
              {recentCompletions.length}
            </div>
            <div className="text-sm text-github-dark-gray dark:text-github-light-gray">
              Recent Completions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center p-6">
            <Clock className="h-8 w-8 text-navara-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-navara-navy dark:text-white">
              {leaderboard.challenges?.metadata?.duration_hours || 0}h
            </div>
            <div className="text-sm text-github-dark-gray dark:text-github-light-gray">
              Duration
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Live Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Live Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <div className="text-center py-8 text-github-dark-gray dark:text-github-light-gray">
                  No teams registered yet
                </div>
              ) : (
                <div className="space-y-3">
                  {teams.slice(0, 10).map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-github-light-gray dark:bg-github-dark-gray"
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-navara-blue text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-navara-navy dark:text-white">
                          {team.name}
                        </div>
                        <div className="text-sm text-github-dark-gray dark:text-github-light-gray">
                          {JSON.parse(team.members || '[]').join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-navara-navy dark:text-white">
                          {team.total_points || 0}
                        </div>
                        <div className="text-sm text-github-dark-gray dark:text-github-light-gray">
                          {team.completed_challenges || 0} challenges
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCompletions.length === 0 ? (
                <div className="text-center py-8 text-github-dark-gray dark:text-github-light-gray">
                  No activity yet
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCompletions.slice(0, 10).map((completion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-github-light-gray dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-navara-navy dark:text-white">
                          {completion.teamName || completion.team_name}
                        </div>
                        <div className="text-sm text-github-dark-gray dark:text-github-light-gray">
                          {completion.challengeTitle || completion.challenge_id}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-400">
                          +{completion.points}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(completion.timestamp || completion.completed_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HostView;
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserPlus, LogIn, Trophy, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { leaderboardApi, authApi } from '../services/api';
import Button from '../components/Common/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Common/Card';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const JoinPage = () => {
  const { leaderboardId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, registerTeam, loginTeam, isAuthenticated, loginHost, logout } = useAuth();

  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState('detect'); // detect, new_team, existing_team, existing_team_select, host, already_joined
  
  // Form data
  const [formData, setFormData] = useState({
    teamName: '',
    memberNames: [''],
    teamCode: '',
    accessCode: searchParams.get('access') || '',
    hostCode: '',
    newMemberName: '',
    selectedExistingMember: ''
  });

  // Team info for existing team join
  const [teamInfo, setTeamInfo] = useState(null);

  // URL access code from QR scan
  const urlAccessCode = searchParams.get('access');

  useEffect(() => {
    if (leaderboardId) {
      loadLeaderboardData();
    }
  }, [leaderboardId]);

  useEffect(() => {
    if (leaderboard && user) {
      detectUserStatus();
    }
  }, [leaderboard, user]);

  const loadLeaderboardData = async () => {
    try {
      const response = await leaderboardApi.get(leaderboardId);
      setLeaderboard(response.data);
      
      // If we have URL access code, auto-fill it
      if (urlAccessCode) {
        setFormData(prev => ({ ...prev, accessCode: urlAccessCode }));
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast.error('Competition not found');
    } finally {
      setLoading(false);
    }
  };

  const detectUserStatus = () => {
    if (!user || !leaderboard) {
      setMode('detect');
      return;
    }

    // Check if user is already in this competition
    if (user.leaderboardId === leaderboardId) {
      if (user.userType === 'team') {
        setMode('already_joined_team');
      } else if (user.userType === 'host') {
        setMode('already_joined_host');
      }
    } else {
      // User is from different competition, let them choose
      setMode('detect');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      memberNames: prev.memberNames.map((name, i) => i === index ? value : name)
    }));
  };

  const addMember = () => {
    if (formData.memberNames.length < 20) {
      setFormData(prev => ({
        ...prev,
        memberNames: [...prev.memberNames, '']
      }));
    }
  };

  const removeMember = (index) => {
    if (formData.memberNames.length > 1) {
      setFormData(prev => ({
        ...prev,
        memberNames: prev.memberNames.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCreateTeam = async () => {
    if (!formData.teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    const validMembers = formData.memberNames.filter(name => name.trim());
    if (validMembers.length < 1) {
      toast.error('At least 1 team member is required');
      return;
    }

    if (!formData.accessCode.trim()) {
      toast.error('Access code is required');
      return;
    }

    setSubmitting(true);
    try {
      await registerTeam({
        teamName: formData.teamName.trim(),
        members: validMembers,
        accessCode: formData.accessCode.trim()
      });
      
      toast.success('Team created successfully!');
      navigate(`/team/${leaderboardId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetTeamInfo = async () => {
    if (!formData.teamCode.trim()) {
      toast.error('Team code is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authApi.getTeamInfo(formData.teamCode.trim());
      setTeamInfo(response.data);
      setMode('existing_team_select');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid team code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinAsExisting = async (memberName) => {
    setSubmitting(true);
    try {
      const userData = await authApi.joinTeamEnhanced(
        formData.teamCode.trim(),
        null,
        memberName,
        false
      );
      
      // Update auth context manually since we're not using the hook
      // This is a temporary solution - ideally we'd update the AuthContext
      toast.success(`Joined as ${memberName}!`);
      navigate(`/team/${leaderboardId}`);
      window.location.reload(); // Force refresh to update auth state
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinAsNew = async () => {
    if (!formData.newMemberName.trim()) {
      toast.error('Member name is required');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await authApi.joinTeamEnhanced(
        formData.teamCode.trim(),
        formData.newMemberName.trim(),
        null,
        true
      );
      
      toast.success(`Added as new member: ${formData.newMemberName}!`);
      navigate(`/team/${leaderboardId}`);
      window.location.reload(); // Force refresh to update auth state
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHostLogin = async () => {
    if (!formData.hostCode.trim()) {
      toast.error('Host code is required');
      return;
    }

    setSubmitting(true);
    try {
      await loginHost(formData.hostCode.trim());
      toast.success('Host authenticated successfully!');
      navigate(`/host/${leaderboardId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueAsUser = () => {
    if (user.userType === 'team') {
      navigate(`/team/${user.leaderboardId}`);
    } else if (user.userType === 'host') {
      navigate(`/host/${user.leaderboardId}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    // After logout, stay on the same join page to allow rejoin
    window.location.reload();
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading competition..." />;
  }

  if (!leaderboard) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Competition Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">This competition may have ended or been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join Competition
          </h1>
          <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            {leaderboard.name}
          </h2>
          {leaderboard.challenges?.metadata?.description && (
            <p className="text-gray-500 dark:text-gray-500">
              {leaderboard.challenges.metadata.description}
            </p>
          )}
        </motion.div>

        {/* Already joined this competition */}
        {mode === 'already_joined_team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome Back!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  You're already registered for this competition as <strong>{user.teamName}</strong>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                  Members: {user.members?.join(', ')}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate(`/team/${leaderboardId}`)}>
                    Go to Team Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {mode === 'already_joined_host' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Host Dashboard Ready
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You're already signed in as the host for this competition
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate(`/host/${leaderboardId}`)}>
                    Go to Host Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* User from different competition */}
        {user && user.leaderboardId !== leaderboardId && mode === 'detect' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Already Signed In
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You're currently signed in as {user.userType === 'team' ? `team "${user.teamName}"` : 'a host'} 
                  {user.userType === 'team' && ` in another competition`}.
                  To join this competition, please go back to your current leaderboard or logout first.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleContinueAsUser}>
                    Go Back to Current {user.userType === 'team' ? 'Team' : 'Competition'}
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main join options */}
        {(!user || user.leaderboardId !== leaderboardId) && mode === 'detect' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-4 mb-6"
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('new_team')}>
              <CardContent className="text-center p-6">
                <UserPlus className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create New Team</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start a new team and invite members
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('existing_team')}>
              <CardContent className="text-center p-6">
                <Users className="h-12 w-12 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Join Existing Team</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Join a team using their team code
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('host')}>
              <CardContent className="text-center p-6">
                <Trophy className="h-12 w-12 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Host Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access host dashboard
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Create new team form */}
        {mode === 'new_team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create New Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="label mb-2">Team Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter your team name"
                    value={formData.teamName}
                    onChange={(e) => handleInputChange('teamName', e.target.value)}
                  />
                </div>

                <div>
                  <label className="label mb-2">Team Members</label>
                  {formData.memberNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        className="input flex-1"
                        placeholder={`Member ${index + 1} name`}
                        value={name}
                        onChange={(e) => handleMemberChange(index, e.target.value)}
                      />
                      {formData.memberNames.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMember(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.memberNames.length < 20 && (
                    <Button variant="outline" size="sm" onClick={addMember}>
                      Add Member
                    </Button>
                  )}
                </div>

                <div>
                  <label className="label mb-2">Access Code</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter competition access code"
                    value={formData.accessCode}
                    onChange={(e) => handleInputChange('accessCode', e.target.value)}
                  />
                  {urlAccessCode && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      ✓ Access code from QR scan
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateTeam}
                    loading={submitting}
                    className="flex-1"
                  >
                    Create Team
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMode('detect')}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Join existing team form */}
        {mode === 'existing_team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Join Existing Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="label mb-2">Team Code</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter the team code provided by your team"
                    value={formData.teamCode}
                    onChange={(e) => handleInputChange('teamCode', e.target.value)}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ask your team captain for the team code
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleGetTeamInfo}
                    loading={submitting}
                    className="flex-1"
                  >
                    Get Team Info
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMode('detect')}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Team member selection after getting team info */}
        {mode === 'existing_team_select' && teamInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Join Team: {teamInfo.teamName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team info display */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Current Team Members ({teamInfo.members.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {teamInfo.members.map((member, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Total Points: {teamInfo.totalPoints}
                  </p>
                </div>

                {/* Join options */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Join as existing member */}
                  <Card className="border-2 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        I'm Already a Member
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Select your name from the existing team members
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="label mb-2">Select Your Name</label>
                          <select
                            className="input"
                            value={formData.selectedExistingMember}
                            onChange={(e) => handleInputChange('selectedExistingMember', e.target.value)}
                          >
                            <option value="">Choose your name...</option>
                            {teamInfo.members.map((member, index) => (
                              <option key={index} value={member}>
                                {member}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          onClick={() => handleJoinAsExisting(formData.selectedExistingMember)}
                          disabled={!formData.selectedExistingMember}
                          loading={submitting}
                          className="w-full"
                        >
                          Join as {formData.selectedExistingMember || 'Member'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Join as new member */}
                  <Card className="border-2 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Add Me as New Member
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Add yourself as a new team member
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="label mb-2">Your Name</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Enter your name"
                            value={formData.newMemberName}
                            onChange={(e) => handleInputChange('newMemberName', e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={handleJoinAsNew}
                          disabled={!formData.newMemberName.trim()}
                          loading={submitting}
                          className="w-full"
                          variant="secondary"
                        >
                          Add as New Member
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMode('existing_team');
                      setTeamInfo(null);
                      setFormData(prev => ({
                        ...prev,
                        selectedExistingMember: '',
                        newMemberName: ''
                      }));
                    }}
                  >
                    Back to Team Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Host access form */}
        {mode === 'host' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Host Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="label mb-2">Host Code</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter your host code"
                    value={formData.hostCode}
                    onChange={(e) => handleInputChange('hostCode', e.target.value)}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Use the host code provided when creating this competition
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleHostLogin}
                    loading={submitting}
                    className="flex-1"
                  >
                    Access Host Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMode('detect')}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation options */}
        {(!user || user.leaderboardId !== leaderboardId) && mode === 'detect' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                Go to Homepage
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/leaderboard/${leaderboardId}`)}
              >
                View Public Leaderboard
              </Button>
            </div>
          </motion.div>
        )}

        {/* Manual access code entry fallback */}
        {!urlAccessCode && mode !== 'host' && mode !== 'detect' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card>
              <CardContent className="text-center p-6">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Need an Access Code?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Ask the competition host for the access code to join this competition.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/leaderboard/${leaderboardId}`)}
                >
                  View Public Leaderboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JoinPage;
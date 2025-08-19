import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Upload, Plus, LogIn, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/Common/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/Common/Card';
import Modal from '../components/Common/Modal';
import { uploadApi } from '../services/api';

const Landing = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    challenges: null,
    uploading: false
  });
  const [joinForm, setJoinForm] = useState({
    accessCode: '',
    teamName: '',
    members: ['']
  });
  const [loginForm, setLoginForm] = useState({
    code: '',
    type: 'team' // 'team' or 'host'
  });

  const { createLeaderboard, registerTeam, loginTeam, loginHost, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Simplified: buttons are ready when auth is not loading
  const buttonsEnabled = !authLoading;

  const handleCreateLeaderboard = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.challenges) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const leaderboard = await createLeaderboard({
        name: createForm.name,
        challenges: createForm.challenges
      });
      
      toast.success('Leaderboard created successfully!');
      navigate(`/host/${leaderboard.leaderboardId}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addMember = () => {
    if (joinForm.members.length < 20) {
      setJoinForm(prev => ({
        ...prev,
        members: [...prev.members, '']
      }));
    }
  };

  const removeMember = (index) => {
    if (joinForm.members.length > 1) {
      setJoinForm(prev => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index)
      }));
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    const members = joinForm.members.filter(m => m.trim());
    
    if (!joinForm.accessCode || !joinForm.teamName || members.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const team = await registerTeam({
        teamName: joinForm.teamName,
        members,
        accessCode: joinForm.accessCode
      });
      
      toast.success('Team registered successfully!');
      navigate(`/team/${team.leaderboardId}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.code) {
      toast.error('Please enter your code');
      return;
    }

    try {
      let user;
      if (loginForm.type === 'team') {
        user = await loginTeam(loginForm.code);
        navigate(`/team/${user.leaderboardId}`);
      } else {
        user = await loginHost(loginForm.code);
        navigate(`/host/${user.leaderboardId}`);
      }
      
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCreateForm(prev => ({ ...prev, uploading: true }));

    try {
      const response = await uploadApi.challenges(file);
      setCreateForm(prev => ({
        ...prev,
        challenges: response.data.challenges,
        uploading: false
      }));
      toast.success('Challenges uploaded successfully!');
    } catch (error) {
      setCreateForm(prev => ({ ...prev, uploading: false }));
      toast.error(error.response?.data?.error || 'Failed to upload file');
    }
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-github-light-gray dark:bg-github-dark-gray py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-navara-navy dark:text-white mb-6"
            >
              Real-Time Competition
              <span className="text-navara-blue block">Leaderboards</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-github-dark-gray dark:text-github-light-gray mb-10 max-w-2xl mx-auto"
            >
              Host team-based challenges and competitions with live updates, 
              custom scoring, and engaging leaderboard displays.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => setShowCreateModal(true)}
                disabled={!buttonsEnabled}
                className="shadow-glow"
                variant="primary"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Leaderboard
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowJoinModal(true)}
                disabled={!buttonsEnabled}
              >
                <Users className="mr-2 h-5 w-5" />
                Join Competition
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowLoginModal(true)}
                disabled={!buttonsEnabled}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Create Leaderboard Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Leaderboard"
        description="Set up a new competition for your teams"
        size="lg"
      >
        <form onSubmit={handleCreateLeaderboard} className="space-y-6">
          <div>
            <label className="label mb-2">
              Competition Name *
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g., GitHub Copilot Challenge"
              value={createForm.name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label mb-2">
              Upload Challenges JSON *
            </label>
            <div className="border-2 border-dashed border-github-light-gray dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <label className="cursor-pointer">
                    <span className="text-navara-blue hover:text-navara-blue/90 font-medium">
                      Click to upload
                    </span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-github-dark-gray dark:text-github-light-gray">
                    JSON file with challenges and categories
                  </p>
                </div>
              </div>
            </div>
            {createForm.challenges && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ Challenges loaded: {createForm.challenges.challenges?.length || 0} challenges
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createForm.uploading}
              disabled={!createForm.name || !createForm.challenges}
              className="flex-1"
              variant="primary"
            >
              Create Leaderboard
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Team Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Competition"
        description="Register your team for an existing leaderboard"
        size="md"
      >
        <form onSubmit={handleJoinTeam} className="space-y-6">
          <div>
            <label className="label mb-2">
              Access Code *
            </label>
            <input
              type="text"
              className="input uppercase"
              placeholder="ABC123"
              maxLength={6}
              value={joinForm.accessCode}
              onChange={(e) => setJoinForm(prev => ({ ...prev, accessCode: e.target.value.toUpperCase() }))}
              required
            />
          </div>

          <div>
            <label className="label mb-2">
              Team Name *
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Code Warriors"
              value={joinForm.teamName}
              onChange={(e) => setJoinForm(prev => ({ ...prev, teamName: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label mb-2">
              Team Members *
            </label>
            <div className="space-y-2">
              {joinForm.members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder={`Member ${index + 1} name${index === 0 ? ' *' : ''}`}
                    value={member}
                    onChange={(e) => {
                      const newMembers = [...joinForm.members];
                      newMembers[index] = e.target.value;
                      setJoinForm(prev => ({ ...prev, members: newMembers }));
                    }}
                    required={index === 0}
                  />
                  {joinForm.members.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMember(index)}
                      className="px-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {joinForm.members.length < 20 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowJoinModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              variant="primary"
            >
              Join Competition
            </Button>
          </div>
        </form>
      </Modal>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Sign In"
        description="Enter your team or host code to continue"
        size="sm"
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="label mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                  loginForm.type === 'team' 
                    ? 'border-navara-blue bg-navara-blue text-white' 
                    : 'border-github-light-gray dark:border-gray-600 text-github-dark-gray dark:text-white'
                }`}
                onClick={() => setLoginForm(prev => ({ ...prev, type: 'team' }))}
              >
                Team Member
              </button>
              <button
                type="button"
                className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                  loginForm.type === 'host' 
                    ? 'border-navara-blue bg-navara-blue text-white' 
                    : 'border-github-light-gray dark:border-gray-600 text-github-dark-gray dark:text-white'
                }`}
                onClick={() => setLoginForm(prev => ({ ...prev, type: 'host' }))}
              >
                Host
              </button>
            </div>
          </div>

          <div>
            <label className="label mb-2">
              {loginForm.type === 'team' ? 'Team Code' : 'Host Code'} *
            </label>
            <input
              type="text"
              className="input"
              placeholder={loginForm.type === 'team' ? 'Enter your team code' : 'Enter your host code'}
              value={loginForm.code}
              onChange={(e) => setLoginForm(prev => ({ ...prev, code: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLoginModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              variant="primary"
            >
              Sign In
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Landing;
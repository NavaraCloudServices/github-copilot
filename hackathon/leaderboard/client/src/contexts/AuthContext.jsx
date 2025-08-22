import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

// localStorage helpers
const STORAGE_KEY = 'leaderboard_auth';

const saveAuthData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save auth data to localStorage:', error);
  }
};

const getAuthData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load auth data from localStorage:', error);
    return null;
  }
};

const clearAuthData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth data from localStorage:', error);
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initialized) return;
    
    initializeAuth();
  }, [initialized]);

  const initializeAuth = async () => {
    try {
      setInitialized(true);
      
      // First, try to load from localStorage
      const savedAuth = getAuthData();
      if (savedAuth) {
        // Validate the saved data structure
        if (savedAuth.userType && (
          (savedAuth.userType === 'team' && savedAuth.teamId) ||
          (savedAuth.userType === 'host' && savedAuth.hostCode && savedAuth.leaderboardId)
        )) {
          setUser(savedAuth);
          setLoading(false);
          return;
        }
      }

      // If no valid localStorage data, try server session
      try {
        const response = await api.get('/auth/session');
        if (response.data.isAuthenticated) {
          const userData = response.data;
          setUser(userData);
          saveAuthData(userData);
        }
      } catch (error) {
        console.log('No active session');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = (userData) => {
    setUser(userData);
    saveAuthData(userData);
  };

  const loginTeam = async (teamCode) => {
    try {
      const response = await api.post('/auth/team', { teamCode });
      const userData = { ...response.data, userType: 'team' };
      updateUserData(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Authentication failed');
    }
  };

  const loginHost = async (hostCode) => {
    try {
      const response = await api.post('/auth/host', { hostCode });
      const userData = { ...response.data, userType: 'host' };
      updateUserData(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Authentication failed');
    }
  };

  const registerTeam = async (teamData) => {
    try {
      const response = await api.post('/leaderboard/join', {
        teamName: teamData.teamName,
        members: teamData.members,
        accessCode: teamData.accessCode
      });
      const userData = { ...response.data, userType: 'team' };
      updateUserData(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const createLeaderboard = async (leaderboardData) => {
    try {
      const response = await api.post('/leaderboard/create', leaderboardData);
      const userData = { ...response.data, userType: 'host' };
      updateUserData(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create leaderboard');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      clearAuthData();
    }
  };

  const value = {
    user,
    loading,
    loginTeam,
    loginHost,
    registerTeam,
    createLeaderboard,
    logout,
    isTeam: user?.userType === 'team',
    isHost: user?.userType === 'host',
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
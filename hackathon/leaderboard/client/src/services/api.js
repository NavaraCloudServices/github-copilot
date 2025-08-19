import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const leaderboardApi = {
  create: (data) => api.post('/leaderboard/create', data),
  get: (id) => api.get(`/leaderboard/${id}`),
  join: (data) => api.post('/leaderboard/join', data), // Simplified join endpoint
  joinLegacy: (id, data) => api.post(`/leaderboard/${id}/join`, data), // Legacy endpoint
  getTeams: (id) => api.get(`/leaderboard/${id}/teams`),
  getChallenges: (id) => api.get(`/leaderboard/${id}/challenges`),
  updateStatus: (id, status) => api.patch(`/leaderboard/${id}/status`, { status }),
};

export const teamApi = {
  get: (id) => api.get(`/team/${id}`),
  getProgress: (id) => api.get(`/team/${id}/progress`),
  completeChallenge: (id, challengeId) => api.post(`/team/${id}/complete`, { challengeId }),
  incompleteChallenge: (id, challengeId) => api.post(`/team/${id}/incomplete`, { challengeId }),
};

export const authApi = {
  loginTeam: (teamCode) => api.post('/auth/team', { teamCode }),
  loginHost: (hostCode) => api.post('/auth/host', { hostCode }),
  getSession: () => api.get('/auth/session'),
  logout: () => api.post('/auth/logout'),
  getTeamInfo: (teamCode) => api.post('/auth/team/info', { teamCode }),
  joinTeamEnhanced: (teamCode, memberName, existingMember, isNewMember) => {
    const payload = { teamCode, isNewMember };
    if (memberName) payload.memberName = memberName;
    if (existingMember) payload.existingMember = existingMember;
    return api.post('/auth/team/join', payload);
  },
};

export const uploadApi = {
  challenges: (file) => {
    const formData = new FormData();
    formData.append('challenges', file);
    return api.post('/upload/challenges', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
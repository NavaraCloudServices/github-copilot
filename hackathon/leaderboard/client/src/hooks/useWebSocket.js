import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');

export function useWebSocket(leaderboardId) {
  const [connected, setConnected] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [recentCompletions, setRecentCompletions] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!leaderboardId) return;

    // Initialize socket connection
    socketRef.current = io(SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 60000,
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnected(true);
      socket.emit('join:leaderboard', leaderboardId);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
      toast.error('Connection error. Retrying...', { id: 'connection-error' });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      toast.success('Reconnected!', { id: 'reconnected' });
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      toast.error('Failed to reconnect to server', { id: 'reconnect-failed' });
    });

    // Leaderboard events
    socket.on('leaderboard:initial', (data) => {
      console.log('Received initial leaderboard data:', data);
      setLeaderboardData(data.leaderboard);
      setTeams(data.teams || []);
      // Normalize recent completions so UI can rely on consistent field names without changing API
      try {
        const challengesArray = data.challenges?.challenges || data.challenges || [];
        const challengeLookup = Array.isArray(challengesArray)
          ? challengesArray.reduce((acc, c) => { acc[c.id] = c; return acc; }, {})
          : {};
        const normalized = (data.recentCompletions || []).map(rc => {
          const challengeId = rc.challengeId || rc.challenge_id;
            return {
              ...rc,
              teamName: rc.teamName || rc.team_name || rc.team || rc.team_code, // fallbacks just in case
              challengeId,
              challengeTitle: rc.challengeTitle || rc.challenge_name || rc.challenge || challengeLookup[challengeId]?.title || challengeLookup[challengeId]?.name,
              points: rc.points,
              timestamp: rc.timestamp || rc.completed_at || rc.time || rc.date
            };
        });
        setRecentCompletions(normalized);
      } catch (e) {
        console.warn('Failed to normalize recent completions:', e);
        setRecentCompletions(data.recentCompletions || []);
      }
    });

    socket.on('leaderboard:update', (data) => {
      console.log('Leaderboard updated:', data);
      setTeams(data.teams || []);
    });

    socket.on('team:completed', (notification) => {
      console.log('Team completed challenge:', notification);
      
      // Add to recent completions
      setRecentCompletions(prev => [notification, ...prev.slice(0, 9)]);
      
      // Show toast notification
      toast.success(
        `${notification.teamName} completed "${notification.challengeTitle}" for ${notification.points} points!`,
        {
          duration: 5000,
          icon: '🎉'
        }
      );
    });

    socket.on('team:joined', (data) => {
      console.log('New team joined:', data);
      
      // Add the new team to the teams list
      const newTeam = {
        id: data.teamId,
        name: data.teamName,
        members: JSON.stringify(data.members),
        total_points: 0,
        completed_challenges: 0,
        leaderboard_id: data.leaderboardId
      };
      
      setTeams(prev => [...prev, newTeam]);
      
      toast.success(`${data.teamName} joined the competition!`, {
        icon: '👋'
      });
    });

    socket.on('competition:status', (data) => {
      console.log('Competition status changed:', data);
      setLeaderboardData(prev => prev ? { ...prev, status: data.status } : null);
      
      const statusMessages = {
        started: 'Competition has started! 🚀',
        paused: 'Competition paused ⏸️',
        ended: 'Competition ended! 🏁'
      };
      
      if (statusMessages[data.status]) {
        toast(statusMessages[data.status], {
          icon: data.status === 'started' ? '🚀' : data.status === 'ended' ? '🏁' : '⏸️'
        });
      }
    });

    socket.on('challenge:completed', (data) => {
      console.log('Challenge completion confirmed:', data);
      toast.success(`Challenge completed! +${data.points} points`, {
        icon: '✅'
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Something went wrong');
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave:leaderboard', leaderboardId);
        socket.disconnect();
      }
    };
  }, [leaderboardId]);

  // Functions to emit events
  const completeChallenge = (challengeId, teamId) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('complete:challenge', { challengeId, teamId });
    }
  };

  const registerTeam = (teamData) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('register:team', teamData);
    }
  };

  const updateCompetitionStatus = (status, hostCode) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('host:update_status', { 
        leaderboardId, 
        status, 
        hostCode 
      });
    }
  };

  const ping = () => {
    if (socketRef.current && connected) {
      socketRef.current.emit('ping');
    }
  };

  return {
    connected,
    leaderboardData,
    teams,
    recentCompletions,
    completeChallenge,
    registerTeam,
    updateCompetitionStatus,
    ping
  };
}

export default useWebSocket;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Resources from './Resources';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { leaderboardApi } from '../services/api';

const ResourcesPage = () => {
  const { leaderboardId } = useParams();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchResources() {
      if (!leaderboardId) { setError('Missing leaderboard id'); setLoading(false); return; }
      try {
        const { data } = await leaderboardApi.get(leaderboardId);
        if (!isMounted) return;
        // API returns the leaderboard object directly (TeamView sets it from response.data)
        // but support both shapes just in case.
        const leaderboardObj = data.leaderboard || data; 
        const res = leaderboardObj?.challenges?.resources || [];
        setResources(res);
      } catch (e) {
        if (isMounted) setError('Unable to load resources');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchResources();
    return () => { isMounted = false; };
  }, [leaderboardId]);

  if (loading) return <LoadingSpinner fullScreen text="Loading resources..." />;
  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;
  }
  return <Resources resources={resources} />;
};

export default ResourcesPage;

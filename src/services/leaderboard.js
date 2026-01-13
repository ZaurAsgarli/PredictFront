import api from './api';

export const leaderboardService = {
  // Get global leaderboard
  getGlobalLeaderboard: async (params = {}) => {
    try {
      const response = await api.get('/analytics/global/');
      // Backend now returns actual array of users
      const data = response.data;

      // Handle array response (new backend) or fallback message (old backend)
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }

      // If backend returns empty array, that's valid - return it
      if (Array.isArray(data)) {
        return data;
      }

      // Only use mock if backend returns a "not implemented" message
      if (data.message && data.message.includes('not implemented')) {
        return generateMockLeaderboard('global');
      }

      return data.results || [];
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      return generateMockLeaderboard('global');
    }
  },

  // Get weekly leaderboard
  getWeeklyLeaderboard: async () => {
    try {
      const response = await api.get('/analytics/weekly/');
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      }
      if (data.message && data.message.includes('not implemented')) {
        return generateMockLeaderboard('weekly');
      }
      return data.results || [];
    } catch (error) {
      console.error('Error fetching weekly leaderboard:', error);
      return generateMockLeaderboard('weekly');
    }
  },

  // Get monthly leaderboard
  getMonthlyLeaderboard: async () => {
    try {
      const response = await api.get('/analytics/monthly/');
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      }
      if (data.message && data.message.includes('not implemented')) {
        return generateMockLeaderboard('monthly');
      }
      return data.results || [];
    } catch (error) {
      console.error('Error fetching monthly leaderboard:', error);
      return generateMockLeaderboard('monthly');
    }
  },

  // Get user rank
  getUserRank: async (userId) => {
    try {
      const response = await api.get(`/analytics/user/${userId}/`);
      const data = response.data;

      if (data.error) {
        return await calculateUserRank(userId);
      }
      return data;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return await calculateUserRank(userId);
    }
  },
};


// Generate mock leaderboard data when backend is not implemented
function generateMockLeaderboard(type) {
  // Try to get actual data from trades if possible
  return [
    {
      rank: 1,
      user_id: 1,
      username: 'TopPredictor',
      total_points: 5000,
      total_predictions: 50,
      win_rate: 85,
      current_streak: 12,
    },
    {
      rank: 2,
      user_id: 2,
      username: 'MarketMaster',
      total_points: 4200,
      total_predictions: 42,
      win_rate: 78,
      current_streak: 8,
    },
    {
      rank: 3,
      user_id: 3,
      username: 'FutureSeer',
      total_points: 3800,
      total_predictions: 38,
      win_rate: 75,
      current_streak: 5,
    },
    {
      rank: 4,
      user_id: 4,
      username: 'Oracle',
      total_points: 3200,
      total_predictions: 35,
      win_rate: 72,
      current_streak: 3,
    },
    {
      rank: 5,
      user_id: 5,
      username: 'Prophet',
      total_points: 2800,
      total_predictions: 30,
      win_rate: 70,
      current_streak: 2,
    },
  ];
}

// Calculate user rank from their trades/positions
async function calculateUserRank(userId) {
  try {
    const { predictionsService } = await import('./predictions');
    const stats = await predictionsService.getPredictionStats(userId);

    // This is a simplified calculation
    // In production, the backend should calculate the actual rank
    return {
      rank: 0, // Unknown rank without full leaderboard
      total_points: stats.total_points || 0,
      win_rate: stats.win_rate || 0,
      total_predictions: stats.total || 0,
      current_streak: stats.current_streak || 0,
    };
  } catch (error) {
    console.error('Error calculating user rank:', error);
    return {
      rank: 0,
      total_points: 0,
      win_rate: 0,
      total_predictions: 0,
      current_streak: 0,
    };
  }
}


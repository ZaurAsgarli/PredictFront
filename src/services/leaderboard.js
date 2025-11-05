import api from './api';

export const leaderboardService = {
  // Get global leaderboard
  getGlobalLeaderboard: async (params = {}) => {
    const response = await api.get('/leaderboard/', { params });
    return response.data;
  },

  // Get weekly leaderboard
  getWeeklyLeaderboard: async () => {
    const response = await api.get('/leaderboard/weekly/');
    return response.data;
  },

  // Get monthly leaderboard
  getMonthlyLeaderboard: async () => {
    const response = await api.get('/leaderboard/monthly/');
    return response.data;
  },

  // Get user rank
  getUserRank: async (userId) => {
    const response = await api.get(`/leaderboard/user/${userId}/`);
    return response.data;
  },
};


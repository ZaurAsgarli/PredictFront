import api from './api';
import { fetchAllFromPaginatedEndpoint } from '../../lib/utils/pagination';

export const leaderboardService = {
  // Get global leaderboard (All-Time - SAME aggregation as weekly/monthly, NO DATE FILTER)
  getGlobalLeaderboard: async (params = {}) => {
    try {
      // All-Time: Use SAME aggregation logic as weekly/monthly, just without date filter
      // Step 1: Fetch ALL trades (no date filter) - same source as weekly/monthly
      console.log('[LeaderboardService] Fetching All-Time leaderboard - fetching ALL trades (no date filter)');
      
      const allTrades = await fetchAllFromPaginatedEndpoint(
        api,
        '/trades/',
        {}, // NO date filters - this is the ONLY difference from weekly/monthly
        1000 // Large page size for efficiency
      );
      
      console.log(`[LeaderboardService] All-time trades count: ${allTrades.length}`);
      
      // Step 2: Aggregate trades by user (SAME logic as weekly/monthly)
      // Weekly/Monthly: Trade.objects.values('user').annotate(volume=Sum('amount_staked'), count=Count('id'))
      const userAggregates = {};
      
      allTrades.forEach(trade => {
        const userId = trade.user || trade.user_id;
        if (!userId) return;
        
        if (!userAggregates[userId]) {
          userAggregates[userId] = {
            user_id: userId,
            total_volume: 0,
            trade_count: 0,
            user: null // Will fetch user details
          };
        }
        
        // Sum volume (same as weekly_volume/monthly_volume)
        const amount = parseFloat(trade.amount_staked || trade.amount || 0);
        userAggregates[userId].total_volume += amount;
        userAggregates[userId].trade_count += 1;
      });
      
      // Step 3: Sort by volume descending (SAME as weekly/monthly order_by('-weekly_volume'))
      const sortedUsers = Object.values(userAggregates)
        .sort((a, b) => b.total_volume - a.total_volume)
        .slice(0, 50); // Top 50 (same limit as weekly/monthly)
      
      // Step 4: Fetch user details (same as weekly/monthly backend does)
      // Backend: users_map = {u.id: u for u in User.objects.filter(id__in=user_ids)}
      // Frontend: Fetch users in parallel for top 50
      if (sortedUsers.length === 0) {
        console.log('[LeaderboardService] All-time leaderboard: No trades found');
        return [];
      }
      
      const userIds = sortedUsers.map(u => u.user_id);
      const userPromises = userIds.map(userId => 
        api.get(`/users/${userId}/`).catch(() => ({ data: null }))
      );
      const userResponses = await Promise.all(userPromises);
      const userMap = {};
      userResponses.forEach((response, index) => {
        if (response.data) {
          userMap[userIds[index]] = response.data;
        }
      });
      
      // Step 5: Build leaderboard response (SAME structure as weekly/monthly)
      // Weekly/Monthly return: rank, user_id, username, total_points, weekly_volume/monthly_volume, trade_count, win_rate, wallet_address
      const leaderboard = sortedUsers.map((aggregate, index) => {
        const user = userMap[aggregate.user_id] || {};
        
        return {
          rank: index + 1,
          user_id: aggregate.user_id,
          username: user.username || `User ${aggregate.user_id}`,
          total_points: parseFloat(user.total_points || 0),
          all_time_volume: aggregate.total_volume, // Same as weekly_volume/monthly_volume (for consistency)
          trade_count: aggregate.trade_count, // Same as weekly/monthly
          total_predictions: aggregate.trade_count, // UI expects this field
          win_rate: parseFloat(user.win_rate || 0),
          current_streak: user.streak || user.current_streak || 0, // UI expects this field
          wallet_address: user.wallet_address || null,
        };
      });
      
      console.log(`[LeaderboardService] All-time leaderboard: ${leaderboard.length} users, top volume: ${leaderboard[0]?.all_time_volume || 0}`);
      return leaderboard;
      
    } catch (error) {
      console.error('[LeaderboardService] Error computing All-Time leaderboard:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      return [];
    }
  },

  // Get weekly leaderboard (last 7 days)
  getWeeklyLeaderboard: async () => {
    try {
      console.log('[LeaderboardService] Fetching Weekly leaderboard - last 7 days');
      const response = await api.get('/analytics/weekly/');
      console.log('[LeaderboardService] Weekly response:', {
        url: response.config.url,
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array'
      });
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

  // Get monthly leaderboard (last 30 days)
  getMonthlyLeaderboard: async () => {
    try {
      console.log('[LeaderboardService] Fetching Monthly leaderboard - last 30 days');
      const response = await api.get('/analytics/monthly/');
      console.log('[LeaderboardService] Monthly response:', {
        url: response.config.url,
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array'
      });
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


import api from './api';

export const predictionsService = {
  // Create a new prediction (trade)
  createPrediction: async (predictionData) => {
    try {
      // Map frontend prediction data to backend trade format
      // Backend expects: market_id, outcome_type ('YES' or 'NO'), trade_type ('buy' or 'sell'), amount_staked
      let outcomeType = predictionData.outcome_type;
      
      // If outcome is provided as an option ID or name, try to map it
      if (predictionData.outcome && !outcomeType) {
        // If outcome is a string that contains 'YES' or 'NO', extract it
        const outcomeStr = String(predictionData.outcome).toUpperCase();
        if (outcomeStr.includes('YES') || outcomeStr === '1' || outcomeStr === 'TRUE') {
          outcomeType = 'YES';
        } else if (outcomeStr.includes('NO') || outcomeStr === '0' || outcomeStr === 'FALSE') {
          outcomeType = 'NO';
        } else {
          // Default to YES if we can't determine
          outcomeType = 'YES';
        }
      }
      
      const tradeData = {
        market_id: predictionData.eventId || predictionData.event || predictionData.market_id,
        outcome_type: outcomeType || 'YES', // Default to YES if not specified
        trade_type: predictionData.trade_type || 'buy', // buy or sell
        amount_staked: predictionData.stake || predictionData.amount || predictionData.amount_staked || 10,
      };
      
      const response = await api.post('/trades/', tradeData);
      // Backend returns {trade: {...}, position: {...}, price: {...}} or just trade
      const tradeData_resp = response.data.trade || response.data;
      return transformTradeToPrediction(tradeData_resp);
    } catch (error) {
      console.error('Error creating prediction:', error);
      throw error;
    }
  },

  // Get user's predictions (trades)
  getUserPredictions: async (userId) => {
    try {
      // Use /users/me/trades/ for current user
      const response = await api.get('/users/me/trades/');
      const trades = response.data.results || (Array.isArray(response.data) ? response.data : []);
      return trades.map(trade => transformTradeToPrediction(trade));
    } catch (error) {
      console.error('Error fetching user predictions:', error);
      return [];
    }
  },

  // Get predictions for an event (trades for a market)
  getEventPredictions: async (eventId) => {
    try {
      // Filter trades by market_id
      const response = await api.get('/trades/', {
        params: { market: eventId } // Backend uses 'market' param, not 'market_id'
      });
      const trades = response.data.results || (Array.isArray(response.data) ? response.data : []);
      return trades.map(trade => transformTradeToPrediction(trade));
    } catch (error) {
      console.error('Error fetching event predictions:', error);
      return [];
    }
  },

  // Update a prediction (not directly supported - trades are immutable)
  updatePrediction: async (id, predictionData) => {
    // Trades are immutable in this system, so we can't update them
    // Instead, create a new trade to adjust position
    return this.createPrediction(predictionData);
  },

  // Delete a prediction (not directly supported - create opposite trade instead)
  deletePrediction: async (id) => {
    // Trades can't be deleted, but you can create an opposite trade
    // This would require fetching the trade first to get its details
    throw new Error('Trades cannot be deleted. Create an opposite trade to close the position.');
  },

  // Get prediction statistics (user positions aggregated)
  getPredictionStats: async (userId) => {
    try {
      // Get user positions
      const response = await api.get('/users/me/positions/');
      const positions = response.data.results || (Array.isArray(response.data) ? response.data : []);
      
      // Aggregate stats from positions and trades
      const tradesResponse = await api.get('/users/me/trades/');
      const trades = tradesResponse.data.results || (Array.isArray(tradesResponse.data) ? tradesResponse.data : []);
      
      // Calculate stats
      const totalTrades = trades.length;
      const resolvedTrades = trades.filter(t => t.market?.status === 'resolved');
      const wonTrades = resolvedTrades.filter(t => {
        const marketOutcome = t.market?.resolution_outcome;
        return marketOutcome && t.outcome_type === marketOutcome;
      });
      const winRate = resolvedTrades.length > 0 
        ? Math.round((wonTrades.length / resolvedTrades.length) * 100) 
        : 0;
      
      // Calculate total points (sum of amount_staked from all trades)
      const totalPoints = trades.reduce((sum, t) => sum + (parseFloat(t.amount_staked) || 0), 0);
      
      // Calculate current streak (simplified - count consecutive wins)
      let currentStreak = 0;
      for (let i = resolvedTrades.length - 1; i >= 0; i--) {
        const trade = resolvedTrades[i];
        const marketOutcome = trade.market?.resolution_outcome;
        if (marketOutcome && trade.outcome_type === marketOutcome) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return {
        total: totalTrades,
        win_rate: winRate,
        total_points: totalPoints,
        current_streak: currentStreak,
        achievements: 0, // Placeholder
      };
    } catch (error) {
      console.error('Error fetching prediction stats:', error);
      return {
        total: 0,
        win_rate: 0,
        total_points: 0,
        current_streak: 0,
        achievements: 0,
      };
    }
  },
};

// Transform backend trade format to frontend prediction format
function transformTradeToPrediction(trade) {
  const market = trade.market || {};
  const status = market.status === 'resolved' 
    ? (trade.outcome_type === market.resolution_outcome ? 'won' : 'lost')
    : 'pending';
  
  return {
    id: trade.id,
    event_title: market.title || 'Unknown Event',
    event_id: market.id,
    outcome_name: trade.outcome_type,
    outcome_type: trade.outcome_type,
    status: status,
    confidence: trade.price_at_execution 
      ? Math.round(parseFloat(trade.price_at_execution) * 100) 
      : 50,
    stake: parseFloat(trade.amount_staked) || 0,
    reward: status === 'won' ? parseFloat(trade.amount_staked) * 2 : null,
    created_at: trade.created_at,
    event_end_date: market.ends_at,
    event: market,
    // Keep original trade data
    _trade: trade,
  };
}


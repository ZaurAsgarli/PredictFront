import api from './api';

export const predictionsService = {
  // Create a new prediction (trade)
  createPrediction: async (predictionData) => {
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
    // Backend returns the trade object directly or wrapped in data
    return response.data.data || response.data;
  },

  // Get user's predictions (trades)
  getUserPredictions: async (userId) => {
    // Use /users/me/trades/ for current user
    const response = await api.get('/users/me/trades/');
    return response.data.results || response.data;
  },

  // Get predictions for an event (trades for a market)
  getEventPredictions: async (eventId) => {
    // Filter trades by market_id
    const response = await api.get('/trades/', {
      params: { market_id: eventId }
    });
    return response.data.results || response.data;
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

  // Get prediction statistics (user positions)
  getPredictionStats: async (userId) => {
    // Get user positions instead
    const response = await api.get('/users/me/positions/');
    return response.data.results || response.data;
  },
};


import api from './api';

export const predictionsService = {
  // Create a new prediction (trade)
  createPrediction: async (predictionData) => {
    // Map frontend prediction data to backend trade format
    const tradeData = {
      market_id: predictionData.eventId || predictionData.market_id,
      outcome_type: predictionData.outcome || predictionData.outcome_type, // YES or NO
      trade_type: predictionData.trade_type || 'buy', // buy or sell
      amount_staked: predictionData.amount || predictionData.amount_staked,
    };
    const response = await api.post('/trades/', tradeData);
    // Backend returns { success: true, data: { trade, position, price } }
    return response.data.data || response.data;
  },

  // Get user's predictions (trades)
  getUserPredictions: async (userId) => {
    // Use /auth/me/trades/ for current user, or filter by user if admin
    const response = await api.get('/auth/me/trades/');
    return response.data.results || response.data;
  },

  // Get predictions for an event (trades for a market)
  getEventPredictions: async (eventId) => {
    const response = await api.get(`/markets/${eventId}/trades/`);
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
    const response = await api.get('/auth/me/positions/');
    return response.data.results || response.data;
  },
};


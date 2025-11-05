import api from './api';

export const predictionsService = {
  // Create a new prediction
  createPrediction: async (predictionData) => {
    const response = await api.post('/predictions/', predictionData);
    return response.data;
  },

  // Get user's predictions
  getUserPredictions: async (userId) => {
    const response = await api.get(`/predictions/user/${userId}/`);
    return response.data;
  },

  // Get predictions for an event
  getEventPredictions: async (eventId) => {
    const response = await api.get(`/predictions/event/${eventId}/`);
    return response.data;
  },

  // Update a prediction
  updatePrediction: async (id, predictionData) => {
    const response = await api.put(`/predictions/${id}/`, predictionData);
    return response.data;
  },

  // Delete a prediction
  deletePrediction: async (id) => {
    const response = await api.delete(`/predictions/${id}/`);
    return response.data;
  },

  // Get prediction statistics
  getPredictionStats: async (userId) => {
    const response = await api.get(`/predictions/stats/${userId}/`);
    return response.data;
  },
};


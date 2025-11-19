import api from './api';

export const eventsService = {
  // Get all events (markets)
  getAllEvents: async (params = {}) => {
    const response = await api.get('/markets/', { params });
    // Backend returns paginated response with results array
    return response.data.results || response.data;
  },

  // Get event by ID (market)
  getEventById: async (id) => {
    const response = await api.get(`/markets/${id}/`);
    return response.data;
  },

  // Get active events
  getActiveEvents: async () => {
    const response = await api.get('/markets/', { 
      params: { status: 'active' } 
    });
    return response.data.results || response.data;
  },

  // Get featured events
  getFeaturedEvents: async () => {
    const response = await api.get('/markets/featured/');
    // Backend returns { success: true, data: [...] }
    return response.data.data || response.data.results || response.data;
  },

  // Get event categories
  getCategories: async () => {
    const response = await api.get('/markets/categories/');
    // Backend returns { success: true, data: [...] }
    return response.data.data || response.data.results || response.data;
  },
};


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
    // Filter by featured field if backend supports it, otherwise get active events
    const response = await api.get('/markets/', { 
      params: { featured: true } 
    });
    // Backend returns paginated response with results array
    return response.data.results || response.data;
  },

  // Get event categories
  getCategories: async () => {
    // If backend has a categories endpoint, use it. Otherwise, extract from markets
    try {
      const response = await api.get('/markets/');
      const markets = response.data.results || response.data;
      // Extract unique categories from markets
      const categories = [...new Set(markets.map(m => m.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
};


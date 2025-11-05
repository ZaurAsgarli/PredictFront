import api from './api';

export const eventsService = {
  // Get all events
  getAllEvents: async (params = {}) => {
    const response = await api.get('/events/', { params });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}/`);
    return response.data;
  },

  // Get active events
  getActiveEvents: async () => {
    const response = await api.get('/events/', { 
      params: { status: 'active' } 
    });
    return response.data;
  },

  // Get featured events
  getFeaturedEvents: async () => {
    const response = await api.get('/events/', { 
      params: { featured: true } 
    });
    return response.data;
  },

  // Get event categories
  getCategories: async () => {
    const response = await api.get('/events/categories/');
    return response.data;
  },
};


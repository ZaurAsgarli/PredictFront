import api from './api';

export const eventsService = {
  // Get all events (markets)
  getAllEvents: async (params = {}) => {
    try {
      const response = await api.get('/markets/', { params });
      // Backend returns paginated response with results array or array directly
      const data = response.data.results || (Array.isArray(response.data) ? response.data : []);
      
      // Transform market data to event format for frontend compatibility
      return data.map(market => transformMarketToEvent(market));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get event by ID (market)
  getEventById: async (id) => {
    try {
      const response = await api.get(`/markets/${id}/`);
      return transformMarketToEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Get active events
  getActiveEvents: async () => {
    try {
      const response = await api.get('/markets/', { 
        params: { status: 'active' } 
      });
      const data = response.data.results || (Array.isArray(response.data) ? response.data : []);
      return data.map(market => transformMarketToEvent(market));
    } catch (error) {
      console.error('Error fetching active events:', error);
      throw error;
    }
  },

  // Get featured events (active markets with highest liquidity)
  getFeaturedEvents: async () => {
    try {
      // Use the featured endpoint if available, otherwise get active events
      try {
        const response = await api.get('/markets/featured/');
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map(market => transformMarketToEvent(market));
      } catch {
        // Fallback to active events sorted by liquidity
        const response = await api.get('/markets/', { 
          params: { status: 'active' } 
        });
        const data = response.data.results || (Array.isArray(response.data) ? response.data : []);
        // Sort by liquidity_pool descending and take top 10
        const sorted = data
          .sort((a, b) => (b.liquidity_pool || 0) - (a.liquidity_pool || 0))
          .slice(0, 10);
        return sorted.map(market => transformMarketToEvent(market));
      }
    } catch (error) {
      console.error('Error fetching featured events:', error);
      return [];
    }
  },

  // Get event categories
  getCategories: async () => {
    try {
      // Try categories endpoint first
      try {
        const response = await api.get('/markets/categories/');
        const data = Array.isArray(response.data) ? response.data : [];
        return data;
      } catch {
        // Fallback: extract from markets
        const response = await api.get('/markets/');
        const markets = response.data.results || (Array.isArray(response.data) ? response.data : []);
        // Extract unique categories from markets
        const categoryMap = new Map();
        markets.forEach(m => {
          if (m.category) {
            const cat = typeof m.category === 'string' ? { name: m.category } : m.category;
            if (cat.name && !categoryMap.has(cat.name)) {
              categoryMap.set(cat.name, cat);
            }
          }
        });
        return Array.from(categoryMap.values());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
};

// Transform backend market format to frontend event format
function transformMarketToEvent(market) {
  // Backend returns market with prices object: {yes_price: 0.5, no_price: 0.5}
  // or prices from outcome_tokens
  let yesPrice = 0.5;
  let noPrice = 0.5;
  
  if (market.prices) {
    yesPrice = market.prices.yes_price || 0.5;
    noPrice = market.prices.no_price || 0.5;
  } else if (market.outcome_tokens && Array.isArray(market.outcome_tokens)) {
    const yesToken = market.outcome_tokens.find(t => t.outcome_type === 'YES');
    const noToken = market.outcome_tokens.find(t => t.outcome_type === 'NO');
    yesPrice = yesToken?.price || 0.5;
    noPrice = noToken?.price || 0.5;
  }
  
  return {
    id: market.id,
    title: market.title,
    description: market.description,
    status: market.status,
    category: market.category,
    ends_at: market.ends_at,
    created_at: market.created_at,
    yes_price: yesPrice,
    no_price: noPrice,
    participants_count: market.participants_count || 0,
    total_volume: market.liquidity_pool || 0,
    liquidity_pool: market.liquidity_pool || 0,
    image: market.image || null,
    // Keep original market data for reference
    _market: market,
  };
}


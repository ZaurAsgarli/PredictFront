import api from './api';
import { fetchAllFromPaginatedEndpoint } from '../../lib/utils/pagination';

export const eventsService = {
  // Get all events (markets) - fetches ALL pages
  getAllEvents: async (params = {}) => {
    try {
      // Fetch all pages of markets
      const allMarkets = await fetchAllFromPaginatedEndpoint(
        api,
        '/markets/',
        params,
        100 // page size
      );

      // Transform market data to event format for frontend compatibility
      return allMarkets.map(market => transformMarketToEvent(market));
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

  // Get active events - fetches ALL active markets
  getActiveEvents: async () => {
    try {
      // Fetch all pages of active markets
      const allMarkets = await fetchAllFromPaginatedEndpoint(
        api,
        '/markets/',
        { status: 'active' },
        100
      );
      return allMarkets.map(market => transformMarketToEvent(market));
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
        // Fallback: fetch ALL active events, sort by liquidity, take top 10
        const allActive = await fetchAllFromPaginatedEndpoint(
          api,
          '/markets/',
          { status: 'active' },
          100
        );
        // Sort by liquidity_pool descending and take top 10
        const sorted = allActive
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

  // Get price history for a market
  getPriceHistory: async (id) => {
    try {
      const response = await api.get(`/markets/${id}/history/`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  },

  // Get recent trades for a market
  getRecentTrades: async (id) => {
    try {
      const response = await api.get('/trades/', {
        params: { market: id, limit: 10 }
      });
      const data = response.data.results || (Array.isArray(response.data) ? response.data : []);
      return data;
    } catch (error) {
      console.error('Error fetching recent trades:', error);
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
    yesPrice = parseFloat(market.prices.yes_price) || 0.5;
    noPrice = parseFloat(market.prices.no_price) || 0.5;
  } else if (market.outcome_tokens && Array.isArray(market.outcome_tokens)) {
    const yesToken = market.outcome_tokens.find(t => t.outcome_type === 'YES');
    const noToken = market.outcome_tokens.find(t => t.outcome_type === 'NO');
    yesPrice = parseFloat(yesToken?.price) || 0.5;
    noPrice = parseFloat(noToken?.price) || 0.5;
  }

  // Calculate participants count from trades if not provided
  // This is a fallback - backend should provide this
  const participantsCount = market.participants_count || 0;

  return {
    id: market.id,
    title: market.title || market.name || 'Untitled Market',
    description: market.description || '',
    status: market.status || 'active',
    category: market.category || null,
    ends_at: market.ends_at || market.end_date,
    created_at: market.created_at || market.created_date,
    yes_price: yesPrice,
    no_price: noPrice,
    participants_count: participantsCount,
    total_volume: parseFloat(market.liquidity_pool) || 0,
    liquidity_pool: parseFloat(market.liquidity_pool) || 0,
    image: market.image || market.image_url || null,
    // Keep original market data for reference
    _market: market,
  };
}


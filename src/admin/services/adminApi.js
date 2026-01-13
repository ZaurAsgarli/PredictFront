import axios from 'axios';

// Hardcode API URL to ensure it works in standalone admin app
const API_URL = 'http://localhost:8000/api';

// Create axios instance for admin API calls
const adminAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
adminAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Admin Login
  adminLogin: async (email, password) => {
    const response = await adminAxios.post('/users/login/', { email, password });
    const accessToken = response.data.tokens?.access || response.data.token;
    if (accessToken && typeof window !== 'undefined') {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get Markets
  getMarkets: async (params = {}) => {
    const response = await adminAxios.get('/markets/', { params });
    return response.data;
  },

  // Get Featured Markets
  getFeaturedMarkets: async () => {
    const response = await adminAxios.get('/markets/featured/');
    return response.data;
  },

  // Get Single Market
  getMarket: async (id) => {
    const response = await adminAxios.get(`/markets/${id}/`);
    return response.data;
  },

  // Create Market
  createMarket: async (marketData) => {
    const response = await adminAxios.post('/markets/create/', marketData);
    return response.data;
  },

  // Resolve Market
  resolveMarket: async (id, outcome) => {
    const response = await adminAxios.post(`/markets/${id}/resolve/`, { outcome });
    return response.data;
  },

  // Get Market Trades
  getMarketTrades: async (id, params = {}) => {
    const response = await adminAxios.get(`/markets/${id}/trades/`, { params });
    return response.data;
  },

  // Get Market Positions
  getMarketPositions: async (id, params = {}) => {
    const response = await adminAxios.get(`/markets/${id}/position/`, { params });
    return response.data;
  },

  // Get Trades
  getTrades: async (params = {}) => {
    const response = await adminAxios.get('/trades/', { params });
    return response.data;
  },

  // Get Disputes
  getDisputes: async (params = {}) => {
    const response = await adminAxios.get('/disputes/', { params });
    return response.data;
  },

  // Resolve Dispute
  resolveDispute: async (id, action) => {
    const response = await adminAxios.post(`/disputes/${id}/resolve`, { action });
    return response.data;
  },

  // Get Users (via leaderboard - the only user list endpoint available)
  getUsers: async (params = {}) => {
    const response = await adminAxios.get('/users/leaderboard/', { params });
    return response.data;
  },

  // Get User Details
  getUserDetails: async (id) => {
    const response = await adminAxios.get(`/users/${id}/`);
    return response.data;
  },
};

export default adminApi;


import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create separate axios instance for admin with admin token
const adminAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add admin token to requests
adminAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
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

// Handle 401 errors for admin
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Admin Login
  adminLogin: async (email, password) => {
    const response = await adminAxios.post('/auth/login/', { email, password });
    const accessToken = response.data.tokens?.access || response.data.token || response.data.access;
    
    if (accessToken && typeof window !== 'undefined') {
      localStorage.setItem('admin_token', accessToken);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user || response.data));
    }
    
    // Check if user is staff
    const user = response.data.user || response.data;
    if (!user.is_staff) {
      throw new Error('Access denied. Admin privileges required.');
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

  // Create Market
  createMarket: async (marketData) => {
    const response = await adminAxios.post('/markets/create/', marketData);
    return response.data;
  },

  // Get Market by ID
  getMarketById: async (id) => {
    const response = await adminAxios.get(`/markets/${id}/`);
    return response.data;
  },

  // Resolve Market
  resolveMarket: async (id, outcome) => {
    const response = await adminAxios.post(`/markets/${id}/resolve/`, { outcome });
    return response.data;
  },

  // Get Market Trades
  getMarketTrades: async (id) => {
    const response = await adminAxios.get(`/markets/${id}/trades/`);
    return response.data;
  },

  // Get Market Positions
  getMarketPositions: async (id) => {
    const response = await adminAxios.get(`/markets/${id}/position/`);
    return response.data;
  },

  // Get Trades
  getTrades: async (params = {}) => {
    const response = await adminAxios.get('/trades/', { params });
    return response.data;
  },

  // Get Users / Leaderboard
  getUsers: async () => {
    const response = await adminAxios.get('/leaderboard/global/');
    return response.data;
  },

  // Get User by ID
  getUserById: async (id) => {
    const response = await adminAxios.get(`/leaderboard/user/${id}/`);
    return response.data;
  },

  // Get Disputes
  getDisputes: async (params = {}) => {
    const response = await adminAxios.get('/disputes/', { params });
    return response.data;
  },

  // Resolve Dispute
  resolveDispute: async (id, action) => {
    const response = await adminAxios.post(`/disputes/${id}/resolve/`, { action });
    return response.data;
  },

  // Get Current Admin User
  getCurrentAdmin: async () => {
    try {
      const response = await adminAxios.get('/users/me/');
      return response.data;
    } catch (error) {
      if (typeof window === 'undefined') return null;
      const userStr = localStorage.getItem('admin_user');
      return userStr ? JSON.parse(userStr) : null;
    }
  },

  // Check if user is admin
  isAdmin: () => {
    if (typeof window === 'undefined') return false;
    const userStr = localStorage.getItem('admin_user');
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      return user.is_staff === true;
    } catch {
      return false;
    }
  },

  // Logout admin
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  },
};

export default adminApi;


import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const adminAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (error) => Promise.reject(error)
);

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

export const adminApiExtended = {
  // Metrics
  getMetrics: async () => {
    const response = await adminAxios.get('/admin/metrics/');
    return response.data;
  },

  // Markets Management
  getMarkets: async (params = {}) => {
    const response = await adminAxios.get('/markets/', { params });
    return response.data;
  },

  pauseMarket: async (id) => {
    const response = await adminAxios.post(`/admin/markets/${id}/pause/`);
    return response.data;
  },

  resumeMarket: async (id) => {
    const response = await adminAxios.post(`/admin/markets/${id}/resume/`);
    return response.data;
  },

  forceCloseMarket: async (id, reason) => {
    const response = await adminAxios.post(`/admin/markets/${id}/force-close/`, { reason });
    return response.data;
  },

  manualResolveMarket: async (id, outcome, evidence) => {
    const response = await adminAxios.post(`/admin/markets/${id}/manual-resolve/`, { outcome, evidence });
    return response.data;
  },

  flagMarket: async (id, reason) => {
    const response = await adminAxios.post(`/admin/markets/${id}/flag/`, { reason });
    return response.data;
  },

  // Users Management
  getUsers: async (params = {}) => {
    const response = await adminAxios.get('/admin/users/', { params });
    return response.data;
  },

  getUserDetails: async (id) => {
    const response = await adminAxios.get(`/admin/users/${id}/`);
    return response.data;
  },

  softBanUser: async (id, reason, duration) => {
    const response = await adminAxios.post(`/admin/users/${id}/soft-ban/`, { reason, duration });
    return response.data;
  },

  hardBanUser: async (id, reason) => {
    const response = await adminAxios.post(`/admin/users/${id}/hard-ban/`, { reason });
    return response.data;
  },

  freezeWithdrawals: async (id, reason) => {
    const response = await adminAxios.post(`/admin/users/${id}/freeze-withdrawals/`, { reason });
    return response.data;
  },

  // Risk & Fraud
  getSuspiciousUsers: async () => {
    const response = await adminAxios.get('/admin/risk/suspicious-users/');
    return response.data;
  },

  getLargeStakeAlerts: async () => {
    const response = await adminAxios.get('/admin/risk/large-stakes/');
    return response.data;
  },

  getWashTradingDetections: async () => {
    const response = await adminAxios.get('/admin/risk/wash-trading/');
    return response.data;
  },

  getRiskScores: async () => {
    const response = await adminAxios.get('/ml/risk-scores');
    return response.data;
  },

  // Resolutions
  getPendingResolutions: async () => {
    const response = await adminAxios.get('/admin/resolutions/pending/');
    return response.data;
  },

  manualOverrideResolution: async (id, outcome, evidence, confirmation) => {
    const response = await adminAxios.post(`/admin/resolutions/${id}/override/`, {
      outcome,
      evidence,
      confirmation,
    });
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const response = await adminAxios.get('/admin/audit-logs/', { params });
    return response.data;
  },

  // Predictive Intelligence
  getProbabilityDrift: async (marketId) => {
    const response = await adminAxios.get(`/admin/intelligence/probability-drift/${marketId}/`);
    return response.data;
  },

  getLiquidityFlow: async (marketId) => {
    const response = await adminAxios.get(`/admin/intelligence/liquidity-flow/${marketId}/`);
    return response.data;
  },

  getMarketImbalance: async () => {
    const response = await adminAxios.get('/admin/intelligence/market-imbalance/');
    return response.data;
  },

  // API Health
  getAPIHealth: async () => {
    const response = await adminAxios.get('/admin/health/');
    return response.data;
  },
};

export default adminApiExtended;


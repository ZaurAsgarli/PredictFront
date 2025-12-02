import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second

// Exponential backoff retry logic
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network error - retry
    return true;
  }
  const status = error.response.status;
  // Retry on 429 (rate limit) and 5xx errors
  return status === 429 || (status >= 500 && status < 600);
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
});


// Request interceptor with retry logic
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (userId) {
        config.headers['X-User-ID'] = userId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    
    // Initialize retry count
    if (!config._retryCount) {
      config._retryCount = 0;
    }

    // Handle 401 errors (unauthorized) - redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 403 errors (forbidden) - show authorization error
    if (error.response?.status === 403 && typeof window !== 'undefined') {
      // Could show toast notification here
      return Promise.reject(error);
    }

    // Retry logic for network errors and 429/5xx
    if (shouldRetry(error) && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;
      const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1); // Exponential backoff
      await sleep(delay);
      return api(config);
    }

    // Handle CORS errors gracefully
    if (!error.response && error.message === 'Network Error') {
      // Don't log in production
      if (process.env.NODE_ENV === 'development') {
        console.error('CORS or Network Error. Make sure the backend is running at', API_BASE_URL);
      }
    }

    return Promise.reject(error);
  }
);

// SWR Fetcher function
export const fetcher = (url: string) => api.get(url).then((res) => res.data);

// API endpoints
// Note: baseURL already includes '/api', so endpoints should NOT include '/api' prefix
export const apiEndpoints = {
  // Markets
  markets: '/markets',
  marketById: (id: string) => `/markets/${id}`,
  
  // Trading
  trade: '/trade',
  
  // Holders
  holders: (eventId: string) => `/holders?event_id=${eventId}`,
  
  // Security (Admin)
  securityLogs: '/admin/logs/',
  
  // ML/Intelligence (Admin)
  liquidityHealth: '/ml/liquidity-health',
  riskScores: '/ml/risk-scores',
  mlModels: '/admin/ml/models/',
  mlModelHealthCheck: (id: string) => `/admin/ml/models/${id}/health_check/`,
  securityAlerts: '/admin/security/alerts/',
  recentAPICalls: '/admin/metrics/recent_calls/',
  
  // Wallets
  wallets: '/users/wallets/',
  walletById: (id: string) => `/users/wallets/${id}/`,
  
  // Events
  events: '/events/',
  eventById: (id: string) => `/events/${id}/`,
  eventHistory: (id: string, range?: string) => `/events/${id}/history/${range ? `?range=${range}` : ''}`,
  eventShareholders: (id: string) => `/events/${id}/shareholders/`,
};

export default api;


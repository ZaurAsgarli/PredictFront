import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ========== REQUEST DEDUPLICATION ==========
// Track active requests by key (method + url + params)
const activeRequests = new Map<string, Promise<AxiosResponse>>();

/**
 * Generate request key for deduplication
 */
function getRequestKey(method: string, url: string, params?: any, data?: any): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  const dataStr = data ? JSON.stringify(data) : '';
  return `${method.toUpperCase()}_${url}_${paramsStr}_${dataStr}`;
}

/**
 * Request deduplication wrapper
 */
function deduplicatedRequest<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  key: string
): Promise<AxiosResponse<T>> {
  // If request already active, return existing promise
  if (activeRequests.has(key)) {
    return activeRequests.get(key)! as Promise<AxiosResponse<T>>;
  }

  // Create new request
  const promise = requestFn()
    .finally(() => {
      // Remove from active requests when done
      activeRequests.delete(key);
    });

  // Store in active requests
  activeRequests.set(key, promise);

  return promise;
}

// ========== REQUEST GOVERNOR ==========
// Limit concurrent requests to prevent bursts
const MAX_CONCURRENT_REQUESTS = 10;
let activeRequestCount = 0;
const requestQueue: Array<() => void> = [];

/**
 * Acquire request slot (wait if at limit)
 */
async function acquireRequestSlot(): Promise<void> {
  return new Promise((resolve) => {
    if (activeRequestCount < MAX_CONCURRENT_REQUESTS) {
      activeRequestCount++;
      resolve();
    } else {
      // Queue request (drop if queue too long to prevent memory issues)
      if (requestQueue.length < 50) {
        requestQueue.push(() => {
          activeRequestCount++;
          resolve();
        });
      } else {
        // Queue full, still resolve (will be rate limited by backend)
        resolve();
      }
    }
  });
}

/**
 * Release request slot (process next in queue)
 */
function releaseRequestSlot(): void {
  activeRequestCount = Math.max(0, activeRequestCount - 1);
  if (requestQueue.length > 0) {
    const next = requestQueue.shift();
    if (next) next();
  }
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
});

// Request interceptor - Add token and track for governor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Request governor - wait if at limit
    await acquireRequestSlot();

    // Add auth token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    releaseRequestSlot();
    return Promise.reject(error);
  }
);

// Response interceptor - Release slot and handle errors (NO RETRIES for 401, 404, 429)
axiosInstance.interceptors.response.use(
  (response) => {
    releaseRequestSlot();
    return response;
  },
  async (error: AxiosError) => {
    releaseRequestSlot();

    // Handle 401 errors (unauthorized) - redirect to login, NO RETRY
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Handle 403 errors (forbidden) - NO RETRY
    if (error.response?.status === 403) {
      return Promise.reject(error);
    }

    // Handle 404 errors (not found) - NO RETRY
    if (error.response?.status === 404) {
      return Promise.reject(error);
    }

    // Handle 429 errors (rate limit) - FAIL FAST, NO RETRY
    if (error.response?.status === 429) {
      console.warn('[API] Rate limited (429):', error.config?.url);
      return Promise.reject(error);
    }

    // Handle 5xx errors - NO RETRY (fail fast to prevent storms)
    if (error.response?.status >= 500 && error.response?.status < 600) {
      console.error('[API] Server error:', error.config?.url, error.response.status);
      return Promise.reject(error);
    }

    // Handle CORS/Network errors - NO RETRY
    if (!error.response && error.message === 'Network Error') {
      if (process.env.NODE_ENV === 'development') {
        console.error('CORS or Network Error. Make sure the backend is running at', API_BASE_URL);
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ========== DEDUPLICATED API WRAPPER ==========
/**
 * API wrapper with deduplication and governor
 * Wraps axios methods to prevent duplicate requests
 */
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    const key = getRequestKey('GET', url, config?.params, undefined);
    return deduplicatedRequest(
      () => axiosInstance.get<T>(url, config),
      key
    );
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    const key = getRequestKey('POST', url, config?.params, data);
    return deduplicatedRequest(
      () => axiosInstance.post<T>(url, data, config),
      key
    );
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    const key = getRequestKey('PUT', url, config?.params, data);
    return deduplicatedRequest(
      () => axiosInstance.put<T>(url, data, config),
      key
    );
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    const key = getRequestKey('PATCH', url, config?.params, data);
    return deduplicatedRequest(
      () => axiosInstance.patch<T>(url, data, config),
      key
    );
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    const key = getRequestKey('DELETE', url, config?.params, undefined);
    return deduplicatedRequest(
      () => axiosInstance.delete<T>(url, config),
      key
    );
  },
  // Expose interceptors for compatibility (but deduplication happens at method level)
  interceptors: axiosInstance.interceptors,
};

// SWR Fetcher function (with deduplication built-in via api wrapper)
export const fetcher = (url: string) => api.get(url).then((res) => res.data);

// API endpoints
// Note: baseURL already includes '/api', so endpoints should NOT include '/api' prefix
export const apiEndpoints = {
  // Authentication & Users
  signup: '/users/signup/',
  login: '/users/login/',
  tokenRefresh: '/token/refresh/',
  me: '/users/me/',
  userLeaderboard: '/users/leaderboard/',
  userTrades: '/users/me/trades/',
  userPositions: '/users/me/positions/',
  
  // Markets
  markets: '/markets/',
  marketById: (id: string | number) => `/markets/${id}/`,
  marketFeatured: '/markets/featured/',
  marketCategories: '/markets/categories/',
  marketTrades: (id: string | number) => `/markets/${id}/trades/`,
  marketPosition: (id: string | number) => `/markets/${id}/position/`,
  marketPriceHistory: (id: string | number) => `/markets/${id}/price_history/`,
  marketResolve: (id: string | number) => `/markets/${id}/resolve/`, // Admin only
  
  // Trades
  trades: '/trades/',
  tradeById: (id: string | number) => `/trades/${id}/`,
  createTrade: '/trades/',
  
  // Analytics & Leaderboards
  globalLeaderboard: '/analytics/global/',
  weeklyLeaderboard: '/analytics/weekly/',
  monthlyLeaderboard: '/analytics/monthly/',
  userLeaderboardRank: (userId: string | number) => `/analytics/user/${userId}/`,
  
  // ML & Risk Assessment
  mlRiskPredict: '/ml/risk/predict/',
  mlUserExposure: (userId: string | number) => `/ml/exposure/user/${userId}/`,
  mlUserRiskProfile: (userId: string | number) => `/ml/exposure/user/${userId}/profile/`,
  mlMarketRisk: (marketId: string | number) => `/ml/exposure/market/${marketId}/`,
  mlAllMarketRisks: '/ml/exposure/markets/',
  mlAllUserRiskProfiles: '/ml/exposure/users/',
  mlMarketManipulation: (marketId: string | number) => `/ml/manipulation/market/${marketId}/`,
  mlAllMarketsManipulation: '/ml/manipulation/markets/',
  mlUserManipulationRisk: (userId: string | number) => `/ml/manipulation/user/${userId}/`,
  mlPlatformHealth: '/ml/health/',
  mlHealthDashboard: '/ml/health/dashboard/',
  mlTokenBehavior: (marketId: string | number) => `/ml/token-behavior/market/${marketId}/`,
  
  // Admin Endpoints
  adminStats: '/admin/stats/',
  adminSecurityLogs: '/admin/security-logs/',
  adminSecurity: '/admin/security/',
  adminSuspiciousUsers: '/admin/suspicious/',
  adminMLInsights: '/admin/ml-insights/',
  adminDeployments: '/admin/deployments/',
  adminLogs: '/admin/logs/', // SecurityLogViewSet - GET /api/admin/logs/
  adminLogsStats: '/admin/logs/stats/', // SecurityLogViewSet.stats action
  adminLoginAttempts: '/admin/login-attempts/', // LoginAttemptViewSet
};

export default api;

/**
 * Admin API Client - Unified with Main UI
 * 
 * Uses SAME base URL, auth mechanism, and endpoints as main UI
 * - Base URL: http://localhost:8000/api
 * - Auth: JWT tokens from localStorage (not cookies)
 * - Endpoints: Reuse existing backend endpoints
 * - NO retries for 429, 401, 404 (fail fast)
 * - Request deduplication built-in
 * - Request governor limits concurrent requests
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ========== REQUEST DEDUPLICATION ==========
const activeRequests = new Map();

function getRequestKey(method, url, params, data) {
  const paramsStr = params ? JSON.stringify(params) : '';
  const dataStr = data ? JSON.stringify(data) : '';
  return `${method.toUpperCase()}_${url}_${paramsStr}_${dataStr}`;
}

function deduplicatedRequest(requestFn, key) {
  if (activeRequests.has(key)) {
    return activeRequests.get(key);
  }

  const promise = requestFn().finally(() => {
    activeRequests.delete(key);
  });

  activeRequests.set(key, promise);
  return promise;
}

// ========== REQUEST GOVERNOR ==========
const MAX_CONCURRENT_REQUESTS = 10;
let activeRequestCount = 0;
const requestQueue = [];

async function acquireRequestSlot() {
  return new Promise((resolve) => {
    if (activeRequestCount < MAX_CONCURRENT_REQUESTS) {
      activeRequestCount++;
      resolve();
    } else {
      if (requestQueue.length < 50) {
        requestQueue.push(() => {
          activeRequestCount++;
          resolve();
        });
      } else {
        resolve();
      }
    }
  });
}

function releaseRequestSlot() {
  activeRequestCount = Math.max(0, activeRequestCount - 1);
  if (requestQueue.length > 0) {
    const next = requestQueue.shift();
    if (next) next();
  }
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add token and track for governor
axiosInstance.interceptors.request.use(
  async (config) => {
    await acquireRequestSlot();

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

// Response interceptor - Release slot and handle errors (NO RETRIES)
axiosInstance.interceptors.response.use(
  (response) => {
    releaseRequestSlot();
    return response;
  },
  async (error) => {
    releaseRequestSlot();

    // Handle 401 - Redirect to login, NO RETRY
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }

    // Handle 403 - NO RETRY
    if (error.response?.status === 403) {
      return Promise.reject(error);
    }

    // Handle 404 - NO RETRY
    if (error.response?.status === 404) {
      return Promise.reject(error);
    }

    // Handle 429 - FAIL FAST, NO RETRY
    if (error.response?.status === 429) {
      console.warn('[API] Rate limited (429):', error.config?.url);
      return Promise.reject(error);
    }

    // Handle 5xx - NO RETRY
    if (error.response?.status >= 500 && error.response?.status < 600) {
      const url = String(error.config?.url || '');
      // Keep demo console clean for known-broken endpoints (we intentionally fall back in UI)
      const isExpected =
        url.includes('/ml/health/dashboard/') ||
        url.includes('/analytics/global/') ||
        url.includes('/analytics/weekly/') ||
        url.includes('/analytics/monthly/');

      if (isExpected) {
        console.warn('[API] Server error (expected):', url, error.response.status);
      } else {
        console.error('[API] Server error:', url, error.response.status);
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ========== DEDUPLICATED API WRAPPER ==========
export const apiClient = {
  get: (url, config) => {
    const key = getRequestKey('GET', url, config?.params, undefined);
    return deduplicatedRequest(
      () => axiosInstance.get(url, config),
      key
    );
  },
  post: (url, data, config) => {
    const key = getRequestKey('POST', url, config?.params, data);
    return deduplicatedRequest(
      () => axiosInstance.post(url, data, config),
      key
    );
  },
  put: (url, data, config) => {
    const key = getRequestKey('PUT', url, config?.params, data);
    return deduplicatedRequest(
      () => axiosInstance.put(url, data, config),
      key
    );
  },
  patch: (url, data, config) => {
    const key = getRequestKey('PATCH', url, config?.params, data);
    return deduplicatedRequest(
      () => axiosInstance.patch(url, data, config),
      key
    );
  },
  delete: (url, config) => {
    const key = getRequestKey('DELETE', url, config?.params, undefined);
    return deduplicatedRequest(
      () => axiosInstance.delete(url, config),
      key
    );
  },
  interceptors: axiosInstance.interceptors,
};

export default apiClient;

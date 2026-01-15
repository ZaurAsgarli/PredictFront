/**
 * Centralized Data Cache Service
 * 
 * Fetches data ONCE, caches in memory, shares across all components
 * Prevents duplicate requests and request storms
 */

import { api } from './api';
import type { AxiosResponse } from 'axios';

// ========== IN-MEMORY CACHE ==========
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ========== REQUEST DEDUPLICATION ==========
// Track active requests to prevent duplicates
const activeRequests = new Map<string, Promise<any>>();

/**
 * Get cache key for a request
 */
function getCacheKey(endpoint: string, params?: any): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  return `${endpoint}_${paramsStr}`;
}

/**
 * Check if cache entry is valid
 */
function isValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  if (!entry) return false;
  const age = Date.now() - entry.timestamp;
  return age < CACHE_TTL;
}

/**
 * Fetch data with caching and deduplication
 */
async function fetchWithCache<T>(
  endpoint: string,
  fetcher: () => Promise<AxiosResponse<T>>,
  params?: any
): Promise<T> {
  const key = getCacheKey(endpoint, params);

  // Check cache first
  const cached = cache.get(key);
  if (isValid(cached)) {
    return cached.data;
  }

  // Check if request already in progress
  if (activeRequests.has(key)) {
    return activeRequests.get(key)!;
  }

  // Create new request
  const requestPromise = fetcher()
    .then((response) => {
      const data = response.data;
      // Cache the result
      cache.set(key, {
        data,
        timestamp: Date.now(),
      });
      // Remove from active requests
      activeRequests.delete(key);
      return data;
    })
    .catch((error) => {
      // Remove from active requests on error
      activeRequests.delete(key);
      throw error;
    });

  // Track active request
  activeRequests.set(key, requestPromise);

  return requestPromise;
}

/**
 * Clear cache for a specific endpoint or all cache
 */
export function clearCache(endpoint?: string) {
  if (endpoint) {
    // Clear specific endpoint
    const keysToDelete: string[] = [];
    cache.forEach((_, key) => {
      if (key.startsWith(endpoint)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => cache.delete(key));
  } else {
    // Clear all cache
    cache.clear();
  }
  // Also clear active requests
  activeRequests.clear();
}

// ========== DATA FETCHERS ==========

/**
 * Markets
 */
export const marketsCache = {
  getAll: (params?: { page?: number; page_size?: number; status?: string }) => {
    return fetchWithCache('/markets/', () => api.get('/markets/', { params }), params);
  },
  getFeatured: () => {
    return fetchWithCache('/markets/featured/', () => api.get('/markets/featured/'));
  },
  getCategories: () => {
    return fetchWithCache('/markets/categories/', () => api.get('/markets/categories/'));
  },
  getById: (id: string | number) => {
    return fetchWithCache(`/markets/${id}/`, () => api.get(`/markets/${id}/`));
  },
  clear: () => clearCache('/markets/'),
};

/**
 * User Profile
 */
export const userCache = {
  getMe: () => {
    return fetchWithCache('/users/me/', () => api.get('/users/me/'));
  },
  clear: () => clearCache('/users/me/'),
};

/**
 * Analytics / Leaderboards
 */
export const analyticsCache = {
  getWeekly: () => {
    return fetchWithCache('/analytics/weekly/', () => api.get('/analytics/weekly/'));
  },
  getMonthly: () => {
    return fetchWithCache('/analytics/monthly/', () => api.get('/analytics/monthly/'));
  },
  clear: () => clearCache('/analytics/'),
};

/**
 * Admin Data (isolated, lazy-loaded)
 */
export const adminCache = {
  getStats: () => {
    return fetchWithCache('/admin/stats/', () => api.get('/admin/stats/'));
  },
  getSecurityLogs: (params?: any) => {
    return fetchWithCache('/admin/security-logs/', () => api.get('/admin/security-logs/', { params }), params);
  },
  getSuspiciousUsers: () => {
    return fetchWithCache('/admin/suspicious/', () => api.get('/admin/suspicious/'));
  },
  getMLHealth: () => {
    return fetchWithCache('/ml/health/dashboard/', () => api.get('/ml/health/dashboard/'));
  },
  clear: () => {
    clearCache('/admin/');
    clearCache('/ml/health/');
  },
};

/**
 * Clear all caches (useful on logout)
 */
export function clearAllCaches() {
  clearCache();
}

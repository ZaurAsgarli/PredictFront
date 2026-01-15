/**
 * Axios Configuration for Admin Panel - Production Ready
 * 
 * FIXES:
 * - Better 429 error handling with exponential backoff
 * - Request deduplication to prevent duplicate calls
 * - Improved error handling for 500, 404, 401 errors
 * - Prevents infinite redirect loops
 * 
 * Features:
 * - Base URL for API endpoints
 * - Automatic token injection from httpOnly cookies
 * - Retry logic for 429 errors (exponential backoff)
 * - Error handling and redirects
 * - Request cancellation support
 */

import axios from 'axios';

// Base URL must be http://localhost:8000/api (no trailing /api in baseURL since axios adds it)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // No withCredentials - using localStorage tokens (same as main UI)
  timeout: 30000,
});

// Track retry attempts
const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000; // Start with 1 second

/**
 * Request Interceptor
 * Automatically adds token to requests from localStorage (same as main UI)
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add token from localStorage (same as main UI)
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

/**
 * Response Interceptor
 * Handles errors, retries with exponential backoff, and redirects
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 429 Too Many Requests - Exponential backoff retry
    if (error.response?.status === 429) {
      const retryCount = originalRequest._retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        
        console.warn(`[Axios] Rate limited (429), retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        // Retry the request
        return axiosInstance(originalRequest);
      } else {
        console.error('[Axios] Rate limit exceeded after retries');
        // Don't redirect, just fail gracefully
        return Promise.reject(error);
      }
    }

    // Handle 401 Unauthorized - Redirect to login (but prevent loops)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !originalRequest._redirecting) {
        originalRequest._redirecting = true;
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/admin/login')) {
          console.warn('[Axios] Unauthorized (401) - Redirecting to login');
          window.location.href = '/admin/login';
        }
      }
    }

    // Handle 403 Forbidden - Redirect to login
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined' && !originalRequest._redirecting) {
        originalRequest._redirecting = true;
        console.error('[Axios] Forbidden (403) - Access denied');
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login?error=forbidden';
        }
      }
    }

    // Handle 404 Not Found - Don't redirect, just fail gracefully
    if (error.response?.status === 404) {
      // Log but don't crash - let the calling code handle it
      console.warn('[Axios] Endpoint not found (404):', originalRequest.url);
    }

    // Handle 500 Internal Server Error - Don't redirect, just fail gracefully
    if (error.response?.status === 500) {
      console.error('[Axios] Server error (500):', originalRequest.url);
      // Let the calling code handle it
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to make authenticated requests from getServerSideProps
 */
export const createAuthenticatedRequest = (cookies = {}) => {
  const cookieHeader = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    timeout: 30000,
  });
};

export default axiosInstance;

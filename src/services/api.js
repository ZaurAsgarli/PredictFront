import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
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

// Handle 401 errors (unauthorized) and transform responses
api.interceptors.response.use(
  (response) => {
    // Debug: Log response for development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.config.url, response.data);
    }
    // Backend may wrap responses in {success: true, data: ...} format
    // or return paginated responses with {results: ..., count: ..., next: ..., previous: ...}
    // or return data directly
    if (response.data && typeof response.data === 'object') {
      // If wrapped in success/data format, extract data
      if (response.data.success && response.data.data !== undefined) {
        response.data = response.data.data;
      }
      // Paginated responses are fine as-is (they have results array)
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Extract error message from backend response
    if (error.response?.data) {
      const errorData = error.response.data;
      // Backend may wrap errors in {success: false, error: ...} or use standard DRF format
      if (errorData.error) {
        error.message = errorData.error;
      } else if (errorData.message) {
        error.message = errorData.message;
      } else if (typeof errorData === 'string') {
        error.message = errorData;
      }
    }
    return Promise.reject(error);
  }
);

export default api;


import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    // Backend returns tokens: { access, refresh }
    const accessToken = response.data.tokens?.access || response.data.token;
    if (accessToken && typeof window !== 'undefined') {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register new user
  signup: async (userData) => {
    // Backend expects password_confirm field
    const signupData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      password_confirm: userData.password_confirm || userData.password, // Use password_confirm if provided, otherwise use password
    };
    const response = await api.post('/auth/signup/', signupData);
    // Backend returns tokens: { access, refresh }
    const accessToken = response.data.tokens?.access || response.data.token;
    if (accessToken && typeof window !== 'undefined') {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
};


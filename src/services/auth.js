import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/users/login/', { email, password });
    // Backend returns: { user: {...}, tokens: { access, refresh } }
    const accessToken = response.data.tokens?.access || response.data.token || response.data.access;
    if (accessToken && typeof window !== 'undefined') {
      localStorage.setItem('token', accessToken);
      // Store user data if available
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  // Register new user
  signup: async (userData) => {
    // Backend expects: username, email, password, password_confirm
    const signupData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      password_confirm: userData.password_confirm || userData.confirmPassword,
    };
    const response = await api.post('/users/signup/', signupData);
    // Backend returns: { user: {...}, tokens: { access, refresh } }
    const accessToken = response.data.tokens?.access || response.data.token || response.data.access;
    if (accessToken && typeof window !== 'undefined') {
      localStorage.setItem('token', accessToken);
      // Store user data if available
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
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

  // Get current user from API
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me/');
      // Handle wrapped response format
      const userData = response.data.success !== undefined ? response.data.data : response.data;
      if (userData && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return userData;
    } catch (error) {
      // If API call fails, return cached user
      if (typeof window === 'undefined') return null;
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
  },

  // Get current user from cache (synchronous)
  getCurrentUserSync: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  // Check if user is admin
  isAdmin: () => {
    if (typeof window === 'undefined') return false;
    const user = authService.getCurrentUserSync();
    return user?.is_staff === true || user?.role === 'admin';
  },
};


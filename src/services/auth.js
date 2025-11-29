import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/users/login/', { email, password });
    // Backend returns: { user: {...}, tokens: { access, refresh } }
    const accessToken = response.data.tokens?.access || response.data.token;
    if (accessToken && typeof window !== 'undefined') {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register new user
  signup: async (userData) => {
    // Backend expects: username, email, password
    // Include password_confirm if provided (for validation on frontend)
    const signupData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    };
    // Only include password_confirm if backend requires it
    if (userData.password_confirm) {
      signupData.password_confirm = userData.password_confirm;
    }
    const response = await api.post('/users/signup/', signupData);
    // Backend returns: { user: {...}, tokens: { access, refresh } }
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

  // Get current user from API
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me/');
      if (response.data && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
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
};


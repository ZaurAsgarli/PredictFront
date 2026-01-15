import { useState, useEffect } from 'react';
import api, { apiEndpoints } from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'TRADER' | 'WHALE' | 'BLOCKED';
  is_staff: boolean;
  total_points: number;
  win_rate: number;
  streak: number;
  wallet_address: string | null;
  created_at: string;
  total_volume: number;
  rank_global: number | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuth({ user: null, loading: false, error: null });
        return;
      }

      const response = await api.get(apiEndpoints.me);
      const userData = response.data;

      // Validate user is not blocked
      if (userData.role === 'BLOCKED' || !userData.is_active) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setAuth({ user: null, loading: false, error: 'Account is blocked' });
        if (typeof window !== 'undefined') {
          window.location.href = '/login?error=blocked';
        }
        return;
      }

      setAuth({ user: userData, loading: false, error: null });
      localStorage.setItem('userId', userData.id.toString());
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setAuth({ user: null, loading: false, error: null });
      } else {
        setAuth({ user: null, loading: false, error: error.message });
      }
    }
  };

  const isAdmin = () => {
    return auth.user?.role === 'ADMIN' || auth.user?.is_staff === true;
  };

  const isWhale = () => {
    return auth.user?.role === 'WHALE';
  };

  const isBlocked = () => {
    return auth.user?.role === 'BLOCKED';
  };

  const hasRole = (role: User['role']) => {
    return auth.user?.role === role;
  };

  return {
    ...auth,
    isAdmin,
    isWhale,
    isBlocked,
    hasRole,
    refreshUser: loadUser,
  };
}

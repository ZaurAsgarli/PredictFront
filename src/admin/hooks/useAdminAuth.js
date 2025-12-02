import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { adminApi } from '../services/adminApi';

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const isAdmin = adminApi.isAdmin();
      if (!isAdmin) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      // Try to get fresh user data
      try {
        const user = await adminApi.getCurrentAdmin();
        if (user && user.is_staff) {
          setAdmin(user);
        } else {
          adminApi.logout();
          setAdmin(null);
        }
      } catch (error) {
        // If API fails, use cached user
        const userStr = localStorage.getItem('admin_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.is_staff) {
            setAdmin(user);
          } else {
            adminApi.logout();
            setAdmin(null);
          }
        }
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await adminApi.adminLogin(email, password);
      setAdmin(data.user || data);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    adminApi.logout();
    setAdmin(null);
    router.push('/admin/login');
  };

  return {
    admin,
    loading,
    isAuthenticated: !!admin && admin.is_staff === true,
    login,
    logout,
    checkAdminAuth,
  };
};



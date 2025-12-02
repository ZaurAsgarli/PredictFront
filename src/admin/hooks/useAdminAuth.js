import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../services/auth';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const currentUser = authService.getCurrentUserSync();
      
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is staff/admin
      if (currentUser.is_staff === true) {
        setIsAdmin(true);
        setUser(currentUser);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading, user, checkAdminStatus };
}


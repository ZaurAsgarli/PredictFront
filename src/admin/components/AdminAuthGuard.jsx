import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { adminApi } from '../services/adminApi';

export default function AdminAuthGuard({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Check if token exists
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Check if user is admin
    const isAdmin = adminApi.isAdmin();
    if (!isAdmin) {
      // Try to get fresh user data
      try {
        const user = await adminApi.getCurrentAdmin();
        if (!user || !user.is_staff) {
          adminApi.logout();
          router.push('/admin/login');
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        adminApi.logout();
        router.push('/admin/login');
        return;
      }
    } else {
      setIsAuthorized(true);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You do not have admin privileges.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}



import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../../src/services/auth';
import AdminLayoutWrapper from '../layouts/AdminLayoutWrapper';

// Wrapper for AdminAuthGuard that uses admin app routes (without /admin prefix)
export default function AdminAuthGuardWrapper({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [router.pathname]);

  const checkAuth = async () => {
    try {
      // Check if token exists
      const token = authService.isAuthenticated();
      if (!token) {
        router.push('/login');
        return;
      }

      // Get user from localStorage
      const user = authService.getCurrentUserSync();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is staff/admin
      if (user.is_staff !== true) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
            <p className="text-red-700 mb-4">
              You do not have administrator privileges to access this page.
            </p>
            <button
              onClick={() => window.location.href = 'http://localhost:3000'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Return to User Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}


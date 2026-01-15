/**
 * Admin Auth Guard Wrapper - Production Ready
 * 
 * Client-side authentication guard using /users/me/ endpoint
 * Redirects to '/admin/login' if not authenticated or not admin
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminAuthGuardWrapper({ children }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    checkAuth();
  }, [router.pathname, mounted]);

  /**
   * Check authentication using /users/me/ endpoint
   * - Verifies token exists and is valid
   * - Checks if user has admin role (role === 'ADMIN')
   * - Redirects to '/admin/login' if not authenticated or not admin
   */
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // No token, redirect to login
      router.push('/admin/login');
      return;
    }

    try {
      // Verify token using /users/me/ endpoint (NOT /api/verify)
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Invalid token, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        router.push('/admin/login');
        return;
      }

      const user = await response.json();

      // Check if user is admin (check role field - role !== 'ADMIN' means not admin)
      if (!user || (user.role !== 'ADMIN' && !user.is_staff && !user.is_superuser)) {
        // Not admin, show access denied
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // User is admin, allow access
      setIsAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error('[AdminAuthGuard] Auth check error:', error);
      // On error, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.push('/admin/login');
    }
  };

  // Don't render until mounted (prevents hydration errors)
  if (!mounted || loading) {
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
              onClick={() => router.push('/admin/login')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

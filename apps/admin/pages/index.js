/**
 * Admin Index Page - Production Ready
 * 
 * Entry point for admin app
 * Redirects authenticated admins to dashboard
 * Redirects unauthenticated users to login
 * Uses /users/me/ endpoint with token from localStorage
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminIndex() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check authentication using /users/me/ endpoint
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

        if (response.ok) {
          const user = await response.json();
          
          // Check if user is admin (check role field)
          if (user && (user.role === 'ADMIN' || user.is_staff || user.is_superuser)) {
            // Authenticated admin - redirect to dashboard
            router.push('/admin');
          } else {
            // Not admin - redirect to login
            router.push('/admin/login');
          }
        } else {
          // Invalid token - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('[AdminIndex] Auth check error:', error);
        // On error, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [mounted, router]);

  // Don't render until mounted (prevents hydration errors)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

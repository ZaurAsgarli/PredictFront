/**
 * Admin Redirect Page - Port 3000
 * 
 * Redirects /admin to either login or dashboard based on auth status
 * Prevents infinite loops with server-side check
 */

import { useEffect } from 'react';
import Head from 'next/head';

export default function AdminRedirect() {
  useEffect(() => {
    // Client-side redirect (fallback)
    // Server-side redirect handles this via getServerSideProps
    const checkAuthAndRedirect = async () => {
      try {
        const response = await fetch('/api/verify', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && (data.user.is_staff || data.user.role === 'ADMIN')) {
            // Authenticated, redirect to dashboard on port 3001
            window.location.replace('http://localhost:3001/admin/dashboard');
            return;
          }
        }
      } catch (err) {
        // Not authenticated
      }

      // Not authenticated, redirect to login on port 3001
      window.location.replace('http://localhost:3001/admin/login');
    };

    checkAuthAndRedirect();
  }, []);

  return (
    <>
      <Head>
        <title>Redirecting to Admin Panel...</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to admin panel...</p>
        </div>
      </div>
    </>
  );
}

/**
 * Server-side redirect based on auth status
 */
export async function getServerSideProps(context) {
  const { req, res } = context;
  const token = req.cookies?.admin_token;

  if (token) {
    try {
      // Verify token with backend
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const verifyResponse = await fetch(`${backendUrl}/admin/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (verifyResponse.ok) {
        const data = await verifyResponse.json();
        const user = data?.user || data;
        
        if (user && (user.is_staff || user.role === 'ADMIN')) {
          // Authenticated, redirect to dashboard on port 3001
          return {
            redirect: {
              destination: 'http://localhost:3001/admin/dashboard',
              permanent: false,
            },
          };
        }
      }
    } catch (error) {
      // Verification failed, redirect to login
    }
  }

  // Not authenticated, redirect to login on port 3001
  return {
    redirect: {
      destination: 'http://localhost:3001/admin/login',
      permanent: false,
    },
  };
}

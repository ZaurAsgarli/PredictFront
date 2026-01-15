/**
 * Admin Login Page - Fixed to Use Same Endpoint as User Login
 * 
 * Uses same auth mechanism as main UI:
 * - Calls /users/login/ endpoint (same as user login)
 * - Stores JWT token in localStorage (not cookies)
 * - Verifies user is admin using /users/me/
 * - NO /api/login route needed
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LogIn, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminLogin() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Hydration guard: only run on client side
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    
    // Check if already logged in (client-side only, since we use localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      verifyAndRedirect(token);
    }
  }, []);

  const verifyAndRedirect = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const user = await response.json();
        if (user.is_staff || user.role === 'ADMIN' || user.is_superuser) {
          // Already authenticated as admin, redirect to dashboard
          window.location.href = '/admin';
          return;
        }
      }
      // Not admin or invalid token, stay on login page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      // Token invalid, stay on login page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call backend login endpoint (SAME as user login: /users/login/)
      // Payload must match main UI: { email, password }
      const response = await fetch(`${API_BASE_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      // Check Content-Type
      const contentType = response.headers.get('content-type');
      const isJSON = contentType && contentType.includes('application/json');

      let data = null;
      if (isJSON) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('[AdminLogin] Failed to parse JSON:', parseError);
          setError('Server error: Invalid response format. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        // Backend returned HTML (error page)
        const textResponse = await response.text();
        console.error('[AdminLogin] Backend returned HTML:', textResponse.substring(0, 200));
        setError('Server error: Please try again in a moment.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError(data?.detail || data?.message || 'Invalid email or password. Please check your credentials.');
        } else if (response.status === 400) {
          setError(data?.detail || data?.message || 'Invalid request. Please check your credentials.');
        } else if (response.status === 500) {
          setError('Server error: Please try again in a moment.');
        } else {
          setError(data?.detail || data?.message || `Login failed (${response.status}). Please try again.`);
        }
        setLoading(false);
        return;
      }

      // Extract token from response (EXACT match with main UI)
      // Main UI uses: response.data.tokens?.access || response.data.token || response.data.access
      const accessToken = data.tokens?.access || data.token || data.access;
      
      if (!accessToken) {
        console.error('[AdminLogin] No token in response:', data);
        setError('Server error: No authentication token received. Please try again.');
        setLoading(false);
        return;
      }

      // Store token in localStorage (same key as main UI: 'token')
      localStorage.setItem('token', accessToken);
      
      // Store user data (same as main UI)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Verify user is admin using /users/me/ (NOT /admin/verify)
      try {
        const userResponse = await fetch(`${API_BASE_URL}/users/me/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Handle wrapped response format (same as main UI)
          const user = userData.success !== undefined ? userData.data : userData;
          
          // Check role field (same logic as main UI)
          if (user.role === 'ADMIN' || user.is_staff || user.is_superuser || user.role === 'admin') {
            // Store updated user data
            localStorage.setItem('user', JSON.stringify(user));
            // User is admin, redirect to dashboard
            window.location.href = '/admin';
            return;
          } else {
            // User is not admin, clear token and show error
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setError('Access denied: You do not have administrator privileges.');
            setLoading(false);
            return;
          }
        }
      } catch (verifyError) {
        console.error('[AdminLogin] Failed to verify user:', verifyError);
        // Still redirect, but log the error
      }

      // Redirect to dashboard
      window.location.href = '/admin';
    } catch (err) {
      console.error('[AdminLogin] Network error:', err);
      setError('Network error: Please check your connection and try again.');
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

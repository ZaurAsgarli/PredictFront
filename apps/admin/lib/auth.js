/**
 * Authentication Utilities
 * 
 * Server-side authentication helpers for getServerSideProps
 * Handles httpOnly cookie extraction and verification
 */

import { adminAuth } from './api';
import { createAuthenticatedRequest } from './axios';

/**
 * Extract token from cookies in getServerSideProps context
 */
export const getTokenFromCookies = (cookies) => {
  // httpOnly cookies are accessible server-side via request headers
  // Cookie format: "token=xxx; other=yyy"
  const cookieString = cookies?.token || cookies?.authorization || '';
  
  // If cookie is object (from Next.js), extract value
  if (typeof cookieString === 'string') {
    return cookieString;
  }
  
  return null;
};

/**
 * Verify admin authentication in getServerSideProps
 * Returns user data if authenticated, null if not
 */
export const verifyAdminAuth = async (context) => {
  const { req } = context;
  
  // Extract cookies from request
  const cookies = req?.cookies || {};
  const token = cookies?.admin_token;
  
  if (!token) {
    return null;
  }

  try {
    // Verify token with backend API using /users/me/ endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${backendUrl}/users/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const user = await response.json();
    
    // Check if user is admin (check role field - role !== 'ADMIN' means not admin)
    if (user && (user.role === 'ADMIN' || user.is_staff || user.is_superuser)) {
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('[Auth] Verification failed:', error.message);
    return null;
  }
};

/**
 * Get server-side props wrapper for protected admin routes
 */
export const withAdminAuth = (getServerSidePropsFn) => {
  return async (context) => {
    // Verify authentication first
    const user = await verifyAdminAuth(context);
    
    if (!user) {
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false,
        },
      };
    }

    // If additional props function provided, call it
    if (getServerSidePropsFn) {
      const additionalProps = await getServerSidePropsFn(context, user);
      return {
        props: {
          user,
          ...additionalProps.props,
        },
      };
    }

    // Return user data
    return {
      props: {
        user,
      },
    };
  };
};

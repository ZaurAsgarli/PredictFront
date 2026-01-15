import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to enforce RBAC for admin routes
 * Redirects non-admins away from admin pages
 */
export function useRequireAdmin() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        console.log('[useRequireAdmin] No token found, redirecting to /admin/login');
        router.push('/admin/login');
      } else if (!user) {
        console.log('[useRequireAdmin] Token exists but no user data, redirecting to /admin/login');
        router.push('/admin/login');
      } else if (!isAdmin()) {
        console.log('[useRequireAdmin] User is not admin, redirecting to home');
        router.push('/?error=unauthorized');
      } else {
        console.log('[useRequireAdmin] Admin access verified:', {
          userId: user.id,
          username: user.username,
          is_staff: user.is_staff,
          role: user.role
        });
      }
    }
  }, [user, loading, isAdmin, router]);

  return { user, loading, isAdmin: isAdmin() };
}

/**
 * Hook to check if user can access whale features
 */
export function useRequireWhale() {
  const { user, loading, isWhale, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !isWhale() && !isAdmin()) {
      router.push('/?error=unauthorized');
    }
  }, [user, loading, isWhale, isAdmin, router]);

  return { user, loading, canAccess: isWhale() || isAdmin() };
}

/**
 * Hook to conditionally render components based on role
 */
export function useRoleCheck() {
  const { user, isAdmin, isWhale, hasRole } = useAuth();

  return {
    user,
    isAdmin: isAdmin(),
    isWhale: isWhale(),
    hasRole,
    canAccessAdmin: isAdmin(),
    canAccessWhale: isWhale() || isAdmin(),
  };
}

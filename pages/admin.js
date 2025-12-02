import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../src/services/auth';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getCurrentUserSync();
    
    // Check if user is authenticated and is admin
    if (!user) {
      router.push('/admin/login');
      return;
    }
    
    if (user.is_staff !== true) {
      router.push('/');
      return;
    }
    
    // Redirect to new admin dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-4">Redirecting to Admin Panel...</h1>
      </div>
    </div>
  );
}


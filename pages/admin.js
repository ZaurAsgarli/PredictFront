import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../src/services/auth';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getCurrentUser();
    
    // Check if user is authenticated and is admin
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    // Redirect to Django admin panel
    window.location.href = 'http://localhost:8000/admin/';
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Admin Panel...</h1>
        <p className="text-gray-600">If you are not redirected, <a href="http://localhost:8000/admin/" className="text-primary-600 hover:underline">click here</a>.</p>
      </div>
    </div>
  );
}


import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../../src/services/auth';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getCurrentUserSync();
    if (user && user.is_staff === true) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}


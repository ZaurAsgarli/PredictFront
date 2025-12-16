import { useEffect } from 'react';

export default function AdminRedirect() {
  useEffect(() => {
    // Redirect directly to admin app - it will handle authentication
    window.location.href = 'http://localhost:3001';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}


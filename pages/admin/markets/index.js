import { useEffect } from 'react';

export default function AdminMarkets() {
  useEffect(() => {
    // Redirect to admin app markets
    window.location.href = 'http://localhost:3001/markets';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to admin markets...</p>
      </div>
    </div>
  );
}


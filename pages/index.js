import { useState, useEffect, memo, lazy, Suspense } from 'react';
import { authService } from '../src/services/auth';
import { adminApi } from '../src/admin/services/adminApi';
import ImageSlider from '../src/components/sections/ImageSlider';

// Lazy load all sections for optimal performance
const Hero = lazy(() => import('../src/components/sections/Hero'));
const About = lazy(() => import('../src/components/sections/About'));
const Features = lazy(() => import('../src/components/sections/Features'));
const ScrollShowcase = lazy(() => import('../src/components/sections/ScrollShowcase'));
const Testimonials = lazy(() => import('../src/components/sections/Testimonials'));
const FooterCTA = lazy(() => import('../src/components/sections/FooterCTA'));

// Loading fallback component
const SectionLoader = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalMarkets: 0,
    activeMarkets: 0,
    totalTrades: 0,
    pendingDisputes: 0,
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    if (typeof window !== 'undefined') {
      const user = authService.getCurrentUserSync();
      if (user && user.is_staff) {
        setIsAdmin(true);
        loadAdminStats();
      }
    }
  };

  const loadAdminStats = async () => {
    try {
      setAdminLoading(true);
      const [markets, activeMarkets, trades, disputes] = await Promise.all([
        adminApi.getMarkets().catch(() => ({ results: [] })),
        adminApi.getMarkets({ status: 'active' }).catch(() => ({ results: [] })),
        adminApi.getTrades().catch(() => ({ results: [] })),
        adminApi.getDisputes().catch(() => ({ results: [] })),
      ]);

      setAdminStats({
        totalMarkets: markets.results?.length || markets.length || 0,
        activeMarkets: activeMarkets.results?.length || activeMarkets.length || 0,
        totalTrades: trades.results?.length || trades.length || 0,
        pendingDisputes: disputes.results?.filter((d) => d.status === 'pending')?.length || 0,
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Image Slider Section - Top of page */}
      <ImageSlider />

      {/* Hero Section - Load immediately */}
      <Suspense fallback={<SectionLoader />}>
        <Hero isAuthenticated={isAuthenticated} />
      </Suspense>

      {/* About Section */}
      <Suspense fallback={<SectionLoader />}>
        <About />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<SectionLoader />}>
        <Features />
      </Suspense>

      {/* Scroll Showcase Section */}
      <Suspense fallback={<SectionLoader />}>
        <ScrollShowcase />
      </Suspense>

      {/* Testimonials Section */}
      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
      </Suspense>

      {/* Footer CTA Section */}
      <Suspense fallback={<SectionLoader />}>
        <FooterCTA />
      </Suspense>
    </div>
  );
}

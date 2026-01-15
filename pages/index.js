// pages/index.js
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { eventsService } from "../src/services/events";
import ImageSlider from "../src/components/sections/ImageSlider";
import SEO from "../src/components/SEO";

// Loading fallback component
const SectionLoader = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lazy load all sections for performance using next/dynamic
const Hero = dynamic(() => import("../src/components/sections/Hero"), {
  loading: () => <SectionLoader />,
});
const About = dynamic(() => import("../src/components/sections/About"), {
  loading: () => <SectionLoader />,
});
const Features = dynamic(() => import("../src/components/sections/Features"), {
  loading: () => <SectionLoader />,
});
const ScrollShowcase = dynamic(() => import("../src/components/sections/ScrollShowcase"), {
  loading: () => <SectionLoader />,
});
const Testimonials = dynamic(() => import("../src/components/sections/Testimonials"), {
  loading: () => <SectionLoader />,
});
const FooterCTA = dynamic(() => import("../src/components/sections/FooterCTA"), {
  loading: () => <SectionLoader />,
});
const FeaturedEvents = dynamic(() => import("../src/components/sections/FeaturedEvents"), {
  loading: () => <SectionLoader />,
});

export default function HomePage() {
  const [activeMarkets, setActiveMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchMarkets = async () => {
      if (cancelled) return;

      try {
        setLoading(true);
        setError("");

        console.log('[HomePage] Fetching markets ONCE on mount');

        // Try to get all events first (more reliable)
        const allEvents = await eventsService.getAllEvents();
        console.log('Fetched events:', allEvents);

        // Filter active events - be more lenient with status matching
        const activeOnly = allEvents.filter((event) => {
          if (!event) return false;
          const s = (event.status || "").toLowerCase();
          // Accept active, open, running, or empty status
          // Also accept if status is undefined/null (treat as active)
          return !s || s === "active" || s === "open" || s === "running" || s === "";
        });

        // If we have active events, use them; otherwise show all events (up to 6)
        if (!cancelled) {
          const marketsToShow = activeOnly.length > 0 ? activeOnly : allEvents;
          setActiveMarkets(marketsToShow.slice(0, 6));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load active markets:", err);
          console.error("Error response:", err.response);
          console.error("Error URL:", err.config?.url);
          const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || "Could not load active markets from backend.";
          setError(errorMsg);
          // Don't set markets to empty array on error - keep previous state if any
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMarkets();
    return () => { cancelled = true; };
  }, []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://predicthub.com';

  // Structured data for homepage
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PredictHub',
    description: 'Community prediction market platform where users can make predictions, compete with friends, and earn rewards.',
    url: siteUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      ratingCount: '1250',
    },
    featureList: [
      'Real-time market predictions',
      'Community-driven insights',
      'Transparent reward system',
      'Advanced analytics dashboard',
    ],
  };

  return (
    <div className="relative min-h-screen bg-gray-950 text-gray-50 overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <SEO
          title="Welcome to PredictHub"
          description="Make predictions, compete with friends, and earn rewards in the ultimate prediction market platform. Join thousands of users making accurate forecasts."
          structuredData={structuredData}
        />
        {/* Image Slider - At the very top */}
        <ImageSlider />

        {/* 3D Hero Section */}
        <Hero isAuthenticated={false} />

        {/* About Section */}
        <About />

        {/* Features Section */}
        <Features />

        {/* Scroll Showcase Section (Trusted by thousands) */}
        <ScrollShowcase />

        {/* Featured Events Section */}
        <FeaturedEvents />

        {/* Testimonials Section */}
        <Testimonials />

        {/* Footer CTA Section */}
        <FooterCTA />
      </div>
    </div>
  );
}
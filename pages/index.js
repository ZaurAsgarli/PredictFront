// pages/index.js
import { useEffect, useState, lazy, Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EventCard from "../src/components/EventCard";
import { eventsService } from "../src/services/events";
import ImageSlider from "../src/components/sections/ImageSlider";
import SEO from "../src/components/SEO";

// Lazy load all sections for performance
const Hero = lazy(() => import("../src/components/sections/Hero"));
const About = lazy(() => import("../src/components/sections/About"));
const Features = lazy(() => import("../src/components/sections/Features"));
const ScrollShowcase = lazy(() => import("../src/components/sections/ScrollShowcase"));
const Testimonials = lazy(() => import("../src/components/sections/Testimonials"));
const FooterCTA = lazy(() => import("../src/components/sections/FooterCTA"));
const FeaturedEvents = lazy(() => import("../src/components/sections/FeaturedEvents"));

// Loading fallback component
const SectionLoader = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function HomePage() {
  const [activeMarkets, setActiveMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);

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
        const marketsToShow = activeOnly.length > 0 ? activeOnly : allEvents;
        setActiveMarkets(marketsToShow.slice(0, 6));
      } catch (err) {
        console.error("Failed to load active markets:", err);
        console.error("Error response:", err.response);
        console.error("Error URL:", err.config?.url);
        const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || "Could not load active markets from backend.";
        setError(errorMsg);
        // Don't set markets to empty array on error - keep previous state if any
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
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
    <div className="min-h-screen bg-gray-950 text-gray-50">
      <SEO
        title="Welcome to PredictHub"
        description="Make predictions, compete with friends, and earn rewards in the ultimate prediction market platform. Join thousands of users making accurate forecasts."
        structuredData={structuredData}
      />
      {/* Image Slider - At the very top */}
      <ImageSlider />

      {/* 3D Hero Section */}
      <Suspense fallback={<SectionLoader />}>
        <Hero isAuthenticated={false} />
      </Suspense>

      {/* About Section */}
      <Suspense fallback={<SectionLoader />}>
        <About />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<SectionLoader />}>
        <Features />
      </Suspense>

      {/* Scroll Showcase Section (Trusted by thousands) */}
      <Suspense fallback={<SectionLoader />}>
        <ScrollShowcase />
      </Suspense>

      {/* Featured Events Section */}
      <Suspense fallback={<SectionLoader />}>
        <FeaturedEvents />
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
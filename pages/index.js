// pages/index.js
import { useEffect, useState, lazy, Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EventCard from "../src/components/EventCard";
import { eventsService } from "../src/services/events";

// Lazy load Hero 3D components
const Hero = lazy(() => import("../src/components/sections/Hero"));

// Loading fallback for Hero
const HeroLoader = () => (
  <div className="w-full h-[60vh] min-h-[600px] flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50">
      {/* 3D Hero Section - PRESERVED */}
      <Suspense fallback={<HeroLoader />}>
        <Hero isAuthenticated={false} />
      </Suspense>

      {/* Backend Snapshot Card - Positioned below hero */}
      <div className="container mx-auto px-4 mt-8 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-4 shadow-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-400">
              Backend snapshot
            </p>
            <div className="space-y-3 text-xs text-slate-200">
              <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                <span className="text-slate-300">Active markets</span>
                <span className="font-mono text-sm text-emerald-400">
                  {loading
                    ? "…"
                    : activeMarkets.length > 0
                    ? activeMarkets.length
                    : "0"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                <span className="text-slate-300">Status</span>
                <span className="text-xs font-medium text-sky-300">
                  {loading
                    ? "Loading…"
                    : error
                    ? "Backend error"
                    : "Connected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE MARKETS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Active Markets</h2>
          <p className="text-gray-400">
            Browse and trade on real-world events and predictions
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-800 rounded-xl bg-slate-900 p-4 animate-pulse">
                <div className="h-32 w-full rounded-lg bg-slate-800 mb-3"></div>
                <div className="h-6 bg-slate-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-800 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="border border-red-500/50 rounded-xl bg-slate-900/50 p-8 text-center">
            <p className="text-red-400 mb-2">Failed to load markets</p>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && activeMarkets.length === 0 && (
          <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-8 text-center">
            <p className="text-slate-400">No active markets available at the moment.</p>
          </div>
        )}

        {!loading && !error && activeMarkets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMarkets.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && activeMarkets.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-md transition hover:bg-sky-400"
            >
              View All Markets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
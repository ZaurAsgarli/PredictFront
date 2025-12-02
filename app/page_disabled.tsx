"use client"

import { lazy, Suspense } from "react";
import useSWR from "swr";
import { apiEndpoints, fetcher } from "@/lib/api";
import MarketCard from "@/components/MarketCard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// Lazy load Hero to preserve 3D components
const Hero = lazy(() => import("../src/components/sections/Hero"));

// Loading fallback for Hero
const HeroLoader = () => (
  <div className="w-full h-[60vh] min-h-[600px] flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function HomePage() {
  const { data: markets, error, isLoading } = useSWR(
    apiEndpoints.markets,
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
    }
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* 3D Hero Section - PRESERVED */}
      <Suspense fallback={<HeroLoader />}>
        <Hero isAuthenticated={false} />
      </Suspense>

      {/* Market Feed Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Active Markets</h2>
          <p className="text-gray-400">
            Trade on real-world events and predictions
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={`skeleton-${i}`} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-800 rounded-t-lg"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-500/50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Failed to Load Markets
              </h3>
              <p className="text-gray-400 mb-4">
                {error.message || "Unable to connect to the backend API."}
              </p>
              <p className="text-sm text-gray-500">
                Make sure your backend is running at{" "}
                {process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}
              </p>
            </CardContent>
          </Card>
        ) : markets && markets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market: any) => (
              <MarketCard
                key={market.id || market.market_id || `market-${markets.indexOf(market)}`}
                market={{
                  id: market.id || market.market_id,
                  question: market.question,
                  title: market.title || market.question,
                  volume: market.volume || market.total_volume || 0,
                  icon: market.icon || market.image,
                  image: market.icon || market.image,
                  yes_price: market.yes_price,
                  no_price: market.no_price,
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">No markets available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


"use client"

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketCardProps {
  market: {
    id: string;
    title?: string;
    question?: string;
    description?: string;
    yes_price?: number;
    no_price?: number;
    total_volume?: number;
    volume?: number;
    image?: string;
    icon?: string;
  };
}

export default function MarketCard({ market }: MarketCardProps) {
  const title = market.title || market.question || "Untitled Market";
  const yesChance = market.yes_price ? (market.yes_price * 100).toFixed(1) : "50.0";
  const noChance = market.no_price ? (market.no_price * 100).toFixed(1) : "50.0";
  const volume = market.volume || market.total_volume || 0;
  const imageUrl = market.image || market.icon;

  return (
    <Link href={`/event/${market.id}`}>
      <Card className="hover:border-gray-700 transition-all cursor-pointer h-full group">
        <CardContent className="p-0">
          {/* Image */}
          {imageUrl ? (
            <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Hide image on error
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
            </div>
          ) : (
            <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <TrendingUp className="h-16 w-16 text-gray-600" />
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 line-clamp-2 group-hover:text-green-400 transition-colors">
              {title}
            </h3>
            
            {/* Prices */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-400">Yes</span>
                </div>
                <span className="text-2xl font-bold text-green-500">{yesChance}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-400">No</span>
                </div>
                <span className="text-2xl font-bold text-red-500">{noChance}%</span>
              </div>
            </div>
            
            {/* Volume */}
            <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Volume</span>
                <span className="text-gray-300 font-medium">${volume.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


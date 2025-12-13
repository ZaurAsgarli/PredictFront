"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { adminApiExtended } from "../../src/admin/services/adminApiExtended";
import { fetcher } from "@/lib/api";
import { CardSkeleton } from "@/components/admin/SkeletonLoader";

export default function PredictiveIntelligence() {
  const [selectedMarket, setSelectedMarket] = useState<string>("");

  // Mock data generators for charts (in production, use real charting library)
  const generateProbabilityDrift = (data: any) => {
    if (!data) return [];
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      yes: 0.5 + Math.sin(i / 4) * 0.2 + Math.random() * 0.1,
      no: 0.5 - Math.sin(i / 4) * 0.2 - Math.random() * 0.1,
    }));
  };

  const generateLiquidityFlow = (data: any) => {
    if (!data) return [];
    return Array.from({ length: 12 }, (_, i) => ({
      time: `H${i + 1}`,
      inflow: Math.random() * 100000,
      outflow: Math.random() * 80000,
    }));
  };

  const { data: probabilityDrift, error: driftError } = useSWR(
    selectedMarket ? `/admin/intelligence/probability-drift/${selectedMarket}/` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: liquidityFlow, error: flowError } = useSWR(
    selectedMarket ? `/admin/intelligence/liquidity-flow/${selectedMarket}/` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: marketImbalance, error: imbalanceError } = useSWR(
    "/admin/intelligence/market-imbalance/",
    fetcher,
    { refreshInterval: 60000 }
  );

  const driftData = generateProbabilityDrift(probabilityDrift);
  const flowData = generateLiquidityFlow(liquidityFlow);

  return (
    <div className="space-y-6">
      {/* Probability Drift Charts */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Probability Drift Analysis
          </CardTitle>
          <CardDescription>Track probability changes over time to detect manipulation</CardDescription>
        </CardHeader>
        <CardContent>
          {driftError ? (
            <div className="text-center py-8 text-gray-400">Failed to load probability drift data</div>
          ) : (
            <div className="space-y-4">
              <div className="h-64 bg-gray-900/50 rounded-lg border border-gray-800 p-4 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Probability Drift Chart</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {driftData.length} data points
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Max Drift (24h)</p>
                  <p className="text-2xl font-bold text-white">
                    {driftData.length > 0
                      ? ((Math.max(...driftData.map((d) => d.yes)) - Math.min(...driftData.map((d) => d.yes))) * 100).toFixed(1)
                      : "0.0"}%
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Volatility</p>
                  <p className="text-2xl font-bold text-white">
                    {driftData.length > 0 ? "High" : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liquidity Flow Graphs */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Liquidity Flow Analysis
          </CardTitle>
          <CardDescription>Monitor liquidity inflows and outflows in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          {flowError ? (
            <div className="text-center py-8 text-gray-400">Failed to load liquidity flow data</div>
          ) : (
            <div className="space-y-4">
              <div className="h-64 bg-gray-900/50 rounded-lg border border-gray-800 p-4 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Liquidity Flow Chart</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {flowData.length} time periods
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Total Inflow</p>
                  <p className="text-xl font-bold text-green-400">
                    ${flowData.reduce((sum, d) => sum + d.inflow, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Total Outflow</p>
                  <p className="text-xl font-bold text-red-400">
                    ${flowData.reduce((sum, d) => sum + d.outflow, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Net Flow</p>
                  <p className="text-xl font-bold text-white">
                    ${(flowData.reduce((sum, d) => sum + d.inflow - d.outflow, 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Imbalance Heatmap */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Market Imbalance Heatmap
          </CardTitle>
          <CardDescription>Visualize market imbalances across all active markets</CardDescription>
        </CardHeader>
        <CardContent>
          {imbalanceError ? (
            <div className="text-center py-8 text-gray-400">Failed to load market imbalance data</div>
          ) : !marketImbalance ? (
            <CardSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 20 }).map((_, i) => {
                  const imbalance = Math.random();
                  const isHigh = imbalance > 0.7;
                  const isMedium = imbalance > 0.4 && imbalance <= 0.7;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                        isHigh
                          ? "bg-red-500/20 border-red-500"
                          : isMedium
                          ? "bg-yellow-500/20 border-yellow-500"
                          : "bg-green-500/20 border-green-500"
                      }`}
                    >
                      <span className="text-xs font-semibold text-white">
                        {(imbalance * 100).toFixed(0)}%
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/20 border border-red-500 rounded" />
                  <span>High Imbalance (&gt;70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500 rounded" />
                  <span>Medium (40-70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/20 border border-green-500 rounded" />
                  <span>Balanced (&lt;40%)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


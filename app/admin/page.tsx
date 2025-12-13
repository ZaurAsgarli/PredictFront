"use client"

import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { 
  TrendingUp, Users, DollarSign, AlertTriangle, Activity, 
  Shield, FileText, Gauge, Zap, Clock, XCircle 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { adminApiExtended } from "../../src/admin/services/adminApiExtended";
import { fetcher, apiEndpoints } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";
import MetricCard from "@/components/admin/MetricCard";
import { TableSkeleton, CardSkeleton } from "@/components/admin/SkeletonLoader";
import MarketManagementTable from "@/components/admin/MarketManagementTable";
import RiskMonitoringPanel from "@/components/admin/RiskMonitoringPanel";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import ResolutionCenter from "@/components/admin/ResolutionCenter";
import AuditLogsPanel from "@/components/admin/AuditLogsPanel";
import PredictiveIntelligence from "@/components/admin/PredictiveIntelligence";

interface MetricsData {
  active_markets?: number;
  total_liquidity?: number;
  daily_volume?: number;
  active_users_24h?: number;
  active_users_7d?: number;
  failed_transactions?: number;
  [key: string]: any;
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState({ status: "unknown", latency: 0 });

  // WebSocket for real-time updates
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/admin/";
  const { isConnected, lastMessage } = useWebSocket({
    url: wsUrl,
    enabled: true,
    onMessage: (data) => {
      if (data.type === "metrics_update") {
        setMetrics(data.payload);
      } else if (data.type === "alert") {
        toast.error(data.message || "New alert received");
      }
    },
  });

  // Fetch metrics
  const { data: metricsData, error: metricsError, mutate: refreshMetrics } = useSWR(
    "/admin/metrics/",
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
    }
  );

  // Fetch API health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const start = Date.now();
        const health = await adminApiExtended.getAPIHealth();
        const latency = Date.now() - start;
        setApiHealth({ status: health.status || "healthy", latency });
      } catch (error) {
        setApiHealth({ status: "unhealthy", latency: 0 });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (metricsData) {
      setMetrics(metricsData);
      setLoading(false);
    }
  }, [metricsData]);

  // Calculate metrics with fallbacks
  const activeMarkets = metrics?.active_markets || 0;
  const totalLiquidity = metrics?.total_liquidity || 0;
  const dailyVolume = metrics?.daily_volume || 0;
  const activeUsers24h = metrics?.active_users_24h || 0;
  const activeUsers7d = metrics?.active_users_7d || 0;
  const failedTransactions = metrics?.failed_transactions || 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Super Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Command Center - Real-time Monitoring & Control</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-500"
                  }`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  WS: {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div
                  className={`w-2 h-2 rounded-full ${
                    apiHealth.status === "healthy"
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-500 animate-pulse"
                  }`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  API: {apiHealth.status} {apiHealth.latency > 0 && `(${apiHealth.latency}ms)`}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Markets"
            value={activeMarkets}
            icon={TrendingUp}
            loading={loading}
            change={{ value: 2.5, type: "positive" }}
          />
          <MetricCard
            title="Total Liquidity"
            value={totalLiquidity}
            icon={DollarSign}
            format="currency"
            loading={loading}
            change={{ value: 5.2, type: "positive" }}
          />
          <MetricCard
            title="Daily Volume"
            value={dailyVolume}
            icon={Activity}
            format="currency"
            loading={loading}
            change={{ value: -1.3, type: "negative" }}
          />
          <MetricCard
            title="Active Users (24h)"
            value={activeUsers24h}
            icon={Users}
            loading={loading}
            change={{ value: 8.7, type: "positive" }}
          />
          <MetricCard
            title="Active Users (7d)"
            value={activeUsers7d}
            icon={Users}
            loading={loading}
          />
          <MetricCard
            title="Failed Transactions"
            value={failedTransactions}
            icon={XCircle}
            loading={loading}
            change={{ value: -12.5, type: "positive" }}
          />
          <MetricCard
            title="API Health"
            value={apiHealth.status === "healthy" ? "100%" : "0%"}
            icon={Zap}
            format="percentage"
            loading={false}
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="markets" className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="markets" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Markets
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk & Fraud
            </TabsTrigger>
            <TabsTrigger value="resolutions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resolutions
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markets">
            <MarketManagementTable />
          </TabsContent>

          <TabsContent value="users">
            <UserManagementPanel />
          </TabsContent>

          <TabsContent value="risk">
            <RiskMonitoringPanel />
          </TabsContent>

          <TabsContent value="resolutions">
            <ResolutionCenter />
          </TabsContent>

          <TabsContent value="intelligence">
            <PredictiveIntelligence />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

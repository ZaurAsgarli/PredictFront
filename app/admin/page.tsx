"use client"

import { useEffect, useState } from "react";
import useSWR from "swr";
import { api, apiEndpoints, fetcher } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Ban, Activity, TrendingUp, Users, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [attackFlash, setAttackFlash] = useState(false);

  // Fetch security logs with 3s polling (as per requirements)
  const { data: securityLogs, error: securityError } = useSWR(
    apiEndpoints.securityLogs,
    fetcher,
    {
      refreshInterval: 3000, // Refresh every 3 seconds
      revalidateOnFocus: true,
    }
  );

  // Fetch liquidity health
  const { data: liquidityHealth, error: liquidityError } = useSWR(
    apiEndpoints.liquidityHealth,
    fetcher,
    {
      refreshInterval: 0, // Disable auto-refresh to prevent errors from clearing data
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404 or network errors
        if (error.response?.status === 404) return;
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  // Fetch risk scores
  const { data: riskScores, error: riskError } = useSWR(
    apiEndpoints.riskScores,
    fetcher,
    {
      refreshInterval: 0, // Disable auto-refresh to prevent errors from clearing data
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404 or network errors
        if (error.response?.status === 404) return;
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  // Flash effect when new attack is detected
  useEffect(() => {
    if (securityLogs && securityLogs.length > 0) {
      const latestLog = securityLogs[0];
      if (latestLog && latestLog.timestamp) {
        const logTime = new Date(latestLog.timestamp).getTime();
        const now = Date.now();
        // Flash if attack happened in last 10 seconds
        if (now - logTime < 10000) {
          setAttackFlash(true);
          setTimeout(() => setAttackFlash(false), 1000);
        }
      }
    }
  }, [securityLogs]);

  // Calculate metrics
  const totalAttacks = securityLogs?.length || 0;
  const recentAttacks = securityLogs?.filter((log: any) => {
    if (!log.timestamp) return false;
    const logTime = new Date(log.timestamp).getTime();
    return Date.now() - logTime < 3600000; // Last hour
  }).length || 0;
  const threatLevel = recentAttacks > 10 ? "High" : recentAttacks > 5 ? "Medium" : "Low";
  const bannedIPs = new Set(securityLogs?.map((log: any) => log.ip_address).filter(Boolean) || []).size;

  const liquidityScore = liquidityHealth?.score || liquidityHealth?.liquidity_score || 0;
  const predictedLiquidity = liquidityHealth?.predicted_liquidity || liquidityHealth?.predicted_liquidity_amount || 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Super Admin Dashboard</h1>
          <p className="text-gray-400">
            Command Center - Real-time Security & Intelligence Monitoring
          </p>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Ops
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Predictive Intelligence
            </TabsTrigger>
          </TabsList>

          {/* Tab A: Security Ops */}
          <TabsContent value="security" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Attacks Blocked</CardTitle>
                  <Shield className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalAttacks}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {recentAttacks} in the last hour
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Threat Level</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge
                      variant={
                        threatLevel === "High"
                          ? "destructive"
                          : threatLevel === "Medium"
                          ? "warning"
                          : "success"
                      }
                      className="text-lg px-4 py-1"
                    >
                      {threatLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Based on recent activity
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Banned IPs</CardTitle>
                  <Ban className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{bannedIPs}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    Unique IP addresses blocked
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Live Attack Feed */}
            <Card
              className={attackFlash ? "border-red-500/50 animate-pulse bg-red-950/10" : ""}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5" />
                  Live Attack Feed
                </CardTitle>
                <CardDescription>
                  Real-time security events (auto-refreshes every 3 seconds)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {securityError ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Failed to load security logs</p>
                    <p className="text-sm">{securityError.message}</p>
                  </div>
                ) : securityLogs && securityLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Severity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {securityLogs.slice(0, 50).map((log: any, index: number) => {
                          // Map backend fields: event_type, severity
                          const eventType = log.event_type || log.event || log.attack_type || log.type || "Unknown";
                          const severity = log.severity || "LOW";
                          const ipAddress = log.ip_address || log.ip || "N/A";
                          const timestamp = log.timestamp || log.created_at || log.time;
                          
                          // Conditional styling: HIGH severity or RateLimit = Red/Pink, LOW = Gray/Blue
                          const isHighSeverity = severity === "HIGH" || severity === "High" || eventType === "RateLimit" || eventType === "DDoS" || eventType === "Login Fail";
                          const isLowSeverity = severity === "LOW" || severity === "Low";
                          
                          return (
                            <TableRow
                              key={log.id || log.log_id || `log-${index}`}
                              className={
                                isHighSeverity
                                  ? "bg-red-950/30 border-red-500/50 hover:bg-red-950/40"
                                  : isLowSeverity
                                  ? "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/40"
                                  : "bg-gray-900/30 hover:bg-gray-900/40"
                              }
                            >
                              <TableCell className="font-mono text-xs text-gray-300">
                                {timestamp
                                  ? new Date(timestamp).toLocaleString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="font-mono text-sm text-gray-300">
                                {ipAddress}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    eventType === "RateLimit" || eventType === "DDoS" || eventType === "Login Fail"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {eventType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {isHighSeverity ? (
                                  <Badge variant="destructive">HIGH</Badge>
                                ) : isLowSeverity ? (
                                  <Badge variant="outline" className="bg-gray-800 text-gray-300">
                                    LOW
                                  </Badge>
                                ) : (
                                  <Badge variant="warning">MEDIUM</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Shield className="h-8 w-8 mx-auto mb-2" />
                    <p>No security events detected</p>
                    <p className="text-sm">All systems secure</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab B: Predictive Intelligence */}
          <TabsContent value="intelligence" className="space-y-6">
            {/* Liquidity Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  Liquidity Forecast
                </CardTitle>
                <CardDescription>
                  ML-predicted liquidity health score for the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {liquidityError && !liquidityHealth ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Failed to load liquidity data</p>
                  </div>
                ) : liquidityHealth ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300">Liquidity Health Score</span>
                        <span className="text-2xl font-bold text-white">
                          {(liquidityScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={liquidityScore * 100} className="h-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                        <div className="text-sm text-gray-400 mb-1">
                          Predicted Liquidity
                        </div>
                        <div className="text-2xl font-bold text-white">
                          ${predictedLiquidity.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                        <div className="text-sm text-gray-400 mb-1">
                          Health Status
                        </div>
                        <div className="text-2xl font-bold">
                          <Badge
                            variant={
                              liquidityScore > 0.7
                                ? "success"
                                : liquidityScore > 0.4
                                ? "warning"
                                : "destructive"
                            }
                            className="text-base px-4 py-2"
                          >
                            {liquidityScore > 0.7
                              ? "Healthy"
                              : liquidityScore > 0.4
                              ? "Moderate"
                              : "Low"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Loading liquidity data...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Risk Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5" />
                  User Risk Heatmap
                </CardTitle>
                <CardDescription>
                  Users sorted by ML-calculated risk score (descending)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {riskError && !riskScores ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Failed to load risk scores</p>
                  </div>
                ) : riskScores && riskScores.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {riskScores
                          .sort((a: any, b: any) => (b.risk_score || 0) - (a.risk_score || 0))
                          .map((user: any, index: number) => {
                            const riskScore = user.risk_score || 0;
                            const isBadActor = riskScore > 0.8;
                            return (
                              <TableRow key={user.user_id || `risk-user-${index}`}>
                                <TableCell className="font-mono text-sm">
                                  {user.user_id?.substring(0, 12)}...
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">
                                      {(riskScore * 100).toFixed(1)}%
                                    </span>
                                    {isBadActor && (
                                      <AlertTriangle className="h-4 w-4 text-red-500" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {isBadActor ? (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      Bad Actor
                                    </Badge>
                                  ) : riskScore > 0.5 ? (
                                    <Badge variant="warning">Medium Risk</Badge>
                                  ) : (
                                    <Badge variant="success">Low Risk</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-400">
                                  {user.last_activity
                                    ? new Date(user.last_activity).toLocaleString()
                                    : "N/A"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>No risk data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { AlertTriangle, TrendingUp, Users, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { adminApiExtended } from "../../src/admin/services/adminApiExtended";
import { fetcher } from "@/lib/api";
import { TableSkeleton } from "@/components/admin/SkeletonLoader";

export default function RiskMonitoringPanel() {
  const { data: suspiciousUsers, error: susError } = useSWR(
    "/admin/risk/suspicious-users/",
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: largeStakes, error: stakeError } = useSWR(
    "/admin/risk/large-stakes/",
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: washTrading, error: washError } = useSWR(
    "/admin/risk/wash-trading/",
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: riskScores, error: riskError } = useSWR(
    "/ml/risk-scores",
    fetcher,
    { refreshInterval: 15000 }
  );

  const topRiskUsers = riskScores
    ?.sort((a: any, b: any) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Risk Score Visualization */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Score Heatmap
          </CardTitle>
          <CardDescription>Top 10 users by ML-calculated risk score</CardDescription>
        </CardHeader>
        <CardContent>
          {riskError ? (
            <div className="text-center py-8 text-gray-400">Failed to load risk scores</div>
          ) : !topRiskUsers.length ? (
            <TableSkeleton />
          ) : (
            <div className="space-y-3">
              {topRiskUsers.map((user: any, index: number) => {
                const riskScore = (user.risk_score || 0) * 100;
                const isHighRisk = riskScore > 80;
                const isMediumRisk = riskScore > 50 && riskScore <= 80;
                
                return (
                  <motion.div
                    key={user.user_id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {user.user_id?.substring(0, 16)}...
                          </p>
                          <p className="text-xs text-gray-400">
                            Last activity: {user.last_activity 
                              ? new Date(user.last_activity).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={isHighRisk ? "destructive" : isMediumRisk ? "secondary" : "outline"}
                        className={
                          isHighRisk
                            ? "bg-red-500/20 text-red-400"
                            : isMediumRisk
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }
                      >
                        {riskScore.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={riskScore} 
                      className={`h-2 ${
                        isHighRisk ? "bg-red-500/20" : isMediumRisk ? "bg-yellow-500/20" : "bg-green-500/20"
                      }`}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspicious Users */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Suspicious Users
          </CardTitle>
          <CardDescription>Users flagged by fraud detection algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          {susError ? (
            <div className="text-center py-8 text-gray-400">Failed to load suspicious users</div>
          ) : !suspiciousUsers?.length ? (
            <div className="text-center py-8 text-gray-400">No suspicious users detected</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">User ID</TableHead>
                    <TableHead className="text-gray-400">Reason</TableHead>
                    <TableHead className="text-gray-400">Risk Score</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspiciousUsers.slice(0, 20).map((user: any, index: number) => (
                    <motion.tr
                      key={user.user_id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-gray-800 hover:bg-gray-900/50"
                    >
                      <TableCell className="font-mono text-sm text-white">
                        {user.user_id?.substring(0, 16)}...
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.reason || user.flag_reason || "Multiple risk factors"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-red-500/20 text-red-400">
                          {((user.risk_score || 0.8) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                          Flagged
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Large Stake Alerts */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Large Stake Alerts
          </CardTitle>
          <CardDescription>Recent large transactions requiring review</CardDescription>
        </CardHeader>
        <CardContent>
          {stakeError ? (
            <div className="text-center py-8 text-gray-400">Failed to load large stakes</div>
          ) : !largeStakes?.length ? (
            <div className="text-center py-8 text-gray-400">No large stake alerts</div>
          ) : (
            <div className="space-y-3">
              {largeStakes.slice(0, 10).map((stake: any, index: number) => (
                <motion.div
                  key={stake.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        ${(stake.amount || stake.stake_amount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Market: {stake.market_title || stake.market_id}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        User: {stake.user_id?.substring(0, 12)}...
                      </p>
                    </div>
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      Review
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wash Trading Detection */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            Wash Trading Detection
          </CardTitle>
          <CardDescription>Potential wash trading patterns detected</CardDescription>
        </CardHeader>
        <CardContent>
          {washError ? (
            <div className="text-center py-8 text-gray-400">Failed to load wash trading data</div>
          ) : !washTrading?.length ? (
            <div className="text-center py-8 text-gray-400">No wash trading detected</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">User IDs</TableHead>
                    <TableHead className="text-gray-400">Market</TableHead>
                    <TableHead className="text-gray-400">Volume</TableHead>
                    <TableHead className="text-gray-400">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {washTrading.slice(0, 15).map((detection: any, index: number) => (
                    <motion.tr
                      key={detection.id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-gray-800 hover:bg-gray-900/50"
                    >
                      <TableCell className="text-gray-300">
                        <div className="space-y-1">
                          {detection.user_ids?.slice(0, 2).map((uid: string, i: number) => (
                            <p key={i} className="font-mono text-xs">
                              {uid.substring(0, 12)}...
                            </p>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {detection.market_title || detection.market_id}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        ${(detection.volume || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-purple-500/20 text-purple-400">
                          {((detection.confidence || 0.7) * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


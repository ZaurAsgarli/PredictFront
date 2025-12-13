"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { 
  Pause, Play, X, CheckCircle, Flag, MoreVertical,
  TrendingUp, TrendingDown, Clock, DollarSign 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminApiExtended } from "../../src/admin/services/adminApiExtended";
import { fetcher } from "@/lib/api";
import { TableSkeleton } from "@/components/admin/SkeletonLoader";
import { toast } from "sonner";

// Note: In production, replace toast with proper notification system

export default function MarketManagementTable() {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; marketId: string } | null>(null);

  const { data: markets, error, mutate } = useSWR(
    "/markets/?limit=100",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  const handleAction = async (action: string, marketId: string, data?: any) => {
    setActionLoading({ ...actionLoading, [marketId]: true });
    
    try {
      switch (action) {
        case "pause":
          await adminApiExtended.pauseMarket(marketId);
          toast.success("Market paused successfully");
          break;
        case "resume":
          await adminApiExtended.resumeMarket(marketId);
          toast.success("Market resumed successfully");
          break;
        case "forceClose":
          setPendingAction({ type: "forceClose", marketId });
          setShowConfirmModal(true);
          return;
        case "manualResolve":
          setPendingAction({ type: "manualResolve", marketId });
          setShowConfirmModal(true);
          return;
        case "flag":
          await adminApiExtended.flagMarket(marketId, data?.reason || "Suspicious activity");
          toast.success("Market flagged for review");
          break;
      }
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading({ ...actionLoading, [marketId]: false });
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    
    setActionLoading({ ...actionLoading, [pendingAction.marketId]: true });
    try {
      if (pendingAction.type === "forceClose") {
        await adminApiExtended.forceCloseMarket(
          pendingAction.marketId,
          "Admin force close"
        );
        toast.success("Market force closed");
      } else if (pendingAction.type === "manualResolve") {
        await adminApiExtended.manualResolveMarket(
          pendingAction.marketId,
          "YES", // Default, should be from form
          "Manual resolution by admin"
        );
        toast.success("Market manually resolved");
      }
      mutate();
      setShowConfirmModal(false);
      setPendingAction(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading({ ...actionLoading, [pendingAction.marketId]: false });
    }
  };

  const marketsList = markets?.results || markets || [];

  return (
    <>
      <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Market Management</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Manage all prediction markets - pause, resume, resolve, or flag</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Failed to load markets
            </div>
          ) : !marketsList.length ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-800">
                    <TableHead className="text-gray-600 dark:text-gray-400">Market</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Liquidity</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Volume</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Probability</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {marketsList.map((market: any, index: number) => (
                      <motion.tr
                        key={market.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/50"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          <div>
                            <p className="font-semibold">{market.title || market.question}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ID: {market.id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              market.status === "active"
                                ? "default"
                                : market.status === "paused"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              market.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : market.status === "paused"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                            }
                          >
                            {market.status?.toUpperCase() || "UNKNOWN"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          ${(market.total_liquidity || market.liquidity || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          ${(market.volume_24h || market.volume || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white font-semibold">
                              {((market.yes_price || 0.5) * 100).toFixed(1)}%
                            </span>
                            {(market.yes_price || 0.5) > 0.5 ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {market.status === "active" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction("pause", market.id)}
                                disabled={actionLoading[market.id]}
                                className="h-8 border-gray-700 hover:bg-gray-800"
                              >
                                <Pause className="h-3 w-3 mr-1" />
                                Pause
                              </Button>
                            ) : market.status === "paused" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction("resume", market.id)}
                                disabled={actionLoading[market.id]}
                                className="h-8 border-gray-700 hover:bg-gray-800"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Resume
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction("forceClose", market.id)}
                              disabled={actionLoading[market.id]}
                              className="h-8 border-gray-700 hover:bg-red-900/20 hover:border-red-500"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Force Close
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction("manualResolve", market.id)}
                              disabled={actionLoading[market.id]}
                              className="h-8 border-gray-700 hover:bg-blue-900/20 hover:border-blue-500"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction("flag", market.id)}
                              disabled={actionLoading[market.id]}
                              className="h-8 border-gray-700 hover:bg-yellow-900/20 hover:border-yellow-500"
                            >
                              <Flag className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Action</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {pendingAction?.type === "forceClose" ? "force close" : "manually resolve"} this market?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingAction(null);
                }}
                className="border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}


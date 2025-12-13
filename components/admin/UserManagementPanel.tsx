"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Ban, Shield, DollarSign, TrendingUp, TrendingDown, MoreVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminApiExtended } from "../../src/admin/services/adminApiExtended";
import { fetcher } from "@/lib/api";
import { TableSkeleton } from "@/components/admin/SkeletonLoader";
import { toast } from "sonner";

export default function UserManagementPanel() {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banType, setBanType] = useState<"soft" | "hard" | "freeze">("soft");

  const { data: users, error, mutate } = useSWR(
    "/admin/users/?limit=100",
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  const handleBan = async (userId: string, type: "soft" | "hard", reason: string, duration?: number) => {
    setActionLoading({ ...actionLoading, [userId]: true });
    try {
      if (type === "soft") {
        await adminApiExtended.softBanUser(userId, reason, duration || 7);
        toast.success("User soft banned");
      } else {
        await adminApiExtended.hardBanUser(userId, reason);
        toast.success("User hard banned");
      }
      mutate();
      setShowBanModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const handleFreezeWithdrawals = async (userId: string, reason: string) => {
    setActionLoading({ ...actionLoading, [userId]: true });
    try {
      await adminApiExtended.freezeWithdrawals(userId, reason);
      toast.success("User withdrawals frozen");
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const usersList = users?.results || users || [];

  return (
    <>
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">User Management</CardTitle>
          <CardDescription>Manage users, view stats, and apply restrictions</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-gray-400">Failed to load users</div>
          ) : !usersList.length ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">User</TableHead>
                    <TableHead className="text-gray-400">Total Stake</TableHead>
                    <TableHead className="text-gray-400">PnL</TableHead>
                    <TableHead className="text-gray-400">Win Rate</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((user: any, index: number) => {
                    const totalStake = user.total_stake || user.total_staked || 0;
                    const pnl = user.pnl || user.profit_loss || 0;
                    const winRate = user.win_rate || 0;
                    const isBanned = user.is_banned || user.status === "banned";
                    const isFrozen = user.withdrawals_frozen || false;

                    return (
                      <motion.tr
                        key={user.id || user.user_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-gray-800 hover:bg-gray-900/50"
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold text-white">{user.username || user.email || "User"}</p>
                            <p className="text-xs text-gray-400 font-mono">
                              {user.id || user.user_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          ${totalStake.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {pnl >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                            <span className={pnl >= 0 ? "text-green-400" : "text-red-400"}>
                              ${Math.abs(pnl).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={winRate > 0.6 ? "default" : winRate > 0.4 ? "secondary" : "outline"}
                            className={
                              winRate > 0.6
                                ? "bg-green-500/20 text-green-400"
                                : winRate > 0.4
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {(winRate * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {isBanned && (
                              <Badge variant="destructive" className="bg-red-500/20 text-red-400 text-xs">
                                Banned
                              </Badge>
                            )}
                            {isFrozen && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-400 text-xs">
                                Frozen
                              </Badge>
                            )}
                            {!isBanned && !isFrozen && (
                              <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setBanType("soft");
                                setShowBanModal(true);
                              }}
                              disabled={actionLoading[user.id || user.user_id]}
                              className="h-8 border-gray-700 hover:bg-yellow-900/20 hover:border-yellow-500"
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              Soft Ban
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setBanType("hard");
                                setShowBanModal(true);
                              }}
                              disabled={actionLoading[user.id || user.user_id]}
                              className="h-8 border-gray-700 hover:bg-red-900/20 hover:border-red-500"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Hard Ban
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFreezeWithdrawals(user.id || user.user_id, "Admin freeze")}
                              disabled={actionLoading[user.id || user.user_id] || isFrozen}
                              className="h-8 border-gray-700 hover:bg-blue-900/20 hover:border-blue-500"
                            >
                              <DollarSign className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {banType === "soft" ? "Soft Ban" : "Hard Ban"} User
            </h3>
            <p className="text-gray-400 mb-4">
              User: {selectedUser.username || selectedUser.email || selectedUser.id}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  id="banReason"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Enter ban reason"
                />
              </div>
              {banType === "soft" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    id="banDuration"
                    defaultValue={7}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
                }}
                className="border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const reason = (document.getElementById("banReason") as HTMLInputElement)?.value || "No reason provided";
                  const duration = banType === "soft" 
                    ? parseInt((document.getElementById("banDuration") as HTMLInputElement)?.value || "7")
                    : undefined;
                  handleBan(selectedUser.id || selectedUser.user_id, banType, reason, duration);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirm {banType === "soft" ? "Soft Ban" : "Hard Ban"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}


"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { 
  Search, Filter, CheckCircle, XCircle, AlertTriangle, 
  DollarSign, Clock, User, FileText, ExternalLink 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed adminApi import - using direct API calls
import { fetcher } from "@/lib/api";
import { TableSkeleton } from "@/components/admin/SkeletonLoader";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DisputesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const { data: disputesData, error, mutate } = useSWR(
    "/disputes/",
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  const handleResolve = async (disputeId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this dispute?`)) return;

    setActionLoading({ ...actionLoading, [disputeId]: true });
    try {
      // Use correct backend endpoint: /api/disputes/{id}/accept/ or /api/disputes/{id}/reject/
      const api = (await import("@/lib/api")).default;
      const endpoint = action === "approve" ? "accept" : "reject";
      await api.post(`/disputes/${disputeId}/${endpoint}/`);
      toast.success(`Dispute ${action}d successfully`);
      mutate();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message || 
                      `Error ${action}ing dispute`;
      toast.error(errorMsg);
      console.error(`Failed to ${action} dispute:`, error);
    } finally {
      setActionLoading({ ...actionLoading, [disputeId]: false });
    }
  };

  const disputesList = disputesData?.results || disputesData || [];
  
  const filteredDisputes = disputesList
    .filter((dispute: any) => {
      if (statusFilter !== "all" && dispute.status !== statusFilter) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        dispute.market?.title?.toLowerCase().includes(searchLower) ||
        dispute.user?.username?.toLowerCase().includes(searchLower) ||
        dispute.reason?.toLowerCase().includes(searchLower)
      );
    });

  const pendingCount = disputesList.filter((d: any) => d.status === "pending").length;
  const approvedCount = disputesList.filter((d: any) => d.status === "approved").length;
  const rejectedCount = disputesList.filter((d: any) => d.status === "rejected").length;
  const totalBondAmount = disputesList.reduce((sum: number, d: any) => 
    sum + (parseFloat(d.bond_amount) || 0), 0
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "outline" | "default" | "destructive" | "success" | "warning"> = {
      pending: "warning",
      approved: "success",
      rejected: "destructive",
    };
    
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
      <Badge 
        variant={variants[status] || "outline"}
        className={colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Disputes Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Review and resolve market disputes</p>
            </div>
            {pendingCount > 0 && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-500/20 border border-yellow-300 dark:border-yellow-500/30 rounded-lg"
              >
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  {pendingCount} pending dispute{pendingCount !== 1 ? "s" : ""}
                </span>
              </motion.div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Disputes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{disputesList.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Bond Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalBondAmount.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resolved</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedCount + rejectedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search by market, user, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                      <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                        All Status
                      </SelectItem>
                      <SelectItem value="pending" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                        Pending
                      </SelectItem>
                      <SelectItem value="approved" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                        Approved
                      </SelectItem>
                      <SelectItem value="rejected" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                        Rejected
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disputes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Disputes List</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {filteredDisputes.length} dispute{filteredDisputes.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!disputesData && !error ? (
                <TableSkeleton />
              ) : filteredDisputes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No disputes found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50">
                        <TableHead className="text-gray-600 dark:text-gray-400">Market</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">User</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">Bond Amount</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">Reason</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400">Created</TableHead>
                        <TableHead className="text-gray-600 dark:text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDisputes.map((dispute: any, index: number) => (
                        <TableRow
                          key={dispute.id || index}
                          className="border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <TableCell className="text-gray-900 dark:text-white">
                            <div className="max-w-xs">
                              <p className="truncate font-medium">
                                {dispute.market?.title || dispute.market_id || "N/A"}
                              </p>
                              {dispute.market?.id && (
                                <a
                                  href={`/events/${dispute.market.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 mt-1"
                                >
                                  View Market <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span>{dispute.user?.username || dispute.user_id || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-white font-medium">
                            ${parseFloat(dispute.bond_amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            <div className="max-w-md">
                              <p className="truncate" title={dispute.reason || "N/A"}>
                                {dispute.reason || "N/A"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(dispute.status)}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                            {dispute.created_at
                              ? format(new Date(dispute.created_at), "MMM d, yyyy")
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            {dispute.status === "pending" ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleResolve(dispute.id, "approve")}
                                  disabled={actionLoading[dispute.id]}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleResolve(dispute.id, "reject")}
                                  disabled={actionLoading[dispute.id]}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">Resolved</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


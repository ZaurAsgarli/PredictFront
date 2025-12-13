"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Shield, User, Clock, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminApiExtended } from "../../src/admin/services/adminApiExtended";
import { fetcher } from "@/lib/api";
import { TableSkeleton } from "@/components/admin/SkeletonLoader";

export default function AuditLogsPanel() {
  const [filters, setFilters] = useState({
    action_type: "",
    user_id: "",
    date_from: "",
    date_to: "",
  });

  const { data: auditLogs, error, mutate } = useSWR(
    `/admin/audit-logs/?${new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v)
    ).toString()}`,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  const logsList = auditLogs?.results || auditLogs || [];

  const getActionIcon = (actionType: string) => {
    switch (actionType?.toLowerCase()) {
      case "ban":
      case "soft_ban":
      case "hard_ban":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "market_pause":
      case "market_resume":
        return <FileText className="h-4 w-4 text-yellow-400" />;
      case "market_resolve":
      case "market_force_close":
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionBadge = (actionType: string) => {
    const type = actionType?.toLowerCase() || "";
    if (type.includes("ban")) {
      return <Badge variant="destructive" className="bg-red-500/20 text-red-400">BAN</Badge>;
    }
    if (type.includes("market")) {
      return <Badge variant="outline" className="border-blue-500 text-blue-400">MARKET</Badge>;
    }
    if (type.includes("user")) {
      return <Badge variant="outline" className="border-purple-500 text-purple-400">USER</Badge>;
    }
    return <Badge variant="outline" className="border-gray-500 text-gray-400">OTHER</Badge>;
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Immutable Audit Logs
        </CardTitle>
        <CardDescription>Complete history of all admin actions - cannot be modified or deleted</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Action Type</label>
            <select
              value={filters.action_type}
              onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="">All Actions</option>
              <option value="ban">Bans</option>
              <option value="market">Market Actions</option>
              <option value="user">User Actions</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">User ID</label>
            <input
              type="text"
              value={filters.user_id}
              onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              placeholder="Filter by user..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
        </div>

        {error ? (
          <div className="text-center py-8 text-gray-400">Failed to load audit logs</div>
        ) : !logsList.length ? (
          <div className="text-center py-8 text-gray-400">No audit logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Timestamp</TableHead>
                  <TableHead className="text-gray-400">Admin</TableHead>
                  <TableHead className="text-gray-400">Action</TableHead>
                  <TableHead className="text-gray-400">Target</TableHead>
                  <TableHead className="text-gray-400">Details</TableHead>
                  <TableHead className="text-gray-400">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsList.map((log: any, index: number) => (
                  <motion.tr
                    key={log.id || log.log_id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-gray-800 hover:bg-gray-900/50"
                  >
                    <TableCell className="font-mono text-xs text-gray-400">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300 text-sm">
                          {log.admin_username || log.admin_id || "System"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action_type || log.action)}
                        {getActionBadge(log.action_type || log.action)}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">
                      {log.target_id || log.target || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm max-w-xs truncate">
                      {log.details || log.description || log.reason || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {log.ip_address || log.ip || "N/A"}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


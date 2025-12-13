"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { CheckCircle, XCircle, FileText, ExternalLink, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminApiExtended } from "../../src/admin/services/adminApiExtended";
import { fetcher } from "@/lib/api";
import { TableSkeleton } from "@/components/admin/SkeletonLoader";
import { toast } from "sonner";

export default function ResolutionCenter() {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<any>(null);

  const { data: pendingResolutions, error, mutate } = useSWR(
    "/admin/resolutions/pending/",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  const handleManualOverride = async (resolutionId: string, outcome: string, evidence: string) => {
    setActionLoading({ ...actionLoading, [resolutionId]: true });
    try {
      await adminApiExtended.manualOverrideResolution(
        resolutionId,
        outcome,
        evidence,
        "CONFIRMED"
      );
      toast.success("Resolution manually overridden");
      mutate();
      setShowOverrideModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading({ ...actionLoading, [resolutionId]: false });
    }
  };

  const resolutionsList = pendingResolutions || [];

  return (
    <>
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Resolution Center</CardTitle>
          <CardDescription>Review and manually resolve pending market resolutions</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-gray-400">Failed to load pending resolutions</div>
          ) : !resolutionsList.length ? (
            <div className="text-center py-8 text-gray-400">No pending resolutions</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Market</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Evidence</TableHead>
                    <TableHead className="text-gray-400">Submitted</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolutionsList.map((resolution: any, index: number) => (
                    <motion.tr
                      key={resolution.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-gray-800 hover:bg-gray-900/50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-semibold text-white">
                            {resolution.market_title || resolution.market_id}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {resolution.market_id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-yellow-500 text-yellow-400"
                        >
                          {resolution.status?.toUpperCase() || "PENDING"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {resolution.evidence_links?.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {resolution.evidence_links.slice(0, 2).map((link: string, i: number) => (
                              <a
                                key={i}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Evidence {i + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No evidence</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {resolution.submitted_at
                          ? new Date(resolution.submitted_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedResolution(resolution);
                            setShowOverrideModal(true);
                          }}
                          disabled={actionLoading[resolution.id]}
                          className="h-8 border-gray-700 hover:bg-blue-900/20 hover:border-blue-500"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Override
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Override Modal */}
      {showOverrideModal && selectedResolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-lg w-full mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">Manual Override Resolution</h3>
            <p className="text-gray-400 mb-6">
              Market: {selectedResolution.market_title || selectedResolution.market_id}
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Outcome
                </label>
                <select
                  id="overrideOutcome"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                  <option value="CANCEL">CANCEL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Evidence/Reason
                </label>
                <textarea
                  id="overrideEvidence"
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="Enter evidence or reason for manual override"
                />
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-400">
                    This action will permanently override the automatic resolution. This cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOverrideModal(false);
                  setSelectedResolution(null);
                }}
                className="border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const outcome = (document.getElementById("overrideOutcome") as HTMLSelectElement)?.value || "YES";
                  const evidence = (document.getElementById("overrideEvidence") as HTMLTextAreaElement)?.value || "Manual override by admin";
                  handleManualOverride(selectedResolution.id, outcome, evidence);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirm Override
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}


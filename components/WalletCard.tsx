"use client"

import { useState } from "react";
import { Wallet, Star, Trash2, Edit2, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface WalletCardProps {
  wallet: {
    id: number;
    address: string;
    label?: string;
    is_primary: boolean;
    network: string;
    created_at?: string;
  };
  onUpdate: () => void;
  onSetPrimary: (id: number) => void;
}

export default function WalletCard({ wallet, onUpdate, onSetPrimary }: WalletCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete wallet "${wallet.label || wallet.address}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/api/users/wallets/${wallet.id}/`);
      toast.success("Wallet deleted successfully");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete wallet");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="hover:border-gray-700 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">
                  {wallet.label || "Unnamed Wallet"}
                </h3>
                {wallet.is_primary && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Primary
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400 capitalize">{wallet.network}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8"
              aria-label="Copy address"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSetPrimary(wallet.id)}
              className="h-8 w-8"
              disabled={wallet.is_primary}
              aria-label="Set as primary"
            >
              <Star
                className={`h-4 w-4 ${wallet.is_primary ? "text-yellow-500 fill-yellow-500" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-red-400 hover:text-red-500"
              aria-label="Delete wallet"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-300 break-all">
          {wallet.address}
        </div>
        {wallet.created_at && (
          <p className="text-xs text-gray-500 mt-2">
            Added {new Date(wallet.created_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}


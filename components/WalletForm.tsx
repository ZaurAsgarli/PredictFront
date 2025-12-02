"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface WalletFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingWallet?: {
    id: number;
    address: string;
    label?: string;
    network: string;
    is_primary: boolean;
  };
}

// Basic ETH address validation (42 chars, starts with 0x)
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
// Generic address validation (alphanumeric, 20-128 chars)
const GENERIC_ADDRESS_REGEX = /^[a-zA-Z0-9]{20,128}$/;

export default function WalletForm({ onSuccess, onCancel, editingWallet }: WalletFormProps) {
  const [address, setAddress] = useState(editingWallet?.address || "");
  const [label, setLabel] = useState(editingWallet?.label || "");
  const [network, setNetwork] = useState(editingWallet?.network || "ethereum");
  const [isPrimary, setIsPrimary] = useState(editingWallet?.is_primary || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ address?: string; label?: string }>({});

  const validateAddress = (addr: string): boolean => {
    if (!addr.trim()) {
      setErrors((prev) => ({ ...prev, address: "Address is required" }));
      return false;
    }
    if (network === "ethereum" && !ETH_ADDRESS_REGEX.test(addr)) {
      setErrors((prev) => ({
        ...prev,
        address: "Invalid Ethereum address format (must be 0x followed by 40 hex characters)",
      }));
      return false;
    }
    if (network !== "ethereum" && !GENERIC_ADDRESS_REGEX.test(addr)) {
      setErrors((prev) => ({
        ...prev,
        address: "Invalid address format (must be 20-128 alphanumeric characters)",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, address: undefined }));
    return true;
  };

  const validateLabel = (lbl: string): boolean => {
    if (!lbl.trim()) {
      setErrors((prev) => ({ ...prev, label: "Label is required" }));
      return false;
    }
    if (lbl.length > 64) {
      setErrors((prev) => ({ ...prev, label: "Label must be 64 characters or less" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, label: undefined }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddress(address) || !validateLabel(label)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        address: address.trim(),
        label: label.trim(),
        network,
        is_primary: isPrimary,
      };

      if (editingWallet) {
        await api.put(`/api/users/wallets/${editingWallet.id}/`, payload);
        toast.success("Wallet updated successfully");
      } else {
        await api.post("/api/users/wallets/", payload);
        toast.success("Wallet added successfully");
      }
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.address?.[0] ||
        error.response?.data?.label?.[0] ||
        "Failed to save wallet";
      toast.error(errorMessage);
      if (error.response?.data?.address) {
        setErrors((prev) => ({ ...prev, address: error.response.data.address[0] }));
      }
      if (error.response?.data?.label) {
        setErrors((prev) => ({ ...prev, label: error.response.data.label[0] }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingWallet ? "Edit Wallet" : "Add Wallet"}</CardTitle>
        <CardDescription>
          {editingWallet
            ? "Update your wallet information"
            : "Connect a wallet to your account. Only public addresses are stored."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (errors.label) validateLabel(e.target.value);
              }}
              placeholder="e.g., Main ETH Wallet"
              className="mt-2"
              aria-invalid={!!errors.label}
              aria-describedby={errors.label ? "label-error" : undefined}
            />
            {errors.label && (
              <p id="label-error" className="text-sm text-red-400 mt-1" role="alert">
                {errors.label}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Wallet Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) validateAddress(e.target.value);
              }}
              placeholder={network === "ethereum" ? "0x..." : "Enter wallet address"}
              className="mt-2 font-mono"
              disabled={!!editingWallet}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "address-error" : undefined}
            />
            {errors.address && (
              <p id="address-error" className="text-sm text-red-400 mt-1" role="alert">
                {errors.address}
              </p>
            )}
            {editingWallet && (
              <p className="text-xs text-gray-500 mt-1">Address cannot be changed after creation</p>
            )}
          </div>

          <div>
            <Label htmlFor="network">Network</Label>
            <Select value={network} onValueChange={setNetwork} disabled={!!editingWallet}>
              <SelectTrigger id="network" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                <SelectItem value="arbitrum">Arbitrum</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {editingWallet && (
              <p className="text-xs text-gray-500 mt-1">Network cannot be changed after creation</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-green-600 focus:ring-green-500"
            />
            <Label htmlFor="is_primary" className="cursor-pointer">
              Set as primary wallet
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : editingWallet ? "Update Wallet" : "Add Wallet"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


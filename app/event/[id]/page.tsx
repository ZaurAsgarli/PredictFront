"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { api, apiEndpoints, fetcher } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MarketTradeChart from "@/components/MarketTradeChart";

export default function EventPage() {
  const params = useParams();
  const eventId = params?.id as string;
  
  const [amount, setAmount] = useState("");
  const [outcome, setOutcome] = useState<"yes" | "no">("yes");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch event data - ONE TIME ONLY, no polling
  const { data: event, error: eventError, isLoading: eventLoading } = useSWR(
    eventId ? apiEndpoints.marketById(eventId) : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // Fetch holders data - ONE TIME ONLY, no polling
  const { data: holders, error: holdersError } = useSWR(
    eventId ? apiEndpoints.holders(eventId) : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');

  const handleTrade = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("⚪ Transaction Pending...", {
      description: "Processing your trade...",
    });

    try {
      await api.post(apiEndpoints.trade, {
        event_id: eventId,
        user_id: userId,
        amount: parseFloat(amount),
        outcome: outcome,
        side: tradeType,
      });

      toast.success("✅ Success!", {
        id: toastId,
        description: `Your ${outcome.toUpperCase()} ${tradeType} order has been placed successfully.`,
      });

      setAmount("");
      setOutcome("yes");
    } catch (error: any) {
      console.error("Trade error:", error);
      toast.error("❌ Trade Failed", {
        id: toastId,
        description: error.response?.data?.detail || error.message || "Failed to place trade. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-800 rounded"></div>
              <div className="h-96 bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-400">Event Not Found</CardTitle>
              <CardDescription>
                {eventError?.message || "The event you're looking for doesn't exist."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Markets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const yesChance = event.yes_price ? (event.yes_price * 100).toFixed(1) : "50.0";
  const noChance = event.no_price ? (event.no_price * 100).toFixed(1) : "50.0";
  const title = event.title || event.question || "Untitled Event";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 text-white">{title}</h1>
          {event.description && (
            <p className="text-gray-400">{event.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COL - Data & History */}
          <div className="space-y-6">
            {/* Trade Price Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Trade Price History</CardTitle>
                    <CardDescription>Historical trade prices for this market</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedOutcome === 'YES' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedOutcome('YES')}
                      className={selectedOutcome === 'YES' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      YES
                    </Button>
                    <Button
                      variant={selectedOutcome === 'NO' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedOutcome('NO')}
                      className={selectedOutcome === 'NO' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      NO
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MarketTradeChart 
                  marketId={eventId} 
                  selectedOutcome={selectedOutcome}
                  height={300}
                />
              </CardContent>
            </Card>

            {/* Shareholders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Shareholders</CardTitle>
                <CardDescription>Largest token holders</CardDescription>
              </CardHeader>
              <CardContent>
                {holdersError ? (
                  <p className="text-sm text-gray-400">
                    Failed to load holders. {holdersError.message}
                  </p>
                ) : holders && holders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holders.slice(0, 10).map((holder: any, index: number) => (
                        <TableRow key={holder.user_id || holder.id || `holder-${index}`}>
                          <TableCell className="text-sm">
                            {holder.username || `User ${index + 1}`}
                          </TableCell>
                          <TableCell>
                            <span className={holder.outcome === 'yes' ? 'text-green-500' : 'text-red-500'}>
                              {holder.outcome?.toUpperCase() || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>{holder.amount?.toFixed(2) || "0.00"}</TableCell>
                          <TableCell className="text-right">
                            ${holder.value?.toFixed(2) || "0.00"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-gray-400">No holders yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COL - Trading Engine */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
                <CardDescription>Buy or sell tokens for this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Prices */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                    <div className="text-sm text-gray-400 mb-1">Yes</div>
                    <div className="text-2xl font-bold text-green-500">{yesChance}%</div>
                  </div>
                  <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
                    <div className="text-sm text-gray-400 mb-1">No</div>
                    <div className="text-2xl font-bold text-red-500">{noChance}%</div>
                  </div>
                </div>

                {/* Order Form */}
                <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as "buy" | "sell")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" className="data-[state=active]:bg-green-600">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="data-[state=active]:bg-red-600">
                      Sell
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={tradeType} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="amount">Amount (USDC)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="outcome">Outcome</Label>
                      <Select value={outcome} onValueChange={(value: "yes" | "no") => setOutcome(value)}>
                        <SelectTrigger id="outcome" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleTrade}
                      disabled={isSubmitting || !amount}
                      className="w-full"
                      size="lg"
                      variant={tradeType === "buy" ? "default" : "destructive"}
                    >
                      {isSubmitting ? "Processing..." : `${tradeType === "buy" ? "Buy" : "Sell"} ${outcome.toUpperCase()}`}
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Info */}
                <div className="text-sm text-gray-400 space-y-2 pt-4 border-t border-gray-800">
                  <p>
                    • {tradeType === "buy" ? "Buying" : "Selling"} {outcome === "yes" ? "Yes" : "No"} tokens at {outcome === "yes" ? yesChance : noChance}%
                  </p>
                  {amount && (
                    <p>
                      • Estimated {tradeType === "buy" ? "cost" : "proceeds"}: ${(parseFloat(amount) || 0).toFixed(2)} USDC
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


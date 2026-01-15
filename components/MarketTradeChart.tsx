/**
 * MarketTradeChart - Reusable trade price chart component
 * 
 * Displays historical trade prices for a specific market.
 * Does NOT show wallet addresses, contract addresses, or trader identifiers.
 * 
 * @param marketId - Market ID (NOT contract address)
 * @param selectedOutcome - 'YES' or 'NO' to show price for
 * @param height - Chart height in pixels (default: 300)
 */

"use client"

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api, apiEndpoints } from '@/lib/api';
import { Activity } from 'lucide-react';

interface MarketTradeChartProps {
  marketId: string | number;
  selectedOutcome?: 'YES' | 'NO';
  height?: number;
  className?: string;
}

interface ChartDataPoint {
  date: string;
  time: string;
  price: number;
  timestamp: number;
  volume?: number;
}

export default function MarketTradeChart({ 
  marketId, 
  selectedOutcome = 'YES',
  height = 300,
  className = ''
}: MarketTradeChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTradeData = async () => {
      if (cancelled || !marketId) return;

      setLoading(true);
      setError(null);

      console.log(`[MarketTradeChart] Fetching trades ONCE for market ${marketId}, outcome ${selectedOutcome}`);

      try {
        // Fetch ALL trades for this market using the correct endpoint
        // Backend provides: GET /api/trades/?market=<market_id>
        let allTrades: any[] = [];
        let currentPage = 1;
        let hasMore = true;
        const pageSize = 1000;

        // Handle pagination to get all trades
        while (hasMore) {
          try {
            const response = await api.get(apiEndpoints.trades, {
              params: {
                market: marketId,
                page: currentPage,
                page_size: pageSize,
              },
            });
            
            const data = response.data;
            
            // Handle paginated response
            if (data.results && Array.isArray(data.results)) {
              allTrades = allTrades.concat(data.results);
              hasMore = data.next !== null && data.next !== undefined;
            } else if (Array.isArray(data)) {
              // Non-paginated response
              allTrades = allTrades.concat(data);
              hasMore = false;
            } else {
              // Single object (shouldn't happen, but handle it)
              allTrades.push(data);
              hasMore = false;
            }

            currentPage++;
            
            // Safety limit to prevent infinite loops
            if (currentPage > 100 || allTrades.length > 10000) {
              console.warn('Trade pagination limit reached, stopping');
              break;
            }
          } catch (pageError: any) {
            console.error('Error fetching trades page:', pageError);
            hasMore = false;
          }
        }

        // Filter and sort trades
        const validTrades = allTrades
          .filter((trade: any) => {
            // Only include trades with valid execution price and created_at
            return trade.price_at_execution != null && 
                   trade.created_at != null &&
                   trade.outcome_type === selectedOutcome;
          })
          .sort((a: any, b: any) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

        if (validTrades.length === 0) {
          setChartData([]);
          setLoading(false);
          return;
        }

        // Transform trades into chart data points
        // Each point: { x: trade.created_at, y: trade.price_at_execution }
        const chartPoints = validTrades.map((trade: any) => {
          const tradeDate = new Date(trade.created_at);
          return {
            date: tradeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: tradeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: tradeDate.getTime(),
            price: parseFloat(trade.price_at_execution) || 0.5,
            volume: parseFloat(trade.amount_staked || trade.amount || 0),
          };
        });

        if (!cancelled) {
          setChartData(chartPoints);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Error fetching trade data:', err);
          setError(err.message || 'Failed to load trade data');
          setChartData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTradeData();
    return () => { cancelled = true; };
  }, [marketId, selectedOutcome]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading trade data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Failed to load chart data</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No trades yet</p>
          <p className="text-xs mt-1">Price history will appear once trades are executed</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`colorPrice-${marketId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={selectedOutcome === 'YES' ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
              <stop offset="95%" stopColor={selectedOutcome === 'YES' ? "#22c55e" : "#ef4444"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[0, 1]} 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Price']}
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={selectedOutcome === 'YES' ? "#22c55e" : "#ef4444"}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#colorPrice-${marketId})`}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

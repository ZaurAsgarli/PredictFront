/**
 * Market Detail View
 * Shows full market information, price history, trades, and admin actions
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, X, Pause, Play, TrendingUp, TrendingDown, DollarSign, Users, Activity } from 'lucide-react';
import AdminAuthGuardWrapper from '../../components/AdminAuthGuardWrapper';
import { adminApi } from '../../lib/api';
import { renderAddress } from '../../../lib/utils/wallet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarketDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [market, setMarket] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadMarketData();
    }
  }, [id]);

  const loadMarketData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const [marketData, history, marketTrades] = await Promise.all([
        adminApi.getMarket(id).catch(() => null),
        adminApi.getMarketPriceHistory(id).catch(() => []),
        adminApi.getMarketTrades(id).catch(() => []),
      ]);

      setMarket(marketData);
      setPriceHistory(history);
      setTrades(marketTrades);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveMarket = async (outcome) => {
    if (!confirm(`Are you sure you want to resolve this market as ${outcome}?`)) return;
    
    setActionLoading(true);
    try {
      await adminApi.resolveMarket(id, outcome);
      alert('Market resolved successfully');
      loadMarketData(); // Reload to show updated status
    } catch (error) {
      console.error('Error resolving market:', error);
      alert('Failed to resolve market: ' + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminAuthGuardWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading market data...</p>
          </div>
        </div>
      </AdminAuthGuardWrapper>
    );
  }

  if (!market) {
    return (
      <AdminAuthGuardWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Market Not Found</h1>
            <Link href="/markets" className="text-blue-600 hover:underline">
              ← Back to Markets
            </Link>
          </div>
        </div>
      </AdminAuthGuardWrapper>
    );
  }

  // Prepare chart data
  const chartData = priceHistory.map((point) => ({
    date: new Date(point.timestamp || point.date).toLocaleDateString(),
    yes: parseFloat(point.yes_price || 0) * 100,
    no: parseFloat(point.no_price || 0) * 100,
  }));

  // Calculate statistics
  const totalVolume = trades.reduce((sum, t) => sum + parseFloat(t.amount_staked || 0), 0);
  const totalTrades = trades.length;
  const yesTrades = trades.filter(t => t.outcome_type === 'YES').length;
  const noTrades = trades.filter(t => t.outcome_type === 'NO').length;

  return (
    <AdminAuthGuardWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/markets"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{market.title}</h1>
              <p className="text-gray-600 mt-1">Market ID: #{market.id}</p>
            </div>
          </div>
          {market.status === 'active' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleResolveMarket('YES')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Resolve YES
              </button>
              <button
                onClick={() => handleResolveMarket('NO')}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <X size={18} />
                Resolve NO
              </button>
            </div>
          )}
        </div>

        {/* Market Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Market Status</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              market.status === 'active' ? 'bg-green-100 text-green-800' :
              market.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {market.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="font-medium">
                {typeof market.category === 'object' ? market.category?.name : market.category || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Created</p>
              <p className="font-medium">
                {market.created_at ? new Date(market.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Resolves</p>
              <p className="font-medium">
                {market.resolution_date ? new Date(market.resolution_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Resolved Outcome</p>
              <p className="font-medium">
                {market.resolved_outcome || 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Price History</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Line
                  type="monotone"
                  dataKey="yes"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="YES Price"
                />
                <Line
                  type="monotone"
                  dataKey="no"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="NO Price"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No price history available</p>
              <p className="text-sm mt-2">Price history will appear once trades are executed</p>
            </div>
          )}
        </div>

        {/* Market Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <p className="text-sm text-gray-600">Total Volume</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalVolume.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <p className="text-sm text-gray-600">Total Trades</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalTrades}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <p className="text-sm text-gray-600">YES Trades</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{yesTrades}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-6 w-6 text-red-600" />
              <p className="text-sm text-gray-600">NO Trades</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{noTrades}</p>
          </div>
        </div>

        {/* AMM State & Liquidity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AMM State & Liquidity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Liquidity Pool</p>
              <p className="text-lg font-bold text-gray-900">
                ${parseFloat(market.liquidity_pool || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Current YES Price</p>
              <p className="text-lg font-bold text-green-600">
                {market.prices?.yes_price 
                  ? (parseFloat(market.prices.yes_price) * 100).toFixed(1) + '%'
                  : market.outcome_tokens?.find(t => t.outcome_type === 'YES')?.price
                  ? (parseFloat(market.outcome_tokens.find(t => t.outcome_type === 'YES').price) * 100).toFixed(1) + '%'
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Current NO Price</p>
              <p className="text-lg font-bold text-red-600">
                {market.prices?.no_price 
                  ? (parseFloat(market.prices.no_price) * 100).toFixed(1) + '%'
                  : market.outcome_tokens?.find(t => t.outcome_type === 'NO')?.price
                  ? (parseFloat(market.outcome_tokens.find(t => t.outcome_type === 'NO').price) * 100).toFixed(1) + '%'
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Trading Enabled</p>
              <p className="text-lg font-bold">
                {market.trading_enabled !== false ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Trades</h2>
            <p className="text-sm text-gray-600 mt-1">Last {Math.min(20, trades.length)} trades</p>
          </div>
          <div className="overflow-x-auto">
            {trades.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No trades yet</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trades.slice(0, 20).map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500">#{trade.id}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {typeof trade.user === 'object' ? trade.user?.username : trade.user_username || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trade.trade_type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.trade_type?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trade.outcome_type === 'YES' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.outcome_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        ${parseFloat(trade.amount_staked || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {trade.price_at_execution 
                          ? (parseFloat(trade.price_at_execution) * 100).toFixed(2) + '%'
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(trade.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* On-Chain References */}
        {market.contract_address && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">On-Chain References (Admin Only)</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Contract Address (Admin Only)</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                  {renderAddress(market.contract_address, 'admin')}
                </p>
              </div>
              {market.transaction_hash && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Creation Transaction (Admin Only)</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                    {market.transaction_hash}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuardWrapper>
  );
}

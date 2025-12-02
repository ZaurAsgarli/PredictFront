import { useState, useEffect } from 'react';
import AdminLayout from '../../src/admin/layouts/AdminLayout';
import { adminApi } from '../../src/admin/services/adminApi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, ShoppingCart, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminAnalytics() {
  const [markets, setMarkets] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [marketsData, tradesData] = await Promise.all([
        adminApi.getMarkets().catch(() => ({ results: [] })),
        adminApi.getTrades().catch(() => ({ results: [] })),
      ]);

      setMarkets(marketsData.results || marketsData || []);
      setTrades(tradesData.results || tradesData || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trades per day (last 7 days)
  const getTradesPerDay = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayTrades = trades.filter((trade) => {
        const tradeDate = new Date(trade.created_at || trade.timestamp);
        return tradeDate.toDateString() === date.toDateString();
      });
      days.push({ date: dateStr, trades: dayTrades.length, volume: dayTrades.reduce((sum, t) => sum + (t.amount || 0), 0) });
    }
    return days;
  };

  // Active vs Inactive Markets
  const getMarketStatusData = () => {
    const active = markets.filter((m) => m.status?.toLowerCase() === 'active').length;
    const resolved = markets.filter((m) => m.status?.toLowerCase() === 'resolved').length;
    const closed = markets.filter((m) => m.status?.toLowerCase() === 'closed').length;
    return [
      { name: 'Active', value: active },
      { name: 'Resolved', value: resolved },
      { name: 'Closed', value: closed },
    ];
  };

  // Markets by Category
  const getMarketsByCategory = () => {
    const categoryMap = {};
    markets.forEach((market) => {
      const category = market.category || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Price history sample data (would come from API in production)
  const priceHistoryData = [
    { time: 'Day 1', yes: 0.45, no: 0.55 },
    { time: 'Day 2', yes: 0.52, no: 0.48 },
    { time: 'Day 3', yes: 0.48, no: 0.52 },
    { time: 'Day 4', yes: 0.55, no: 0.45 },
    { time: 'Day 5', yes: 0.58, no: 0.42 },
    { time: 'Day 6', yes: 0.62, no: 0.38 },
    { time: 'Day 7', yes: 0.65, no: 0.35 },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Market insights and trends</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Markets</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{markets.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{trades.length}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  ${trades.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Markets</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {markets.filter((m) => m.status?.toLowerCase() === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trades Per Day */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Trades Per Day (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getTradesPerDay()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="trades" fill="#3b82f6" name="Number of Trades" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Market Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Market Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getMarketStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getMarketStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Trading Volume Over Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Trading Volume (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getTradesPerDay()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volume" stroke="#10b981" name="Volume ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Markets by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Markets by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMarketsByCategory()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" name="Number of Markets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price History Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sample Price History</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={priceHistoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="yes" stroke="#22c55e" name="YES Price" />
              <Line type="monotone" dataKey="no" stroke="#ef4444" name="NO Price" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}



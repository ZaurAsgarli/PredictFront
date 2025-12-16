import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Users, DollarSign } from 'lucide-react';
import AdminAuthGuardWrapper from '../components/AdminAuthGuardWrapper';
import AdminStatsCard from '../../../src/admin/components/AdminStatsCard';
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
import { adminApi } from '../../../src/admin/services/adminApi';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMarkets: 0,
    activeMarkets: 0,
    totalTrades: 0,
    totalUsers: 0,
  });
  const [tradesPerDay, setTradesPerDay] = useState([]);
  const [marketStatusData, setMarketStatusData] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [liquidityOverTime, setLiquidityOverTime] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [markets, activeMarkets, trades, users] = await Promise.all([
        adminApi.getMarkets().catch(() => ({ results: [] })),
        adminApi.getMarkets({ status: 'active' }).catch(() => ({ results: [] })),
        adminApi.getTrades().catch(() => ({ results: [] })),
        adminApi.getUsers().catch(() => ({ results: [] })),
      ]);

      const marketsList = markets.results || markets || [];
      const tradesList = trades.results || trades || [];
      const usersList = users.results || users || [];

      setStats({
        totalMarkets: marketsList.length,
        activeMarkets: activeMarkets.results?.length || activeMarkets.length || 0,
        totalTrades: tradesList.length,
        totalUsers: usersList.length,
      });

      // Generate trades per day data
      setTradesPerDay(generateTradesPerDay(tradesList));

      // Market status distribution
      const statusCounts = {};
      marketsList.forEach((m) => {
        statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
      });
      setMarketStatusData(
        Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
      );

      // Category distribution
      const categoryCounts = {};
      marketsList.forEach((m) => {
        const cat = m.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      setCategoryDistribution(
        Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
      );

      // Liquidity over time (mock data - replace with actual API call)
      setLiquidityOverTime(generateLiquidityOverTime());
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTradesPerDay = (trades) => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayTrades = trades.filter((t) => {
        if (!t.timestamp) return false;
        const tradeDate = new Date(t.timestamp);
        return tradeDate.toDateString() === date.toDateString();
      });
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        trades: dayTrades.length,
      });
    }
    return days;
  };

  const generateLiquidityOverTime = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        liquidity: 10000 + Math.random() * 5000,
      });
    }
    return data;
  };

  return (
    <AdminAuthGuardWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Platform insights and metrics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminStatsCard
            title="Total Markets"
            value={stats.totalMarkets}
            icon={TrendingUp}
            loading={loading}
          />
          <AdminStatsCard
            title="Active Markets"
            value={stats.activeMarkets}
            icon={Activity}
            loading={loading}
          />
          <AdminStatsCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={DollarSign}
            loading={loading}
          />
          <AdminStatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trades Per Day */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trades Per Day (Last 7 Days)</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tradesPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="trades" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Market Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Status Distribution</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={marketStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marketStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Liquidity Over Time */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Liquidity Over Time (Last 30 Days)</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={liquidityOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="liquidity" stroke="#8b5cf6" name="Liquidity ($)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AdminAuthGuardWrapper>
  );
}


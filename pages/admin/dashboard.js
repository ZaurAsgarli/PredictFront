import { useState, useEffect } from 'react';
import AdminLayout from '../../src/admin/layouts/AdminLayout';
import { adminApi } from '../../src/admin/services/adminApi';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  AlertCircle,
  Activity,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMarkets: 0,
    activeMarkets: 0,
    totalTrades: 0,
    pendingDisputes: 0,
    featuredMarkets: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel
      const [markets, activeMarkets, trades, disputes, featured, users] = await Promise.all([
        adminApi.getMarkets().catch(() => ({ results: [] })),
        adminApi.getMarkets({ status: 'active' }).catch(() => ({ results: [] })),
        adminApi.getTrades().catch(() => ({ results: [] })),
        adminApi.getDisputes().catch(() => ({ results: [] })),
        adminApi.getFeaturedMarkets().catch(() => []),
        adminApi.getUsers().catch(() => ({ results: [] })),
      ]);

      setStats({
        totalMarkets: markets.results?.length || markets.length || 0,
        activeMarkets: activeMarkets.results?.length || activeMarkets.length || 0,
        totalTrades: trades.results?.length || trades.length || 0,
        pendingDisputes: disputes.results?.filter((d) => d.status === 'pending')?.length || 0,
        featuredMarkets: featured.results?.length || featured.length || 0,
        totalUsers: users.results?.length || users.length || 0,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Markets',
      value: stats.totalMarkets,
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Markets',
      value: stats.activeMarkets,
      icon: Activity,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'Total Trades',
      value: stats.totalTrades,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: '+23%',
    },
    {
      title: 'Pending Disputes',
      value: stats.pendingDisputes,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '-3%',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-indigo-500',
      change: '+8%',
    },
    {
      title: 'Featured Markets',
      value: stats.featuredMarkets,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+2%',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your prediction market</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stat.value.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/markets/create"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium text-gray-900 dark:text-white">Create Market</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add a new prediction market
              </p>
            </a>
            <a
              href="/admin/disputes"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium text-gray-900 dark:text-white">Review Disputes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.pendingDisputes} pending disputes
              </p>
            </a>
            <a
              href="/admin/analytics"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium text-gray-900 dark:text-white">View Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Market insights and trends
              </p>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}



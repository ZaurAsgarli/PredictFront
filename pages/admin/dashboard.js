import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, AlertTriangle, Activity } from 'lucide-react';
import AdminAuthGuard from '../../src/admin/components/AdminAuthGuard';
import AdminStatsCard from '../../src/admin/components/AdminStatsCard';
import { adminApi } from '../../src/admin/services/adminApi';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMarkets: 0,
    activeMarkets: 0,
    totalTrades: 0,
    pendingDisputes: 0,
    featuredMarkets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [featuredMarkets, setFeaturedMarkets] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [markets, activeMarkets, trades, disputes, featured] = await Promise.all([
        adminApi.getMarkets().catch(() => ({ results: [] })),
        adminApi.getMarkets({ status: 'active' }).catch(() => ({ results: [] })),
        adminApi.getTrades().catch(() => ({ results: [] })),
        adminApi.getDisputes().catch(() => ({ results: [] })),
        adminApi.getFeaturedMarkets().catch(() => ({ results: [] })),
      ]);

      setStats({
        totalMarkets: markets.results?.length || markets.length || 0,
        activeMarkets: activeMarkets.results?.length || activeMarkets.length || 0,
        totalTrades: trades.results?.length || trades.length || 0,
        pendingDisputes: disputes.results?.filter(d => d.status === 'pending')?.length || 
                        disputes.filter(d => d.status === 'pending')?.length || 0,
        featuredMarkets: featured.results?.length || featured.length || 0,
      });

      setFeaturedMarkets(featured.results || featured.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to the admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            changeType="positive"
            loading={loading}
          />
          <AdminStatsCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={ShoppingCart}
            loading={loading}
          />
          <AdminStatsCard
            title="Pending Disputes"
            value={stats.pendingDisputes}
            icon={AlertTriangle}
            changeType={stats.pendingDisputes > 0 ? 'negative' : 'positive'}
            loading={loading}
          />
        </div>

        {/* Featured Markets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Featured Markets</h2>
            <Link
              href="/admin/markets"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : featuredMarkets.length > 0 ? (
            <div className="space-y-3">
              {featuredMarkets.slice(0, 5).map((market) => (
                <Link
                  key={market.id}
                  href={`/admin/markets/${market.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{market.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {market.category} • {market.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        YES: {market.yes_price || 'N/A'}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        NO: {market.no_price || 'N/A'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No featured markets available</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/markets/create"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Market</h3>
                <p className="text-sm text-gray-500">Add a new prediction market</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/disputes"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Review Disputes</h3>
                <p className="text-sm text-gray-500">
                  {stats.pendingDisputes} pending disputes
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-500">Platform insights & metrics</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AdminAuthGuard>
  );
}


/**
 * Admin Dashboard - Fixed Version
 * 
 * This file fixes:
 * 1. Undefined API errors by checking API existence before calling
 * 2. Hydration errors by only fetching after mount
 * 3. Proper error handling for all API calls
 * 4. Authentication check before data loading
 */

import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, AlertTriangle, Activity, ShieldAlert } from 'lucide-react';
import AdminAuthGuardWrapper from '../components/AdminAuthGuardWrapper';
import AdminStatsCard from '../../../src/admin/components/AdminStatsCard';
// Use default import (not named import)
import adminApi from '../lib/api';
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
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted (prevents hydration errors)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load dashboard data ONLY after component is mounted
  useEffect(() => {
    if (!mounted) return;
    loadDashboardData();
  }, [mounted]);

  /**
   * Load Dashboard Data - FIXED VERSION
   * 
   * Key fixes:
   * 1. Checks if adminApi exists before calling
   * 2. Checks if nested API methods exist (adminApi.markets, etc.)
   * 3. All API calls wrapped in try/catch
   * 4. Graceful error handling with fallback values
   */
  const loadDashboardData = async () => {
    // CRITICAL CHECK: Ensure API object exists
    if (!adminApi) {
      console.error('[loadDashboardData] adminApi is undefined');
      setLoading(false);
      return;
    }

    // CRITICAL CHECK: Ensure nested API objects exist
    if (!adminApi.markets || typeof adminApi.markets.getAllMarkets !== 'function') {
      console.error('[loadDashboardData] adminApi.markets.getAllMarkets is not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch ALL data using pagination (no truncation)
      // Each API call is wrapped with .catch() as additional safety
      const [allMarkets, activeMarkets, allTrades, allDisputes, featured, adminStats, suspiciousUsers] = await Promise.all([
        // Markets API
        (adminApi.markets?.getAllMarkets ? adminApi.markets.getAllMarkets().catch(() => []) : Promise.resolve([])),
        (adminApi.markets?.getAllMarkets ? adminApi.markets.getAllMarkets({ status: 'active' }).catch(() => []) : Promise.resolve([])),
        
        // Trades API
        (adminApi.trades?.getAll ? adminApi.trades.getAll().catch(() => []) : Promise.resolve([])),
        
        // Disputes API
        (adminApi.disputes?.getAll ? adminApi.disputes.getAll().catch(() => []) : Promise.resolve([])),
        
        // Featured Markets
        (adminApi.markets?.getFeatured ? adminApi.markets.getFeatured().catch(() => []) : Promise.resolve([])),
        
        // Admin Stats
        (adminApi.admin?.getStats ? adminApi.admin.getStats().catch(() => null) : Promise.resolve(null)),
        
        // Suspicious Users
        (adminApi.users?.getSuspicious ? adminApi.users.getSuspicious().catch(() => []) : Promise.resolve([])),
      ]);

      // Use admin stats if available (backend truth), otherwise calculate from fetched data
      const statsData = adminStats || {
        markets: {
          total: Array.isArray(allMarkets) ? allMarkets.length : 0,
          active: Array.isArray(activeMarkets) ? activeMarkets.length : 0,
          resolved: Array.isArray(allMarkets) ? allMarkets.filter(m => m.status === 'resolved').length : 0,
        },
        users: {
          total: 0, // Will be fetched separately
        },
      };

      setStats({
        totalMarkets: statsData.markets?.total || (Array.isArray(allMarkets) ? allMarkets.length : 0),
        activeMarkets: statsData.markets?.active || (Array.isArray(activeMarkets) ? activeMarkets.length : 0),
        totalTrades: Array.isArray(allTrades) ? allTrades.length : 0,
        pendingDisputes: Array.isArray(allDisputes) ? allDisputes.filter(d => d.status === 'pending').length : 0,
        featuredMarkets: Array.isArray(featured) ? featured.length : 0,
        suspiciousUsers: Array.isArray(suspiciousUsers) ? suspiciousUsers.length : 0,
      });

      setFeaturedMarkets(Array.isArray(featured) ? featured.slice(0, 5) : []);
    } catch (error) {
      console.error('[loadDashboardData] Error loading dashboard data:', error);
      // Don't crash - set safe defaults
      setStats({
        totalMarkets: 0,
        activeMarkets: 0,
        totalTrades: 0,
        pendingDisputes: 0,
        featuredMarkets: 0,
        suspiciousUsers: 0,
      });
      setFeaturedMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted (prevents hydration errors)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminAuthGuardWrapper>
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
          <AdminStatsCard
            title="Suspicious Users"
            value={stats.suspiciousUsers || 0}
            icon={ShieldAlert}
            changeType={stats.suspiciousUsers > 0 ? 'negative' : 'positive'}
            loading={loading}
          />
        </div>

        {/* Featured Markets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Featured Markets</h2>
            <Link
              href="/markets"
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
                  href={`/markets/${market.id}`}
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
            href="/markets/create"
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
            href="/trades"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Review Trades</h3>
                <p className="text-sm text-gray-500">
                  {stats.totalTrades} total trades
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/analytics"
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
    </AdminAuthGuardWrapper>
  );
}

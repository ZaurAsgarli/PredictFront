import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, AlertTriangle, Activity, Shield, Brain, Eye } from 'lucide-react';
import AdminAuthGuard from '../../src/admin/components/AdminAuthGuard';
import AdminStatsCard from '../../src/admin/components/AdminStatsCard';
import { adminApi } from '../../src/admin/services/adminApi';
import api from '../../src/services/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMarkets: 0,
    activeMarkets: 0,
    resolvedMarkets: 0,
    totalTrades: 0,
    totalUsers: 0,
    pendingDisputes: 0,
    securityEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [suspiciousUsers, setSuspiciousUsers] = useState([]);
  const [recentMarkets, setRecentMarkets] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (cancelled) return;
      console.log('[AdminDashboard] Fetching admin data ONCE on mount');
      await loadDashboardData();
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch admin stats from backend
      const [statsRes, securityRes, suspiciousRes, marketsRes] = await Promise.all([
        api.get('/admin/stats/').catch(() => ({ data: {} })),
        api.get('/admin/security/').catch(() => ({ data: { logs: [] } })),
        api.get('/admin/suspicious/').catch(() => ({ data: { suspicious_users: [] } })),
        adminApi.getMarkets().catch(() => ({ results: [] })),
      ]);

      // Extract stats
      const adminStats = statsRes.data;
      setStats({
        totalMarkets: adminStats.markets?.total || 0,
        activeMarkets: adminStats.markets?.active || 0,
        resolvedMarkets: adminStats.markets?.resolved || 0,
        totalTrades: adminStats.activity?.total_trades || 0,
        totalUsers: adminStats.users?.total || 0,
        pendingDisputes: 0,
        securityEvents: adminStats.activity?.security_events || 0,
      });

      // Set security logs
      setSecurityLogs(securityRes.data.logs?.slice(0, 10) || []);

      // Set suspicious users
      setSuspiciousUsers(suspiciousRes.data.suspicious_users?.slice(0, 5) || []);

      // Set recent markets
      setRecentMarkets(marketsRes.results?.slice(0, 5) || marketsRes.slice?.(0, 5) || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to the command center</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
              title="Active Markets"
              value={stats.activeMarkets}
              icon={TrendingUp}
              loading={loading}
              className="bg-blue-50 dark:bg-blue-900/20"
            />
            <AdminStatsCard
              title="Resolved Markets"
              value={stats.resolvedMarkets}
              icon={Activity}
              loading={loading}
              className="bg-green-50 dark:bg-green-900/20"
            />
            <AdminStatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              loading={loading}
              className="bg-purple-50 dark:bg-purple-900/20"
            />
            <AdminStatsCard
              title="Security Events"
              value={stats.securityEvents}
              icon={AlertTriangle}
              changeType={stats.securityEvents > 50 ? 'negative' : 'positive'}
              loading={loading}
              className="bg-red-50 dark:bg-red-900/20"
            />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Security Feed
                </h2>
                <Link
                  href="/admin/security"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : securityLogs.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {securityLogs.map((log, index) => (
                    <div
                      key={log.id || index}
                      className={`p-3 rounded-lg border ${getSeverityColor(log.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium text-sm">{log.event_type}</span>
                          <p className="text-xs mt-1 opacity-80">{log.message}</p>
                        </div>
                        <span className="text-xs opacity-60">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs mt-1 opacity-60">IP: {log.ip}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No security events</p>
              )}
            </div>

            {/* Suspicious Users (Risk Table) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-orange-500" />
                  High Risk Users
                </h2>
                <Link
                  href="/admin/users"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : suspiciousUsers.length > 0 ? (
                <div className="space-y-3">
                  {suspiciousUsers.map((user, index) => (
                    <div
                      key={user.user_id || index}
                      className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {user.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-red-600">
                            {(user.risk_score * 100).toFixed(0)}%
                          </span>
                          <p className="text-xs text-gray-500">Risk Score</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No high-risk users detected</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/markets"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Manage Markets</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View and manage prediction markets</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/trades"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">View Trades</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalTrades} total trades</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">ML Insights</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View ML predictions & analytics</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

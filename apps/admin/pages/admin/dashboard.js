/**
 * Admin Dashboard - Production Ready
 * 
 * Main dashboard page with all sections:
 * 1. Users Overview
 * 2. Security Alerts
 * 3. ML Alerts
 * 4. System Health
 * 5. Trade & Money Flow Charts
 * 6. Leaderboards (Weekly/Monthly/All-Time)
 * 
 * Key Features:
 * - Server-side authentication check (prevents infinite loops)
 * - Client-side data fetching ONLY after auth confirmed
 * - Safe API calls with existence checks
 * - Error handling with fallback UI
 * - Modular components for each section
 */

import { useState, useEffect } from 'react';
import api from '../../utils/api'; // Safe API utility - all methods guaranteed to exist
import TradesChart from '../../components/charts/TradesChart';
import RevenueChart from '../../components/charts/RevenueChart';
import LeaderboardTable from '../../components/admin/LeaderboardTable';
import UsersList from '../../components/admin/UsersList';
import SecurityAlerts from '../../components/admin/SecurityAlerts';
import MLAlerts from '../../components/admin/MLAlerts';
import SystemHealth from '../../components/admin/SystemHealth';
import {
  Users,
  Shield,
  Brain,
  TrendingUp,
  Trophy,
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';

export default function AdminDashboard({ user }) {
  // Track if component is mounted (prevents hydration errors)
  const [mounted, setMounted] = useState(false);

  // Collapsible panel state
  const [collapsedPanels, setCollapsedPanels] = useState({});

  // Data states
  const [markets, setMarkets] = useState([]);
  const [users, setUsers] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState(null);
  const [mlAlerts, setMlAlerts] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [tradesData, setTradesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardCursor, setLeaderboardCursor] = useState(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    markets: false,
    users: false,
    security: false,
    ml: false,
    health: false,
    trades: false,
    revenue: false,
    leaderboard: false,
  });

  // Error states
  const [errors, setErrors] = useState({});

  // Mark component as mounted (prevents hydration errors)
  useEffect(() => {
    setMounted(true);

    // Load collapsed state from localStorage
    const saved = localStorage.getItem('admin_panel_state');
    if (saved) {
      try {
        setCollapsedPanels(JSON.parse(saved));
      } catch (e) {
        console.error('[AdminDashboard] Error loading panel state:', e);
      }
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('admin_panel_state', JSON.stringify(collapsedPanels));
    }
  }, [collapsedPanels, mounted]);

  /**
   * Load Markets
   * Safe API call - checks if function exists before calling
   */
  const loadMarkets = async () => {
    if (collapsedPanels.markets || !mounted) return;

    // Check if API method exists (prevents undefined errors)
    if (!api.getAllMarkets || typeof api.getAllMarkets !== 'function') {
      console.error('[loadMarkets] api.getAllMarkets is not available');
      setErrors(prev => ({ ...prev, markets: 'API method not available' }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, markets: true }));
    setErrors(prev => ({ ...prev, markets: null }));

    try {
      const result = await api.getAllMarkets({ page_size: 50 });
      if (result.success) {
        setMarkets(Array.isArray(result.data) ? result.data : []);
      } else {
        setMarkets([]);
        setErrors(prev => ({ ...prev, markets: result.error || 'Failed to load markets' }));
      }
    } catch (error) {
      console.error('[loadMarkets] Error:', error);
      setMarkets([]);
      setErrors(prev => ({ ...prev, markets: error.message || 'Failed to load markets' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, markets: false }));
    }
  };

  /**
   * Load Users
   */
  const loadUsers = async () => {
    if (collapsedPanels.users || !mounted) return;

    if (!api.getUsers || typeof api.getUsers !== 'function') {
      setErrors(prev => ({ ...prev, users: 'API method not available' }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, users: true }));
    setErrors(prev => ({ ...prev, users: null }));

    try {
      const result = await api.getUsers({ page_size: 50 });
      if (result.success) {
        setUsers(Array.isArray(result.data) ? result.data : []);
      } else {
        setUsers([]);
        setErrors(prev => ({ ...prev, users: result.error || 'Failed to load users' }));
      }
    } catch (error) {
      console.error('[loadUsers] Error:', error);
      setUsers([]);
      setErrors(prev => ({ ...prev, users: error.message || 'Failed to load users' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, users: false }));
    }
  };

  /**
   * Load Security Alerts
   */
  const loadSecurityAlerts = async () => {
    if (collapsedPanels.security || !mounted) return;

    if (!api.getSecurityAlerts || typeof api.getSecurityAlerts !== 'function') {
      setErrors(prev => ({ ...prev, security: 'API method not available' }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, security: true }));
    setErrors(prev => ({ ...prev, security: null }));

    try {
      const result = await api.getSecurityAlerts({ limit: 50 });
      if (result.success) {
        setSecurityAlerts(result.data);
      } else {
        setSecurityAlerts({ sessions: [], failedLogins: [], unusualActivity: [], logs: [] });
        setErrors(prev => ({ ...prev, security: result.error || 'Failed to load security alerts' }));
      }
    } catch (error) {
      console.error('[loadSecurityAlerts] Error:', error);
      setSecurityAlerts({ sessions: [], failedLogins: [], unusualActivity: [], logs: [] });
      setErrors(prev => ({ ...prev, security: error.message || 'Failed to load security alerts' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, security: false }));
    }
  };

  /**
   * Load ML Alerts
   */
  const loadMLAlerts = async () => {
    if (collapsedPanels.ml || !mounted) return;

    if (!api.getMLAlerts || typeof api.getMLAlerts !== 'function') {
      setErrors(prev => ({ ...prev, ml: 'API method not available' }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, ml: true }));
    setErrors(prev => ({ ...prev, ml: null }));

    try {
      const result = await api.getMLAlerts({ limit: 50 });
      if (result.success) {
        setMlAlerts(result.data);
      } else {
        setMlAlerts({ status: null, predictions: [], logs: [], health: null });
        setErrors(prev => ({ ...prev, ml: result.error || 'Failed to load ML alerts' }));
      }
    } catch (error) {
      console.error('[loadMLAlerts] Error:', error);
      setMlAlerts({ status: null, predictions: [], logs: [], health: null });
      setErrors(prev => ({ ...prev, ml: error.message || 'Failed to load ML alerts' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, ml: false }));
    }
  };

  /**
   * Load System Health
   */
  const loadSystemHealth = async () => {
    if (collapsedPanels.health || !mounted) return;

    if (!api.getSystemHealth || typeof api.getSystemHealth !== 'function') {
      setErrors(prev => ({ ...prev, health: 'API method not available' }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, health: true }));
    setErrors(prev => ({ ...prev, health: null }));

    try {
      const result = await api.getSystemHealth();
      if (result.success) {
        setSystemHealth(result.data);
      } else {
        setSystemHealth({ status: 'unknown', uptime: 0, version: 'N/A' });
        setErrors(prev => ({ ...prev, health: result.error || 'Failed to load system health' }));
      }
    } catch (error) {
      console.error('[loadSystemHealth] Error:', error);
      setSystemHealth({ status: 'unknown', uptime: 0, version: 'N/A' });
      setErrors(prev => ({ ...prev, health: error.message || 'Failed to load system health' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, health: false }));
    }
  };

  /**
   * Load Trades Over Time (for charts)
   */
  const loadTradesOverTime = async () => {
    if (collapsedPanels.trades || !mounted) return;

    if (!api.getTradesOverTime || typeof api.getTradesOverTime !== 'function') {
      setErrors(prev => ({ ...prev, trades: 'API method not available' }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, trades: true }));
    setErrors(prev => ({ ...prev, trades: null }));

    try {
      const result = await api.getTradesOverTime({ days: 30 });
      if (result.success) {
        setTradesData(Array.isArray(result.data) ? result.data : []);
      } else {
        setTradesData([]);
        setErrors(prev => ({ ...prev, trades: result.error || 'Failed to load trades data' }));
      }
    } catch (error) {
      console.error('[loadTradesOverTime] Error:', error);
      setTradesData([]);
      setErrors(prev => ({ ...prev, trades: error.message || 'Failed to load trades data' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, trades: false }));
    }
  };

  /**
   * Load Revenue Flow (for charts)
   */
  const loadRevenueFlow = async () => {
    if (collapsedPanels.revenue || !mounted) return;

    if (!api.getRevenueFlow || typeof api.getRevenueFlow !== 'function') {
      setErrors(prev => ({ ...prev, revenue: 'API method not available' }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, revenue: true }));
    setErrors(prev => ({ ...prev, revenue: null }));

    try {
      const result = await api.getRevenueFlow({ days: 30 });
      if (result.success) {
        setRevenueData(Array.isArray(result.data) ? result.data : []);
      } else {
        setRevenueData([]);
        setErrors(prev => ({ ...prev, revenue: result.error || 'Failed to load revenue data' }));
      }
    } catch (error) {
      console.error('[loadRevenueFlow] Error:', error);
      setRevenueData([]);
      setErrors(prev => ({ ...prev, revenue: error.message || 'Failed to load revenue data' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, revenue: false }));
    }
  };

  /**
   * Load Leaderboards
   * Weekly: Last 7 days
   * Monthly: Last 30 days
   * All-time: All historical data
   */
  const loadLeaderboard = async (type, cursor = null) => {
    if (collapsedPanels.leaderboard || !mounted) return;

    if (!api.getLeaderboards || typeof api.getLeaderboards !== 'function') {
      setErrors(prev => ({ ...prev, leaderboard: 'API method not available' }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, leaderboard: true }));
    setErrors(prev => ({ ...prev, leaderboard: null }));

    try {
      const result = await api.getLeaderboards(type, cursor);
      if (result.success) {
        const newData = Array.isArray(result.data) ? result.data : [];
        if (cursor) {
          // Append for pagination
          setLeaderboardData(prev => [...prev, ...newData]);
        } else {
          // Replace data
          setLeaderboardData(newData);
        }
        setLeaderboardCursor(result.nextCursor || null);
      } else {
        if (!cursor) setLeaderboardData([]);
        setErrors(prev => ({ ...prev, leaderboard: result.error || 'Failed to load leaderboard' }));
      }
    } catch (error) {
      console.error('[loadLeaderboard] Error:', error);
      if (!cursor) setLeaderboardData([]);
      setErrors(prev => ({ ...prev, leaderboard: error.message || 'Failed to load leaderboard' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, leaderboard: false }));
    }
  };

  // Load data when panels are expanded (ONLY after mounted)
  useEffect(() => {
    if (!mounted) return;
    if (!collapsedPanels.markets) loadMarkets();
  }, [collapsedPanels.markets, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!collapsedPanels.users) loadUsers();
  }, [collapsedPanels.users, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!collapsedPanels.security) loadSecurityAlerts();
  }, [collapsedPanels.security, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!collapsedPanels.ml) loadMLAlerts();
  }, [collapsedPanels.ml, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!collapsedPanels.health) loadSystemHealth();
  }, [collapsedPanels.health, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!collapsedPanels.trades) loadTradesOverTime();
  }, [collapsedPanels.trades, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!collapsedPanels.revenue) loadRevenueFlow();
  }, [collapsedPanels.revenue, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!collapsedPanels.leaderboard) {
      loadLeaderboard(leaderboardType);
    }
  }, [collapsedPanels.leaderboard, leaderboardType, mounted]);

  // Toggle panel collapse
  const togglePanel = (panelId) => {
    setCollapsedPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId],
    }));
  };

  // Handle leaderboard type change
  const handleLeaderboardTypeChange = (type) => {
    setLeaderboardType(type);
    setLeaderboardData([]);
    setLeaderboardCursor(null);
  };

  // Prevent hydration errors - don't render until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome, {user?.username || 'Admin'}
              </p>
            </div>
            <a
              href="/api/logout"
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Logout
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Markets Overview */}
        <Panel
          id="markets"
          title="Markets Overview"
          icon={TrendingUp}
          collapsed={collapsedPanels.markets}
          onToggle={() => togglePanel('markets')}
          loading={loadingStates.markets}
          error={errors.markets}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Liquidity</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {markets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No markets available</td>
                  </tr>
                ) : (
                  markets.slice(0, 20).map((market) => (
                    <tr key={market.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{market.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{market.title || market.question || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          market.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {market.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(market.liquidity_pool || 0).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Users List */}
        <Panel
          id="users"
          title="Users Overview"
          icon={Users}
          collapsed={collapsedPanels.users}
          onToggle={() => togglePanel('users')}
          loading={loadingStates.users}
          error={errors.users}
        >
          <UsersList users={users} loading={loadingStates.users} />
        </Panel>

        {/* Security Alerts */}
        <Panel
          id="security"
          title="Security Alerts"
          icon={Shield}
          collapsed={collapsedPanels.security}
          onToggle={() => togglePanel('security')}
          loading={loadingStates.security}
          error={errors.security}
        >
          <SecurityAlerts data={securityAlerts} loading={loadingStates.security} />
        </Panel>

        {/* ML Alerts */}
        <Panel
          id="ml"
          title="ML Models Dashboard"
          icon={Brain}
          collapsed={collapsedPanels.ml}
          onToggle={() => togglePanel('ml')}
          loading={loadingStates.ml}
          error={errors.ml}
        >
          <MLAlerts data={mlAlerts} loading={loadingStates.ml} />
        </Panel>

        {/* System Health */}
        <Panel
          id="health"
          title="System Health"
          icon={Activity}
          collapsed={collapsedPanels.health}
          onToggle={() => togglePanel('health')}
          loading={loadingStates.health}
          error={errors.health}
        >
          <SystemHealth data={systemHealth} loading={loadingStates.health} />
        </Panel>

        {/* Trades & Revenue Charts */}
        <Panel
          id="trades"
          title="Trade & Money Flow Analysis"
          icon={TrendingUp}
          collapsed={collapsedPanels.trades}
          onToggle={() => togglePanel('trades')}
          loading={loadingStates.trades || loadingStates.revenue}
          error={errors.trades || errors.revenue}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trades Over Time</h3>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <TradesChart
                  data={tradesData.map(item => ({
                    date: item.date || new Date(item.timestamp || Date.now()).toLocaleDateString(),
                    count: item.count || 0,
                    volume: item.volume || 0,
                  }))}
                  loading={loadingStates.trades}
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Flow</h3>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <RevenueChart
                  data={revenueData.map((item, idx) => ({
                    date: item.date || new Date(item.timestamp || Date.now()).toLocaleDateString(),
                    revenue: item.revenue || 0,
                    cumulative: revenueData.slice(0, idx + 1).reduce((sum, i) => sum + (i.revenue || 0), 0),
                  }))}
                  loading={loadingStates.revenue}
                />
              </div>
            </div>
          </div>
        </Panel>

        {/* Leaderboards */}
        <Panel
          id="leaderboard"
          title="Leaderboards"
          icon={Trophy}
          collapsed={collapsedPanels.leaderboard}
          onToggle={() => togglePanel('leaderboard')}
          loading={loadingStates.leaderboard}
          error={errors.leaderboard}
        >
          <div className="mb-6">
            <div className="flex gap-2">
              {['weekly', 'monthly', 'all-time'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleLeaderboardTypeChange(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    leaderboardType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {type === 'all-time' ? 'All-Time' : type}
                </button>
              ))}
            </div>
          </div>
          <LeaderboardTable
            data={leaderboardData}
            type={leaderboardType}
            loading={loadingStates.leaderboard}
            onLoadMore={leaderboardCursor ? () => loadLeaderboard(leaderboardType, leaderboardCursor) : null}
            hasMore={!!leaderboardCursor}
          />
        </Panel>
      </div>
    </div>
  );
}

// Reusable Panel Component
function Panel({ id, title, icon: Icon, collapsed, onToggle, loading, error, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {collapsed ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {!collapsed && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {!loading && !error && children}
        </div>
      )}
    </div>
  );
}

/**
 * Server-side authentication check
 * This prevents infinite login loops by verifying token BEFORE rendering
 */
export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies?.admin_token;

  if (!token) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    // Use /users/me/ endpoint (NOT /admin/verify)
    const response = await fetch(`${backendUrl}/users/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false,
        },
      };
    }

    const user = await response.json();

    // Check if user is admin (check role field - role !== 'ADMIN' means not admin)
    if (!user || (user.role !== 'ADMIN' && !user.is_staff && !user.is_superuser)) {
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false,
        },
      };
    }

    return {
      props: {
        user,
      },
    };
  } catch (error) {
    console.error('[AdminDashboard getServerSideProps] Error:', error);
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
}

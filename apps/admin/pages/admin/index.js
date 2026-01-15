/**
 * Admin Dashboard - Fixed Auth & API Wiring
 * 
 * FIXES:
 * - Client-side auth check (localStorage tokens, not cookies)
 * - Uses existing backend endpoints (/trades/, /markets/, etc.)
 * - No /admin/* API endpoints
 * - Verification runs once, cached
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import TradesChart from '../../components/charts/TradesChart';
import RevenueChart from '../../components/charts/RevenueChart';
import {
  Users,
  Shield,
  Brain,
  TrendingUp,
  Trophy,
  Activity,
  AlertTriangle,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ========== PANEL STATE ==========
  const [collapsedPanels, setCollapsedPanels] = useState({});

  // ========== REQUEST FLAGS (Prevent Duplicate Calls) ==========
  const requestFlags = useRef({
    markets: false,
    mlLogs: false,
    securityLogs: false,
    health: false,
    moneyFlow: false,
    trades: false,
    riskyUsers: false,
    disputes: false,
    leaderboard: false,
  });

  // ========== DATA STATES ==========
  const [markets, setMarkets] = useState([]);
  const [mlLogs, setMlLogs] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [healthScores, setHealthScores] = useState(null);
  const [moneyFlow, setMoneyFlow] = useState([]);
  const [trades, setTrades] = useState([]);
  const [riskyUsers, setRiskyUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardCursor, setLeaderboardCursor] = useState(null);

  // ========== LOADING STATES ==========
  const [loading, setLoading] = useState({
    markets: false,
    mlLogs: false,
    securityLogs: false,
    health: false,
    moneyFlow: false,
    trades: false,
    riskyUsers: false,
    disputes: false,
    leaderboard: false,
  });

  // ========== ERROR STATES ==========
  const [errors, setErrors] = useState({});

  // ========== AUTH CHECK (Client-Side, Run Once) ==========
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    setMounted(true);
    
    // Load panel state
    const saved = localStorage.getItem('admin_panel_state');
    if (saved) {
      try {
        setCollapsedPanels(JSON.parse(saved));
      } catch (e) {
        console.error('[AdminDashboard] Error loading panel state:', e);
      }
    }

    // Check auth ONCE (client-side, uses localStorage)
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // No token, redirect to login
      router.push('/admin/login');
      return;
    }

    try {
      // Verify using /users/me/ (NOT /admin/verify)
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Invalid token, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        router.push('/admin/login');
        return;
      }

      const userData = await response.json();
      
      // Check if user is admin (check role field)
      if (userData.role !== 'ADMIN' && !userData.is_staff && !userData.is_superuser) {
        // Not admin, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        router.push('/admin/login');
        return;
      }

      // User is admin, set user and allow dashboard
      setUser(userData);
      setAuthChecked(true);
    } catch (error) {
      console.error('[AdminDashboard] Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.push('/admin/login');
    }
  };

  // Save panel state
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('admin_panel_state', JSON.stringify(collapsedPanels));
    }
  }, [collapsedPanels, mounted]);

  // ========== API CALL FUNCTIONS (Use Existing Endpoints) ==========

  /**
   * Load Markets - Use /markets/ endpoint (NOT /admin/markets)
   */
  const loadMarkets = async () => {
    if (collapsedPanels.markets || !mounted || !authChecked || requestFlags.current.markets) return;
    if (!api || !api.getAllMarkets || typeof api.getAllMarkets !== 'function') {
      setErrors(prev => ({ ...prev, markets: 'API method not available' }));
      return;
    }

    requestFlags.current.markets = true;
    setLoading(prev => ({ ...prev, markets: true }));
    setErrors(prev => ({ ...prev, markets: null }));

    try {
      const result = await api.getAllMarkets({ page_size: 50 });
      if (result && result.success) {
        setMarkets(Array.isArray(result.data) ? result.data : []);
      } else {
        setMarkets([]);
        setErrors(prev => ({ ...prev, markets: result?.error || 'Failed to load markets' }));
      }
    } catch (error) {
      console.error('[loadMarkets] Error:', error);
      setMarkets([]);
      if (error.response?.status !== 429) {
        setErrors(prev => ({ ...prev, markets: error.message || 'Failed to load markets' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, markets: false }));
      requestFlags.current.markets = false;
    }
  };

  /**
   * Load ML Logs - Use /ml/logs/ endpoint
   */
  const loadMLLogs = async () => {
    if (collapsedPanels.mlLogs || !mounted || !authChecked || requestFlags.current.mlLogs) return;
    if (!api || !api.getMLLogs || typeof api.getMLLogs !== 'function') {
      setErrors(prev => ({ ...prev, mlLogs: 'API method not available' }));
      return;
    }

    requestFlags.current.mlLogs = true;
    setLoading(prev => ({ ...prev, mlLogs: true }));
    setErrors(prev => ({ ...prev, mlLogs: null }));

    try {
      const result = await api.getMLLogs({ limit: 100 });
      if (result && result.success) {
        const logs = result.data?.logs || result.data || [];
        setMlLogs(Array.isArray(logs) ? logs : []);
      } else {
        setMlLogs([]);
        setErrors(prev => ({ ...prev, mlLogs: result?.error || 'Failed to load ML logs' }));
      }
    } catch (error) {
      console.error('[loadMLLogs] Error:', error);
      setMlLogs([]);
      if (error.response?.status !== 429) {
        setErrors(prev => ({ ...prev, mlLogs: error.message || 'Failed to load ML logs' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, mlLogs: false }));
      requestFlags.current.mlLogs = false;
    }
  };

  /**
   * Load Security Logs - Use /security/logs/ endpoint
   */
  const loadSecurityLogs = async () => {
    if (collapsedPanels.securityLogs || !mounted || !authChecked || requestFlags.current.securityLogs) return;
    if (!api || !api.getSecurityLogs || typeof api.getSecurityLogs !== 'function') {
      setErrors(prev => ({ ...prev, securityLogs: 'API method not available' }));
      return;
    }

    requestFlags.current.securityLogs = true;
    setLoading(prev => ({ ...prev, securityLogs: true }));
    setErrors(prev => ({ ...prev, securityLogs: null }));

    try {
      const result = await api.getSecurityLogs({ limit: 100 });
      if (result && result.success) {
        const logs = result.data?.logs || result.data || [];
        setSecurityLogs(Array.isArray(logs) ? logs : []);
      } else {
        setSecurityLogs([]);
        setErrors(prev => ({ ...prev, securityLogs: result?.error || 'Failed to load security logs' }));
      }
    } catch (error) {
      console.error('[loadSecurityLogs] Error:', error);
      setSecurityLogs([]);
      if (error.response?.status !== 429) {
        setErrors(prev => ({ ...prev, securityLogs: error.message || 'Failed to load security logs' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, securityLogs: false }));
      requestFlags.current.securityLogs = false;
    }
  };

  /**
   * Load Health Scores - Use /ml/health/ endpoint
   */
  const loadHealthScores = async () => {
    if (collapsedPanels.health || !mounted || !authChecked || requestFlags.current.health) return;
    if (!api || !api.getMLHealth || typeof api.getMLHealth !== 'function') {
      setErrors(prev => ({ ...prev, health: 'API method not available' }));
      return;
    }

    requestFlags.current.health = true;
    setLoading(prev => ({ ...prev, health: true }));
    setErrors(prev => ({ ...prev, health: null }));

    try {
      const result = await api.getMLHealth();
      if (result && result.success) {
        setHealthScores(result.data);
      } else {
        setHealthScores({ status: 'unknown', uptime: 0, version: 'N/A' });
        setErrors(prev => ({ ...prev, health: result?.error || 'Failed to load health scores' }));
      }
    } catch (error) {
      console.error('[loadHealthScores] Error:', error);
      setHealthScores({ status: 'unknown', uptime: 0, version: 'N/A' });
      if (error.response?.status !== 429) {
        setErrors(prev => ({ ...prev, health: error.message || 'Failed to load health scores' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, health: false }));
      requestFlags.current.health = false;
    }
  };

  /**
   * Load Trades - Use /trades/ endpoint (NOT /admin/trades)
   * Aggregate for charts on frontend
   */
  const loadTrades = async () => {
    if (collapsedPanels.trades || !mounted || !authChecked || requestFlags.current.trades) return;
    if (!api || !api.getAllTrades || typeof api.getAllTrades !== 'function') {
      setErrors(prev => ({ ...prev, trades: 'API method not available' }));
      return;
    }

    requestFlags.current.trades = true;
    setLoading(prev => ({ ...prev, trades: true }));
    setErrors(prev => ({ ...prev, trades: null }));

    try {
      const result = await api.getAllTrades({ page_size: 100 });
      if (result && result.success) {
        const tradesData = Array.isArray(result.data) ? result.data : [];
        // Aggregate for charts
        const aggregated = api.aggregateTradesByTime(tradesData);
        setTrades(aggregated);
      } else {
        setTrades([]);
        setErrors(prev => ({ ...prev, trades: result?.error || 'Failed to load trades' }));
      }
    } catch (error) {
      console.error('[loadTrades] Error:', error);
      setTrades([]);
      if (error.response?.status !== 429) {
        setErrors(prev => ({ ...prev, trades: error.message || 'Failed to load trades' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, trades: false }));
      requestFlags.current.trades = false;
    }
  };

  /**
   * Load Money Flow - Use /api/analytics/global/ endpoint (EXACT path from backend)
   */
  const loadMoneyFlow = async () => {
    if (collapsedPanels.moneyFlow || !mounted || !authChecked || requestFlags.current.moneyFlow) return;
    if (!api || !api.getMoneyFlow || typeof api.getMoneyFlow !== 'function') {
      setErrors(prev => ({ ...prev, moneyFlow: 'API method not available' }));
      return;
    }

    requestFlags.current.moneyFlow = true;
    setLoading(prev => ({ ...prev, moneyFlow: true }));
    setErrors(prev => ({ ...prev, moneyFlow: null }));

    try {
      const result = await api.getMoneyFlow();
      if (result && result.success) {
        const data = result.data;
        // Plan B shape: { total_volume, money_flow_data: [{date, total_volume, revenue}] }
        if (data && typeof data === 'object' && Array.isArray(data.money_flow_data)) {
          setMoneyFlow(data.money_flow_data);
        } else if (Array.isArray(data)) {
          setMoneyFlow(data);
        } else if (data && typeof data === 'object') {
          // Fallback: try to coerce object entries into chart series
          const transformed = Object.entries(data).map(([date, value]) => ({
            date,
            revenue: typeof value === 'number' ? value : (value?.revenue || 0),
          }));
          setMoneyFlow(transformed);
        } else {
          setMoneyFlow([]);
        }
      } else {
        setMoneyFlow([]);
        setErrors(prev => ({ ...prev, moneyFlow: result?.error || 'Failed to load money flow' }));
      }
    } catch (error) {
      console.warn('[loadMoneyFlow] Error:', error);
      setMoneyFlow([]);
      if (error.response?.status !== 429) {
        setErrors(prev => ({ ...prev, moneyFlow: error.message || 'Failed to load money flow' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, moneyFlow: false }));
      requestFlags.current.moneyFlow = false;
    }
  };

  /**
   * Load Risky Users - Use /admin/suspicious/ endpoint
   */
  const loadRiskyUsers = async () => {
    if (collapsedPanels.riskyUsers || !mounted || !authChecked || requestFlags.current.riskyUsers) return;
    // Official API: /api/admin/suspicious/ for risky users/trades
    if (!api || !api.getSuspiciousActivity || typeof api.getSuspiciousActivity !== 'function') {
      setErrors(prev => ({ ...prev, riskyUsers: 'API method not available' }));
      return;
    }

    requestFlags.current.riskyUsers = true;
    setLoading(prev => ({ ...prev, riskyUsers: true }));
    setErrors(prev => ({ ...prev, riskyUsers: null }));

    try {
      const result = await api.getSuspiciousActivity({ limit: 100 });
      if (result && result.success) {
        const items = Array.isArray(result.data) ? result.data : [];
        // Backend may return mixed suspicious users/trades; keep it resilient
        const users = items.filter((x) => x && (x.username || x.user_id || x.id));
        setRiskyUsers(users);
      } else {
        setRiskyUsers([]);
        setErrors(prev => ({ ...prev, riskyUsers: result?.error || 'Failed to load risky users' }));
      }
    } catch (error) {
      console.error('[loadRiskyUsers] Error:', error);
      setRiskyUsers([]);
      if (error.response?.status !== 429) {
        setErrors(prev => ({ ...prev, riskyUsers: error.message || 'Failed to load risky users' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, riskyUsers: false }));
      requestFlags.current.riskyUsers = false;
    }
  };

  /**
   * Load Disputes - Use /disputes/ endpoint
   */
  const loadDisputes = async () => {
    if (collapsedPanels.disputes || !mounted || !authChecked || requestFlags.current.disputes) return;
    if (!api || !api.getDisputes || typeof api.getDisputes !== 'function') {
      setErrors(prev => ({ ...prev, disputes: 'API method not available' }));
      return;
    }
    
    requestFlags.current.disputes = true;
    setLoading(prev => ({ ...prev, disputes: true }));
    setErrors(prev => ({ ...prev, disputes: null }));

    try {
      const result = await api.getDisputes({ limit: 100 });
      if (result && result.success) {
        setDisputes(Array.isArray(result.data) ? result.data : []);
      } else {
        setDisputes([]);
        setErrors(prev => ({ ...prev, disputes: result?.error || 'Failed to load disputes' }));
      }
    } catch (error) {
      console.error('[loadDisputes] Error:', error);
      setDisputes([]);
      if (error.response?.status !== 429) {
        setErrors(prev => ({ ...prev, disputes: error.message || 'Failed to load disputes' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, disputes: false }));
      requestFlags.current.disputes = false;
    }
  };

  /**
   * Load Leaderboards - Use /analytics/weekly/, /analytics/monthly/
   */
  const loadLeaderboard = async (timeframe, cursor = null) => {
    if (collapsedPanels.leaderboard || !mounted || !authChecked || requestFlags.current.leaderboard) return;
    if (!api || !api.getLeaderboards || typeof api.getLeaderboards !== 'function') {
      setErrors(prev => ({ ...prev, leaderboard: 'API method not available' }));
      return;
    }

    requestFlags.current.leaderboard = true;
    setLoading(prev => ({ ...prev, leaderboard: true }));
    setErrors(prev => ({ ...prev, leaderboard: null }));

    try {
      const result = await api.getLeaderboards(timeframe, cursor);
      if (result && result.success) {
        const newData = Array.isArray(result.data) ? result.data : [];
        if (cursor) {
          setLeaderboardData(prev => [...prev, ...newData]);
        } else {
          setLeaderboardData(newData);
        }
        setLeaderboardCursor(result.nextCursor || null);
      } else {
        if (!cursor) setLeaderboardData([]);
        setErrors(prev => ({ ...prev, leaderboard: result?.error || 'Failed to load leaderboard' }));
      }
    } catch (error) {
      console.error('[loadLeaderboard] Error:', error);
      if (!cursor) setLeaderboardData([]);
      if (error.response?.status !== 429) {
        setErrors(prev => ({ ...prev, leaderboard: error.message || 'Failed to load leaderboard' }));
      }
    } finally {
      setLoading(prev => ({ ...prev, leaderboard: false }));
      requestFlags.current.leaderboard = false;
    }
  };

  // ========== DATA LOADING EFFECTS (Only after auth confirmed) ==========
  useEffect(() => {
    if (!mounted || !authChecked) return;
    if (!collapsedPanels.markets && !requestFlags.current.markets) loadMarkets();
  }, [collapsedPanels.markets, mounted, authChecked]);

  useEffect(() => {
    if (!mounted || !authChecked) return;
    if (!collapsedPanels.mlLogs && !requestFlags.current.mlLogs) loadMLLogs();
  }, [collapsedPanels.mlLogs, mounted, authChecked]);

  useEffect(() => {
    if (!mounted || !authChecked) return;
    if (!collapsedPanels.securityLogs && !requestFlags.current.securityLogs) loadSecurityLogs();
  }, [collapsedPanels.securityLogs, mounted, authChecked]);

  useEffect(() => {
    if (!mounted || !authChecked) return;
    if (!collapsedPanels.health && !requestFlags.current.health) loadHealthScores();
  }, [collapsedPanels.health, mounted, authChecked]);

  useEffect(() => {
    if (!mounted || !authChecked) return;
    if (!collapsedPanels.trades && !requestFlags.current.trades) loadTrades();
  }, [collapsedPanels.trades, mounted, authChecked]);

  useEffect(() => {
    if (!mounted || !authChecked) return;
    if (!collapsedPanels.moneyFlow && !requestFlags.current.moneyFlow) loadMoneyFlow();
  }, [collapsedPanels.moneyFlow, mounted, authChecked]);

  useEffect(() => {
    if (!mounted || !authChecked) return;
    if (!collapsedPanels.riskyUsers && !requestFlags.current.riskyUsers) loadRiskyUsers();
  }, [collapsedPanels.riskyUsers, mounted, authChecked]);

  useEffect(() => {
    if (!mounted || !authChecked) return;
    if (!collapsedPanels.disputes && !requestFlags.current.disputes) loadDisputes();
  }, [collapsedPanels.disputes, mounted, authChecked]);

  useEffect(() => {
    if (!mounted || !authChecked) return;
    if (!collapsedPanels.leaderboard && !requestFlags.current.leaderboard) {
      loadLeaderboard(leaderboardType);
    }
  }, [collapsedPanels.leaderboard, leaderboardType, mounted, authChecked]);

  // ========== UTILITY FUNCTIONS ==========
  const togglePanel = (panelId) => {
    setCollapsedPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId],
    }));
  };

  const handleLeaderboardTypeChange = (type) => {
    setLeaderboardType(type);
    setLeaderboardData([]);
    setLeaderboardCursor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/admin/login');
  };

  // ========== ACTION HANDLERS ==========

  /**
   * Handle Dispute Accept
   */
  const handleAcceptDispute = async (disputeId) => {
    if (!api || !api.acceptDispute || typeof api.acceptDispute !== 'function') {
      alert('API method not available');
      return;
    }

    try {
      const result = await api.acceptDispute(disputeId);
      if (result && result.success) {
        // Update dispute status in local state
        setDisputes(prev => prev.map(d => 
          d.id === disputeId ? { ...d, status: 'resolved' } : d
        ));
        // Reload disputes to get updated list
        requestFlags.current.disputes = false;
        loadDisputes();
      } else {
        alert(result?.error || 'Failed to accept dispute');
      }
    } catch (error) {
      console.error('[handleAcceptDispute] Error:', error);
      alert('Failed to accept dispute. Please try again.');
    }
  };

  /**
   * Handle Dispute Reject
   */
  const handleRejectDispute = async (disputeId) => {
    if (!api || !api.rejectDispute || typeof api.rejectDispute !== 'function') {
      alert('API method not available');
      return;
    }

    try {
      const result = await api.rejectDispute(disputeId);
      if (result && result.success) {
        // Update dispute status in local state
        setDisputes(prev => prev.map(d => 
          d.id === disputeId ? { ...d, status: 'rejected' } : d
        ));
        // Reload disputes to get updated list
        requestFlags.current.disputes = false;
        loadDisputes();
      } else {
        alert(result?.error || 'Failed to reject dispute');
      }
    } catch (error) {
      console.error('[handleRejectDispute] Error:', error);
      alert('Failed to reject dispute. Please try again.');
    }
  };

  /**
   * Handle User Unblock
   */
  const handleUnblockUser = async (userId) => {
    if (!api || !api.unblockUser || typeof api.unblockUser !== 'function') {
      alert('API method not available');
      return;
    }

    try {
      const result = await api.unblockUser(userId);
      if (result && result.success) {
        // Update user status in local state
        setRiskyUsers(prev => prev.map(u => 
          (u.id === userId || u.user_id === userId) ? { ...u, is_active: true, is_suspicious: false } : u
        ));
        // Reload users to get updated list
        requestFlags.current.riskyUsers = false;
        loadRiskyUsers();
      } else {
        alert(result?.error || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('[handleUnblockUser] Error:', error);
      alert('Failed to unblock user. Please try again.');
    }
  };

  /**
   * Handle User Permanent Ban
   */
  const handleBanUser = async (userId) => {
    if (!api || !api.banUser || typeof api.banUser !== 'function') {
      alert('API method not available');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to permanently ban this user? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const result = await api.banUser(userId);
      if (result && result.success) {
        // Remove user from local state
        setRiskyUsers(prev => prev.filter(u => (u.id !== userId && u.user_id !== userId)));
        // Reload users to get updated list
        requestFlags.current.riskyUsers = false;
        loadRiskyUsers();
      } else {
        alert(result?.error || 'Failed to ban user');
      }
    } catch (error) {
      console.error('[handleBanUser] Error:', error);
      alert('Failed to ban user. Please try again.');
    }
  };

  // ========== RENDER (Hydration-Safe) ==========
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If no user after auth check, redirect will happen
  if (!user) {
    return null;
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
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Logout
            </button>
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
          loading={loading.markets}
          error={errors.markets}
        >
          <div className="overflow-x-auto max-w-full">
            <Table
              headers={['ID', 'Title', 'Status', 'Liquidity']}
              data={markets.slice(0, 20)}
              renderRow={(market) => (
                <tr key={market.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{market.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{market.title || market.question || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      market.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {market.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(market.liquidity_pool || 0).toLocaleString()}</td>
                </tr>
              )}
              emptyMessage="No markets available"
            />
          </div>
        </Panel>

        {/* ML & Security Logs - CSS Grid with align-items: start */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ alignItems: 'start' }}>
          <Panel
            id="mlLogs"
            title="ML Logs"
            icon={Brain}
            collapsed={collapsedPanels.mlLogs}
            onToggle={() => togglePanel('mlLogs')}
            loading={loading.mlLogs}
            error={errors.mlLogs}
          >
            <div className="max-h-96 overflow-y-auto">
              <Table
                headers={['Timestamp', 'Type', 'Details']}
                data={mlLogs.slice(0, 20)}
                renderRow={(log, idx) => (
                  <tr key={log.id || idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{log.type || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.message || log.details || 'N/A'}</td>
                  </tr>
                )}
                emptyMessage="No ML logs available"
              />
            </div>
          </Panel>

          <Panel
            id="securityLogs"
            title="Security Logs"
            icon={Shield}
            collapsed={collapsedPanels.securityLogs}
            onToggle={() => togglePanel('securityLogs')}
            loading={loading.securityLogs}
            error={errors.securityLogs}
          >
            <div className="max-h-96 overflow-y-auto">
              <Table
                headers={['Timestamp', 'Event', 'Details']}
                data={securityLogs.slice(0, 20)}
                renderRow={(log, idx) => (
                  <tr key={log.id || idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{log.event || log.type || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.message || log.details || 'N/A'}</td>
                  </tr>
                )}
                emptyMessage="No security logs available"
              />
            </div>
          </Panel>
        </div>

        {/* Health & Performance Scores */}
        <Panel
          id="health"
          title="Health & Performance Scores"
          icon={Activity}
          collapsed={collapsedPanels.health}
          onToggle={() => togglePanel('health')}
          loading={loading.health}
          error={errors.health}
        >
          {healthScores && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{healthScores.status || 'unknown'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {healthScores.uptime ? `${Math.floor(healthScores.uptime / 86400)}d` : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Version</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthScores.version || 'N/A'}</p>
              </div>
            </div>
          )}
        </Panel>

        {/* Money Flow & Trade Analysis */}
        <Panel
          id="moneyFlow"
          title="Money Flow & Trade Analysis"
          icon={DollarSign}
          collapsed={collapsedPanels.moneyFlow}
          onToggle={() => togglePanel('moneyFlow')}
          loading={loading.moneyFlow || loading.trades}
          error={errors.moneyFlow || errors.trades}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trades Over Time</h3>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg h-64">
                {trades.length > 0 ? (
                  <TradesChart
                    data={trades.map(item => ({
                      date: item.date || new Date(item.timestamp || Date.now()).toLocaleDateString(),
                      count: item.count || 0,
                      volume: item.volume || 0,
                    }))}
                    loading={loading.trades}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No trade data available</div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Flow</h3>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg h-64">
                {moneyFlow.length > 0 ? (
                  <RevenueChart
                    data={moneyFlow.map((item, idx) => ({
                      date: item.date || new Date(item.timestamp || Date.now()).toLocaleDateString(),
                      revenue: item.revenue || 0,
                      cumulative: moneyFlow.slice(0, idx + 1).reduce((sum, i) => sum + (i.revenue || 0), 0),
                    }))}
                    loading={loading.moneyFlow}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No revenue data available</div>
                )}
              </div>
            </div>
          </div>
        </Panel>

        {/* Risky Users & Trades */}
        <Panel
          id="riskyUsers"
          title="Risky Users & Trades"
          icon={AlertTriangle}
          collapsed={collapsedPanels.riskyUsers}
          onToggle={() => togglePanel('riskyUsers')}
          loading={loading.riskyUsers}
          error={errors.riskyUsers}
        >
          <div className="overflow-x-auto max-w-full">
            <Table
              headers={['User', 'Risk Score', 'Status', 'Last Activity', 'Actions']}
              data={riskyUsers.slice(0, 20)}
              renderRow={(user) => {
                const userId = user.id || user.user_id;
                const isBlocked = user.status === 'BLOCKED' || user.is_active === false || user.is_suspicious;
                return (
                  <tr key={userId}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {user.username || `User ${userId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(user.risk_score || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isBlocked ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                        user.is_suspicious ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {isBlocked ? 'Blocked' : user.is_suspicious ? 'Suspicious' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isBlocked && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUnblockUser(userId)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                          >
                            Unblock
                          </button>
                          <button
                            onClick={() => handleBanUser(userId)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                          >
                            Ban
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }}
              emptyMessage="No risky users found"
            />
          </div>
        </Panel>

        {/* Disputes */}
        <Panel
          id="disputes"
          title="Disputes"
          icon={AlertCircle}
          collapsed={collapsedPanels.disputes}
          onToggle={() => togglePanel('disputes')}
          loading={loading.disputes}
          error={errors.disputes}
        >
          <div className="overflow-x-auto max-w-full">
            <Table
              headers={['ID', 'Status', 'Created', 'Details', 'Actions']}
              data={disputes}
              renderRow={(dispute, idx) => {
                const disputeId = dispute.id || idx + 1;
                const isPending = dispute.status === 'open' || dispute.status === 'pending' || !dispute.status;
                return (
                  <tr key={disputeId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{disputeId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isPending ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                        dispute.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {dispute.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dispute.created_at ? new Date(dispute.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{dispute.description || dispute.details || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isPending && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptDispute(disputeId)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectDispute(disputeId)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }}
              emptyMessage="No disputes available"
            />
          </div>
        </Panel>

        {/* Leaderboards */}
        <Panel
          id="leaderboard"
          title="Leaderboards"
          icon={Trophy}
          collapsed={collapsedPanels.leaderboard}
          onToggle={() => togglePanel('leaderboard')}
          loading={loading.leaderboard}
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
          <div className="overflow-x-auto max-w-full">
            <Table
              headers={['Rank', 'User', 'Volume', 'Trades', 'Points']}
              data={leaderboardData}
              renderRow={(entry, idx) => (
                <tr key={entry.user_id || idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {entry.rank || idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {entry.username || `User ${entry.user_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(entry.volume || entry.all_time_volume || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.trade_count || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.total_points || 0}</td>
                </tr>
              )}
              emptyMessage={`No ${leaderboardType} leaderboard data available`}
            />
          </div>
          {leaderboardCursor && (
            <div className="mt-4 text-center">
              <button
                onClick={() => loadLeaderboard(leaderboardType, leaderboardCursor)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Load More
              </button>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

// ========== REUSABLE COMPONENTS ==========

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

function Table({ headers, data, renderRow, emptyMessage }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage || 'No data available'}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-w-full">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, idx) => renderRow(item, idx))}
        </tbody>
      </table>
    </div>
  );
}

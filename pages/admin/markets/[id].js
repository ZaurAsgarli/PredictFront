import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../src/admin/layouts/AdminLayout';
import AdminTable from '../../../src/admin/components/AdminTable';
import { adminApi } from '../../../src/admin/services/adminApi';
import { ArrowLeft, CheckCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function MarketDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [market, setMarket] = useState(null);
  const [trades, setTrades] = useState([]);
  const [positions, setPositions] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (id) {
      loadMarketData();
    }
  }, [id]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const [marketData, tradesData, positionsData] = await Promise.all([
        adminApi.getMarketById(id).catch(() => null),
        adminApi.getMarketTrades(id).catch(() => ({ results: [] })),
        adminApi.getMarketPositions(id).catch(() => ({ results: [] })),
      ]);

      setMarket(marketData);
      setTrades(tradesData.results || tradesData || []);
      setPositions(positionsData.results || positionsData || []);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    const outcome = prompt('Enter outcome (YES or NO):');
    if (!outcome || !['YES', 'NO'].includes(outcome.toUpperCase())) {
      alert('Invalid outcome. Please enter YES or NO.');
      return;
    }

    if (!confirm(`Are you sure you want to resolve this market as ${outcome.toUpperCase()}?`)) {
      return;
    }

    try {
      setResolving(true);
      await adminApi.resolveMarket(id, outcome.toUpperCase());
      alert('Market resolved successfully!');
      loadMarketData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resolve market');
    } finally {
      setResolving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US');
  };

  const priceHistoryData = [
    { time: 'Day 1', yes: 0.45, no: 0.55 },
    { time: 'Day 2', yes: 0.52, no: 0.48 },
    { time: 'Day 3', yes: 0.48, no: 0.52 },
    { time: 'Day 4', yes: 0.55, no: 0.45 },
    { time: 'Day 5', yes: 0.58, no: 0.42 },
    { time: 'Day 6', yes: 0.62, no: 0.38 },
    { time: 'Day 7', yes: 0.65, no: 0.35 },
  ];

  const tradesColumns = [
    { header: 'User', accessor: 'user', render: (row) => row.user?.username || row.user_id || 'N/A' },
    { header: 'Type', accessor: 'type', render: (row) => <span className="uppercase">{row.type || 'N/A'}</span> },
    { header: 'Outcome', accessor: 'outcome', render: (row) => <span className="uppercase">{row.outcome || 'N/A'}</span> },
    { header: 'Amount', accessor: 'amount', render: (row) => `$${(row.amount || 0).toFixed(2)}` },
    { header: 'Tokens', accessor: 'tokens', render: (row) => (row.tokens || 0).toFixed(2) },
    { header: 'Price', accessor: 'price', render: (row) => `$${(row.price || row.execution_price || 0).toFixed(2)}` },
    { header: 'Date', accessor: 'created_at', render: (row) => formatDate(row.created_at || row.timestamp) },
  ];

  const positionsColumns = [
    { header: 'User', accessor: 'user', render: (row) => row.user?.username || row.user_id || 'N/A' },
    { header: 'Outcome', accessor: 'outcome', render: (row) => <span className="uppercase">{row.outcome || 'N/A'}</span> },
    { header: 'Shares', accessor: 'shares', render: (row) => (row.shares || row.quantity || 0).toFixed(2) },
    { header: 'Value', accessor: 'value', render: (row) => `$${(row.value || 0).toFixed(2)}` },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading market data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!market) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Market Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The market you're looking for doesn't exist.</p>
          <Link href="/admin/markets" className="text-primary-600 dark:text-primary-400 hover:underline">
            Back to Markets
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/markets"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{market.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Market ID: {market.id}</p>
          </div>
          {market.status?.toLowerCase() === 'active' && (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              {resolving ? 'Resolving...' : 'Resolve Market'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {[
                { id: 'details', label: 'Details' },
                { id: 'trades', label: 'Trades' },
                { id: 'positions', label: 'Positions' },
                { id: 'price', label: 'Price History' },
                { id: 'resolve', label: 'Resolve' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{market.category || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        market.status?.toLowerCase() === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}
                    >
                      {market.status || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ends At</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(market.ends_at)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created At</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(market.created_at)}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                  <p className="text-gray-900 dark:text-white">{market.description || 'No description provided.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">YES Price</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${(market.yes_price || market.yesPrice || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400 rotate-180" />
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">NO Price</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${(market.no_price || market.noPrice || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trades Tab */}
            {activeTab === 'trades' && (
              <AdminTable
                columns={tradesColumns}
                data={trades}
                loading={false}
                emptyMessage="No trades found for this market"
              />
            )}

            {/* Positions Tab */}
            {activeTab === 'positions' && (
              <AdminTable
                columns={positionsColumns}
                data={positions}
                loading={false}
                emptyMessage="No positions found for this market"
              />
            )}

            {/* Price History Tab */}
            {activeTab === 'price' && (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
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
            )}

            {/* Resolve Tab */}
            {activeTab === 'resolve' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Resolve Market</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Once resolved, the market will be closed and all positions will be settled. This action cannot be
                    undone.
                  </p>
                </div>
                <button
                  onClick={handleResolve}
                  disabled={resolving || market.status?.toLowerCase() !== 'active'}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {resolving ? 'Resolving...' : 'Resolve Market'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}



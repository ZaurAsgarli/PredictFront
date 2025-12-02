import { useState, useEffect } from 'react';
import AdminLayout from '../../src/admin/layouts/AdminLayout';
import AdminTable from '../../src/admin/components/AdminTable';
import { adminApi } from '../../src/admin/services/adminApi';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTrades();
      const tradesList = data.results || data || [];
      setTrades(tradesList);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrades = trades.filter(
    (trade) =>
      trade.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.market?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.outcome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US');
  };

  const columns = [
    {
      header: 'User',
      accessor: 'user',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
            {row.user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-gray-900 dark:text-white">
            {row.user?.username || row.user_id || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Market',
      accessor: 'market',
      render: (row) => (
        <div className="max-w-xs truncate" title={row.market?.title || row.market_id}>
          {row.market?.title || row.market_id || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Outcome',
      accessor: 'outcome',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.outcome?.toUpperCase() === 'YES'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {row.outcome || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.type?.toLowerCase() === 'buy' ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className="uppercase text-gray-900 dark:text-white">{row.type || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Amount Staked',
      accessor: 'amount',
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ${(row.amount || row.stake || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Tokens Received',
      accessor: 'tokens',
      render: (row) => (
        <span className="text-gray-900 dark:text-white">{(row.tokens || row.shares || 0).toFixed(2)}</span>
      ),
    },
    {
      header: 'Execution Price',
      accessor: 'price',
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ${(row.price || row.execution_price || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(row.created_at || row.timestamp)}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trades</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all trading activity</p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trades by user, market, or outcome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{trades.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ${trades.reduce((sum, t) => sum + (t.amount || t.stake || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Buy Orders</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {trades.filter((t) => t.type?.toLowerCase() === 'buy').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Sell Orders</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {trades.filter((t) => t.type?.toLowerCase() === 'sell').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filteredTrades}
          loading={loading}
          emptyMessage="No trades found"
        />
      </div>
    </AdminLayout>
  );
}



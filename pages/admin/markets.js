import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '../../src/admin/layouts/AdminLayout';
import AdminTable from '../../src/admin/components/AdminTable';
import { adminApi } from '../../src/admin/services/adminApi';
import { Eye, CheckCircle, Plus, Search } from 'lucide-react';

export default function AdminMarkets() {
  const router = useRouter();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getMarkets();
      const marketsList = data.results || data || [];
      setMarkets(marketsList);
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (marketId) => {
    if (!confirm('Are you sure you want to resolve this market?')) return;

    try {
      const outcome = prompt('Enter outcome (YES or NO):');
      if (!outcome || !['YES', 'NO'].includes(outcome.toUpperCase())) {
        alert('Invalid outcome. Please enter YES or NO.');
        return;
      }

      await adminApi.resolveMarket(marketId, outcome.toUpperCase());
      alert('Market resolved successfully!');
      loadMarkets();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resolve market');
    }
  };

  const filteredMarkets = markets.filter((market) =>
    market.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      resolved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusColors[status?.toLowerCase()] || statusColors.closed
        }`}
      >
        {status || 'Unknown'}
      </span>
    );
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (row) => (
        <div className="max-w-xs truncate" title={row.title}>
          {row.title}
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Ends At',
      accessor: 'ends_at',
      render: (row) => formatDate(row.ends_at),
    },
    {
      header: 'YES Price',
      accessor: 'yes_price',
      render: (row) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          ${(row.yes_price || row.yesPrice || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'NO Price',
      accessor: 'no_price',
      render: (row) => (
        <span className="font-medium text-red-600 dark:text-red-400">
          ${(row.no_price || row.noPrice || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/markets/${row.id}`}
            className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {row.status?.toLowerCase() === 'active' && (
            <button
              onClick={() => handleResolve(row.id)}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Resolve Market"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Markets</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage prediction markets</p>
          </div>
          <Link
            href="/admin/markets/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Market
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filteredMarkets}
          loading={loading}
          emptyMessage="No markets found"
        />
      </div>
    </AdminLayout>
  );
}



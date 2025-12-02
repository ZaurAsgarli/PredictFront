import { useState, useEffect } from 'react';
import AdminLayout from '../../src/admin/layouts/AdminLayout';
import AdminTable from '../../src/admin/components/AdminTable';
import { adminApi } from '../../src/admin/services/adminApi';
import { Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDisputes();
      const disputesList = data.results || data || [];
      setDisputes(disputesList);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId, action) => {
    if (!confirm(`Are you sure you want to ${action} this dispute?`)) return;

    try {
      setProcessing(disputeId);
      await adminApi.resolveDispute(disputeId, action);
      alert(`Dispute ${action}ed successfully!`);
      loadDisputes();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} dispute`);
    } finally {
      setProcessing(null);
    }
  };

  const filteredDisputes = disputes.filter(
    (dispute) =>
      dispute.market?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        label: 'Pending',
      },
      approved: {
        bg: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        label: 'Approved',
      },
      rejected: {
        bg: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        label: 'Rejected',
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
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
      header: 'Bond Amount',
      accessor: 'bond_amount',
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ${(row.bond_amount || row.bond || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <div className="max-w-md truncate" title={row.reason || row.description}>
          {row.reason || row.description || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(row.created_at || row.timestamp)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => {
        if (row.status?.toLowerCase() !== 'pending') {
          return <span className="text-gray-400 text-sm">Resolved</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResolve(row.id, 'approve')}
              disabled={processing === row.id}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Approve"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleResolve(row.id, 'reject')}
              disabled={processing === row.id}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Reject"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const pendingCount = disputes.filter((d) => d.status?.toLowerCase() === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Disputes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage market disputes</p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search disputes by market, user, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Disputes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{disputes.length}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {disputes.filter((d) => d.status?.toLowerCase() === 'approved').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {disputes.filter((d) => d.status?.toLowerCase() === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filteredDisputes}
          loading={loading}
          emptyMessage="No disputes found"
        />
      </div>
    </AdminLayout>
  );
}



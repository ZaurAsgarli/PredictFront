import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import AdminAuthGuard from '../../src/admin/components/AdminAuthGuard';
import AdminTable from '../../src/admin/components/AdminTable';
import { adminApi } from '../../src/admin/services/adminApi';
import { format } from 'date-fns';

export default function DisputesManagement() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolving, setResolving] = useState(null);

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDisputes();
      let disputesList = data.results || data || [];
      
      if (statusFilter !== 'all') {
        disputesList = disputesList.filter(d => d.status === statusFilter);
      }
      
      setDisputes(disputesList);
    } catch (error) {
      console.error('Error loading disputes:', error);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId, action) => {
    if (!confirm(`Are you sure you want to ${action} this dispute?`)) return;

    try {
      setResolving(disputeId);
      await adminApi.resolveDispute(disputeId, action);
      alert(`Dispute ${action}d successfully!`);
      loadDisputes();
    } catch (error) {
      alert(error.response?.data?.message || `Error ${action}ing dispute`);
    } finally {
      setResolving(null);
    }
  };

  const filteredDisputes = disputes.filter((dispute) =>
    dispute.market?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headers = ['Market', 'User', 'Bond Amount', 'Reason', 'Status', 'Actions'];

  const renderRow = (dispute) => (
    <>
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
        {dispute.market?.title || dispute.market_id || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {dispute.user?.username || dispute.user_id || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ${dispute.bond_amount ? parseFloat(dispute.bond_amount).toFixed(2) : '0.00'}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
        {dispute.reason || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          dispute.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          dispute.status === 'approved' ? 'bg-green-100 text-green-800' :
          dispute.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {dispute.status || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {dispute.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResolve(dispute.id, 'approve')}
              disabled={resolving === dispute.id}
              className="text-green-600 hover:text-green-800 flex items-center gap-1 disabled:opacity-50"
            >
              <CheckCircle size={16} />
              Approve
            </button>
            <button
              onClick={() => handleResolve(dispute.id, 'reject')}
              disabled={resolving === dispute.id}
              className="text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
            >
              <XCircle size={16} />
              Reject
            </button>
          </div>
        ) : (
          <span className="text-gray-400">Resolved</span>
        )}
      </td>
    </>
  );

  const pendingCount = disputes.filter(d => d.status === 'pending').length;

  return (
    <AdminAuthGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
            <p className="text-gray-600 mt-1">Review and resolve market disputes</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {pendingCount} pending dispute{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by market or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <AdminTable
          headers={headers}
          data={filteredDisputes}
          loading={loading}
          renderRow={renderRow}
          emptyMessage="No disputes found"
        />
      </div>
    </AdminAuthGuard>
  );
}



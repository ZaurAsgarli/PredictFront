import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, CheckCircle, Plus, Search, Filter } from 'lucide-react';
import AdminAuthGuard from '../../../src/admin/components/AdminAuthGuard';
import AdminTable from '../../../src/admin/components/AdminTable';
import { adminApi } from '../../../src/admin/services/adminApi';
import { format } from 'date-fns';

export default function MarketsList() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadMarkets();
  }, [statusFilter]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await adminApi.getMarkets(params);
      setMarkets(data.results || data || []);
    } catch (error) {
      console.error('Error loading markets:', error);
      setMarkets([]);
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
      alert(error.response?.data?.message || 'Error resolving market');
    }
  };

  const filteredMarkets = markets.filter((market) =>
    market.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headers = ['ID', 'Title', 'Category', 'Status', 'Ends At', 'YES Price', 'NO Price', 'Actions'];

  const renderRow = (market) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{market.id}</td>
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{market.title}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{market.category || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          market.status === 'active' ? 'bg-green-100 text-green-800' :
          market.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {market.status || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {market.ends_at ? format(new Date(market.ends_at), 'MMM dd, yyyy') : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {market.yes_price ? `$${parseFloat(market.yes_price).toFixed(2)}` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {market.no_price ? `$${parseFloat(market.no_price).toFixed(2)}` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/markets/${market.id}`}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Eye size={16} />
            View
          </Link>
          {market.status === 'active' && (
            <button
              onClick={() => handleResolve(market.id)}
              className="text-green-600 hover:text-green-800 flex items-center gap-1"
            >
              <CheckCircle size={16} />
              Resolve
            </button>
          )}
        </div>
      </td>
    </>
  );

  return (
    <AdminAuthGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Markets</h1>
            <p className="text-gray-600 mt-1">Manage prediction markets</p>
          </div>
          <Link
            href="/admin/markets/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Market
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search markets..."
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
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <AdminTable
          headers={headers}
          data={filteredMarkets}
          loading={loading}
          renderRow={renderRow}
          emptyMessage="No markets found"
        />
      </div>
    </AdminAuthGuard>
  );
}



import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import AdminAuthGuard from '../../src/admin/components/AdminAuthGuard';
import AdminTable from '../../src/admin/components/AdminTable';
import { adminApi } from '../../src/admin/services/adminApi';
import { format } from 'date-fns';

export default function TradesManagement() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');

  useEffect(() => {
    loadTrades();
  }, [typeFilter, outcomeFilter]);

  const loadTrades = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (outcomeFilter !== 'all') params.outcome = outcomeFilter;
      
      const data = await adminApi.getTrades(params);
      setTrades(data.results || data || []);
    } catch (error) {
      console.error('Error loading trades:', error);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = 
      trade.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.market?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const headers = ['User', 'Market', 'Outcome', 'Type', 'Amount Staked', 'Tokens Received', 'Execution Price', 'Timestamp'];

  const renderRow = (trade) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {trade.user?.username || trade.user_id || 'N/A'}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
        {trade.market?.title || trade.market_id || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${
          trade.outcome === 'YES' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {trade.outcome === 'YES' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trade.outcome}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
        {trade.type || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ${trade.amount_staked ? parseFloat(trade.amount_staked).toFixed(2) : '0.00'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {trade.tokens_received || '0'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${trade.execution_price ? parseFloat(trade.execution_price).toFixed(2) : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {trade.timestamp ? format(new Date(trade.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
      </td>
    </>
  );

  return (
    <AdminAuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trades</h1>
          <p className="text-gray-600 mt-1">View and manage all trades</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by user or market..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Outcomes</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
          </div>
        </div>

        <AdminTable
          headers={headers}
          data={filteredTrades}
          loading={loading}
          renderRow={renderRow}
          emptyMessage="No trades found"
        />
      </div>
    </AdminAuthGuard>
  );
}



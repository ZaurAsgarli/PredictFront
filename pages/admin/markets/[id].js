import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, CheckCircle, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import AdminAuthGuard from '../../../src/admin/components/AdminAuthGuard';
import AdminTable from '../../../src/admin/components/AdminTable';
import Link from 'next/link';
import { adminApi } from '../../../src/admin/services/adminApi';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MarketDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [market, setMarket] = useState(null);
  const [trades, setTrades] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [resolving, setResolving] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    if (id) {
      loadMarketData();
    }
  }, [id]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const [marketData, tradesData, positionsData] = await Promise.all([
        adminApi.getMarket(id).catch(() => null),
        adminApi.getMarketTrades(id).catch(() => ({ results: [] })),
        adminApi.getMarketPositions(id).catch(() => ({ results: [] })),
      ]);

      setMarket(marketData);
      setTrades(tradesData.results || tradesData || []);
      setPositions(positionsData.results || positionsData || []);

      // Mock price history data (replace with actual API call when available)
      setPriceHistory(generateMockPriceHistory());
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPriceHistory = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: format(date, 'MMM dd'),
        yes: 0.4 + Math.random() * 0.2,
        no: 0.4 + Math.random() * 0.2,
      });
    }
    return data;
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
      alert(error.response?.data?.message || 'Error resolving market');
    } finally {
      setResolving(false);
    }
  };

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'trades', label: 'Trades' },
    { id: 'positions', label: 'Positions' },
    { id: 'price-history', label: 'Price History' },
    { id: 'resolve', label: 'Resolve Market' },
  ];

  if (loading && !market) {
    return (
      <AdminAuthGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading market data...</p>
          </div>
        </div>
      </AdminAuthGuard>
    );
  }

  if (!market) {
    return (
      <AdminAuthGuard>
        <div className="text-center py-12">
          <p className="text-gray-600">Market not found</p>
          <Link href="/admin/markets" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to markets
          </Link>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/markets"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{market.title}</h1>
            <p className="text-gray-600 mt-1">Market ID: {market.id}</p>
          </div>
        </div>

        {/* Market Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">YES Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${market.yes_price ? parseFloat(market.yes_price).toFixed(2) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">NO Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${market.no_price ? parseFloat(market.no_price).toFixed(2) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{market.status}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trades</p>
                <p className="text-lg font-semibold text-gray-900">{trades.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-900">{market.description || 'No description'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                    <p className="text-gray-900">{market.category || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Ends At</h3>
                    <p className="text-gray-900">
                      {market.ends_at ? format(new Date(market.ends_at), 'PPpp') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
                    <p className="text-gray-900">
                      {market.created_at ? format(new Date(market.created_at), 'PPpp') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Starting Liquidity</h3>
                    <p className="text-gray-900">
                      {market.starting_liquidity ? `$${market.starting_liquidity}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Trades Tab */}
            {activeTab === 'trades' && (
              <AdminTable
                headers={['User', 'Outcome', 'Type', 'Amount', 'Tokens', 'Price', 'Timestamp']}
                data={trades}
                loading={loading}
                renderRow={(trade) => (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.user?.username || trade.user_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trade.outcome === 'YES' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.outcome}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {trade.type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${trade.amount_staked ? parseFloat(trade.amount_staked).toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.tokens_received || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${trade.execution_price ? parseFloat(trade.execution_price).toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trade.timestamp ? format(new Date(trade.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </td>
                  </>
                )}
                emptyMessage="No trades found"
              />
            )}

            {/* Positions Tab */}
            {activeTab === 'positions' && (
              <AdminTable
                headers={['User', 'Outcome', 'Tokens', 'Value']}
                data={positions}
                loading={loading}
                renderRow={(position) => (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {position.user?.username || position.user_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        position.outcome === 'YES' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {position.outcome}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {position.tokens || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${position.value ? parseFloat(position.value).toFixed(2) : 'N/A'}
                    </td>
                  </>
                )}
                emptyMessage="No positions found"
              />
            )}

            {/* Price History Tab */}
            {activeTab === 'price-history' && (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="yes" stroke="#10b981" name="YES Price" />
                    <Line type="monotone" dataKey="no" stroke="#ef4444" name="NO Price" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Resolve Tab */}
            {activeTab === 'resolve' && (
              <div className="max-w-md mx-auto text-center space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <CheckCircle className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolve Market</h3>
                  <p className="text-sm text-gray-600">
                    Once resolved, this market will be closed and no more trades will be allowed.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Status:</p>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      market.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {market.status}
                    </span>
                  </div>
                  {market.status === 'active' && (
                    <button
                      onClick={handleResolve}
                      disabled={resolving}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      {resolving ? 'Resolving...' : 'Resolve Market'}
                    </button>
                  )}
                  {market.status !== 'active' && (
                    <p className="text-sm text-gray-500">
                      This market has already been resolved or closed.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}


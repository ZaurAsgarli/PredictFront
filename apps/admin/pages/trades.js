import { useState, useEffect } from 'react';
import { ShoppingCart, Search } from 'lucide-react';
import AdminAuthGuardWrapper from '../components/AdminAuthGuardWrapper';
import { adminApi } from '../../../src/admin/services/adminApi';

export default function TradesPage() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTrades();
    }, []);

    const loadTrades = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getTrades();
            setTrades(response.results || response || []);
        } catch (error) {
            console.error('Error loading trades:', error);
            setTrades([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredTrades = Array.isArray(trades)
        ? trades.filter(t =>
            t.market_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.user?.toString().includes(searchTerm)
        )
        : [];

    return (
        <AdminAuthGuardWrapper>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Trades</h1>
                    <p className="text-gray-600 mt-1">View all trades on the platform</p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search trades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Trades Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading trades...</p>
                        </div>
                    ) : filteredTrades.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTrades.map((trade) => (
                                    <tr key={trade.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500">#{trade.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{trade.market_title || (typeof trade.market === 'object' ? trade.market?.title : trade.market) || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-500">{trade.user_username || (typeof trade.user === 'object' ? trade.user?.username : trade.user) || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${trade.position === 'YES'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {trade.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">${trade.amount}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(trade.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center">
                            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No trades found</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminAuthGuardWrapper>
    );
}

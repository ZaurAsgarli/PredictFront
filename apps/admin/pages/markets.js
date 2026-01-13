import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Plus, Search, Eye, Edit2 } from 'lucide-react';
import AdminAuthGuardWrapper from '../components/AdminAuthGuardWrapper';
import { adminApi } from '../../../src/admin/services/adminApi';

export default function MarketsPage() {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMarkets();
    }, []);

    const loadMarkets = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getMarkets();
            setMarkets(response.results || response || []);
        } catch (error) {
            console.error('Error loading markets:', error);
            setMarkets([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredMarkets = Array.isArray(markets)
        ? markets.filter(m =>
            m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof m.category === 'object' ? m.category?.name : m.category)?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <AdminAuthGuardWrapper>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Markets</h1>
                        <p className="text-gray-600 mt-1">Manage prediction markets</p>
                    </div>
                    <Link
                        href="/markets/create"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Create Market
                    </Link>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search markets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Markets Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading markets...</p>
                        </div>
                    ) : filteredMarkets.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yes Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMarkets.map((market) => (
                                    <tr key={market.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{market.title}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{typeof market.category === 'object' ? market.category?.name : market.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${market.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : market.status === 'resolved'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {market.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{market.yes_price || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/markets/${market.id}`}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <Link
                                                    href={`/markets/${market.id}/edit`}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center">
                            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No markets found</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminAuthGuardWrapper>
    );
}

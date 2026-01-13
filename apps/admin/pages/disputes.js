import { useState, useEffect } from 'react';
import { AlertTriangle, Search, CheckCircle, XCircle } from 'lucide-react';
import AdminAuthGuardWrapper from '../components/AdminAuthGuardWrapper';
import { adminApi } from '../../../src/admin/services/adminApi';

export default function DisputesPage() {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadDisputes();
    }, []);

    const loadDisputes = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getDisputes();
            setDisputes(response.results || response || []);
        } catch (error) {
            console.error('Error loading disputes:', error);
            setDisputes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id, action) => {
        try {
            await adminApi.resolveDispute(id, action);
            loadDisputes();
        } catch (error) {
            console.error('Error resolving dispute:', error);
        }
    };

    const filteredDisputes = Array.isArray(disputes)
        ? disputes.filter(d =>
            d.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.status?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <AdminAuthGuardWrapper>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
                    <p className="text-gray-600 mt-1">Review and resolve market disputes</p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search disputes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Disputes Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading disputes...</p>
                        </div>
                    ) : filteredDisputes.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDisputes.map((dispute) => (
                                    <tr key={dispute.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500">#{dispute.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{dispute.market_title || (typeof dispute.market === 'object' ? dispute.market?.title : dispute.market) || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{dispute.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${dispute.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : dispute.status === 'resolved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {dispute.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(dispute.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {dispute.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleResolve(dispute.id, 'approve')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolve(dispute.id, 'reject')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center">
                            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No disputes found</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminAuthGuardWrapper>
    );
}

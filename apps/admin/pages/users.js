import { useState, useEffect } from 'react';
import { Users, Search, Ban, Shield, Eye } from 'lucide-react';
import AdminAuthGuardWrapper from '../components/AdminAuthGuardWrapper';
import { adminApi } from '../lib/api';
import { renderAddress } from '../../../lib/utils/wallet';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            // Fetch ALL users using pagination
            const allUsers = await adminApi.getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId, reason) => {
        if (!confirm(`Are you sure you want to block user ${userId}?`)) return;
        // TODO: Implement when backend endpoint is available
        alert(`Block user ${userId} with reason: ${reason}\n\nNote: Backend endpoint not yet implemented`);
    };

    const filteredUsers = Array.isArray(users)
        ? users.filter(u =>
            u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <AdminAuthGuardWrapper>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600 mt-1">Manage platform users</p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading users...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet (Admin)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Points</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Volume</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id || index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                    {user.username?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <span className="font-medium text-gray-900">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{user.email || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'WHALE' ? 'bg-blue-100 text-blue-800' :
                                                user.role === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.role || 'TRADER'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                user.role === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role === 'BLOCKED' ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Wallet Address (Admin Only)</p>
                                                <p className="text-gray-900 font-mono text-xs">
                                                    {user.wallet_address ? renderAddress(user.wallet_address, 'admin') : 'Not connected'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                            {parseFloat(user.total_points || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            ${parseFloat(user.total_volume || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleBlockUser(user.id || user.user_id, 'Admin action')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    title="Block User"
                                                >
                                                    <Ban size={16} />
                                                </button>
                                                <Link
                                                    href={`/users/${user.id || user.user_id}`}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No users found</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminAuthGuardWrapper>
    );
}

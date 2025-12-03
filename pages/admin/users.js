import { useState, useEffect } from 'react';
import { Search, Trophy, TrendingUp, Flame, ShoppingCart } from 'lucide-react';
import AdminAuthGuard from '../../src/admin/components/AdminAuthGuard';
import AdminTable from '../../src/admin/components/AdminTable';
import { adminApi } from '../../src/admin/services/adminApi';
import Link from 'next/link';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data.results || data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headers = ['Username', 'Email', 'Total Points', 'Win Rate', 'Streak', 'Trades Count'];

  const renderRow = (user) => (
    <>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-3">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <Link
              href={`/profile?user=${user.id}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600"
            >
              {user.username || 'N/A'}
            </Link>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-900">{user.total_points || 0}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-900">
            {user.win_rate ? `${(user.win_rate * 100).toFixed(1)}%` : '0%'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-gray-900">{user.streak || 0}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <ShoppingCart className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-900">{user.trades_count || 0}</span>
        </div>
      </td>
    </>
  );

  return (
    <AdminAuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage platform users</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <AdminTable
          headers={headers}
          data={filteredUsers}
          loading={loading}
          renderRow={renderRow}
          emptyMessage="No users found"
        />
      </div>
    </AdminAuthGuard>
  );
}



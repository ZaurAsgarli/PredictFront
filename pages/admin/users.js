import { useState, useEffect } from 'react';
import AdminLayout from '../../src/admin/layouts/AdminLayout';
import AdminTable from '../../src/admin/components/AdminTable';
import { adminApi } from '../../src/admin/services/adminApi';
import { Search, Trophy, TrendingUp, Flame } from 'lucide-react';

export default function AdminUsers() {
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
      const usersList = data.results || data || [];
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateWinRate = (user) => {
    if (!user.total_predictions || user.total_predictions === 0) return '0%';
    const wins = user.correct_predictions || 0;
    return ((wins / user.total_predictions) * 100).toFixed(1) + '%';
  };

  const columns = [
    {
      header: 'Username',
      accessor: 'username',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
            {row.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.username || 'N/A'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.email || ''}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Total Points',
      accessor: 'total_points',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="font-semibold text-gray-900 dark:text-white">
            {(row.total_points || row.points || 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Win Rate',
      accessor: 'win_rate',
      render: (row) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-gray-900 dark:text-white">{calculateWinRate(row)}</span>
        </div>
      ),
    },
    {
      header: 'Streak',
      accessor: 'streak',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-gray-900 dark:text-white">{row.streak || row.current_streak || 0}</span>
        </div>
      ),
    },
    {
      header: 'Trades Count',
      accessor: 'trades_count',
      render: (row) => (
        <span className="text-gray-900 dark:text-white">
          {row.trades_count || row.total_trades || row.total_predictions || 0}
        </span>
      ),
    },
    {
      header: 'Rank',
      accessor: 'rank',
      render: (row) => (
        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 rounded-full text-sm font-medium">
          #{row.rank || 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view user statistics</p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{users.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {users.filter((u) => (u.trades_count || u.total_trades || 0) > 0).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {users.reduce((sum, u) => sum + (u.total_points || u.points || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Win Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {users.length > 0
                ? (
                    users.reduce((sum, u) => {
                      const rate = parseFloat(calculateWinRate(u));
                      return sum + (isNaN(rate) ? 0 : rate);
                    }, 0) / users.length
                  ).toFixed(1) + '%'
                : '0%'}
            </p>
          </div>
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyMessage="No users found"
        />
      </div>
    </AdminLayout>
  );
}



import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, Mail, Calendar, Award, TrendingUp, Trophy, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { authService } from '../src/services/auth';
import { predictionsService } from '../src/services/predictions';
import { leaderboardService } from '../src/services/leaderboard';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getCurrentUserSync();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadProfileData(currentUser.id);
  }, []);

  const loadProfileData = async (userId) => {
    try {
      const [statsData, rankData] = await Promise.all([
        predictionsService.getPredictionStats(userId).catch(() => ({
          total: 0,
          win_rate: 0,
          total_points: 0,
          current_streak: 0,
          achievements: 0,
        })),
        leaderboardService.getUserRank(userId).catch(() => ({
          rank: 0,
          total_points: 0,
          win_rate: 0,
          total_predictions: 0,
          current_streak: 0,
        })),
      ]);
      setStats(statsData);
      setRank(rankData);
      
      // Also refresh user data from API
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg mb-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-32" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-16">
              <div className="flex items-end">
                <div className="h-32 w-32 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary-600">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-6 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user?.username}
                  </h1>
                  {rank && (
                    <p className="text-gray-600 dark:text-gray-400">
                      Rank #{rank.rank} • {(rank.total_points ?? 0).toLocaleString()} points
                    </p>
                  )}
                </div>
              </div>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail className="h-5 w-5 mr-2" />
                {user?.email}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Calendar className="h-5 w-5 mr-2" />
                Joined {user?.created_at || user?.date_joined ? format(new Date(user.created_at || user.date_joined), 'MMM yyyy') : 'N/A'}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Trophy className="h-5 w-5 mr-2" />
                {stats?.achievements || 0} Achievements
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Predictions
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.win_rate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_points}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Points
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.current_streak}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Streak
              </p>
            </div>
          </div>
        )}

        {/* Activity Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Activity timeline coming soon...
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Achievements
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Achievements coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


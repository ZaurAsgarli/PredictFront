import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import LeaderboardTable from '../src/components/LeaderboardTable';
import { leaderboardService } from '../src/services/leaderboard';
import { authService } from '../src/services/auth';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      let data;
      switch (timeframe) {
        case 'weekly':
          data = await leaderboardService.getWeeklyLeaderboard();
          break;
        case 'monthly':
          data = await leaderboardService.getMonthlyLeaderboard();
          break;
        default:
          data = await leaderboardService.getGlobalLeaderboard();
      }
      setLeaders(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See how you rank among the best predictors
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['all', 'monthly', 'weekly'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`flex-1 px-6 py-4 text-sm font-medium capitalize ${
                  timeframe === period
                    ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {period === 'all' ? 'All Time' : period}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-96 animate-pulse" />
        ) : leaders.length > 0 ? (
          <LeaderboardTable leaders={leaders} currentUserId={user?.id} />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No leaderboard data available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


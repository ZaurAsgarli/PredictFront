import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { TrendingUp, Award, Target } from 'lucide-react';
import PredictionCard from '../src/components/PredictionCard';
import PredictionCardSkeleton from '../src/components/skeletons/PredictionCardSkeleton';
import StatsCardSkeleton from '../src/components/skeletons/StatsCardSkeleton';
import { predictionsService } from '../src/services/predictions';
import { authService } from '../src/services/auth';

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();
  const user = authService.getCurrentUserSync();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const [predictionsData, statsData] = await Promise.all([
        predictionsService.getUserPredictions(user.id).catch((err) => {
          console.error('Error loading predictions:', err);
          return [];
        }),
        predictionsService.getPredictionStats(user.id).catch((err) => {
          console.error('Error loading stats:', err);
          return {
            total: 0,
            win_rate: 0,
            total_points: 0,
            current_streak: 0,
            achievements: 0,
          };
        }),
      ]);
      setPredictions(Array.isArray(predictionsData) ? predictionsData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading predictions:', error);
      setPredictions([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter((prediction) => {
    if (filter === 'all') return true;
    return prediction.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Predictions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your predictions
          </p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Predictions
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <Target className="h-12 w-12 text-primary-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Win Rate
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.win_rate}%
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Points
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.total_points}
                  </p>
                </div>
                <Award className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current Streak
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.current_streak}
                  </p>
                </div>
                <div className="text-4xl">🔥</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['all', 'pending', 'won', 'lost'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex-1 px-6 py-4 text-sm font-medium capitalize ${
                  filter === status
                    ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Predictions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <PredictionCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPredictions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No predictions found
            </p>
            <button
              onClick={() => router.push('/events')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


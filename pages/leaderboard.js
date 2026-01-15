import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, TrendingUp } from 'lucide-react';
import LeaderboardTable from '../src/components/LeaderboardTable';
import SEO from '../src/components/SEO';
import { leaderboardService } from '../src/services/leaderboard';
import { authService } from '../src/services/auth';
import DotGrid from '../components/DotGrid';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  const user = authService.getCurrentUserSync();

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (cancelled) return;
      console.log(`[Leaderboard] Fetching leaderboard ONCE for timeframe: ${timeframe}`);
      await loadLeaderboard();
    }

    loadData();
    return () => { cancelled = true; };
  }, [timeframe]); // timeframe is a primitive string, safe to use

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      let data;
      let requestUrl = '';
      
      switch (timeframe) {
        case 'weekly':
          console.log('[Leaderboard] Request: GET /api/analytics/weekly/ (last 7 days)');
          data = await leaderboardService.getWeeklyLeaderboard();
          requestUrl = '/api/analytics/weekly/';
          break;
        case 'monthly':
          console.log('[Leaderboard] Request: GET /api/analytics/monthly/ (last 30 days)');
          data = await leaderboardService.getMonthlyLeaderboard();
          requestUrl = '/api/analytics/monthly/';
          break;
        case 'all':
        default:
          // All-Time: NO date filters, fetch ALL historical data
          console.log('[Leaderboard] Request: GET /api/analytics/global/ (ALL-TIME, NO date filters)');
          data = await leaderboardService.getGlobalLeaderboard();
          requestUrl = '/api/analytics/global/';
          break;
      }
      
      console.log(`[Leaderboard] Response for ${timeframe}:`, {
        requestUrl,
        dataLength: Array.isArray(data) ? data.length : 'not array',
        firstUser: Array.isArray(data) && data.length > 0 ? {
          username: data[0].username || data[0].user?.username,
          total_points: data[0].total_points,
          rank: data[0].rank
        } : null
      });
      
      setLeaders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`[Leaderboard] Error loading ${timeframe} leaderboard:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setLeaders([]); // Set empty array instead of undefined
    } finally {
      setLoading(false);
    }
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://predicthub.com';
  
  // Structured data for leaderboard
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Leaderboard',
    description: 'See how you rank among the best predictors on PredictHub',
    url: `${siteUrl}/leaderboard`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: leaders.length,
      itemListElement: leaders.slice(0, 10).map((leader, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Person',
          name: leader.user?.username || `User ${index + 1}`,
          description: `Rank ${index + 1} with ${leader.total_points || 0} points`,
        },
      })),
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative py-24 overflow-hidden"
    >
      {/* DotGrid Background */}
      <div className="fixed inset-0 z-0">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#5227FF"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-gray-950/80 dark:bg-gray-950/90 z-10" />
      
      <SEO
        title="Leaderboard"
        description="See how you rank among the best predictors. Compete with thousands of users and climb the leaderboard."
        structuredData={structuredData}
      />
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-500 dark:via-yellow-600 dark:to-yellow-700 mb-6 shadow-lg shadow-yellow-500/50"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            >
              <Trophy className="h-10 w-10 text-white" />
            </motion.div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3 drop-shadow-lg"
          >
            <Sparkles className="w-8 h-8 text-yellow-500" />
            Leaderboard
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-gray-200 dark:text-gray-300"
          >
            See how you rank among the best predictors
          </motion.p>
        </motion.div>

        {/* Timeframe Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 rounded-xl shadow-2xl mb-8 overflow-hidden border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex relative">
            {['all', 'monthly', 'weekly'].map((period, index) => (
              <motion.button
                key={period}
                onClick={() => setTimeframe(period)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex-1 px-6 py-4 text-sm font-semibold capitalize transition-all duration-300 ${
                  timeframe === period
                    ? 'text-primary-300 dark:text-primary-400'
                    : 'text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white'
                }`}
              >
                {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                {timeframe === period && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 rounded-xl shadow-2xl h-96 overflow-hidden border border-white/20 dark:border-gray-700/50"
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-4"
                  >
                    <Trophy className="h-12 w-12 text-yellow-500" />
                  </motion.div>
                  <p className="text-gray-200 dark:text-gray-300">Loading leaderboard...</p>
                </div>
              </div>
            </motion.div>
          ) : leaders.length > 0 ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <LeaderboardTable leaders={leaders} currentUserId={user?.id} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16 backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="mb-6"
              >
                <Trophy className="h-20 w-20 text-gray-400 mx-auto" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-gray-200 dark:text-gray-300 text-lg mb-2"
              >
                No leaderboard data available yet.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-gray-300 dark:text-gray-400 text-sm"
              >
                Be the first to make predictions and climb the ranks!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


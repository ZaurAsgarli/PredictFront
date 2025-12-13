import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, Award, Crown, Star } from 'lucide-react';

export default function LeaderboardTable({ leaders, currentUserId }) {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 2,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <Crown className="h-7 w-7 text-yellow-500 drop-shadow-lg" />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-yellow-400 rounded-full blur-md"
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            <Medal className="h-6 w-6 text-gray-400" />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            <Medal className="h-6 w-6 text-orange-600" />
          </motion.div>
        );
      default:
        return (
          <span className="text-white dark:text-gray-200 font-bold text-lg">
            {rank}
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 rounded-xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 dark:divide-gray-700/50">
          <thead className="backdrop-blur-md bg-white/20 dark:bg-gray-800/30">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white dark:text-gray-100 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white dark:text-gray-100 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white dark:text-gray-100 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white dark:text-gray-100 uppercase tracking-wider">
                Predictions
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white dark:text-gray-100 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white dark:text-gray-100 uppercase tracking-wider">
                Streak
              </th>
            </tr>
          </thead>
          <tbody className="backdrop-blur-sm bg-white/5 dark:bg-gray-900/10 divide-y divide-white/10 dark:divide-gray-700/30">
            {leaders.map((leader, index) => (
              <motion.tr
                key={leader.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  scale: 1.01,
                  backgroundColor: leader.user_id === currentUserId 
                    ? 'rgba(59, 130, 246, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)'
                }}
                className={`${
                  leader.user_id === currentUserId
                    ? 'backdrop-blur-md bg-primary-500/20 dark:bg-primary-500/30 border-l-4 border-primary-400'
                    : 'hover:backdrop-blur-md hover:bg-white/10 dark:hover:bg-white/5'
                } transition-all duration-300 cursor-pointer`}
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(leader.rank)}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex-shrink-0 h-12 w-12 relative"
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                        leader.rank === 1 
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                          : leader.rank === 2
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                          : leader.rank === 3
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                          : 'bg-gradient-to-br from-primary-500 to-primary-700'
                      }`}>
                        {leader.username.charAt(0).toUpperCase()}
                      </div>
                      {leader.rank <= 3 && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-yellow-400 blur-md -z-10"
                        />
                      )}
                    </motion.div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-white dark:text-gray-100 flex items-center gap-2">
                        {leader.username}
                        {leader.user_id === currentUserId && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-500 to-blue-600 text-white"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            You
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center"
                  >
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    <span className="text-sm font-bold text-white dark:text-gray-100">
                      {leader.total_points.toLocaleString()}
                    </span>
                  </motion.div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-white dark:text-gray-100">
                    {leader.total_predictions}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center"
                  >
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {leader.win_rate}%
                    </span>
                  </motion.div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${
                      leader.current_streak > 0
                        ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {leader.current_streak > 0 && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="mr-1"
                      >
                        🔥
                      </motion.span>
                    )}
                    {leader.current_streak}
                  </motion.span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}


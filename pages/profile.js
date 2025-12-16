import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, TrendingUp, Trophy, Edit2, Sparkles, Wallet, Check } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { authService } from '../src/services/auth';
import { predictionsService } from '../src/services/predictions';
import { leaderboardService } from '../src/services/leaderboard';
import GradientText from '../components/GradientText';
import { useTheme } from '../src/contexts/ThemeContext';
import ConnectWalletModal from '../src/components/ConnectWalletModal';
import FallingText from '../src/components/FallingText';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    // Check if wallet is already connected
    const savedAddress = localStorage.getItem('walletAddress');
    const savedWalletType = localStorage.getItem('walletType');
    if (savedAddress) {
      setWalletConnected({
        address: savedAddress,
        walletType: savedWalletType || 'metamask',
      });
    }
  }, []);

  useEffect(() => {
    const currentUser = authService.getCurrentUserSync();
    if (!currentUser) {
      // No logged-in user; stop loading but keep profile page accessible
      setLoading(false);
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
      <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        {/* Animated background blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className={`absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl opacity-70 animate-pulse ${
            isDark 
              ? 'bg-gradient-to-br from-sky-500/40 via-cyan-400/20 to-indigo-600/40' 
              : 'bg-gradient-to-br from-blue-300/30 via-indigo-300/20 to-purple-300/30'
          }`} />
          <div className={`absolute top-1/4 right-[-6rem] h-96 w-96 rounded-full blur-3xl opacity-60 animate-[spin_40s_linear_infinite] ${
            isDark 
              ? 'bg-gradient-to-tl from-purple-500/40 via-fuchsia-500/10 to-blue-500/40' 
              : 'bg-gradient-to-tl from-purple-300/30 via-pink-300/15 to-blue-300/30'
          }`} />
          <div className={`absolute bottom-[-6rem] left-1/4 h-72 w-72 rounded-full blur-3xl opacity-60 animate-[spin_50s_linear_infinite] ${
            isDark 
              ? 'bg-gradient-to-tr from-emerald-400/40 via-teal-500/10 to-sky-500/40' 
              : 'bg-gradient-to-tr from-emerald-300/30 via-teal-300/15 to-sky-300/30'
          }`} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className={`h-64 rounded-3xl backdrop-blur-3xl border mb-8 ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800/80 shadow-[0_0_120px_rgba(56,189,248,0.25)]' 
                : 'bg-white/60 border-white/80 shadow-[0_0_120px_rgba(59,130,246,0.15)]'
            }`} />
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const floatVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          className={`absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl opacity-70 ${
            isDark 
              ? 'bg-gradient-to-br from-sky-500/40 via-cyan-400/20 to-indigo-600/40' 
              : 'bg-gradient-to-br from-blue-300/30 via-indigo-300/20 to-purple-300/30'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className={`absolute top-1/4 right-[-6rem] h-96 w-96 rounded-full blur-3xl opacity-60 ${
            isDark 
              ? 'bg-gradient-to-tl from-purple-500/40 via-fuchsia-500/10 to-blue-500/40' 
              : 'bg-gradient-to-tl from-purple-300/30 via-pink-300/15 to-blue-300/30'
          }`}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
        <motion.div 
          className={`absolute bottom-[-6rem] left-1/4 h-72 w-72 rounded-full blur-3xl opacity-60 ${
            isDark 
              ? 'bg-gradient-to-tr from-emerald-400/40 via-teal-500/10 to-sky-500/40' 
              : 'bg-gradient-to-tr from-emerald-300/30 via-teal-300/15 to-sky-300/30'
          }`}
          animate={{
            rotate: -360,
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            rotate: {
              duration: 50,
              repeat: Infinity,
              ease: "linear"
            },
            x: {
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            },
            y: {
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
        {/* Additional floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-xl ${
              isDark 
                ? 'bg-cyan-400/20' 
                : 'bg-blue-400/20'
            }`}
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Header */}
        <motion.div 
          className={`rounded-3xl overflow-hidden mb-8 backdrop-blur-2xl border transition-all duration-500 ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 shadow-[0_0_80px_rgba(59,130,246,0.35)]' 
              : 'bg-white/70 border-white/80 shadow-[0_0_80px_rgba(59,130,246,0.2)]'
          }`}
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className={`h-32 bg-gradient-to-r ${
              isDark 
                ? 'from-sky-500/40 via-indigo-600/40 to-purple-600/40' 
                : 'from-blue-400/30 via-indigo-400/30 to-purple-400/30'
            }`}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-16">
              <div className="flex items-end">
                <motion.div 
                  className={`h-32 w-32 rounded-full border-4 flex items-center justify-center backdrop-blur-xl ${
                    isDark 
                      ? 'bg-slate-900/80 border-sky-400/60 shadow-[0_0_40px_rgba(56,189,248,0.6)]' 
                      : 'bg-white/80 border-blue-400/60 shadow-[0_0_40px_rgba(59,130,246,0.4)]'
                  }`}
                  variants={floatVariants}
                  animate="float"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={`text-5xl font-bold ${
                    isDark ? 'text-cyan-400' : 'text-blue-600'
                  }`}>
                    {user?.username?.charAt(0).toUpperCase() || 'G'}
                  </span>
                </motion.div>
                <div className="ml-6 mb-2">
                  <h1 className="text-3xl font-bold">
                    {user?.username ? (
                      <GradientText
                        colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                        animationSpeed={3}
                        showBorder={false}
                        className="text-3xl font-bold"
                      >
                        {user.username}
                      </GradientText>
                    ) : (
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>Guest User</span>
                    )}
                  </h1>
                  {rank && (
                    <motion.div 
                      className="mt-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <GradientText
                        colors={["#fbbf24", "#f59e0b", "#fbbf24", "#f59e0b", "#fbbf24"]}
                        animationSpeed={4}
                        showBorder={false}
                        className="text-base font-medium"
                      >
                        Rank #{rank.rank} • {(rank.total_points ?? 0).toLocaleString()} points
                      </GradientText>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button 
                  onClick={() => setWalletModalOpen(true)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center backdrop-blur-md border ${
                    walletConnected
                      ? (isDark 
                          ? 'bg-green-500/80 hover:bg-green-400 text-white border-green-300/40 shadow-lg shadow-green-500/40' 
                          : 'bg-green-500/90 hover:bg-green-400 text-white border-green-300/60 shadow-lg shadow-green-500/30')
                      : (isDark 
                          ? 'bg-purple-500/80 hover:bg-purple-400 text-white border-purple-300/40 shadow-lg shadow-purple-500/40' 
                          : 'bg-purple-500/90 hover:bg-purple-400 text-white border-purple-300/60 shadow-lg shadow-purple-500/30')
                  } hover:shadow-xl`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {walletConnected ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Wallet Connected
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </motion.button>
                <motion.button 
                  className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center backdrop-blur-md border ${
                    isDark 
                      ? 'bg-sky-500/80 hover:bg-sky-400 text-white border-sky-300/40 shadow-lg shadow-sky-500/40' 
                      : 'bg-blue-500/90 hover:bg-blue-400 text-white border-blue-300/60 shadow-lg shadow-blue-500/30'
                  } hover:shadow-xl`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </motion.button>
              </div>
            </div>

            <motion.div 
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4"
              variants={containerVariants}
            >
              <motion.div 
                className={`flex items-center ${
                  isDark ? 'text-slate-300/90' : 'text-gray-700'
                }`}
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <Mail className="h-5 w-5 mr-2" />
                {user?.email || 'N/A'}
              </motion.div>
              <motion.div 
                className={`flex items-center ${
                  isDark ? 'text-slate-300/90' : 'text-gray-700'
                }`}
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Joined {user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'N/A'}
              </motion.div>
              <motion.div 
                className={`flex items-center ${
                  isDark ? 'text-slate-300/90' : 'text-gray-700'
                }`}
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <Trophy className="h-5 w-5 mr-2" />
                {stats?.achievements || 0} Achievements
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
          >
            <motion.div 
              className={`rounded-2xl p-6 backdrop-blur-2xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-900/80 border-slate-800 shadow-[0_0_40px_rgba(59,130,246,0.25)] hover:shadow-[0_0_60px_rgba(59,130,246,0.45)]' 
                  : 'bg-white/80 border-white/60 shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:shadow-[0_0_60px_rgba(59,130,246,0.25)]'
              }`}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">
                <GradientText
                  colors={["#3b82f6", "#8b5cf6", "#3b82f6", "#8b5cf6", "#3b82f6"]}
                  animationSpeed={5}
                  showBorder={false}
                  className="text-2xl font-bold"
                >
                  {stats.total}
                </GradientText>
              </div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Predictions
              </p>
            </motion.div>

            <motion.div 
              className={`rounded-2xl p-6 backdrop-blur-2xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-900/80 border-slate-800 shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_60px_rgba(16,185,129,0.45)]' 
                  : 'bg-white/80 border-white/60 shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.25)]'
              }`}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">
                <GradientText
                  colors={["#10b981", "#34d399", "#10b981", "#34d399", "#10b981"]}
                  animationSpeed={4}
                  showBorder={false}
                  className="text-2xl font-bold"
                >
                  {stats.win_rate}%
                </GradientText>
              </div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Win Rate</p>
            </motion.div>

            <motion.div 
              className={`rounded-2xl p-6 backdrop-blur-2xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-900/80 border-slate-800 shadow-[0_0_40px_rgba(245,158,11,0.25)] hover:shadow-[0_0_60px_rgba(245,158,11,0.45)]' 
                  : 'bg-white/80 border-white/60 shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:shadow-[0_0_60px_rgba(245,158,11,0.25)]'
              }`}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="text-2xl font-bold">
                <GradientText
                  colors={["#fbbf24", "#f59e0b", "#fbbf24", "#f59e0b", "#fbbf24"]}
                  animationSpeed={3}
                  showBorder={false}
                  className="text-2xl font-bold"
                >
                  {stats.total_points}
                </GradientText>
              </div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Points
              </p>
            </motion.div>

            <motion.div 
              className={`rounded-2xl p-6 backdrop-blur-2xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-900/80 border-slate-800 shadow-[0_0_40px_rgba(249,115,22,0.25)] hover:shadow-[0_0_60px_rgba(249,115,22,0.45)]' 
                  : 'bg-white/80 border-white/60 shadow-[0_0_40px_rgba(249,115,22,0.15)] hover:shadow-[0_0_60px_rgba(249,115,22,0.25)]'
              }`}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
              </div>
              <div className="text-2xl font-bold">
                <GradientText
                  colors={["#f97316", "#fb923c", "#f97316", "#fb923c", "#f97316"]}
                  animationSpeed={2}
                  showBorder={false}
                  className="text-2xl font-bold"
                >
                  {stats.current_streak}
                </GradientText>
              </div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Current Streak
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* About PredictHub - Falling Text */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className={`rounded-3xl p-8 backdrop-blur-2xl border min-h-[300px] ${
            isDark 
              ? 'bg-slate-900/70 border-slate-800/80 shadow-[0_0_80px_rgba(59,130,246,0.35)]' 
              : 'bg-white/70 border-white/80 shadow-[0_0_80px_rgba(59,130,246,0.2)]'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 text-center ${
              isDark ? 'text-slate-50' : 'text-gray-900'
            }`}>
              About PredictHub
            </h2>
            <div className="min-h-[200px]">
              <FallingText
                text={`PredictHub is a revolutionary prediction market platform where users can make predictions on real-world events, trade outcome tokens, and earn rewards based on their forecasting accuracy. Connect your wallet, explore markets, and compete on the global leaderboard.`}
                highlightWords={["PredictHub", "prediction", "market", "platform", "predictions", "events", "trade", "tokens", "rewards", "wallet", "markets", "leaderboard"]}
                highlightClass="highlighted"
                trigger="auto"
                backgroundColor="transparent"
                wireframes={false}
                gravity={0.56}
                fontSize="1.5rem"
                mouseConstraintStiffness={0.9}
                className={`h-50 ${isDark ? 'text-white' : 'text-gray-900'}`}
              />
            </div>
          </div>
        </motion.div>

        {/* Activity Summary */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          <motion.div 
            className={`rounded-2xl p-6 backdrop-blur-2xl border ${
              isDark 
                ? 'bg-slate-900/80 border-slate-800 shadow-[0_0_40px_rgba(59,130,246,0.25)]' 
                : 'bg-white/80 border-white/60 shadow-[0_0_40px_rgba(59,130,246,0.15)]'
            }`}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.01 }}
          >
            <h2 className={`text-xl font-bold mb-4 ${
              isDark ? 'text-slate-50' : 'text-gray-900'
            }`}>
              Recent Activity
            </h2>
            <div className="space-y-4">
              <p className={`text-center py-8 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Activity timeline coming soon...
              </p>
            </div>
          </motion.div>

          <motion.div 
            className={`rounded-2xl p-6 backdrop-blur-2xl border ${
              isDark 
                ? 'bg-slate-900/80 border-slate-800 shadow-[0_0_40px_rgba(168,85,247,0.25)]' 
                : 'bg-white/80 border-white/60 shadow-[0_0_40px_rgba(168,85,247,0.15)]'
            }`}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.01 }}
          >
            <h2 className={`text-xl font-bold mb-4 ${
              isDark ? 'text-slate-50' : 'text-gray-900'
            }`}>
              Achievements
            </h2>
            <div className="space-y-4">
              <p className={`text-center py-8 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Achievements coming soon...
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnect={(walletData) => {
          setWalletConnected(walletData);
          setWalletModalOpen(false);
        }}
      />
    </div>
  );
}


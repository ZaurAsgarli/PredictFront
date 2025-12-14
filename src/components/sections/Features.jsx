import { memo } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Award, Users, BarChart3, Zap } from 'lucide-react';
import FeatureCard from '../FeatureCard';
import AnimatedSection from '../motion/AnimatedSection';
import { staggerContainer } from '../../utils/motion';

const features = [
  {
    icon: Target,
    title: 'Smart Predictions',
    description: 'Use advanced analytics and community insights to make informed predictions with confidence levels.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Real-time Markets',
    description: 'Track live market movements and price changes as they happen in real-time.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Award,
    title: 'Rewards & Achievements',
    description: 'Earn points, unlock badges, and receive exclusive rewards for accurate predictions.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Compete with others, share insights, and climb the leaderboard in our vibrant community.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Get detailed insights into your performance with comprehensive analytics and statistics.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Experience instant updates and seamless interactions with our optimized platform.',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

const Features = memo(() => {
  return (
    <section className="relative py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection direction="up" className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6"
          >
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Features
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              predict with confidence
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Powerful features designed to help you make better predictions and compete at the highest level.
          </p>
        </AnimatedSection>

        {/* Features Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              gradient={feature.gradient}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
});

Features.displayName = 'Features';

export default Features;


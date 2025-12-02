import { memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Trophy, Zap } from 'lucide-react';
import FlyIn from '../motion/FlyIn';
import AnimatedSection from '../motion/AnimatedSection';

const showcaseItems = [
  {
    icon: TrendingUp,
    title: 'Active Markets',
    value: '1,234',
    description: 'Live prediction markets',
    color: 'blue',
    delay: 0,
    direction: 'left',
  },
  {
    icon: Users,
    title: 'Active Users',
    value: '50K+',
    description: 'Community members',
    color: 'purple',
    delay: 0.1,
    direction: 'right',
  },
  {
    icon: Trophy,
    title: 'Total Predictions',
    value: '2.5M+',
    description: 'Predictions made',
    color: 'orange',
    delay: 0.2,
    direction: 'left',
  },
  {
    icon: Zap,
    title: 'Success Rate',
    value: '87%',
    description: 'Average accuracy',
    color: 'green',
    delay: 0.3,
    direction: 'right',
  },
];

const ScrollShowcase = memo(() => {
  return (
    <section className="relative py-32 bg-gray-900 text-white overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20" />
      
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection direction="up" className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Trusted by thousands
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              of predictors
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join a growing community of smart predictors making accurate forecasts every day.
          </p>
        </AnimatedSection>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {showcaseItems.map((item) => {
            const Icon = item.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-cyan-500',
              purple: 'from-purple-500 to-pink-500',
              orange: 'from-orange-500 to-red-500',
              green: 'from-green-500 to-emerald-500',
            };

            return (
              <FlyIn
                key={item.title}
                direction={item.direction}
                delay={item.delay}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-full p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${colorClasses[item.color]} mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Value */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: item.delay + 0.2 }}
                    className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  >
                    {item.value}
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400">{item.description}</p>

                  {/* Glow effect on hover */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorClasses[item.color]} opacity-0 group-hover:opacity-20 blur-xl -z-10`}
                    whileHover={{ opacity: 0.2 }}
                  />
                </motion.div>
              </FlyIn>
            );
          })}
        </div>

        {/* Additional showcase content */}
        <AnimatedSection direction="up" delay={0.4} className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Market Card Preview */}
            <FlyIn direction="left" delay={0.5}>
              <motion.div
                whileHover={{ rotateY: 5, rotateX: 5, y: -8 }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90"
                    alt="Market Cards"
                    className="w-full h-full object-cover opacity-80"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 to-purple-600/60"></div>
                </div>
                <h4 className="mt-4 font-semibold text-white">Market Cards</h4>
                <p className="text-sm text-gray-400 mt-2">Interactive prediction markets</p>
              </motion.div>
            </FlyIn>

            {/* Mobile UI Preview */}
            <FlyIn direction="up" delay={0.6}>
              <motion.div
                whileHover={{ scale: 1.05, y: -8 }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden"
              >
                <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                  <img
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90"
                    alt="Mobile Experience"
                    className="w-full h-full object-cover opacity-80"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/60 to-pink-600/60"></div>
                </div>
                <h4 className="mt-4 font-semibold text-white">Mobile Experience</h4>
                <p className="text-sm text-gray-400 mt-2">Optimized for all devices</p>
              </motion.div>
            </FlyIn>

            {/* Analytics Preview */}
            <FlyIn direction="right" delay={0.7}>
              <motion.div
                whileHover={{ rotateY: -5, rotateX: 5, y: -8 }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-green-500/30 to-emerald-500/30">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90"
                    alt="Analytics Dashboard"
                    className="w-full h-full object-cover opacity-80"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/60 to-emerald-600/60"></div>
                </div>
                <h4 className="mt-4 font-semibold text-white">Analytics Dashboard</h4>
                <p className="text-sm text-gray-400 mt-2">Track your performance</p>
              </motion.div>
            </FlyIn>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
});

ScrollShowcase.displayName = 'ScrollShowcase';

export default ScrollShowcase;


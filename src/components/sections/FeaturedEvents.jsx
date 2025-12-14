import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Clock, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { eventsService } from '../../services/events';
import AnimatedSection from '../motion/AnimatedSection';
import FlyIn from '../motion/FlyIn';
import { staggerContainer, staggerItem } from '../../utils/motion';
import { format } from 'date-fns';

const ModernEventCard = memo(({ event, index }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'from-green-500 to-emerald-500';
      case 'closed':
        return 'from-red-500 to-rose-500';
      case 'resolved':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const safeFormatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link href={`/events/${event.id}`}>
        <div className="relative h-full rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300">
          {/* Image Section */}
          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TrendingUp className="w-16 h-16 text-white/50" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(event.status)} shadow-lg backdrop-blur-sm`}
              >
                {event.status?.toUpperCase() || 'ACTIVE'}
              </motion.span>
            </div>

            {/* Category Badge */}
            {event.category && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-full text-xs font-medium text-white bg-white/20 backdrop-blur-md border border-white/30">
                  {typeof event.category === 'string' ? event.category : event.category?.name || 'Uncategorized'}
                </span>
              </div>
            )}

            {/* Hover Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0"
              whileHover={{ background: 'linear-gradient(to br, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))' }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {event.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 leading-relaxed">
              {event.description || 'Join this prediction market and make your forecast.'}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ends</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {safeFormatDate(event.ends_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Participants</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {event.participants_count || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Info (if available) */}
            {(event.yes_price || event.no_price) && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 mb-4">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">YES</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${event.yes_price ? parseFloat(event.yes_price).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">NO</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    ${event.no_price ? parseFloat(event.no_price).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                View Details
              </span>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </motion.div>
            </div>
          </div>

          {/* Shine Effect on Hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
            initial={{ x: '-100%' }}
            whileHover={{ x: '200%' }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </Link>
    </motion.div>
  );
});

ModernEventCard.displayName = 'ModernEventCard';

const FeaturedEvents = memo(() => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedEvents();
  }, []);

  const loadFeaturedEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsService.getFeaturedEvents();
      setEvents(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (error) {
      console.error('Error loading featured events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-32 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection direction="up" className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Featured Events
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Trending Prediction
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Markets
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover the most popular prediction markets and join the conversation
          </p>
        </AnimatedSection>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : events.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.map((event, index) => (
              <ModernEventCard key={event.id} event={event} index={index} />
            ))}
          </motion.div>
        ) : (
          <AnimatedSection direction="up" className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Featured Events
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Check back soon for new prediction markets!
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse All Events
              <ArrowRight className="w-5 h-5" />
            </Link>
          </AnimatedSection>
        )}

        {/* View All Link */}
        {events.length > 0 && (
          <AnimatedSection direction="up" delay={0.3} className="text-center mt-12">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View All Events
              <ArrowRight className="w-5 h-5" />
            </Link>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
});

FeaturedEvents.displayName = 'FeaturedEvents';

export default FeaturedEvents;



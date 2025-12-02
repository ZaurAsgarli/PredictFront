import Link from 'next/link';
import { Calendar, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Helper function to safely format dates
const safeFormatDate = (dateValue, formatStr = 'MMM dd, yyyy') => {
  if (!dateValue) return 'N/A';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, formatStr);
  } catch (error) {
    return 'N/A';
  }
};

export default function EventCard({ event }) {
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

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link href={`/events/${event.id}`}>
        <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300">
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
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(
                event.status
              )} shadow-lg backdrop-blur-sm`}
            >
              {event.status?.toUpperCase() || 'ACTIVE'}
            </span>
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
}


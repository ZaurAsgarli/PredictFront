import Link from 'next/link';
import { Calendar, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function EventCard({ event }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-200';
      case 'closed':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-200';
      case 'resolved':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-700 dark:to-slate-700 dark:text-gray-200';
    }
  };

  return (
    <Link href={`/events/${event.id}`}>
      <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 overflow-hidden border border-white/20 dark:border-gray-700/20 card-hover">
        {event.image && (
          <div className="relative overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  event.status
                )}`}
              >
                {event.status.toUpperCase()}
              </span>
            </div>
            {event.category && (
              <div className="absolute top-4 right-4">
                <span className="text-xs text-white bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                  {event.category}
                </span>
              </div>
            )}
          </div>
        )}
        
        {!event.image && (
          <div className="relative bg-gradient-to-br from-primary-500 to-secondary-500 h-48 flex items-center justify-center">
            <div className="text-center text-white">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-80" />
              <span className="text-sm font-medium opacity-80">Prediction Event</span>
            </div>
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  event.status
                )}`}
              >
                {event.status.toUpperCase()}
              </span>
            </div>
            {event.category && (
              <div className="absolute top-4 right-4">
                <span className="text-xs text-white bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                  {event.category}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
            {event.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="font-medium">Ends: {format(new Date(event.end_date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="w-8 h-8 bg-gradient-to-r from-secondary-100 to-purple-100 dark:from-secondary-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                <Users className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
              </div>
              <span className="font-medium">{event.participants_count || 0} Participants</span>
            </div>
            {event.total_predictions && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <div className="w-8 h-8 bg-gradient-to-r from-accent-100 to-pink-100 dark:from-accent-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                </div>
                <span className="font-medium">{event.total_predictions} Predictions</span>
              </div>
            )}
          </div>

          {event.status === 'active' && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-primary-600 dark:text-primary-400">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-semibold">Active Now</span>
                </div>
                <ArrowRight className="h-5 w-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}


import { Calendar, TrendingUp, Award, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function PredictionCard({ prediction }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'won':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {prediction.event_title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your prediction: <span className="font-medium">{prediction.outcome_name}</span>
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            prediction.status
          )}`}
        >
          {prediction.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
          <div>
            <div className="text-xs text-gray-500">Confidence</div>
            <div className="font-semibold">{prediction.confidence}%</div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Award className="h-4 w-4 mr-2 text-primary-600" />
          <div>
            <div className="text-xs text-gray-500">Stake</div>
            <div className="font-semibold">{prediction.stake} pts</div>
          </div>
        </div>
      </div>

      {prediction.reward && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
          <div className="flex items-center text-green-700 dark:text-green-300">
            <Award className="h-5 w-5 mr-2" />
            <div>
              <div className="text-xs">Reward Earned</div>
              <div className="font-bold text-lg">+{prediction.reward} pts</div>
            </div>
          </div>
        </div>
      )}

      {prediction.notes && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 italic">
            "{prediction.notes}"
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {format(new Date(prediction.created_at), 'MMM dd, yyyy')}
        </div>
        {prediction.event_end_date && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Ends: {format(new Date(prediction.event_end_date), 'MMM dd')}
          </div>
        )}
      </div>
    </div>
  );
}


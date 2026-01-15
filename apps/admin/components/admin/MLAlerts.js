/**
 * ML Alerts Component
 * Displays ML model status, predictions, logs, and health metrics
 */

import MLMetricsChart from '../charts/MLMetricsChart';

export default function MLAlerts({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No ML data available</p>
      </div>
    );
  }

  const { status, predictions = [], logs = [], health } = data;

  return (
    <div className="space-y-6">
      {/* ML Status */}
      {status && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {status.status || 'Active'}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Predictions</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {status.total_predictions || 0}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {status.accuracy
                  ? `${(status.accuracy * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ML Metrics Chart */}
      {predictions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Performance</h3>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <MLMetricsChart
              data={predictions.slice(0, 30).map((p) => ({
                date: new Date(p.timestamp || Date.now()).toLocaleDateString(),
                predictions: p.prediction_count || 0,
                blocked: p.blocked_count || 0,
                accuracy: p.accuracy ? p.accuracy * 100 : 0,
              }))}
              loading={false}
            />
          </div>
        </div>
      )}

      {/* ML Health */}
      {health && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Metrics</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!status && predictions.length === 0 && !health && (
        <div className="text-center py-8 text-gray-500">
          <p>No ML model data available</p>
        </div>
      )}
    </div>
  );
}

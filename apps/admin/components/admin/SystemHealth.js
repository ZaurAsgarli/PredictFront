/**
 * System Health Component
 * Displays system health status and metrics
 */

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function SystemHealth({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No system health data available</p>
      </div>
    );
  }

  const { status = 'unknown', uptime = 0, version = 'N/A' } = data;

  const getStatusIcon = () => {
    if (status === 'healthy' || status === 'ok') {
      return <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />;
    } else if (status === 'degraded' || status === 'warning') {
      return <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />;
    } else {
      return <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />;
    }
  };

  const getStatusColor = () => {
    if (status === 'healthy' || status === 'ok') {
      return 'text-green-600 dark:text-green-400';
    } else if (status === 'degraded' || status === 'warning') {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Status</p>
              <p className={`text-xl font-bold capitalize ${getStatusColor()}`}>
                {status}
              </p>
            </div>
            {getStatusIcon()}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatUptime(uptime)}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Version</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{version}</p>
          </div>
        </div>
      </div>

      {/* Additional health data */}
      {Object.keys(data).length > 3 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Metrics</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Format uptime in seconds to human-readable format
 */
function formatUptime(seconds) {
  if (!seconds) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

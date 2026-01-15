/**
 * Security Alerts Component
 * Displays security alerts including active sessions, failed logins, and unusual activity
 */

import { Activity, AlertCircle, XCircle } from 'lucide-react';

export default function SecurityAlerts({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No security data available</p>
      </div>
    );
  }

  const { sessions = [], failedLogins = [], unusualActivity = [], logs = [] } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessions.length}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed Logins (24h)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{failedLogins.length}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unusual Activity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{unusualActivity.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Failed Logins List */}
      {failedLogins.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Failed Logins</h3>
          <div className="space-y-2">
            {failedLogins.slice(0, 10).map((login, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {login.username || login.email || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {login.timestamp
                      ? new Date(login.timestamp).toLocaleString()
                      : 'Unknown time'}
                    {login.ip && ` • IP: ${login.ip}`}
                  </p>
                </div>
                <span className="text-xs text-red-600 dark:text-red-400">Failed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {failedLogins.length === 0 && unusualActivity.length === 0 && sessions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No security alerts at this time</p>
        </div>
      )}
    </div>
  );
}

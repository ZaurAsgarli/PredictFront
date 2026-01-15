/**
 * Security & Health Dashboard
 * Answers: "Is the protocol healthy right now?"
 */

import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, AlertTriangle, Ban, Eye, CheckCircle, XCircle } from 'lucide-react';
import AdminAuthGuardWrapper from '../components/AdminAuthGuardWrapper';
import { adminApi } from '../lib/api';

export default function SecurityPage() {
  const [autoBlockedUsers, setAutoBlockedUsers] = useState([]);
  const [mlDetections, setMlDetections] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [securityStats, setSecurityStats] = useState(null);
  const [suspiciousUsers, setSuspiciousUsers] = useState([]);
  const [platformHealth, setPlatformHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      const [
        mlInsights,
        logs,
        stats,
        suspicious,
        health,
      ] = await Promise.all([
        adminApi.getMLInsights().catch(() => ({ recent_predictions: [], metrics: {} })),
        adminApi.getSecurityLogs().catch(() => []),
        adminApi.getSecurityStats().catch(() => null),
        adminApi.getSuspiciousUsers().catch(() => []),
        adminApi.getPlatformHealth().catch(() => null),
      ]);

      // Filter auto-blocked users (score > 0.90)
      const blocked = mlInsights.recent_predictions?.filter(p => p.score > 0.90) || [];
      setAutoBlockedUsers(blocked);
      setMlDetections(mlInsights.recent_predictions || []);
      setSecurityLogs(logs.slice(0, 50)); // Last 50 logs
      setSecurityStats(stats);
      setSuspiciousUsers(suspicious);
      setPlatformHealth(health);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId, reason) => {
    if (!confirm(`Unblock user ${userId}?`)) return;
    // TODO: Implement when backend endpoint is available
    alert(`Unblock user ${userId}\n\nNote: Backend endpoint not yet implemented`);
  };

  const handleOverrideML = async (detectionId, action) => {
    if (!confirm(`Override ML decision for detection ${detectionId}?`)) return;
    // TODO: Implement when backend endpoint is available
    alert(`Override ML decision\n\nNote: Backend endpoint not yet implemented`);
  };

  return (
    <AdminAuthGuardWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security & Protocol Health</h1>
          <p className="text-gray-600 mt-1">
            Monitor security events, ML risk detections, and protocol health status
          </p>
        </div>

        {/* Health Status Overview */}
        {platformHealth && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Platform Health Status</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                platformHealth.health_status === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                platformHealth.health_status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {platformHealth.health_status || 'UNKNOWN'}
              </span>
            </div>
            {platformHealth.alert_messages && platformHealth.alert_messages.length > 0 && (
              <div className="mt-4 space-y-2">
                {platformHealth.alert_messages.map((msg, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">{msg}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Auto-Blocked Users Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Auto-Blocked Users</h2>
            <p className="text-sm text-gray-600 mt-1">
              Users automatically blocked by ML risk assessment (score &gt; 0.90)
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : autoBlockedUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No auto-blocked users</p>
            ) : (
              <div className="space-y-3">
                {autoBlockedUsers.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">User #{item.user_id}</span>
                        {item.market_id && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Market #{item.market_id}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>Risk Level: {item.risk_level}</span>
                        <span>•</span>
                        <span className="font-medium text-red-600">AUTO-BANNED</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{item.score.toFixed(3)}</p>
                        <p className="text-xs text-gray-500">Heuristic Score</p>
                      </div>
                      <button
                        onClick={() => handleUnblockUser(item.user_id, 'Admin override')}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                        title="Unblock User"
                      >
                        <CheckCircle size={16} className="inline mr-1" />
                        Unblock
                      </button>
                      <button
                        onClick={() => handleOverrideML(item.id, 'review')}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                        title="Review"
                      >
                        <Eye size={16} className="inline mr-1" />
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ML Risk Detections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">ML Risk Detections</h2>
            <p className="text-sm text-gray-600 mt-1">
              Recent risk assessments with confidence scores (heuristic-based)
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : mlDetections.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent detections</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {mlDetections.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">User #{item.user_id}</span>
                        {item.market_id && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">Market #{item.market_id}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>Risk: {item.risk_level}</span>
                        <span>•</span>
                        <span className={item.score > 0.85 ? 'text-red-600 font-medium' : ''}>
                          Score: {item.score.toFixed(3)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.score > 0.90 ? 'bg-red-100 text-red-800' :
                        item.score > 0.85 ? 'bg-orange-100 text-orange-800' :
                        item.score > 0.50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.label || item.risk_level}
                      </span>
                      {item.score > 0.85 && (
                        <button
                          onClick={() => handleOverrideML(item.id, 'override')}
                          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Override ML Decision"
                        >
                          Override
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Events Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Security Events Timeline</h2>
            <p className="text-sm text-gray-600 mt-1">Recent security events and anomalies</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : securityLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No security events</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {securityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{log.event_type}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          log.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          log.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          log.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{log.message || log.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        {log.ip && (
                          <>
                            <span>•</span>
                            <span className="font-mono">IP: {log.ip}</span>
                          </>
                        )}
                        {log.path && (
                          <>
                            <span>•</span>
                            <span className="font-mono truncate">{log.path}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Statistics */}
        {securityStats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-2xl font-bold">{securityStats.total || 0}</p>
              </div>
              {Object.entries(securityStats.by_severity || {}).map(([severity, count]) => (
                <div key={severity}>
                  <p className="text-sm text-gray-600 mb-1">{severity}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suspicious Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Suspicious Users</h2>
            <p className="text-sm text-gray-600 mt-1">
              Users flagged by ML risk assessment (score &gt; 0.8)
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : suspiciousUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No suspicious users</p>
            ) : (
              <div className="space-y-2">
                {suspiciousUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.reason} • Last flagged: {new Date(user.last_flagged).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{user.risk_score.toFixed(3)}</p>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                          {user.risk_level}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUnblockUser(user.user_id, user.reason)}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        <Ban size={16} className="inline mr-1" />
                        Block
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminAuthGuardWrapper>
  );
}

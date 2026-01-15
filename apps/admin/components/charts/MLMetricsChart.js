/**
 * ML Model Performance Metrics Chart
 * 
 * Displays ML model metrics over time
 * Features:
 * - Multiple metrics comparison
 * - Bar/Line combination chart
 * - Performance indicators
 */

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MLMetricsChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No ML metrics data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="date"
          stroke="#666"
          tick={{ fill: '#666' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis yAxisId="left" stroke="#666" tick={{ fill: '#666' }} />
        <YAxis yAxisId="right" orientation="right" stroke="#666" tick={{ fill: '#666' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="predictions" name="Predictions" fill="#8b5cf6" />
        <Bar yAxisId="left" dataKey="blocked" name="Blocked" fill="#ef4444" />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="accuracy"
          name="Accuracy %"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

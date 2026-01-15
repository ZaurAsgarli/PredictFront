/**
 * Revenue Flow Chart Component
 * 
 * Displays revenue over time using Recharts
 * Features:
 * - Area chart for revenue visualization
 * - Cumulative and daily revenue
 * - Custom colors and styling
 */

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No revenue data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="date"
          stroke="#666"
          tick={{ fill: '#666' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#666" tick={{ fill: '#666' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
          formatter={(value) => `$${value.toLocaleString()}`}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          name="Cumulative Revenue"
          stroke="#059669"
          fillOpacity={0.3}
          fill="#059669"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

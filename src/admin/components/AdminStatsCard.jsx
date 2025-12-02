import { LucideIcon } from 'lucide-react';

export default function AdminStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'positive',
  loading = false 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
          {change && (
            <p className={`text-sm mt-2 ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${
            changeType === 'positive' ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            <Icon 
              size={24} 
              className={changeType === 'positive' ? 'text-green-600' : 'text-blue-600'} 
            />
          </div>
        )}
      </div>
    </div>
  );
}


export default function KPICard({ title, value, icon, trend, trendLabel, color = '#0066ff' }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-lg" style={{ color }}>{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {trend != null && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${trend >= 0 ? 'text-success' : 'text-error'}`}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% {trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  )
}

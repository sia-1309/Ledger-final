export default function KPICard({ title, value, icon, trend, trendLabel, color = '#7E102C', subtitle }) {
  return (
    <div className="bg-white rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06), 0 1px 2px rgba(88,66,63,0.04)', transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#8a7370]">{title}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}12`, color }}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-[#58423F]">{value}</div>
      {subtitle && <div className="text-xs text-[#8a7370] mt-1">{subtitle}</div>}
      {trend != null && (
        <div className={`flex items-center gap-1 text-xs mt-2 ${trend >= 0 ? 'text-[#2d6a4f]' : 'text-[#9b2226]'}`}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% {trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  )
}

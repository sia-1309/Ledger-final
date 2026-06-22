import { useNavigate } from 'react-router-dom'

const actions = [
  { label: 'Record Sale', to: '/customers', icon: '📄' },
  { label: 'Pay Supplier', to: '/suppliers', icon: '💳' },
  { label: 'Reorder Stock', to: '/inventory', icon: '📦' },
  { label: 'View Reports', to: '/reports', icon: '📊' },
]

export default function QuickActions() {
  const navigate = useNavigate()
  return (
    <div>
      <h3 className="font-semibold text-sm mb-2">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(a => (
          <button key={a.label} onClick={() => navigate(a.to)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <span>{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AlertZone({ lowStockItems, overdueSuppliers }) {
  const alerts = [
    ...(lowStockItems || []).map(i => ({ type: 'warning', message: `Low stock: ${i.name} (${i.qty} left)` })),
    ...(overdueSuppliers || []).map(s => ({ type: 'error', message: `Overdue: ₹${s.balance} to ${s.name}` })),
  ]
  if (!alerts.length) return null
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Alerts</h3>
      {alerts.map((a, i) => (
        <div key={i} className={`px-3 py-2 rounded-md text-sm ${a.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-error' : 'bg-amber-50 dark:bg-amber-900/20 text-warning'}`}>
          {a.type === 'error' ? '⚠' : '⚡'} {a.message}
        </div>
      ))}
    </div>
  )
}

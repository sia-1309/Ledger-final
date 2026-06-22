import { formatCurrency, formatDate } from '../../utils/formatters'

export default function RecentTransactions({ transactions = [], expenses = [], suppliers = [], type }) {
  if (type === 'expenses') {
    const recent = expenses.slice(0, 10)
    return (
      <div>
        <h3 className="font-semibold text-sm mb-2">Recent Expenses</h3>
        <div className="space-y-1">
          {recent.map(e => (
            <div key={e.id} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 text-xs">{formatDate(e.date)}</span>
              <span className="flex-1 ml-2">{e.category}</span>
              <span className="font-medium">{formatCurrency(e.amount)}</span>
            </div>
          ))}
          {!recent.length && <p className="text-sm text-gray-400">No recent expenses</p>}
        </div>
      </div>
    )
  }

  const recent = transactions.slice(0, 10)
  return (
    <div>
      <h3 className="font-semibold text-sm mb-2">Recent Transactions</h3>
      <div className="space-y-1">
        {recent.map(t => {
          const sup = suppliers.find(s => s.id === t.supplier_id)
          return (
            <div key={t.id} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 text-xs">{formatDate(t.date)}</span>
              <span className="flex-1 ml-2">{sup?.name || 'Unknown'}</span>
              <span className="font-medium">{formatCurrency(t.total)}</span>
            </div>
          )
        })}
        {!recent.length && <p className="text-sm text-gray-400">No recent transactions</p>}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabaseClient'
import { formatCurrency } from '../../utils/formatters'
import { getExecutiveSummary, calculateSupplierBalance, getLowStockItems } from '../../utils/calculations'
import KPICard from './KPICard'
import AlertZone from './AlertZone'
import QuickActions from './QuickActions'
import RecentTransactions from './RecentTransactions'

export default function Dashboard() {
  const [data, setData] = useState({ suppliers: [], customers: [], transactions: [], payments: [], invoices: [], receipts: [], expenses: [], inventory: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const tables = ['suppliers', 'customers', 'transactions', 'payments', 'sales_invoices', 'receipts', 'expenses', 'inventory']
      const results = await Promise.all(tables.map(t => supabase.from(t).select('*').eq('user_id', user.id)))
      const map = {}
      tables.forEach((t, i) => { map[t] = results[i].data || [] })
      // rename sales_invoices to invoices for convenience
      map.invoices = map.sales_invoices
      setData(map)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  const { suppliers, customers, transactions, payments, invoices, receipts, expenses, inventory } = data
  const summary = getExecutiveSummary(data)
  const lowStock = getLowStockItems(inventory)
  const topSuppliers = [...suppliers].slice(0, 5).map(s => {
    const supTxns = transactions.filter(t => t.supplier_id === s.id)
    const supPmts = payments.filter(p => supTxns.some(t => t.id === p.transaction_id))
    const { balance } = calculateSupplierBalance(s, supTxns, supPmts)
    return { ...s, balance }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Outstanding" value={formatCurrency(summary.totalOutstanding)} icon="💰" color="#0066ff" />
        <KPICard title="Receivable" value={formatCurrency(summary.totalReceivable)} icon="📈" color="#10b981" />
        <KPICard title="Monthly Expenses" value={formatCurrency(summary.totalMonthlyExpenses)} icon="📉" color="#f59e0b" />
        <KPICard title="Low Stock Items" value={summary.lowStockCount} icon="📦" color="#ef4444" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <AlertZone lowStockItems={lowStock} />
          <QuickActions />
        </div>
        <RecentTransactions transactions={transactions} suppliers={suppliers} />
        <RecentTransactions expenses={expenses} type="expenses" />
      </div>
      {topSuppliers.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Top Suppliers by Balance</h3>
          <div className="space-y-1">
            {topSuppliers.map(s => (
              <div key={s.id} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800">
                <span>{s.name}</span>
                <span className={s.balance > 0 ? 'text-error font-medium' : 'text-success'}>{formatCurrency(s.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

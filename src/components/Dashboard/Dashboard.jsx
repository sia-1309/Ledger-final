import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabaseClient'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { getExecutiveSummary, calculateSupplierBalance, getLowStockItems, calculateCustomerBalance, calculateInventoryValue, getMonthlyExpenseTrend, getTotalReceivable } from '../../utils/calculations'
import { useNavigate } from 'react-router-dom'
import { Coin, TrendUp, CurrencyDollar, Package, WarningCircle, ArrowRight, Plus, UserPlus, Truck, Receipt, CheckCircle, Clock, ChartBar } from '@phosphor-icons/react'
import KPICard from './KPICard'

function getMonthlyIncomeTrend(invoices, months = 6) {
  const trend = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const total = (invoices || []).filter(inv => {
      const ed = new Date(inv.date || inv.created_at)
      return `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}` === key
    }).reduce((s, inv) => s + Number(inv.total || 0), 0)
    trend.push({ month: key, total })
  }
  return trend
}

function getTopCustomers(customers, invoices, receipts) {
  return [...customers]
    .map(c => ({ ...c, ...calculateCustomerBalance(c, invoices.filter(i => i.customer_id === c.id), receipts.filter(r => r.customer_id === c.id)) }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)
}

function getTopSuppliers(suppliers, transactions, payments) {
  return [...suppliers]
    .map(s => ({ ...s, ...calculateSupplierBalance(s, transactions.filter(t => t.supplier_id === s.id), payments.filter(p => p.supplier_id === s.id)) }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)
}

function getOverdueCustomers(customers, invoices, receipts) {
  return customers
    .map(c => ({ ...c, ...calculateCustomerBalance(c, invoices.filter(i => i.customer_id === c.id), receipts.filter(r => r.customer_id === c.id)) }))
    .filter(c => c.balance > 0)
}

function getOverdueSuppliers(suppliers, transactions, payments) {
  return suppliers
    .map(s => ({ ...s, ...calculateSupplierBalance(s, transactions.filter(t => t.supplier_id === s.id), payments.filter(p => p.supplier_id === s.id)) }))
    .filter(s => s.balance > 0)
}

export default function Dashboard() {
  const navigate = useNavigate()
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
      map.invoices = map.sales_invoices
      setData(map)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#7E102C] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { suppliers, customers, transactions, payments, invoices, receipts, expenses, inventory } = data
  const summary = getExecutiveSummary(data)
  const lowStock = getLowStockItems(inventory)
  const monthlyExpenseTrend = getMonthlyExpenseTrend(expenses, 6)
  const monthlyIncomeTrend = getMonthlyIncomeTrend(invoices, 6)
  const topCustomers = getTopCustomers(customers, invoices, receipts)
  const topSuppliers = getTopSuppliers(suppliers, transactions, payments)
  const overdueCx = getOverdueCustomers(customers, invoices, receipts)
  const overdueSup = getOverdueSuppliers(suppliers, transactions, payments)
  const inventoryValue = calculateInventoryValue(inventory)
  const monthlyRevenue = monthlyIncomeTrend[monthlyIncomeTrend.length - 1]?.total || 0

  const monthLabels = monthlyExpenseTrend.map(t => {
    const [y, m] = t.month.split('-')
    return new Date(y, m - 1).toLocaleString('en', { month: 'short' })
  })

  const maxVal = Math.max(
    ...monthlyExpenseTrend.map(t => t.total),
    ...monthlyIncomeTrend.map(t => t.total),
    1
  )

  const activities = [
    ...(invoices || []).slice(0, 3).map(i => ({ type: 'sale', text: `Sale recorded: ₹${Number(i.total).toLocaleString()}`, date: i.date || i.created_at, id: i.id })),
    ...(expenses || []).slice(0, 3).map(e => ({ type: 'expense', text: `Expense added: ${e.category}`, date: e.date, id: e.id })),
    ...(receipts || []).slice(0, 3).map(r => ({ type: 'payment', text: `Payment received: ₹${Number(r.amount).toLocaleString()}`, date: r.date, id: r.id })),
    ...(payments || []).slice(0, 3).map(p => ({ type: 'paid', text: `Supplier paid: ₹${Number(p.amount).toLocaleString()}`, date: p.date, id: p.id })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)

  const typeConfig = {
    sale: { icon: CheckCircle, color: '#2d6a4f', bg: '#e8f5e9' },
    expense: { icon: CurrencyDollar, color: '#9b2226', bg: '#fce7ea' },
    payment: { icon: TrendUp, color: '#2d6a4f', bg: '#e8f5e9' },
    paid: { icon: Clock, color: '#b8860b', bg: '#fef3c7' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#58423F] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#8a7370] mt-0.5">Your business at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/customers?action=sale')} className="flex items-center gap-1.5 px-3 py-2 bg-[#7E102C] text-white rounded-lg text-sm font-medium hover:bg-[#6b142b] transition-all duration-200 active:scale-[0.97]"><Plus size={15} /> Sale</button>
          <button onClick={() => navigate('/customers?action=add')} className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#58423F] rounded-lg text-sm font-medium border border-[#D7A9A8] hover:bg-[#f5f0eb] transition-all duration-200 active:scale-[0.97]"><UserPlus size={15} /> Customer</button>
          <button onClick={() => navigate('/suppliers?action=add')} className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#58423F] rounded-lg text-sm font-medium border border-[#D7A9A8] hover:bg-[#f5f0eb] transition-all duration-200 active:scale-[0.97]"><Truck size={15} /> Supplier</button>
          <button onClick={() => navigate('/expenses?action=add')} className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#58423F] rounded-lg text-sm font-medium border border-[#D7A9A8] hover:bg-[#f5f0eb] transition-all duration-200 active:scale-[0.97]"><Receipt size={15} /> Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard title="Outstanding" value={formatCurrency(summary.totalOutstanding)} icon={<Coin size={18} />} color="#7E102C" />
        <KPICard title="Receivable" value={formatCurrency(summary.totalReceivable)} icon={<TrendUp size={18} />} color="#2d6a4f" />
        <KPICard title="Monthly Revenue" value={formatCurrency(monthlyRevenue)} icon={<ChartBar size={18} />} color="#b8860b" subtitle="This month" />
        <KPICard title="Monthly Expenses" value={formatCurrency(summary.totalMonthlyExpenses)} icon={<CurrencyDollar size={18} />} color="#9b2226" />
        <KPICard title="Inventory Value" value={formatCurrency(inventoryValue)} icon={<Package size={18} />} color="#58423F" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#58423F]">Cash Flow</h3>
            <span className="text-[10px] font-medium tracking-wide text-[#8a7370] uppercase">Last 6 Months</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {monthlyIncomeTrend.map((inc, i) => {
              const exp = monthlyExpenseTrend[i]?.total || 0
              const incH = (inc.total / maxVal) * 100
              const expH = (exp / maxVal) * 100
              return (
                <div key={inc.month} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                  <div className="w-full flex flex-col items-center gap-0.5 justify-end" style={{ height: `${Math.max(incH, expH, 4)}%` }}>
                    <div className="w-full rounded-t-sm bg-[#7E102C] transition-all duration-500" style={{ height: `${incH || 2}%`, minHeight: inc.total > 0 ? '4px' : '2px', opacity: inc.total > 0 ? 1 : 0.3 }} title={`Income: ${formatCurrency(inc.total)}`} />
                    <div className="w-full rounded-t-sm bg-[#D7A9A8] transition-all duration-500" style={{ height: `${expH || 2}%`, minHeight: exp.total > 0 ? '4px' : '2px', opacity: exp.total > 0 ? 1 : 0.3 }} title={`Expense: ${formatCurrency(exp.total)}`} />
                  </div>
                  <span className="text-[10px] text-[#8a7370] mt-1">{monthLabels[i]}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#8a7370]">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#7E102C]" /> Income</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#D7A9A8]" /> Expenses</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
            <h3 className="text-sm font-semibold text-[#58423F] mb-3">Alerts</h3>
            <div className="space-y-2">
              {overdueSup.length > 0 && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-[#fef3c7]">
                  <WarningCircle size={16} className="text-[#b8860b] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#58423F]">{overdueSup.length} Pending Supplier Payments</p>
                    <p className="text-xs text-[#8a7370]">Total: {formatCurrency(overdueSup.reduce((s, su) => s + su.balance, 0))}</p>
                  </div>
                </div>
              )}
              {lowStock.length > 0 && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-[#fce7ea]">
                  <Package size={16} className="text-[#9b2226] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#58423F]">{lowStock.length} Low Stock Products</p>
                    <p className="text-xs text-[#8a7370]">{lowStock.map(i => i.name).join(', ')}</p>
                  </div>
                </div>
              )}
              {overdueCx.length > 0 && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-[#fce7ea]">
                  <WarningCircle size={16} className="text-[#9b2226] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#58423F]">{overdueCx.length} Overdue Customers</p>
                    <p className="text-xs text-[#8a7370]">Receivable: {formatCurrency(overdueCx.reduce((s, c) => s + c.balance, 0))}</p>
                  </div>
                </div>
              )}
              {!overdueSup.length && !lowStock.length && !overdueCx.length && (
                <p className="text-sm text-[#8a7370]">All clear — no alerts</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
            <h3 className="text-sm font-semibold text-[#58423F] mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate('/customers?action=sale')} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#7E102C] text-white text-sm font-medium hover:bg-[#6b142b] transition-all duration-200 active:scale-[0.97]"><Plus size={15} /> Sale</button>
              <button onClick={() => navigate('/customers?action=add')} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white text-[#58423F] text-sm font-medium border border-[#D7A9A8] hover:bg-[#f5f0eb] transition-all duration-200 active:scale-[0.97]"><UserPlus size={15} /> Customer</button>
              <button onClick={() => navigate('/suppliers?action=add')} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white text-[#58423F] text-sm font-medium border border-[#D7A9A8] hover:bg-[#f5f0eb] transition-all duration-200 active:scale-[0.97]"><Truck size={15} /> Supplier</button>
              <button onClick={() => navigate('/expenses?action=add')} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white text-[#58423F] text-sm font-medium border border-[#D7A9A8] hover:bg-[#f5f0eb] transition-all duration-200 active:scale-[0.97]"><Receipt size={15} /> Expense</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <h3 className="text-sm font-semibold text-[#58423F] mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {activities.map((a, i) => {
              const cfg = typeConfig[a.type]
              const Icon = cfg.icon
              return (
                <div key={`${a.type}-${a.id}-${i}`} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f5f0eb] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                    <Icon size={14} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#58423F] truncate">{a.text}</p>
                    <p className="text-xs text-[#8a7370]">{formatDate(a.date)}</p>
                  </div>
                </div>
              )
            })}
            {!activities.length && <p className="text-sm text-[#8a7370] py-2">No recent activity</p>}
          </div>
        </div>

        <div className="space-y-4">
          {topCustomers.length > 0 && (
            <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#58423F]">Top Customers</h3>
                <button onClick={() => navigate('/customers')} className="text-xs font-medium text-[#7E102C] hover:text-[#6b142b] flex items-center gap-0.5">View All <ArrowRight size={12} /></button>
              </div>
              <div className="space-y-2">
                {topCustomers.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-[#58423F]">{c.name}</span>
                    <span className={`text-sm font-medium ${c.balance > 0 ? 'text-[#9b2226]' : 'text-[#2d6a4f]'}`}>{formatCurrency(c.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {topSuppliers.length > 0 && (
            <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#58423F]">Top Suppliers</h3>
                <button onClick={() => navigate('/suppliers')} className="text-xs font-medium text-[#7E102C] hover:text-[#6b142b] flex items-center gap-0.5">View All <ArrowRight size={12} /></button>
              </div>
              <div className="space-y-2">
                {topSuppliers.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-[#58423F]">{s.name}</span>
                    <span className={`text-sm font-medium ${s.balance > 0 ? 'text-[#9b2226]' : 'text-[#2d6a4f]'}`}>{formatCurrency(s.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

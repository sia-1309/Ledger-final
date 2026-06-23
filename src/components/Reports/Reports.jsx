import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../config/supabaseClient'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { calculateSupplierBalance, calculateCustomerBalance, getTotalExpenses, getExpensesByCategory, getMonthlyExpenseTrend, calculateInventoryValue, getLowStockItems } from '../../utils/calculations'
import { EXPENSE_CATEGORY_COLORS } from '../../models/dataModels'
import { exportToCSV } from '../../utils/exportUtils'

const TABS = ['Executive Summary', 'Supplier Report', 'Customer Report', 'Expense Report', 'Inventory Report']

export default function Reports() {
  const [tab, setTab] = useState(0)
  const [data, setData] = useState({ suppliers: [], customers: [], transactions: [], payments: [], invoices: [], receipts: [], expenses: [], inventory: [] })
  const [dateRange, setDateRange] = useState('all')

  const fetchAll = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const tables = ['suppliers', 'customers', 'transactions', 'payments', 'sales_invoices', 'receipts', 'expenses', 'inventory']
    const results = await Promise.all(tables.map(t => supabase.from(t).select('*').eq('user_id', user.id)))
    const map = {}
    tables.forEach((t, i) => { map[t] = results[i].data || [] })
    map.invoices = map.sales_invoices
    setData(map)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const getFiltered = (items, dateField = 'date') => {
    if (dateRange === 'all') return items
    const now = new Date()
    let start
    if (dateRange === 'week') { start = new Date(now); start.setDate(start.getDate() - 7) }
    else if (dateRange === 'month') { start = new Date(now); start.setMonth(start.getMonth() - 1) }
    else if (dateRange === 'quarter') { start = new Date(now); start.setMonth(start.getMonth() - 3) }
    else if (dateRange === 'year') { start = new Date(now); start.setFullYear(start.getFullYear() - 1) }
    return items.filter(i => new Date(i[dateField]) >= start)
  }

  const { suppliers, customers, transactions, payments, invoices, receipts, expenses, inventory } = data
  const filteredTxns = getFiltered(transactions)
  const filteredPmts = getFiltered(payments)
  const filteredInvs = getFiltered(invoices)
  const filteredRecs = getFiltered(receipts)
  const filteredExp = getFiltered(expenses)
  const totalValue = calculateInventoryValue(inventory)
  const lowStock = getLowStockItems(inventory)

  const renderTab = () => {
    switch (tab) {
      case 0: return <ExecutiveSummary data={data} filteredExp={filteredExp} />
      case 1: return <SupplierReport suppliers={suppliers} transactions={filteredTxns} payments={filteredPmts} />
      case 2: return <CustomerReport customers={customers} invoices={filteredInvs} receipts={filteredRecs} />
      case 3: return <ExpenseReport expenses={filteredExp} />
      case 4: return <InventoryReport inventory={inventory} suppliers={suppliers} totalValue={totalValue} lowStock={lowStock} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#7E102C]">Reports</h1>
        <div className="flex gap-2">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="h-10 px-3 border border-[#E1D3CC] rounded-md text-sm bg-white text-[#58423F]">
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#E1D3CC]">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${i === tab ? 'border-[#7E102C] text-[#7E102C]' : 'border-transparent text-[#8a7370] hover:text-[#58423F]'}`}>{t}</button>
        ))}
      </div>

      {renderTab()}
    </div>
  )
}

function ExecutiveSummary({ data, filteredExp }) {
  const { suppliers, customers, transactions, payments, invoices, receipts, inventory } = data
  const totalOutstanding = suppliers.reduce((s, sup) => {
    const supTxns = transactions.filter(t => t.supplier_id === sup.id)
    const supPmts = payments.filter(p => supTxns.some(t => t.id === p.transaction_id))
    return s + calculateSupplierBalance(sup, supTxns, supPmts).balance
  }, 0)
  const totalReceivable = customers.reduce((s, c) => s + Number(c.opening_balance || 0), 0) + invoices.reduce((s, i) => s + Number(i.total || 0), 0) - receipts.reduce((s, r) => s + Number(r.amount || 0), 0)
  const monthlyExpTotal = getTotalExpenses(filteredExp)
  const trend = getMonthlyExpenseTrend(data.expenses, 12)
  const byCategory = getExpensesByCategory(data.expenses)
  const topSupplier = [...suppliers].sort((a, b) => Number(b.opening_balance || 0) - Number(a.opening_balance || 0))[0]
  const highestExp = byCategory.sort((a, b) => b.total - a.total)[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-3" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}><p className="text-xs text-[#8a7370]">Outstanding</p><p className="text-xl font-bold text-[#58423F]">{formatCurrency(totalOutstanding)}</p></div>
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-3" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}><p className="text-xs text-[#8a7370]">Receivable</p><p className="text-xl font-bold text-[#58423F]">{formatCurrency(totalReceivable)}</p></div>
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-3" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}><p className="text-xs text-[#8a7370]">Expenses (filtered)</p><p className="text-xl font-bold text-[#58423F]">{formatCurrency(monthlyExpTotal)}</p></div>
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-3" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}><p className="text-xs text-[#8a7370]">Low Stock</p><p className="text-xl font-bold text-[#9b2226]">{getLowStockItems(inventory).length}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2 text-[#58423F]">Monthly Expense Trend</h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {trend.map(t => <div key={t.month} className="flex justify-between text-sm py-1 border-b border-[#E1D3CC] text-[#58423F]"><span>{t.month}</span><span>{formatCurrency(t.total)}</span></div>)}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-[#58423F]">Category Breakdown</h3>
          <div className="space-y-2">
            {byCategory.map(c => <div key={c.category} className="flex justify-between text-sm text-[#58423F]"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor: EXPENSE_CATEGORY_COLORS[c.category]}} />{c.category}</span><span>{formatCurrency(c.total)}</span></div>)}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-[#E1D3CC] p-4 text-sm" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
        <p className="text-[#58423F]"><strong>Top Supplier:</strong> {topSupplier?.name || 'N/A'} ({formatCurrency(topSupplier?.opening_balance || 0)})</p>
        <p className="text-[#58423F]"><strong>Highest Expense Category:</strong> {highestExp?.category || 'N/A'} ({formatCurrency(highestExp?.total || 0)})</p>
      </div>
    </div>
  )
}

function SupplierReport({ suppliers, transactions, payments }) {
  const rows = suppliers.map(s => {
    const supTxns = transactions.filter(t => t.supplier_id === s.id)
    const supPmts = payments.filter(p => supTxns.some(t => t.id === p.transaction_id))
    const { balance, totalPurchased, totalPaid, status } = calculateSupplierBalance(s, supTxns, supPmts)
    return { name: s.name, purchased: totalPurchased, paid: totalPaid, balance, status }
  })
  return (
    <div>
      <div className="flex justify-between mb-2"><h3 className="font-semibold text-[#58423F]">Supplier Report</h3><button onClick={() => exportToCSV(rows, 'supplier-report')} className="text-sm text-[#7E102C] hover:underline">Export CSV</button></div>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-[#E1D3CC]"><th className="text-left py-2 text-[#8a7370]">Supplier</th><th className="text-right py-2 text-[#8a7370]">Purchased</th><th className="text-right py-2 text-[#8a7370]">Paid</th><th className="text-right py-2 text-[#8a7370]">Balance</th><th className="text-left py-2 text-[#8a7370]">Status</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.name} className="border-b border-[#E1D3CC]"><td className="py-2 text-[#58423F]">{r.name}</td><td className="py-2 text-right text-[#58423F]">{formatCurrency(r.purchased)}</td><td className="py-2 text-right text-[#58423F]">{formatCurrency(r.paid)}</td><td className="py-2 text-right font-medium text-[#58423F]">{formatCurrency(r.balance)}</td><td className="py-2 text-[#58423F]">{r.status}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

function CustomerReport({ customers, invoices, receipts }) {
  const rows = customers.map(c => {
    const cInvs = invoices.filter(i => i.customer_id === c.id)
    const cRecs = receipts.filter(r => cInvs.some(i => i.id === r.invoice_id))
    const { balance, totalSold, totalReceived, status } = calculateCustomerBalance(c, cInvs, cRecs)
    return { name: c.name, sold: totalSold, received: totalReceived, balance, status }
  })
  return (
    <div>
      <div className="flex justify-between mb-2"><h3 className="font-semibold text-[#58423F]">Customer Report</h3><button onClick={() => exportToCSV(rows, 'customer-report')} className="text-sm text-[#7E102C] hover:underline">Export CSV</button></div>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-[#E1D3CC]"><th className="text-left py-2 text-[#8a7370]">Customer</th><th className="text-right py-2 text-[#8a7370]">Sold</th><th className="text-right py-2 text-[#8a7370]">Received</th><th className="text-right py-2 text-[#8a7370]">Balance</th><th className="text-left py-2 text-[#8a7370]">Status</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.name} className="border-b border-[#E1D3CC]"><td className="py-2 text-[#58423F]">{r.name}</td><td className="py-2 text-right text-[#58423F]">{formatCurrency(r.sold)}</td><td className="py-2 text-right text-[#58423F]">{formatCurrency(r.received)}</td><td className="py-2 text-right font-medium text-[#58423F]">{formatCurrency(r.balance)}</td><td className="py-2 text-[#58423F]">{r.status}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

function ExpenseReport({ expenses }) {
  const byCategory = getExpensesByCategory(expenses)
  const total = getTotalExpenses(expenses)
  const monthly = getMonthlyExpenseTrend(expenses, 12)
  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h3 className="font-semibold text-[#58423F]">Expense Report</h3><button onClick={() => exportToCSV(byCategory, 'expense-report')} className="text-sm text-[#7E102C] hover:underline">Export CSV</button></div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2 text-[#58423F]">Category Breakdown</h4>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#E1D3CC]"><th className="text-left py-1 text-[#8a7370]">Category</th><th className="text-right py-1 text-[#8a7370]">Count</th><th className="text-right py-1 text-[#8a7370]">Total</th><th className="text-right py-1 text-[#8a7370]">%</th></tr></thead>
            <tbody>{byCategory.map(c => <tr key={c.category} className="border-b border-[#E1D3CC]"><td className="py-1 text-[#58423F]">{c.category}</td><td className="py-1 text-right text-[#58423F]">{c.count}</td><td className="py-1 text-right text-[#58423F]">{formatCurrency(c.total)}</td><td className="py-1 text-right text-[#58423F]">{total ? ((c.total / total) * 100).toFixed(1) : 0}%</td></tr>)}</tbody>
          </table>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2 text-[#58423F]">Monthly Breakdown</h4>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {monthly.map(m => <div key={m.month} className="flex justify-between text-sm py-1 border-b border-[#E1D3CC] text-[#58423F]"><span>{m.month}</span><span>{formatCurrency(m.total)}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

function InventoryReport({ inventory, suppliers, totalValue, lowStock }) {
  const rows = inventory.map(i => {
    const sup = suppliers.find(s => s.id === i.supplier_id)
    const value = Number(i.qty || 0) * Number(i.unit_price || 0)
    return { sku: i.sku, name: i.name, qty: i.qty, price: i.unit_price, value, supplier: sup?.name || '-' }
  })
  const topSupplier = [...suppliers].map(s => ({ name: s.name, count: inventory.filter(i => i.supplier_id === s.id).length })).sort((a, b) => b.count - a.count)[0]

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h3 className="font-semibold text-[#58423F]">Inventory Report</h3><button onClick={() => exportToCSV(rows, 'inventory-report')} className="text-sm text-[#7E102C] hover:underline">Export CSV</button></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-3" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}><p className="text-xs text-[#8a7370]">Total Value</p><p className="text-lg font-bold text-[#58423F]">{formatCurrency(totalValue)}</p></div>
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-3" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}><p className="text-xs text-[#8a7370]">Low Stock Items</p><p className="text-lg font-bold text-[#9b2226]">{lowStock.length}</p></div>
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-3" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}><p className="text-xs text-[#8a7370]">Top Supplier</p><p className="text-lg font-bold text-[#58423F]">{topSupplier?.name || 'N/A'}</p></div>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-[#E1D3CC]"><th className="text-left py-2 text-[#8a7370]">SKU</th><th className="text-left py-2 text-[#8a7370]">Name</th><th className="text-right py-2 text-[#8a7370]">Qty</th><th className="text-right py-2 text-[#8a7370]">Price</th><th className="text-right py-2 text-[#8a7370]">Value</th><th className="text-left py-2 text-[#8a7370]">Supplier</th></tr></thead>
        <tbody>{inventory.map(i => <tr key={i.id} className="border-b border-[#E1D3CC]"><td className="py-2 font-mono text-xs text-[#58423F]">{i.sku}</td><td className="py-2 text-[#58423F]">{i.name}</td><td className="py-2 text-right text-[#58423F]">{i.qty}</td><td className="py-2 text-right text-[#58423F]">{formatCurrency(i.unit_price)}</td><td className="py-2 text-right font-medium text-[#58423F]">{formatCurrency(Number(i.qty || 0) * Number(i.unit_price || 0))}</td><td className="py-2 text-xs text-[#8a7370]">{suppliers.find(s => s.id === i.supplier_id)?.name || '-'}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

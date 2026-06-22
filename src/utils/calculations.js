export function calculateSupplierBalance(supplier, transactions, payments) {
  const totalPurchased = (transactions || []).reduce((s, t) => s + Number(t.total || 0), 0)
  const totalPaid = (payments || []).reduce((s, p) => s + Number(p.amount || 0), 0)
  const balance = Number(supplier.opening_balance || 0) + totalPurchased - totalPaid
  let status = 'Pending'
  if (balance === 0 && totalPaid > 0) status = 'Paid'
  else if (balance > 0 && totalPaid > 0) status = 'Partial'
  else if (balance === 0 && totalPaid === 0 && totalPurchased === 0) status = 'Paid'
  return { balance, totalPurchased, totalPaid, status }
}

export function calculateCustomerBalance(customer, invoices, receipts) {
  const totalSold = (invoices || []).reduce((s, i) => s + Number(i.total || 0), 0)
  const totalReceived = (receipts || []).reduce((s, r) => s + Number(r.amount || 0), 0)
  const balance = Number(customer.opening_balance || 0) + totalSold - totalReceived
  let status = 'Pending'
  if (balance === 0 && totalReceived > 0) status = 'Paid'
  else if (balance > 0 && totalReceived > 0) status = 'Partial'
  else if (balance === 0 && totalReceived === 0 && totalSold === 0) status = 'Paid'
  return { balance, totalSold, totalReceived, status }
}

export function getTotalExpenses(expenses) {
  return (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0)
}

export function getExpensesByCategory(expenses) {
  const map = {}
  for (const e of expenses || []) {
    const cat = e.category || 'Other'
    if (!map[cat]) map[cat] = { category: cat, count: 0, total: 0 }
    map[cat].count++
    map[cat].total += Number(e.amount || 0)
  }
  return Object.values(map)
}

export function getMonthlyExpenseTrend(expenses, months = 12) {
  const trend = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const total = (expenses || []).filter(e => {
      const ed = new Date(e.date)
      return `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}` === key
    }).reduce((s, e) => s + Number(e.amount || 0), 0)
    trend.push({ month: key, total })
  }
  return trend
}

export function calculateInventoryValue(items) {
  return (items || []).reduce((s, i) => s + Number(i.qty || 0) * Number(i.unit_price || 0), 0)
}

export function getLowStockItems(items) {
  return (items || []).filter(i => Number(i.qty || 0) < Number(i.reorder_qty || 10))
}

export function getInventoryStatus(qty, reorderQty) {
  if (Number(qty) === 0) return 'Low'
  if (Number(qty) < Number(reorderQty)) return 'Low'
  if (Number(qty) < Number(reorderQty) * 2) return 'Medium'
  return 'OK'
}

export function getTotalReceivable(invoices, receipts, customers) {
  const totalInvoiced = (invoices || []).reduce((s, i) => s + Number(i.total || 0), 0)
  const totalReceived = (receipts || []).reduce((s, r) => s + Number(r.amount || 0), 0)
  const totalOpening = (customers || []).reduce((s, c) => s + Number(c.opening_balance || 0), 0)
  return totalOpening + totalInvoiced - totalReceived
}

export function getExecutiveSummary({ suppliers, customers, expenses, inventory, transactions, payments, invoices, receipts }) {
  const totalOutstanding = (suppliers || []).reduce((s, sup) => {
    const supTxns = (transactions || []).filter(t => t.supplier_id === sup.id)
    const supPmts = (payments || []).filter(p => supTxns.some(t => t.id === p.transaction_id))
    return s + calculateSupplierBalance(sup, supTxns, supPmts).balance
  }, 0)
  const totalReceivable = getTotalReceivable(invoices, receipts, customers)
  const monthlyExpenses = (expenses || []).filter(e => {
    const d = new Date(e.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalMonthlyExpenses = getTotalExpenses(monthlyExpenses)
  const lowStockCount = getLowStockItems(inventory).length
  return { totalOutstanding, totalReceivable, totalMonthlyExpenses, lowStockCount }
}

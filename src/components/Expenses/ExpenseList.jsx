import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../config/supabaseClient'
import { getCachedUser } from '../../utils/auth'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_COLORS } from '../../models/dataModels'
import { getTotalExpenses, getExpensesByCategory, getMonthlyExpenseTrend } from '../../utils/calculations'
import { exportToCSV } from '../../utils/exportUtils'

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [form, setForm] = useState({ category: 'Other', description: '', amount: 0, date: new Date().toISOString().split('T')[0] })

  const fetchAll = useCallback(async () => {
    const user = await getCachedUser()
    if (!user) return
    const { data } = await supabase.from('expenses').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setExpenses(data)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true); const user = await getCachedUser()
    if (!user) { setLoading(false); return }
    const payload = { ...form, amount: Number(form.amount) || 0, user_id: user.id }
    if (editing) await supabase.from('expenses').update({...payload, updated_at: new Date().toISOString()}).eq('id', editing.id)
    else await supabase.from('expenses').insert(payload)
    setShowForm(false); setEditing(null); setForm({ category: 'Other', description: '', amount: 0, date: new Date().toISOString().split('T')[0] })
    await fetchAll(); setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    await supabase.from('expenses').delete().eq('id', id); await fetchAll()
  }

  const filtered = expenses.filter(e => {
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false
    if (search && !e.description?.toLowerCase().includes(search.toLowerCase()) && !e.category?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const total = getTotalExpenses(filtered)
  const byCategory = getExpensesByCategory(expenses)
  const trend = getMonthlyExpenseTrend(expenses, 6)
  const thisMonth = getTotalExpenses(expenses.filter(e => { const d = new Date(e.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }))
  const lastMonth = getTotalExpenses(expenses.filter(e => { const d = new Date(e.date); const n = new Date(); n.setMonth(n.getMonth() - 1); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Expenses</h1>
        <button onClick={() => { setEditing(null); setForm({ category: 'Other', description: '', amount: 0, date: new Date().toISOString().split('T')[0] }); setShowForm(true) }} className="px-4 h-10 bg-primary text-white rounded-md text-sm font-medium">+ Add Expense</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-3"><p className="text-xs text-gray-500">This Month</p><p className="text-xl font-bold">{formatCurrency(thisMonth)}</p></div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-3"><p className="text-xs text-gray-500">Last Month</p><p className="text-xl font-bold">{formatCurrency(lastMonth)}</p><span className={`text-xs ${thisMonth >= lastMonth ? 'text-error' : 'text-success'}`}>{thisMonth >= lastMonth ? '↑' : '↓'} vs prev</span></div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-3"><p className="text-xs text-gray-500">Total (filtered)</p><p className="text-xl font-bold">{formatCurrency(total)}</p></div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 max-w-lg">
          <h3 className="font-semibold mb-3">{editing ? 'Edit Expense' : 'Add Expense'}</h3>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Category</label><select name="category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md">{EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-medium mb-1">Amount</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md" required /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Description</label><input name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full h-10 px-3 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-xs font-medium mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md" /></div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 h-10 border rounded-md text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 h-10 bg-primary text-white rounded-md text-sm font-medium disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." className="flex-1 h-10 px-3 border border-gray-300 rounded-md" />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-10 px-3 border border-gray-300 rounded-md">
          <option value="All">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => exportToCSV(filtered, 'expenses')} className="px-3 h-10 border rounded-md text-sm">Export CSV</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Category Breakdown</h3>
          <div className="space-y-2">
            {byCategory.map(c => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: EXPENSE_CATEGORY_COLORS[c.category] }} /><span>{c.category}</span></div>
                <span>{formatCurrency(c.total)} ({c.count})</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Monthly Trend</h3>
          <div className="space-y-1">
            {trend.map(t => (
              <div key={t.month} className="flex justify-between text-sm py-1 border-b"><span>{t.month}</span><span>{formatCurrency(t.total)}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200"><th className="text-left py-2">Date</th><th className="text-left py-2">Category</th><th className="text-left py-2">Description</th><th className="text-right py-2">Amount</th><th className="text-right py-2">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 text-gray-500">{formatDate(e.date)}</td>
                <td className="py-2"><span className="px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: EXPENSE_CATEGORY_COLORS[e.category] || '#6b7280' }}>{e.category}</span></td>
                <td className="py-2">{e.description || '-'}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(e.amount)}</td>
                <td className="py-2 text-right">
                  <button onClick={() => { setEditing(e); setForm({ category: e.category, description: e.description || '', amount: e.amount, date: e.date }); setShowForm(true) }} className="text-primary text-xs hover:underline mr-2">Edit</button>
                  <button onClick={() => handleDelete(e.id)} className="text-error text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="text-center text-gray-400 py-8">No expenses found</p>}
      </div>
    </div>
  )
}

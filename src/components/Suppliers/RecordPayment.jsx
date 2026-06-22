import { useState } from 'react'

export default function RecordPayment({ suppliers, transactions, onSave, onCancel, loading }) {
  const [selectedSupplier, setSelectedSupplier] = useState(suppliers?.[0]?.id || '')
  const [form, setForm] = useState({ transaction_id: '', amount: 0, date: new Date().toISOString().split('T')[0], method: 'Cash' })

  const supplierTxns = transactions.filter(t => t.supplier_id === selectedSupplier && t.status !== 'Paid')
  const paidTotal = (txns) => {
    // placeholder for actual paid calculation
    return 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.transaction_id || !form.amount) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Supplier</label>
        <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Transaction</label>
        <select name="transaction_id" value={form.transaction_id} onChange={e => setForm({ ...form, transaction_id: e.target.value })} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" required>
          <option value="">Select transaction</option>
          {supplierTxns.map(t => <option key={t.id} value={t.id}>#{t.invoice_no || t.id.slice(0, 8)} - ₹{t.total}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input name="amount" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input name="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Method</label>
        <select name="method" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
          <option>Cash</option>
          <option>Cheque</option>
          <option>Bank Transfer</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 h-10 border border-gray-300 rounded-md text-sm">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 h-10 bg-primary text-white rounded-md text-sm font-medium disabled:opacity-50">{loading ? 'Saving...' : 'Record Payment'}</button>
      </div>
    </form>
  )
}

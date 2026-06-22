import { useState } from 'react'

export default function RecordReceipt({ invoices, onSave, onCancel, loading }) {
  const [form, setForm] = useState({ invoice_id: '', amount: 0, date: new Date().toISOString().split('T')[0], method: 'Cash' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.invoice_id || !form.amount) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Invoice</label>
        <select value={form.invoice_id} onChange={e => setForm({...form, invoice_id: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md" required>
          <option value="">Select invoice</option>
          {invoices.map(i => <option key={i.id} value={i.id}>#{i.invoice_no || i.id.slice(0,8)} - ₹{i.total}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Amount</label><input name="amount" type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md" required /></div>
        <div><label className="block text-sm font-medium mb-1">Date</label><input name="date" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Method</label><select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md"><option>Cash</option><option>Cheque</option><option>Bank Transfer</option></select></div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 h-10 border rounded-md text-sm">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 h-10 bg-primary text-white rounded-md text-sm font-medium disabled:opacity-50">{loading ? 'Saving...' : 'Record Receipt'}</button>
      </div>
    </form>
  )
}

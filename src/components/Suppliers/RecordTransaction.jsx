import { useState } from 'react'

export default function RecordTransaction({ supplierId, onSave, onCancel, loading }) {
  const [form, setForm] = useState({ supplier_id: supplierId || '', invoice_no: '', date: new Date().toISOString().split('T')[0], qty: 0, price: 0, total: 0, status: 'Pending' })

  const updateTotal = (qty, price) => {
    setForm(prev => ({ ...prev, qty: Number(qty), price: Number(price), total: Number(qty) * Number(price) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.supplier_id) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Invoice No</label>
          <input name="invoice_no" value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input name="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Qty</label>
          <input name="qty" type="number" value={form.qty} onChange={e => updateTotal(e.target.value, form.price)} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input name="price" type="number" step="0.01" value={form.price} onChange={e => updateTotal(form.qty, e.target.value)} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total (auto)</label>
          <input name="total" type="number" step="0.01" value={form.total} readOnly className="w-full h-10 px-3 border border-gray-300 bg-gray-50 dark:bg-gray-800 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
            <option>Pending</option>
            <option>Partial</option>
            <option>Paid</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 h-10 border border-gray-300 rounded-md text-sm">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 h-10 bg-primary text-white rounded-md text-sm font-medium disabled:opacity-50">{loading ? 'Saving...' : 'Save Transaction'}</button>
      </div>
    </form>
  )
}

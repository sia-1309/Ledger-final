import { useState } from 'react'

export default function RecordPayment({ suppliers, transactions, onSave, onCancel, loading }) {
  const [selectedSupplier, setSelectedSupplier] = useState(suppliers?.[0]?.id || '')
  const [form, setForm] = useState({ transaction_id: '', amount: 0, date: new Date().toISOString().split('T')[0], method: 'Cash' })

  const supplierTxns = transactions.filter(t => t.supplier_id === selectedSupplier && t.status !== 'Paid')
  const paidTotal = (txns) => {
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
        <label className="block text-sm font-medium mb-1 text-[#58423F]">Supplier</label>
        <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white text-[#58423F]">
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-[#58423F]">Transaction</label>
        <select name="transaction_id" value={form.transaction_id} onChange={e => setForm({ ...form, transaction_id: e.target.value })} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white text-[#58423F]" required>
          <option value="">Select transaction</option>
          {supplierTxns.map(t => <option key={t.id} value={t.id}>#{t.invoice_no || t.id.slice(0, 8)} - ₹{t.total}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#58423F]">Amount</label>
          <input name="amount" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#58423F]">Date</label>
          <input name="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-[#58423F]">Method</label>
        <select name="method" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white text-[#58423F]">
          <option>Cash</option>
          <option>Cheque</option>
          <option>Bank Transfer</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 h-10 border border-[#E1D3CC] rounded-md text-sm text-[#58423F] hover:bg-[#E1D3CC]">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 h-10 bg-[#7E102C] text-white rounded-md text-sm font-medium hover:bg-[#6a0e25] disabled:opacity-50">{loading ? 'Saving...' : 'Record Payment'}</button>
      </div>
    </form>
  )
}

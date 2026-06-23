import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters'

export default function SupplierForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || { name: '', phone: '', address: '', email: '', opening_balance: 0, status: 'Active' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name?.trim()) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1 text-[#58423F]">Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#58423F]">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#58423F]">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1 text-[#58423F]">Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-[#E1D3CC] rounded-md bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#58423F]">Opening Balance</label>
          <input name="opening_balance" type="number" step="0.01" value={form.opening_balance} onChange={handleChange} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#58423F]">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white text-[#58423F]">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 h-10 border border-[#E1D3CC] rounded-md text-sm text-[#58423F] hover:bg-[#E1D3CC]">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 h-10 bg-[#7E102C] text-white rounded-md text-sm font-medium hover:bg-[#6a0e25] disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

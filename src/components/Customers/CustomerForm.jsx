import { useState } from 'react'

export default function CustomerForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || { name: '', phone: '', address: '', email: '', opening_balance: 0, status: 'Active' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name?.trim()) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="block text-sm font-medium mb-1">Name *</label><input name="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md" required /></div>
        <div><label className="block text-sm font-medium mb-1">Phone</label><input name="phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Email</label><input name="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md" /></div>
        <div className="col-span-2"><label className="block text-sm font-medium mb-1">Address</label><textarea name="address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Opening Balance</label><input name="opening_balance" type="number" step="0.01" value={form.opening_balance} onChange={e => setForm({...form, opening_balance: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md"><option>Active</option><option>Inactive</option></select></div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 h-10 border rounded-md text-sm">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 h-10 bg-primary text-white rounded-md text-sm font-medium disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

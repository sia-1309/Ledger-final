import { useState } from 'react'

export default function CustomerForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || { name: '', phone: '', address: '', email: '', opening_balance: 0, status: 'Active' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name?.trim()) return
    onSave(form)
  }

  const fields = [
    { name: 'name', label: 'Name *', required: true, colSpan: 2 },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', textarea: true, colSpan: 2 },
    { name: 'opening_balance', label: 'Opening Balance', type: 'number', step: '0.01' },
    { name: 'status', label: 'Status', select: true, options: ['Active', 'Inactive'] },
  ]

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 space-y-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => {
          const cls = `w-full px-3 py-2.5 rounded-lg border border-[#E1D3CC] bg-white text-sm text-[#58423F] placeholder:text-[#a69491] focus:border-[#7E102C] focus:ring-2 focus:ring-[#7E102C]/10 transition-all ${f.colSpan === 2 ? 'col-span-2' : ''}`
          return (
            <div key={f.name} className={f.colSpan === 2 ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-[#58423F] mb-1">{f.label}</label>
              {f.textarea ? (
                <textarea name={f.name} value={form[f.name] || ''} onChange={e => setForm({...form, [f.name]: e.target.value})} rows={2} className={cls} />
              ) : f.select ? (
                <select value={form[f.name]} onChange={e => setForm({...form, [f.name]: e.target.value})} className={cls}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input name={f.name} type={f.type || 'text'} step={f.step} value={form[f.name] || ''} onChange={e => setForm({...form, [f.name]: e.target.value})} className={cls} required={f.required} />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 h-10 rounded-lg border border-[#E1D3CC] text-[#58423F] text-sm font-medium hover:bg-[#f5f0eb] transition-all">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 h-10 bg-[#7E102C] text-white rounded-lg text-sm font-medium hover:bg-[#6b142b] transition-all disabled:opacity-50 active:scale-[0.97]">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

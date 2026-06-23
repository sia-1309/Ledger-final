import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../config/supabaseClient'
import { getCachedUser } from '../../utils/auth'
import { formatCurrency } from '../../utils/formatters'
import { addActivity } from '../../utils/activityLog'
import { calculateInventoryValue, getLowStockItems, getInventoryStatus } from '../../utils/calculations'
import { STOCK_STATUSES } from '../../models/dataModels'

export default function InventoryList() {
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('All')
  const [form, setForm] = useState({ sku: '', name: '', qty: 0, reorder_qty: 10, unit_price: 0, supplier_id: '' })

  const fetchAll = useCallback(async () => {
    const user = await getCachedUser()
    if (!user) return
    const [iRes, sRes] = await Promise.all([
      supabase.from('inventory').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('suppliers').select('id, name').eq('user_id', user.id),
    ])
    if (iRes.data) setItems(iRes.data)
    if (sRes.data) setSuppliers(sRes.data)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true); const user = await getCachedUser()
    if (!user) { setLoading(false); return }
    const payload = { ...form, qty: Number(form.qty) || 0, reorder_qty: Number(form.reorder_qty) || 0, unit_price: Number(form.unit_price) || 0, supplier_id: form.supplier_id || null, user_id: user.id }
    if (editing) { await supabase.from('inventory').update({...payload, updated_at: new Date().toISOString()}).eq('id', editing.id); addActivity('edit_inventory', 'Inventory', form.name) }
    else { await supabase.from('inventory').insert(payload); addActivity('add_inventory', 'Inventory', form.name) }
    setShowForm(false); setEditing(null); setForm({ sku: '', name: '', qty: 0, reorder_qty: 10, unit_price: 0, supplier_id: '' })
    await fetchAll(); setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    const itemName = items.find(i => i.id === id)?.name || 'Item'
    await supabase.from('inventory').delete().eq('id', id); addActivity('delete_inventory', 'Inventory', itemName); await fetchAll()
  }

  const filtered = items.filter(i => {
    const status = getInventoryStatus(i.qty, i.reorder_qty)
    if (stockFilter !== 'All' && status !== stockFilter) return false
    if (search && !i.name?.toLowerCase().includes(search.toLowerCase()) && !i.sku?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalValue = calculateInventoryValue(items)
  const lowStock = getLowStockItems(items)

  const getStatusColor = (status) => {
    if (status === 'Low') return 'text-[#9b2226] bg-[#9b2226]/10'
    if (status === 'Medium') return 'text-[#b8860b] bg-[#b8860b]/10'
    return 'text-[#2d6a4f] bg-[#2d6a4f]/10'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#7E102C]">Inventory</h1>
        <button onClick={() => { setEditing(null); setForm({ sku: '', name: '', qty: 0, reorder_qty: 10, unit_price: 0, supplier_id: '' }); setShowForm(true) }} className="px-4 h-10 bg-[#7E102C] text-white rounded-md text-sm font-medium hover:bg-[#6a0e25]">+ Add Item</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-3" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}><p className="text-xs text-[#8a7370]">Total Stock Value</p><p className="text-xl font-bold text-[#58423F]">{formatCurrency(totalValue)}</p></div>
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-3" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}><p className="text-xs text-[#8a7370]">Low Stock Items</p><p className="text-xl font-bold text-[#9b2226]">{lowStock.length}</p></div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-[#E1D3CC] p-4 max-w-lg" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <h3 className="font-semibold mb-3 text-[#7E102C]">{editing ? 'Edit Item' : 'Add Item'}</h3>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1 text-[#58423F]">SKU *</label><input name="sku" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" required /></div>
              <div><label className="block text-xs font-medium mb-1 text-[#58423F]">Name *</label><input name="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" required /></div>
              <div><label className="block text-xs font-medium mb-1 text-[#58423F]">Qty</label><input name="qty" type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" /></div>
              <div><label className="block text-xs font-medium mb-1 text-[#58423F]">Reorder Qty</label><input name="reorder_qty" type="number" value={form.reorder_qty} onChange={e => setForm({...form, reorder_qty: e.target.value})} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" /></div>
              <div><label className="block text-xs font-medium mb-1 text-[#58423F]">Unit Price</label><input name="unit_price" type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white" /></div>
              <div><label className="block text-xs font-medium mb-1 text-[#58423F]">Supplier</label><select name="supplier_id" value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-md bg-white text-[#58423F]"><option value="">None</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 h-10 border border-[#E1D3CC] rounded-md text-sm text-[#58423F] hover:bg-[#E1D3CC]">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 h-10 bg-[#7E102C] text-white rounded-md text-sm font-medium hover:bg-[#6a0e25] disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by SKU or name..." className="flex-1 h-10 px-3 border border-[#E1D3CC] rounded-md bg-white text-[#58423F] placeholder-[#a69491]" />
        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="h-10 px-3 border border-[#E1D3CC] rounded-md bg-white text-[#58423F]">
          {STOCK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E1D3CC]"><th className="text-left py-2 text-[#8a7370]">SKU</th><th className="text-left py-2 text-[#8a7370]">Name</th><th className="text-right py-2 text-[#8a7370]">Qty</th><th className="text-right py-2 text-[#8a7370]">Reorder</th><th className="text-right py-2 text-[#8a7370]">Price</th><th className="text-right py-2 text-[#8a7370]">Value</th><th className="text-left py-2 text-[#8a7370]">Status</th><th className="text-left py-2 text-[#8a7370]">Supplier</th><th className="text-right py-2 text-[#8a7370]">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(i => {
              const status = getInventoryStatus(i.qty, i.reorder_qty)
              const sup = suppliers.find(s => s.id === i.supplier_id)
              return (
                <tr key={i.id} className="border-b border-[#E1D3CC] hover:bg-[#E1D3CC]">
                  <td className="py-2 font-mono text-xs text-[#58423F]">{i.sku}</td>
                  <td className="py-2 text-[#58423F]">{i.name}</td>
                  <td className="py-2 text-right text-[#58423F]">{i.qty}</td>
                  <td className="py-2 text-right text-[#8a7370]">{i.reorder_qty}</td>
                  <td className="py-2 text-right text-[#58423F]">{formatCurrency(i.unit_price)}</td>
                  <td className="py-2 text-right font-medium text-[#58423F]">{formatCurrency(Number(i.qty || 0) * Number(i.unit_price || 0))}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(status)}`}>{status}</span></td>
                  <td className="py-2 text-xs text-[#8a7370]">{sup?.name || '-'}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => { setEditing(i); setForm({ sku: i.sku, name: i.name, qty: i.qty, reorder_qty: i.reorder_qty, unit_price: i.unit_price, supplier_id: i.supplier_id || '' }); setShowForm(true) }} className="text-[#7E102C] text-xs hover:underline mr-2">Edit</button>
                    <button onClick={() => handleDelete(i.id)} className="text-[#9b2226] text-xs hover:underline">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!filtered.length && <p className="text-center text-[#a69491] py-8">No inventory items found</p>}
      </div>
    </div>
  )
}

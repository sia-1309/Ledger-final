import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../config/supabaseClient'
import { getCachedUserId } from '../../utils/auth'
import { formatCurrency } from '../../utils/formatters'
import { addActivity } from '../../utils/activityLog'
import { calculateCustomerBalance } from '../../utils/calculations'
import { Users, WarningCircle, Coin, TrendUp } from '@phosphor-icons/react'
import CustomerList from './CustomerList'
import CustomerDetail from './CustomerDetail'
import CustomerForm from './CustomerForm'
import RecordReceipt from './RecordReceipt'
import RecordSale from './RecordSale'

export default function CustomerPage() {
  const [searchParams] = useSearchParams()
  const [view, setView] = useState(searchParams.get('action') === 'add' ? 'form' : 'list')
  const [customers, setCustomers] = useState([])
  const [invoices, setInvoices] = useState([])
  const [receipts, setReceipts] = useState([])
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const getUserId = getCachedUserId

  const fetchAll = useCallback(async () => {
    const uid = await getUserId()
    if (!uid) return
    const [cRes, iRes, rRes] = await Promise.all([
      supabase.from('customers').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('sales_invoices').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('receipts').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ])
    if (cRes.data) setCustomers(cRes.data)
    if (iRes.data) setInvoices(iRes.data)
    if (rRes.data) setReceipts(rRes.data)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async (form) => {
    setLoading(true); const uid = await getUserId()
    if (editing) { await supabase.from('customers').update({...form, updated_at: new Date().toISOString()}).eq('id', editing.id); addActivity('edit_customer', 'Customer', form.name) }
    else { await supabase.from('customers').insert({...form, user_id: uid}); addActivity('add_customer', 'Customer', form.name) }
    setEditing(null); await fetchAll(); setLoading(false); setView('list')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    await supabase.from('customers').delete().eq('id', id); await fetchAll()
  }

  const handleRecordSale = async (form) => {
    setLoading(true); const uid = await getUserId()
    await supabase.from('sales_invoices').insert({...form, user_id: uid})
    addActivity('record_sale', 'Sale', selected?.name, form.total)
    await fetchAll(); setLoading(false); setView('detail')
  }

  const handleRecordReceipt = async (form) => {
    setLoading(true); const uid = await getUserId()
    await supabase.from('receipts').insert({...form, user_id: uid})
    addActivity('record_receipt', 'Receipt', selected?.name, form.amount)
    await fetchAll(); setLoading(false); setView('detail')
  }

  const totalReceivable = customers.reduce((s, c) => {
    const cInvs = invoices.filter(i => i.customer_id === c.id)
    const cRecs = receipts.filter(r => cInvs.some(i => i.id === r.invoice_id))
    return s + calculateCustomerBalance(c, cInvs, cRecs).balance
  }, 0)

  const overdueCount = customers.filter(c => {
    const cInvs = invoices.filter(i => i.customer_id === c.id)
    const cRecs = receipts.filter(r => cInvs.some(i => i.id === r.invoice_id))
    return calculateCustomerBalance(c, cInvs, cRecs).balance > 0
  }).length

  const monthlySales = invoices.filter(i => {
    const d = new Date(i.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, i) => s + Number(i.total || 0), 0)

  if (view === 'detail' && selected) {
    const cInvs = invoices.filter(i => i.customer_id === selected.id)
    const cRecs = receipts.filter(r => cInvs.some(i => i.id === r.invoice_id))
    return <CustomerDetail customer={selected} invoices={cInvs} receipts={cRecs} onBack={() => { setView('list'); setSelected(null) }} onRecordSale={() => setView('record-sale')} onRecordReceipt={() => setView('record-receipt')} onEdit={(c) => { setEditing(c); setView('form') }} />
  }

  if (view === 'record-sale') return (
    <div className="max-w-lg mx-auto"><h2 className="text-lg font-bold text-[#58423F] mb-4">Record Sale for {selected?.name}</h2><RecordSale customerId={selected?.id} onSave={handleRecordSale} onCancel={() => setView('detail')} loading={loading} /></div>
  )

  if (view === 'record-receipt') {
    const cInvs = invoices.filter(i => i.customer_id === selected?.id)
    return (
      <div className="max-w-lg mx-auto"><h2 className="text-lg font-bold text-[#58423F] mb-4">Record Receipt for {selected?.name}</h2><RecordReceipt invoices={cInvs} onSave={handleRecordReceipt} onCancel={() => setView('detail')} loading={loading} /></div>
    )
  }

  if (view === 'form') return (
    <div className="max-w-lg mx-auto"><h2 className="text-lg font-bold text-[#58423F] mb-4">{editing ? 'Edit Customer' : 'Add Customer'}</h2><CustomerForm initial={editing} onSave={handleSave} onCancel={() => { setEditing(null); setView('list') }} loading={loading} /></div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#58423F] tracking-tight">Customers</h1>
          <p className="text-sm text-[#8a7370] mt-0.5">{customers.length} customers registered</p>
        </div>
        <button onClick={() => { setEditing(null); setView('form') }} className="px-4 h-10 bg-[#7E102C] text-white rounded-lg text-sm font-medium hover:bg-[#6b142b] transition-all duration-200 active:scale-[0.97]">+ Add Customer</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-[#7E102C]" /><span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">Total Customers</span></div>
          <p className="text-xl font-bold text-[#58423F]">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <div className="flex items-center gap-2 mb-2"><Coin size={16} className="text-[#2d6a4f]" /><span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">Receivables</span></div>
          <p className="text-xl font-bold text-[#58423F]">{formatCurrency(totalReceivable)}</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <div className="flex items-center gap-2 mb-2"><WarningCircle size={16} className="text-[#9b2226]" /><span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">Overdue</span></div>
          <p className="text-xl font-bold text-[#58423F]">{overdueCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <div className="flex items-center gap-2 mb-2"><TrendUp size={16} className="text-[#b8860b]" /><span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">Monthly Sales</span></div>
          <p className="text-xl font-bold text-[#58423F]">{formatCurrency(monthlySales)}</p>
        </div>
      </div>

      <CustomerList customers={customers} invoices={invoices} receipts={receipts} onSelect={(c) => { setSelected(c); setView('detail') }} onEdit={(c) => { setEditing(c); setView('form') }} onDelete={handleDelete} search={search} setSearch={setSearch} />
    </div>
  )
}

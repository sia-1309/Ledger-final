import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../config/supabaseClient'
import { getCachedUserId } from '../../utils/auth'
import CustomerList from './CustomerList'
import CustomerDetail from './CustomerDetail'
import CustomerForm from './CustomerForm'
import RecordReceipt from './RecordReceipt'
import RecordSale from './RecordSale'

export default function CustomerPage() {
  const [view, setView] = useState('list')
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
    if (editing) await supabase.from('customers').update({...form, updated_at: new Date().toISOString()}).eq('id', editing.id)
    else await supabase.from('customers').insert({...form, user_id: uid})
    setEditing(null); await fetchAll(); setLoading(false); setView('list')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    await supabase.from('customers').delete().eq('id', id); await fetchAll()
  }

  const handleRecordSale = async (form) => {
    setLoading(true); const uid = await getUserId()
    await supabase.from('sales_invoices').insert({...form, user_id: uid})
    await fetchAll(); setLoading(false); setView('detail')
  }

  const handleRecordReceipt = async (form) => {
    setLoading(true); const uid = await getUserId()
    await supabase.from('receipts').insert({...form, user_id: uid})
    await fetchAll(); setLoading(false); setView('detail')
  }

  if (view === 'detail' && selected) {
    const cInvs = invoices.filter(i => i.customer_id === selected.id)
    const cRecs = receipts.filter(r => cInvs.some(i => i.id === r.invoice_id))
    return <CustomerDetail customer={selected} invoices={cInvs} receipts={cRecs} onBack={() => { setView('list'); setSelected(null) }} onRecordSale={() => setView('record-sale')} onRecordReceipt={() => setView('record-receipt')} onEdit={(c) => { setEditing(c); setView('form') }} />
  }

  if (view === 'record-sale') return (
    <div className="max-w-lg"><h2 className="text-lg font-bold mb-4">Record Sale for {selected?.name}</h2><RecordSale customerId={selected?.id} onSave={handleRecordSale} onCancel={() => setView('detail')} loading={loading} /></div>
  )

  if (view === 'record-receipt') {
    const cInvs = invoices.filter(i => i.customer_id === selected?.id)
    return (
      <div className="max-w-lg"><h2 className="text-lg font-bold mb-4">Record Receipt for {selected?.name}</h2><RecordReceipt invoices={cInvs} onSave={handleRecordReceipt} onCancel={() => setView('detail')} loading={loading} /></div>
    )
  }

  if (view === 'form') return (
    <div className="max-w-lg"><h2 className="text-lg font-bold mb-4">{editing ? 'Edit Customer' : 'Add Customer'}</h2><CustomerForm initial={editing} onSave={handleSave} onCancel={() => { setEditing(null); setView('list') }} loading={loading} /></div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Customers</h1>
        <button onClick={() => { setEditing(null); setView('form') }} className="px-4 h-10 bg-primary text-white rounded-md text-sm font-medium">+ Add Customer</button>
      </div>
      <CustomerList customers={customers} invoices={invoices} receipts={receipts} onSelect={(c) => { setSelected(c); setView('detail') }} onEdit={(c) => { setEditing(c); setView('form') }} onDelete={handleDelete} search={search} setSearch={setSearch} />
    </div>
  )
}

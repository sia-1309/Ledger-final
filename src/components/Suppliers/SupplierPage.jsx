import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../config/supabaseClient'
import { getCachedUserId } from '../../utils/auth'
import SupplierList from './SupplierList'
import SupplierDetail from './SupplierDetail'
import SupplierForm from './SupplierForm'
import RecordPayment from './RecordPayment'
import RecordTransaction from './RecordTransaction'

export default function SupplierPage() {
  const [view, setView] = useState('list')
  const [suppliers, setSuppliers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [payments, setPayments] = useState([])
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const getUserId = getCachedUserId

  const fetchAll = useCallback(async () => {
    const uid = await getUserId()
    if (!uid) return
    const [supRes, txnRes, payRes] = await Promise.all([
      supabase.from('suppliers').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ])
    if (supRes.data) setSuppliers(supRes.data)
    if (txnRes.data) setTransactions(txnRes.data)
    if (payRes.data) setPayments(payRes.data)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async (form) => {
    setLoading(true)
    const uid = await getUserId()
    if (editing) {
      await supabase.from('suppliers').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id)
    } else {
      await supabase.from('suppliers').insert({ ...form, user_id: uid })
    }
    setEditing(null)
    await fetchAll()
    setLoading(false)
    setView('list')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return
    await supabase.from('suppliers').delete().eq('id', id)
    await fetchAll()
  }

  const handleRecordTransaction = async (form) => {
    setLoading(true)
    const uid = await getUserId()
    await supabase.from('transactions').insert({ ...form, user_id: uid })
    await fetchAll()
    setLoading(false)
    setView('detail')
  }

  const handleRecordPayment = async (form) => {
    setLoading(true)
    const uid = await getUserId()
    await supabase.from('payments').insert({ ...form, user_id: uid })
    await fetchAll()
    setLoading(false)
    setView('detail')
  }

  if (view === 'detail' && selected) {
    const supTxns = transactions.filter(t => t.supplier_id === selected.id)
    const supPmts = payments.filter(p => supTxns.some(t => t.id === p.transaction_id))
    return (
      <div className="space-y-4">
        <SupplierDetail supplier={selected} transactions={supTxns} payments={supPmts} onBack={() => { setView('list'); setSelected(null) }} onRecordTransaction={(s) => setView('record-transaction')} onRecordPayment={(s) => setView('record-payment')} onEdit={(s) => { setEditing(s); setView('form') }} />
      </div>
    )
  }

  if (view === 'record-transaction') {
    return (
      <div className="max-w-lg">
        <h2 className="text-lg font-bold mb-4">Record Transaction for {selected?.name}</h2>
        <RecordTransaction supplierId={selected?.id} onSave={handleRecordTransaction} onCancel={() => setView('detail')} loading={loading} />
      </div>
    )
  }

  if (view === 'record-payment') {
    const supTxns = transactions.filter(t => t.supplier_id === selected?.id)
    return (
      <div className="max-w-lg">
        <h2 className="text-lg font-bold mb-4">Record Payment for {selected?.name}</h2>
        <RecordPayment suppliers={suppliers.filter(s => s.id === selected?.id)} transactions={supTxns} onSave={handleRecordPayment} onCancel={() => setView('detail')} loading={loading} />
      </div>
    )
  }

  if (view === 'form') {
    return (
      <div className="max-w-lg">
        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
        <SupplierForm initial={editing} onSave={handleSave} onCancel={() => { setEditing(null); setView('list') }} loading={loading} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Suppliers</h1>
        <button onClick={() => { setEditing(null); setView('form') }} className="px-4 h-10 bg-primary text-white rounded-md text-sm font-medium">+ Add Supplier</button>
      </div>
      <SupplierList suppliers={suppliers} transactions={transactions} payments={payments} onSelect={(s) => { setSelected(s); setView('detail') }} onEdit={(s) => { setEditing(s); setView('form') }} onDelete={handleDelete} search={search} setSearch={setSearch} />
    </div>
  )
}

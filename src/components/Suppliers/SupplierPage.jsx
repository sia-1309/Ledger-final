import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../config/supabaseClient'
import { getCachedUserId } from '../../utils/auth'
import { formatCurrency } from '../../utils/formatters'
import { addActivity } from '../../utils/activityLog'
import { calculateSupplierBalance } from '../../utils/calculations'
import { Users, WarningCircle, Coin, TrendUp } from '@phosphor-icons/react'
import SupplierList from './SupplierList'
import SupplierDetail from './SupplierDetail'
import SupplierForm from './SupplierForm'
import RecordPayment from './RecordPayment'
import RecordTransaction from './RecordTransaction'

export default function SupplierPage() {
  const [searchParams] = useSearchParams()
  const [view, setView] = useState(searchParams.get('action') === 'add' ? 'form' : 'list')
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
      addActivity('edit_supplier', 'Supplier', form.name)
    } else {
      await supabase.from('suppliers').insert({ ...form, user_id: uid })
      addActivity('add_supplier', 'Supplier', form.name)
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
    addActivity('record_transaction', 'Transaction', selected?.name, form.total)
    await fetchAll()
    setLoading(false)
    setView('detail')
  }

  const handleRecordPayment = async (form) => {
    setLoading(true)
    const uid = await getUserId()
    await supabase.from('payments').insert({ ...form, user_id: uid })
    addActivity('record_payment', 'Payment', selected?.name, form.amount)
    await fetchAll()
    setLoading(false)
    setView('detail')
  }

  const totalOutstanding = suppliers.reduce((s, sup) => {
    const supTxns = transactions.filter(t => t.supplier_id === sup.id)
    const supPmts = payments.filter(p => supTxns.some(t => t.id === p.transaction_id))
    return s + calculateSupplierBalance(sup, supTxns, supPmts).balance
  }, 0)

  const pendingCount = suppliers.filter(sup => {
    const supTxns = transactions.filter(t => t.supplier_id === sup.id)
    const supPmts = payments.filter(p => supTxns.some(t => t.id === p.transaction_id))
    return calculateSupplierBalance(sup, supTxns, supPmts).status !== 'Paid'
  }).length

  const thisMonthPurchases = transactions.filter(t => {
    const d = new Date(t.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, t) => s + Number(t.total || 0), 0)

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
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-[#58423F] mb-4">Record Transaction for {selected?.name}</h2>
        <RecordTransaction supplierId={selected?.id} onSave={handleRecordTransaction} onCancel={() => setView('detail')} loading={loading} />
      </div>
    )
  }

  if (view === 'record-payment') {
    const supTxns = transactions.filter(t => t.supplier_id === selected?.id)
    return (
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-[#58423F] mb-4">Record Payment for {selected?.name}</h2>
        <RecordPayment suppliers={suppliers.filter(s => s.id === selected?.id)} transactions={supTxns} onSave={handleRecordPayment} onCancel={() => setView('detail')} loading={loading} />
      </div>
    )
  }

  if (view === 'form') {
    return (
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-[#58423F] mb-4">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
        <SupplierForm initial={editing} onSave={handleSave} onCancel={() => { setEditing(null); setView('list') }} loading={loading} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#58423F] tracking-tight">Suppliers</h1>
          <p className="text-sm text-[#8a7370] mt-0.5">{suppliers.length} suppliers registered</p>
        </div>
        <button onClick={() => { setEditing(null); setView('form') }} className="px-4 h-10 bg-[#7E102C] text-white rounded-lg text-sm font-medium hover:bg-[#6b142b] transition-all duration-200 active:scale-[0.97]">+ Add Supplier</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-[#7E102C]" /><span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">Total Suppliers</span></div>
          <p className="text-xl font-bold text-[#58423F]">{suppliers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <div className="flex items-center gap-2 mb-2"><WarningCircle size={16} className="text-[#b8860b]" /><span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">Pending</span></div>
          <p className="text-xl font-bold text-[#58423F]">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <div className="flex items-center gap-2 mb-2"><Coin size={16} className="text-[#9b2226]" /><span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">Outstanding</span></div>
          <p className="text-xl font-bold text-[#58423F]">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <div className="flex items-center gap-2 mb-2"><TrendUp size={16} className="text-[#2d6a4f]" /><span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">This Month</span></div>
          <p className="text-xl font-bold text-[#58423F]">{formatCurrency(thisMonthPurchases)}</p>
        </div>
      </div>

      <SupplierList suppliers={suppliers} transactions={transactions} payments={payments} onSelect={(s) => { setSelected(s); setView('detail') }} onEdit={(s) => { setEditing(s); setView('form') }} onDelete={handleDelete} search={search} setSearch={setSearch} />
    </div>
  )
}

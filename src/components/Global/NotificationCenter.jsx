import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabaseClient'
import { getCachedUserId } from '../../utils/auth'
import { formatCurrency } from '../../utils/formatters'
import { Bell, CaretDown, Package, WarningCircle, CurrencyDollar, X } from '@phosphor-icons/react'

export default function NotificationCenter() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open])

  const fetchNotifications = async () => {
    const uid = await getCachedUserId()
    if (!uid) return
    const notifs = []

    const { data: inventory } = await supabase.from('inventory').select('*').eq('user_id', uid)
    const lowStock = (inventory || []).filter(i => Number(i.qty || 0) < Number(i.reorder_qty || 10))
    lowStock.forEach(i => {
      notifs.push({ type: 'low_stock', text: `${i.name} is low (${i.qty} left)`, route: '/inventory', severity: 'warning' })
    })

    const { data: customers } = await supabase.from('customers').select('*').eq('user_id', uid)
    const { data: invoices } = await supabase.from('sales_invoices').select('*').eq('user_id', uid)
    const { data: receipts } = await supabase.from('receipts').select('*').eq('user_id', uid)
    const overdue = (customers || []).filter(c => {
      const cInvs = (invoices || []).filter(i => i.customer_id === c.id)
      const cRecs = (receipts || []).filter(r => cInvs.some(i => i.id === r.invoice_id))
      const totalSold = cInvs.reduce((s, i) => s + Number(i.total || 0), 0)
      const totalRecv = cRecs.reduce((s, r) => s + Number(r.amount || 0), 0)
      return (Number(c.opening_balance || 0) + totalSold - totalRecv) > 0
    })
    overdue.forEach(c => {
      notifs.push({ type: 'overdue', text: `${c.name} has outstanding balance`, route: '/customers', severity: 'error' })
    })

    const { data: suppliers } = await supabase.from('suppliers').select('*').eq('user_id', uid)
    const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', uid)
    const { data: payments } = await supabase.from('payments').select('*').eq('user_id', uid)
    const pending = (suppliers || []).filter(s => {
      const sTxns = (transactions || []).filter(t => t.supplier_id === s.id)
      const sPmts = (payments || []).filter(p => sTxns.some(t => t.id === p.transaction_id))
      const bal = Number(s.opening_balance || 0) + sTxns.reduce((sum, t) => sum + Number(t.total || 0), 0) - sPmts.reduce((sum, p) => sum + Number(p.amount || 0), 0)
      return bal > 0
    })
    pending.forEach(s => {
      notifs.push({ type: 'pending_payment', text: `Pending payment to ${s.name}`, route: '/suppliers', severity: 'warning' })
    })

    setNotifications(notifs)
  }

  const severityStyles = {
    error: { bg: '#fce7ea', dot: '#9b2226', icon: WarningCircle },
    warning: { bg: '#fef3c7', dot: '#b8860b', icon: Package },
    info: { bg: '#e8f5e9', dot: '#2d6a4f', icon: CurrencyDollar },
  }

  const unreadCount = notifications.length

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-[#f5f0eb] transition-colors text-[#58423F]">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full bg-[#7E102C] text-white text-[9px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E1D3CC] overflow-hidden z-40" style={{ boxShadow: '0 10px 40px rgba(88,66,63,0.12)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E1D3CC]">
            <h3 className="text-sm font-semibold text-[#58423F]">Notifications</h3>
            {unreadCount > 0 && <span className="text-[10px] font-medium text-[#8a7370]">{unreadCount} alerts</span>}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length > 0 ? notifications.map((n, i) => {
              const styles = severityStyles[n.severity] || severityStyles.info
              const Icon = styles.icon
              return (
                <button key={i} onClick={() => { navigate(n.route); setOpen(false) }} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#f5f0eb] transition-colors text-left border-b border-[#E1D3CC]/50 last:border-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: styles.bg }}>
                    <Icon size={14} style={{ color: styles.dot }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#58423F]">{n.text}</p>
                  </div>
                </button>
              )
            }) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#8a7370]">All clear — no alerts</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabaseClient'
import { getCachedUserId } from './auth'

const activityLabels = {
  add_customer: { label: 'Added customer', icon: 'user' },
  edit_customer: { label: 'Updated customer', icon: 'user' },
  delete_customer: { label: 'Deleted customer', icon: 'user' },
  add_supplier: { label: 'Added supplier', icon: 'truck' },
  edit_supplier: { label: 'Updated supplier', icon: 'truck' },
  delete_supplier: { label: 'Deleted supplier', icon: 'truck' },
  add_expense: { label: 'Added expense', icon: 'receipt' },
  delete_expense: { label: 'Deleted expense', icon: 'receipt' },
  add_inventory: { label: 'Added inventory', icon: 'package' },
  edit_inventory: { label: 'Updated inventory', icon: 'package' },
  delete_inventory: { label: 'Deleted inventory', icon: 'package' },
  record_transaction: { label: 'Recorded transaction', icon: 'cart' },
  record_payment: { label: 'Recorded payment', icon: 'dollar' },
  record_sale: { label: 'Recorded sale', icon: 'check' },
  record_receipt: { label: 'Recorded receipt', icon: 'trend' },
}

export function useActivityLog() {
  const [activities, setActivities] = useState([])

  const fetch = useCallback(async () => {
    const uid = await getCachedUserId()
    if (!uid) return

    const tables = ['customers', 'suppliers', 'expenses', 'inventory', 'transactions', 'payments', 'sales_invoices', 'receipts']
    const results = await Promise.all(tables.map(t => supabase.from(t).select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(5)))
    const items = []
    const typeMap = {
      customers: { label: 'Customer', action: 'add_customer', icon: 'user' },
      suppliers: { label: 'Supplier', action: 'add_supplier', icon: 'truck' },
      expenses: { label: 'Expense', action: 'add_expense', icon: 'receipt' },
      inventory: { label: 'Item', action: 'add_inventory', icon: 'package' },
      transactions: { label: 'Transaction', action: 'record_transaction', icon: 'cart' },
      payments: { label: 'Payment', action: 'record_payment', icon: 'dollar' },
      sales_invoices: { label: 'Sale', action: 'record_sale', icon: 'check' },
      receipts: { label: 'Receipt', action: 'record_receipt', icon: 'trend' },
    }

    tables.forEach((t, i) => {
      const cfg = typeMap[t]
      ;(results[i].data || []).forEach(item => {
        items.push({
          id: `${t}-${item.id}`,
          action: cfg.action,
          entityType: cfg.label,
          entityName: item.name || item.category || item.invoice_no || item.id,
          details: item.total || item.amount || '',
          timestamp: item.created_at || item.date,
        })
      })
    })

    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    setActivities(items.slice(0, 30))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { activities, activityLabels, refresh: fetch }
}

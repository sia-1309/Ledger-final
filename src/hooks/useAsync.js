import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabaseClient'

function sanitize(obj) {
  const clean = { ...obj }
  Object.keys(clean).forEach(k => {
    if (clean[k] === '' || clean[k] === undefined || clean[k] === null) delete clean[k]
  })
  delete clean.id; delete clean.created_at; delete clean.updated_at; delete clean.user_id
  return clean
}

export default function useData(table) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getUserId = () => supabase.auth.getUser().then(({ data }) => data?.user?.id)

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setData([]); return }
      const { data: items, error } = await supabase.from(table).select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) throw error
      setData(items || [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [table])

  const add = useCallback(async (item) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data: created, error } = await supabase.from(table).insert({ ...sanitize(item), user_id: user.id }).select().single()
    if (error) throw error
    setData(prev => [created, ...prev])
    return created
  }, [table])

  const update = useCallback(async (id, updates) => {
    const { data: updated, error } = await supabase.from(table).update({ ...sanitize(updates), updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    setData(prev => prev.map(d => d.id === id ? updated : d))
    return updated
  }, [table])

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    setData(prev => prev.filter(d => d.id !== id))
    return true
  }, [table])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { data, loading, error, fetchAll, add, update, remove }
}

export function useCustomers() { return useData('customers') }
export function useTransactions() { return useData('transactions') }
export function useSalesInvoices() { return useData('sales_invoices') }
export function usePayments() { return useData('payments') }
export function useReceipts() { return useData('receipts') }
export function useExpenses() { return useData('expenses') }
export function useInventory() { return useData('inventory') }
export function useShopConfig() { return useData('shop_config') }

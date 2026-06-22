import { supabase } from '../config/supabaseClient'

function sanitize(obj) {
  const clean = { ...obj }
  Object.keys(clean).forEach(k => {
    if (clean[k] === '' || clean[k] === undefined || clean[k] === null) delete clean[k]
  })
  delete clean.id; delete clean.created_at; delete clean.updated_at; delete clean.user_id
  return clean
}

export function createFetcher(table) {
  return async (userId) => {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
}

export function createAdder(table) {
  return async (userId, item) => {
    const { data, error } = await supabase.from(table).insert({ ...sanitize(item), user_id: userId }).select().single()
    if (error) throw error
    return data
  }
}

export function createUpdater(table) {
  return async (id, updates) => {
    const { data, error } = await supabase.from(table).update({ ...sanitize(updates), updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    return data
  }
}

export function createDeleter(table) {
  return async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return true
  }
}

export function createDataManager(table) {
  return {
    fetchAll: createFetcher(table),
    add: createAdder(table),
    update: createUpdater(table),
    remove: createDeleter(table),
  }
}

export const suppliersManager = createDataManager('suppliers')
export const customersManager = createDataManager('customers')
export const transactionsManager = createDataManager('transactions')
export const salesInvoicesManager = createDataManager('sales_invoices')
export const paymentsManager = createDataManager('payments')
export const receiptsManager = createDataManager('receipts')
export const expensesManager = createDataManager('expenses')
export const inventoryManager = createDataManager('inventory')
export const shopConfigManager = createDataManager('shop_config')

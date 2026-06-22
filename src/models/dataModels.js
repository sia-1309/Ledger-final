export const EXPENSE_CATEGORIES = [
  'Shipping', 'Labour', 'Travel', 'Tools', 'Rent', 'Marketing', 'Other'
]

export const EXPENSE_CATEGORY_COLORS = {
  Shipping: '#3b82f6',
  Labour: '#10b981',
  Travel: '#f59e0b',
  Tools: '#8b5cf6',
  Rent: '#ef4444',
  Marketing: '#ec4899',
  Other: '#6b7280',
}

export const TRANSACTION_STATUSES = ['Pending', 'Partial', 'Paid']
export const INVOICE_STATUSES = ['Draft', 'Issued', 'Paid']
export const PAYMENT_METHODS = ['Cash', 'Cheque', 'Bank Transfer']
export const STOCK_STATUSES = ['All', 'Low', 'Medium', 'OK']

export function getEmptySupplier() {
  return { name: '', phone: '', address: '', email: '', opening_balance: 0, status: 'Active' }
}

export function getEmptyCustomer() {
  return { name: '', phone: '', address: '', email: '', opening_balance: 0, status: 'Active' }
}

export function getEmptyTransaction() {
  return { supplier_id: '', invoice_no: '', date: new Date().toISOString().split('T')[0], qty: 0, price: 0, total: 0, status: 'Pending' }
}

export function getEmptySaleInvoice() {
  return { customer_id: '', invoice_no: '', date: new Date().toISOString().split('T')[0], total: 0, status: 'Draft' }
}

export function getEmptyPayment() {
  return { transaction_id: '', amount: 0, date: new Date().toISOString().split('T')[0], method: 'Cash' }
}

export function getEmptyReceipt() {
  return { invoice_id: '', amount: 0, date: new Date().toISOString().split('T')[0], method: 'Cash' }
}

export function getEmptyExpense() {
  return { category: 'Other', description: '', amount: 0, date: new Date().toISOString().split('T')[0] }
}

export function getEmptyInventoryItem() {
  return { sku: '', name: '', qty: 0, reorder_qty: 10, unit_price: 0, supplier_id: '' }
}

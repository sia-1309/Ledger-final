import useData from './useAsync'

export default function useSuppliers() {
  return useData('suppliers')
}

export function useCustomers() {
  return useData('customers')
}

export function useTransactions() {
  return useData('transactions')
}

export function useSalesInvoices() {
  return useData('sales_invoices')
}

export function usePayments() {
  return useData('payments')
}

export function useReceipts() {
  return useData('receipts')
}

export function useExpenses() {
  return useData('expenses')
}

export function useInventory() {
  return useData('inventory')
}

export function useShopConfig() {
  return useData('shop_config')
}

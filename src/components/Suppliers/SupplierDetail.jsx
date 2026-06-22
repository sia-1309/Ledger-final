import { useState } from 'react'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { calculateSupplierBalance } from '../../utils/calculations'
import { useNavigate } from 'react-router-dom'

export default function SupplierDetail({ supplier, transactions, payments, onBack, onRecordTransaction, onRecordPayment, onEdit }) {
  const nav = useNavigate()
  const { balance, totalPurchased, totalPaid, status } = calculateSupplierBalance(supplier, transactions, payments)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-primary hover:underline">← Back to Suppliers</button>
        <div className="flex gap-2">
          <button onClick={() => onRecordTransaction(supplier)} className="px-3 h-8 bg-primary text-white rounded-md text-xs font-medium">+ Transaction</button>
          <button onClick={() => onRecordPayment(supplier)} className="px-3 h-8 bg-success text-white rounded-md text-xs font-medium">+ Payment</button>
          <button onClick={() => onEdit(supplier)} className="px-3 h-8 border border-gray-300 rounded-md text-xs">Edit</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-bold">{supplier.name}</h2>
        <p className="text-sm text-gray-500">{supplier.phone} {supplier.email ? `| ${supplier.email}` : ''}</p>
        {supplier.address && <p className="text-sm text-gray-400 mt-1">{supplier.address}</p>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-3"><p className="text-xs text-gray-500">Opening Balance</p><p className="text-lg font-bold">{formatCurrency(supplier.opening_balance)}</p></div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-3"><p className="text-xs text-gray-500">Total Purchased</p><p className="text-lg font-bold">{formatCurrency(totalPurchased)}</p></div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-3"><p className="text-xs text-gray-500">Total Paid</p><p className="text-lg font-bold">{formatCurrency(totalPaid)}</p></div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-3"><p className="text-xs text-gray-500">Current Balance</p><p className={`text-lg font-bold ${balance > 0 ? 'text-error' : 'text-success'}`}>{formatCurrency(balance)}</p></div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Transactions ({transactions.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2">Invoice</th>
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2">{t.invoice_no || '-'}</td>
                  <td className="py-2 text-gray-500">{formatDate(t.date)}</td>
                  <td className="py-2 text-right">{t.qty || '-'}</td>
                  <td className="py-2 text-right">{t.price ? formatCurrency(t.price) : '-'}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(t.total)}</td>
                  <td className="py-2">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Payments ({payments.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-left py-2">Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 text-gray-500">{formatDate(p.date)}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(p.amount)}</td>
                  <td className="py-2">{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

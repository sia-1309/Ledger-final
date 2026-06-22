import { useState } from 'react'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { calculateSupplierBalance } from '../../utils/calculations'

const statusColors = { Paid: 'bg-success/10 text-success', Partial: 'bg-warning/10 text-warning', Pending: 'bg-gray-100 dark:bg-gray-800 text-gray-500' }

export default function SupplierList({ suppliers, transactions, payments, onSelect, onEdit, onDelete, search, setSearch }) {
  const getBalance = (s) => {
    const supTxns = transactions.filter(t => t.supplier_id === s.id)
    const supPmts = payments.filter(p => supTxns.some(t => t.id === p.transaction_id))
    return calculateSupplierBalance(s, supTxns, supPmts)
  }

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 mb-4" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 font-medium">Name</th>
              <th className="text-left py-2 font-medium">Phone</th>
              <th className="text-left py-2 font-medium">Status</th>
              <th className="text-right py-2 font-medium">Balance</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const { balance, status } = getBalance(s)
              return (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => onSelect(s)}>
                  <td className="py-2">{s.name}</td>
                  <td className="py-2 text-gray-500">{s.phone || '-'}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[status] || statusColors.Pending}`}>{status}</span></td>
                  <td className="py-2 text-right font-medium">{formatCurrency(balance)}</td>
                  <td className="py-2 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(s) }} className="text-primary text-xs hover:underline mr-2">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(s.id) }} className="text-error text-xs hover:underline">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!filtered.length && <p className="text-center text-gray-400 py-8">No suppliers found</p>}
      </div>
    </div>
  )
}

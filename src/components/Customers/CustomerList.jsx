import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters'
import { calculateCustomerBalance } from '../../utils/calculations'

const statusColors = { Paid: 'bg-success/10 text-success', Partial: 'bg-warning/10 text-warning', Pending: 'bg-gray-100 text-gray-500' }

export default function CustomerList({ customers, invoices, receipts, onSelect, onEdit, onDelete, search, setSearch }) {
  const getBalance = (c) => {
    const cInvs = invoices.filter(i => i.customer_id === c.id)
    const cRecs = receipts.filter(r => cInvs.some(i => i.id === r.invoice_id))
    return calculateCustomerBalance(c, cInvs, cRecs)
  }

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full h-10 px-3 border border-gray-300 rounded-md mb-4" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200"><th className="text-left py-2 font-medium">Name</th><th className="text-left py-2 font-medium">Phone</th><th className="text-left py-2 font-medium">Status</th><th className="text-right py-2 font-medium">Balance</th><th className="text-right py-2 font-medium">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const { balance, status } = getBalance(c)
              return (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(c)}>
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-gray-500">{c.phone || '-'}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[status] || statusColors.Pending}`}>{status}</span></td>
                  <td className="py-2 text-right font-medium">{formatCurrency(balance)}</td>
                  <td className="py-2 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(c) }} className="text-primary text-xs hover:underline mr-2">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(c.id) }} className="text-error text-xs hover:underline">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!filtered.length && <p className="text-center text-gray-400 py-8">No customers found</p>}
      </div>
    </div>
  )
}

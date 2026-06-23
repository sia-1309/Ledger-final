import { formatCurrency, formatDate } from '../../utils/formatters'
import { calculateSupplierBalance } from '../../utils/calculations'
import { MagnifyingGlass, PencilSimple, Trash } from '@phosphor-icons/react'

const statusColors = {
  Paid: 'bg-[#2d6a4f]/10 text-[#2d6a4f]',
  Partial: 'bg-[#b8860b]/10 text-[#b8860b]',
  Pending: 'bg-[#8a7370]/10 text-[#58423F]',
}

export default function SupplierList({ suppliers, transactions, payments, onSelect, onEdit, onDelete, search, setSearch }) {
  const getBalance = (s) => {
    const supTxns = transactions.filter(t => t.supplier_id === s.id)
    const supPmts = payments.filter(p => supTxns.some(t => t.id === p.transaction_id))
    return calculateSupplierBalance(s, supTxns, supPmts)
  }

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="relative mb-4">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7370]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-[#E1D3CC] text-sm text-[#58423F] placeholder:text-[#a69491] focus:border-[#7E102C] focus:ring-2 focus:ring-[#7E102C]/10 transition-all" />
      </div>
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E1D3CC]">
                {['Supplier', 'Phone', 'Outstanding', 'Last Purchase', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-3 font-semibold text-[#8a7370] text-xs tracking-wide uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const { balance, status } = getBalance(s)
                const lastTxn = transactions.filter(t => t.supplier_id === s.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                return (
                  <tr key={s.id} className="border-b border-[#E1D3CC]/50 hover:bg-[#f5f0eb] cursor-pointer transition-colors" onClick={() => onSelect(s)}>
                    <td className="py-3 px-3 font-medium text-[#58423F]">{s.name}</td>
                    <td className="py-3 px-3 text-[#8a7370]">{s.phone || '-'}</td>
                    <td className="py-3 px-3"><span className={`font-medium ${balance > 0 ? 'text-[#9b2226]' : 'text-[#2d6a4f]'}`}>{formatCurrency(balance)}</span></td>
                    <td className="py-3 px-3 text-[#8a7370]">{lastTxn ? formatDate(lastTxn.date) : '-'}</td>
                    <td className="py-3 px-3"><span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusColors[status] || statusColors.Pending}`}>{status}</span></td>
                    <td className="py-3 px-3">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(s) }} className="text-xs font-medium text-[#7E102C] hover:text-[#6b142b] mr-3 transition-colors"><PencilSimple size={14} className="inline mr-1" />Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(s.id) }} className="text-xs font-medium text-[#9b2226] hover:text-[#7E102C] transition-colors"><Trash size={14} className="inline mr-1" />Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="text-center py-12 px-4">
            <p className="text-[#58423F] font-medium">No suppliers yet</p>
            <p className="text-sm text-[#8a7370] mt-1">Add your first supplier to start tracking purchases.</p>
          </div>
        )}
      </div>
    </div>
  )
}

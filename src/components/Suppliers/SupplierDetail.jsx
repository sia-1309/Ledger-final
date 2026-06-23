import { formatCurrency, formatDate } from '../../utils/formatters'
import { calculateSupplierBalance } from '../../utils/calculations'
import { ArrowLeft, Plus, CurrencyDollar, PencilSimple, Coin, ShoppingCart, Clock, CheckCircle } from '@phosphor-icons/react'

export default function SupplierDetail({ supplier, transactions, payments, onBack, onRecordTransaction, onRecordPayment, onEdit }) {
  const { balance, totalPurchased, totalPaid, status } = calculateSupplierBalance(supplier, transactions, payments)

  const timeline = [
    ...transactions.map(t => ({ type: 'purchase', text: `Purchase ${t.invoice_no || ''}`, amount: t.total, date: t.date, id: t.id })),
    ...payments.map(p => ({ type: 'payment', text: `Payment`, amount: p.amount, date: p.date, id: p.id })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const statusBadge = {
    Paid: 'bg-[#2d6a4f]/10 text-[#2d6a4f]',
    Partial: 'bg-[#b8860b]/10 text-[#b8860b]',
    Pending: 'bg-[#8a7370]/10 text-[#58423F]',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-[#7E102C] hover:text-[#6b142b] transition-colors">
          <ArrowLeft size={16} /> Back to Suppliers
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onRecordTransaction(supplier)} className="flex items-center gap-1.5 px-3 h-8 bg-[#7E102C] text-white rounded-lg text-xs font-medium hover:bg-[#6b142b] transition-all active:scale-[0.97]"><Plus size={13} /> Transaction</button>
          <button onClick={() => onRecordPayment(supplier)} className="flex items-center gap-1.5 px-3 h-8 bg-[#2d6a4f] text-white rounded-lg text-xs font-medium hover:bg-[#1b4332] transition-all active:scale-[0.97]"><CurrencyDollar size={13} /> Payment</button>
          <button onClick={() => onEdit(supplier)} className="flex items-center gap-1.5 px-3 h-8 bg-white border border-[#E1D3CC] text-[#58423F] rounded-lg text-xs font-medium hover:bg-[#f5f0eb] transition-all"><PencilSimple size={13} /> Edit</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#58423F]">{supplier.name}</h2>
            <p className="text-sm text-[#8a7370] mt-0.5">{supplier.phone}{supplier.email ? ` | ${supplier.email}` : ''}</p>
            {supplier.address && <p className="text-sm text-[#a69491] mt-1.5">{supplier.address}</p>}
            {supplier.gst && <p className="text-xs text-[#a69491] mt-1">GST: {supplier.gst}</p>}
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusBadge[status] || statusBadge.Pending}`}>{status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Opening', value: formatCurrency(supplier.opening_balance), icon: Coin, color: '#8a7370' },
          { label: 'Total Purchased', value: formatCurrency(totalPurchased), icon: ShoppingCart, color: '#7E102C' },
          { label: 'Total Paid', value: formatCurrency(totalPaid), icon: CheckCircle, color: '#2d6a4f' },
          { label: 'Balance', value: formatCurrency(balance), icon: CurrencyDollar, color: balance > 0 ? '#9b2226' : '#2d6a4f' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
              <div className="flex items-center gap-2 mb-2"><Icon size={14} style={{ color: item.color }} /><span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">{item.label}</span></div>
              <p className="text-lg font-bold text-[#58423F]">{item.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
          <h3 className="text-sm font-semibold text-[#58423F] mb-3">Timeline</h3>
          <div className="space-y-3">
            {timeline.slice(0, 10).map((item, i) => (
              <div key={`${item.type}-${item.id}`} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${item.type === 'purchase' ? 'bg-[#7E102C]' : 'bg-[#2d6a4f]'}`} />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-[#E1D3CC] mt-1" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#58423F]">{item.text}</span>
                    <span className={`text-sm font-medium ${item.type === 'payment' ? 'text-[#2d6a4f]' : 'text-[#9b2226]'}`}>
                      {item.type === 'payment' ? '-' : '+'}{formatCurrency(item.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-[#8a7370]">{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
            {!timeline.length && <p className="text-sm text-[#8a7370] py-4">No activity yet</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
            <h3 className="text-sm font-semibold text-[#58423F] mb-3">Transactions ({transactions.length})</h3>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E1D3CC]">
                      <th className="text-left py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Invoice</th>
                      <th className="text-left py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Date</th>
                      <th className="text-right py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map(t => (
                      <tr key={t.id} className="border-b border-[#E1D3CC]/50">
                        <td className="py-2 text-[#58423F]">{t.invoice_no || '-'}</td>
                        <td className="py-2 text-[#8a7370]">{formatDate(t.date)}</td>
                        <td className="py-2 text-right font-medium text-[#58423F]">{formatCurrency(t.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-[#8a7370]">No transactions</p>}
          </div>

          <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
            <h3 className="text-sm font-semibold text-[#58423F] mb-3">Payments ({payments.length})</h3>
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E1D3CC]">
                      <th className="text-left py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Date</th>
                      <th className="text-right py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Amount</th>
                      <th className="text-left py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 5).map(p => (
                      <tr key={p.id} className="border-b border-[#E1D3CC]/50">
                        <td className="py-2 text-[#8a7370]">{formatDate(p.date)}</td>
                        <td className="py-2 text-right font-medium text-[#58423F]">{formatCurrency(p.amount)}</td>
                        <td className="py-2 text-[#58423F]">{p.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-[#8a7370]">No payments</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

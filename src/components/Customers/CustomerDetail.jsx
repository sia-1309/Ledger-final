import { formatCurrency, formatDate } from '../../utils/formatters'
import { calculateCustomerBalance } from '../../utils/calculations'
import { ArrowLeft, Plus, CurrencyDollar, PencilSimple, Coin, ShoppingCart, CheckCircle, User } from '@phosphor-icons/react'

export default function CustomerDetail({ customer, invoices, receipts, onBack, onRecordSale, onRecordReceipt, onEdit }) {
  const { balance, totalSold, totalReceived, status } = calculateCustomerBalance(customer, invoices, receipts)

  const health = balance === 0 ? { label: 'Good', color: 'bg-[#2d6a4f]/10 text-[#2d6a4f]' } : balance > 5000 ? { label: 'High Risk', color: 'bg-[#9b2226]/10 text-[#9b2226]' } : { label: 'Average', color: 'bg-[#b8860b]/10 text-[#b8860b]' }

  const timeline = [
    ...invoices.map(i => ({ type: 'sale', text: `Sale ${i.invoice_no || ''}`, amount: i.total, date: i.date, id: i.id })),
    ...receipts.map(r => ({ type: 'receipt', text: `Receipt`, amount: r.amount, date: r.date, id: r.id })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-[#7E102C] hover:text-[#6b142b] transition-colors">
          <ArrowLeft size={16} /> Back to Customers
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onRecordSale(customer)} className="flex items-center gap-1.5 px-3 h-8 bg-[#7E102C] text-white rounded-lg text-xs font-medium hover:bg-[#6b142b] transition-all active:scale-[0.97]"><Plus size={13} /> Sale</button>
          <button onClick={() => onRecordReceipt(customer)} className="flex items-center gap-1.5 px-3 h-8 bg-[#2d6a4f] text-white rounded-lg text-xs font-medium hover:bg-[#1b4332] transition-all active:scale-[0.97]"><CurrencyDollar size={13} /> Receipt</button>
          <button onClick={() => onEdit(customer)} className="flex items-center gap-1.5 px-3 h-8 bg-white border border-[#E1D3CC] text-[#58423F] rounded-lg text-xs font-medium hover:bg-[#f5f0eb] transition-all"><PencilSimple size={13} /> Edit</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7E102C]/10 flex items-center justify-center"><User size={20} className="text-[#7E102C]" /></div>
              <div>
                <h2 className="text-lg font-bold text-[#58423F]">{customer.name}</h2>
                <p className="text-sm text-[#8a7370]">{customer.phone}{customer.email ? ` | ${customer.email}` : ''}</p>
              </div>
            </div>
            {customer.address && <p className="text-sm text-[#a69491] mt-2 ml-[52px]">{customer.address}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${health.color}`}>{health.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Opening', value: formatCurrency(customer.opening_balance), icon: Coin, color: '#8a7370' },
          { label: 'Total Sold', value: formatCurrency(totalSold), icon: ShoppingCart, color: '#7E102C' },
          { label: 'Total Received', value: formatCurrency(totalReceived), icon: CheckCircle, color: '#2d6a4f' },
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
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${item.type === 'sale' ? 'bg-[#7E102C]' : 'bg-[#2d6a4f]'}`} />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-[#E1D3CC] mt-1" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#58423F]">{item.text}</span>
                    <span className={`text-sm font-medium ${item.type === 'receipt' ? 'text-[#2d6a4f]' : 'text-[#9b2226]'}`}>
                      {item.type === 'receipt' ? '-' : '+'}{formatCurrency(item.amount)}
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
            <h3 className="text-sm font-semibold text-[#58423F] mb-3">Invoices ({invoices.length})</h3>
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E1D3CC]">
                      <th className="text-left py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Invoice</th>
                      <th className="text-left py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Date</th>
                      <th className="text-right py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Total</th>
                      <th className="text-left py-2 font-semibold text-[#8a7370] text-xs tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 5).map(i => (
                      <tr key={i.id} className="border-b border-[#E1D3CC]/50">
                        <td className="py-2 text-[#58423F]">{i.invoice_no || '-'}</td>
                        <td className="py-2 text-[#8a7370]">{formatDate(i.date)}</td>
                        <td className="py-2 text-right font-medium text-[#58423F]">{formatCurrency(i.total)}</td>
                        <td className="py-2 text-[#58423F]">{i.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-[#8a7370]">No invoices</p>}
          </div>

          <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(88,66,63,0.06)' }}>
            <h3 className="text-sm font-semibold text-[#58423F] mb-3">Payments ({receipts.length})</h3>
            {receipts.length > 0 ? (
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
                    {receipts.slice(0, 5).map(r => (
                      <tr key={r.id} className="border-b border-[#E1D3CC]/50">
                        <td className="py-2 text-[#8a7370]">{formatDate(r.date)}</td>
                        <td className="py-2 text-right font-medium text-[#58423F]">{formatCurrency(r.amount)}</td>
                        <td className="py-2 text-[#58423F]">{r.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-[#8a7370]">No payments received</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

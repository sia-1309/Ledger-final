import { formatCurrency, formatDate } from '../../utils/formatters'
import { calculateCustomerBalance } from '../../utils/calculations'

export default function CustomerDetail({ customer, invoices, receipts, onBack, onRecordSale, onRecordReceipt, onEdit }) {
  const { balance, totalSold, totalReceived } = calculateCustomerBalance(customer, invoices, receipts)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-primary hover:underline">← Back to Customers</button>
        <div className="flex gap-2">
          <button onClick={() => onRecordSale(customer)} className="px-3 h-8 bg-primary text-white rounded-md text-xs font-medium">+ Sale</button>
          <button onClick={() => onRecordReceipt(customer)} className="px-3 h-8 bg-success text-white rounded-md text-xs font-medium">+ Receipt</button>
          <button onClick={() => onEdit(customer)} className="px-3 h-8 border rounded-md text-xs">Edit</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-bold">{customer.name}</h2>
        <p className="text-sm text-gray-500">{customer.phone} {customer.email ? `| ${customer.email}` : ''}</p>
        {customer.address && <p className="text-sm text-gray-400 mt-1">{customer.address}</p>}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-3"><p className="text-xs text-gray-500">Opening Balance</p><p className="text-lg font-bold">{formatCurrency(customer.opening_balance)}</p></div>
        <div className="bg-white rounded-lg border p-3"><p className="text-xs text-gray-500">Total Sold</p><p className="text-lg font-bold">{formatCurrency(totalSold)}</p></div>
        <div className="bg-white rounded-lg border p-3"><p className="text-xs text-gray-500">Total Received</p><p className="text-lg font-bold">{formatCurrency(totalReceived)}</p></div>
        <div className="bg-white rounded-lg border p-3"><p className="text-xs text-gray-500">Current Balance</p><p className={`text-lg font-bold ${balance > 0 ? 'text-error' : 'text-success'}`}>{formatCurrency(balance)}</p></div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Invoices ({invoices.length})</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200"><th className="text-left py-2">Invoice</th><th className="text-left py-2">Date</th><th className="text-right py-2">Total</th><th className="text-left py-2">Status</th></tr></thead>
          <tbody>{invoices.map(i => <tr key={i.id} className="border-b border-gray-100"><td className="py-2">{i.invoice_no || '-'}</td><td className="py-2 text-gray-500">{formatDate(i.date)}</td><td className="py-2 text-right font-medium">{formatCurrency(i.total)}</td><td className="py-2">{i.status}</td></tr>)}</tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Receipts ({receipts.length})</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200"><th className="text-left py-2">Date</th><th className="text-right py-2">Amount</th><th className="text-left py-2">Method</th></tr></thead>
          <tbody>{receipts.map(r => <tr key={r.id} className="border-b border-gray-100"><td className="py-2 text-gray-500">{formatDate(r.date)}</td><td className="py-2 text-right font-medium">{formatCurrency(r.amount)}</td><td className="py-2">{r.method}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

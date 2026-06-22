export function formatCurrency(amount, currency = '₹') {
  if (amount == null || isNaN(amount)) return `${currency}0.00`
  return `${currency}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateStr, format = 'DD MMM YYYY') {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleString('en', { month: 'short' })
  const year = d.getFullYear()
  if (format === 'DD-MM-YYYY') return `${day}-${month}-${year}`
  if (format === 'MM/DD/YYYY') return `${String(d.getMonth() + 1).padStart(2, '0')}/${day}/${year}`
  return `${day} ${month} ${year}`
}

export function getMonthName(m) {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m] || ''
}

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../config/supabaseClient'
import { getCachedUser } from '../../utils/auth'
import { exportToJSON } from '../../utils/exportUtils'

export default function Settings() {
  const [config, setConfig] = useState({ shop_name: '', address: '', currency: '₹', date_format: 'DD MMM YYYY', theme: 'light' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [restoreStatus, setRestoreStatus] = useState('')

  const fetchConfig = useCallback(async () => {
    const user = await getCachedUser()
    if (!user) return
    const { data } = await supabase.from('shop_config').select('*').eq('user_id', user.id).single()
    if (data) setConfig(data)
  }, [])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  useEffect(() => {
    if (config.theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [config.theme])

  const handleSave = async () => {
    setLoading(true); setSaved(false)
    const user = await getCachedUser()
    if (!user) { setLoading(false); return }
    let res
    const existing = await supabase.from('shop_config').select('id').eq('user_id', user.id).single()
    if (existing.data) res = await supabase.from('shop_config').update({...config, updated_at: new Date().toISOString()}).eq('id', existing.data.id)
    else res = await supabase.from('shop_config').insert({...config, user_id: user.id})
    if (res?.error) console.error('Shop config save error:', res.error)
    setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const handleBackup = async () => {
    const user = await getCachedUser()
    if (!user) return
    const tables = ['suppliers', 'customers', 'transactions', 'sales_invoices', 'payments', 'receipts', 'expenses', 'inventory', 'shop_config']
    const results = await Promise.all(tables.map(t => supabase.from(t).select('*').eq('user_id', user.id)))
    const backup = {}
    tables.forEach((t, i) => { backup[t] = results[i].data || [] })
    exportToJSON(backup, `ledger-backup-${new Date().toISOString().split('T')[0]}`)
  }

  const handleRestore = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setRestoreStatus('Restoring...')
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const user = await getCachedUser()
      if (!user) return
      for (const [table, items] of Object.entries(data)) {
        if (!Array.isArray(items)) continue
        for (const item of items) {
          const { id, created_at, updated_at, ...rest } = item
          await supabase.from(table).upsert({ ...rest, user_id: user.id })
        }
      }
      setRestoreStatus('Restore complete!')
    } catch { setRestoreStatus('Invalid backup file') }
    setTimeout(() => setRestoreStatus(''), 3000)
    e.target.value = ''
  }

  const handleReset = async () => {
    if (!confirm('Delete ALL your data? This cannot be undone!')) return
    if (!confirm('Are you sure?')) return
    const user = await getCachedUser()
    if (!user) return
    const tables = ['suppliers', 'customers', 'transactions', 'sales_invoices', 'payments', 'receipts', 'expenses', 'inventory', 'shop_config']
    for (const t of tables) await supabase.from(t).delete().eq('user_id', user.id)
    alert('All data has been reset.')
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Shop Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Shop Name</label><input name="shop_name" value={config.shop_name} onChange={e => setConfig({...config, shop_name: e.target.value})} placeholder="Shop name" className="w-full h-10 px-3 border border-gray-300 rounded-md" /></div>
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Address</label><textarea value={config.address} onChange={e => setConfig({...config, address: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium mb-1">Currency</label><select name="currency" value={config.currency} onChange={e => setConfig({...config, currency: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md"><option>₹</option><option>$</option><option>€</option><option>£</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Date Format</label><select name="date_format" value={config.date_format} onChange={e => setConfig({...config, date_format: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md"><option>DD MMM YYYY</option><option>DD-MM-YYYY</option><option>MM/DD/YYYY</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Theme</label><select name="theme" value={config.theme} onChange={e => setConfig({...config, theme: e.target.value})} className="w-full h-10 px-3 border border-gray-300 rounded-md"><option value="light">Light</option><option value="dark">Dark</option></select></div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={loading} className="px-4 h-10 bg-primary text-white rounded-md text-sm font-medium disabled:opacity-50">{loading ? 'Saving...' : 'Save Settings'}</button>
          {saved && <span className="text-success text-sm">Saved!</span>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Backup & Restore</h2>
        <div className="flex gap-3">
          <button onClick={handleBackup} className="px-4 h-10 border border-gray-300 rounded-md text-sm">Download Backup (JSON)</button>
          <label className="px-4 h-10 border border-gray-300 rounded-md text-sm flex items-center cursor-pointer hover:bg-gray-50">
            Upload Backup
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
        </div>
        {restoreStatus && <p className="text-sm text-primary">{restoreStatus}</p>}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-error/30 p-6 space-y-4">
        <h2 className="font-semibold text-error">Danger Zone</h2>
        <p className="text-sm text-gray-500">Reset all your data. This cannot be undone.</p>
        <button onClick={handleReset} className="px-4 h-10 bg-error text-white rounded-md text-sm font-medium">Reset All Data</button>
      </div>

      <div className="text-xs text-gray-400">
        <p>Accounts Ledger v1.0.0</p>
        <p>Built with React 19 + Supabase + Tailwind CSS</p>
      </div>
    </div>
  )
}

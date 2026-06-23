import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabaseClient'
import { getCachedUserId } from '../../utils/auth'
import { MagnifyingGlass, Users, Truck, Receipt, Package, ArrowRight } from '@phosphor-icons/react'

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [data, setData] = useState({ customers: [], suppliers: [], expenses: [], inventory: [] })
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      loadData()
    }
  }, [open])

  const loadData = async () => {
    const uid = await getCachedUserId()
    if (!uid) return
    const tables = ['suppliers', 'customers', 'expenses', 'inventory']
    const results = await Promise.all(tables.map(t => supabase.from(t).select('name, id').eq('user_id', uid)))
    const map = {}
    tables.forEach((t, i) => { map[t] = results[i].data || [] })
    setData(map)
  }

  const groups = [
    { key: 'customers', label: 'Customers', icon: Users, route: '/customers', items: data.customers },
    { key: 'suppliers', label: 'Suppliers', icon: Truck, route: '/suppliers', items: data.suppliers },
    { key: 'expenses', label: 'Expenses', icon: Receipt, route: '/expenses', items: data.expenses },
    { key: 'inventory', label: 'Inventory', icon: Package, route: '/inventory', items: data.inventory },
  ]

  const filtered = groups.map(g => ({
    ...g,
    items: g.items.filter(i => i.name?.toLowerCase().includes(query.toLowerCase())),
  })).filter(g => g.items.length > 0)

  const flatItems = filtered.flatMap(g => g.items.map(i => ({ ...i, group: g })))

  const handleSelect = (item) => {
    onClose()
    navigate(item.group.route)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && flatItems[selectedIndex]) { handleSelect(flatItems[selectedIndex]) }
    if (e.key === 'Escape') { onClose() }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30" />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 20px 60px rgba(88,66,63,0.15)' }}>
        <div className="flex items-center gap-3 px-4 border-b border-[#E1D3CC]">
          <MagnifyingGlass size={18} className="text-[#8a7370]" />
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }} onKeyDown={handleKeyDown} placeholder="Search customers, suppliers, expenses, inventory..." className="flex-1 h-12 bg-transparent text-sm text-[#58423F] placeholder:text-[#a69491] focus:outline-none" />
          <kbd className="hidden sm:inline-flex text-[10px] font-medium px-2 py-1 rounded bg-[#f5f0eb] text-[#8a7370]">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.map((g, gi) => {
            const GroupIcon = g.icon
            return (
              <div key={g.key}>
                <div className="flex items-center gap-2 px-3 py-2 mt-1">
                  <GroupIcon size={14} className="text-[#8a7370]" />
                  <span className="text-xs font-semibold tracking-wide text-[#8a7370] uppercase">{g.label}</span>
                </div>
                {g.items.map((item, ii) => {
                  const globalIndex = flatItems.indexOf({ ...item, group: g })
                  const isSelected = globalIndex === selectedIndex
                  return (
                    <button key={item.id} onClick={() => handleSelect({ ...item, group: g })} onMouseEnter={() => setSelectedIndex(globalIndex)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${isSelected ? 'bg-[#7E102C] text-white' : 'text-[#58423F] hover:bg-[#f5f0eb]'}`}>
                      <span>{item.name || '(unnamed)'}</span>
                      <ArrowRight size={14} className={isSelected ? 'text-white/60' : 'text-[#a69491]'} />
                    </button>
                  )
                })}
              </div>
            )
          })}
          {!filtered.length && query && (
            <div className="text-center py-8">
              <p className="text-sm text-[#8a7370]">No results for "{query}"</p>
            </div>
          )}
          {!query && !filtered.length && (
            <div className="text-center py-8">
              <p className="text-sm text-[#8a7370]">Type to search across all modules</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[#E1D3CC] text-[10px] text-[#a69491]">
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#f5f0eb] font-medium">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#f5f0eb] font-medium">↵</kbd> Open</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[#f5f0eb] font-medium">ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  )
}

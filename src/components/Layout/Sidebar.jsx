import { NavLink } from 'react-router-dom'
import { House, Users, Truck, Receipt, Package, ChartBar, Gear } from '@phosphor-icons/react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: House },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/reports', label: 'Reports', icon: ChartBar },
  { to: '/settings', label: 'Settings', icon: Gear },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-white z-30 shadow-lg transform transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-[#E1D3CC]">
          <h2 className="text-lg font-bold tracking-tight text-[#7E102C]">Accounts Ledger</h2>
        </div>
        <nav className="p-3 space-y-0.5">
          {links.map(l => {
            const Icon = l.icon
            return (
              <NavLink key={l.to} to={l.to} onClick={onClose} className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#7E102C] text-white shadow-sm' : 'text-[#58423F] hover:bg-[#E1D3CC] hover:text-[#7E102C]'}`
              }>
                {({ isActive }) => (
                  <>
                    <Icon size={18} weight={isActive ? 'fill' : 'regular'} className={isActive ? '' : 'opacity-60'} />
                    <span>{l.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

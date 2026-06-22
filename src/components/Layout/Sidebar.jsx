import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/suppliers', label: 'Suppliers', icon: '⚤' },
  { to: '/customers', label: 'Customers', icon: '☺' },
  { to: '/expenses', label: 'Expenses', icon: '⟐' },
  { to: '/inventory', label: 'Inventory', icon: '▣' },
  { to: '/reports', label: 'Reports', icon: '◈' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-30 transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-primary">Accounts Ledger</h2>
        </div>
        <nav className="p-2 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

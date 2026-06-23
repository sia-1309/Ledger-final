import { useAuth } from '../../context/AuthContext'
import { List, SignOut, Command } from '@phosphor-icons/react'
import NotificationCenter from '../Global/NotificationCenter'

export default function Header({ onMenuToggle }) {
  const { user, signOut } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-[#E1D3CC] flex items-center justify-between px-5 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-[#f5f0eb] transition-colors duration-150 text-[#58423F]">
          <List size={20} />
        </button>
        <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-[#E1D3CC] text-[10px] text-[#8a7370] bg-[#f5f0eb]">
          <Command size={12} />K
        </kbd>
      </div>
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <span className="text-sm text-[#8a7370] mr-1">{user?.email}</span>
        <button onClick={signOut} className="flex items-center gap-1.5 text-sm font-medium text-[#9b2226] hover:text-[#7E102C] transition-colors duration-150 px-3 py-1.5 rounded-lg hover:bg-[#fce7ea]">
          <SignOut size={16} /> Sign Out
        </button>
      </div>
    </header>
  )
}

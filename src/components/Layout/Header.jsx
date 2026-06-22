import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuToggle }) {
  const { user, signOut } = useAuth()

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
        <span className="text-xl">☰</span>
      </button>
      <div className="flex items-center gap-4 ml-auto">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button onClick={signOut} className="text-sm text-error hover:underline">Sign Out</button>
      </div>
    </header>
  )
}

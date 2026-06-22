import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { getToken } from './managers/storageManager'
import AuthScreen from './components/Auth/AuthScreen'
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import SupplierPage from './components/Suppliers/SupplierPage'
import CustomerPage from './components/Customers/CustomerPage'
import ExpenseList from './components/Expenses/ExpenseList'
import InventoryList from './components/Inventory/InventoryList'
import Reports from './components/Reports/Reports'
import Settings from './components/Settings/Settings'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const token = getToken()
  if (!token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, loading, signUp, signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/', { replace: true })
  }, [user, loading, navigate])

  const handleAuth = async ({ type, email, password }) => {
    if (type === 'signup') {
      await signUp(email, password)
    } else {
      await signIn(email, password)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  if (!user) return <AuthScreen onAuth={handleAuth} />

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/suppliers" element={<SupplierPage />} />
        <Route path="/suppliers/:id" element={<SupplierPage />} />
        <Route path="/customers" element={<CustomerPage />} />
        <Route path="/customers/:id" element={<CustomerPage />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

import { useState } from 'react'

export default function SignInForm({ onSubmit, loading, error: authError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) return
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="you@example.com" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" required />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2 text-sm text-gray-500">{showPw ? 'Hide' : 'Show'}</button>
        </div>
      </div>
      {authError && <p className="text-error text-sm">{authError}</p>}
      <button type="submit" disabled={loading} className="w-full h-10 bg-primary text-white rounded-md font-medium hover:bg-primary-600 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
    </form>
  )
}

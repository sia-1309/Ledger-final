import { useState } from 'react'

export default function SignUpForm({ onSubmit, loading, error: authError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')
    if (!email || !password) { setLocalError('Please fill all fields'); return }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return }
    if (password !== confirmPw) { setLocalError('Passwords do not match'); return }
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
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Min 6 characters" required />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2 text-sm text-gray-500">{showPw ? 'Hide' : 'Show'}</button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Repeat password" required />
      </div>
      {(localError || authError) && <p className="text-error text-sm">{localError || authError}</p>}
      <button type="submit" disabled={loading} className="w-full h-10 bg-primary text-white rounded-md font-medium hover:bg-primary-600 disabled:opacity-50">{loading ? 'Creating Account...' : 'Create Account'}</button>
    </form>
  )
}

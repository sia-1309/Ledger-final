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
        <label className="block text-sm font-medium text-[#58423F] mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-lg bg-white text-[#58423F] placeholder:text-[#a69491] focus:border-[#7E102C] focus:ring-2 focus:ring-[#7E102C]/10 transition-all" placeholder="you@example.com" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#58423F] mb-1">Password</label>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-lg bg-white text-[#58423F] placeholder:text-[#a69491] focus:border-[#7E102C] focus:ring-2 focus:ring-[#7E102C]/10 transition-all pr-14" placeholder="Min 6 characters" required />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2 text-xs font-medium text-[#7E102C] hover:text-[#6b142b]">{showPw ? 'Hide' : 'Show'}</button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#58423F] mb-1">Confirm Password</label>
        <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full h-10 px-3 border border-[#E1D3CC] rounded-lg bg-white text-[#58423F] placeholder:text-[#a69491] focus:border-[#7E102C] focus:ring-2 focus:ring-[#7E102C]/10 transition-all" placeholder="Repeat password" required />
      </div>
      {(localError || authError) && <p className="text-[#9b2226] text-sm">{localError || authError}</p>}
      <button type="submit" disabled={loading} className="w-full h-10 bg-[#7E102C] text-white rounded-lg font-medium text-sm hover:bg-[#6b142b] transition-all disabled:opacity-50 active:scale-[0.98]">{loading ? 'Creating Account...' : 'Create Account'}</button>
    </form>
  )
}

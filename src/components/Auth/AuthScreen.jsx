import { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

export default function AuthScreen({ onAuth }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (email, password) => {
    setLoading(true)
    setError('')
    try {
      await onAuth({ type: isSignUp ? 'signup' : 'signin', email, password })
    } catch (err) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#E1D4C1' }}>
      <div className="w-full max-w-md bg-white rounded-2xl p-8" style={{ boxShadow: '0 4px 24px rgba(88,66,63,0.1), 0 1px 4px rgba(88,66,63,0.06)' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#7E102C]">Accounts Ledger</h1>
          <p className="text-[#8a7370] mt-2 text-sm">{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>
        </div>
        {isSignUp ? (
          <SignUpForm onSubmit={handleSubmit} loading={loading} error={error} />
        ) : (
          <SignInForm onSubmit={handleSubmit} loading={loading} error={error} />
        )}
        <p className="text-center mt-6 text-sm text-[#8a7370]">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} className="text-[#7E102C] font-medium hover:text-[#6b142b] transition-colors">{isSignUp ? 'Sign In' : 'Sign Up'}</button>
        </p>
      </div>
    </div>
  )
}

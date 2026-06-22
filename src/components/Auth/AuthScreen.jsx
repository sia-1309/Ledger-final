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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Accounts Ledger</h1>
          <p className="text-gray-500 mt-1">{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>
        </div>
        {isSignUp ? (
          <SignUpForm onSubmit={handleSubmit} loading={loading} error={error} />
        ) : (
          <SignInForm onSubmit={handleSubmit} loading={loading} error={error} />
        )}
        <p className="text-center mt-6 text-sm text-gray-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} className="text-primary font-medium hover:underline">{isSignUp ? 'Sign In' : 'Sign Up'}</button>
        </p>
      </div>
    </div>
  )
}

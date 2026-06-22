import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabaseClient'
import { setToken, clearToken, getToken } from '../managers/storageManager'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      supabase.auth.getUser(token).then(({ data }) => {
        if (data?.user) setUser(data.user)
        else clearToken()
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email, password) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      clearTimeout(timer)
      if (error) throw error
      if (data?.session) { setToken(data.session.access_token); setUser(data.user) }
      return data
    } catch (err) {
      clearTimeout(timer)
      const msg = err.name === 'AbortError' ? 'Request timed out' : err.message
      throw new Error(msg)
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      clearTimeout(timer)
      if (error) throw error
      if (data?.session) { setToken(data.session.access_token); setUser(data.user) }
      return data
    } catch (err) {
      clearTimeout(timer)
      const msg = err.name === 'AbortError' ? 'Request timed out' : err.message
      throw new Error(msg)
    }
  }, [])

  const signOut = useCallback(async () => {
    clearToken()
    setUser(null)
    sessionStorage.removeItem('ledger_uid')
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

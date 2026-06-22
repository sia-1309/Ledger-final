import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabaseClient'
import { setToken, clearToken, getToken } from '../managers/storageManager'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    setLoading(true); setError(null)
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
      setError(msg); throw err
    } finally { setLoading(false) }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setLoading(true); setError(null)
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
      setError(msg); throw err
    } finally { setLoading(false) }
  }, [])

  const signOut = useCallback(async () => {
    clearToken(); setUser(null); await supabase.auth.signOut()
  }, [])

  return { user, loading, error, signUp, signIn, signOut, isAuthenticated: !!user }
}

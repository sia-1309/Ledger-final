import { supabase } from '../config/supabaseClient'
import { setToken, clearToken } from './storageManager'

export async function signUp(email, password) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    clearTimeout(timer)
    if (error) throw error
    if (data?.session) setToken(data.session.access_token)
    return { user: data.user, session: data.session, error: null }
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') return { user: null, session: null, error: new Error('Request timed out. Please try again.') }
    return { user: null, session: null, error: err }
  }
}

export async function signIn(email, password) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    clearTimeout(timer)
    if (error) throw error
    if (data?.session) setToken(data.session.access_token)
    return { user: data.user, session: data.session, error: null }
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') return { user: null, session: null, error: new Error('Request timed out. Please try again.') }
    return { user: null, session: null, error: err }
  }
}

export async function signOut() {
  clearToken()
  await supabase.auth.signOut()
}

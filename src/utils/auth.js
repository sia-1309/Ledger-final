import { supabase } from '../config/supabaseClient'

export async function getCachedUser() {
  const cached = sessionStorage.getItem('ledger_uid')
  if (cached) return { id: cached }
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id) sessionStorage.setItem('ledger_uid', user.id)
  return user
}

export async function getCachedUserId() {
  const cached = sessionStorage.getItem('ledger_uid')
  if (cached) return cached
  const user = await getCachedUser()
  return user?.id
}

import { supabase } from './supabase'

export async function getRole() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'guest'
  if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) return 'admin'
  return 'user'
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  await supabase.auth.signOut()
}

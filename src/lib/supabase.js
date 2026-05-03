import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[StackWithSid] Supabase env vars missing.\n' +
    'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
  )
}

// Singleton — safe even without env vars (returns null client in dev)
let _supabase = null

export function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return _supabase
}

export const supabase = getSupabase()

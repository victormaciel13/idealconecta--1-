import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Colaborador } from '../types'

interface AuthState {
  session: Session | null; user: User | null; profile: Colaborador | null
  loading: boolean; isGestao: boolean; signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState>({} as AuthState)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Colaborador | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('colaboradores').select('*').eq('id', userId).single()
    setProfile(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) fetchProfile(s.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s?.user) fetchProfile(s.user.id)
      else setProfile(null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = async () => { await supabase.auth.signOut(); setProfile(null) }

  // Re-fetches the profile from the database — call this after updating
  // colaboradores so the whole app (sidebar, dashboard, etc.) reflects the
  // saved data immediately instead of showing stale cached values.
  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchProfile(session.user.id)
  }, [session, fetchProfile])

  const isGestao = profile?.role === 'gerente' || profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, isGestao, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

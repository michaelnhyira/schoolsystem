import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import { AuthContextType, School, SUPER_ADMIN_EMAIL, UserRole } from './types'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [currentSchool, setCurrentSchoolState] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)

  // Determine if the current user is super admin
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL

  // Fetch schools the user has access to
  const fetchSchools = useCallback(async () => {
    if (!user) return Promise.resolve()

    try {
      // Fetch schools where the user is a member
      const { data: memberships, error: memError } = await supabase
        .from('school_members')
        .select('school_id')
        .eq('user_id', user.id)

      if (memError) {
        console.error('Error fetching memberships:', memError)
        return Promise.resolve()
      }

      if (memberships && memberships.length > 0) {
        const schoolIds = memberships.map((m) => m.school_id)
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .in('id', schoolIds)

        if (schoolError) {
          console.error('Error fetching schools:', schoolError)
          return Promise.resolve()
        }

        if (schoolData) {
          setSchools(schoolData)
        }
      } else {
        // Super admin can see all schools
        if (isSuperAdmin) {
          const { data: allSchools, error: allError } = await supabase
            .from('schools')
            .select('*')
            .order('created_at', { ascending: false })

          if (allError) {
            console.error('Error fetching all schools:', allError)
            return Promise.resolve()
          }

          if (allSchools) {
            setSchools(allSchools)
          }
        } else {
          setSchools([])
        }
      }
    } catch (err) {
      console.error('Error in fetchSchools:', err)
    }

    return Promise.resolve()
  }, [user, isSuperAdmin])

  // Sync role asynchronously
  useEffect(() => {
    if (!user) {
      setRole(null)
      return
    }

    let cancelled = false
    const syncRole = async () => {
      if (isSuperAdmin) {
        if (!cancelled) setRole('super_admin')
        return
      }

      const { data } = await supabase
        .from('school_members')
        .select('role')
        .eq('user_id', user.id)
        .limit(1)

      if (!cancelled) {
        // Prioritize owner, then accountant, then teacher
        if (data && data.length > 0) {
          const userRole = data[0].role as UserRole
          setRole(userRole)
        } else {
          setRole(null)
        }
      }
    }

    syncRole().catch(() => {/* ignored */})
    return () => { cancelled = true }
  }, [user, isSuperAdmin])

  // Listen for auth changes
  useEffect(() => {
    let cancelled = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
      } else {
        setUser(null)
        setRole(null)
        setSchools([])
        setCurrentSchoolState(null)
        setLoading(false)
      }
    })

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
        // Don't set loading to false here — let fetchSchools handle it via .finally()
      } else {
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // Fetch schools when user is set — use a ref to track the user ID and avoid re-fetching
  useEffect(() => {
    if (!user) return

    let cancelled = false
    const doFetch = async () => {
      try {
        await fetchSchools()
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    doFetch().catch(() => {/* ignored */})
    return () => { cancelled = true }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const setCurrentSchool = useCallback((school: School | null) => {
    setCurrentSchoolState(school)
  }, [])

  const refreshSchools = useCallback(async () => {
    await fetchSchools()
  }, [fetchSchools])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    setSchools([])
    setCurrentSchoolState(null)
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    role,
    schools,
    currentSchool,
    loading,
    setCurrentSchool,
    refreshSchools,
    signOut,
  }), [user, role, schools, currentSchool, loading, setCurrentSchool, refreshSchools, signOut])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/use-auth'
import { supabase } from '../lib/supabase'
import SchoolCard from '../components/SchoolCard'
import CreateSchoolModal from '../components/CreateSchoolModal'

export default function SuperAdminHub() {
  const { user, schools, loading, signOut, refreshSchools } = useAuth()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({})

  // Fetch member counts for each school
  const fetchMemberCounts = async () => {
    if (!schools.length) return
    const counts: Record<string, number> = {}

    for (const school of schools) {
      const { count } = await supabase
        .from('school_members')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', school.id)

      counts[school.id] = count || 0
    }

    setMemberCounts(counts)
  }

  useEffect(() => {
    if (!loading && schools.length > 0) {
      fetchMemberCounts().catch(() => {/* ignored */})
    }
  }, [schools, loading])

  const handleSchoolClick = (schoolId: string) => {
    navigate(`/school/${schoolId}`)
  }

  const handleCreateSuccess = async () => {
    await refreshSchools()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading schools...</p>
      </div>
    )
  }

  return (
    <div className="super-admin-hub">
      <header className="hub-header">
        <div className="hub-header-left">
          <h1>School Management Hub</h1>
          <p className="hub-subtitle">
            Welcome, {user?.email}. Manage all your schools from here.
          </p>
        </div>
        <div className="hub-header-right">
          <button className="btn-secondary" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="hub-toolbar">
        <div className="hub-search">
          <input
            type="text"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create New School
        </button>
      </div>

      {showCreateModal && (
        <CreateSchoolModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {filteredSchools.length === 0 ? (
        <div className="hub-empty">
          <div className="hub-empty-icon">🏫</div>
          <h2>No schools yet</h2>
          <p>
            {searchQuery
              ? 'No schools match your search.'
              : 'Create your first school to get started.'}
          </p>
          {!searchQuery && (
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              + Create New School
            </button>
          )}
        </div>
      ) : (
        <div className="school-grid">
          {filteredSchools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              memberCount={memberCounts[school.id]}
              onClick={() => handleSchoolClick(school.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

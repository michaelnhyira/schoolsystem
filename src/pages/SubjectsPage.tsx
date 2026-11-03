import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Subject, Teacher } from '../lib/types'
import { useAuth } from '../lib/use-auth'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopBar from '../components/DashboardTopBar'
import SubjectCard from '../components/SubjectCard'
import AddSubjectModal from '../components/AddSubjectModal'

export default function SubjectsPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { user, currentSchool } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!schoolId) return
    fetchData().catch(() => {/* ignored */})
  }, [schoolId])

  const fetchData = async () => {
    if (!schoolId) return
    setLoading(true)
    try {
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId)
        .order('name')

      const { data: teacherData } = await supabase
        .from('teachers')
        .select('id, full_name')
        .eq('school_id', schoolId)

      if (subjectData) setSubjects(subjectData as Subject[])
      if (teacherData) setTeachers(teacherData as Teacher[])
    } catch (err) {
      console.error('Error fetching subjects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) {
      console.error('Error deleting subject:', error)
      return
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  const handleEdit = (subject: Subject) => {
    // TODO: Implement edit modal
    console.log('Edit subject:', subject)
  }

  // Stats
  const totalSubjects = subjects.length
  const activeSubjects = subjects.filter((s) => s.is_active).length
  const fullYearSubjects = subjects.length // All subjects are full year by default
  const teacherCount = teachers.length

  // Filtered subjects
  const filteredSubjects = subjects.filter((subject) => {
    return subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (!user || !currentSchool) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="school-dashboard-new">
      <DashboardSidebar
        school={currentSchool}
        onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileOpen={mobileMenuOpen}
      />
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}
      <div className="dashboard-main-area">
        <DashboardTopBar user={user} onHamburgerClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="dashboard-content-new">
          <div className="page-header">
            <div>
              <h1 className="page-title">Subjects</h1>
              <p className="page-subtitle">Manage academic subjects and curriculum</p>
            </div>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
              </svg>
              Add Subject
            </button>
          </div>

          {/* Stats Cards */}
          <div className="subjects-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#3b82f6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Subjects</span>
                <span className="stat-value">{totalSubjects}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#10b981' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="2" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Active Subjects</span>
                <span className="stat-value">{activeSubjects}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#f59e0b' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <polyline points="12,6 12,12 16,14" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Full Year</span>
                <span className="stat-value">{fullYearSubjects}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#8b5cf6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                  <circle cx="12" cy="7" r="4" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Teachers</span>
                <span className="stat-value">{teacherCount}</span>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="search-bar-container">
            <div className="search-filter-row">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="filter-select"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="early-childhood">Early Childhood</option>
                <option value="primary">Primary</option>
                <option value="jhs">JHS</option>
              </select>
            </div>
          </div>

          {/* Subject Grid */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading subjects...</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="1.5" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="1.5" />
              </svg>
              <h3>No subjects found</h3>
              <p>Add your first subject to get started.</p>
            </div>
          ) : (
            <div className="subject-grid">
              {filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onEdit={() => handleEdit(subject)}
                  onDelete={() => handleDelete(subject.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && schoolId && (
        <AddSubjectModal
          schoolId={schoolId}
          onClose={() => setShowAddModal(false)}
          onSubjectAdded={fetchData}
        />
      )}
    </div>
  )
}

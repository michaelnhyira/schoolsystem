import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Class, Teacher } from '../lib/types'
import { useAuth } from '../lib/use-auth'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopBar from '../components/DashboardTopBar'
import ClassCard from '../components/ClassCard'
import AddClassModal from '../components/AddClassModal'

export default function ClassesPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { user, currentSchool } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!schoolId) return
    const load = async () => {
      await Promise.all([fetchClasses(), fetchTeachers()])
    }
    load().catch(() => {/* ignored */})
  }, [schoolId])

  const fetchClasses = async () => {
    if (!schoolId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)
        .order('grade')

      if (error) {
        console.error('Error fetching classes:', error)
        return
      }
      if (data) {
        setClasses(data as Class[])
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    if (!schoolId) return
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, full_name')
        .eq('school_id', schoolId)

      if (error) {
        console.error('Error fetching teachers:', error)
        return
      }
      if (data) {
        setTeachers(data as Teacher[])
      }
    } catch (err) {
      console.error('Error fetching teachers:', err)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) {
      console.error('Error deleting class:', error)
      return
    }
    setClasses((prev) => prev.filter((c) => c.id !== id))
  }

  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return null
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher?.full_name || null
  }

  // Stats
  const totalClasses = classes.length
  const primaryClasses = classes.filter((c) => c.level === 'primary').length
  const jhsClasses = classes.filter((c) => c.level === 'junior-high').length
  const totalStudents = 0 // Would be calculated from students table

  // Filtered classes
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === 'all' || classItem.level === levelFilter
    return matchesSearch && matchesLevel
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
              <h1 className="page-title">Classes</h1>
              <p className="page-subtitle">Manage your school classes</p>
            </div>
            <div className="page-actions">
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                + Add Class
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="classes-stats">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">🏫</div>
              <div className="stat-content">
                <span className="stat-value">{totalClasses}</span>
                <span className="stat-label">Total Classes</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green">👨‍🎓</div>
              <div className="stat-content">
                <span className="stat-value">{totalStudents}</span>
                <span className="stat-label">Total Students</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-orange">📚</div>
              <div className="stat-content">
                <span className="stat-value">{primaryClasses}</span>
                <span className="stat-label">Primary Classes</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">🎓</div>
              <div className="stat-content">
                <span className="stat-value">{jhsClasses}</span>
                <span className="stat-label">JHS Classes</span>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="search-bar-container">
            <div className="search-filter-row">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="m21 21-4.35-4.35" strokeWidth="2" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search classes..."
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
                <option value="junior-high">Junior High</option>
              </select>
            </div>
          </div>

          {/* Educational Hierarchy */}
          <div className="educational-hierarchy">
            <h3 className="hierarchy-title">Educational Hierarchy</h3>
            <div className="hierarchy-cards">
              <div className="level-card level-card-early">
                <div className="level-card-header">
                  <span className="level-card-icon">🧒</span>
                  <h4>Early Childhood</h4>
                </div>
                <div className="level-card-body">
                  <div className="level-flow">
                    <span className="flow-item">Creche</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-item">Nursery</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-item">Kindergarten</span>
                  </div>
                  <span className="level-age">Ages 6 months - 6 years</span>
                </div>
              </div>
              <div className="level-card level-card-primary">
                <div className="level-card-header">
                  <span className="level-card-icon">📖</span>
                  <h4>Primary</h4>
                </div>
                <div className="level-card-body">
                  <div className="level-flow">
                    <span className="flow-item">Primary 1</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-item">Primary 6</span>
                  </div>
                  <span className="level-age">Ages 6 - 12 years</span>
                </div>
              </div>
              <div className="level-card level-card-jhs">
                <div className="level-card-header">
                  <span className="level-card-icon">🎓</span>
                  <h4>Junior High</h4>
                </div>
                <div className="level-card-body">
                  <div className="level-flow">
                    <span className="flow-item">JHS 1</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-item">JHS 2</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-item">JHS 3</span>
                  </div>
                  <span className="level-age">Ages 12 - 15 years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Classes Grid */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading classes...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="1.5" />
                <polyline points="9,22 9,12 15,12 15,22" strokeWidth="1.5" />
              </svg>
              <h3>No classes found</h3>
              <p>
                {searchQuery || levelFilter !== 'all'
                  ? 'No classes match your search or filter. Try different criteria.'
                  : 'Get started by adding your first class.'}
              </p>
            </div>
          ) : (
            <div className="classes-grid">
              {filteredClasses.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classData={classItem}
                  teacherName={getTeacherName(classItem.class_teacher_id)}
                  studentCount={0}
                  onView={() => {}}
                  onEdit={() => {}}
                  onDelete={() => handleDelete(classItem.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddClassModal
          schoolId={schoolId!}
          teachers={teachers}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false)
            fetchClasses()
          }}
        />
      )}
    </div>
  )
}

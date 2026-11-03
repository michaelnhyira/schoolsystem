import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Student } from '../lib/types'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopBar from '../components/DashboardTopBar'
import StudentCard from '../components/StudentCard'
import AddStudentModal from '../components/AddStudentModal'
import StudentDetailsModal from '../components/StudentDetailsModal'
import EditStudentModal from '../components/EditStudentModal'
import { useAuth } from '../lib/use-auth'

export default function StudentsPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { currentSchool, user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Filters
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'owing' | 'paid'>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | 'early-childhood' | 'primary' | 'jhs'>('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (schoolId) {
      fetchStudents().catch(() => {/* ignored */})
    }
  }, [schoolId])

  const fetchStudents = async () => {
    if (!schoolId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('full_name')

      if (error) {
        console.error('Error fetching students:', error)
      } else {
        setStudents(data || [])
      }
    } catch (err) {
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentAdded = () => {
    fetchStudents().catch(() => {/* ignored */})
  }

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student)
    setShowDetailsModal(true)
  }

  const handleEditStudent = () => {
    setShowDetailsModal(false)
    setShowEditModal(true)
  }

  const handleSaveStudent = () => {
    setShowEditModal(false)
    setSelectedStudent(null)
    fetchStudents().catch(() => {/* ignored */})
  }

  // Filter students
  const filteredStudents = students.filter(student => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!student.full_name.toLowerCase().includes(query) &&
          !student.parent_name.toLowerCase().includes(query)) {
        return false
      }
    }

    // Payment filter (placeholder - all show as paid for now)
    if (paymentFilter === 'owing') return false // No owing students yet
    if (paymentFilter === 'paid') return true // All are paid for now

    // Level filter (placeholder - all show as primary for now)
    if (levelFilter === 'early-childhood') return false
    if (levelFilter === 'jhs') return false
    if (levelFilter === 'primary') return true // All are primary for now

    return true
  })

  if (!currentSchool) {
    return <div className="loading-screen">Loading...</div>
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
              <h1 className="page-title">Students</h1>
              <p className="page-subtitle">Manage your student directory</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              + Add Student
            </button>
          </div>

          <div className="students-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search students by name or parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-chips">
              <div className="filter-group">
                <span className="filter-label">Payment:</span>
                <button
                  className={`filter-chip ${paymentFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPaymentFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-chip ${paymentFilter === 'owing' ? 'active' : ''}`}
                  onClick={() => setPaymentFilter('owing')}
                >
                  Owing
                </button>
                <button
                  className={`filter-chip ${paymentFilter === 'paid' ? 'active' : ''}`}
                  onClick={() => setPaymentFilter('paid')}
                >
                  Paid
                </button>
              </div>

              <div className="filter-group">
                <span className="filter-label">Level:</span>
                <button
                  className={`filter-chip ${levelFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setLevelFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-chip ${levelFilter === 'early-childhood' ? 'active' : ''}`}
                  onClick={() => setLevelFilter('early-childhood')}
                >
                  Early Childhood
                </button>
                <button
                  className={`filter-chip ${levelFilter === 'primary' ? 'active' : ''}`}
                  onClick={() => setLevelFilter('primary')}
                >
                  Primary
                </button>
                <button
                  className={`filter-chip ${levelFilter === 'jhs' ? 'active' : ''}`}
                  onClick={() => setLevelFilter('jhs')}
                >
                  JHS
                </button>
              </div>
            </div>
          </div>

          <div className="student-directory">
            <h2 className="directory-title">Complete list of enrolled students</h2>

            {loading ? (
              <div className="loading-screen">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎓</div>
                <h3>No students yet</h3>
                <p>Click "Add Student" to enroll your first student.</p>
              </div>
            ) : (
              <div className="student-list">
                {filteredStudents.map(student => (
                  <StudentCard key={student.id} student={student} onEdit={handleStudentClick} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddStudentModal
          schoolId={schoolId!}
          onClose={() => setShowAddModal(false)}
          onStudentAdded={handleStudentAdded}
        />
      )}

      {showDetailsModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedStudent(null)
          }}
          onEdit={handleEditStudent}
        />
      )}

      {showEditModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          schoolId={schoolId!}
          onClose={() => {
            setShowEditModal(false)
            setSelectedStudent(null)
          }}
          onSave={handleSaveStudent}
        />
      )}
    </div>
  )
}

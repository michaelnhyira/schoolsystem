import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Class, Teacher, Student } from '../lib/types'
import { useAuth } from '../lib/use-auth'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopBar from '../components/DashboardTopBar'
import PromotionCard from '../components/PromotionCard'

// Educational progression map
const classProgression: Record<string, string> = {
  'Creche': 'Nursery 1',
  'Nursery 1': 'Nursery 2',
  'Nursery 2': 'Kindergarten 1',
  'Kindergarten 1': 'Kindergarten 2',
  'Kindergarten 2': 'Primary 1',
  'Primary 1': 'Primary 2',
  'Primary 2': 'Primary 3',
  'Primary 3': 'Primary 4',
  'Primary 4': 'Primary 5',
  'Primary 5': 'Primary 6',
  'Primary 6': 'JHS 1',
  'JHS 1': 'JHS 2',
  'JHS 2': 'JHS 3',
  'JHS 3': 'Graduation',
}

export default function PromotionsPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { user, currentSchool } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!schoolId) return
    fetchData().catch(() => {/* ignored */})
  }, [schoolId])

  const fetchData = async () => {
    if (!schoolId) return
    setLoading(true)

    try {
      // Fetch classes
      const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)
        .order('grade')

      // Fetch teachers
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('id, full_name, assigned_class')
        .eq('school_id', schoolId)

      // Fetch students
      const { data: studentData } = await supabase
        .from('students')
        .select('id, assigned_class')
        .eq('school_id', schoolId)

      if (classData) setClasses(classData as Class[])
      if (teacherData) setTeachers(teacherData as Teacher[])
      if (studentData) setStudents(studentData as Student[])
    } catch (err) {
      console.error('Error fetching promotion data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get teacher assigned to a class
  const getTeacherForClass = (className: string) => {
    // First check by class_teacher_id on the class record
    const classRecord = classes.find((c) => c.name === className)
    if (classRecord?.class_teacher_id) {
      const teacher = teachers.find((t) => t.id === classRecord.class_teacher_id)
      if (teacher) return teacher.full_name
    }
    // Fallback: check by assigned_class on teacher record
    const teacher = teachers.find((t) => t.assigned_class === className)
    return teacher?.full_name || null
  }

  // Count students in a class
  const getStudentCount = (className: string) => {
    return students.filter((s) => s.assigned_class === className).length
  }

  // Count unassigned students
  const unassignedStudents = students.filter((s) => !s.assigned_class).length

  // Stats
  const totalClasses = classes.length
  const totalStudents = students.length
  const classesWithPending = 0 // Can be enhanced later with actual promotion status
  const newlyPromoted = 0 // Can be enhanced later

  // Build promotion list: all classes + unassigned
  interface PromotionItem {
    className: string
    teacherName: string | null
    totalStudents: number
    nextClass: string
    hasRepeaters: number
    isGraduation: boolean
  }

  const promotionItems: PromotionItem[] = classes.map((cls) => ({
    className: cls.name,
    teacherName: getTeacherForClass(cls.name),
    totalStudents: getStudentCount(cls.name),
    nextClass: classProgression[cls.name] || 'None',
    hasRepeaters: 0, // Can be enhanced later
    isGraduation: cls.name === 'JHS 3',
  }))

  if (unassignedStudents > 0) {
    promotionItems.push({
      className: 'Unassigned',
      teacherName: null,
      totalStudents: unassignedStudents,
      nextClass: 'Assign to class',
      hasRepeaters: 0,
      isGraduation: false,
    })
  }

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
              <h1 className="page-title">Manage Promotions</h1>
              <p className="page-subtitle">Overview of all class promotions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="promotions-stats">
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Total Classes</span>
                <span className="stat-value">{totalClasses}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Classes with Pending</span>
                <span className="stat-value" style={{ color: '#ef4444' }}>{classesWithPending}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Total Students</span>
                <span className="stat-value">{totalStudents}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <span className="stat-label">Newly Promoted</span>
                <span className="stat-value" style={{ color: '#2563eb' }}>{newlyPromoted}</span>
              </div>
            </div>
          </div>

          {/* All Classes Section */}
          <div className="all-classes-section">
            <h3 className="section-title">All Classes</h3>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading promotions...</p>
              </div>
            ) : promotionItems.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="1.5" />
                  <polyline points="9,22 9,12 15,12 15,22" strokeWidth="1.5" />
                </svg>
                <h3>No classes found</h3>
                <p>Add classes first to see promotion details.</p>
              </div>
            ) : (
              <div className="promotion-grid">
                {promotionItems.map((item, index) => (
                  <PromotionCard
                    key={index}
                    className={item.className}
                    teacherName={item.teacherName}
                    totalStudents={item.totalStudents}
                    nextClass={item.nextClass}
                    hasRepeaters={item.hasRepeaters}
                    isGraduation={item.isGraduation}
                    onViewDetails={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

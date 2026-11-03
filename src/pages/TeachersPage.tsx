import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Teacher } from '../lib/types'
import { useAuth } from '../lib/use-auth'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopBar from '../components/DashboardTopBar'
import TeacherCard from '../components/TeacherCard'
import AddTeacherModal from '../components/AddTeacherModal'
import TeacherDetailsModal from '../components/TeacherDetailsModal'

const sampleTeachers = [
  { name: 'Mr. John Smith', subjects: 'Mathematics, Algebra', class: 'Grade 5A', email: 'john.smith@school.com', phone: '+233 20 123 4567', hireDate: '2024-01-15' },
  { name: 'Mrs. Sarah Johnson', subjects: 'English Language, Literature', class: 'Grade 4B', email: 'sarah.j@school.com', phone: '+233 24 234 5678', hireDate: '2024-02-01' },
  { name: 'Mr. David Osei', subjects: 'Science, Physics', class: 'Grade 6A', email: 'david.osei@school.com', phone: '+233 27 345 6789', hireDate: '2023-09-10' },
  { name: 'Ms. Ama Mensah', subjects: 'Social Studies, History', class: 'Grade 3C', email: 'ama.mensah@school.com', phone: '+233 26 456 7890', hireDate: '2024-03-20' },
  { name: 'Mr. Kwame Asante', subjects: 'Computing, ICT', class: 'Grade 5B', email: 'kwame.a@school.com', phone: '+233 28 567 8901', hireDate: '2023-11-05' },
  { name: 'Mrs. Grace Adjei', subjects: 'French, Spanish', class: 'Grade 4A', email: 'grace.adjei@school.com', phone: '+233 20 678 9012', hireDate: '2024-01-22' },
  { name: 'Mr. Emmanuel Boateng', subjects: 'Mathematics, Geometry', class: 'Grade 6B', email: 'emmanuel.b@school.com', phone: '+233 24 789 0123', hireDate: '2023-08-14' },
  { name: 'Ms. Abena Darko', subjects: 'Creative Arts, Music', class: 'Grade 2A', email: 'abena.darko@school.com', phone: '+233 27 890 1234', hireDate: '2024-04-01' },
  { name: 'Mr. Francis Owusu', subjects: 'Physical Education, Health', class: 'Grade 3A', email: 'francis.o@school.com', phone: '+233 26 901 2345', hireDate: '2023-10-18' },
  { name: 'Mrs. Esi Agyemang', subjects: 'Religious & Moral Education', class: 'Grade 5C', email: 'esi.agyemang@school.com', phone: '+233 28 012 3456', hireDate: '2024-02-15' },
  { name: 'Mr. Kofi Mensing', subjects: 'Chemistry, Biology', class: 'Grade 6C', email: 'kofi.mensing@school.com', phone: '+233 20 111 2233', hireDate: '2023-07-20' },
  { name: 'Ms. Yaa Ansah', subjects: 'English Language, Drama', class: 'Grade 4C', email: 'yaa.ansah@school.com', phone: '+233 24 222 3344', hireDate: '2024-05-10' },
  { name: 'Mr. Daniel Tetteh', subjects: 'Mathematics, Statistics', class: 'Grade 3B', email: 'daniel.t@school.com', phone: '+233 27 333 4455', hireDate: '2023-12-01' },
  { name: 'Mrs. Akosua Frimpong', subjects: 'Science, Biology', class: 'Grade 2B', email: 'akosua.f@school.com', phone: '+233 26 444 5566', hireDate: '2024-03-05' },
  { name: 'Mr. Isaac Addo', subjects: 'Social Studies, Geography', class: 'Grade 5D', email: 'isaac.addo@school.com', phone: '+233 28 555 6677', hireDate: '2023-09-25' },
  { name: 'Ms. Ama Serwaa', subjects: 'Computing, Robotics', class: 'Grade 6D', email: 'ama.serwaa@school.com', phone: '+233 20 666 7788', hireDate: '2024-01-30' },
  { name: 'Mr. Bright Agyei', subjects: 'French, German', class: 'Grade 4D', email: 'bright.agyei@school.com', phone: '+233 24 777 8899', hireDate: '2023-11-15' },
  { name: 'Mrs. Nana Aba', subjects: 'Creative Arts, Dance', class: 'Grade 2C', email: 'nana.aba@school.com', phone: '+233 27 888 9900', hireDate: '2024-04-20' },
  { name: 'Mr. Samuel Kwarteng', subjects: 'Physical Education, Sports', class: 'Grade 3D', email: 'samuel.k@school.com', phone: '+233 26 999 0011', hireDate: '2023-08-08' },
  { name: 'Ms. Efua Boateng', subjects: 'Religious Studies, Philosophy', class: 'Grade 5E', email: 'efua.boateng@school.com', phone: '+233 28 000 1122', hireDate: '2024-02-28' },
]

export default function TeachersPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { user, currentSchool } = useAuth()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!schoolId) return
    fetchTeachers().catch(() => {/* ignored */})
  }, [schoolId])

  const fetchTeachers = async () => {
    if (!schoolId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('school_id', schoolId)
        .order('full_name')

      if (error) {
        console.error('Error fetching teachers:', error)
        return
      }
      if (data) {
        setTeachers(data as Teacher[])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('teachers').delete().eq('id', id)
    if (error) {
      console.error('Error deleting teacher:', error)
      return
    }
    setTeachers((prev) => prev.filter((t) => t.id !== id))
  }

  const handleGenerate20 = async () => {
    if (!schoolId || !user) return
    setGenerating(true)
    try {
      const teachersToInsert = sampleTeachers.map((t) => ({
        school_id: schoolId,
        full_name: t.name,
        email: t.email,
        phone: t.phone,
        subjects: t.subjects,
        assigned_class: t.class,
        hire_date: t.hireDate,
      }))

      const { error } = await supabase.from('teachers').insert(teachersToInsert)
      if (error) {
        console.error('Error generating teachers:', error)
      }
    } finally {
      setGenerating(false)
    }
  }

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              <h1 className="page-title">Teachers</h1>
              <p className="page-subtitle">Manage your teaching staff</p>
            </div>
            <div className="page-actions">
              <button
                className="btn btn-success"
                onClick={handleGenerate20}
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate 20 Teachers'}
              </button>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                + Add Teacher
              </button>
            </div>
          </div>

          <div className="search-bar-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search teachers by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading teachers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="1.5" />
                <circle cx="9" cy="7" r="4" strokeWidth="1.5" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="1.5" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="1.5" />
              </svg>
              <h3>No teachers found</h3>
              <p>
                {searchQuery
                  ? 'No teachers match your search. Try a different name.'
                  : 'Get started by adding your first teacher or generating sample data.'}
              </p>
            </div>
          ) : (
            <div className="teachers-grid">
              {filteredTeachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  onDelete={() => handleDelete(teacher.id)}
                  onEdit={() => setSelectedTeacher(teacher)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddTeacherModal
          schoolId={schoolId!}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false)
            fetchTeachers()
          }}
        />
      )}

      {selectedTeacher && (
        <TeacherDetailsModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </div>
  )
}

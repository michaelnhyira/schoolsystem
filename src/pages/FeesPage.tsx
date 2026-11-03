import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Student, FeePayment, FeeSettings } from '../lib/types'
import { useAuth } from '../lib/use-auth'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopBar from '../components/DashboardTopBar'
import FeeStudentCard from '../components/FeeStudentCard'
import PayFeesModal from '../components/PayFeesModal'
import SetFeesModal from '../components/SetFeesModal'

type PaymentStatus = 'no-payment' | 'partial-payment' | 'fully-paid'

export default function FeesPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { user, currentSchool } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [feeSettings, setFeeSettings] = useState<FeeSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'owing' | 'paid'>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | 'early-childhood' | 'primary' | 'jhs'>('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showSetFeesModal, setShowSetFeesModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentTerm = '2025 - 3rd Term'

  useEffect(() => {
    if (!schoolId) return
    fetchData().catch(() => {/* ignored */})
  }, [schoolId])

  const fetchData = async () => {
    if (!schoolId) return
    setLoading(true)
    try {
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('full_name')

      const { data: paymentData } = await supabase
        .from('fee_payments')
        .select('*')
        .eq('school_id', schoolId)
        .eq('term', currentTerm)

      const { data: settingsData } = await supabase
        .from('fee_settings')
        .select('*')
        .eq('school_id', schoolId)
        .eq('term', currentTerm)
        .single()

      if (studentData) setStudents(studentData as Student[])
      if (paymentData) setPayments(paymentData as FeePayment[])
      if (settingsData) setFeeSettings(settingsData as FeeSettings)
    } catch (err) {
      console.error('Error fetching fees data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatus = (studentId: string): PaymentStatus => {
    if (!feeSettings) return 'no-payment'

    const studentPayments = payments.filter((p) => p.student_id === studentId)
    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0)

    if (totalPaid >= feeSettings.total_fees) return 'fully-paid'
    if (totalPaid > 0) return 'partial-payment'
    return 'no-payment'
  }

  // Filter students
  const filteredStudents = students.filter((student) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = student.full_name.toLowerCase().includes(query)
      const matchesParent = student.parent_name.toLowerCase().includes(query)
      const matchesPhone = student.parent_contact.toLowerCase().includes(query)
      const matchesClass = student.assigned_class?.toLowerCase().includes(query)
      if (!matchesName && !matchesParent && !matchesPhone && !matchesClass) return false
    }

    // Payment status filter
    const status = getPaymentStatus(student.id)
    if (paymentFilter === 'owing' && status === 'fully-paid') return false
    if (paymentFilter === 'paid' && status !== 'fully-paid') return false

    // Level filter
    if (levelFilter !== 'all') {
      const className = student.assigned_class || ''
      if (levelFilter === 'early-childhood') {
        if (!/creche|nursery|kindergarten/i.test(className)) return false
      } else if (levelFilter === 'primary') {
        if (!/primary/i.test(className)) return false
      } else if (levelFilter === 'jhs') {
        if (!/jhs/i.test(className)) return false
      }
    }

    return true
  })

  // Stats
  const totalStudents = students.length
  const fullyPaid = students.filter((s) => getPaymentStatus(s.id) === 'fully-paid').length
  const owing = totalStudents - fullyPaid
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)

  const handlePayFees = (student: Student) => {
    setSelectedStudent(student)
    setShowPayModal(true)
  }

  const handleHistory = () => {
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
              <h1 className="page-title">Fees Management</h1>
              <p className="page-subtitle">Track and manage student fee payments</p>
            </div>
            <div className="fees-header-actions">
              <span className="term-badge">{currentTerm}</span>
              <div className="action-buttons">
                <button className="btn-outline" onClick={fetchData}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M23 4v6h-6" strokeWidth="2" />
                    <path d="M1 20v-6h6" strokeWidth="2" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" strokeWidth="2" />
                    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" strokeWidth="2" />
                  </svg>
                  Refresh
                </button>
                <button className="btn-outline" onClick={handleHistory}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
                    <polyline points="7 10 12 15 17 10" strokeWidth="2" />
                    <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
                  </svg>
                  Export
                </button>
                <button className="btn-primary" onClick={() => setShowSetFeesModal(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
                    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
                  </svg>
                  Set Fees
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="fees-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#3b82f6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
                  <circle cx="9" cy="7" r="4" strokeWidth="2" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Students</span>
                <span className="stat-value">{totalStudents}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#ef4444' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Owing</span>
                <span className="stat-value">{owing}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#10b981' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Fully Paid</span>
                <span className="stat-value">{fullyPaid}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#8b5cf6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Collected</span>
                <span className="stat-value">₵{totalCollected.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search by student name, class, parent, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-chips-row">
            <div className="filter-chip-group">
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
                Owing ({owing})
              </button>
              <button
                className={`filter-chip ${paymentFilter === 'paid' ? 'active' : ''}`}
                onClick={() => setPaymentFilter('paid')}
              >
                Fully Paid ({fullyPaid})
              </button>
            </div>
            <div className="filter-chip-group">
              <button
                className={`filter-chip ${levelFilter === 'all' ? 'active' : ''}`}
                onClick={() => setLevelFilter('all')}
              >
                All Levels
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

          {/* Students Section */}
          <div className="students-section">
            <h3 className="section-title">Students</h3>
            {loading ? (
              <div className="empty-state">
                <div className="loading-spinner"></div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="1.5" />
                  <circle cx="9" cy="7" r="4" strokeWidth="1.5" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="1.5" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="1.5" />
                </svg>
                <h4>No students found</h4>
                <p>Add students to start tracking fee payments.</p>
              </div>
            ) : (
              <div className="fee-student-list">
                {filteredStudents.map((student) => (
                  <FeeStudentCard
                    key={student.id}
                    student={student}
                    paymentStatus={getPaymentStatus(student.id)}
                    onPayFees={() => handlePayFees(student)}
                    onHistory={handleHistory}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayModal && selectedStudent && schoolId && (
        <PayFeesModal
          student={selectedStudent}
          schoolId={schoolId}
          onClose={() => {
            setShowPayModal(false)
            setSelectedStudent(null)
          }}
          onPaymentRecorded={fetchData}
        />
      )}

      {showSetFeesModal && schoolId && (
        <SetFeesModal
          schoolId={schoolId}
          onClose={() => setShowSetFeesModal(false)}
          onFeesSet={fetchData}
        />
      )}
    </div>
  )
}

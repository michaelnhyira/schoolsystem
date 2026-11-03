import { useState } from 'react'
import { Student } from '../lib/types'

interface StudentDetailsModalProps {
  student: Student
  onClose: () => void
  onEdit: () => void
}

type SectionTab = 'personal' | 'academic' | 'parent-guardian' | 'documentation' | 'school-use'

export default function StudentDetailsModal({ student, onClose, onEdit }: StudentDetailsModalProps) {
  const [activeSection, setActiveSection] = useState<SectionTab>('personal')

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter((n) => n.trim()).slice(0, 2)
    return parts.map((n) => n[0]).join('').toUpperCase()
  }

  const generateStudentId = (id: string) => {
    const shortId = id.substring(0, 4).toUpperCase()
    const num = parseInt(id.substring(4, 8), 16) % 9999
    return `ADM${shortId}${num.toString().padStart(3, '0')}`
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const studentId = generateStudentId(student.id)

  const sections: { key: SectionTab; label: string; icon: string }[] = [
    { key: 'personal', label: 'Personal', icon: '👤' },
    { key: 'academic', label: 'Academic', icon: '🎓' },
    { key: 'parent-guardian', label: 'Parent/Guardian', icon: '👥' },
    { key: 'documentation', label: 'Documentation', icon: '📁' },
    { key: 'school-use', label: 'School Use', icon: '🏫' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content student-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="student-details-header">
          <h2>Student Details</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="student-details-body">
          {/* Left Sidebar */}
          <div className="student-details-sidebar">
            <div className="student-details-photo">
              {student.photo_url ? (
                <img src={student.photo_url} alt={student.full_name} />
              ) : (
                <div className="student-details-avatar">{getInitials(student.full_name)}</div>
              )}
            </div>
            <h3 className="student-details-name">{student.full_name}</h3>
            <p className="student-details-student-id">Student ID: {studentId}</p>

            <div className="student-details-actions">
              <button className="btn btn-primary btn-sm" onClick={onEdit}>Edit Details</button>
              <button className="btn btn-secondary btn-sm">View History</button>
            </div>

            <nav className="student-details-nav">
              {sections.map((section) => (
                <button
                  key={section.key}
                  className={`student-nav-item ${activeSection === section.key ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.key)}
                >
                  <span className="nav-icon">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content */}
          <div className="student-details-content">
            {activeSection === 'personal' && (
              <div className="student-details-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Student ID</label>
                    <span>{studentId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Full Name</label>
                    <span>{student.full_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <span>{formatDate(student.date_of_birth)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Gender</label>
                    <span>{student.gender || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Religion</label>
                    <span>{student.religion || 'N/A'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Address</label>
                    <span>{student.address || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Place of Birth</label>
                    <span>{student.place_of_birth || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'academic' && (
              <div className="student-details-section">
                <h3 className="section-title">Academic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Assigned Class</label>
                    <span>{student.assigned_class || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>House</label>
                    <span>{student.house || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Previous School</label>
                    <span>{student.previous_school || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Class Completed</label>
                    <span>{student.last_class_completed || 'N/A'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Special Needs</label>
                    <span>{student.special_needs || 'None'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'parent-guardian' && (
              <div className="student-details-section">
                <h3 className="section-title">Parent/Guardian Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Parent/Guardian Name</label>
                    <span>{student.parent_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Relationship</label>
                    <span>{student.parent_relationship || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Occupation</label>
                    <span>{student.parent_occupation || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contact Number</label>
                    <span>{student.parent_contact || 'N/A'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Address</label>
                    <span>{student.parent_address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'documentation' && (
              <div className="student-details-section">
                <h3 className="section-title">Documentation</h3>
                <div className="detail-item full-width">
                  <label>Documents</label>
                  <div className="document-upload-area">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="48" height="48">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="1.5" />
                      <polyline points="14 2 14 8 20 8" strokeWidth="1.5" />
                    </svg>
                    <p>No documents uploaded</p>
                    <button className="btn btn-secondary btn-sm">Upload Document</button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'school-use' && (
              <div className="student-details-section">
                <h3 className="section-title">School Use Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Student ID</label>
                    <span>{studentId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Assigned Class</label>
                    <span>{student.assigned_class || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>House</label>
                    <span>{student.house || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Enrollment Date</label>
                    <span>{formatDate(student.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className="status-badge active">Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

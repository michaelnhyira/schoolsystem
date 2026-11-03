import { useState } from 'react'
import { Teacher } from '../lib/types'

interface TeacherDetailsModalProps {
  teacher: Teacher
  onClose: () => void
}

type SectionTab = 'school-use' | 'personal' | 'professional' | 'next-of-kin' | 'documentation'

export default function TeacherDetailsModal({ teacher, onClose }: TeacherDetailsModalProps) {
  const [activeSection, setActiveSection] = useState<SectionTab>('school-use')

  const getInitials = (name: string) => {
    const parts = name
      .split(' ')
      .filter((n) => !['Mr', 'Mrs', 'Ms', 'Dr'].includes(n))
      .slice(0, 2)
    return parts.map((n) => n[0]).join('').toUpperCase()
  }

  const generateStaffId = (id: string) => {
    // Generate a deterministic staff ID from the teacher's UUID
    const shortId = id.substring(0, 4).toUpperCase()
    const num = parseInt(id.substring(4, 8), 16) % 9999
    return `STF${shortId}${num.toString().padStart(3, '0')}`
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const calculateExperience = (hireDate: string | null) => {
    if (!hireDate) return '0 years'
    const start = new Date(hireDate)
    const now = new Date()
    const years = Math.floor((now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    return `${years} year${years !== 1 ? 's' : ''}`
  }

  const staffId = generateStaffId(teacher.id)
  const experience = calculateExperience(teacher.hire_date || teacher.appointment_date)

  const sections: { key: SectionTab; label: string; icon: JSX.Element }[] = [
    {
      key: 'personal',
      label: 'Personal',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
          <circle cx="12" cy="7" r="4" strokeWidth="2" />
        </svg>
      ),
    },
    {
      key: 'professional',
      label: 'Professional',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="2" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="2" />
        </svg>
      ),
    },
    {
      key: 'next-of-kin',
      label: 'Next of Kin',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
          <circle cx="9" cy="7" r="4" strokeWidth="2" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
        </svg>
      ),
    },
    {
      key: 'documentation',
      label: 'Documentation',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeWidth="2" />
        </svg>
      ),
    },
    {
      key: 'school-use',
      label: 'School Use',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" />
          <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" />
        </svg>
      ),
    },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content teacher-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="teacher-details-header">
          <h2>Teacher Details</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="teacher-details-body">
          {/* Left Sidebar */}
          <div className="teacher-details-sidebar">
            <div className="teacher-details-photo">
              {teacher.photo_url ? (
                <img src={teacher.photo_url} alt={teacher.full_name} />
              ) : (
                <div className="teacher-details-avatar">{getInitials(teacher.full_name)}</div>
              )}
            </div>
            <h3 className="teacher-details-name">{teacher.full_name}</h3>
            <p className="teacher-details-staff-id">Staff ID: {staffId}</p>

            <div className="teacher-details-actions">
              <button className="btn btn-primary btn-sm">Edit Details</button>
              <button className="btn btn-secondary btn-sm">View History</button>
            </div>

            <nav className="teacher-details-nav">
              {sections.map((section) => (
                <button
                  key={section.key}
                  className={`teacher-nav-item ${activeSection === section.key ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.key)}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content */}
          <div className="teacher-details-content">
            {activeSection === 'school-use' && (
              <div className="teacher-details-section">
                <h3 className="section-title">School Use Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Staff ID</label>
                    <span>{staffId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className="status-badge active">active</span>
                  </div>
                  <div className="detail-item">
                    <label>Hire Date</label>
                    <span>{formatDate(teacher.hire_date || teacher.appointment_date)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Experience</label>
                    <span>{experience}</span>
                  </div>
                  <div className="detail-item">
                    <label>Subjects</label>
                    <span>{teacher.subjects || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{teacher.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Assigned Class</label>
                    <span>{teacher.assigned_class || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <span>{teacher.phone || 'N/A'}</span>
                  </div>
                </div>

                <h3 className="section-title">Documentation</h3>
                <div className="detail-item">
                  <label>Documents</label>
                  <div className="document-upload-area">
                    <p>No documents uploaded</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'personal' && (
              <div className="teacher-details-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <span>{teacher.full_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <span>{formatDate(teacher.date_of_birth)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Gender</label>
                    <span>{teacher.gender || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Marital Status</label>
                    <span>{teacher.marital_status || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nationality</label>
                    <span>{teacher.nationality || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Religion</label>
                    <span>{teacher.religion || 'N/A'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Address</label>
                    <span>{teacher.address || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <span>{teacher.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{teacher.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'professional' && (
              <div className="teacher-details-section">
                <h3 className="section-title">Professional Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Qualification</label>
                    <span>{teacher.qualification || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Experience</label>
                    <span>{teacher.experience || experience}</span>
                  </div>
                  <div className="detail-item">
                    <label>Appointment Date</label>
                    <span>{formatDate(teacher.appointment_date)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Assigned Subjects</label>
                    <span>{teacher.assigned_subjects ? teacher.assigned_subjects.join(', ') : teacher.subjects || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Assigned Class</label>
                    <span>{teacher.assigned_class || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'next-of-kin' && (
              <div className="teacher-details-section">
                <h3 className="section-title">Next of Kin Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{teacher.next_of_kin_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Relationship</label>
                    <span>{teacher.next_of_kin_relationship || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contact Number</label>
                    <span>{teacher.next_of_kin_contact || 'N/A'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Address</label>
                    <span>{teacher.next_of_kin_address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'documentation' && (
              <div className="teacher-details-section">
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
          </div>
        </div>
      </div>
    </div>
  )
}

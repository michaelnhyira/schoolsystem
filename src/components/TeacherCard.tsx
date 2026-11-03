import { Teacher } from '../lib/types'

interface TeacherCardProps {
  teacher: Teacher
  onDelete: () => void
  onEdit: () => void
}

export default function TeacherCard({ teacher, onDelete, onEdit }: TeacherCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter((n) => n.startsWith('Mr') || n.startsWith('Mrs') || n.startsWith('Ms'))
      .slice(1)
      .concat(name.split(' ').filter((n) => !['Mr', 'Mrs', 'Ms', 'Dr'].includes(n)))
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const subjects = teacher.subjects.split(',').map((s) => s.trim())

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="teacher-card">
      <div className="teacher-card-header">
        <div className="teacher-avatar">
          {teacher.photo_url ? (
            <img src={teacher.photo_url} alt={teacher.full_name} />
          ) : (
            <span>{getInitials(teacher.full_name)}</span>
          )}
        </div>
        <button className="teacher-delete-btn" onClick={onDelete} title="Remove teacher">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" strokeWidth="2" />
          </svg>
        </button>
      </div>
      <div className="teacher-card-body">
        <h3 className="teacher-name" onClick={onEdit} style={{ cursor: 'pointer' }} title="Click to view details">{teacher.full_name}</h3>
        <div className="teacher-subjects">
          {subjects.map((subject, i) => (
            <span key={i} className="subject-tag">{subject}</span>
          ))}
        </div>
        <div className="teacher-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
          </svg>
          <span>{teacher.assigned_class || 'Not assigned'}</span>
        </div>
        <div className="teacher-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2" />
            <polyline points="22,6 12,13 2,6" strokeWidth="2" />
          </svg>
          <span>{teacher.email || 'No email'}</span>
        </div>
        <div className="teacher-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeWidth="2" />
          </svg>
          <span>{teacher.phone}</span>
        </div>
        <div className="teacher-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
          </svg>
          <span>Hired: {formatDate(teacher.hire_date)}</span>
        </div>
      </div>
    </div>
  )
}

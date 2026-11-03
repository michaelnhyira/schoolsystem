import { Class } from '../lib/types'

interface ClassCardProps {
  classData: Class
  teacherName: string | null
  studentCount: number
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function ClassCard({ classData, teacherName, studentCount, onView, onEdit, onDelete }: ClassCardProps) {
  const levelLabel = (level: string) => {
    switch (level) {
      case 'early-childhood': return 'Early Childhood'
      case 'primary': return 'Primary'
      case 'junior-high': return 'Junior High'
      default: return level
    }
  }

  const levelBadgeClass = (level: string) => {
    switch (level) {
      case 'early-childhood': return 'level-badge-early'
      case 'primary': return 'level-badge-primary'
      case 'junior-high': return 'level-badge-jhs'
      default: return ''
    }
  }

  const subjects = classData.assigned_subjects || []
  const displaySubjects = subjects.slice(0, 3)
  const moreCount = subjects.length - 3

  return (
    <div className="class-card">
      <div className="class-card-header">
        <div>
          <h3 className="class-name">{classData.name}</h3>
          <span className={`level-badge ${levelBadgeClass(classData.level)}`}>
            {levelLabel(classData.level)}
          </span>
        </div>
        <div className="class-card-actions">
          <button className="class-action-btn view-btn" onClick={onView} title="View class">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
            </svg>
          </button>
          <button className="class-action-btn edit-btn" onClick={onEdit} title="Edit class">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" />
            </svg>
          </button>
          <button className="class-action-btn delete-btn" onClick={onDelete} title="Delete class">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="class-card-body">
        <div className="class-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
            <circle cx="12" cy="7" r="4" strokeWidth="2" />
          </svg>
          <span>{teacherName || 'TBA'}</span>
        </div>
        <div className="class-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
            <circle cx="9" cy="7" r="4" strokeWidth="2" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
          </svg>
          <span>{studentCount} students</span>
        </div>
        {classData.room && (
          <div className="class-info-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" />
              <polyline points="9,22 9,12 15,12 15,22" strokeWidth="2" />
            </svg>
            <span>{classData.room}</span>
          </div>
        )}
        {subjects.length > 0 && (
          <div className="class-subjects">
            {displaySubjects.map((subject, i) => (
              <span key={i} className="subject-tag">{subject}</span>
            ))}
            {moreCount > 0 && (
              <span className="subject-tag more-tag">+{moreCount} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

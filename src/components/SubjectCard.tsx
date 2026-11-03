import { Subject } from '../lib/types'

interface SubjectCardProps {
  subject: Subject
  onEdit: () => void
  onDelete: () => void
}

export default function SubjectCard({ subject, onEdit, onDelete }: SubjectCardProps) {
  return (
    <div className="subject-card">
      <div className="subject-card-header">
        <h4 className="subject-name">{subject.name}</h4>
        <span className={`status-badge ${subject.is_active ? 'status-active' : 'status-inactive'}`}>
          {subject.is_active ? 'active' : 'inactive'}
        </span>
      </div>
      <div className="subject-card-actions">
        <button className="btn-edit" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" />
          </svg>
          Edit
        </button>
        <button className="btn-delete" onClick={onDelete}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

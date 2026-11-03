import { Student } from '../lib/types'

interface StudentCardProps {
  student: Student
  onEdit?: (student: Student) => void
}

export default function StudentCard({ student, onEdit }: StudentCardProps) {
  const balance = '₵0'
  const balanceClass = student.assigned_class ? 'balance-green' : 'balance-red'

  return (
    <div
      className={`student-card${onEdit ? ' student-card-clickable' : ''}`}
      onClick={() => onEdit?.(student)}
    >
      <div className="student-avatar">
        {student.full_name.charAt(0).toUpperCase()}
      </div>
      <div className="student-info">
        <div className="student-name">{student.full_name}</div>
        <div className="student-details">
          <span className="student-class">
            {student.assigned_class || 'No class assigned'}
          </span>
          <span className="student-separator">•</span>
          <span className="student-parent">{student.parent_name}</span>
        </div>
        <div className="student-contact">{student.parent_contact}</div>
      </div>
      <div className={`student-balance ${balanceClass}`}>
        {balance}
      </div>
    </div>
  )
}

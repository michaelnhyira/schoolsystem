interface PromotionCardProps {
  className: string
  teacherName: string | null
  totalStudents: number
  nextClass: string
  hasRepeaters?: number
  isGraduation?: boolean
  onViewDetails: () => void
}

export default function PromotionCard({
  className,
  teacherName,
  totalStudents,
  nextClass,
  hasRepeaters = 0,
  isGraduation = false,
  onViewDetails,
}: PromotionCardProps) {
  return (
    <div className="promotion-card">
      <div className="promotion-card-header">
        <h4 className="promotion-class-name">{className}</h4>
        <div className="promotion-badges">
          <span className="badge badge-ready">Ready</span>
          {hasRepeaters > 0 && (
            <span className="badge badge-repeaters">Has Repeaters ({hasRepeaters})</span>
          )}
        </div>
      </div>
      <div className="promotion-card-body">
        <div className="promotion-info-row">
          <span className="promotion-label">Teacher:</span>
          <span className="promotion-value">
            {teacherName || <em className="no-teacher">No teacher assigned</em>}
          </span>
        </div>
        <div className="promotion-info-row">
          <span className="promotion-label">Total Students:</span>
          <span className="promotion-value">{totalStudents}</span>
        </div>
        {isGraduation ? (
          <div className="promotion-info-row">
            <span className="promotion-label">Completion:</span>
            <span className="promotion-value graduation-text">Graduation</span>
          </div>
        ) : (
          <div className="promotion-info-row">
            <span className="promotion-label">Next Class:</span>
            <span className="promotion-value next-class-text">{nextClass}</span>
          </div>
        )}
        {hasRepeaters > 0 && (
          <div className="promotion-info-row">
            <span className="promotion-label">Repeating:</span>
            <span className="promotion-value repeater-text">{hasRepeaters}</span>
          </div>
        )}
      </div>
      <button className="btn-view-details" onClick={onViewDetails}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" strokeWidth="2" />
        </svg>
        View Details
      </button>
    </div>
  )
}

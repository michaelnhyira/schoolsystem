import { School } from '../lib/types'

export default function SchoolCard({ school, memberCount, onClick }: {
  school: School
  memberCount?: number
  onClick: () => void
}) {
  const initials = school.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="school-card" onClick={onClick}>
      <div className="school-card-header">
        {school.logo_url ? (
          <img src={school.logo_url} alt={`${school.name} logo`} className="school-logo" />
        ) : (
          <div className="school-avatar">{initials}</div>
        )}
        <h3 className="school-card-name">{school.name}</h3>
      </div>
      <div className="school-card-body">
        <span className="school-member-count">
          {memberCount !== undefined ? memberCount : '—'} members
        </span>
      </div>
      <div className="school-card-footer">
        <span className="school-card-date">
          Created {new Date(school.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

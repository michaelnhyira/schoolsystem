interface StatsCardProps {
  icon: string
  label: string
  value: number | string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  color: string
}

export default function StatsCard({ icon, label, value, change, changeType = 'neutral', color }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div className="stats-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <span className="stats-label">{label}</span>
      </div>
      <div className="stats-card-body">
        <span className="stats-value">{value}</span>
        {change && (
          <span className={`stats-change ${changeType}`}>
            {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'} {change}
          </span>
        )}
      </div>
    </div>
  )
}

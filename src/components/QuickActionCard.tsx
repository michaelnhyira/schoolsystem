interface QuickActionCardProps {
  icon: string
  title: string
  description: string
  color: string
  onClick?: () => void
}

export default function QuickActionCard({ icon, title, description, color, onClick }: QuickActionCardProps) {
  return (
    <div className="quick-action-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="quick-action-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="quick-action-content">
        <h3 className="quick-action-title">{title}</h3>
        <p className="quick-action-description">{description}</p>
      </div>
      <span className="quick-action-arrow">→</span>
    </div>
  )
}

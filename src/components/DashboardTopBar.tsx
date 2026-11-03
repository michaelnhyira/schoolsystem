import { useState } from 'react'

interface DashboardTopBarProps {
  user: { email: string } | null
  onHamburgerClick?: () => void
}

const terms = [
  { id: '1', label: '2025 - 1st Term' },
  { id: '2', label: '2025 - 2nd Term' },
  { id: '3', label: '2025 - 3rd Term' },
]

export default function DashboardTopBar({ user, onHamburgerClick }: DashboardTopBarProps) {
  const [selectedTerm, setSelectedTerm] = useState('3')
  const [showTermDropdown, setShowTermDropdown] = useState(false)

  const currentTerm = terms.find((t) => t.id === selectedTerm)

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        {onHamburgerClick && (
          <button className="hamburger-btn" onClick={onHamburgerClick}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}
        <h1 className="topbar-title"><span className="desktop-title">Dashboard</span><span className="mobile-title">School Management</span></h1>
      </div>

      <div className="topbar-center">
        <div className="term-selector-wrap">
          <button
            className="term-selector"
            onClick={() => setShowTermDropdown(!showTermDropdown)}
          >
            <span className="term-label">{currentTerm?.label}</span>
            <span className="term-arrow">▾</span>
          </button>
          {showTermDropdown && (
            <div className="term-dropdown">
              {terms.map((term) => (
                <button
                  key={term.id}
                  className={`term-option ${selectedTerm === term.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTerm(term.id)
                    setShowTermDropdown(false)
                  }}
                >
                  {term.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn-add-term" title="Add new term">+</button>
      </div>

      <div className="topbar-right">
        <div className="user-info">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="user-email">{user?.email}</span>
        </div>
      </div>
    </header>
  )
}

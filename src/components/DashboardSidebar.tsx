import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/use-auth'
import { School, UserRole } from '../lib/types'

interface DashboardSidebarProps {
  school: School
  onToggleMobile?: () => void
  isMobileOpen?: boolean
}

const allMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'students', label: 'Students', icon: '🎓' },
  { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
  { id: 'classes', label: 'Classes', icon: '🏫' },
  { id: 'promotions', label: 'Promotions', icon: '⬆️' },
  { id: 'subjects', label: 'Subjects', icon: '📚' },
  { id: 'messaging', label: 'Messaging', icon: '💬' },
  { id: 'fees', label: 'Fees', icon: '💰' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

// Menu items visible per role
const roleMenuMap: Record<UserRole, string[]> = {
  super_admin: allMenuItems.map(item => item.id),
  owner: allMenuItems.map(item => item.id),
  accountant: ['dashboard', 'students', 'fees'],
  teacher: ['dashboard', 'classes', 'promotions'],
}

export default function DashboardSidebar({ school, onToggleMobile, isMobileOpen }: DashboardSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, role } = useAuth()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)

  // Filter menu items based on role
  const allowedMenuIds = roleMenuMap[role || 'teacher'] || ['dashboard']
  const menuItems = allMenuItems.filter(item => allowedMenuIds.includes(item.id))

  // Sync active menu with URL
  useEffect(() => {
    const pathParts = location.pathname.split('/')
    // /school/:id/students -> 'students'
    const page = pathParts[pathParts.length - 1]
    if (page && allMenuItems.some(item => item.id === page)) {
      setActiveMenu(page)
    } else if (pathParts.length <= 3) {
      // /school/:id -> 'dashboard'
      setActiveMenu('dashboard')
    }
  }, [location.pathname])

  const initials = school.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside className={`dashboard-sidebar-new ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        {school.logo_url ? (
          <img src={school.logo_url} alt="School logo" className="sidebar-logo" />
        ) : (
          <div className="sidebar-avatar">{initials}</div>
        )}
        <h2 className="sidebar-school-name">{school.name}</h2>
        {onToggleMobile && (
          <button className="sidebar-close-btn" onClick={onToggleMobile}>✕</button>
        )}
      </div>

      <div className="sidebar-dark-mode">
        <label className="dark-mode-toggle">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="dark-mode-label">Dark Mode</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu(item.id)
              if (item.id === 'dashboard') {
                navigate(`/school/${school.id}`)
              } else {
                navigate(`/school/${school.id}/${item.id}`)
              }
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-sign-out" onClick={handleSignOut}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

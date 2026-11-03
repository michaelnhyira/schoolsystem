import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/use-auth'
import { UserRole } from '../lib/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  // Super admin can access anything
  if (role === 'super_admin') {
    return <>{children}</>
  }

  // Role-based access control
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role || '')) {
      return <Navigate to="/no-access" replace />
    }
  }

  // Legacy: single required role check
  if (requiredRole) {
    if (role !== requiredRole) {
      return <Navigate to="/no-access" replace />
    }
  }

  return <>{children}</>
}

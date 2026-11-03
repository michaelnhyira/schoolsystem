import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/use-auth'

export default function NoAccess() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="no-access-page">
      <div className="no-access-content">
        <div className="no-access-icon">🔒</div>
        <h1>No Access</h1>
        <p>
          {user
            ? `You are logged in as ${user.email}, but you don't have access to any school yet.`
            : 'You need to be logged in to access this page.'}
        </p>
        <p className="no-access-hint">
          Contact your school administrator to be added as a member.
        </p>
        <div className="no-access-actions">
          <button className="btn-secondary" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

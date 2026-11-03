import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface AddUserModalProps {
  schoolId: string
  onClose: () => void
  onUserAdded: () => void
}

export default function AddUserModal({ schoolId, onClose, onUserAdded }: AddUserModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'owner' | 'teacher' | 'accountant'>('teacher')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter the user\'s email address.')
      return
    }

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const { error: insertError } = await supabase.rpc('add_school_member', {
        p_school_id: schoolId,
        p_email: email.trim(),
        p_role: role,
      })

      if (insertError) {
        if (insertError.message.includes('does not exist')) {
          setError('User not found. Please make sure the email is registered in the system.')
        } else {
          setError(insertError.message || 'Failed to add user.')
        }
        setLoading(false)
        return
      }

      onUserAdded()
    } catch {
      setError('Failed to add user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add User</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-section">
            <h4 className="section-title">User Details</h4>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g., user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as 'owner' | 'teacher' | 'accountant')}
                disabled={loading}
              >
                <option value="teacher">Teacher</option>
                <option value="accountant">Accountant</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

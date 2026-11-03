import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { SchoolMember } from '../lib/types'

interface EditUserRoleModalProps {
  member: SchoolMember
  onClose: () => void
  onSave: () => void
}

const validRoles = ['owner', 'teacher', 'accountant'] as const
type ValidRole = typeof validRoles[number]

export default function EditUserRoleModal({ member, onClose, onSave }: EditUserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<ValidRole>(member.role as ValidRole)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (selectedRole === member.role) {
      onClose()
      return
    }
    setLoading(true)
    try {
      await supabase
        .from('school_members')
        .update({ role: selectedRole })
        .eq('id', member.id)
      onSave()
      onClose()
    } catch (err) {
      console.error('Failed to change role:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const getRoleDescription = (role: ValidRole) => {
    switch (role) {
      case 'owner':
        return 'Full access to all school features including user management'
      case 'teacher':
        return 'Can access Dashboard, Classes, and Promotions only'
      case 'accountant':
        return 'Can access Dashboard, Students, and Fees only'
      default:
        return ''
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-role-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit User Role</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="edit-role-body">
          <div className="edit-role-user-info">
            <div className="edit-role-avatar">
              {member.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="edit-role-user-details">
              <div className="edit-role-email">{member.email || 'Unknown'}</div>
              <span className={`role-badge role-${member.role}`}>
                Current: {formatRole(member.role)}
              </span>
            </div>
          </div>

          <div className="edit-role-options">
            <label className="edit-role-label">Select new role:</label>
            <div className="role-option-list">
              {validRoles.map((role) => (
                <div
                  key={role}
                  className={`role-option-card ${selectedRole === role ? 'selected' : ''}`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="role-option-radio">
                    {selectedRole === role && <div className="role-option-radio-dot" />}
                  </div>
                  <div className="role-option-content">
                    <div className="role-option-title">{formatRole(role)}</div>
                    <div className="role-option-description">{getRoleDescription(role)}</div>
                  </div>
                  {member.role === role && (
                    <span className="role-current-badge">Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SchoolMember } from '../lib/types'

interface SchoolMembersPanelProps {
  schoolId: string
  members: SchoolMember[]
  onMemberChange: () => void
  isOwner: boolean
}

export default function SchoolMembersPanel({
  schoolId,
  members,
  onMemberChange,
  isOwner,
}: SchoolMembersPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'owner' | 'teacher' | 'accountant'>('teacher')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter the member\'s email address.')
      return
    }

    setLoading(true)
    try {
      // Add member via RPC function which looks up the user by email
      const { error: insertError } = await supabase.rpc('add_school_member', {
        p_school_id: schoolId,
        p_email: email.trim(),
        p_role: role,
      })

      if (insertError) {
        // Fallback: try direct insert if RPC doesn't exist yet
        if (insertError.message.includes('does not exist')) {
          setError('User not found. Please make sure the email is registered in the system.')
        } else {
          setError(insertError.message || 'Failed to add member.')
        }
        setLoading(false)
        return
      }

      setEmail('')
      setRole('teacher')
      setShowAddForm(false)
      onMemberChange()
    } catch {
      setError('Failed to add member. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await supabase.from('school_members').delete().eq('id', memberId)
      onMemberChange()
    } catch {
      console.error('Failed to remove member')
    }
  }

  const getMemberEmail = (member: SchoolMember) => {
    return member.email || 'Unknown'
  }

  return (
    <div className="members-panel">
      <div className="members-panel-header">
        <h3>Members</h3>
        {isOwner && (
          <button
            className="btn-add-member"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Member'}
          </button>
        )}
      </div>

      {isOwner && showAddForm && (
        <form className="add-member-form" onSubmit={handleAddMember} noValidate>
          {error && <div className="add-member-error" role="alert">{error}</div>}
          <input
            type="email"
            placeholder="Member's email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <select value={role} onChange={(e) => setRole(e.target.value as 'owner' | 'teacher' | 'accountant')}>
            <option value="teacher">Teacher</option>
            <option value="accountant">Accountant</option>
            <option value="owner">Owner</option>
          </select>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}

      <div className="members-list">
        {members.length === 0 ? (
          <p className="members-empty">No members yet.</p>
        ) : (
          members.map((member) => (
            <div key={member.id} className="member-item">
              <div className="member-info">
                <span className="member-email">{getMemberEmail(member)}</span>
                <span className={`member-role role-${member.role}`}>
                  {member.role}
                </span>
              </div>
              {isOwner && (
                <button
                  className="btn-remove-member"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

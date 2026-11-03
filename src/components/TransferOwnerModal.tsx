import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { SchoolMember } from '../lib/types'

interface TransferOwnerModalProps {
  schoolId: string
  schoolName: string
  members: SchoolMember[]
  onClose: () => void
  onSuccess: () => void
}

export default function TransferOwnerModal({
  schoolId,
  schoolName,
  members,
  onClose,
  onSuccess,
}: TransferOwnerModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Filter out current owners who aren't super admin (we can transfer to any member)
  const availableMembers = members.filter((m) => m.role !== 'owner')

  const getMemberEmail = (member: SchoolMember) => {
    return member.email || 'Unknown'
  }

  const handleTransfer = async () => {
    if (!selectedUserId) {
      setError('Please select a member to transfer ownership to.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Find the membership record for the selected user
      const { data: membership, error: memError } = await supabase
        .from('school_members')
        .select('id')
        .eq('school_id', schoolId)
        .eq('user_id', selectedUserId)
        .single()

      if (memError || !membership) {
        setError('Could not find the selected member.')
        setLoading(false)
        return
      }

      // Update their role to owner
      const { error: updateError } = await supabase
        .from('school_members')
        .update({ role: 'owner' })
        .eq('id', membership.id)

      if (updateError) {
        setError(updateError.message || 'Failed to transfer ownership.')
        setLoading(false)
        return
      }

      onSuccess()
      onClose()
    } catch {
      setError('Failed to transfer ownership. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Transfer Ownership</h2>
          <button className="modal-close" onClick={onClose} type="button">&times;</button>
        </div>

        <div className="modal-body">
          <p>
            Transfer ownership of <strong>{schoolName}</strong> to another member.
          </p>

          {error && <div className="modal-error" role="alert">{error}</div>}

          {availableMembers.length === 0 ? (
            <p className="modal-info">No available members to transfer ownership to.</p>
          ) : (
            <div className="transfer-member-list">
              {availableMembers.map((member) => (
                <label
                  key={member.id}
                  className={`transfer-member-item ${selectedUserId === member.user_id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="transferOwner"
                    value={member.user_id}
                    checked={selectedUserId === member.user_id}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                  <span className="transfer-member-email">{getMemberEmail(member)}</span>
                  <span className="transfer-member-role">{member.role}</span>
                </label>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleTransfer}
              disabled={loading || !selectedUserId || availableMembers.length === 0}
            >
              {loading ? 'Transferring...' : 'Transfer Ownership'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

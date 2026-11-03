import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { SchoolMember } from '../lib/types'
import AddUserModal from './AddUserModal'
import EditUserRoleModal from './EditUserRoleModal'

interface UserManagementTabProps {
  schoolId: string
  members: SchoolMember[]
  isOwner: boolean
  onMemberChange: () => void
}

const validRoles = ['owner', 'teacher', 'accountant'] as const
type ValidRole = typeof validRoles[number]

export default function UserManagementTab({ schoolId, members, isOwner, onMemberChange }: UserManagementTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | ValidRole>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<SchoolMember | null>(null)

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery === ''
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleRemoveMember = async (memberId: string) => {
    setLoadingMemberId(memberId)
    try {
      await supabase.from('school_members').delete().eq('id', memberId)
      onMemberChange()
    } catch (err) {
      console.error('Failed to remove member:', err)
    } finally {
      setLoadingMemberId(null)
    }
  }


  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <div className="user-management-tab">
      <div className="user-management-header">
        <div className="user-management-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="search-icon-small">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
          </svg>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-small"
          />
        </div>
        <div className="user-management-actions">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | ValidRole)}
            className="role-filter-select"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owners</option>
            <option value="teacher">Teachers</option>
            <option value="accountant">Accountants</option>
          </select>
          {isOwner && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
              </svg>
              Add User
            </button>
          )}
        </div>
      </div>

      <div className="user-list">
        {filteredMembers.length === 0 ? (
          <div className="user-list-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
              <circle cx="9" cy="7" r="4" strokeWidth="2" />
            </svg>
            <p>No users found</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`user-card${isOwner ? ' user-card-clickable' : ''}`}
              onClick={() => isOwner && setEditingMember(member)}
            >
              <div className="user-avatar">
                {member.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <div className="user-email">{member.email || 'Unknown'}</div>
                <span className={`role-badge role-${member.role}`}>
                  {formatRole(member.role)}
                </span>
              </div>
              <div className="user-actions">
                {isOwner && (
                  <button
                    className="btn-remove-user"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveMember(member.id)
                    }}
                    disabled={loadingMemberId === member.id}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3,6 5,6 21,6" strokeWidth="2" />
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" strokeWidth="2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddUserModal
          schoolId={schoolId}
          onClose={() => setShowAddModal(false)}
          onUserAdded={() => {
            setShowAddModal(false)
            onMemberChange()
          }}
        />
      )}

      {editingMember && (
        <EditUserRoleModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={() => {
            onMemberChange()
          }}
        />
      )}
    </div>
  )
}

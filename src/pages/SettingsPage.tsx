import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { School, SchoolMember, SUPER_ADMIN_EMAIL } from '../lib/types'
import { useAuth } from '../lib/use-auth'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopBar from '../components/DashboardTopBar'
import UserManagementTab from '../components/UserManagementTab'
import BackupExportTab from '../components/BackupExportTab'

type TabType = 'user-management' | 'backup-export'

export default function SettingsPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { user, role } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('user-management')
  const [school, setSchool] = useState<School | null>(null)
  const [members, setMembers] = useState<SchoolMember[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fetchSchool = async () => {
    if (!schoolId) return
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single()
    if (!error && data) {
      setSchool(data)
    }
  }

  const fetchMembers = async () => {
    if (!schoolId) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('school_members')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching members:', error)
        setMembers([])
      } else if (data) {
        setMembers(data)
      }
    } catch (err) {
      console.error('Error fetching members:', err)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([fetchSchool(), fetchMembers()]).catch(() => {/* ignored */})
  }, [schoolId])

  const isSuperAdmin = role === 'super_admin' || user?.email === SUPER_ADMIN_EMAIL
  const currentUserRole = members.find(m => m.user_id === user?.id)?.role || 'teacher'
  const isOwner = isSuperAdmin || currentUserRole === 'owner'

  if (loading || !school) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="school-dashboard-new">
      <DashboardSidebar
        school={school}
        onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileOpen={mobileMenuOpen}
      />
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}
      <div className="dashboard-main-area">
        <DashboardTopBar user={user} onHamburgerClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="dashboard-content-new">
          <div className="settings-header">
            <div>
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">Manage your school settings and data</p>
            </div>
          </div>

          <div className="settings-tabs">
            <button
              className={`tab-button ${activeTab === 'user-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('user-management')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
                <circle cx="9" cy="7" r="4" strokeWidth="2" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
              </svg>
              User Management
            </button>
            <button
              className={`tab-button ${activeTab === 'backup-export' ? 'active' : ''}`}
              onClick={() => setActiveTab('backup-export')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
                <polyline points="7,10 12,15 17,10" strokeWidth="2" />
                <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
              </svg>
              Backup & Export
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'user-management' && (
              <UserManagementTab
                schoolId={schoolId!}
                members={members}
                isOwner={isOwner}
                onMemberChange={fetchMembers}
              />
            )}
            {activeTab === 'backup-export' && (
              <BackupExportTab schoolId={schoolId!} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/use-auth'
import { supabase } from '../lib/supabase'
import { School, SchoolMember } from '../lib/types'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopBar from '../components/DashboardTopBar'
import StatsCard from '../components/StatsCard'
import QuickActionCard from '../components/QuickActionCard'
import SchoolMembersPanel from '../components/SchoolMembersPanel'
import TransferOwnerModal from '../components/TransferOwnerModal'

export default function SchoolDashboard() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { user, role, setCurrentSchool } = useAuth()
  const navigate = useNavigate()
  const [school, setSchool] = useState<School | null>(null)
  const [members, setMembers] = useState<SchoolMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isSuperAdmin = role === 'super_admin'
  const isOwner = members.some(
    (m) => m.user_id === user?.id && m.role === 'owner'
  )

  useEffect(() => {
    if (!schoolId) return

    const fetchSchool = async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single()

      if (error || !data) {
        console.error('Error fetching school:', error)
        setLoading(false)
        return
      }

      setSchool(data)
      setCurrentSchool(data)
    }

    const fetchMembers = async () => {
      if (!schoolId) return
      const { data, error } = await supabase
        .from('school_members')
        .select('id, school_id, user_id, email, role, created_at')
        .eq('school_id', schoolId)

      if (error) {
        console.error('Error fetching members:', error)
        return
      }

      if (data) {
        setMembers(data as SchoolMember[])
      }
    }

    Promise.all([fetchSchool(), fetchMembers()]).then(() => {
      setLoading(false)
    })
  }, [schoolId, setCurrentSchool])

  const handleMemberChange = async () => {
    if (!schoolId) return
    const { data } = await supabase
      .from('school_members')
      .select('id, school_id, user_id, email, role, created_at')
      .eq('school_id', schoolId)

    if (data) {
      setMembers(data as SchoolMember[])
    }
  }

  const handleBackToHub = () => {
    navigate('/super-admin')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="dashboard-error">
        <h2>School not found</h2>
        <p>You don't have access to this school or it doesn't exist.</p>
        {isSuperAdmin && (
          <button className="btn-primary" onClick={handleBackToHub}>
            Back to Hub
          </button>
        )}
        {!isSuperAdmin && (
          <button className="btn-primary" onClick={() => navigate('/no-access')}>
            Go to Dashboard
          </button>
        )}
      </div>
    )
  }

  const userName = user?.email?.split('@')[0] || 'User'

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

        <main className="dashboard-content-new">
          {isSuperAdmin && (
            <button className="btn-back-to-hub" onClick={handleBackToHub}>
              ← Back to Super Admin Hub
            </button>
          )}

          <div className="dashboard-welcome">
            <h1 className="welcome-title">Welcome back, {userName}!</h1>
            <p className="welcome-subtitle">
              Here's what's happening at <strong>{school.name}</strong> today.
            </p>
          </div>

          <div className="stats-grid">
            <StatsCard
              icon="🎓"
              label="Total Students"
              value={0}
              change="0% from last month"
              changeType="neutral"
              color="#dbeafe"
            />
            <StatsCard
              icon="👨‍🏫"
              label="Total Teachers"
              value={0}
              change="0% from last month"
              changeType="neutral"
              color="#dcfce7"
            />
            <StatsCard
              icon="🏫"
              label="Active Classes"
              value={0}
              change="0% from last month"
              changeType="neutral"
              color="#f3e8ff"
            />
            <StatsCard
              icon="👥"
              label="System Users"
              value={members.length}
              change={`${members.length} members`}
              changeType="neutral"
              color="#fef3c7"
            />
            <StatsCard
              icon="💰"
              label="Monthly Revenue"
              value="₵0.00"
              change="0% from last month"
              changeType="neutral"
              color="#fce7f3"
            />
            <StatsCard
              icon="⏳"
              label="Pending Payments"
              value={0}
              change="0% from last month"
              changeType="neutral"
              color="#fee2e2"
            />
          </div>

          <section className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <QuickActionCard
                icon="👥"
                title="Manage Users"
                description="Add or remove school members"
                color="#dbeafe"
                onClick={() => setShowSettings(!showSettings)}
              />
              <QuickActionCard
                icon="🎓"
                title="Add Student"
                description="Register a new student"
                color="#dcfce7"
              />
              <QuickActionCard
                icon="👨‍🏫"
                title="Add Teacher"
                description="Hire a new teacher"
                color="#f3e8ff"
              />
              <QuickActionCard
                icon="⚙️"
                title="System Settings"
                description="Configure school settings"
                color="#fef3c7"
                onClick={() => setShowSettings(!showSettings)}
              />
            </div>
          </section>

          {showSettings && (
            <section className="settings-section">
              <div className="settings-header">
                <h2 className="section-title">School Settings</h2>
                <button
                  className="btn-close-settings"
                  onClick={() => setShowSettings(false)}
                >
                  ✕
                </button>
              </div>

              <SchoolMembersPanel
                schoolId={schoolId!}
                members={members}
                onMemberChange={handleMemberChange}
                isOwner={isSuperAdmin || isOwner}
              />

              {isSuperAdmin && (
                <div className="dashboard-transfer-section">
                  <h3>Transfer Ownership</h3>
                  <p>Transfer school ownership to another member.</p>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowTransferModal(true)}
                  >
                    Transfer Ownership
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {showTransferModal && schoolId && (
        <TransferOwnerModal
          schoolId={schoolId}
          schoolName={school.name}
          members={members}
          onClose={() => setShowTransferModal(false)}
          onSuccess={handleMemberChange}
        />
      )}
    </div>
  )
}

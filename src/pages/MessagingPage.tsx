import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Message, SmsPoints } from '../lib/types'
import { useAuth } from '../lib/use-auth'
import DashboardSidebar from '../components/DashboardSidebar'
import DashboardTopBar from '../components/DashboardTopBar'
import ComposeMessageModal from '../components/ComposeMessageModal'

export default function MessagingPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { user, currentSchool } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [smsPoints, setSmsPoints] = useState<SmsPoints | null>(null)
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!schoolId) return
    fetchData().catch(() => {/* ignored */})
  }, [schoolId])

  const fetchData = async () => {
    if (!schoolId) return
    try {
      const { data: messageData } = await supabase
        .from('messages')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })

      const { data: smsData } = await supabase
        .from('sms_points')
        .select('*')
        .eq('school_id', schoolId)
        .single()

      if (messageData) setMessages(messageData as Message[])
      if (smsData) setSmsPoints(smsData as SmsPoints)
    } catch (err) {
      console.error('Error fetching messaging data:', err)
    }
  }

  // Stats
  const totalSent = messages.length
  const delivered = messages.filter((m) => m.status === 'delivered').length
  const failed = messages.filter((m) => m.status === 'failed').length
  const pointsRemaining = smsPoints?.points_remaining ?? 0

  if (!user || !currentSchool) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="school-dashboard-new">
      <DashboardSidebar
        school={currentSchool}
        onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileOpen={mobileMenuOpen}
      />
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}
      <div className="dashboard-main-area">
        <DashboardTopBar user={user} onHamburgerClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="dashboard-content-new">
          <div className="page-header">
            <div>
              <h1 className="page-title">Messaging</h1>
              <p className="page-subtitle">Send SMS and email messages to parents, students, and teachers</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="messaging-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#3b82f6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 2L11 13" strokeWidth="2" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Sent</span>
                <span className="stat-value">{totalSent}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#10b981' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Delivered</span>
                <span className="stat-value">{delivered}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#ef4444' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
                  <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Failed</span>
                <span className="stat-value">{failed}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#8b5cf6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v20M2 12h20" strokeWidth="2" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">SMS Points</span>
                <span className="stat-value">{pointsRemaining}</span>
              </div>
            </div>
          </div>

          {/* Messaging Center */}
          <div className="messaging-center-section">
            <h3 className="section-title">Messaging Center</h3>
            <div className="messaging-center-grid">
              <div className="message-center-card">
                <div className="message-center-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="1.5" />
                    <circle cx="9" cy="7" r="4" strokeWidth="1.5" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="1.5" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="1.5" />
                  </svg>
                </div>
                <h4 className="message-center-title">General Message to Parents</h4>
                <p className="message-center-description">
                  Send announcements, reminders, and updates to all parents in your school community.
                </p>
                <button
                  className="btn-compose"
                  onClick={() => setShowComposeModal(true)}
                  disabled={pointsRemaining <= 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 2L11 13" strokeWidth="2" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeWidth="2" />
                  </svg>
                  Compose & Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showComposeModal && schoolId && (
        <ComposeMessageModal
          schoolId={schoolId}
          onClose={() => setShowComposeModal(false)}
          onMessageSent={fetchData}
        />
      )}
    </div>
  )
}

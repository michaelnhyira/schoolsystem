import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ComposeMessageModalProps {
  schoolId: string
  onClose: () => void
  onMessageSent: () => void
}

export default function ComposeMessageModal({ schoolId, onClose, onMessageSent }: ComposeMessageModalProps) {
  const [recipientType, setRecipientType] = useState('parents')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const charCount = body.length
  const maxChars = 160

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!subject.trim()) {
      setError('Subject is required')
      return
    }

    if (!body.trim()) {
      setError('Message body is required')
      return
    }

    setLoading(true)
    try {
      // Insert the message
      const { error: messageError } = await supabase.from('messages').insert({
        school_id: schoolId,
        recipient_type: recipientType,
        subject: subject.trim(),
        body: body.trim(),
        status: 'sent',
        sent_at: new Date().toISOString(),
      })

      if (messageError) {
        console.error('Error sending message:', messageError)
        setError('Failed to send message. Please try again.')
        return
      }

      // Decrement SMS points
      const { data: smsData } = await supabase
        .from('sms_points')
        .select('points_remaining')
        .eq('school_id', schoolId)
        .single()

      if (smsData && (smsData as any).points_remaining > 0) {
        await supabase
          .from('sms_points')
          .update({
            points_remaining: (smsData as any).points_remaining - 1,
            updated_at: new Date().toISOString(),
          })
          .eq('school_id', schoolId)
      }

      setSubject('')
      setBody('')
      onMessageSent()
      onClose()
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Compose Message</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-section">
            <h4 className="section-title">Recipient</h4>
            <div className="form-group">
              <label className="form-label">Send to *</label>
              <select
                className="form-select"
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value)}
                disabled={loading}
              >
                <option value="parents">Parents</option>
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          <div className="modal-section">
            <h4 className="section-title">Message Details</h4>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., School closure notice"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message Body *</label>
              <textarea
                className="form-textarea"
                placeholder="Type your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={loading}
                rows={6}
              />
              <div className="char-counter">
                {charCount}/{maxChars} characters
              </div>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface AddSubjectModalProps {
  schoolId: string
  onClose: () => void
  onSubjectAdded: () => void
}

export default function AddSubjectModal({ schoolId, onClose, onSubjectAdded }: AddSubjectModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Subject name is required')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('subjects').insert({
        school_id: schoolId,
        name: name.trim(),
        is_active: true,
      })

      if (error) {
        console.error('Error adding subject:', error)
        setError('Failed to add subject. Please try again.')
        return
      }

      setName('')
      onSubjectAdded()
      onClose()
    } catch (err) {
      console.error('Error adding subject:', err)
      setError('Failed to add subject. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Subject</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-section">
            <h4 className="section-title">Subject Information</h4>
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface SetFeesModalProps {
  schoolId: string
  onClose: () => void
  onFeesSet: () => void
}

export default function SetFeesModal({ schoolId, onClose, onFeesSet }: SetFeesModalProps) {
  const [term, setTerm] = useState('2025 - 3rd Term')
  const [totalFees, setTotalFees] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!totalFees || parseFloat(totalFees) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      // Upsert fee settings for the school and term
      const { error: insertError } = await supabase
        .from('fee_settings')
        .upsert(
          {
            school_id: schoolId,
            term: term,
            total_fees: parseFloat(totalFees),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'school_id,term' }
        )

      if (insertError) {
        console.error('Error setting fees:', insertError)
        setError('Failed to set fees. Please try again.')
        return
      }

      onFeesSet()
      onClose()
    } catch (err) {
      console.error('Error setting fees:', err)
      setError('Failed to set fees. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Set Term Fees</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-section">
            <h4 className="section-title">Fee Configuration</h4>
            <div className="form-group">
              <label className="form-label">Term *</label>
              <select
                className="form-select"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                disabled={loading}
              >
                <option value="2025 - 1st Term">2025 - 1st Term</option>
                <option value="2025 - 2nd Term">2025 - 2nd Term</option>
                <option value="2025 - 3rd Term">2025 - 3rd Term</option>
                <option value="2026 - 1st Term">2026 - 1st Term</option>
                <option value="2026 - 2nd Term">2026 - 2nd Term</option>
                <option value="2026 - 3rd Term">2026 - 3rd Term</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Fees (₵) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 2500.00"
                value={totalFees}
                onChange={(e) => setTotalFees(e.target.value)}
                disabled={loading}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Set Fees'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

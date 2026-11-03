import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Student } from '../lib/types'

interface PayFeesModalProps {
  student: Student
  schoolId: string
  onClose: () => void
  onPaymentRecorded: () => void
}

export default function PayFeesModal({ student, schoolId, onClose, onPaymentRecorded }: PayFeesModalProps) {
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState('Tuition')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [transactionRef, setTransactionRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const { error: insertError } = await supabase.from('fee_payments').insert({
        school_id: schoolId,
        student_id: student.id,
        amount: parseFloat(amount),
        payment_type: paymentType,
        payment_method: paymentMethod,
        term: '2025 - 3rd Term',
        status: 'confirmed',
        transaction_ref: transactionRef || null,
        paid_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('Error recording payment:', insertError)
        setError('Failed to record payment. Please try again.')
        return
      }

      onPaymentRecorded()
      onClose()
    } catch (err) {
      console.error('Error recording payment:', err)
      setError('Failed to record payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Pay Fees</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-section">
            <h4 className="section-title">Student Information</h4>
            <div className="student-info-row">
              <span className="info-label">Student:</span>
              <span className="info-value">{student.full_name}</span>
            </div>
            <div className="student-info-row">
              <span className="info-label">Class:</span>
              <span className="info-value">{student.assigned_class || 'Unassigned'}</span>
            </div>
          </div>

          <div className="modal-section">
            <h4 className="section-title">Payment Details</h4>
            <div className="form-group">
              <label className="form-label">Amount (₵) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Type *</label>
              <select
                className="form-select"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                disabled={loading}
              >
                <option value="Tuition">Tuition</option>
                <option value="Transport">Transport</option>
                <option value="Meals">Meals</option>
                <option value="Uniform">Uniform</option>
                <option value="Books">Books</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={loading}
              >
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Transaction Reference</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., MM-123456789"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
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
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

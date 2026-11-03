import { Student } from '../lib/types'

interface FeeStudentCardProps {
  student: Student
  paymentStatus: 'no-payment' | 'partial-payment' | 'fully-paid'
  onPayFees: () => void
  onHistory: () => void
}

export default function FeeStudentCard({ student, paymentStatus, onPayFees, onHistory }: FeeStudentCardProps) {
  const statusBadge = () => {
    switch (paymentStatus) {
      case 'no-payment':
        return <span className="payment-badge no-payment">No Payment</span>
      case 'partial-payment':
        return <span className="payment-badge partial-payment">Partial Payment</span>
      case 'fully-paid':
        return <span className="payment-badge fully-paid">Fully Paid</span>
    }
  }

  return (
    <div className="fee-student-card">
      <div className="fee-student-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
          <circle cx="12" cy="7" r="4" strokeWidth="2" />
        </svg>
      </div>
      <div className="fee-student-info">
        <div className="fee-student-name">{student.full_name}</div>
        <div className="fee-student-class">{student.assigned_class || 'Unassigned'}</div>
      </div>
      <div className="fee-student-status">
        {statusBadge()}
      </div>
      <div className="fee-student-actions">
        <button className="btn-pay-fees" onClick={onPayFees}>
          Pay Fees
        </button>
        <button className="btn-history" onClick={onHistory}>
          History
        </button>
      </div>
    </div>
  )
}

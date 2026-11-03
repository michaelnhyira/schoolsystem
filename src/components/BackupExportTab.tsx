import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateCSV, downloadCSV } from '../lib/csv-utils'

interface BackupExportTabProps {
  schoolId: string
}

interface ExportCard {
  id: string
  title: string
  description: string
  icon: string
  count: number
  color: string
}

export default function BackupExportTab({ schoolId }: BackupExportTabProps) {
  const [exportCards, setExportCards] = useState<ExportCard[]>([
    { id: 'students', title: 'Students', description: 'Export all student records with personal and academic information', icon: 'students', count: 0, color: '#3b82f6' },
    { id: 'teachers', title: 'Teachers', description: 'Export all teacher records with contact and subject details', icon: 'teachers', count: 0, color: '#10b981' },
    { id: 'classes', title: 'Classes', description: 'Export all class records with assigned teachers and rooms', icon: 'classes', count: 0, color: '#8b5cf6' },
    { id: 'fees', title: 'Fees', description: 'Export all fee payment records and transaction history', icon: 'fees', count: 0, color: '#f59e0b' },
  ])
  const [loadingExport, setLoadingExport] = useState<string | null>(null)

  const fetchCounts = async () => {
    try {
      const [studentsRes, teachersRes, classesRes, feesRes] = await Promise.allSettled([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('fee_payments').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
      ])

      setExportCards(prev =>
        prev.map(card => {
          if (card.id === 'students') return { ...card, count: (studentsRes.status === 'fulfilled' && studentsRes.value.count) || 0 }
          if (card.id === 'teachers') return { ...card, count: (teachersRes.status === 'fulfilled' && teachersRes.value.count) || 0 }
          if (card.id === 'classes') return { ...card, count: (classesRes.status === 'fulfilled' && classesRes.value.count) || 0 }
          if (card.id === 'fees') return { ...card, count: (feesRes.status === 'fulfilled' && feesRes.value.count) || 0 }
          return card
        })
      )
    } catch (err) {
      console.error('Error fetching counts:', err)
    }
  }

  useEffect(() => {
    fetchCounts().catch(() => {/* ignored */})
  }, [schoolId])

  const handleExport = async (type: string) => {
    setLoadingExport(type)
    try {
      let data: any[] = []
      let headers: string[] = []
      let filename: string

      switch (type) {
        case 'students': {
          const { data: students } = await supabase
            .from('students')
            .select('full_name, date_of_birth, gender, assigned_class, house, parent_name, parent_contact, admission_number')
            .eq('school_id', schoolId)
          data = students || []
          headers = ['full_name', 'date_of_birth', 'gender', 'assigned_class', 'house', 'parent_name', 'parent_contact', 'admission_number']
          filename = `students_export_${new Date().toISOString().split('T')[0]}.csv`
          break
        }
        case 'teachers': {
          const { data: teachers } = await supabase
            .from('teachers')
            .select('full_name, email, phone, subjects, assigned_class, hire_date')
            .eq('school_id', schoolId)
          data = teachers || []
          headers = ['full_name', 'email', 'phone', 'subjects', 'assigned_class', 'hire_date']
          filename = `teachers_export_${new Date().toISOString().split('T')[0]}.csv`
          break
        }
        case 'classes': {
          const { data: classes } = await supabase
            .from('classes')
            .select('class_name, level, assigned_teacher, room, subjects')
            .eq('school_id', schoolId)
          data = classes || []
          headers = ['class_name', 'level', 'assigned_teacher', 'room', 'subjects']
          filename = `classes_export_${new Date().toISOString().split('T')[0]}.csv`
          break
        }
        case 'fees': {
          const { data: fees } = await supabase
            .from('fee_payments')
            .select('student_id, amount, payment_type, payment_method, term, status, transaction_ref, paid_at')
            .eq('school_id', schoolId)
          data = fees || []
          headers = ['student_id', 'amount', 'payment_type', 'payment_method', 'term', 'status', 'transaction_ref', 'paid_at']
          filename = `fees_export_${new Date().toISOString().split('T')[0]}.csv`
          break
        }
      }

      const csv = generateCSV(data, headers)
      downloadCSV(csv, filename)
    } catch (err) {
      console.error(`Error exporting ${type}:`, err)
    } finally {
      setLoadingExport(null)
    }
  }

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'students':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
            <circle cx="9" cy="7" r="4" strokeWidth="2" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
          </svg>
        )
      case 'teachers':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
            <circle cx="12" cy="7" r="4" strokeWidth="2" />
          </svg>
        )
      case 'classes':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeWidth="2" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeWidth="2" />
          </svg>
        )
      case 'fees':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="backup-export-tab">
      <div className="backup-export-header">
        <h3 className="backup-export-title">Backup & Export</h3>
        <p className="backup-export-description">Export your school data as CSV files for backup or analysis</p>
      </div>

      <div className="export-cards-grid">
        {exportCards.map((card) => (
          <div key={card.id} className="export-card">
            <div className="export-card-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              {getIcon(card.icon)}
            </div>
            <div className="export-card-content">
              <h4 className="export-card-title">{card.title}</h4>
              <p className="export-card-count">{card.count} records</p>
              <p className="export-card-description">{card.description}</p>
            </div>
            <button
              className="btn-export"
              onClick={() => handleExport(card.id)}
              disabled={loadingExport === card.id || card.count === 0}
            >
              {loadingExport === card.id ? (
                <>
                  <svg className="spinner-small" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
                    <polyline points="7,10 12,15 17,10" strokeWidth="2" />
                    <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
                  </svg>
                  Export
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

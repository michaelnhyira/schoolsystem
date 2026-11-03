import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Teacher } from '../lib/types'

interface AddClassModalProps {
  schoolId: string
  teachers: Teacher[]
  onClose: () => void
  onAdded: () => void
}

const PREDEFINED_SUBJECTS = [
  'RME',
  'Integrated Science',
  'French',
  'Maths',
  'Home Economics',
  'Environmental Studies',
  'Twi',
  'Pre-Technical Skills',
  'English',
  'Social Studies',
]

const GRADES_BY_LEVEL = {
  'early-childhood': ['Creche', 'Nursery 1', 'Nursery 2', 'Kindergarten 1', 'Kindergarten 2'],
  primary: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
  'junior-high': ['JHS 1', 'JHS 2', 'JHS 3'],
}

const SUBDIVISIONS = ['A', 'B', 'C', 'D']

export default function AddClassModal({ schoolId, teachers, onClose, onAdded }: AddClassModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Section 1: Class Information
  const [classTeacherId, setClassTeacherId] = useState('')
  const [maxStudents, setMaxStudents] = useState(30)

  // Section 2: Additional Information
  const [level, setLevel] = useState('')
  const [grade, setGrade] = useState('')
  const [room, setRoom] = useState('')
  const [subdivision, setSubdivision] = useState('')

  // Section 3: Subjects
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    )
  }

  // Auto-generate class name from grade + subdivision
  const generateClassName = () => {
    if (!grade) return ''
    return subdivision ? `${grade}${subdivision}` : grade
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!level) {
      setError('Level is required.')
      return
    }
    if (!grade) {
      setError('Grade is required.')
      return
    }
    if (selectedSubjects.length === 0) {
      setError('At least one subject must be selected.')
      return
    }

    const className = generateClassName()

    setLoading(true)
    try {
      const { error: insertError } = await supabase.from('classes').insert({
        school_id: schoolId,
        name: className,
        level: level,
        grade: grade,
        subdivision: subdivision || null,
        class_teacher_id: classTeacherId || null,
        max_students: maxStudents,
        room: room.trim() || null,
        assigned_subjects: selectedSubjects,
      })

      if (insertError) {
        console.error('Error adding class:', insertError)
        setError('Failed to add class. Please try again.')
        return
      }

      onAdded()
      onClose()
    } catch (err) {
      console.error('Error adding class:', err)
      setError('Failed to add class. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const availableGrades = level ? GRADES_BY_LEVEL[level as keyof typeof GRADES_BY_LEVEL] || [] : []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-class-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Class</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}

            {/* Section 1: Class Information */}
            <div className="form-section">
              <h3 className="section-title">Class Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Class Teacher</label>
                  <select
                    value={classTeacherId}
                    onChange={(e) => setClassTeacherId(e.target.value)}
                  >
                    <option value="">Select a teacher (optional)</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Class Number</label>
                  <input
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(parseInt(e.target.value) || 30)}
                    min={1}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Additional Information */}
            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Level *</label>
                  <select value={level} onChange={(e) => { setLevel(e.target.value); setGrade(''); setSubdivision(''); }}>
                    <option value="">Select level</option>
                    <option value="early-childhood">Early Childhood</option>
                    <option value="primary">Primary</option>
                    <option value="junior-high">Junior High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Grade *</label>
                  <select value={grade} onChange={(e) => setGrade(e.target.value)} disabled={!level}>
                    <option value="">Select grade</option>
                    {availableGrades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Room</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Room 101"
                  />
                </div>
                <div className="form-group">
                  <label>Subdivision</label>
                  <select value={subdivision} onChange={(e) => setSubdivision(e.target.value)}>
                    <option value="">No subdivision</option>
                    {SUBDIVISIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {grade && (
                  <div className="form-group full-width">
                    <label>Class Name (Auto-generated)</label>
                    <input type="text" value={generateClassName()} readOnly className="readonly-input" />
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Assigned Subjects */}
            <div className="form-section">
              <h3 className="section-title">Assigned Subject(s) *</h3>
              <div className="subjects-checkbox-grid">
                {PREDEFINED_SUBJECTS.map((subject) => (
                  <label key={subject} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => toggleSubject(subject)}
                    />
                    <span>{subject}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

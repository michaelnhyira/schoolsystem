import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Student } from '../lib/types'

interface EditStudentModalProps {
  student: Student
  schoolId: string
  onClose: () => void
  onSave: () => void
}

export default function EditStudentModal({ student, schoolId, onClose, onSave }: EditStudentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Personal Info
  const [fullName, setFullName] = useState(student.full_name)
  const [dateOfBirth, setDateOfBirth] = useState(student.date_of_birth || '')
  const [gender, setGender] = useState(student.gender || '')
  const [placeOfBirth, setPlaceOfBirth] = useState(student.place_of_birth || '')
  const [religion, setReligion] = useState(student.religion || '')
  const [address, setAddress] = useState(student.address || '')

  // Academic Info
  const [previousSchool, setPreviousSchool] = useState(student.previous_school || '')
  const [lastClassCompleted, setLastClassCompleted] = useState(student.last_class_completed || '')
  const [specialNeeds, setSpecialNeeds] = useState(student.special_needs || '')

  // Parent/Guardian Info
  const [parentName, setParentName] = useState(student.parent_name || '')
  const [parentRelationship, setParentRelationship] = useState(student.parent_relationship || '')
  const [parentOccupation, setParentOccupation] = useState(student.parent_occupation || '')
  const [parentContact, setParentContact] = useState(student.parent_contact || '')
  const [parentAddress, setParentAddress] = useState(student.parent_address || '')

  // School Use Only
  const [admissionNumber, setAdmissionNumber] = useState(student.admission_number || '')
  const [assignedClass, setAssignedClass] = useState(student.assigned_class || '')
  const [house, setHouse] = useState(student.house || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!fullName.trim()) {
      setError('Student name is required.')
      return
    }
    if (!parentName.trim()) {
      setError('Parent/Guardian name is required.')
      return
    }
    if (!parentContact.trim()) {
      setError('Parent/Guardian contact is required.')
      return
    }

    setLoading(true)
    try {
      const { error: supabaseError } = await supabase
        .from('students')
        .update({
          full_name: fullName.trim(),
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
          place_of_birth: placeOfBirth || null,
          religion: religion || null,
          address: address || null,
          previous_school: previousSchool || null,
          last_class_completed: lastClassCompleted || null,
          special_needs: specialNeeds || null,
          parent_name: parentName.trim(),
          parent_relationship: parentRelationship || null,
          parent_occupation: parentOccupation || null,
          parent_contact: parentContact.trim(),
          parent_address: parentAddress || null,
          admission_number: admissionNumber || null,
          assigned_class: assignedClass || null,
          house: house || null,
        })
        .eq('id', student.id)

      if (supabaseError) {
        setError(supabaseError.message || 'Failed to save student.')
        return
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Error saving student:', err)
      setError('Failed to save student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-student-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Student - {fullName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Place of Birth *</label>
                  <input
                    type="text"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
                <div className="form-group">
                  <label>Religion/Denomination *</label>
                  <select value={religion} onChange={(e) => setReligion(e.target.value)}>
                    <option value="">Select religion</option>
                    <option value="Christian">Christian</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Residential Address / Digital Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Home address"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="form-section">
              <h3 className="section-title">Academic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Previous School Attended</label>
                  <input
                    type="text"
                    value={previousSchool}
                    onChange={(e) => setPreviousSchool(e.target.value)}
                    placeholder="Previous school name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Class Completed</label>
                  <input
                    type="text"
                    value={lastClassCompleted}
                    onChange={(e) => setLastClassCompleted(e.target.value)}
                    placeholder="e.g., Class 5"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Special Educational Needs</label>
                  <textarea
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                    placeholder="Any special needs or requirements"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information Section */}
            <div className="form-section">
              <h3 className="section-title">Parent/Guardian Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Parent/Guardian Full Name *</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <label>Relationship to Student *</label>
                  <select value={parentRelationship} onChange={(e) => setParentRelationship(e.target.value)}>
                    <option value="">Select relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Parent/Guardian Occupation</label>
                  <input
                    type="text"
                    value={parentOccupation}
                    onChange={(e) => setParentOccupation(e.target.value)}
                    placeholder="Occupation"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number(s) *</label>
                  <input
                    type="text"
                    value={parentContact}
                    onChange={(e) => setParentContact(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Residential Address</label>
                  <input
                    type="text"
                    value={parentAddress}
                    onChange={(e) => setParentAddress(e.target.value)}
                    placeholder="Parent's address"
                  />
                </div>
              </div>
            </div>

            {/* Documentation Section */}
            <div className="form-section">
              <h3 className="section-title">Documentation</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Passport Photo</label>
                  <div className="photo-upload-area">
                    <div className="photo-upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <p>Click to upload photo</p>
                      <p className="upload-hint">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* School Use Only Section */}
            <div className="form-section">
              <h3 className="section-title">School Use Only</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Admission/Registration Number</label>
                  <input
                    type="text"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder="Auto-generated or manual"
                  />
                </div>
                <div className="form-group">
                  <label>Assigned Class</label>
                  <input
                    type="text"
                    value={assignedClass}
                    onChange={(e) => setAssignedClass(e.target.value)}
                    placeholder="e.g., Class 3A"
                  />
                </div>
                <div className="form-group">
                  <label>House</label>
                  <input
                    type="text"
                    value={house}
                    onChange={(e) => setHouse(e.target.value)}
                    placeholder="e.g., Red House"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface AddTeacherModalProps {
  schoolId: string
  onClose: () => void
  onAdded: () => void
}

const PREDEFINED_SUBJECTS = [
  'English',
  'Environmental Studies',
  'French',
  'Home Economics',
  'Integrated Science',
  'Maths',
  'Pre-Technical Skills',
  'RME',
  'Social Studies',
  'Twi',
]

export default function AddTeacherModal({ schoolId, onClose, onAdded }: AddTeacherModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Section 1: Personal Information
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [nationality, setNationality] = useState('Ghanaian')
  const [religion, setReligion] = useState('')
  const [address, setAddress] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email, setEmail] = useState('')

  // Section 2: Professional/Academic Information
  const [qualification, setQualification] = useState('')
  const [experience, setExperience] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [assignedClass, setAssignedClass] = useState('')

  // Section 3: Next of Kin Information
  const [nextOfKinName, setNextOfKinName] = useState('')
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState('')
  const [nextOfKinContact, setNextOfKinContact] = useState('')
  const [nextOfKinAddress, setNextOfKinAddress] = useState('')

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation for required fields
    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }
    if (!dateOfBirth) {
      setError('Date of Birth is required.')
      return
    }
    if (!gender) {
      setError('Gender is required.')
      return
    }
    if (!maritalStatus) {
      setError('Marital Status is required.')
      return
    }
    if (!nationality.trim()) {
      setError('Nationality is required.')
      return
    }
    if (!religion) {
      setError('Religion/Denomination is required.')
      return
    }
    if (!address.trim()) {
      setError('Residential/Digital Address is required.')
      return
    }
    if (!contactNumber.trim()) {
      setError('Contact Number is required.')
      return
    }
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!qualification.trim()) {
      setError('Highest Academic Qualification is required.')
      return
    }
    if (selectedSubjects.length === 0) {
      setError('At least one subject must be selected.')
      return
    }

    setLoading(true)
    try {
      const { error: insertError } = await supabase.from('teachers').insert({
        school_id: schoolId,
        // Personal Information
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth,
        gender: gender,
        marital_status: maritalStatus,
        nationality: nationality.trim(),
        religion: religion,
        address: address.trim(),
        phone: contactNumber.trim(),
        email: email.trim(),
        // Professional/Academic Information
        qualification: qualification.trim(),
        experience: experience.trim() || null,
        appointment_date: appointmentDate || null,
        assigned_subjects: selectedSubjects,
        assigned_class: assignedClass.trim() || null,
        hire_date: appointmentDate || new Date().toISOString().split('T')[0],
        subjects: selectedSubjects.join(', '),
        // Next of Kin Information
        next_of_kin_name: nextOfKinName.trim() || null,
        next_of_kin_relationship: nextOfKinRelationship.trim() || null,
        next_of_kin_contact: nextOfKinContact.trim() || null,
        next_of_kin_address: nextOfKinAddress.trim() || null,
      })

      if (insertError) {
        console.error('Error adding teacher:', insertError)
        setError('Failed to add teacher. Please try again.')
        return
      }

      onAdded()
      onClose()
    } catch (err) {
      console.error('Error adding teacher:', err)
      setError('Failed to add teacher. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-teacher-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Teacher</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
              <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Section 1: Personal Information */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mr. John Smith"
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
                  <label>Marital Status *</label>
                  <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nationality *</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. Ghanaian"
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
                  <label>Residential/Digital Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Home address"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number(s) *</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +233 20 123 4567"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@school.com"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional/Academic Information */}
            <div className="form-section">
              <h3 className="section-title">Professional/Academic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Highest Academic Qualification *</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. B.Ed in Mathematics"
                  />
                </div>
                <div className="form-group">
                  <label>Previous Teaching Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 5 years at ABC School"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Appointment/Employment</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Assigned Class</label>
                  <input
                    type="text"
                    value={assignedClass}
                    onChange={(e) => setAssignedClass(e.target.value)}
                    placeholder="e.g. Grade 5A"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Assigned Subject(s) *</label>
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
            </div>

            {/* Section 3: Parent/Next of Kin Information */}
            <div className="form-section">
              <h3 className="section-title">Parent/Next of Kin Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={nextOfKinName}
                    onChange={(e) => setNextOfKinName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <label>Relationship to Teacher</label>
                  <input
                    type="text"
                    value={nextOfKinRelationship}
                    onChange={(e) => setNextOfKinRelationship(e.target.value)}
                    placeholder="e.g. Spouse, Parent"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    value={nextOfKinContact}
                    onChange={(e) => setNextOfKinContact(e.target.value)}
                    placeholder="e.g. +233 20 987 6543"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    value={nextOfKinAddress}
                    onChange={(e) => setNextOfKinAddress(e.target.value)}
                    placeholder="Residential address"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Documentation */}
            <div className="form-section">
              <h3 className="section-title">Documentation</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Passport-sized Photo</label>
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
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

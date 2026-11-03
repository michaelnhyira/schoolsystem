import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/use-auth'

interface CreateSchoolModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateSchoolModal({ onClose, onSuccess }: CreateSchoolModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter a school name.')
      return
    }

    setLoading(true)
    try {
      // Insert the school and capture the returned ID
      const { data: schoolData, error: supabaseError } = await supabase
        .from('schools')
        .insert({
          name: name.trim(),
          logo_url: logoUrl.trim() || null,
          created_by: user?.id,
        })
        .select('id')
        .single()

      if (supabaseError) {
        setError(supabaseError.message || 'Failed to create school.')
        return
      }

      // Add the creator as the owner of the new school
      if (schoolData && user) {
        const { error: memberError } = await supabase.from('school_members').insert({
          school_id: schoolData.id,
          user_id: user.id,
          email: user.email,
          role: 'owner',
        })

        if (memberError) {
          setError(memberError.message || 'Failed to add you as school owner.')
          return
        }
      }

      onSuccess()
      onClose()
    } catch {
      setError('Failed to create school. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New School</h2>
          <button className="modal-close" onClick={onClose} type="button">&times;</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="modal-error" role="alert">{error}</div>}

          <label htmlFor="school-name">School Name</label>
          <input
            id="school-name"
            type="text"
            placeholder="Enter school name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <label htmlFor="school-logo">Logo URL (optional)</label>
          <input
            id="school-logo"
            type="url"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

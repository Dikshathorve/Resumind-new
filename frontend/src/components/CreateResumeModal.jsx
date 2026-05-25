import { useState } from 'react'
import { X } from 'lucide-react'
import './CreateResumeModal.css'

export default function CreateResumeModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [resumeTitle, setResumeTitle] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!resumeTitle.trim()) {
      setError('Please enter a resume title')
      return
    }

    setError('')
    onSubmit(resumeTitle.trim())
    setResumeTitle('')
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Resume</h2>
          <button className="modal-close-btn" onClick={onClose} title="Close modal" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-resume-form">
          <div className="form-group">
            <label htmlFor="resume-title">Resume Title</label>
            <input
              id="resume-title"
              type="text"
              placeholder="e.g., Software Engineer Resume, Full Stack Developer"
              value={resumeTitle}
              onChange={(e) => {
                setResumeTitle(e.target.value)
                setError('')
              }}
              autoComplete="off"
              disabled={isLoading}
              autoFocus
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-create"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Resume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

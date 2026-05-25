import { useState, useEffect } from 'react'
import './ProjectsPage.css'
import { Plus } from 'lucide-react'
import ResumeCard from '../components/ResumeCard'
import HeaderWithUser from '../components/HeaderWithUser'
import CreateResumeModal from '../components/CreateResumeModal'
import { useAuth } from '../context/AuthContext'

export default function ProjectsPage({ onStart, onClose, onEditResume }) {

  const [resumes, setResumes] = useState([])
  const [projectsCount, setProjectsCount] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)
  const { user, logout } = useAuth()

  // Fetch user's resumes on component mount
  useEffect(() => {
    fetchUserResumes()
  }, [])

  const fetchUserResumes = async () => {
    setIsFetching(true)
    setError(null)
    try {
      // Step 1: Fetch user's Projects document to get resume IDs
      const projectsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/user/projects`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!projectsResponse.ok) {
        throw new Error(`Failed to fetch projects: ${projectsResponse.status}`)
      }

      const projectsData = await projectsResponse.json()

      setProjectsCount(projectsData.projectsCount)

      // If no resumes, just set empty array
      if (!projectsData.projects || projectsData.projects.length === 0) {
        setResumes([])
        return
      }

      // Step 2: Fetch full resume details using batch endpoint
      const resumeIds = projectsData.projects.map(p => p._id || p)

      const batchResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/resumes/batch/fetch`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids: resumeIds })
        }
      )

      if (!batchResponse.ok) {
        throw new Error(`Failed to fetch resume details: ${batchResponse.status}`)
      }

      const batchData = await batchResponse.json()

      setResumes(batchData.resumes || [])
    } catch (err) {
      console.error('[Projects Page] Error fetching resumes:', err)
      setError(err.message)
    } finally {
      setIsFetching(false)
    }
  }

  const handleCreateNew = () => {
    setShowCreateModal(true)
  }

  const handleCreateResumeSubmit = async (resumeTitle) => {
    setIsCreating(true)
    try {
      onStart(resumeTitle)
      setShowCreateModal(false)
      // Refresh the resumes list after creation
      setTimeout(() => fetchUserResumes(), 500)
    } catch (error) {
      console.error('[Projects Page] Error creating resume:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditResume = (resumeId, resumeTitle) => {
    // Call parent handler to navigate to BuildResume with existing resume
    onEditResume?.(resumeId, resumeTitle)
  }

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiBaseUrl}/resumes/${resumeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete resume: ${response.status}`)
      }

      // Remove from UI immediately
      setResumes(resumes.filter(resume => resume._id !== resumeId))
      console.log('[Projects Page] Resume deleted successfully:', resumeId)
    } catch (error) {
      console.error('[Projects Page] Error deleting resume:', error)
      setError(`Failed to delete resume: ${error.message}`)
      // Refresh resumes on error to sync with server
      setTimeout(() => fetchUserResumes(), 1000)
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <div className="projects-page">
      <HeaderWithUser onLogout={handleLogout} userName={user?.fullName || 'User'} />
      <div className="projects-header">
        <button className="back-btn" onClick={onClose} title="Back to dashboard" aria-label="Back to dashboard">
          ← Back to Dashboard
        </button>
        <div className="header-content">
          <h1>My Resumes</h1>
          <p>Create or upload your resume and let AI enhance it</p>
        </div>
      </div>

      <div className="projects-container">
        <div className="action-cards">
          <div className="action-card create-card" onClick={handleCreateNew}>
            <div className="projects-card-icon create-icon">
              <Plus size={40} />
            </div>
            <h3>Create Resume</h3>
            <p>Start fresh with our AI-powered builder</p>
          </div>
        </div>

        <div className="resumes-grid">
          {isFetching ? (
            <div className="loading-state">
              <p>Loading your resumes...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Error loading resumes: {error}</p>
              <button 
                className="retry-btn"
                onClick={fetchUserResumes}
              >
                Retry
              </button>
            </div>
          ) : resumes.length === 0 ? (
            <div className="empty-state">
              <p>No resumes yet. Create one to get started!</p>
            </div>
          ) : (
            resumes.map((resume) => (
              <ResumeCard 
                key={resume._id} 
                resume={resume}
                onEdit={handleEditResume}
                onDelete={handleDeleteResume}
              />
            ))
          )}
        </div>
      </div>

      <CreateResumeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateResumeSubmit}
        isLoading={isCreating}
      />
    </div>
  )
}

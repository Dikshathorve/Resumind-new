import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Check } from 'lucide-react'
import './JobMatcher.css'
import HeaderWithUser from '../components/HeaderWithUser'
import ResumeTemplate1 from '../components/ResumeTemplate1'
import ResumeTemplate_Minimal from '../components/ResumeTemplate_Minimal'
import ResumeTemplate3 from '../components/resumetemplate3'
import JDInput from '../components/JDInput'
import SuggestionsList from '../components/SuggestionsList'

export default function JobMatcher({ onClose, resumeData, resumeId = null }) {
  // Resume data state
  const [currentResumeData, setCurrentResumeData] = useState(resumeData || {
    personal: {},
    summary: '',
    experiences: [],
    education: [],
    projects: [],
    skills: [],
    certifications: []
  })

  // Job Matcher specific state
  const [jd, setJd] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [accentColor, setAccentColor] = useState('#3B82F6')
  const [selectedTemplate, setSelectedTemplate] = useState('template1')
  const [profileImage, setProfileImage] = useState(null)
  const [saveStatus, setSaveStatus] = useState(null)
  const templateRef = useRef(null)

  // Load resume data from database on component mount
  useEffect(() => {
    if (resumeId) {
      const loadResumeData = async () => {
        try {
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
          const response = await fetch(`${apiBaseUrl}/resumes/${resumeId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.resume) {
              const resume = data.resume
              setCurrentResumeData({
                personal: resume.personal || {},
                summary: resume.summary || '',
                experiences: resume.experiences || [],
                education: resume.education || [],
                projects: resume.projects || [],
                skills: resume.skills || [],
                certifications: resume.certifications || []
              })
              setSelectedTemplate(resume.templateType || 'template1')
              setAccentColor(resume.accentColor || '#3B82F6')
              if (resume.profileImage) {
                setProfileImage(resume.profileImage)
              }
            }
          }
        } catch (error) {
          console.error('Error loading resume data:', error)
        }
      }
      loadResumeData()
    }
  }, [resumeId])

  // Handle JD submission with AI analysis
  const handleJDSubmit = async (jobDescription) => {
    setJd(jobDescription)
    setLoading(true)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      if (!jobDescription || !jobDescription.trim()) {
        alert('Please paste a valid job description before analyzing.')
        setLoading(false)
        return
      }

      const hasResumeContent =
        !!currentResumeData.summary ||
        (currentResumeData.experiences && currentResumeData.experiences.length > 0) ||
        (currentResumeData.skills && currentResumeData.skills.length > 0) ||
        (currentResumeData.projects && currentResumeData.projects.length > 0)

      if (!hasResumeContent && !resumeId) {
        alert('Please create or load a resume before running job matcher analysis.')
        setLoading(false)
        return
      }

      const response = await fetch(`${apiBaseUrl}/analysis/job-matcher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          resumeId,
          jobDescription,
          summary: currentResumeData.summary || '',
          experiences: currentResumeData.experiences || [],
          skills: currentResumeData.skills || [],
          projects: currentResumeData.projects || []
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Job matcher API error:', error)
        alert(`Error analyzing job match: ${error.message || 'Please try again.'}`)
        setLoading(false)
        return
      }

      const data = await response.json()
      
      // Convert AI analysis to suggestions format
      const aiSuggestions = convertAIAnalysisToSuggestions(
        data.analysis,
        currentResumeData
      )
      
      setSuggestions(aiSuggestions)
    } catch (error) {
      console.error('Job matcher error:', error)
      alert('Failed to analyze job match: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Convert AI analysis results to suggestions format for UI
  const convertAIAnalysisToSuggestions = (analysis, resumeData) => {
    const suggestions = []
    let id = 1

    // Summary suggestion
    if (analysis.detailedAnalysis?.summary) {
      const summaryAnalysis = analysis.detailedAnalysis.summary
      suggestions.push({
        id: id++,
        section: 'Professional Summary',
        score: summaryAnalysis.matchScore || 0,
        originalText: resumeData.summary || 'No summary provided',
        suggestedText: summaryAnalysis.suggestion || '',
        improvement: summaryAnalysis.matchScore || 0,
        applied: false,
        details: {
          keywords: summaryAnalysis.jdKeywords || [],
          missingKeywords: summaryAnalysis.missingKeywords || [],
          improvements: summaryAnalysis.keyImprovements || []
        }
      })
    }

    // Experiences suggestions
    if (analysis.detailedAnalysis?.experiences?.experiences) {
      analysis.detailedAnalysis.experiences.experiences.forEach((exp, idx) => {
        suggestions.push({
          id: id++,
          section: `Professional Experience (${idx + 1})`,
          score: exp.relevanceScore || 0,
          originalText: exp.original || '',
          suggestedText: exp.suggestion || '',
          improvement: exp.relevanceScore || 0,
          applied: false,
          details: {
            matchedSkills: exp.matchedSkills || [],
            improvements: [exp.improvementNotes].filter(Boolean)
          }
        })
      })
    }

    // Skills suggestion
    if (analysis.detailedAnalysis?.skills) {
      const skillsAnalysis = analysis.detailedAnalysis.skills
      suggestions.push({
        id: id++,
        section: 'Skills',
        score: skillsAnalysis.matchPercentage || 0,
        originalText: (resumeData.skills || []).join(', ') || 'No skills provided',
        suggestedText: (skillsAnalysis.recommendedOrder || []).slice(0, 10).join(', '),
        improvement: skillsAnalysis.matchPercentage || 0,
        applied: false,
        details: {
          matched: skillsAnalysis.matchedSkills || [],
          missing: skillsAnalysis.missingButLearnable || [],
          improvements: ['Reorder skills to prioritize JD-relevant ones first']
        }
      })
    }

    // Projects suggestions
    if (analysis.detailedAnalysis?.projects?.projectAnalysis) {
      analysis.detailedAnalysis.projects.projectAnalysis.forEach((proj, idx) => {
        suggestions.push({
          id: id++,
          section: `Project (${idx + 1})`,
          score: proj.relevanceScore || 0,
          originalText: proj.original || '',
          suggestedText: proj.suggestion || '',
          improvement: proj.relevanceScore || 0,
          applied: false,
          details: {
            matchedTech: proj.matchedTech || [],
            improvements: [proj.relevantDemonstration].filter(Boolean)
          }
        })
      })
    }

    return suggestions
  }

  // Mock suggestion generation - kept for backward compatibility
  const generateSuggestions = (resume, jobDescription) => {
    // This is a placeholder that generates mock suggestions
    // In real implementation, this would call backend API
    const mockSuggestions = [
      {
        id: 1,
        section: 'Professional Summary',
        originalText: resume.summary || 'No summary provided',
        suggestedText: 'Experienced professional with proven track record in delivering high-impact solutions aligned with your job requirements.',
        improvement: 23,
        applied: false
      },
      {
        id: 2,
        section: 'Skills',
        originalText: resume.skills?.join(', ') || 'No skills provided',
        suggestedText: 'JavaScript, React, Node.js, SQL, Cloud Computing, Team Leadership',
        improvement: 18,
        applied: false
      },
      {
        id: 3,
        section: 'Professional Experience',
        originalText: 'Current work experience',
        suggestedText: 'Enhanced description emphasizing relevant achievements and metrics',
        improvement: 31,
        applied: false
      }
    ]
    return mockSuggestions
  }

  // Apply a suggestion to the resume and save to database
  const handleApplySuggestion = async (suggestionId, updatedData) => {
    setCurrentResumeData(updatedData)
    setSuggestions(suggestions.map(s => 
      s.id === suggestionId ? { ...s, applied: true } : s
    ))

    // Auto-save changes to database
    if (resumeId) {
      try {
        setSaveStatus('saving')
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        
        // First, fetch the latest resume from DB to ensure we don't lose any fields
        const getResponse = await fetch(`${apiBaseUrl}/resumes/${resumeId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!getResponse.ok) {
          throw new Error('Failed to fetch latest resume data')
        }

        const latestData = await getResponse.json()
        const latestResume = latestData.resume || {}

        // Merge: keep all existing fields from DB, override with updated data
        const mergedData = {
          personal: updatedData.personal || latestResume.personal || {},
          summary: updatedData.summary || latestResume.summary || '',
          experiences: updatedData.experiences && updatedData.experiences.length > 0 
            ? updatedData.experiences 
            : (latestResume.experiences || []),
          education: updatedData.education && updatedData.education.length > 0 
            ? updatedData.education 
            : (latestResume.education || []),
          projects: updatedData.projects && updatedData.projects.length > 0 
            ? updatedData.projects 
            : (latestResume.projects || []),
          skills: updatedData.skills && updatedData.skills.length > 0 
            ? updatedData.skills 
            : (latestResume.skills || []),
          certifications: updatedData.certifications && updatedData.certifications.length > 0 
            ? updatedData.certifications 
            : (latestResume.certifications || []),
          templateType: latestResume.templateType,
          accentColor: latestResume.accentColor,
          profileImage: latestResume.profileImage
        }
        
        const response = await fetch(`${apiBaseUrl}/resumes/${resumeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(mergedData)
        })

        if (!response.ok) {
          throw new Error(`Failed to save changes: ${response.status}`)
        }

        setSaveStatus('saved')
        setTimeout(() => setSaveStatus(null), 2000)
        console.log('✅ Changes saved to database')
      } catch (error) {
        console.error('Failed to save changes:', error)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    }
  }

  return (
    <div className="job-matcher-page">
      <HeaderWithUser 
        onLogout={onClose} 
        userName="User"
        navActions={<></>}
      />

      <div className="job-matcher-content">
        <div className="job-matcher-header">
          <button className="back-button" onClick={onClose} title="Go back" aria-label="Back button">
            <ChevronLeft size={20} />
            Back
          </button>
          <h1>Job Matcher</h1>
          {saveStatus && (
            <div className={`save-indicator ${saveStatus}`}>
              {saveStatus === 'saving' && <span>💾 Saving...</span>}
              {saveStatus === 'saved' && <span><Check size={16} /> Saved</span>}
              {saveStatus === 'error' && <span>❌ Failed to save</span>}
            </div>
          )}
        </div>

        <div className="job-matcher-inner">
          {/* Left Panel - Controls & Suggestions */}
          <div className="matcher-left">
            {/* JD Input */}
            <JDInput 
              onSubmit={handleJDSubmit}
              loading={loading}
            />

            {/* Suggestions List */}
            <SuggestionsList 
              suggestions={suggestions}
              loading={loading}
              onApplySuggestion={handleApplySuggestion}
              resumeData={currentResumeData}
            />
          </div>

          {/* Right Panel - Resume Preview */}
          <div className="matcher-right">
            <div className="resume-preview-container" ref={templateRef}>
              {selectedTemplate === 'template2' && (
                <ResumeTemplate_Minimal
                  personal={currentResumeData.personal}
                  summary={currentResumeData.summary}
                  experiences={currentResumeData.experiences}
                  education={currentResumeData.education}
                  projects={currentResumeData.projects}
                  skills={currentResumeData.skills}
                  certifications={currentResumeData.certifications}
                  accentColor={accentColor}
                  profileImage={profileImage}
                />
              )}
              {selectedTemplate === 'template1' && (
                <ResumeTemplate1
                  personal={currentResumeData.personal}
                  summary={currentResumeData.summary}
                  experiences={currentResumeData.experiences}
                  education={currentResumeData.education}
                  projects={currentResumeData.projects}
                  skills={currentResumeData.skills}
                  certifications={currentResumeData.certifications}
                  accentColor={accentColor}
                />
              )}
              {selectedTemplate === 'template3' && (
                <ResumeTemplate3
                  personal={currentResumeData.personal}
                  summary={currentResumeData.summary}
                  experiences={currentResumeData.experiences}
                  education={currentResumeData.education}
                  projects={currentResumeData.projects}
                  skills={currentResumeData.skills}
                  certifications={currentResumeData.certifications}
                  accentColor={accentColor}
                  profileImage={profileImage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

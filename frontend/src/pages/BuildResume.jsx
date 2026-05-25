import { useEffect, useRef, useState } from 'react'
import { Briefcase, FileText, Sparkles, Download, Mail, Phone, MapPin, FileText as FileDocument, Briefcase as WorkBriefcase, GraduationCap, Settings, Award, User, Briefcase as BriefcaseIcon, Globe, Linkedin, Save } from 'lucide-react'
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min'
import './BuildResume.css'
import AISuggestions from '../components/AISuggestions'
import HeaderWithUser from '../components/HeaderWithUser'
import ResumeTemplate_Minimal from '../components/ResumeTemplate_Minimal'
import ResumeTemplate1 from '../components/ResumeTemplate1'
import ResumeTemplate3 from '../components/resumetemplate3'
import AccentColorPicker from '../components/AccentColorPicker'
import TemplateSelector from '../components/TemplateSelector'

// Helper function to convert ISO date to yyyy-MM format for month input
const convertToMonthFormat = (dateString) => {
  if (!dateString) return ''
  
  // If it's already in yyyy-MM format, return it
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // If it's ISO format (2025-03-01T00:00:00.000Z), extract yyyy-MM
  if (dateString.includes('T')) {
    return dateString.substring(0, 7)
  }
  
  return ''
}

// Helper function to convert yyyy-MM format to ISO format for storage
const convertFromMonthFormat = (monthString) => {
  if (!monthString) return ''
  
  // Convert yyyy-MM to ISO date format
  return `${monthString}-01T00:00:00.000Z`
}

export default function BuildResume({ onClose, onATSAnalyzer, onJobMatcher, resumeId = null }) {
  // Step management for step-wise form
  const [currentStep, setCurrentStep] = useState(1)
  const steps = [
    { id: 1, label: 'Personal Information' },
    { id: 2, label: 'Professional Summary' },
    { id: 3, label: 'Experience' },
    { id: 4, label: 'Education' },
    { id: 5, label: 'Projects' },
    { id: 6, label: 'Skills' },
    { id: 7, label: 'Certifications' }
  ]

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [saveError, setSaveError] = useState(null)

  // form state for live preview
  const [personal, setPersonal] = useState({
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: ''
  })

  const [summary, setSummary] = useState('')

  const [experiences, setExperiences] = useState([])

  const [education, setEducation] = useState([])

  const [projects, setProjects] = useState([])

  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')

  const [certifications, setCertifications] = useState([])

  // Profile image state for Minimal Image template
  const [profileImage, setProfileImage] = useState(null)
  const [aiFieldType, setAiFieldType] = useState('')
  const [aiFieldValue, setAiFieldValue] = useState('')
  const [aiFieldIndex, setAiFieldIndex] = useState(null)
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)

  // Accent color state
  const [accentColor, setAccentColor] = useState('#3B82F6')
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const accentButtonRef = useRef(null)
  const templateRef = useRef(null)

  // Template selector state
  const [selectedTemplate, setSelectedTemplate] = useState('template1')
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false)
  const templateButtonRef = useRef(null)

  // AI Assist modal state
  const [aiAssistOpen, setAiAssistOpen] = useState(false)

  // User state
  const [user, setUser] = useState(null)

  // Load user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const response = await fetch(`${apiBaseUrl}/user/profile`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user || {})
        }
      } catch (error) {
        console.error('[BuildResume] Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  // Load existing resume data if editing
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

          if (!response.ok) {
            throw new Error(`Failed to load resume: ${response.status}`)
          }

          const data = await response.json()
          
          // Populate form fields with existing data
          if (data.resume) {
            const resume = data.resume
            setPersonal(resume.personal || personal)
            setSummary(resume.summary || '')
            setExperiences(resume.experiences || [])
            setEducation(resume.education || [])
            setProjects(resume.projects || [])
            setSkills(resume.skills || [])
            setCertifications(resume.certifications || [])
            setSelectedTemplate(resume.templateType || 'template1')
            setAccentColor(resume.accentColor || '#3B82F6')
            if (resume.profileImage) {
              setProfileImage(resume.profileImage)
            }
          }
        } catch (error) {
          console.error('[BuildResume] Error loading resume:', error)
          alert(`Failed to load resume: ${error.message}`)
        }
      }
      loadResumeData()
    }
  }, [resumeId])

  // Enhanced PDF download handler - captures exact visual representation
  const handleDownload = async () => {
    if (!templateRef.current) {
      console.error('[Download] Template reference not found')
      alert('Error: Could not find resume to download')
      return
    }

    try {
      const element = templateRef.current
      const filename = `${personal.fullName || 'Resume'}_${new Date().toISOString().split('T')[0]}.pdf`

      // HTML2PDF options for exact visual preservation
      const options = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: {
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      }

      // Generate PDF from the template
      await html2pdf().set(options).from(element).save()

      console.log('[Download] PDF generated successfully:', filename)
    } catch (error) {
      console.error('[Download] Error generating PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  // Save handler for saving resume to database
  const handleSaveChanges = async () => {
    if (!resumeId) {
      console.error('[Save Resume] Resume ID is null or undefined')
      setSaveError('Resume ID not found. Please create a new resume first.')
      return
    }

    setIsSaving(true)
    setSaveError(null)
    setSaveMessage(null)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const resumeData = {
        personal,
        summary,
        experiences,
        education,
        projects,
        skills,
        certifications,
        templateType: selectedTemplate,
        accentColor,
        profileImage: selectedTemplate === 'template3' ? profileImage : null
      }

      const response = await fetch(`${apiBaseUrl}/resumes/${resumeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(resumeData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Save Resume] Error response:', errorText)
        throw new Error(`Failed to save resume: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setSaveMessage('Resume saved successfully!')
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    } catch (error) {
      console.error('[Save Resume] Error caught:', error)
      console.error('[Save Resume] Error message:', error.message)
      console.error('[Save Resume] Error stack:', error.stack)
      setSaveError(error.message || 'Failed to save resume')
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSaveError(null)
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  // Render template based on selection
  const renderTemplate = () => {
    const templateProps = {
      personal,
      summary,
      experiences,
      education,
      projects,
      skills,
      certifications,
      accentColor,
      profileImage: selectedTemplate === 'template3' ? profileImage : null
    }

    switch (selectedTemplate) {
      case 'template2':
        return <ResumeTemplate_Minimal {...templateProps} />
      case 'template1':
        return <ResumeTemplate1 {...templateProps} />
      case 'template3':
        return <ResumeTemplate3 {...templateProps} />
      default:
        return <ResumeTemplate1 {...templateProps} />
    }
  }

  // Handle image upload for Minimal Image template
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Step navigation handlers
  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Render different step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <section className="panel">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>
                <User size={18} />
                Full Name <span className="required">*</span>
              </label>
              <input placeholder="Enter your full name" value={personal.fullName} onChange={e => setPersonal({...personal, fullName: e.target.value})} />
            </div>

            <div className="form-group">
              <label>
                <BriefcaseIcon size={18} />
                Profession <span className="required">*</span>
              </label>
              <div className="input-with-ai">
                <input placeholder="Enter your profession" value={personal.jobTitle} onChange={e => {
                  setPersonal({...personal, jobTitle: e.target.value})
                  setAiFieldType('jobTitle')
                  setAiFieldValue(e.target.value)
                }} />
                <button 
                  className="ai-assist-btn-inline"
                  onClick={() => {
                      setAiFieldType('jobTitle')
                      setAiFieldValue(personal.jobTitle)
                      setAiSidebarOpen(true)
                  }}
                  title="Get AI suggestions"
                >
                  <Sparkles size={36} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>
                <Mail size={18} />
                Email Address <span className="required">*</span>
              </label>
              <input placeholder="Enter your email address" type="email" value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} autoComplete="email" />
            </div>

            <div className="form-group">
              <label>
                <Phone size={18} />
                Phone Number
              </label>
              <input placeholder="Enter your phone number" value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} />
            </div>

            <div className="form-group">
              <label>
                <MapPin size={18} />
                Location
              </label>
              <input placeholder="Enter your location" value={personal.location} onChange={e => setPersonal({...personal, location: e.target.value})} />
            </div>

            <div className="form-group">
              <label>
                <Linkedin size={18} />
                LinkedIn URL
              </label>
              <input placeholder="Enter your LinkedIn profile URL" value={personal.linkedin} onChange={e => setPersonal({...personal, linkedin: e.target.value})} />
            </div>

            <div className="form-group">
              <label>
                <Globe size={18} />
                Website
              </label>
              <input placeholder="Enter your website URL" value={personal.website} onChange={e => setPersonal({...personal, website: e.target.value})} />
            </div>

            {selectedTemplate === 'template3' && (
              <div className="form-group">
                <label>
                  📷 Profile Photo
                  <span className="template-specific">(Minimal Image Template)</span>
                </label>
                <div className="image-upload-section">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    id="profile-image-input"
                    className="image-input-hidden"
                  />
                  <label htmlFor="profile-image-input" className="image-upload-label">
                    {profileImage ? '📸 Change Photo' : '📸 Upload Photo'}
                  </label>
                  {profileImage && (
                    <div className="image-preview">
                      <img src={profileImage} alt="Profile" />
                      <button 
                        type="button"
                        onClick={() => setProfileImage(null)}
                        className="remove-image-btn"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )
      case 2:
        return (
          <section className="panel">
            <div className="summary-header">
              <div>
                <h3>Professional Summary</h3>
                <p className="summary-subtitle">Add summary for your resume here</p>
              </div>
              <button 
                className="ai-enhance-btn"
                onClick={() => {
                  setAiFieldType('description')
                  setAiFieldValue(summary)
                  setAiSidebarOpen(true)
                }}
                title="Get AI suggestions"
              >
                <Sparkles size={16} /> AI Enhance
              </button>
            </div>
            <textarea placeholder="Write a compelling professional summary that highlights your key strengths and career objectives..." rows={10} value={summary} onChange={e => {
              setSummary(e.target.value)
              setAiFieldType('description')
              setAiFieldValue(e.target.value)
            }} />
            <p className="form-tip">Tip: Keep it concise (3-4 sentences) and focus on your most relevant achievements and skills.</p>
          </section>
        )
      case 3:
        return (
          <section className="panel">
            <div className="section-header">
              <div>
                <h3>Professional Experience</h3>
                <p className="section-subtitle">Add your job experience</p>
              </div>
              <button 
                className="add-btn"
                onClick={() => {
                  const newExp = { company: '', jobTitle: '', description: '', startDate: '', endDate: '', currentlyWorking: false, location: '' }
                  setExperiences([...experiences, newExp])
                }}
              >
                + Add Experience
              </button>
            </div>
            {experiences.length === 0 ? (
              <div className="empty-state-message">
                <Briefcase size={48} className="empty-icon" />
                <p className="empty-title">No work experience added yet.</p>
                <p className="empty-desc">Click "Add Experience" to get started.</p>
              </div>
            ) : (
              experiences.map((exp, idx) => (
                <div className="exp-item" key={idx}>
                  <div className="exp-header">
                    <h4>Experience #{idx + 1}</h4>
                    <button 
                      className="delete-btn"
                      onClick={() => {
                        const copy = experiences.filter((_, i) => i !== idx)
                        setExperiences(copy)
                      }}
                      title="Delete experience"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="exp-row-two-cols">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input 
                        type="text"
                        placeholder="e.g., Google, Microsoft" 
                        value={exp.company || ''} 
                        onChange={e => {
                          const copy = [...experiences]
                          copy[idx].company = e.target.value
                          setExperiences(copy)
                        }}
                        autoComplete="organization"
                      />
                    </div>
                    <div className="form-group">
                      <label>Job Title</label>
                      <input 
                        type="text"
                        placeholder="e.g., Senior Developer" 
                        value={exp.jobTitle || ''} 
                        onChange={e => {
                          const copy = [...experiences]
                          copy[idx].jobTitle = e.target.value
                          setExperiences(copy)
                        }}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="exp-row-two-cols">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input 
                        type="month"
                        value={convertToMonthFormat(exp.startDate) || ''} 
                        onChange={e => {
                          const copy = [...experiences]
                          copy[idx].startDate = convertFromMonthFormat(e.target.value)
                          setExperiences(copy)
                        }} 
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input 
                        type="month"
                        value={convertToMonthFormat(exp.endDate) || ''} 
                        onChange={e => {
                          const copy = [...experiences]
                          copy[idx].endDate = convertFromMonthFormat(e.target.value)
                          setExperiences(copy)
                        }} 
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <input 
                      type="checkbox"
                      id={`currently-working-${idx}`}
                      checked={exp.currentlyWorking || false}
                      onChange={e => {
                        const copy = [...experiences]
                        copy[idx].currentlyWorking = e.target.checked
                        setExperiences(copy)
                      }}
                    />
                    <label htmlFor={`currently-working-${idx}`}>Currently working here</label>
                  </div>

                  <div className="form-group">
                    <div className="group-header">
                      <label>Job Description</label>
                      <button 
                        className="ai-enhance-btn"
                        onClick={() => {
                          setAiFieldType('description')
                          setAiFieldValue(exp.description)
                          setAiFieldIndex(idx)
                          setAiSidebarOpen(true)
                        }}
                      >
                        <Sparkles size={16} /> Enhance with AI
                      </button>
                    </div>
                    <textarea 
                      placeholder="Describe your key responsibilities and achievements..." 
                      rows={4} 
                      value={exp.description || ''} 
                      onChange={e => {
                        const copy = [...experiences]
                        copy[idx].description = e.target.value
                        setExperiences(copy)
                      }} 
                    />
                  </div>
                </div>
              ))
            )}
          </section>
        )
      case 4:
        return (
          <section className="panel">
            <div className="section-header">
              <div>
                <h3>Education</h3>
                <p className="section-subtitle">Add your education details</p>
              </div>
              <button 
                className="add-btn"
                onClick={() => {
                  const newEdu = { institution: '', degree: '', fieldOfStudy: '', graduationDate: '', gpa: '' }
                  setEducation([...education, newEdu])
                }}
              >
                + Add Education
              </button>
            </div>
            {education.length === 0 ? (
              <div className="empty-state-message">
                <GraduationCap size={48} className="empty-icon" />
                <p className="empty-title">No education added yet.</p>
                <p className="empty-desc">Click "Add Education" to get started.</p>
              </div>
            ) : (
              education.map((edu, idx) => (
                <div className="exp-item" key={idx}>
                  <div className="exp-header">
                    <h4>Education #{idx + 1}</h4>
                    <button 
                      className="delete-btn"
                      onClick={() => {
                        const copy = education.filter((_, i) => i !== idx)
                        setEducation(copy)
                      }}
                      title="Delete education"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="exp-row-two-cols">
                    <div className="form-group">
                      <label>Institution Name</label>
                      <input 
                        type="text"
                        placeholder="e.g., University of California" 
                        value={edu.institution || ''} 
                        onChange={e => {
                          const copy = [...education]
                          copy[idx].institution = e.target.value
                          setEducation(copy)
                        }}
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group">
                      <label>Degree</label>
                      <input 
                        type="text"
                        placeholder="e.g., Bachelor's, Master's" 
                        value={edu.degree || ''} 
                        onChange={e => {
                          const copy = [...education]
                          copy[idx].degree = e.target.value
                          setEducation(copy)
                        }}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Field of Study</label>
                    <input 
                      type="text"
                      placeholder="e.g., Computer Science" 
                      value={edu.fieldOfStudy || ''} 
                      onChange={e => {
                        const copy = [...education]
                        copy[idx].fieldOfStudy = e.target.value
                        setEducation(copy)
                      }}
                      autoComplete="off"
                    />
                  </div>

                  <div className="exp-row-two-cols">
                    <div className="form-group">
                      <label>Graduation Date</label>
                      <input 
                        type="month"
                        value={convertToMonthFormat(edu.graduationDate) || ''} 
                        onChange={e => {
                          const copy = [...education]
                          copy[idx].graduationDate = convertFromMonthFormat(e.target.value)
                          setEducation(copy)
                        }} 
                      />
                    </div>
                    <div className="form-group">
                      <label>GPA (optional)</label>
                      <input 
                        type="text"
                        placeholder="e.g., 3.8" 
                        value={edu.gpa || ''} 
                        onChange={e => {
                          const copy = [...education]
                          copy[idx].gpa = e.target.value
                          setEducation(copy)
                        }}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        )
      case 5:
        return (
          <section className="panel">
            <div className="section-header">
              <div>
                <h3>Projects</h3>
                <p className="section-subtitle">Add your projects</p>
              </div>
              <button 
                className="add-btn"
                onClick={() => {
                  const newProject = { name: '', type: '', description: '' }
                  setProjects([...projects, newProject])
                }}
              >
                + Add Project
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="empty-state-message">
                <FileText size={48} className="empty-icon" />
                <p className="empty-title">No projects added yet.</p>
                <p className="empty-desc">Click "Add Project" to get started.</p>
              </div>
            ) : (
              projects.map((proj, idx) => (
                <div className="exp-item" key={idx}>
                  <div className="exp-header">
                    <h4>Project #{idx + 1}</h4>
                    <button 
                      className="delete-btn"
                      onClick={() => {
                        const copy = projects.filter((_, i) => i !== idx)
                        setProjects(copy)
                      }}
                      title="Delete project"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="exp-row-two-cols">
                    <div className="form-group">
                      <label>Project Name</label>
                      <input 
                        type="text"
                        placeholder="e.g., E-commerce Platform" 
                        value={proj.name || ''} 
                        onChange={e => {
                          const copy = [...projects]
                          copy[idx].name = e.target.value
                          setProjects(copy)
                        }}
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group">
                      <label>Project Type</label>
                      <input 
                        type="text"
                        placeholder="e.g., Web App, Mobile App" 
                        value={proj.type || ''} 
                        onChange={e => {
                          const copy = [...projects]
                          copy[idx].type = e.target.value
                          setProjects(copy)
                        }}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Project Description</label>
                    <textarea 
                      placeholder="Describe your project..." 
                      rows={4} 
                      value={proj.description || ''} 
                      onChange={e => {
                        const copy = [...projects]
                        copy[idx].description = e.target.value
                        setProjects(copy)
                      }} 
                    />
                  </div>
                </div>
              ))
            )}
          </section>
        )
      case 6:
        return (
          <section className="panel">
            <div className="skills-header">
              <div>
                <h3>Skills</h3>
                <p className="section-subtitle">Add your technical and soft skills</p>
              </div>
            </div>

            <div className="skills-input-group">
              <input 
                type="text"
                placeholder="Enter a skill (e.g., JavaScript, Project Management)" 
                value={skillInput} 
                onChange={e => setSkillInput(e.target.value)} 
                onKeyDown={e => {
                  if(e.key === 'Enter' && skillInput.trim()){
                    setSkills(prev => [...prev, skillInput.trim()])
                    setSkillInput('')
                    e.preventDefault()
                  }
                }}
                autoComplete="off"
              />
              <button 
                className="add-skill-btn"
                onClick={() => {
                  if(skillInput.trim()){
                    setSkills(prev => [...prev, skillInput.trim()])
                    setSkillInput('')
                  }
                }}
              >
                + Add
              </button>
            </div>

            {skills.length === 0 ? (
              <div className="empty-state-message">
                <Settings size={48} className="empty-icon" />
                <p className="empty-title">No skills added yet.</p>
                <p className="empty-desc">Add your technical and soft skills above.</p>
              </div>
            ) : (
              <div className="skills-list">
                {skills.map((s, i) => (
                  <span key={i} className="skill-badge">
                    {s}
                    <button 
                      className="remove-skill"
                      onClick={() => {
                        setSkills(prev => prev.filter((_, idx) => idx !== i))
                      }}
                      title="Remove skill"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="form-tip">
              <strong>Tip:</strong> Add 8-12 relevant skills. Include both technical skills (programming languages, tools) and soft skills (leadership, communication).
            </div>
          </section>
        )
      case 7:
        return (
          <section className="panel">
            <div className="section-header">
              <div>
                <h3>Certifications</h3>
                <p className="section-subtitle">Add your certifications and credentials</p>
              </div>
              <button 
                className="add-btn"
                onClick={() => {
                  const newCert = { certName: '', issuer: '', issueDate: '', expiryDate: '' }
                  setCertifications([...certifications, newCert])
                }}
              >
                + Add Certification
              </button>
            </div>
            {certifications.length === 0 ? (
              <div className="empty-state-message">
                <Award size={48} className="empty-icon" />
                <p className="empty-title">No certifications added yet.</p>
                <p className="empty-desc">Click "Add Certification" to get started.</p>
              </div>
            ) : (
              certifications.map((cert, idx) => (
                <div className="exp-item" key={idx}>
                  <div className="exp-header">
                    <h4>Certification #{idx + 1}</h4>
                    <button 
                      className="delete-btn"
                      onClick={() => {
                        const copy = certifications.filter((_, i) => i !== idx)
                        setCertifications(copy)
                      }}
                      title="Delete certification"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="exp-row-two-cols">
                    <div className="form-group">
                      <label>Certification Name</label>
                      <input 
                        type="text"
                        placeholder="e.g., AWS Solutions Architect" 
                        value={cert.certName || ''} 
                        onChange={e => {
                          const copy = [...certifications]
                          copy[idx].certName = e.target.value
                          setCertifications(copy)
                        }}
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group">
                      <label>Issuer</label>
                      <input 
                        type="text"
                        placeholder="e.g., Amazon Web Services" 
                        value={cert.issuer || ''} 
                        onChange={e => {
                          const copy = [...certifications]
                          copy[idx].issuer = e.target.value
                          setCertifications(copy)
                        }}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="exp-row-two-cols">
                    <div className="form-group">
                      <label>Issue Date</label>
                      <input 
                        type="date"
                        value={cert.issueDate || ''} 
                        onChange={e => {
                          const copy = [...certifications]
                          copy[idx].issueDate = e.target.value
                          setCertifications(copy)
                        }} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input 
                        type="date"
                        value={cert.expiryDate || ''} 
                        onChange={e => {
                          const copy = [...certifications]
                          copy[idx].expiryDate = e.target.value
                          setCertifications(copy)
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="build-page">
      <AccentColorPicker 
        isOpen={colorPickerOpen}
        selectedColor={accentColor}
        onColorSelect={(color) => setAccentColor(color)}
        onClose={() => setColorPickerOpen(false)}
        buttonRef={accentButtonRef}
      />

      <TemplateSelector
        isOpen={templateSelectorOpen}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={(template) => setSelectedTemplate(template)}
        onClose={() => setTemplateSelectorOpen(false)}
        buttonRef={templateButtonRef}
      />

      <AISuggestions
        isOpen={aiSidebarOpen}
        fieldType={aiFieldType}
        currentValue={aiFieldValue}
        onApply={(suggestion) => {
          if (aiFieldIndex !== null && typeof aiFieldIndex === 'number') {
            const copy = [...experiences]
            if (aiFieldType === 'company') copy[aiFieldIndex].company = suggestion
            if (aiFieldType === 'role') copy[aiFieldIndex].role = suggestion
            if (aiFieldType === 'description') copy[aiFieldIndex].desc = suggestion
            setExperiences(copy)
          } else {
            if (aiFieldType === 'jobTitle') setPersonal(p => ({...p, jobTitle: suggestion}))
            if (aiFieldType === 'description') setSummary(suggestion)
            if (aiFieldType === 'school') setEducation(e => ({...e, school: suggestion}))
            if (aiFieldType === 'degree') setEducation(e => ({...e, degree: suggestion}))
          }
          setAiFieldValue('')
          setAiFieldType('')
          setAiFieldIndex(null)
          setAiSidebarOpen(false)
        }}
        onClose={() => setAiSidebarOpen(false)}
      />

      <HeaderWithUser 
        onLogout={onClose} 
        userName={user?.fullName || 'User'}
        navActions={
          <>
            <button 
              className="nav-item"
              onClick={() => onJobMatcher({ personal, summary, experiences, education, projects, skills, certifications })}
            >
              <Briefcase size={20} className="nav-icon-svg" />
              <span className="nav-label">Job Matcher</span>
            </button>
            <button className="nav-item" onClick={() => onATSAnalyzer({ personal, summary, experiences, education, skills, certifications })} title="Analyze resume for ATS compatibility" aria-label="ATS Analyzer">
              <FileText size={20} className="nav-icon-svg" />
              <span className="nav-label">ATS Analyzer</span>
            </button>
            <button className="nav-pill" onClick={() => {
              setAiSidebarOpen(true)
              setAiFieldType('jobTitle')
              setAiFieldValue(personal.jobTitle || '')
              setAiFieldIndex(null)
            }} title="Get AI assistance" aria-label="AI Assist">
              <Sparkles size={20} className="nav-icon-svg" />
              <span className="nav-label">AI Assist</span>
            </button>
          </>
        }
      />
      <div className="build-content">
        <div className="build-title">
          <div className="title-left">
            <button className="back-to-dashboard" onClick={onClose} title="Back to dashboard" aria-label="Back to dashboard">
              ← Back to Dashboard
            </button>
          </div>
          <div className="title-right">
            {saveMessage && <div className="save-success-message">{saveMessage}</div>}
            {saveError && <div className="save-error-message">{saveError}</div>}
            <button 
              className="btn-save" 
              onClick={handleSaveChanges}
              disabled={isSaving}
              title="Save changes to resume"
            >
              <Save size={20} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn-download" onClick={handleDownload} title="Download your resume">
              <Download size={20} />
              Download
            </button>
          </div>
        </div>

      <div className="build-inner">
        <div className="builder-left">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
          </div>

          <div className="step-indicator-bar">
            <div className="step-bar-left">
              <button 
                ref={templateButtonRef}
                className="btn-template" 
                onClick={() => setTemplateSelectorOpen(true)}
              >
                📋 Template
              </button>
              <button 
                ref={accentButtonRef}
                className="btn-accent" 
                onClick={() => setColorPickerOpen(true)}
              >
                🎨 Accent
              </button>
            </div>

            <div className="step-bar-right">
              <button 
                className="btn-prev-top"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
              >
                ← Previous
              </button>
              <button 
                className="btn-next-top"
                onClick={handleNextStep}
                disabled={currentStep === steps.length}
              >
                Next →
              </button>
            </div>
          </div>

          <div className="step-form-container">
            {renderStepContent()}
          </div>
        </div>

        <div className="builder-right">
          <div className="template-container" ref={templateRef}>
            {renderTemplate()}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

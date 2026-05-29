import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react'
import './ResumeTemplate1.css'

export default function ResumeTemplate1({ personal, summary, experiences, education, projects, skills, certifications, accentColor = '#3B82F6' }) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Style object with dynamic accent color
  const templateStyle = {
    '--primary-color': accentColor,
    '--accent-blue': accentColor
  }

  return (
    <div className="resume-template-1" style={templateStyle}>
      {/* Header Section */}
      <div className="template-header-t1">
        <h1 className="resume-name-t1">{personal.fullName || 'Your Name'}</h1>
        {personal.jobTitle && (
          <p className="profession-t1">{personal.jobTitle}</p>
        )}
        
        {/* Contact Information */}
        <div className="contact-info-t1">
          {personal.email && (
            <span className="contact-item-t1">
              <Mail size={14} />
              <span>{personal.email}</span>
            </span>
          )}
          
          {personal.phone && (
            <span className="contact-item-t1">
              <Phone size={14} />
              <span>{personal.phone}</span>
            </span>
          )}
          
          {personal.location && (
            <span className="contact-item-t1">
              <MapPin size={14} />
              <span>{personal.location}</span>
            </span>
          )}
          
          {personal.website && (
            <span className="contact-item-t1">
              <Globe size={14} />
              <span>{personal.website}</span>
            </span>
          )}
          
          {personal.linkedin && (
            <span className="contact-item-t1">
              <Linkedin size={14} />
              <span>{personal.linkedin}</span>
            </span>
          )}
        </div>

        {/* Divider Line */}
        <div className="header-divider-t1"></div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper-t1">

        {/* Professional Summary Section */}
        {summary && (
          <div className="resume-section-t1">
            <h2 className="section-title-t1">PROFESSIONAL SUMMARY</h2>
            <div className="summary-content-t1">
              <p className="section-content-t1">{summary}</p>
            </div>
          </div>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <div className="resume-section-t1">
            <h2 className="section-title-t1">PROFESSIONAL EXPERIENCE</h2>
            {experiences.map((exp, idx) => (
              (exp.company || exp.jobTitle || exp.description) && (
                <div key={idx} className="experience-item-t1">
                  <div className="experience-header-t1">
                    <div className="experience-title-block-t1">
                      <h3 className="job-title-t1">{exp.jobTitle || 'Job Title'}</h3>
                      <p className="company-name-t1">{exp.company || 'Company Name'}</p>
                    </div>
                    {(exp.startDate || exp.endDate || exp.currentlyWorking) && (
                      <div className="experience-dates-t1">
                        {exp.startDate && formatDate(exp.startDate)}
                        {exp.startDate && (exp.currentlyWorking || exp.endDate) && ' - '}
                        {exp.currentlyWorking ? 'Present' : exp.endDate && formatDate(exp.endDate)}
                      </div>
                    )}
                  </div>
                  
                  {exp.description && <p className="experience-desc-t1">{exp.description}</p>}
                </div>
              )
            ))}
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && education.some(e => e.institution || e.degree) && (
          <div className="resume-section-t1">
            <h2 className="section-title-t1">EDUCATION</h2>
            
            {education.map((edu, idx) => (
              (edu.institution || edu.degree) && (
                <div key={idx} className="education-item-t1">
                  <div className="education-header-t1">
                    <div className="education-title-block-t1">
                      <h3 className="degree-t1">{edu.degree || 'Degree'}</h3>
                      <p className="school-name-t1">{edu.institution || 'School Name'}</p>
                    </div>
                    {edu.graduationDate && (
                      <div className="education-date-t1">
                        {formatDate(edu.graduationDate)}
                      </div>
                    )}
                  </div>
                  
                  {edu.fieldOfStudy && (
                    <p className="education-field-t1">{edu.fieldOfStudy}</p>
                  )}
                  {edu.gpa && (
                    <p className="education-gpa-t1">GPA: {edu.gpa}</p>
                  )}
                </div>
              )
            ))}
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && projects.some(p => p.name || p.description) && (
          <div className="resume-section-t1">
            <h2 className="section-title-t1">PROJECTS</h2>
            {projects.map((proj, idx) => (
              (proj.name || proj.description) && (
                <div key={idx} className="project-item-t1">
                  <div className="project-header-t1">
                    <div className="project-title-block-t1">
                      <h3 className="project-name-t1">{proj.name || ''}</h3>
                      {proj.type && <p className="project-type-t1">{proj.type}</p>}
                    </div>
                  </div>
                  
                  {proj.description && <p className="project-desc-t1">{proj.description}</p>}
                </div>
              )
            ))}
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="resume-section-t1">
            <h2 className="section-title-t1">SKILLS</h2>
            <ul className="skills-container-t1">
              {skills.map((skill, idx) => (
                <li key={idx} className="skill-item-t1">• {skill}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="resume-section-t1">
            <h2 className="section-title-t1">CERTIFICATIONS</h2>
            
            <div className="certifications-container-t1">
              {certifications.map((cert, idx) => (
                cert.certName && (
                  <div key={idx} className="certification-item-t1">
                    <h4 className="cert-name-t1">{typeof cert === 'string' ? cert : cert.certName}</h4>
                    {cert.issuer && <p className="cert-issuer-t1">{cert.issuer}</p>}
                    <div className="cert-dates-t1">
                      {cert.issueDate && (
                        <span className="cert-date-t1">
                          Issue: {new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {cert.expiryDate && (
                        <span className="cert-date-t1">
                          Expires: {new Date(cert.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

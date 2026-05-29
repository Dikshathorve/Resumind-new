import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react'
import './resumetemplate3.css'

export default function ResumeTemplate3({ personal, summary, experiences, education, projects, skills, certifications, accentColor = '#3B82F6', profileImage = null }) {
  const templateStyle = {
    '--primary-color': accentColor,
    '--accent-blue': accentColor
  }

  const formatDate = (d) => {
    if (!d) return ''
    try {
      const date = new Date(d)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } catch {
      return d
    }
  }

  return (
    <div className="resume-template-3" style={templateStyle}>
      <div className="template3-card">
        <div className="template3-container">
          {/* LEFT SIDEBAR */}
          <aside className="template3-sidebar">
            <div className="sidebar-top">
              <div className="profile-wrap">
                {profileImage ? (
                  <img src={profileImage} alt={personal.fullName} className="profile-image" />
                ) : (
                  <div className="profile-fallback">{(personal.fullName || 'Y').charAt(0)}</div>
                )}
              </div>
            </div>

            <section className="sidebar-section contact">
              <h4 className="sidebar-title">CONTACT</h4>
              <div className="sidebar-content">
                {personal.location && (
                  <div className="sidebar-item"><MapPin size={14} className="sidebar-icon" /><span className="sidebar-value">{personal.location}</span></div>
                )}
                {personal.phone && (
                  <div className="sidebar-item"><Phone size={14} className="sidebar-icon" /><span className="sidebar-value">{personal.phone}</span></div>
                )}
                {personal.email && (
                  <div className="sidebar-item"><Mail size={14} className="sidebar-icon" /><span className="sidebar-value">{personal.email}</span></div>
                )}
                {personal.website && (
                  <div className="sidebar-item"><Globe size={14} className="sidebar-icon" /><span className="sidebar-value">{personal.website}</span></div>
                )}
              </div>
            </section>

            {education && education.length > 0 && (
              <section className="sidebar-section education">
                <h4 className="sidebar-title">EDUCATION</h4>
                <div className="sidebar-content">
                  {education.map((edu, idx) => (
                    (edu.institution || edu.degree) && (
                      <div key={idx} className="education-item-sidebar">
                        <h5 className="edu-year">{edu.graduationDate ? formatDate(edu.graduationDate) : ''}</h5>
                        <div className="edu-details">
                          <h5 className="edu-title-sidebar">{edu.institution || ''}</h5>
                          <p className="edu-school-sidebar">{edu.degree || ''}</p>
                          {edu.fieldOfStudy && <p className="edu-field-sidebar">{edu.fieldOfStudy}</p>}
                          {edu.gpa && <p className="edu-gpa-sidebar">GPA: {edu.gpa}</p>}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </section>
            )}

            {skills && skills.length > 0 && (
              <section className="sidebar-section skills">
                <h4 className="sidebar-title">PRO. SKILLS</h4>
                <div className="skills-list-sidebar">
                  {skills.map((s, i) => <div key={i} className="skill-line">• {s}</div>)}
                </div>
              </section>
            )}
          </aside>

          {/* RIGHT CONTENT AREA */}
          <main className="template3-content">
            <div className="header-right">
              <h1 className="resume-name-t3">{personal.fullName || 'Your Name'}</h1>
              <p className="job-title-t3">{personal.jobTitle || 'Job Title'}</p>
            </div>

            {summary && (
              <section className="content-section">
                <h3 className="section-title-t3">PROFESSIONAL SUMMARY</h3>
                <p className="section-text-t3">{summary}</p>
              </section>
            )}

            {experiences && experiences.length > 0 && (
              <section className="content-section">
                <h3 className="section-title-t3">EXPERIENCE</h3>
                {experiences.map((exp, idx) => (
                  (exp.company || exp.jobTitle || exp.title) && (
                    <div key={idx} className="exp-item-t3">
                      <div className="exp-header">
                        <div>
                          <p className="exp-company-t3">{exp.company || ''}</p>
                          <h4 className="exp-title-t3">{exp.jobTitle || exp.title || 'Position'}</h4>
                        </div>
                        <div className="exp-date">{exp.startDate ? formatDate(exp.startDate) : ''}{(exp.startDate && (exp.endDate || exp.currentlyWorking)) && ' - '}{exp.currentlyWorking ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : '')}</div>
                      </div>
                      {exp.description && <p className="exp-desc-t3">{exp.description}</p>}
                    </div>
                  )
                ))}
              </section>
            )}

            {projects && projects.length > 0 && (
              <section className="content-section">
                <h3 className="section-title-t3">PROJECTS</h3>
                {projects.map((proj, idx) => (
                  (proj.name || proj.title) && (
                    <div key={idx} className="project-item-t3">
                      <h4 className="project-title-t3">{proj.name || proj.title}</h4>
                      {proj.type && <p className="project-type-t3">{proj.type}</p>}
                      {proj.description && <p className="project-desc-t3">{proj.description}</p>}
                    </div>
                  )
                ))}
              </section>
            )}

            {certifications && certifications.length > 0 && (
              <section className="content-section">
                <h3 className="section-title-t3">CERTIFICATIONS</h3>
                <ul className="certs-list-t3">
                  {certifications.map((cert, idx) => (
                    cert.certName && (
                      <li key={idx}>
                        <strong>{typeof cert === 'string' ? cert : cert.certName}</strong>
                        {cert.issuer && <p className="cert-issuer-t3">{cert.issuer}</p>}
                        <div className="cert-dates-t3">
                          {cert.issueDate && (
                            <span className="cert-date-t3">
                              Issue: {new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            </span>
                          )}
                          {cert.expiryDate && (
                            <span className="cert-date-t3">
                              Expires: {new Date(cert.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  ))}
                </ul>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function BuildHeader({ onClose }) {
  return (
    <header className="build-header-nav">
      <div className="build-header-container">
        <button className="back-button-nav" onClick={onClose} title="Back to home" aria-label="Back to home">← Back to Home</button>
        
        <nav className="build-nav">
          <a href="#job-matcher" className="nav-item">
            <span className="nav-icon">⭕</span>
            <span>Job Matcher</span>
          </a>
          <a href="#ats-analyzer" className="nav-item">
            <span className="nav-icon">📋</span>
            <span>ATS Analyzer</span>
          </a>
          <a href="#ai-assist" className="nav-item">
            <span className="nav-icon">✨</span>
            <span>AI Assist</span>
          </a>
        </nav>
        
        <div className="build-header-actions">
          <button className="download-button">
            <span className="download-icon">⬇️</span>
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </header>
  )
}

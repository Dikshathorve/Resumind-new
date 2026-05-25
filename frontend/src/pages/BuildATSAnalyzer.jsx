import './BuildATSAnalyzer.css'
import { BarChart3, Eye, Target, TrendingUp, ArrowLeft } from 'lucide-react'

export default function BuildATSAnalyzer({ onAnalyze, onClose }) {
  return (
    <div className="build-ats-analyzer">
      <div className="build-ats-nav">
        <button className="build-ats-back-btn" onClick={onClose} title="Go back to builder" aria-label="Back to builder">
          <ArrowLeft size={20} />
          <span>Back to Builder</span>
        </button>
        <h1 className="build-ats-nav-title">Analyze Resume</h1>
      </div>

      <div className="ats-analyzer-container">
        <div className="ats-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>ATS Compatibility Analyzer</span>
        </div>

        <h2>ATS <span className="ats-score-highlight">Score</span><br/>Analyzer</h2>
        
        <p className="ats-description">
          Our AI analyzes your resume against 50+ ATS systems to ensure maximum compatibility and help you get past automated screening.
        </p>

        <div className="ats-card-section">
          <div className="ats-icon-wrapper">
            <div className="ats-icon-circle">
              <BarChart3 size={48} />
            </div>
          </div>

          <h3>Analyze Your Resume</h3>
          
          <p className="ats-card-description">
            Get a comprehensive ATS compatibility report with actionable insights to improve your resume's chances of getting through automated screening.
          </p>

          <button className="analyze-btn" onClick={onAnalyze}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Analyze ATS Compatibility</span>
          </button>

          <p className="analyze-hint">Uses your current resume from the builder</p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Eye size={28} />
            </div>
            <h4>Format Check</h4>
            <p>Verify parsability</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Target size={28} />
            </div>
            <h4>Keyword Analysis</h4>
            <p>Optimize content</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <TrendingUp size={28} />
            </div>
            <h4>Score Report</h4>
            <p>Detailed insights</p>
          </div>
        </div>
      </div>
    </div>
  )
}

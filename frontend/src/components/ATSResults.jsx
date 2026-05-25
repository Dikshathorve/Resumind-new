import './ATSResults.css'
import { CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react'

export default function ATSResults({ results, fileName, onNewAnalysis }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'good'
    if (score >= 40) return 'fair'
    return 'poor'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const ScoreCircle = ({ score, label }) => (
    <div className={`score-circle ${getScoreColor(score)}`}>
      <div className="circle-content">
        <div className="score-number">{score}</div>
        <div className="score-label">{label}</div>
      </div>
    </div>
  )

  return (
    <div className="ats-results-page">
      {/* Main Score Section */}
      <div className="results-hero">
        <div className="results-hero-content">
          <h2>Analysis Results</h2>
          <p className="results-file-name">Resume: {fileName}</p>
        </div>
        <div className="main-score-container">
          <ScoreCircle score={results.atsScore} label="ATS Score" />
        </div>
      </div>

      {/* Results Container */}
      <div className="results-container">
        {/* Quick Summary */}
        <div className="results-section quick-summary">
          <div className="section-header">
            <h3>Quick Summary</h3>
          </div>
          <div className="summary-grid">
            <div className="summary-card matched">
              <div className="summary-icon">
                <CheckCircle size={24} />
              </div>
              <div className="summary-content">
                <h4>Matched Keywords</h4>
                <p className="count">{results.matchedKeywords.length}</p>
                <div className="keywords-list">
                  {results.matchedKeywords.map((keyword, idx) => (
                    <span key={idx} className="keyword matched-keyword">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="summary-card missing">
              <div className="summary-icon">
                <AlertCircle size={24} />
              </div>
              <div className="summary-content">
                <h4>Missing Keywords</h4>
                <p className="count">{results.missingKeywords.length}</p>
                <div className="keywords-list">
                  {results.missingKeywords.map((keyword, idx) => (
                    <span key={idx} className="keyword missing-keyword">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Scores */}
        <div className="results-section section-scores">
          <div className="section-header">
            <h3>Section Analysis</h3>
          </div>
          <div className="sections-grid">
            {Object.entries(results.sections).map(([sectionName, sectionData]) => (
              <div key={sectionName} className="section-card">
                <div className="section-card-header">
                  <h4 className="capitalize">{sectionName}</h4>
                  <div className={`mini-score ${getScoreColor(sectionData.score)}`}>
                    {sectionData.score}
                  </div>
                </div>
                <div className="score-bar">
                  <div
                    className={`score-fill ${getScoreColor(sectionData.score)}`}
                    style={{ width: `${sectionData.score}%` }}
                  ></div>
                </div>
                {sectionData.issues.length > 0 ? (
                  <div className="issues-list">
                    {sectionData.issues.map((issue, idx) => (
                      <div key={idx} className="issue-item">
                        <AlertCircle size={16} />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-issues">
                    <CheckCircle size={16} />
                    <span>No issues found</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="results-section recommendations">
          <div className="section-header">
            <h3>
              <Zap size={20} />
              Improvement Recommendations
            </h3>
          </div>
          <div className="recommendations-list">
            {results.recommendations.map((recommendation, idx) => (
              <div key={idx} className="recommendation-item">
                <div className="recommendation-number">{idx + 1}</div>
                <div className="recommendation-content">
                  <p>{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button className="action-btn secondary" onClick={onNewAnalysis} title="Analyze another resume">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2-8.947m2 8.947h1"></path>
            </svg>
            Analyze Another Resume
          </button>
          <button className="action-btn primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Report
          </button>
        </div>
      </div>
    </div>
  )
}

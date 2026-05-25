import './ATSAnalyzerResults.css'
import { CheckCircle, AlertCircle, TrendingUp, Zap, Download } from 'lucide-react'

export default function ATSAnalyzerResults({ results, fileName, onNewAnalysis }) {
  const getScoreColor = (score, maxScore = 30) => {
    // Calculate percentage based on actual maxScore
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'excellent'
    if (percentage >= 60) return 'good'
    if (percentage >= 40) return 'fair'
    return 'poor'
  }

  const downloadReport = () => {
    const scorePercentage = ((results.atsScore / 30) * 100).toFixed(1)
    const reportContent = `
ATS COMPATIBILITY ANALYSIS REPORT
=====================================
Generated: ${new Date().toLocaleString()}

RESUME: ${fileName || 'Uploaded Resume'}

OVERALL ATS SCORE
=====================================
Score: ${results.atsScore}/30 (${scorePercentage}%)
Overall Fit: ${results.overallFit || 'N/A'}

QUICK SUMMARY
=====================================
Matched Keywords: ${results.matchedKeywords.length}
${results.matchedKeywords.map(k => `  • ${k}`).join('\n')}

Missing Keywords: ${results.missingKeywords.length}
${results.missingKeywords.map(k => `  • ${k}`).join('\n')}

SECTION ANALYSIS
=====================================
${Object.entries(results.sections).map(([sectionName, sectionData]) => `
${sectionName.toUpperCase()}
Score: ${sectionData.score}/${sectionData.maxScore} (${((sectionData.score / sectionData.maxScore) * 100).toFixed(1)}%)
${sectionData.issues.length > 0 ? `Issues:\n${sectionData.issues.map(i => `  - ${i}`).join('\n')}` : 'No issues found'}
`).join('\n')}

IMPROVEMENT RECOMMENDATIONS
=====================================
${results.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n\n')}

=====================================
For more details, visit your resume builder.
    `.trim()

    const element = document.createElement('a')
    const file = new Blob([reportContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `ATS_Report_${fileName ? fileName.replace(/\.[^.]+$/, '') : 'resume'}_${new Date().getTime()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const ScoreCircle = ({ score, label }) => (
    <div className={`ats-score-circle ${getScoreColor(score)}`}>
      <div className="ats-circle-content">
        <div className="ats-score-number">{score}</div>
        <div className="ats-score-label">{label}</div>
      </div>
    </div>
  )

  return (
    <div className="ats-results-page">
      {/* Main Score Section */}
      <div className="ats-results-hero">
        <div className="ats-results-hero-content">
          <h2>Analysis Results</h2>
          <p className="ats-results-file-name">Resume: {fileName}</p>
        </div>
        <div className="ats-main-score-container">
          <ScoreCircle score={results.atsScore} label="ATS Score" />
        </div>
      </div>

      {/* Results Container */}
      <div className="ats-results-container">
        {/* Quick Summary */}
        <div className="ats-results-section ats-quick-summary">
          <div className="ats-section-header">
            <h3>Quick Summary</h3>
          </div>
          <div className="ats-summary-grid">
            <div className="ats-summary-card ats-matched">
              <div className="ats-summary-icon">
                <CheckCircle size={24} />
              </div>
              <div className="ats-summary-content">
                <h4>Matched Keywords</h4>
                <p className="ats-count">{results.matchedKeywords.length}</p>
                <div className="ats-keywords-list">
                  {results.matchedKeywords.map((keyword, idx) => (
                    <span key={idx} className="ats-keyword ats-matched-keyword">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="ats-summary-card ats-missing">
              <div className="ats-summary-icon">
                <AlertCircle size={24} />
              </div>
              <div className="ats-summary-content">
                <h4>Missing Keywords</h4>
                <p className="ats-count">{results.missingKeywords.length}</p>
                <div className="ats-keywords-list">
                  {results.missingKeywords.map((keyword, idx) => (
                    <span key={idx} className="ats-keyword ats-missing-keyword">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Scores */}
        <div className="ats-results-section ats-section-scores">
          <div className="ats-section-header">
            <h3>Section Analysis</h3>
          </div>
          <div className="ats-sections-grid">
            {Object.entries(results.sections).map(([sectionName, sectionData]) => (
              <div key={sectionName} className="ats-section-card">
                <div className="ats-section-card-header">
                  <h4 className="ats-capitalize">{sectionName}</h4>
                  <div className={`ats-mini-score ${getScoreColor(sectionData.score, sectionData.maxScore)}`}>
                    {sectionData.score}/{sectionData.maxScore}
                  </div>
                </div>
                <div className="ats-score-bar">
                  <div
                    className={`ats-score-fill ${getScoreColor(sectionData.score)}`}
                    style={{ width: `${(sectionData.score / sectionData.maxScore) * 100}%` }}
                  ></div>
                </div>
                {sectionData.issues.length > 0 ? (
                  <div className="ats-issues-list">
                    {sectionData.issues.map((issue, idx) => (
                      <div key={idx} className="ats-issue-item">
                        <AlertCircle size={14} />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ats-no-issues">
                    <CheckCircle size={14} />
                    <span>No issues found</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="ats-results-section ats-recommendations">
          <div className="ats-section-header">
            <h3>
              <Zap size={20} />
              Improvement Recommendations
            </h3>
          </div>
          <div className="ats-recommendations-list">
            {results.recommendations.map((recommendation, idx) => (
              <div key={idx} className="ats-recommendation-item">
                <div className="ats-recommendation-number">{idx + 1}</div>
                <div className="ats-recommendation-content">
                  <p>{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ats-results-actions">
          <button className="ats-action-btn ats-secondary" onClick={onNewAnalysis} title="Analyze another resume">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2-8.947m2 8.947h1"></path>
            </svg>
            Analyze Another Resume
          </button>
          <button className="ats-action-btn ats-primary" onClick={downloadReport} title="Download analysis report">
            <Download size={20} />
            Download Report
          </button>
        </div>
      </div>
    </div>
  )
}

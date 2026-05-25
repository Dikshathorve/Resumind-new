import { useState } from 'react'
import './ATSAnalyzerMain.css'
import { ArrowLeft } from 'lucide-react'
import ATSAnalyzerHeader from '../components/ATSAnalyzerHeader'
import ATSAnalyzerUpload from '../components/ATSAnalyzerUpload'
import ATSAnalyzerResults from '../components/ATSAnalyzerResults'
import { analyzeResumeATS, analyzeBuiltResumeATS } from '../services/atsService'

export default function ATSAnalyzerMain({ onClose, resumeData }) {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [analyzeBuiltResume, setAnalyzeBuiltResume] = useState(false)

  const handleFileUpload = (file) => {
    setUploadedFile(file)
  }

  const handleJobDescriptionChange = (description) => {
    setJobDescription(description)
  }

  const handleAnalyzeBuiltResume = async () => {
    if (!resumeData) {
      alert('No built resume found')
      return
    }

    if (!jobDescription.trim()) {
      alert('Please enter a job description')
      return
    }

    setLoading(true)
    setAnalyzeBuiltResume(true)
    
    try {
      const results = await analyzeBuiltResumeATS(resumeData, jobDescription)
      
      const transformedResults = {
        atsScore: results.overall_score,
        overallFit: results.overall_fit,
        matchedKeywords: results.matched_keywords || [],
        missingKeywords: results.missing_keywords || [],
        sections: {
          keyword_match: { 
            score: results.category_scores.keyword_match,
            maxScore: 30,
            issues: []
          },
          experience_relevance: { 
            score: results.category_scores.experience_relevance,
            maxScore: 25,
            issues: []
          },
          skills_alignment: { 
            score: results.category_scores.skills_alignment,
            maxScore: 20,
            issues: []
          },
          formatting: { 
            score: results.category_scores.formatting,
            maxScore: 15,
            issues: results.format_issues || []
          },
          impact: { 
            score: results.category_scores.impact,
            maxScore: 10,
            issues: []
          }
        },
        format_issues: results.format_issues || [],
        improvement_suggestions: results.improvement_suggestions || [],
        strengths: results.strengths || [],
        recommendations: results.improvement_suggestions || []
      }
      
      setAnalysisResults(transformedResults)
      setLoading(false)
    } catch (error) {
      alert('Failed to analyze resume. Please try again. Check console for details.')
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile || !jobDescription.trim()) {
      alert('Please upload a resume and enter a job description')
      return
    }

    setLoading(true)
    
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const fileContent = e.target.result
        
        const results = await analyzeResumeATS(fileContent, jobDescription)
        
        const transformedResults = {
          atsScore: results.overall_score,
          overallFit: results.overall_fit,
          matchedKeywords: results.matched_keywords || [],
          missingKeywords: results.missing_keywords || [],
          sections: {
            keyword_match: { 
              score: results.category_scores.keyword_match,
              maxScore: 30,
              issues: []
            },
            experience_relevance: { 
              score: results.category_scores.experience_relevance,
              maxScore: 25,
              issues: []
            },
            skills_alignment: { 
              score: results.category_scores.skills_alignment,
              maxScore: 20,
              issues: []
            },
            formatting: { 
              score: results.category_scores.formatting,
              maxScore: 15,
              issues: results.format_issues || []
            },
            impact: { 
              score: results.category_scores.impact,
              maxScore: 10,
              issues: []
            }
          },
          format_issues: results.format_issues || [],
          improvement_suggestions: results.improvement_suggestions || [],
          strengths: results.strengths || [],
          recommendations: results.improvement_suggestions || []
        }
        
        setAnalysisResults(transformedResults)
        setLoading(false)
      }
      
      reader.readAsText(uploadedFile)
    } catch (error) {
      alert('Failed to analyze resume. Please try again. Check console for details.')
      setLoading(false)
    }
  }

  const handleNewAnalysis = () => {
    setUploadedFile(null)
    setAnalysisResults(null)
    setJobDescription('')
    setAnalyzeBuiltResume(false)
  }
  
  return (
    <div className="ats-analyzer-main-page">
      <div className="ats-analyzer-nav">
        <button className="ats-back-btn" onClick={onClose} title="Go back to builder" aria-label="Back to builder">
          <ArrowLeft size={20} />
          <span>Back to Builder</span>
        </button>
        <div className="ats-nav-title">
          <h1>Job Matcher</h1>
        </div>
      </div>

      {analysisResults ? (
        <ATSAnalyzerResults 
          results={analysisResults} 
          fileName={uploadedFile?.name}
          onNewAnalysis={handleNewAnalysis}
        />
      ) : (
        <>
          <ATSAnalyzerHeader />
          <div className="ats-analyzer-container">
            <ATSAnalyzerUpload 
              onFileUpload={handleFileUpload}
              onJobDescriptionChange={handleJobDescriptionChange}
              uploadedFile={uploadedFile}
              jobDescription={jobDescription}
              onAnalyze={handleAnalyze}
              onAnalyzeBuiltResume={handleAnalyzeBuiltResume}
              loading={loading}
              hasBuiltResume={!!resumeData}
            />
          </div>
        </>
      )}
    </div>
  )
}

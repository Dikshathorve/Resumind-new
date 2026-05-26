import { asyncHandler } from '../middleware/middleware.js';
import { analyzeResumeForATS, analyzeBuiltResumeForATS } from '../services/atsAnalyzerService.js';
import pdfParse from 'pdf-parse';

// @route   POST /api/ats/analyze-resume
// @desc    Analyze uploaded resume against job description
// @access  Private
export const analyzeATSResume = asyncHandler(async (req, res) => {
  const { jobDescription, resumeFile } = req.body;

  if (!jobDescription || jobDescription.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Job description is required'
    });
  }

  if (!resumeFile) {
    return res.status(400).json({
      success: false,
      message: 'Resume file is required'
    });
  }

  try {
    console.log('🔍 Starting ATS analysis for uploaded resume');

    // For now, assume resumeFile is already text
    // In production, you'd need to parse PDF/Word docs
    let resumeText = resumeFile;

    // If resumeFile is a base64 string or needs parsing
    if (typeof resumeFile === 'string' && resumeFile.includes('data:')) {
      // Handle base64 encoded file
      const base64Data = resumeFile.split(',')[1];
      resumeText = Buffer.from(base64Data, 'base64').toString('utf-8');
    }

    const analysis = await analyzeResumeForATS(resumeText, jobDescription);

    if (!analysis.success) {
      console.error('❌ ATS analysis failed:', analysis.message);
      return res.status(503).json({
        success: false,
        message: analysis.message,
        error: analysis.error
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis.analysis
    });
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    return res.status(500).json({
      success: false,
      message: 'ATS analysis failed',
      error: error.message
    });
  }
});

// @route   POST /api/ats/analyze-built-resume
// @desc    Analyze built resume against job description
// @access  Private
export const analyzeATSBuiltResume = asyncHandler(async (req, res) => {
  const { jobDescription, resumeData } = req.body;

  if (!jobDescription || jobDescription.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Job description is required'
    });
  }

  if (!resumeData) {
    return res.status(400).json({
      success: false,
      message: 'Resume data is required',
      debug: 'resumeData is null or undefined'
    });
  }

  try {
    console.log('🔍 Starting ATS analysis for built resume');
    console.log('📊 Resume data keys:', Object.keys(resumeData || {}).join(', '));

    const analysis = await analyzeBuiltResumeForATS(resumeData, jobDescription);

    if (!analysis.success) {
      console.error('❌ ATS analysis failed:', analysis.message);
      return res.status(503).json({
        success: false,
        message: analysis.message,
        error: analysis.error
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis.analysis
    });
  } catch (error) {
    console.error('Built Resume ATS Analysis Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Built resume ATS analysis failed',
      error: error.message
    });
  }
});

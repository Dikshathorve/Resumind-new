const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Analyze uploaded resume against job description
 */
export const analyzeResumeATS = async (resumeText, jobDescription) => {
  try {
    const requestBody = {
      resumeFile: resumeText,
      jobDescription: jobDescription.trim()
    };
    
    const response = await fetch(`${API_URL}/ats/analyze-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // Handle both successful and error responses
    if (!response.ok) {
      // If it's a service unavailable error (503), check for API key issue
      if (response.status === 503) {
        throw new Error(data.message || 'AI service is not configured. Contact administrator to set up OPENAI_API_KEY.');
      }
      const errorMessage = data.message || data.error || `HTTP ${response.status}: Failed to analyze resume`;
      throw new Error(errorMessage);
    }

    return data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Analyze built resume against job description
 */
export const analyzeBuiltResumeATS = async (resumeData, jobDescription) => {
  try {
    if (!resumeData) {
      throw new Error('Resume data is missing. Please make sure resume is loaded.');
    }
    
    const requestBody = {
      resumeData: resumeData,
      jobDescription: jobDescription.trim()
    };
    
    const response = await fetch(`${API_URL}/ats/analyze-built-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      // If it's a service unavailable error (503), check for API key issue
      if (response.status === 503) {
        throw new Error(data.message || 'AI service is not configured. Contact administrator to set up OPENAI_API_KEY.');
      }
      throw new Error(data.message || `HTTP ${response.status}: Failed to analyze built resume`);
    }

    return data.data;
  } catch (error) {
    throw error;
  }
};

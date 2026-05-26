import OpenAI from 'openai';

/**
 * ATS Resume Analyzer Service
 * Evaluates resume against job description using RAG-based rubric system
 * Scores: Keyword Match (30), Experience Relevance (25), Skills Alignment (20), 
 *         Formatting (15), Impact (10)
 */

// ATS Rules and Best Practices for RAG Context
const ATS_RULES_CONTEXT = `
# ATS Resume Best Practices and Rules

## Formatting Rules
- Use standard fonts (Arial, Calibri, Times New Roman)
- Simple formatting without colors, graphics, or images
- Clear section headers
- Consistent spacing and indentation
- Bullet points for easy parsing
- No special characters or symbols
- Standard page layout

## Keyword Optimization
- Include industry-specific keywords from job description
- Use exact terminology from JD when possible
- Incorporate technical skills and certifications
- Include role-specific competencies
- Match job title variations

## Content Structure
- Professional Summary (aligned with role)
- Core Competencies/Skills section
- Professional Experience with quantifiable achievements
- Education and Certifications
- Reverse chronological order for experience

## Achievement Metrics
- Always include numbers and percentages
- Use action verbs (Led, Managed, Developed, etc.)
- Quantify impact (time, cost, revenue, efficiency)
- Show ROI or business value
- Include concrete examples

## ATS-Friendly Keywords
- Use standard section headers (Professional Experience, Education, Skills)
- Include dates in standard format (MM/YYYY)
- Use full company names before acronyms
- Include degree names (Bachelor of Science)
- List certifications with issuing organizations
`;

export const analyzeResumeForATS = async (resumeText, jobDescription) => {
  try {
    // Check if OPENAI_API_KEY is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured for ATS analysis');
      return {
        success: false,
        message: 'AI service is not configured. Please configure OPENAI_API_KEY in environment variables.',
        error: 'OPENAI_API_KEY not set'
      };
    }

    if (!resumeText || !jobDescription) {
      return {
        success: false,
        message: 'Resume text and job description are required'
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const systemPrompt = `You are an ATS (Applicant Tracking System) resume evaluator specializing in scoring resumes against job descriptions using a comprehensive rubric system.

${ATS_RULES_CONTEXT}

EVALUATION RUBRIC:
- Keyword Match (0-30): How well resume keywords match JD keywords
- Experience Relevance (0-25): How relevant professional experience is to role
- Skills Alignment (0-20): How well technical and soft skills align with JD
- Formatting (0-15): ATS-friendliness and resume structure quality
- Impact (0-10): Presence of quantifiable achievements and metrics

CRITICAL SCORING INSTRUCTIONS:
1. Analyze the resume strictly against the job description with granular detail
2. Calculate scores based on precise assessment, NOT rounded numbers
3. MUST vary scores - NEVER use multiples of 5 exclusively (NO: 20, 25, 30, 15, 10)
4. Use varied scoring like: 23, 18, 14, 9, 11 OR 27, 22, 17, 13, 8 OR 24, 19, 15, 11, 7
5. Each score should reflect actual quality differences and evaluation details
6. Consider partial points for partial achievements
7. Score should NOT be round numbers - use numbers like 21, 24, 26, 17, 13, 9, 12, 18 etc
8. Identify ALL missing critical keywords from JD with explanations
9. List specific format issues if any exist
10. Provide 3-5 actionable improvement suggestions
11. Return ONLY valid JSON, no additional text

SCORING EXAMPLES (GOOD):
- High quality: keyword_match: 28, experience_relevance: 23, skills_alignment: 18, formatting: 14, impact: 9
- Medium quality: keyword_match: 21, experience_relevance: 17, skills_alignment: 14, formatting: 11, impact: 7
- Low quality: keyword_match: 12, experience_relevance: 10, skills_alignment: 8, formatting: 6, impact: 3

RETURN FORMAT (JSON ONLY):
{
  "overall_score": number (0-100),
  "category_scores": {
    "keyword_match": number (0-30),
    "experience_relevance": number (0-25),
    "skills_alignment": number (0-20),
    "formatting": number (0-15),
    "impact": number (0-10)
  },
  "missing_keywords": [array of strings],
  "matched_keywords": [array of strings],
  "format_issues": [array of strings],
  "improvement_suggestions": [array of strings],
  "strengths": [array of strings],
  "overall_fit": "Poor" | "Fair" | "Good" | "Excellent"
}`;

    const userPrompt = `Analyze this resume against the job description and score it using the ATS rubric.

JOB DESCRIPTION:
${jobDescription.trim()}

---

RESUME:
${resumeText.trim()}

---

Provide a comprehensive ATS analysis with detailed scoring. Return ONLY the JSON response.`;

    const response = await client.chat.completions.create({
      model: process.env.ATS_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    try {
      const analysisData = JSON.parse(response.choices[0].message.content);
      
      // Log token usage
      const tokensUsed = response.usage.total_tokens;
      const inputTokens = response.usage.prompt_tokens;
      const outputTokens = response.usage.completion_tokens;
      console.log(`✓ ATS Analysis Complete | Tokens: ${tokensUsed} (Input: ${inputTokens}, Output: ${outputTokens})`);
      
      return {
        success: true,
        analysis: analysisData
      };
    } catch (parseError) {
      console.error('Failed to parse ATS analysis response:', parseError);
      return {
        success: false,
        message: 'Failed to parse analysis response',
        error: parseError.message
      };
    }
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    return {
      success: false,
      message: error.message || 'ATS analysis failed'
    };
  }
};

/**
 * Analyze built resume from resume data object
 */
export const analyzeBuiltResumeForATS = async (resumeData, jobDescription) => {
  try {
    if (!resumeData || !jobDescription) {
      return {
        success: false,
        message: 'Resume data and job description are required'
      };
    }

    // Convert structured resume data to text
    let resumeText = '';

    // Add personal info
    if (resumeData.personal) {
      resumeText += `${resumeData.personal.fullName || ''}\n`;
      if (resumeData.personal.email) resumeText += `Email: ${resumeData.personal.email}\n`;
      if (resumeData.personal.phone) resumeText += `Phone: ${resumeData.personal.phone}\n`;
      resumeText += '\n';
    }

    // Add professional summary
    if (resumeData.summary) {
      resumeText += `PROFESSIONAL SUMMARY\n`;
      resumeText += `${resumeData.summary}\n\n`;
    }

    // Add skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      resumeText += `SKILLS\n`;
      resumeText += resumeData.skills.map(s => `• ${s.name || s}`).join('\n');
      resumeText += '\n\n';
    }

    // Add experiences
    if (resumeData.experiences && resumeData.experiences.length > 0) {
      resumeText += `PROFESSIONAL EXPERIENCE\n`;
      resumeData.experiences.forEach(exp => {
        resumeText += `${exp.jobTitle || ''} at ${exp.company || ''}\n`;
        if (exp.startDate || exp.endDate) {
          resumeText += `${exp.startDate || ''} - ${exp.endDate || 'Present'}\n`;
        }
        if (exp.description) {
          resumeText += `${exp.description}\n`;
        }
        resumeText += '\n';
      });
    }

    // Add education
    if (resumeData.education && resumeData.education.length > 0) {
      resumeText += `EDUCATION\n`;
      resumeData.education.forEach(edu => {
        resumeText += `${edu.degree || ''} in ${edu.field || ''} from ${edu.institution || ''}\n`;
        if (edu.graduationYear) {
          resumeText += `Graduated: ${edu.graduationYear}\n`;
        }
        resumeText += '\n';
      });
    }

    // Add certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      resumeText += `CERTIFICATIONS\n`;
      resumeText += resumeData.certifications.map(c => `• ${c.name || c}`).join('\n');
      resumeText += '\n\n';
    }

    return analyzeResumeForATS(resumeText, jobDescription);
  } catch (error) {
    console.error('Built Resume Analysis Error:', error);
    return {
      success: false,
      message: error.message || 'Built resume analysis failed'
    };
  }
};

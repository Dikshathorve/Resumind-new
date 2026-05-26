import OpenAI from 'openai';

/**
 * Analyze professional summary against job description
 * Identifies JD keywords and suggests rewriting without fabricating experience
 */
export const analyzeSummaryForJD = async (summary, jobDescription) => {
  try {
    // Check if OPENAI_API_KEY is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured for job matching');
      return {
        success: false,
        message: 'AI service is not configured. Please configure OPENAI_API_KEY in environment variables.',
        error: 'OPENAI_API_KEY not set'
      };
    }

    if (!summary || !jobDescription) {
      return {
        success: false,
        message: 'Summary and job description are required'
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const systemPrompt = `You are a professional resume writer and ATS optimization expert. Analyze how well the professional summary aligns with a job description.

IMPORTANT RULES:
- DO NOT fabricate experience or skills the person doesn't have
- DO NOT add fake achievements
- DO suggest rewriting existing summary with keywords from JD
- DO identify tone and keywords that would make summary more aligned
- DO preserve the original meaning while adding JD-relevant terminology

Return JSON with:
- "matchScore": 0-100 (how well current summary matches JD)
- "jdKeywords": Array of important keywords/phrases from JD
- "currentKeywords": Array of keywords already in summary
- "missingKeywords": Keywords from JD NOT in current summary
- "suggestion": Rewritten summary (max 4 sentences) using JD keywords and tone, but keeping original content true
- "keyImprovements": Array of 2-3 specific improvements made`;

    const userPrompt = `Analyze this professional summary against the job description:

PROFESSIONAL SUMMARY:
"${summary.trim()}"

JOB DESCRIPTION:
"${jobDescription.trim()}"

Rewrite the summary to align with the JD using its keywords and tone while keeping the content truthful and not adding fake experience.`;

    const response = await client.chat.completions.create({
      model: process.env.PROFESSION_MODEL || 'gpt-4o-mini',
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
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 600
    });

    const responseText = response.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(responseText);
    const inputCost = response.usage.prompt_tokens * 0.00000015;
    const outputCost = response.usage.completion_tokens * 0.0000006;

    return {
      success: true,
      section: 'summary',
      original: summary,
      analysis: result,
      tokensUsed: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      estimatedCost: `$${(inputCost + outputCost).toFixed(6)}`
    };
  } catch (error) {
    console.error('❌ Error analyzing summary:', error.message);
    throw error;
  }
};

/**
 * Analyze professional experiences against job description
 * Suggests rewording to highlight relevant skills without adding fake responsibilities
 */
export const analyzeExperiencesForJD = async (experiences, jobDescription) => {
  try {
    // Check if OPENAI_API_KEY is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured for job matching');
      return {
        success: false,
        message: 'AI service is not configured. Please configure OPENAI_API_KEY in environment variables.',
        error: 'OPENAI_API_KEY not set'
      };
    }

    if (!experiences || experiences.length === 0 || !jobDescription) {
      return {
        success: false,
        message: 'Experiences and job description are required'
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const systemPrompt = `You are a professional resume writer specializing in experience section optimization.

IMPORTANT RULES:
- DO NOT add fake job responsibilities or achievements
- DO NOT fabricate technologies or skills used
- DO suggest rewriting existing responsibilities with JD keywords
- DO use action verbs from the JD
- DO prioritize which experiences are most relevant
- Preserve truthfulness - only reword, don't invent

Return JSON with:
- "experiences": Array of analyzed experiences, each with:
  - "original": Original description
  - "suggestion": Rewritten description using JD keywords/action verbs
  - "relevanceScore": 0-100 (how relevant to JD)
  - "matchedSkills": Skills from this experience that match JD
  - "improvementNotes": Specific improvements made
- "overallExperienceMatch": 0-100 score
- "topRelevantExperience": Index of most relevant experience
- "actionVerbs": Strong action verbs from JD that could be used`;

    // Format experiences for analysis
    const experiencesText = experiences.map((exp, idx) => 
      `Experience ${idx + 1}: ${exp.role || exp.jobTitle || ''} at ${exp.company || ''} - "${exp.desc || exp.description || ''}"`
    ).join('\n');

    const userPrompt = `Analyze these professional experiences against the job description. Suggest how to rewrite each one to highlight relevant skills:

EXPERIENCES:
${experiencesText}

JOB DESCRIPTION:
"${jobDescription.trim()}"

For each experience, suggest rewording that uses JD keywords and action verbs while staying truthful to actual responsibilities.`;

    const response = await client.chat.completions.create({
      model: process.env.PROFESSION_MODEL || 'gpt-4o-mini',
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
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 1200
    });

    const responseText = response.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(responseText);
    const inputCost = response.usage.prompt_tokens * 0.00000015;
    const outputCost = response.usage.completion_tokens * 0.0000006;

    return {
      success: true,
      section: 'experiences',
      count: experiences.length,
      analysis: result,
      tokensUsed: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      estimatedCost: `$${(inputCost + outputCost).toFixed(6)}`
    };
  } catch (error) {
    console.error('❌ Error analyzing experiences:', error.message);
    throw error;
  }
};

/**
 * Analyze skills against job description
 * Identifies matching, missing, and reordering suggestions
 */
export const analyzeSkillsForJD = async (skills, jobDescription) => {
  try {
    // Check if OPENAI_API_KEY is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured for job matching');
      return {
        success: false,
        message: 'AI service is not configured. Please configure OPENAI_API_KEY in environment variables.',
        error: 'OPENAI_API_KEY not set'
      };
    }

    if (!skills || skills.length === 0 || !jobDescription) {
      return {
        success: false,
        message: 'Skills and job description are required'
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const systemPrompt = `You are a technical skills optimizer for ATS and job matching.

IMPORTANT RULES:
- DO NOT suggest adding skills the person doesn't have
- DO suggest reordering skills to prioritize JD matches first
- DO identify which of their skills are most valued in JD
- DO categorize skills as: exact match, related match, learnable gaps
- DO suggest keywords for existing skills to sound more JD-aligned

Return JSON with:
- "matchedSkills": Array of user skills that appear in JD (with relevance %)
- "relatedSkills": Array of user skills related to JD requirements
- "missingButLearnable": Array of JD skills NOT in resume (user could learn)
- "recommendedOrder": Reordered skill list prioritizing JD matches first
- "skillGaps": Important JD requirements user doesn't have
- "matchPercentage": 0-100 (how well skills align with JD)
- "note": Brief note about skill alignment`;

    const skillsText = skills.join(', ');

    const userPrompt = `Analyze these skills against the job description:

USER SKILLS:
${skillsText}

JOB DESCRIPTION:
"${jobDescription.trim()}"

Identify matching skills, suggest better ordering to emphasize JD-relevant skills first, and note any important skill gaps.`;

    const response = await client.chat.completions.create({
      model: process.env.PROFESSION_MODEL || 'gpt-4o-mini',
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
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 800
    });

    const responseText = response.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(responseText);
    const inputCost = response.usage.prompt_tokens * 0.00000015;
    const outputCost = response.usage.completion_tokens * 0.0000006;

    return {
      success: true,
      section: 'skills',
      count: skills.length,
      analysis: result,
      tokensUsed: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      estimatedCost: `$${(inputCost + outputCost).toFixed(6)}`
    };
  } catch (error) {
    console.error('❌ Error analyzing skills:', error.message);
    throw error;
  }
};

/**
 * Analyze projects against job description
 * Suggests rewording to emphasize relevant technologies/methodologies
 */
export const analyzeProjectsForJD = async (projects, jobDescription) => {
  try {
    // Check if OPENAI_API_KEY is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured for job matching');
      return {
        success: false,
        message: 'AI service is not configured. Please configure OPENAI_API_KEY in environment variables.',
        error: 'OPENAI_API_KEY not set'
      };
    }

    if (!projects || projects.length === 0 || !jobDescription) {
      return {
        success: false,
        message: 'Projects and job description are required'
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const systemPrompt = `You are an expert at aligning project descriptions with job requirements.

IMPORTANT RULES:
- DO NOT invent new technologies used in projects
- DO suggest rewriting to emphasize technologies from the JD
- DO highlight how projects demonstrate JD requirements
- DO NOT fabricate project outcomes
- DO preserve truthful project descriptions while adding relevant keywords

Return JSON with:
- "projectAnalysis": Array of analyzed projects, each with:
  - "original": Original description
  - "suggestion": Rewritten to emphasize JD-relevant tech/methodologies
  - "relevanceScore": 0-100
  - "matchedTech": Technologies from project that appear in JD
  - "relevantDemonstration": What JD requirement this project shows
- "mostRelevantProject": Index of project best aligned with JD
- "technologyMatches": Tech stack overlap between projects and JD
- "overallProjectMatch": 0-100 score
- "improvements": Key improvements for project descriptions`;

    // Format projects
    const projectsText = projects.map((proj, idx) =>
      `Project ${idx + 1}: ${proj.name || proj.projectName || ''} (${proj.type || proj.projectType || ''}) - "${proj.description || proj.desc || ''}"`
    ).join('\n');

    const userPrompt = `Analyze these projects against the job description:

PROJECTS:
${projectsText}

JOB DESCRIPTION:
"${jobDescription.trim()}"

For each project, suggest how to rewrite the description to highlight relevant technologies and methodologies from the JD.`;

    const response = await client.chat.completions.create({
      model: process.env.PROFESSION_MODEL || 'gpt-4o-mini',
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
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 1000
    });

    const responseText = response.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(responseText);
    const inputCost = response.usage.prompt_tokens * 0.00000015;
    const outputCost = response.usage.completion_tokens * 0.0000006;

    return {
      success: true,
      section: 'projects',
      count: projects.length,
      analysis: result,
      tokensUsed: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      estimatedCost: `$${(inputCost + outputCost).toFixed(6)}`
    };
  } catch (error) {
    console.error('❌ Error analyzing projects:', error.message);
    throw error;
  }
};

/**
 * Comprehensive job matcher - analyzes all resume sections
 * Returns overall match score and section-by-section suggestions
 */
export const performComprehensiveJobMatching = async (resumeData, jobDescription) => {
  try {
    const { summary, experiences, skills, projects } = resumeData;

    if (!jobDescription || jobDescription.trim().length === 0) {
      return {
        success: false,
        message: 'Job description is required'
      };
    }

    console.log('🎯 Starting comprehensive job matching...');

    // Analyze all sections in parallel
    const [summaryAnalysis, experiencesAnalysis, skillsAnalysis, projectsAnalysis] = await Promise.all([
      summary ? analyzeSummaryForJD(summary, jobDescription) : Promise.resolve(null),
      experiences && experiences.length > 0 ? analyzeExperiencesForJD(experiences, jobDescription) : Promise.resolve(null),
      skills && skills.length > 0 ? analyzeSkillsForJD(skills, jobDescription) : Promise.resolve(null),
      projects && projects.length > 0 ? analyzeProjectsForJD(projects, jobDescription) : Promise.resolve(null)
    ]);

    // Check if any analysis failed
    const failedAnalysis = [summaryAnalysis, experiencesAnalysis, skillsAnalysis, projectsAnalysis]
      .find(analysis => analysis && analysis.success === false);
    
    if (failedAnalysis) {
      console.error('❌ Job matcher analysis failed:', failedAnalysis.message);
      return {
        success: false,
        message: failedAnalysis.message,
        error: failedAnalysis.error
      };
    }

    // Calculate overall match score
    const scores = [];
    if (summaryAnalysis?.analysis?.matchScore) scores.push(summaryAnalysis.analysis.matchScore);
    if (experiencesAnalysis?.analysis?.overallExperienceMatch) scores.push(experiencesAnalysis.analysis.overallExperienceMatch);
    if (skillsAnalysis?.analysis?.matchPercentage) scores.push(skillsAnalysis.analysis.matchPercentage);
    if (projectsAnalysis?.analysis?.overallProjectMatch) scores.push(projectsAnalysis.analysis.overallProjectMatch);

    const overallMatchScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Calculate total tokens and cost
    const totalTokens = [summaryAnalysis, experiencesAnalysis, skillsAnalysis, projectsAnalysis]
      .reduce((sum, analysis) => sum + (analysis?.tokensUsed || 0), 0);

    const totalCost = [summaryAnalysis, experiencesAnalysis, skillsAnalysis, projectsAnalysis]
      .reduce((sum, analysis) => {
        if (!analysis) return sum;
        const inputCost = (analysis.promptTokens || 0) * 0.00000015;
        const outputCost = (analysis.completionTokens || 0) * 0.0000006;
        return sum + inputCost + outputCost;
      }, 0);

    console.log('✅ Job matching completed');

    return {
      success: true,
      overallMatchScore,
      analyses: {
        summary: summaryAnalysis,
        experiences: experiencesAnalysis,
        skills: skillsAnalysis,
        projects: projectsAnalysis
      },
      totalTokens,
      estimatedCost: `$${(totalCost).toFixed(6)}`,
      matchingInsights: {
        strengths: `Resume demonstrates ${overallMatchScore}% alignment with job requirements`,
        recommendation: overallMatchScore >= 70 
          ? 'Strong match - Consider applying' 
          : 'Moderate match - Implement suggestions to improve chances'
      }
    };
  } catch (error) {
    console.error('❌ Error in job matching:', error.message);
    throw error;
  }
};

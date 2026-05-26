import OpenAI from 'openai';

/**
 * Generate comprehensive job description from minimal input
 * Creates detailed description with responsibilities, achievements, and work focus
 * @param {Object} jobInfo - Job information {jobTitle, company, duration, briefDescription}
 * @returns {Promise<Object>} Detailed job description with sections
 */
export const generateJobDescription = async (jobInfo) => {
  try {
    const { jobTitle, company, duration, briefDescription } = jobInfo;

    if (!jobTitle || !company) {
      return {
        success: false,
        message: 'Job title and company are required',
        description: null
      };
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return {
        success: false,
        message: 'AI service is not configured',
        description: null,
        error: 'OPENAI_API_KEY not set'
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('💼 Generating detailed job description...');
    console.log('   Job Title:', jobTitle, '| Company:', company);

    // System prompt for generating detailed job descriptions
    const systemPrompt = `You are an expert resume writer specializing in professional experience sections. Generate a detailed and compelling job description based on the job title, company, and brief information provided.

Create a JSON response with:
- "jobTitle": The position title
- "company": Company name
- "overallDescription": A 2-3 sentence overview of the role and responsibilities
- "keyResponsibilities": Array of 4-6 bullet points describing main duties and responsibilities
- "achievements": Array of 4-6 bullet points describing measurable achievements and accomplishments
- "workFocus": Array of 3-4 key areas or technologies the person worked with
- "careerImpact": A 2-3 sentence description of how this role contributed to career growth

Make it professional, impactful, and ATS-friendly with action verbs and quantifiable results where possible.`;

    // Build user prompt with provided information
    let userPrompt = `Generate a detailed job description for:
Job Title: ${jobTitle}
Company: ${company}`;

    if (duration) {
      userPrompt += `\nDuration: ${duration}`;
    }

    if (briefDescription) {
      userPrompt += `\nBrief Description: ${briefDescription}`;
    }

    userPrompt += `\n\nCreate a comprehensive job description with key responsibilities, achievements, and work focus areas. Make it detailed and impactful.`;

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
      temperature: 0.8,
      response_format: { type: 'json_object' },
      max_tokens: 1000
    });

    const responseText = response.choices[0]?.message?.content?.trim();
    console.log('📊 Tokens used:', response.usage.total_tokens);
    console.log('   Input tokens:', response.usage.prompt_tokens, '| Output tokens:', response.usage.completion_tokens);

    if (!responseText) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(responseText);

    // Calculate cost using correct GPT-4o-mini pricing
    // Input: $0.15 per 1M tokens = $0.00000015 per token
    // Output: $0.60 per 1M tokens = $0.0000006 per token
    const inputCost = response.usage.prompt_tokens * 0.00000015;
    const outputCost = response.usage.completion_tokens * 0.0000006;
    const totalCost = inputCost + outputCost;

    console.log('✅ Job description generated successfully');

    return {
      success: true,
      input: jobInfo,
      description: result,
      tokensUsed: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      estimatedCost: `$${(totalCost).toFixed(6)}`
    };
  } catch (error) {
    console.error('❌ Error generating job description:', error.message);
    throw error;
  }
};

/**
 * Enhance professional experience description with AI
 * Adds action verbs, metrics, and professional language
 * @param {string} experienceText - Current job description/duties
 * @returns {Promise<Object>} Enhanced description with suggestions
 */
export const enhanceExperienceDescription = async (experienceText) => {
  try {
    if (!experienceText || experienceText.trim().length === 0) {
      return {
        success: false,
        message: 'Experience description cannot be empty',
        enhanced: null
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('💼 Enhancing experience description...');
    console.log('   Input length:', experienceText.length, 'characters');

    // System prompt with diverse action verb guidance
    const systemPrompt = `You are an expert resume writer specializing in compelling professional experience descriptions.

When enhancing, use VARIED action verbs and opening structures to avoid repetition:
- Leadership: "Spearheaded", "Orchestrated", "Architected", "Championed"
- Technical: "Engineered", "Developed", "Built", "Implemented", "Designed"
- Collaboration: "Partnered with", "Collaborated with", "Led cross-functional teams"
- Results: "Delivered", "Launched", "Executed", "Accelerated"
- Optimization: "Streamlined", "Refined", "Enhanced", "Improved", "Optimized"

Requirements:
- Vary action verbs across bullet points (never repeat the same verb in adjacent bullets)
- Include quantifiable metrics and business impact
- Natural ATS keywords (don't force corporate jargon)
- 1-2 sentences per bullet point
- Show progression and measurable outcomes

Return JSON: {"enhanced":"improved description","improvements":["imp1","imp2","imp3"],"action_verbs_used":["verb1","verb2"]}`;

    // User prompt with explicit diversity requirement
    const userPrompt = `Enhance this professional experience description with VARIED action verbs and language:
"${experienceText.trim()}"

IMPORTANT: Use diverse opening verbs. Don't use "Developed" or "Spearheaded" multiple times. Make it compelling and metrics-driven.`;

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
      temperature: 0.8, // Higher for more creative action verb variation
      response_format: { type: 'json_object' },
      max_tokens: 400
    });

    const responseText = response.choices[0]?.message?.content?.trim();
    console.log('📊 Tokens used:', response.usage.total_tokens);
    console.log('   Input tokens:', response.usage.prompt_tokens, '| Output tokens:', response.usage.completion_tokens);

    if (!responseText) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(responseText);

    // Calculate cost using correct GPT-4o-mini pricing
    // Input: $0.15 per 1M tokens = $0.00000015 per token
    // Output: $0.60 per 1M tokens = $0.0000006 per token
    const inputCost = response.usage.prompt_tokens * 0.00000015;
    const outputCost = response.usage.completion_tokens * 0.0000006;
    const totalCost = inputCost + outputCost;

    console.log('✅ Experience description enhanced successfully');

    return {
      success: true,
      original: experienceText,
      enhanced: result.enhanced,
      improvements: result.improvements || [],
      tokensUsed: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      estimatedCost: `$${(totalCost).toFixed(6)}`
    };
  } catch (error) {
    console.error('❌ Error enhancing experience:', error.message);
    throw error;
  }
};

/**
 * Batch enhance multiple experience descriptions
 * @param {Array} descriptions - Array of experience description texts
 * @returns {Promise<Object>} Enhanced descriptions with cost tracking
 */
export const batchEnhanceExperiences = async (descriptions) => {
  try {
    console.log(`🔄 Batch enhancing ${descriptions.length} experience descriptions...`);

    const results = await Promise.all(
      descriptions.map((descriptionText) =>
        enhanceExperienceDescription(descriptionText)
      )
    );

    const totalTokens = results.reduce(
      (sum, r) => sum + (r.tokensUsed || 0),
      0
    );

    // Calculate total cost from individual results
    const totalCostAmount = results.reduce(
      (sum, r) => {
        const inputCost = (r.promptTokens || 0) * 0.00000015;
        const outputCost = (r.completionTokens || 0) * 0.0000006;
        return sum + inputCost + outputCost;
      },
      0
    );

    return {
      success: true,
      count: results.length,
      enhanced: results,
      totalTokens,
      totalCost: `$${(totalCostAmount).toFixed(6)}`
    };
  } catch (error) {
    console.error('❌ Batch enhancement error:', error.message);
    throw error;
  }
};

import OpenAI from 'openai';

/**
 * Enhance professional summary with AI - simple, pure AI response
 * @param {string} summaryText - The professional summary text to enhance
 * @returns {Promise<Object>} Enhanced summary with suggestions
 */
export const enhanceProfessionalSummary = async (summaryText) => {
  try {
    if (!summaryText || summaryText.trim().length === 0) {
      return {
        success: false,
        message: 'Professional summary cannot be empty',
        enhanced: null
      };
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return {
        success: false,
        message: 'AI service is not configured',
        enhanced: null,
        error: 'OPENAI_API_KEY not set'
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('✍️ Enhancing professional summary...');
    console.log('   Input length:', summaryText.length, 'characters');

    // System prompt with diversity guidance
    const systemPrompt = `You are an expert resume writer specializing in diverse, unique professional summaries. 

When enhancing, AVOID repetitive opening phrases like "Results-driven". Instead, use varied sentence starters:
- "Passionate about..." 
- "Experienced in..."
- "Skilled at crafting..."
- "Known for designing..."
- "Expert in building..."
- Role-based: "Full-stack developer specializing in..."
- Impact-based: "Dedicated to creating..."

Enhance for:
- Unique voice and personality (avoid generic corporate speak)
- ATS-friendly keywords naturally woven in
- 2-3 sentences maximum
- Achievement-focused without overused phrases
- Industry-specific language

Return JSON: {"enhanced":"improved summary","improvements":["improvement1","improvement2","improvement3"],"opening_style":"the opening approach used"}`;

    // User prompt with explicit diversity guidance
    const userPrompt = `Enhance this professional summary with a UNIQUE and VARIED opening (avoid "Results-driven" and other common phrases):
"${summaryText.trim()}"

Make it distinctive, professional, and show personality while staying ATS-optimized.`;

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
      temperature: 0.8, // Slightly higher for more creative variation in opening phrases
      response_format: { type: 'json_object' },
      max_tokens: 350
    });

    const responseText = response.choices[0]?.message?.content?.trim();
    console.log('📊 Tokens used:', response.usage.total_tokens);

    if (!responseText) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(responseText);

    console.log('✅ Summary enhanced successfully');

    return {
      success: true,
      original: summaryText,
      enhanced: result.enhanced,
      improvements: result.improvements || [],
      tokensUsed: response.usage.total_tokens,
      estimatedCost: `$${(response.usage.total_tokens * 0.00015).toFixed(5)}`
    };
  } catch (error) {
    console.error('❌ Error enhancing summary:', error.message);
    throw error;
  }
};

/**
 * Batch enhance multiple summaries
 * @param {Array} summaries - Array of summary text strings
 * @returns {Promise<Object>} Enhanced summaries with cost tracking
 */
export const batchEnhanceSummaries = async (summaries) => {
  try {
    console.log(`🔄 Batch enhancing ${summaries.length} summaries...`);

    const results = await Promise.all(
      summaries.map((summaryText) =>
        enhanceProfessionalSummary(summaryText)
      )
    );

    const totalTokens = results.reduce(
      (sum, r) => sum + (r.tokensUsed || 0),
      0
    );

    return {
      success: true,
      count: results.length,
      enhanced: results,
      totalTokens,
      totalCost: `$${(totalTokens * 0.00015).toFixed(4)}`
    };
  } catch (error) {
    console.error('❌ Batch enhancement error:', error.message);
    throw error;
  }
};

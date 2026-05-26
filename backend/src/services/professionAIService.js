import OpenAI from 'openai';

/**
 * Generate profession recommendations using RAG-based approach
 * @param {string} professionInput - The profession input by user
 * @returns {Promise<Object>} Object with 4 profession recommendations
 */
export const generateProfessionRecommendations = async (professionInput) => {
  try {
    if (!professionInput || professionInput.trim().length === 0) {
      return {
        success: false,
        message: 'Profession input cannot be empty',
        recommendations: []
      };
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured in environment');
      return {
        success: false,
        message: 'AI service is not configured. Please contact support.',
        recommendations: [],
        error: 'OPENAI_API_KEY not set in environment variables'
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('🤖 AI Call for profession:', professionInput);
    console.log('📊 Using gpt-4o-mini for better reliability');

    // Clean, efficient prompt - gpt-4o-mini handles this perfectly
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Switch from gpt-5-nano to gpt-4o-mini
      messages: [
        {
          role: 'system',
          content: 'You are a career advisor. Generate 4 relevant job title recommendations for career progression. Return JSON: {"recommendations":["title1","title2","title3","title4"]}'
        },
        {
          role: 'user',
          content: `Generate 4 realistic career progression titles for someone in: "${professionInput}"`
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 200
    });

    const responseText = response.choices[0]?.message?.content?.trim();
    console.log('✅ AI Response received, tokens:', response.usage.total_tokens);

    if (!responseText) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(responseText);
    const recommendations = result.recommendations || [];

    console.log('📋 AI Recommendations:', recommendations);

    return {
      success: true,
      original_profession: professionInput,
      recommendations: recommendations.slice(0, 4),
      explanation: 'AI-generated career progression recommendations',
      model: 'gpt-4-mini',
      tokensUsed: response.usage.total_tokens,
      estimatedCost: `$${(response.usage.total_tokens * 0.00015).toFixed(5)}`
    };

  } catch (error) {
    console.error('❌ Error generating profession recommendations:', error.message);
    return {
      success: false,
      message: error.message,
      recommendations: [],
      error: error.message
    };
  }
};

export default {
  generateProfessionRecommendations
};

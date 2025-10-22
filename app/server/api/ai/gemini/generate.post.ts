/**
 * Server API for Google Gemini Content Generation
 * Free tier: 60 requests per minute
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { prompt, category } = await readBody(event);

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Gemini API key is not configured'
    });
  }

  if (!prompt) {
    throw createError({
      statusCode: 400,
      message: 'Prompt is required'
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      content: text,
      provider: 'gemini',
      category: category || null
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Failed to generate content with Gemini'
    });
  }
});


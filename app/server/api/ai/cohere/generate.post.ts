/**
 * Server API for Cohere Content Generation using Chat API
 * Free tier: 1000 API calls per month
 */

import { CohereClient } from 'cohere-ai';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { prompt } = await readBody(event);

  if (!config.cohereApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Cohere API key is not configured'
    });
  }

  if (!prompt) {
    throw createError({
      statusCode: 400,
      message: 'Prompt is required'
    });
  }

  try {
    const cohere = new CohereClient({
      token: config.cohereApiKey
    });

    // Use Chat API with the current available model
    const response = await cohere.chat({
      message: prompt,
      model: 'command-a-03-2025',
      temperature: 0.7,
      maxTokens: 300
    });

    return {
      success: true,
      content: response.text.trim(),
      provider: 'cohere'
    };
  } catch (error: any) {
    console.error('Cohere API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate content with Cohere'
    });
  }
});


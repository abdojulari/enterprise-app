/**
 * Server API for Hugging Face Content Generation
 * Free tier: 30,000 input characters per month
 */

import { HfInference } from '@huggingface/inference';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { prompt, model } = await readBody(event);

  if (!config.huggingfaceApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Hugging Face API key is not configured'
    });
  }

  if (!prompt) {
    throw createError({
      statusCode: 400,
      message: 'Prompt is required'
    });
  }

  try {
    const hf = new HfInference(config.huggingfaceApiKey);
    
    // Use Meta's Llama model with chat completion
    const modelName = model || 'meta-llama/Llama-3.2-1B-Instruct';

    const response = await hf.chatCompletion({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const text = response.choices[0]?.message?.content || '';

    return {
      success: true,
      content: text.trim(),
      provider: 'huggingface',
      model: modelName
    };
  } catch (error: any) {
    console.error('Hugging Face API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate content with Hugging Face'
    });
  }
});


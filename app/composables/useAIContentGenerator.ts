/**
 * Composable for AI Content Generation using Free Tier APIs
 * Supports: Google Gemini, Cohere, and Hugging Face
 */

export const useAIContentGenerator = () => {
  const config = useRuntimeConfig();

  /**
   * Generate content using Google Gemini (Most generous free tier)
   * Free tier: 60 requests per minute
   */
  const generateWithGemini = async (prompt: string, category?: string) => {
    try {
      const response = await $fetch('/api/ai/gemini/generate', {
        method: 'POST',
        body: {
          prompt,
          category
        }
      });
      return response;
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  };

  /**
   * Generate content using Cohere
   * Free tier: 100 API calls/month
   */
  const generateWithCohere = async (prompt: string) => {
    try {
      const response = await $fetch('/api/ai/cohere/generate', {
        method: 'POST',
        body: { prompt }
      });
      return response;
    } catch (error) {
      console.error('Cohere generation error:', error);
      throw error;
    }
  };

  /**
   * Generate content using Hugging Face
   * Free tier: 30,000 input characters/month
   */
  const generateWithHuggingFace = async (prompt: string, model?: string) => {
    try {
      const response = await $fetch('/api/ai/huggingface/generate', {
        method: 'POST',
        body: {
          prompt,
          model: model || 'mistralai/Mistral-7B-Instruct-v0.2'
        }
      });
      return response;
    } catch (error) {
      console.error('Hugging Face generation error:', error);
      throw error;
    }
  };

  /**
   * Smart fallback: Try Gemini first, fallback to others if it fails
   */
  const generateContent = async (prompt: string, category?: string) => {
    try {
      // Try Gemini first (best free tier)
      return await generateWithGemini(prompt, category);
    } catch (error) {
      console.warn('Gemini failed, trying Cohere...');
      try {
        return await generateWithCohere(prompt);
      } catch (error2) {
        console.warn('Cohere failed, trying Hugging Face...');
        return await generateWithHuggingFace(prompt);
      }
    }
  };

  /**
   * Generate social media post content
   */
  const generateSocialPost = async (topic: string, platform: 'facebook' | 'threads' | 'both') => {
    const maxLength = platform === 'threads' ? 400 : 1200;
    const prompt = `Write a ${platform} post about ${topic}.
Requirements:
- Maximum ${maxLength} characters
- Engaging and conversational tone
- Include 3-5 relevant hashtags
- Keep it concise and valuable

Write ONLY the post content, nothing else.`;
    
    return await generateContent(prompt);
  };

  /**
   * Generate real estate tip (specific to your use case)
   */
  const generateRealEstateTip = async (category: string) => {
    const prompt = `Write ONE short real estate tip about ${category}.
Requirements:
- Maximum 200 characters
- Actionable and practical
- For homebuyers or sellers

Write ONLY the tip, nothing else.`;
    
    return await generateContent(prompt, category);
  };

  /**
   * Generate marketing copy
   */
  const generateMarketingCopy = async (product: string, tone: 'professional' | 'casual' | 'exciting') => {
    const prompt = `Write ${tone} marketing copy for ${product}.
Requirements:
- Maximum 250 characters
- Compelling and conversion-focused
- Include a clear call-to-action

Write ONLY the marketing copy, nothing else.`;
    
    return await generateContent(prompt);
  };

  return {
    generateWithGemini,
    generateWithCohere,
    generateWithHuggingFace,
    generateContent,
    generateSocialPost,
    generateRealEstateTip,
    generateMarketingCopy
  };
};



import axios from 'axios';

export interface AIResponse {
  reflection: string;
  error?: string;
}

export const AIService = {
  async getReflection(text: string, apiKey: string): Promise<AIResponse> {
    try {
      if (!apiKey) {
        return {
          reflection: '',
          error: 'API key is required'
        };
      }
      
      if (!text.trim()) {
        return {
          reflection: '',
          error: 'No text provided for analysis'
        };
      }
      
      const systemPrompt = `You are a thoughtful writing assistant. Provide a brief (150-200 word) reflection on the following freewriting session. 
      Focus on identifying themes, emotional undercurrents, and potential directions for further development. 
      Be encouraging and insightful. This was written in a "freewrite" session where the writer couldn't delete text.`;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      const reflection = response.data.choices[0]?.message?.content || '';
      
      return {
        reflection
      };
    } catch (error) {
      console.error('Error getting AI reflection:', error);
      
      let errorMessage = 'Failed to get AI reflection';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Invalid API key. Please check and try again.';
        } else if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        }
      }
      
      return {
        reflection: '',
        error: errorMessage
      };
    }
  }
};

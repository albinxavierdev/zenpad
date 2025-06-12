import axios from 'axios';
import { StorageService } from './StorageService';

export interface WritingMetrics {
  wordCount: number;
  characterCount: number;
  paragraphs: number;
  typingSpeed: number; // words per minute
  timeTaken: number;
  avgWordsPerSentence: number;
  avgSentenceLength: number;
  uniqueWords: number;
  repetitionRate: number;
  grammarErrors: number;
  passiveVoicePercent: number;
}

export interface WritingAnalysis {
  metrics: WritingMetrics;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: string[];
  reflection: string;
}

export interface AIResponse {
  analysis: WritingAnalysis;
  error?: string;
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const AIService = {
  calculateMetrics(text: string, duration: number): WritingMetrics {
    const cleanText = text.trim();
    const words = cleanText.split(/\s+/).filter(Boolean);
    const characters = cleanText.replace(/\s+/g, '').length;
    const paragraphs = cleanText.split(/\n\s*\n/).filter(Boolean).length || 1;
    const typingSpeed = duration > 0 ? Math.round((characters / 5) / duration) : 0;
    const timeTaken = duration;
    // Sentence metrics
    const sentencesArr: string[] = Array.from(cleanText.match(/[^.!?]+[.!?]+/g) || []);
    const avgWordsPerSentence = sentencesArr.length > 0 ? words.length / sentencesArr.length : words.length;
    const avgSentenceLength = sentencesArr.length > 0 ? sentencesArr.reduce((acc: number, s: string) => acc + s.trim().split(/\s+/).filter(Boolean).length, 0) / sentencesArr.length : words.length;
    // Unique words
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    // Repetition rate
    const wordCounts: Record<string, number> = {};
    words.forEach(w => {
      const lw = w.toLowerCase();
      wordCounts[lw] = (wordCounts[lw] || 0) + 1;
    });
    const repetitionRate = words.length > 0 ? Math.max(...Object.values(wordCounts)) / words.length : 0;
    // Grammar errors and passive voice (set to 0 for now)
    const grammarErrors = 0;
    const passiveVoicePercent = 0;
    return {
      wordCount: words.length,
      characterCount: characters,
      paragraphs,
      typingSpeed,
      timeTaken,
      avgWordsPerSentence,
      avgSentenceLength,
      uniqueWords,
      repetitionRate,
      grammarErrors,
      passiveVoicePercent
    };
  },

  async getReflection(text: string, duration: number): Promise<AIResponse> {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.");
      }
      if (!text.trim()) {
        return {
          analysis: null,
          error: 'No text provided for analysis'
        };
      }
      const metrics = this.calculateMetrics(text, duration);
      const systemPrompt = `You are an expert writing analyst for Zenpad. Here are the backend-calculated metrics for this session:\n\n${JSON.stringify(metrics, null, 2)}\n\nThe user's writing is provided below. Your job is to provide a highly personalized, precise, and actionable analysis.\n\nInstructions:\n- Reference specific phrases, ideas, or stylistic choices from the user's actual writing in your qualitative analysis and suggestions.\n- Tailor your feedback to the user's apparent intent, tone, and writing context.\n- Avoid generic advice; make all comments and suggestions as specific and actionable as possible, based on the actual content provided.\n- Use a warm, encouraging, and expert tone throughout.\n\nPlease do the following:\n1. Calculate and add the following readability metrics: Flesch-Kincaid Grade Level, Flesch Reading Ease Score, Gunning Fog Index, SMOG Index.\n2. Provide a qualitative analysis of the writing, including: clarity, coherence, toneAndVoice, engagement, purposeFulfillment, creativity, grammarAndSyntax, structureAndFormat.\n3. Suggest 2-4 specific, constructive improvements for their writing.\n4. Write a short, thoughtful reflection on the user's content—respond as if in conversation, offering insight, perspective, or a follow-up question based on what was actually written.\n\nRespond ONLY with a valid JSON object in the following format:\n{\n  "metrics": {\n    "wordCount": 0,\n    "characterCount": 0,\n    "paragraphs": 0,\n    "typingSpeed": 0,\n    "timeTaken": 0,\n    "avgWordsPerSentence": 0,\n    "avgSentenceLength": 0,\n    "uniqueWords": 0,\n    "repetitionRate": 0,\n    "grammarErrors": 0,\n    "passiveVoicePercent": 0,\n    "fleschKincaidGrade": 0,\n    "fleschReadingEase": 0,\n    "gunningFogIndex": 0,\n    "smogIndex": 0\n  },\n  "qualitative": {\n    "clarity": "string",\n    "coherence": "string",\n    "toneAndVoice": "string",\n    "engagement": "string",\n    "purposeFulfillment": "string",\n    "creativity": "string",\n    "grammarAndSyntax": "string",\n    "structureAndFormat": "string"\n  },\n  "suggestions": ["string", ...],\n  "reflection": "string"\n}\n\nDo not include any explanation, markdown, or text outside the JSON object.\n\nUser's writing:\n"""\n${text}\n"""`;
      const response = await this.getGeminiReflection(text, systemPrompt);
      if (response.error) {
        return { analysis: null, error: response.error };
      }
      let analysis;
      try {
        analysis = JSON.parse(response.reflection);
      } catch (error) {
        const match = response.reflection.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            analysis = JSON.parse(match[0]);
          } catch (e) {
            return {
              analysis: null,
              error: 'Failed to parse AI analysis. Raw response: ' + response.reflection
            };
          }
        } else {
          return {
            analysis: null,
            error: 'Failed to parse AI analysis. Raw response: ' + response.reflection
          };
        }
      }
      return {
        analysis: analysis
      };
    } catch (error) {
      let errorMessage = 'Failed to get AI reflection';
      return {
        analysis: null,
        error: errorMessage
      };
    }
  },

  async getGeminiReflection(text: string, systemPrompt: string): Promise<{ reflection: string; error?: string }> {
    console.log('Using Google Gemini API for reflection');
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.");
    }

    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              { text: systemPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1000
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const reflection = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!reflection) {
      throw new Error('No reflection generated from the AI model');
    }
    
    return {
      reflection
    };
  }
};

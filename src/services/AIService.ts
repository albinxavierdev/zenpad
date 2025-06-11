import axios from 'axios';
import { StorageService } from './StorageService';

export interface WritingMetrics {
  wordCount: number;
  characterCount: number;
  averageWordLength: number;
  sentences: number;
  paragraphs: number;
  typingSpeed: number; // words per minute
  uniqueWords: number;
  vocabularyDiversity: number; // unique words / total words
  timeElapsed: number; // actual time spent writing in minutes
  timeLimit: number; // session time limit in minutes
  completionRate: number; // percentage of time limit used
  wordsPerMinute: number;
  charactersPerMinute: number;
  averageSentenceLength: number;
  sentenceLengthStdDev: number;
  mostRepeatedWords: string[];
  longestStreak: number; // in minutes, if possible
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
    const sentencesArr = cleanText.match(/[^.!?]+[.!?]+/g) || [];
    const sentences = sentencesArr.length || 1;
    const paragraphs = cleanText.split(/\n\s*\n/).filter(Boolean).length || 1;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const timeLimit = duration;
    const timeElapsed = Math.min(duration, Math.ceil(words.length / 5));
    const completionRate = Math.min(100, (timeElapsed / timeLimit) * 100);
    const effectiveTime = Math.max(timeElapsed, timeLimit);
    const typingSpeed = Math.round((words.length / effectiveTime) * 60);
    const averageWordLength = words.length > 0 ? characters / words.length : 0;
    const vocabularyDiversity = words.length > 0 ? uniqueWords / words.length : 0;
    const wordsPerMinute = Math.round((words.length / timeLimit) * 60);
    const charactersPerMinute = Math.round((characters / timeLimit) * 60);
    // Average sentence length
    const sentenceLengths = sentencesArr.map(s => s.trim().split(/\s+/).filter(Boolean).length);
    const averageSentenceLength = sentenceLengths.length > 0 ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length : 0;
    // Sentence length std dev
    const mean = averageSentenceLength;
    const sentenceLengthStdDev = sentenceLengths.length > 0 ? Math.sqrt(sentenceLengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / sentenceLengths.length) : 0;
    // Most repeated words (excluding stopwords)
    const stopwords = new Set(["the","is","in","at","of","a","and","to","it","for","on","with","as","by","an","be","this","that","from","or","are","was","but","not","have","has","had","were","they","you","we","he","she","his","her","their","my","our","your","so","if","out","up","about","who","what","when","where","why","how"]);
    const wordCounts: Record<string, number> = {};
    words.forEach(w => {
      const lw = w.toLowerCase();
      if (!stopwords.has(lw)) {
        wordCounts[lw] = (wordCounts[lw] || 0) + 1;
      }
    });
    const mostRepeatedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    // Longest uninterrupted writing streak (not implemented, set to 0)
    const longestStreak = 0;
    return {
      wordCount: words.length,
      characterCount: characters,
      averageWordLength,
      sentences,
      paragraphs,
      typingSpeed,
      uniqueWords,
      vocabularyDiversity,
      timeElapsed,
      timeLimit,
      completionRate,
      wordsPerMinute,
      charactersPerMinute,
      averageSentenceLength,
      sentenceLengthStdDev,
      mostRepeatedWords,
      longestStreak
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
      const systemPrompt = `You are an AI writing analyst for Zenpad. Here are the backend-calculated metrics for this session:\n\n- Word count: ${metrics.wordCount}\n- Typing speed: ${metrics.typingSpeed} wpm\n- Average sentence length: ${metrics.averageSentenceLength.toFixed(1)} words\n- Sentence length variation: ${metrics.sentenceLengthStdDev.toFixed(1)}\n- Type-token ratio: ${metrics.vocabularyDiversity.toFixed(2)}\n- Most repeated words: [${metrics.mostRepeatedWords.join(", ")}]\n- Number of paragraphs: ${metrics.paragraphs}\n- Longest uninterrupted writing streak: ${metrics.longestStreak} minutes\n\nPlease analyze the writing using these metrics, and provide:\n1. Overall summary (tone, clarity, structure, type)\n2. Strengths (3–5, with technical focus)\n3. Areas for improvement (3–5, with technical explanations)\n4. Writing metrics (repeat the above, and add passive voice % and Flesch-Kincaid grade if you can)\n5. Actionable recommendations (3–5, specific and measurable)\n\nRespond ONLY with a valid JSON object in the following format:\n\n{\n  "summary": "string",\n  "strengths": ["string", ...],\n  "areasForImprovement": ["string", ...],\n  "metrics": {\n    "wordCount": 0,\n    "typingSpeed": 0,\n    "averageSentenceLength": 0,\n    "sentenceLengthStdDev": 0,\n    "typeTokenRatio": 0,\n    "mostRepeatedWords": ["string", ...],\n    "paragraphs": 0,\n    "longestStreak": 0,\n    "passiveVoicePercent": 0,\n    "fleschKincaidGrade": 0\n  },\n  "recommendations": ["string", ...]\n}\n\nDo not include any explanation, markdown, or text outside the JSON object.`;
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
        analysis: {
          metrics,
          ...analysis
        }
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

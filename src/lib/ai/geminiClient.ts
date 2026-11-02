import { GoogleGenAI } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export function getGeminiApiKey(explicitKey?: string): string | undefined {
  return explicitKey || process.env.GEMINI_API_KEY;
}

export function createGeminiClient(apiKey?: string): GoogleGenAI | null {
  const key = getGeminiApiKey(apiKey);
  if (!key) {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
}

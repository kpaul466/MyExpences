import { GoogleGenAI } from '@google/genai';

export const getSmartCategorization = async (note: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Categorize this expense note into a single short category name (e.g., Food, Transport, Utilities, Entertainment, Health, Shopping): "${note}"`,
    });
    return response.text?.trim() || 'General';
  } catch (error) {
    console.error('Error categorizing:', error);
    return 'General';
  }
};

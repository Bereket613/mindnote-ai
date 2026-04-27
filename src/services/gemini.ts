import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const geminiService = {
  async generateResponse(prompt: string, systemInstruction?: string) {
    if (!ai) return "AI Assistant is not configured. Please add GEMINI_API_KEY to your secrets.";
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
        },
      });
      return response.text || "No response generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "An error occurred while calling the AI. Please try again.";
    }
  },
  
  async summarizeDiary(entries: any[]) {
    const text = entries.map(e => `${e.title}: ${e.content}`).join('\n\n');
    return this.generateResponse(
      `Please summarize these diary entries and identify the overall mood trends and key themes:\n\n${text}`,
      "You are a helpful life coach assistant. Summarize the user's diary entries and provide insights."
    );
  },
  
  async analyzeMood(entries: any[]) {
    if (!ai) return [40, 60, 100, 70, 85, 30, 45]; // fallback
    const text = entries.map(e => `Mood: ${e.mood}, Content: ${e.content}`).join('\n');
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these entries and return exactly a JSON array of 7 numbers (0-100) representing mood over the past 7 days based on this data. If not enough data, pad with averages. Just output the array like [50, 60, 70, 80, 90, 85, 95] without any markdown ticks:\n\n${text}`,
        config: {
          systemInstruction: "You are a data analyzer. Output strictly a JSON array of 7 numbers.",
          responseMimeType: "application/json"
        },
      });
      const data = JSON.parse(response.text || "[]");
      return Array.isArray(data) && data.length === 7 ? data : [40, 60, 100, 70, 85, 30, 45];
    } catch {
      return [40, 60, 100, 70, 85, 30, 45];
    }
  }
};

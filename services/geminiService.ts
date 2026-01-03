
import { GoogleGenAI } from "@google/genai";
import { DayPlan, TripContext, GroundingSource } from "../types";

/**
 * Service to generate travel suggestions using Gemini API.
 * Uses Google Search grounding to provide up-to-date recommendations.
 */
export const generateSuggestions = async (
  currentPlan: DayPlan[],
  context: TripContext,
  targetDate: string
): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-3-flash-preview";
    
    const existingItineraryStr = currentPlan
      .map(day => {
        const items = day.items.filter(i => i.status === 'FIXED');
        if (items.length === 0) return `Date: ${day.date} (No fixed plans yet)`;
        return `Date: ${day.date}\nActivities: ${items.map(i => `${i.time}: ${i.activity} @ ${i.location}`).join(', ')}`;
      })
      .join('\n\n');

    const prompt = `
      You are a specialized Korea travel expert. The user is traveling to Korea in January 2026.
      
      Context:
      Destination: ${context.destination}
      Preferences: ${context.preferences.join(', ')}
      Existing Fixed Itinerary:
      ${existingItineraryStr}
      
      Please provide 3 specific travel suggestions for ${targetDate}.
      Include: Attraction name, reason for recommendation (latest trends for 2026), and suggested duration.
      Respond primarily in Korean with English subtitles or translations in parentheses. Keep the tone professional but enthusiastic.
      NO CHINESE CHARACTERS.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.8,
      },
    });

    const text = response.text || "AI could not generate suggestions at this time.";
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = chunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Reference",
        uri: chunk.web?.uri || ""
      }));

    return { text, sources };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { text: "❌ AI Connection Failed. Please check your network or API key.", sources: [] };
  }
};

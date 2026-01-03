
import { GoogleGenAI } from "@google/genai";
import { DayPlan, TripContext, GroundingSource } from "../types";

// Always use named parameter for apiKey and use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSuggestions = async (
  currentPlan: DayPlan[],
  context: TripContext,
  targetDate: string
): Promise<{ text: string; sources: GroundingSource[] }> => {
  const model = "gemini-3-flash-preview";
  
  const existingItineraryStr = currentPlan
    .map(day => `日期: ${day.date}\n活動: ${day.items.filter(i => i.status === 'FIXED').map(i => `${i.time}: ${i.activity} 在 ${i.location}`).join(', ')}`)
    .join('\n\n');

  const prompt = `
    你是一位專業的韓國旅遊顧問。使用者即將在 1/9 前往韓國。
    
    旅遊資訊：
    目的地：${context.destination}
    日期：${context.startDate} 開始，共 ${context.duration} 天
    偏好：${context.preferences.join(', ')}
    
    目前的行程：
    ${existingItineraryStr}
    
    任務：
    請針對 ${targetDate} 這個尚未排定的空檔提供建議。
    請確保建議內容：
    1. 符合使用者的風格 (${context.preferences.join(', ')})。
    2. 地理位置合理（考慮當天已有的行程）。
    3. 包含 2024/2025 的最新趨勢（例如：聖水洞快閃店、漢南洞新開的咖啡廳、目前的冬季慶典）。
    
    請提供 3-4 個具體的建議，並以「繁體中文」回答。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract text directly using the .text property
    const text = response.text || "找不到相關建議。";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = chunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "參考連結",
        uri: chunk.web?.uri || ""
      }));

    return { text, sources };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "生成建議時發生錯誤，請檢查網路連線。", sources: [] };
  }
};

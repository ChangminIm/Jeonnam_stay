
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, RecommendedRoute } from "./types";

export const generateYeosuRoute = async (prefs: UserPreferences): Promise<RecommendedRoute> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `당신은 전남 여행 전문 AI입니다. 
  사용자 취향(${prefs.style})에 맞춰 전남 도시 중 한 곳을 선정하고 코스를 짭니다.
  속도를 위해 답변은 매우 간결하게 JSON으로만 합니다.
  - travelTimeFromPrevious: "차량 15분" 또는 "도보 5분" 형태
  - alternativeSpot: 해당 날짜 테마와 어울리는 대안 장소 1개 추가
  - naverLink: https://search.naver.com/search.naver?query=장소명`;

  const prompt = `Style:${prefs.style}, Days:${prefs.duration}. Create a high-density travel report with travel times and 1 alternative per day. Optimize for output speed.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0, // 속도와 일관성을 위해 0으로 설정
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            selectedCity: { type: Type.STRING },
            trendingScore: { type: Type.NUMBER },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  theme: { type: Type.STRING },
                  spots: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        category: { type: Type.STRING },
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER },
                        naverLink: { type: Type.STRING },
                        travelTimeFromPrevious: { type: Type.STRING }
                      },
                      required: ["name", "description", "lat", "lng", "naverLink"]
                    }
                  },
                  alternativeSpot: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      category: { type: Type.STRING },
                      naverLink: { type: Type.STRING }
                    }
                  }
                },
                required: ["day", "theme", "spots"]
              }
            }
          },
          required: ["title", "summary", "selectedCity", "days"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Gemini Speed Mode Error:", e);
    throw new Error("분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
  }
};

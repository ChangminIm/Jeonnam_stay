
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, RecommendedRoute } from "./types";

export const generateYeosuRoute = async (prefs: UserPreferences): Promise<RecommendedRoute> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `당신은 전라남도(여수, 순천, 목포, 담양) 여행 전문 AI입니다.
  최근 10개의 유튜브 브이로그에서 가장 핫한 장소들을 분석하여 사용자 취향(${prefs.style})에 맞는 여행을 설계하세요.
  
  필수 포함 사항:
  1. 각 장소 사이의 예상 이동 시간 (travelTimeFromPrevious).
  2. 각 날짜 하단에 해당 테마와 어울리는 대안 장소 (alternativeSpot) 1개.
  3. 리포트 요약 처음에 "최신 브이로그 10건을 분석한 결과..."라는 문구 포함.
  4. 답변은 반드시 유효한 JSON 형식이어야 하며, 속도를 위해 매우 간결하고 명확하게 작성하세요.`;

  const prompt = `Style: ${prefs.style}, Duration: ${prefs.duration} days. 
  여수 또는 주변 전남 도시를 선정해 최신 트렌드가 반영된 동선을 짜주세요. 
  이동 시간과 대안 스팟을 포함한 고밀도 리포트가 필요합니다.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            selectedCity: { type: Type.STRING },
            trendingScore: { type: Type.NUMBER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    console.error("AI Logic Error:", e);
    throw new Error("분석 서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.");
  }
};

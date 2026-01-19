
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, RecommendedRoute } from "./types";

export const generateYeosuRoute = async (prefs: UserPreferences): Promise<RecommendedRoute> => {
  // 최신 GoogleGenAI 인스턴스 생성
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `당신은 대한민국 전라남도 여행 전문가입니다. 
  사용자의 취향(${prefs.style})과 일정(${prefs.duration}일)에 맞춰 '여수, 순천, 목포, 담양' 중 가장 적합한 도시 한 곳을 선정하세요.
  응답은 반드시 JSON이어야 하며, 다음을 포함해야 합니다:
  1. 각 장소 간 예상 이동 시간 (예: "차량 10분")
  2. 각 날짜별 테마와 어울리는 '대안 장소(alternativeSpot)' 1개
  3. 모든 장소는 네이버 지도 검색 링크(naverLink)를 포함할 것.
  사용자의 시간을 아끼기 위해 매우 빠르고 간결하게 핵심 정보 위주로 생성하세요.`;

  const prompt = `Style: ${prefs.style}, Duration: ${prefs.duration} days. 
  Pick the best Jeonnam city. Generate a daily itinerary with travel times and 1 alternative spot per day.
  Ensure coordinates (lat, lng) are accurate for the selected city.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // 초고속 모델 사용
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2, // 속도와 창의성의 균형
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, // 생각 단계 생략으로 응답 속도 극대화
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

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (e) {
    console.error("AI Generation Error:", e);
    throw new Error("분석 서버가 혼잡합니다. 잠시 후 다시 시도해주세요.");
  }
};

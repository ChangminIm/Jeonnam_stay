
export type TravelStyle = 'PHOTO' | 'FOODIE' | 'NATURE' | 'PET' | 'RELAX' | 'DIGITAL_NOMAD';

export interface UserPreferences {
  duration: number;
  style: TravelStyle;
  budget: 'ECONOMY' | 'MID' | 'LUXURY';
}

export interface Spot {
  name: string;
  description: string;
  category: string;
  lat: number;
  lng: number;
  naverLink?: string;
  travelTimeFromPrevious?: string; // 이전 장소로부터의 이동 시간
}

export interface DailyPlan {
  day: number;
  theme: string;
  spots: Spot[];
  alternativeSpot?: Spot; // AI가 제안하는 대안 장소
}

export interface RecommendedRoute {
  title: string;
  summary: string;
  selectedCity: string;
  days: DailyPlan[];
  tags: string[];
  trendingScore: number;
}

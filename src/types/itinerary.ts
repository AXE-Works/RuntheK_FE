export interface ItineraryData {
  id: string;
  title: string;
  duration: string;
  interests: string[];
  budget: string;
  days: {
    day: number;
    title: string;
    activities: {
      time: string;
      activity: string;
      location: string;
      description: string;
      estimatedCost: string;
      isEvent?: boolean;
      eventType?: string;
      googleMapsUrl?: string;
      transportMode?: 'walking' | 'transit' | 'driving';
      transportDuration?: number;      // 이동시간 (분)
      transportDistance?: number;      // 이동거리 (km)
      transportDetails?: string;       // 대중교통 상세 (예: "2호선 → 3호선 환승")
      transportCost?: string;          // 예상 교통비
    }[];
  }[];
  totalEstimatedCost: string;
  travelTips?: string[];
}

export interface UserInput {
  duration?: string;
  cities: string[];
  budget: string;
  interests: string[];
  nationality?: string;
  additionalNotes?: string;
  startDate?: Date;
}

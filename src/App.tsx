import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

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

interface AppProps {
  // PR-9 에서 제거 예정 임시 prop. PR-8 후 caller 0건.
  initialTab?: 'plan' | 'my-trips' | 'admin';
}

export default function App({ initialTab }: AppProps = {}) {
  // PR-9 영역: 잔존 state + useEffect 일괄 제거 예정.
  // setter 가 auth:logout listener 에서 호출되므로 destructure 유지.
  const [activeTab, setActiveTab] = useState<string>(initialTab ?? 'plan');
  const [showHero, setShowHero] = useState(false);

  useEffect(() => {
    const handleAuthLogout = () => {
      setShowHero(true);
      setActiveTab('plan');
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  // catch-all /* 의 fallback. PR-9 에서 catch-all + App.tsx 자체 제거.
  void activeTab;
  void showHero;
  return <Navigate to="/plan" replace />;
}

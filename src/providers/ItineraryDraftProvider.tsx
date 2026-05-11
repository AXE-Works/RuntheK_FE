import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { ItineraryData } from '@/types/itinerary';
import type { ScheduleGenerateResponse } from '@/services/scheduleApi';

interface ItineraryDraftState {
  currentItinerary: ItineraryData | null;
  rawAIResponse: ScheduleGenerateResponse | null;
  userBudget: string;
  userStartDate: Date | undefined;
  userSelectedCities: string[];
  selectedDestination: any | null;

  setItinerary: (
    itinerary: ItineraryData,
    raw?: ScheduleGenerateResponse,
    budget?: string,
    startDate?: Date,
    cities?: string[],
  ) => void;
  applyRegenerateResult: (itinerary: ItineraryData, raw: ScheduleGenerateResponse) => void;
  updateTitle: (title: string) => void;
  selectDestination: (destination: any) => void;
  clearRawResponse: () => void;
  resetDraft: () => void;
}

const ItineraryDraftContext = createContext<ItineraryDraftState | null>(null);

export function ItineraryDraftProvider({ children }: { children: ReactNode }) {
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryData | null>(null);
  const [rawAIResponse, setRawAIResponse] = useState<ScheduleGenerateResponse | null>(null);
  const [userBudget, setUserBudget] = useState<string>('mid-range');
  const [userStartDate, setUserStartDate] = useState<Date | undefined>(undefined);
  const [userSelectedCities, setUserSelectedCities] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);

  // auth:logout 자체 구독 — currentItinerary/selectedDestination 리셋.
  // 동시 401로 다중 dispatch 시 setter 멱등이라 안전.
  useEffect(() => {
    const handler = () => {
      setCurrentItinerary(null);
      setSelectedDestination(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const setItinerary = useCallback(
    (
      itinerary: ItineraryData,
      raw?: ScheduleGenerateResponse,
      budget?: string,
      startDate?: Date,
      cities?: string[],
    ) => {
      setCurrentItinerary(itinerary);
      if (raw) setRawAIResponse(raw);
      if (budget) setUserBudget(budget);
      if (startDate) setUserStartDate(startDate);
      if (cities) setUserSelectedCities(cities);
    },
    [],
  );

  const applyRegenerateResult = useCallback(
    (itinerary: ItineraryData, raw: ScheduleGenerateResponse) => {
      setCurrentItinerary(itinerary);
      setRawAIResponse(raw);
    },
    [],
  );

  const updateTitle = useCallback((title: string) => {
    setCurrentItinerary((prev) => (prev ? { ...prev, title } : prev));
  }, []);

  const selectDestination = useCallback((destination: any) => {
    setSelectedDestination(destination);
    setCurrentItinerary(null);
  }, []);

  const clearRawResponse = useCallback(() => {
    setRawAIResponse(null);
  }, []);

  const resetDraft = useCallback(() => {
    setCurrentItinerary(null);
    setSelectedDestination(null);
  }, []);

  return (
    <ItineraryDraftContext.Provider
      value={{
        currentItinerary,
        rawAIResponse,
        userBudget,
        userStartDate,
        userSelectedCities,
        selectedDestination,
        setItinerary,
        applyRegenerateResult,
        updateTitle,
        selectDestination,
        clearRawResponse,
        resetDraft,
      }}
    >
      {children}
    </ItineraryDraftContext.Provider>
  );
}

export function useItineraryDraft(): ItineraryDraftState {
  const ctx = useContext(ItineraryDraftContext);
  if (!ctx) throw new Error('useItineraryDraft must be used within ItineraryDraftProvider');
  return ctx;
}

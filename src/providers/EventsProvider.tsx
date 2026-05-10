import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { mockEvents, type EventItem } from '@/data/mockEvents';

interface EventsState {
  events: EventItem[];
  setEvents: Dispatch<SetStateAction<EventItem[]>>;
}

const EventsContext = createContext<EventsState | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>(mockEvents);

  return (
    <EventsContext.Provider value={{ events, setEvents }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents(): EventsState {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
}

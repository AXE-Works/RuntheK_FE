import type { ItineraryData } from '@/types/itinerary';

export interface ConfirmedTrip {
  id: string | number;
  tripId?: string;
  itineraryId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCountry: string;
  title: string;
  duration: string;
  interests: string[];
  budget: string;
  cities: string[];
  createdAt: string;
  status: string;
  totalCost: string;
  itineraryData: ItineraryData;
  confirmed: boolean;
  savedLocally?: boolean;
}

const STORAGE_KEY = 'confirmedTrips';

export function appendConfirmedTrip(trip: ConfirmedTrip): void {
  if (typeof window === 'undefined') return;
  const existing: ConfirmedTrip[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || '[]',
  );
  existing.push(trip);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

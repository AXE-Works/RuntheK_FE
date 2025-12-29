/**
 * Trip API Service
 *
 * Handles trip management including saving AI-generated itineraries to the backend.
 */

import { fetchWithAuth, API_BASE_URL } from '../utils/api';
import { ScheduleGenerateResponse } from './scheduleApi';

// ===== BE Request Types (CreateTripWithItineraryRequest) =====

export interface CreateTripWithItineraryRequest {
  title?: string;
  meta: {
    cities: string[];
    interests: string[];
    budget_level: 'LOW' | 'MEDIUM' | 'HIGH';
    duration_days: number;
    generated_at?: string;
  };
  itinerary: {
    day: number;
    date: string;
    day_title: string;
    total_travel_time?: number;
    total_distance_km?: number;
    items: {
      place_name: string;
      address?: string;
      time?: string;
      description?: string;
      rating?: number;
      review_count?: number;
      opening_hours?: string;
      is_open_on_date?: boolean;
      item_type?: string;
      transport_from_prev?: {
        from_place: string;
        to_place: string;
        duration_minutes?: number;
        distance_km?: number;
        transport_mode?: string;
        transit_details?: string;
        cost_estimate?: string;
      } | null;
    }[];
  }[];
  warnings?: string[];
  travel_tips?: string[];
}

// ===== BE Response Types =====

export interface TripWithItineraryResponse {
  tripId: string;
  itineraryId: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  duration: number;
  cities: string[];
  interests: string[];
  budgetLevel: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

// ===== Actual AI Service Response Type =====
// Note: AI service returns slightly different format than expected

export interface AIServiceResponse {
  id: number;
  itinerary: {
    day: number;
    date: string;
    day_title: string;
    total_travel_time: number;
    total_distance_km: number;
    items: {
      place_name: string;
      address: string;
      time: string;
      description: string;
      recommendation_reason: string | null;
      image_url: string | null;
      rating: number;
      review_count: number;
      google_maps_url: string | null;
      price_range: string | null;
      item_type: string;
      opening_hours: string;
      is_open_on_date: boolean;
      transport_from_prev: {
        from_place: string;
        to_place: string;
        duration_minutes: number;
        distance_km: number;
        transport_mode: string;
        transit_details: string | null;
        cost_estimate: string | null;
      } | null;
    }[];
  }[];
  warnings: string[];
  meta: {
    cities: string[];
    interests: string[];
    duration?: number;           // AI may return "duration" instead of "duration_days"
    duration_days?: number;
    budget_level?: string;       // May be missing from AI response
    generated_at?: string;
  };
  travel_tips: string[];
}

// ===== Transform Functions =====

/**
 * Budget level mapping from FE value to BE enum
 */
const BUDGET_TO_LEVEL: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
  'budget': 'LOW',
  'mid-range': 'MEDIUM',
  'luxury': 'HIGH',
};

/**
 * Transform AI service response to BE request format
 *
 * Handles differences between AI service response and BE expected format:
 * - Removes top-level "id" field
 * - Converts "duration" to "duration_days"
 * - Adds missing "budget_level" from user's original request
 *
 * @param aiResponse - Response from AI schedule generation service
 * @param userBudget - User's selected budget from the form (budget, mid-range, luxury)
 * @param title - Optional custom title for the trip
 * @returns Formatted request body for BE API
 */
export function transformAIResponseToBeRequest(
  aiResponse: AIServiceResponse | ScheduleGenerateResponse,
  userBudget: string,
  title?: string
): CreateTripWithItineraryRequest {
  const meta = aiResponse.meta;

  // Determine duration_days: prefer duration_days, fallback to duration
  const durationDays = meta.duration_days ?? (meta as AIServiceResponse['meta']).duration ?? 3;

  // Determine budget_level: use from meta if available, otherwise convert from user selection
  const budgetLevel: 'LOW' | 'MEDIUM' | 'HIGH' =
    (meta.budget_level as 'LOW' | 'MEDIUM' | 'HIGH') ||
    BUDGET_TO_LEVEL[userBudget] ||
    'MEDIUM';

  return {
    title,
    meta: {
      cities: meta.cities,
      interests: meta.interests,
      budget_level: budgetLevel,
      duration_days: durationDays,
      generated_at: meta.generated_at || new Date().toISOString(),
    },
    itinerary: aiResponse.itinerary.map(day => ({
      day: day.day,
      date: day.date,
      day_title: day.day_title,
      total_travel_time: day.total_travel_time,
      total_distance_km: day.total_distance_km,
      items: day.items.map(item => ({
        place_name: item.place_name,
        address: item.address,
        time: item.time,
        description: item.description,
        rating: item.rating,
        review_count: item.review_count,
        opening_hours: item.opening_hours,
        is_open_on_date: item.is_open_on_date,
        item_type: item.item_type,
        transport_from_prev: item.transport_from_prev ? {
          from_place: item.transport_from_prev.from_place,
          to_place: item.transport_from_prev.to_place,
          duration_minutes: item.transport_from_prev.duration_minutes,
          distance_km: item.transport_from_prev.distance_km,
          transport_mode: item.transport_from_prev.transport_mode,
          transit_details: item.transport_from_prev.transit_details ?? undefined,
          cost_estimate: item.transport_from_prev.cost_estimate ?? undefined,
        } : null,
      })),
    })),
    warnings: aiResponse.warnings,
    travel_tips: aiResponse.travel_tips,
  };
}

// ===== API Functions =====

/**
 * Save AI-generated itinerary as a Trip
 *
 * POST /api/v1/trips/with-itinerary
 *
 * @param aiResponse - Response from AI schedule generation service
 * @param userBudget - User's selected budget from the form
 * @param title - Optional custom title for the trip
 * @returns Created trip response
 */
export async function saveTripWithItinerary(
  aiResponse: AIServiceResponse | ScheduleGenerateResponse,
  userBudget: string,
  title?: string
): Promise<ApiResponse<TripWithItineraryResponse>> {
  const requestBody = transformAIResponseToBeRequest(aiResponse, userBudget, title);

  console.log('[Trip API] Saving trip with itinerary...', requestBody);

  const response = await fetchWithAuth(`${API_BASE_URL}/trips/with-itinerary`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Trip API] Failed to save trip:', errorData);
    throw new Error(errorData.error?.message || 'Failed to save trip');
  }

  const result = await response.json();
  console.log('[Trip API] Trip saved successfully:', result);
  return result;
}

// ===== Trip List & Detail APIs =====

export interface TripListItem {
  id: string;
  title: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  startDate: string;
  endDate: string;
  duration: number;
  cities: string[];
  thumbnail?: string;
  createdAt: string;
}

export interface TripListResponse {
  items: TripListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get user's trip list
 *
 * GET /api/v1/trips
 */
export async function getTrips(
  page = 1,
  limit = 10,
  status?: string
): Promise<TripListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) {
    params.append('status', status);
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/trips?${params}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch trips');
  }

  return response.json();
}

/**
 * Get trip detail
 *
 * GET /api/v1/trips/:id
 */
export async function getTripById(id: string): Promise<ApiResponse<unknown>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/trips/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch trip');
  }

  return response.json();
}

/**
 * Delete a trip
 *
 * DELETE /api/v1/trips/:id
 */
export async function deleteTrip(id: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/trips/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to delete trip');
  }
}

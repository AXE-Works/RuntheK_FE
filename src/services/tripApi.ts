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
        // 지도/장소 정보 추가
        google_maps_url: item.google_maps_url,
        price_range: item.price_range,
        image_url: item.image_url,
        recommendation_reason: item.recommendation_reason,
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

/**
 * Trip list item matching BE TripListResponse
 */
export interface TripListItem {
  id: string;
  title: string;
  duration: string;                  // "5 days" format from BE
  interests: string[];
  budget: string;                    // "budget" | "mid-range" | "luxury"
  status: string;                    // "upcoming" | "ongoing" | "completed" (lowercase from BE)
  startDate: string;
  endDate: string;
  confirmedAt: string;
  thumbnail?: string;
  cities: string[];
  daysCount: number;
  activitiesCount: number;
  averageRating?: number;
}

/**
 * BE API response structure for trip list
 */
export interface TripListApiResponse {
  success: boolean;
  data: TripListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * FE internal response structure
 */
export interface TripListResponse {
  items: TripListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// ===== Trip Detail Types =====

/**
 * Trip detail response matching BE TripDetailResponse
 */
export interface TripDetailResponse {
  id: string;
  title: string;
  duration: string;
  interests: string[];
  budget: string;
  status: string;
  startDate: string;
  endDate: string;
  confirmedAt: string;
  cities: string[];
  daysCount: number;
  activitiesCount: number;
  days: TripDayResponse[];
  totalEstimatedCost: string;
  averageRating: number | null;
  ratings: RatingResponse[];
  travelTips: string[];
  warnings: string[];
}

export interface TripDayResponse {
  day: number;
  title: string;
  activities: TripActivityResponse[];
}

export interface TripActivityResponse {
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost: string;
  isEvent: boolean;
  eventType: string | null;
  eventId: string | null;
  rating: number | null;
  // 지도/장소 정보
  googleMapsUrl: string | null;
  priceRange: string | null;
  imageUrl: string | null;
  recommendationReason: string | null;
  // Transport 정보
  transportMode: string | null;
  transportDuration: number | null;
  transportDistance: number | null;
  transportDetails: string | null;
  transportCost: string | null;
}

export interface RatingResponse {
  dayIndex: number;
  activityIndex: number;
  rating: number;
  review: string;
}

/**
 * Get user's trip list
 *
 * GET /api/v1/trips
 *
 * Maps BE response { success, data, pagination } to FE format { items, pagination }
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

  const apiResponse: TripListApiResponse = await response.json();

  // Map BE response structure to FE format
  return {
    items: apiResponse.data ?? [],
    pagination: apiResponse.pagination,
  };
}

/**
 * Get trip detail
 *
 * GET /api/v1/trips/:id
 */
export async function getTripById(id: string): Promise<ApiResponse<TripDetailResponse>> {
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

// ===== Bookmark APIs =====

export interface BookmarkItem {
  id: string;
  tripId: string;
  title: string;
  duration: number;
  cities: string[];
  interests: string[];
  budgetLevel: string;
  creator: {
    name: string;
    country: string;
  };
  rating?: number;
  totalCost?: string;
  createdAt: string;
  bookmarkedAt: string;
}

export interface BookmarkListResponse {
  items: BookmarkItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get user's bookmarked trips
 *
 * GET /api/v1/bookmarks
 */
export async function getBookmarks(
  page = 1,
  limit = 10
): Promise<BookmarkListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetchWithAuth(`${API_BASE_URL}/bookmarks?${params}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch bookmarks');
  }

  return response.json();
}

/**
 * Add bookmark
 *
 * POST /api/v1/bookmarks/:tripId
 */
export async function addBookmark(tripId: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/bookmarks/${tripId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to add bookmark');
  }
}

/**
 * Remove bookmark
 *
 * DELETE /api/v1/bookmarks/:tripId
 */
export async function removeBookmark(tripId: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/bookmarks/${tripId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to remove bookmark');
  }
}

// ===== Recommended Trips API (Public) =====

/**
 * Recommended trip response from BE
 */
export interface RecommendedTripResponse {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  duration: string;
  visitors: number;
  rating: number;
  highlights: string[];
  category: string;
  startDate: string | null;
  budget: string;
  cities: string[];
  days?: RecommendedDayResponse[];
}

/**
 * Day schedule in recommended trips
 */
export interface RecommendedDayResponse {
  day: number;
  title: string;
  activities: RecommendedActivityResponse[];
}

/**
 * Activity in recommended trips
 */
export interface RecommendedActivityResponse {
  time: string | null;
  name: string;
  description: string | null;
}

/**
 * Get recommended trips (public endpoint - no authentication required)
 *
 * GET /api/v1/trips/recommended
 *
 * @param limit - Number of trips to return (default: 8, max: 20)
 * @param category - Optional category filter
 * @returns Array of recommended trips
 */
export async function getRecommendedTrips(
  limit: number = 8,
  category?: string
): Promise<RecommendedTripResponse[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) {
    params.append('category', category);
  }

  // Public endpoint - no auth required
  const response = await fetch(`${API_BASE_URL}/trips/recommended?${params}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Trip API] Failed to fetch recommended trips:', errorData);
    throw new Error(errorData.error?.message || 'Failed to fetch recommended trips');
  }

  const result = await response.json();
  console.log('[Trip API] Fetched recommended trips:', result);
  return result.data ?? [];
}

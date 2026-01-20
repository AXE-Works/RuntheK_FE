/**
 * Admin Recommended Itinerary API Service
 *
 * Endpoints:
 * - GET /api/v1/admin/recommended - List recommended itineraries
 * - GET /api/v1/admin/recommended/{id} - Get itinerary detail
 * - PATCH /api/v1/admin/recommended/{id}/status - Update status (active/featured)
 */

import { fetchWithAuth, API_BASE_URL } from '../utils/api';

// ============================================================
// Types
// ============================================================

/** Backend duration enum values */
type DurationEnum = 'THREE_DAYS' | 'FIVE_DAYS' | 'SEVEN_DAYS' | 'TEN_PLUS_DAYS';

/** Backend budget enum values */
type BudgetEnum = 'BUDGET' | 'MID_RANGE' | 'LUXURY';

/** Pagination info from backend */
export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Summary statistics */
export interface RecommendedSummary {
  totalItineraries: number;
  activeItineraries: number;
  totalViewCount: number;
  totalBookingCount: number;
}

/** Backend response for list item */
interface AdminRecommendedResponseRaw {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: DurationEnum;
  cities: string[];
  budget: BudgetEnum;
  interests: string[];
  averageRating: number;
  viewCount: number;
  bookingCount: number;
  isActive: boolean;
  isFeatured: boolean;
  seoVisible: boolean;
  displayOrder: number;
  daysCount: number;
  activitiesCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Backend activity response */
interface ActivityResponseRaw {
  id: string;
  activityOrder: number;
  activityTime: string;
  activityName: string;
  location: string;
  description: string;
  estimatedCost: string;
  isEvent: boolean;
  eventId: string | null;
  eventType: string | null;
}

/** Backend day response */
interface DayResponseRaw {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: ActivityResponseRaw[];
}

/** Backend response for detail */
interface AdminRecommendedDetailResponseRaw {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: DurationEnum;
  cities: string[];
  budget: BudgetEnum;
  interests: string[];
  averageRating: number;
  viewCount: number;
  bookingCount: number;
  isActive: boolean;
  isFeatured: boolean;
  seoVisible: boolean;
  displayOrder: number;
  targetAudience: string | null;
  seasonTag: string | null;
  richContent: string | null;
  days: DayResponseRaw[];
  createdByAdmin: {
    id: string;
    name: string;
  } | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Backend list response wrapper */
interface AdminRecommendedListResponseRaw {
  success: boolean;
  data: AdminRecommendedResponseRaw[];
  pagination: PageInfo;
  summary: RecommendedSummary;
}

/** Backend detail response wrapper */
interface AdminRecommendedDetailApiResponse {
  success: boolean;
  data: AdminRecommendedDetailResponseRaw;
}

// ============================================================
// Frontend Types (matching AdminItineraryManager.tsx)
// ============================================================

export interface RecommendedActivity {
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost: string;
  googleMapsUrl?: string;
  isEvent?: boolean;
  eventType?: string;
}

export interface RecommendedDay {
  day: number;
  title: string;
  activities: RecommendedActivity[];
}

export interface RichContent {
  introduction: string;
  highlights: string[];
  tips: string[];
  includes: string[];
  excludes: string[];
  whatToBring: string[];
  contentBlocks?: any[];
}

export interface RecommendedItinerary {
  id: string;
  title: string;
  description: string;
  duration: string;
  cities: string[];
  budget: string;
  interests: string[];
  imageUrl: string;
  rating: number;
  viewCount: number;
  bookingCount: number;
  active: boolean;
  featured: boolean;
  seoVisible: boolean;
  displayOrder: number;
  days: RecommendedDay[];
  richContent?: RichContent;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedListResult {
  itineraries: RecommendedItinerary[];
  pagination: PageInfo;
  summary: RecommendedSummary;
}

// ============================================================
// Converters
// ============================================================

/** Convert backend duration enum to display string */
function convertDuration(duration: DurationEnum): string {
  const map: Record<DurationEnum, string> = {
    'THREE_DAYS': '3 days',
    'FIVE_DAYS': '5 days',
    'SEVEN_DAYS': '7 days',
    'TEN_PLUS_DAYS': '10+ days',
  };
  return map[duration] || duration;
}

/** Convert backend budget enum to display string */
function convertBudget(budget: BudgetEnum): string {
  const map: Record<BudgetEnum, string> = {
    'BUDGET': 'budget',
    'MID_RANGE': 'mid-range',
    'LUXURY': 'luxury',
  };
  return map[budget] || budget.toLowerCase();
}

/** Convert raw list item to frontend type */
function convertListItem(raw: AdminRecommendedResponseRaw): RecommendedItinerary {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    duration: convertDuration(raw.duration),
    cities: raw.cities || [],
    budget: convertBudget(raw.budget),
    interests: raw.interests || [],
    imageUrl: raw.imageUrl || '',
    rating: raw.averageRating || 0,
    viewCount: raw.viewCount || 0,
    bookingCount: raw.bookingCount || 0,
    active: raw.isActive,
    featured: raw.isFeatured,
    seoVisible: raw.seoVisible ?? true,
    displayOrder: raw.displayOrder || 0,
    days: [], // List doesn't include days
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/** Convert raw detail to frontend type */
function convertDetail(raw: AdminRecommendedDetailResponseRaw): RecommendedItinerary {
  // Parse rich content if it's a string
  let richContent: RichContent | undefined;
  if (raw.richContent) {
    try {
      const parsed = typeof raw.richContent === 'string'
        ? JSON.parse(raw.richContent)
        : raw.richContent;
      richContent = {
        introduction: parsed.introduction || '',
        highlights: parsed.highlights || [],
        tips: parsed.tips || [],
        includes: parsed.includes || [],
        excludes: parsed.excludes || [],
        whatToBring: parsed.whatToBring || [],
        contentBlocks: parsed.contentBlocks || [],
      };
    } catch {
      richContent = undefined;
    }
  }

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    duration: convertDuration(raw.duration),
    cities: raw.cities || [],
    budget: convertBudget(raw.budget),
    interests: raw.interests || [],
    imageUrl: raw.imageUrl || '',
    rating: raw.averageRating || 0,
    viewCount: raw.viewCount || 0,
    bookingCount: raw.bookingCount || 0,
    active: raw.isActive,
    featured: raw.isFeatured,
    seoVisible: raw.seoVisible ?? true,
    displayOrder: raw.displayOrder || 0,
    days: (raw.days || []).map(day => ({
      day: day.dayNumber,
      title: day.title,
      activities: (day.activities || []).map(act => ({
        time: act.activityTime || '',
        activity: act.activityName,
        location: act.location || '',
        description: act.description || '',
        estimatedCost: act.estimatedCost || '',
        isEvent: act.isEvent,
        eventType: act.eventType || undefined,
      })),
    })),
    richContent,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// ============================================================
// API Functions
// ============================================================

export interface GetRecommendedListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  duration?: string;
  budget?: string;
  sort?: string;
}

/**
 * Get list of recommended itineraries (Admin)
 */
export async function getRecommendedList(
  params: GetRecommendedListParams = {}
): Promise<RecommendedListResult> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
  if (params.isFeatured !== undefined) searchParams.set('isFeatured', String(params.isFeatured));
  if (params.duration) searchParams.set('duration', params.duration);
  if (params.budget) searchParams.set('budget', params.budget);
  if (params.sort) searchParams.set('sort', params.sort);

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/admin/recommended${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch recommended itineraries: ${response.status}`);
  }

  const result: AdminRecommendedListResponseRaw = await response.json();

  return {
    itineraries: result.data.map(convertListItem),
    pagination: result.pagination,
    summary: result.summary,
  };
}

/**
 * Get recommended itinerary detail (Admin)
 */
export async function getRecommendedDetail(id: string): Promise<RecommendedItinerary> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/recommended/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch itinerary detail: ${response.status}`);
  }

  const result: AdminRecommendedDetailApiResponse = await response.json();
  return convertDetail(result.data);
}

// ============================================================
// Status Update
// ============================================================

export interface UpdateRecommendedStatusParams {
  isActive?: boolean;
  isFeatured?: boolean;
  seoVisible?: boolean;
}

export interface UpdateRecommendedStatusResult {
  id: string;
  isActive: boolean;
  isFeatured: boolean;
  seoVisible: boolean;
  updatedAt: string;
}

/** Backend response for status update */
interface UpdateStatusApiResponse {
  success: boolean;
  data: {
    id: string;
    isActive: boolean;
    isFeatured: boolean;
    seoVisible: boolean;
    updatedAt: string;
  };
}

/**
 * Update recommended itinerary status (Admin)
 */
export async function updateRecommendedStatus(
  id: string,
  params: UpdateRecommendedStatusParams
): Promise<UpdateRecommendedStatusResult> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/recommended/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to update status: ${response.status}`);
  }

  const result: UpdateStatusApiResponse = await response.json();
  return result.data;
}

// ============================================================
// Create / Update / Delete
// ============================================================

/** Convert display duration to backend enum */
function convertDurationToEnum(duration: string): DurationEnum {
  const normalized = duration.toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('3') || normalized.includes('three')) return 'THREE_DAYS';
  if (normalized.includes('5') || normalized.includes('five')) return 'FIVE_DAYS';
  if (normalized.includes('7') || normalized.includes('seven')) return 'SEVEN_DAYS';
  if (normalized.includes('10') || normalized.includes('ten')) return 'TEN_PLUS_DAYS';
  return 'FIVE_DAYS'; // default
}

/** Convert display budget to backend enum */
function convertBudgetToEnum(budget: string): BudgetEnum {
  const normalized = budget.toLowerCase().replace(/[_-]/g, '');
  if (normalized === 'budget' || normalized === 'low') return 'BUDGET';
  if (normalized.includes('mid') || normalized === 'medium') return 'MID_RANGE';
  if (normalized === 'luxury' || normalized === 'high') return 'LUXURY';
  return 'MID_RANGE'; // default
}

/** Convert "09:00 AM" to "09:00" format */
function convertTimeTo24Hour(time: string): string {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return '09:00';

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/** Request type for creating/updating recommended itinerary */
export interface CreateRecommendedRequest {
  title: string;
  description?: string;
  imageUrl?: string;
  duration: string;
  cities: string[];
  budget: string;
  interests: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  seoVisible?: boolean;
  displayOrder?: number;
  startDate?: string;
  targetAudience?: string;
  seasonTag?: string;
  days: {
    day: number;
    title: string;
    description?: string;
    activities: {
      time: string;
      activity: string;
      location?: string;
      description?: string;
      estimatedCost?: string;
      googleMapsUrl?: string;
    }[];
  }[];
  richContent?: {
    introduction?: string;
    contentBlocks?: {
      id: string;
      type: string;
      content: string | string[];
      title?: string;
    }[];
    conclusion?: string;
  };
}

/** Convert frontend request to backend format */
function convertToBackendRequest(params: CreateRecommendedRequest) {
  return {
    title: params.title,
    description: params.description || '',
    imageUrl: params.imageUrl || '',
    duration: convertDurationToEnum(params.duration),
    cities: params.cities,
    budget: convertBudgetToEnum(params.budget),
    interests: params.interests,
    isActive: params.isActive ?? false,
    isFeatured: params.isFeatured ?? false,
    seoVisible: params.seoVisible ?? true,
    displayOrder: params.displayOrder ?? 0,
    startDate: params.startDate || null,
    targetAudience: params.targetAudience || null,
    seasonTag: params.seasonTag || null,
    days: params.days.map(day => ({
      day: day.day,
      title: day.title,
      description: day.description || '',
      activities: day.activities.map(act => ({
        time: convertTimeTo24Hour(act.time),
        activity: act.activity,
        location: act.location || '',
        description: act.description || '',
        estimatedCost: act.estimatedCost || '',
        googleMapsUrl: act.googleMapsUrl || '',
      })),
    })),
    richContent: params.richContent ? {
      introduction: params.richContent.introduction || '',
      contentBlocks: params.richContent.contentBlocks?.map(block => ({
        id: block.id,
        type: block.type,
        content: Array.isArray(block.content) ? block.content.join('\n') : block.content,
        title: block.title || '',
      })) || [],
      conclusion: params.richContent.conclusion || '',
    } : null,
  };
}

/**
 * Create a new recommended itinerary (Admin)
 */
export async function createRecommendedItinerary(
  params: CreateRecommendedRequest
): Promise<RecommendedItinerary> {
  const backendRequest = convertToBackendRequest(params);

  const response = await fetchWithAuth(`${API_BASE_URL}/admin/recommended`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendRequest),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create itinerary: ${response.status}`);
  }

  const result = await response.json();
  // Response may be wrapped in { success: true, data: ... } or direct
  const data = result.data || result;
  return convertDetail(data);
}

/**
 * Update an existing recommended itinerary (Admin)
 */
export async function updateRecommendedItinerary(
  id: string,
  params: CreateRecommendedRequest
): Promise<RecommendedItinerary> {
  const backendRequest = convertToBackendRequest(params);

  const response = await fetchWithAuth(`${API_BASE_URL}/admin/recommended/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendRequest),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to update itinerary: ${response.status}`);
  }

  const result = await response.json();
  const data = result.data || result;
  return convertDetail(data);
}

/**
 * Delete a recommended itinerary (Admin)
 */
export async function deleteRecommendedItinerary(id: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/recommended/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete itinerary: ${response.status}`);
  }
}

// ============================================================
// Public API Functions (No Auth Required)
// ============================================================

/** Public itinerary detail response from backend */
interface PublicRecommendedDetailResponseRaw {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string; // Already formatted as "3 days", etc.
  cities: string[];
  budget: string; // Already formatted as "budget", "mid-range", "luxury"
  interests: string[];
  averageRating: number;
  viewCount: number;
  bookingCount: number;
  targetAudience: string | null;
  seasonTag: string | null;
  days: {
    dayNumber: number;
    title: string;
    description: string;
    activities: {
      activityOrder: number;
      activityTime: string;
      activityName: string;
      location: string;
      description: string;
      estimatedCost: string;
    }[];
  }[];
  richContent: string | null;
  category: string;
  isFeatured: boolean;
}

/** Public itinerary detail for frontend */
export interface PublicRecommendedItinerary {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  cities: string[];
  budget: string;
  interests: string[];
  averageRating: number;
  viewCount: number;
  bookingCount: number;
  targetAudience: string | null;
  seasonTag: string | null;
  days: RecommendedDay[];
  richContent?: RichContent;
  category: string;
  isFeatured: boolean;
}

/** Convert public detail response to frontend type */
function convertPublicDetail(raw: PublicRecommendedDetailResponseRaw): PublicRecommendedItinerary {
  // Parse rich content if it's a string
  let richContent: RichContent | undefined;
  if (raw.richContent) {
    try {
      const parsed = typeof raw.richContent === 'string'
        ? JSON.parse(raw.richContent)
        : raw.richContent;
      richContent = {
        introduction: parsed.introduction || '',
        highlights: parsed.highlights || [],
        tips: parsed.tips || [],
        includes: parsed.includes || [],
        excludes: parsed.excludes || [],
        whatToBring: parsed.whatToBring || [],
        contentBlocks: parsed.contentBlocks || [],
      };
    } catch {
      richContent = undefined;
    }
  }

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    imageUrl: raw.imageUrl || '',
    duration: raw.duration,
    cities: raw.cities || [],
    budget: raw.budget,
    interests: raw.interests || [],
    averageRating: raw.averageRating || 0,
    viewCount: raw.viewCount || 0,
    bookingCount: raw.bookingCount || 0,
    targetAudience: raw.targetAudience,
    seasonTag: raw.seasonTag,
    days: (raw.days || []).map(day => ({
      day: day.dayNumber,
      title: day.title,
      activities: (day.activities || []).map(act => ({
        time: act.activityTime || '',
        activity: act.activityName,
        location: act.location || '',
        description: act.description || '',
        estimatedCost: act.estimatedCost || '',
      })),
    })),
    richContent,
    category: raw.category || 'Travel',
    isFeatured: raw.isFeatured,
  };
}

/**
 * Get recommended itinerary detail (Public - no auth required)
 * Used for destination pages to show tour details
 */
export async function getPublicRecommendedDetail(id: string): Promise<PublicRecommendedItinerary> {
  const response = await fetch(`${API_BASE_URL}/recommended/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch itinerary detail: ${response.status}`);
  }

  const result: { success: boolean; data: PublicRecommendedDetailResponseRaw } = await response.json();
  return convertPublicDetail(result.data);
}

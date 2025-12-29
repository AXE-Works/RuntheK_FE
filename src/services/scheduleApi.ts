import { format } from 'date-fns';
import { ItineraryData } from '../App';

// AI Schedule Generation Service (별도 서비스)
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8081/api/v1';

// ===== Request Types =====

export interface ScheduleGenerateRequest {
  start_date: string;
  duration_days: number;
  cities: string[];
  interests: string[];
  budget_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  language?: 'ko' | 'en' | 'ja' | 'zh';
  additional_notes?: string;
}

// ===== Response Types =====

interface TransportInfo {
  from_place: string;
  to_place: string;
  duration_minutes: number;
  distance_km: number;
  transport_mode: string;
  transit_details: string;
  cost_estimate: string;
}

interface ScheduleItem {
  place_name: string;
  address: string;
  time: string;
  description: string;
  rating: number;
  review_count: number;
  opening_hours: string;
  is_open_on_date: boolean;
  item_type: string;
  transport_from_prev: TransportInfo | null;
}

interface ScheduleDay {
  day: number;
  date: string;
  day_title: string;
  total_travel_time: number;
  total_distance_km: number;
  items: ScheduleItem[];
}

interface ScheduleMeta {
  cities: string[];
  interests: string[];
  budget_level: string;
  duration_days: number;
  generated_at: string;
}

export interface ScheduleGenerateResponse {
  id: number;
  itinerary: ScheduleDay[];
  warnings: string[];
  meta: ScheduleMeta;
  travel_tips: string[];
}

interface ApiError {
  code: string;
  message: string;
  details: unknown;
}

// ===== Mapping Constants =====

export const INTEREST_ID_TO_LABEL: Record<string, string> = {
  'culture': 'Culture & History',
  'food': 'Korean Food',
  'shopping': 'Shopping',
  'nature': 'Nature & Hiking',
  'kculture': 'K-Pop & Entertainment',
  'nightlife': 'Nightlife',
  'temples': 'Temples & Spirituality',
  'traditional': 'Traditional Arts',
};

export const INTEREST_LABEL_TO_ID: Record<string, string> = {
  'Culture & History': 'culture',
  'Korean Food': 'food',
  'Shopping': 'shopping',
  'Nature & Hiking': 'nature',
  'K-Pop & Entertainment': 'kculture',
  'Nightlife': 'nightlife',
  'Temples & Spirituality': 'temples',
  'Traditional Arts': 'traditional',
};

const BUDGET_TO_LEVEL: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
  'budget': 'LOW',
  'mid-range': 'MEDIUM',
  'luxury': 'HIGH',
};

const LEVEL_TO_BUDGET: Record<string, string> = {
  'LOW': 'budget',
  'MEDIUM': 'mid-range',
  'HIGH': 'luxury',
};

// ===== Error Messages =====

const ERROR_MESSAGES: Record<string, string> = {
  'INVALID_CITIES': 'Please select valid cities',
  'INVALID_INTERESTS': 'Please select valid interests',
  'INVALID_DURATION': 'Duration must be between 1 and 14 days',
  'MAX_CITIES_EXCEEDED': 'Maximum 5 cities allowed',
  'MAX_INTERESTS_EXCEEDED': 'Maximum 5 interests allowed',
  'SCHEDULE_GENERATION_FAILED': 'Failed to generate schedule. Please try again.',
};

// ===== Utility Functions =====

export function parseDurationToDays(duration: string): number {
  if (duration.includes('10+')) return 10;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 5;
}

function formatTimeToAMPM(timeRange: string): string {
  // "09:00 - 11:00" -> "09:00 AM"
  const startTime = timeRange.split(' - ')[0];
  if (!startTime) return timeRange;

  const [hours, minutes] = startTime.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

// ===== Conversion Functions =====

export function convertToApiRequest(
  userInput: {
    startDate?: Date;
    duration?: string;
    cities: string[];
    budget: string;
    interests: string[];
    additionalNotes?: string;
  }
): ScheduleGenerateRequest {
  const startDate = userInput.startDate || new Date();

  return {
    start_date: format(startDate, 'yyyy-MM-dd'),
    duration_days: parseDurationToDays(userInput.duration || '5 days'),
    cities: userInput.cities.length > 0 ? userInput.cities.slice(0, 5) : ['Seoul'],
    interests: userInput.interests.slice(0, 5).map(id => INTEREST_ID_TO_LABEL[id] || id),
    budget_level: BUDGET_TO_LEVEL[userInput.budget] || 'MEDIUM',
    language: 'en',
    additional_notes: userInput.additionalNotes?.slice(0, 500),
  };
}

export function convertToItineraryData(response: ScheduleGenerateResponse): ItineraryData {
  const { meta, itinerary } = response;

  return {
    id: String(response.id),
    title: `${meta.duration_days} Days Korea Adventure`,
    duration: `${meta.duration_days} days`,
    interests: meta.interests.map(label => INTEREST_LABEL_TO_ID[label] || label),
    budget: LEVEL_TO_BUDGET[meta.budget_level] || 'mid-range',
    days: itinerary.map(day => ({
      day: day.day,
      title: day.day_title,
      activities: day.items.map(item => ({
        time: formatTimeToAMPM(item.time),
        activity: item.place_name,
        location: item.address,
        description: item.description,
        estimatedCost: item.transport_from_prev?.cost_estimate || '',
      })),
    })),
    totalEstimatedCost: calculateTotalCost(itinerary),
  };
}

function calculateTotalCost(itinerary: ScheduleDay[]): string {
  let totalCost = 0;

  for (const day of itinerary) {
    for (const item of day.items) {
      if (item.transport_from_prev?.cost_estimate) {
        const costStr = item.transport_from_prev.cost_estimate.replace(/[^\d]/g, '');
        totalCost += parseInt(costStr) || 0;
      }
    }
  }

  if (totalCost === 0) {
    return 'Varies';
  }

  return `₩${totalCost.toLocaleString()}+`;
}

// ===== API Functions =====

export class ScheduleApiError extends Error {
  code: string;
  details: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ScheduleApiError';
  }
}

export async function generateSchedule(
  userInput: {
    startDate?: Date;
    duration?: string;
    cities: string[];
    budget: string;
    interests: string[];
    additionalNotes?: string;
  }
): Promise<ItineraryData> {
  const request = convertToApiRequest(userInput);

  const response = await fetch(`${AI_API_BASE_URL}/schedules/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      throw new ScheduleApiError(
        'NETWORK_ERROR',
        'Failed to connect to server. Please try again.'
      );
    }

    const userMessage = ERROR_MESSAGES[errorData.code] || errorData.message || 'An error occurred';
    throw new ScheduleApiError(errorData.code, userMessage, errorData.details);
  }

  const data: ScheduleGenerateResponse = await response.json();
  return convertToItineraryData(data);
}

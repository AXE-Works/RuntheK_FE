import { format } from 'date-fns';
import { ItineraryData } from '../App';

// AI Schedule Generation Service (별도 서비스)
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8081/api/v1';

// Enable mock mode for testing (set to true to use mock data)
const USE_MOCK_DATA = true;

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
  google_maps_url?: string;
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
        googleMapsUrl: item.google_maps_url,
        transportMode: item.transport_from_prev?.transport_mode as 'walking' | 'transit' | 'driving' | undefined,
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

// ===== Mock Data Generator =====

function generateMockItinerary(userInput: {
  startDate?: Date;
  duration?: string;
  cities: string[];
  budget: string;
  interests: string[];
  additionalNotes?: string;
}): ItineraryData {
  const numDays = parseDurationToDays(userInput.duration || '5 days');
  const cities = userInput.cities.length > 0 ? userInput.cities : ['Seoul'];

  // All locations within central Seoul (Jongno, Jung-gu, Yongsan, Mapo areas)
  const mockActivities: Record<string, { activity: string; location: string; description: string; googleMapsUrl: string }[]> = {
    culture: [
      { activity: 'Visit Gyeongbokgung Palace', location: '161 Sajik-ro, Jongno-gu, Seoul', description: 'Explore the largest of the Five Grand Palaces built during the Joseon Dynasty', googleMapsUrl: 'https://maps.google.com/?q=37.579617,126.977041' },
      { activity: 'Bukchon Hanok Village', location: '37 Gyedong-gil, Jongno-gu, Seoul', description: 'Walk through traditional Korean houses and experience old Seoul', googleMapsUrl: 'https://maps.google.com/?q=37.582604,126.983717' },
      { activity: 'Changdeokgung Palace', location: '99 Yulgok-ro, Jongno-gu, Seoul', description: 'UNESCO World Heritage palace with beautiful secret garden', googleMapsUrl: 'https://maps.google.com/?q=37.579467,126.991027' },
    ],
    food: [
      { activity: 'Gwangjang Market Food Tour', location: '88 Changgyeonggung-ro, Jongno-gu, Seoul', description: 'Try bindaetteok, mayak gimbap, and other street foods', googleMapsUrl: 'https://maps.google.com/?q=37.570037,126.999651' },
      { activity: 'Tongin Market Dosirak Cafe', location: '18 Jahamun-ro 15-gil, Jongno-gu, Seoul', description: 'Create your own Korean lunchbox with brass coins', googleMapsUrl: 'https://maps.google.com/?q=37.580127,126.970912' },
      { activity: 'Namdaemun Market Food Alley', location: '21 Namdaemunsijang 4-gil, Jung-gu, Seoul', description: 'Traditional market with kalguksu and hotteok', googleMapsUrl: 'https://maps.google.com/?q=37.559984,126.977041' },
    ],
    shopping: [
      { activity: 'Myeongdong Shopping Street', location: 'Myeongdong-gil, Jung-gu, Seoul', description: 'Shop for cosmetics, fashion, and souvenirs', googleMapsUrl: 'https://maps.google.com/?q=37.560977,126.985302' },
      { activity: 'Insadong Antique Alley', location: 'Insadong-gil, Jongno-gu, Seoul', description: 'Traditional crafts, tea houses, and art galleries', googleMapsUrl: 'https://maps.google.com/?q=37.573197,126.985040' },
      { activity: 'Dongdaemun Design Plaza (DDP)', location: '281 Eulji-ro, Jung-gu, Seoul', description: 'Modern shopping complex and cultural hub', googleMapsUrl: 'https://maps.google.com/?q=37.567025,127.009540' },
    ],
    nature: [
      { activity: 'N Seoul Tower', location: '105 Namsangongwon-gil, Yongsan-gu, Seoul', description: "Hike up to Seoul's iconic landmark for city views", googleMapsUrl: 'https://maps.google.com/?q=37.551169,126.988227' },
      { activity: 'Cheonggyecheon Stream', location: 'Cheonggyecheon-ro, Jongno-gu, Seoul', description: 'Urban stream perfect for evening walks', googleMapsUrl: 'https://maps.google.com/?q=37.569411,126.978265' },
      { activity: 'Namsan Park', location: '231 Samil-daero, Jung-gu, Seoul', description: 'Central Seoul park with hiking trails and city views', googleMapsUrl: 'https://maps.google.com/?q=37.553098,126.990944' },
    ],
    kculture: [
      { activity: 'SM Entertainment Building', location: '648 Samseong-ro, Gangnam-gu, Seoul', description: 'Visit K-pop agency and nearby celebrity spots', googleMapsUrl: 'https://maps.google.com/?q=37.566043,126.985040' },
      { activity: 'K-Star Road Gangnam', location: 'Apgujeong-ro, Gangnam-gu, Seoul', description: 'Walk among K-pop idol bear statues', googleMapsUrl: 'https://maps.google.com/?q=37.564721,126.983459' },
      { activity: 'Line Friends Flagship Store', location: '429 Apgujeong-ro, Gangnam-gu, Seoul', description: 'Giant character store and photo spots', googleMapsUrl: 'https://maps.google.com/?q=37.561234,126.984789' },
    ],
    nightlife: [
      { activity: 'Itaewon Nightlife District', location: 'Itaewon-ro, Yongsan-gu, Seoul', description: 'International nightlife district with diverse bars and clubs', googleMapsUrl: 'https://maps.google.com/?q=37.534515,126.994083' },
      { activity: 'Euljiro Hip Street', location: 'Euljiro 3-ga, Jung-gu, Seoul', description: 'Trendy retro bars in old printing district', googleMapsUrl: 'https://maps.google.com/?q=37.566295,126.992035' },
      { activity: 'Ikseon-dong Night Cafes', location: 'Supyo-ro 28-gil, Jongno-gu, Seoul', description: 'Cozy hanok cafes and wine bars', googleMapsUrl: 'https://maps.google.com/?q=37.572535,126.991272' },
    ],
    temples: [
      { activity: 'Jogyesa Temple', location: '55 Ujeongguk-ro, Jongno-gu, Seoul', description: 'Main temple of Korean Buddhism in Seoul', googleMapsUrl: 'https://maps.google.com/?q=37.574892,126.981647' },
      { activity: 'Hwagyesa Temple', location: '117 Hwagyesa-gil, Gangbuk-gu, Seoul', description: 'Beautiful mountain temple with city views', googleMapsUrl: 'https://maps.google.com/?q=37.578127,126.980349' },
      { activity: 'Jongmyo Shrine', location: '157 Jong-ro, Jongno-gu, Seoul', description: 'UNESCO World Heritage Confucian royal shrine', googleMapsUrl: 'https://maps.google.com/?q=37.574541,126.994047' },
    ],
    traditional: [
      { activity: 'Hanbok Experience at Gyeongbokgung', location: '12-1 Sajik-ro 8-gil, Jongno-gu, Seoul', description: 'Wear traditional Korean clothing and take photos', googleMapsUrl: 'https://maps.google.com/?q=37.576084,126.975121' },
      { activity: 'Ssamziegil (Insadong)', location: '44 Insadong-gil, Jongno-gu, Seoul', description: 'Experience Korean tea culture and traditional crafts', googleMapsUrl: 'https://maps.google.com/?q=37.574001,126.985441' },
      { activity: 'Ikseondong Hanok Street', location: 'Supyo-ro 28-gil, Jongno-gu, Seoul', description: 'Trendy cafes and shops in traditional hanok buildings', googleMapsUrl: 'https://maps.google.com/?q=37.572535,126.991272' },
    ],
  };

  // Restaurants within central Seoul (close to activity areas)
  const restaurants = {
    lunch: [
      { activity: 'Tosokchon Samgyetang', location: '5 Jahamun-ro 5-gil, Jongno-gu, Seoul', description: 'Famous ginseng chicken soup restaurant near Gyeongbokgung', googleMapsUrl: 'https://maps.google.com/?q=37.580246,126.971851' },
      { activity: 'Myeongdong Kyoja', location: '29 Myeongdong 10-gil, Jung-gu, Seoul', description: 'Famous kalguksu and mandu restaurant', googleMapsUrl: 'https://maps.google.com/?q=37.563478,126.985123' },
    ],
    dinner: [
      { activity: 'Samcheongdong Sujebi', location: '101-1 Samcheong-ro, Jongno-gu, Seoul', description: 'Traditional hand-torn noodle soup in charming alley', googleMapsUrl: 'https://maps.google.com/?q=37.583456,126.981234' },
      { activity: 'Jihwaja', location: '24 Bukchon-ro 11-gil, Jongno-gu, Seoul', description: 'Royal court cuisine in traditional hanok setting', googleMapsUrl: 'https://maps.google.com/?q=37.580891,126.984567' },
    ],
  };

  const days = Array.from({ length: numDays }, (_, i) => {
    const dayActivities: { time: string; activity: string; location: string; description: string; estimatedCost: string; googleMapsUrl?: string; transportMode?: 'walking' | 'transit' | 'driving' }[] = [];

    // Morning Activity (first activity - transit from hotel/accommodation)
    const morningInterest = userInput.interests[i % userInput.interests.length] || 'culture';
    const morningActivities = mockActivities[morningInterest] || mockActivities.culture;
    const morningActivity = morningActivities[i % morningActivities.length];
    dayActivities.push({
      time: '09:00 AM',
      ...morningActivity,
      estimatedCost: userInput.budget === 'budget' ? '$10-20' : userInput.budget === 'mid-range' ? '$20-50' : '$50-100',
      transportMode: 'transit',
    });

    // Lunch (walking from morning activity)
    const lunch = restaurants.lunch[i % restaurants.lunch.length];
    dayActivities.push({
      time: '12:00 PM',
      ...lunch,
      estimatedCost: userInput.budget === 'budget' ? '$8-15' : userInput.budget === 'mid-range' ? '$15-25' : '$25-40',
      transportMode: 'walking',
    });

    // Afternoon Activity (transit from lunch)
    const afternoonInterest = userInput.interests[(i + 1) % userInput.interests.length] || 'shopping';
    const afternoonActivities = mockActivities[afternoonInterest] || mockActivities.shopping;
    const afternoonActivity = afternoonActivities[(i + 1) % afternoonActivities.length];
    dayActivities.push({
      time: '02:00 PM',
      ...afternoonActivity,
      estimatedCost: userInput.budget === 'budget' ? '$10-20' : userInput.budget === 'mid-range' ? '$20-50' : '$50-100',
      transportMode: 'transit',
    });

    // Dinner (transit or driving based on budget)
    const dinner = restaurants.dinner[i % restaurants.dinner.length];
    dayActivities.push({
      time: '07:00 PM',
      ...dinner,
      estimatedCost: userInput.budget === 'budget' ? '$15-25' : userInput.budget === 'mid-range' ? '$25-40' : '$40-80',
      transportMode: userInput.budget === 'luxury' ? 'driving' : 'transit',
    });

    return {
      day: i + 1,
      title: `Day ${i + 1} - Exploring ${cities[i % cities.length]}`,
      activities: dayActivities,
    };
  });

  return {
    id: `mock-${Date.now()}`,
    title: `${numDays} Days Korea Adventure`,
    duration: `${numDays} days`,
    interests: userInput.interests,
    budget: userInput.budget,
    days,
    totalEstimatedCost: userInput.budget === 'budget'
      ? `$${numDays * 100}-${numDays * 150}`
      : userInput.budget === 'mid-range'
      ? `$${numDays * 200}-${numDays * 300}`
      : `$${numDays * 400}-${numDays * 600}`,
  };
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
  // Use mock data for testing
  if (USE_MOCK_DATA) {
    console.log('[Schedule API] Using mock data for testing');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockItinerary(userInput);
  }

  const request = convertToApiRequest(userInput);

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    console.log('[Schedule API] Generating schedule...', request);

    const response = await fetch(`${AI_API_BASE_URL}/schedules/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
    console.log('[Schedule API] Schedule generated successfully');
    return convertToItineraryData(data);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ScheduleApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[Schedule API] Request timed out');
        throw new ScheduleApiError(
          'TIMEOUT',
          'Request timed out. The AI service may be unavailable. Please try again later.'
        );
      }

      // Network error (e.g., service not running)
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.error('[Schedule API] Network error:', error.message);
        throw new ScheduleApiError(
          'NETWORK_ERROR',
          'Cannot connect to AI service. Please ensure the service is running.'
        );
      }
    }

    console.error('[Schedule API] Unexpected error:', error);
    throw new ScheduleApiError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred. Please try again.'
    );
  }
}

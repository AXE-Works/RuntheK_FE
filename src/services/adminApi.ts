/**
 * Admin API Service
 *
 * Handles admin dashboard API calls including statistics and management endpoints.
 */

import { fetchWithAuth, API_BASE_URL } from '../utils/api';

// ===== Common Types =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ===== Dashboard Stats Types =====

export interface DashboardStats {
  totalUsers: number;
  dailySignups: number;
  totalTrips: number;
  activeUsers: number;
}

// ===== Dashboard Stats API =====

/**
 * Get dashboard statistics
 * GET /api/v1/admin/dashboard/stats
 *
 * @returns Dashboard stats including:
 *   - totalUsers: 전체 사용자 수
 *   - dailySignups: 오늘 가입자 수
 *   - totalTrips: 확정된 여행 수
 *   - activeUsers: 활성 사용자 수
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/stats`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '대시보드 통계를 불러오는데 실패했습니다');
  }

  return response.json();
}

// ===== User List Types =====

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  country: string;
  provider: string;
  status: string;
  signupDate: string;
  lastActive: string;
  tripCount: number;
  totalRatings: number;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminUserSummary {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
}

export interface AdminUserListResponse {
  success: boolean;
  data: AdminUser[];
  pagination: PageInfo;
  summary: AdminUserSummary;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  country?: string;
  sort?: string;
}

// ===== User List API =====

/**
 * Get admin user list with pagination and filters
 * GET /api/v1/admin/users
 *
 * @param params - Query parameters for pagination and filtering
 * @returns AdminUserListResponse containing:
 *   - data: 사용자 목록
 *   - pagination: 페이지네이션 정보
 *   - summary: 요약 통계
 */
export async function getAdminUsers(params: GetUsersParams = {}): Promise<AdminUserListResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.country) queryParams.append('country', params.country);
  if (params.sort) queryParams.append('sort', params.sort);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/admin/users${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '사용자 목록을 불러오는데 실패했습니다');
  }

  return response.json();
}

/**
 * Update user status
 * PATCH /api/v1/admin/users/:id/status
 */
export async function updateUserStatus(
  userId: string,
  status: 'active' | 'inactive' | 'suspended'
): Promise<ApiResponse<{ id: string; status: string; updatedAt: string }>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '사용자 상태 변경에 실패했습니다');
  }

  return response.json();
}

/**
 * Delete user
 * DELETE /api/v1/admin/users/:id
 */
export async function deleteUser(
  userId: string,
  deleteData: boolean = false
): Promise<ApiResponse<{ id: string; deletedAt: string }>> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/admin/users/${userId}?deleteData=${deleteData}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '사용자 삭제에 실패했습니다');
  }

  return response.json();
}

// ===== Admin Trip Types =====

export interface AdminTrip {
  id: string;
  title: string;
  userId: string;
  userName: string;
  userEmail: string;
  duration: string;
  cities: string[];
  status: string;
  confirmedAt: string;
  startDate: string | null;
  budget: string;
  interests: string[];
  averageRating: number | null;
  totalEstimatedCost: string | null;
}

export interface AdminTripSummary {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  averageRating: number | null;
}

export interface AdminTripListResponse {
  success: boolean;
  data: AdminTrip[];
  pagination: PageInfo;
}

export interface GetTripsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ===== Admin Trip API =====

/**
 * Get admin trip list with pagination and filters
 * GET /api/v1/admin/trips
 *
 * @param params - Query parameters for pagination and filtering
 * @returns AdminTripListResponse containing:
 *   - data: 여행 일정 목록
 *   - pagination: 페이지네이션 정보
 */
export async function getAdminTrips(params: GetTripsParams = {}): Promise<AdminTripListResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/admin/trips${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '여행 일정 목록을 불러오는데 실패했습니다');
  }

  return response.json();
}

/**
 * Get admin trip summary statistics
 * GET /api/v1/admin/trips/summary
 *
 * @returns Trip summary including:
 *   - totalTrips: 총 여행 수
 *   - activeTrips: 진행중인 여행 수 (upcoming + ongoing)
 *   - completedTrips: 완료된 여행 수
 *   - averageRating: 평균 평점
 */
export async function getAdminTripSummary(): Promise<ApiResponse<AdminTripSummary>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/trips/summary`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '여행 통계를 불러오는데 실패했습니다');
  }

  return response.json();
}

/**
 * Delete a trip
 * DELETE /api/v1/admin/trips/:id
 */
export async function deleteAdminTrip(
  tripId: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/trips/${tripId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '여행 일정 삭제에 실패했습니다');
  }

  return response.json();
}

// ===== Admin Event Types =====

export interface AdminEvent {
  id: string;
  title: string;
  type: string;
  imageUrl: string | null;
  location: string;
  dateRange: {
    start: string;
    end: string;
  };
  status: string;
  targetAudience: string | null;
  ageRestriction: string | null;
  expectedParticipants: number | null;
  organizer: string | null;
  exposureFrequency: number;
  relevanceScore: number;
  createdAt: string;
}

export interface AdminEventDetail extends AdminEvent {
  description: string;
  budget: string | null;
  budgetAmount: number | null;
  contactEmail: string;
  website: string | null;
  specialConditions: string | null;
  participationRequirements: string | null;
  isWeatherDependent: boolean;
  weatherDependencyNote: string | null;
  matchingConditions: string | null;
  itineraryInclusionCount: number;
  updatedAt: string;
}

// 이벤트 유형 매핑 (FE 한국어 → BE 영어)
export const EVENT_TYPE_MAP: Record<string, string> = {
  '시즌 이벤트': 'SEASONAL',
  '프로모션': 'OTHER',
  '문화 이벤트': 'CULTURAL',
  '특별 혜택': 'OTHER',
  '축제': 'FESTIVAL',
  '콘서트': 'CONCERT',
  '전시': 'EXHIBITION',
  '스포츠': 'SPORTS',
  '음식': 'FOOD',
};

// 이벤트 유형 역매핑 (BE 영어 → FE 한국어)
export const EVENT_TYPE_REVERSE_MAP: Record<string, string> = {
  'SEASONAL': '시즌 이벤트',
  'OTHER': '프로모션',
  'CULTURAL': '문화 이벤트',
  'FESTIVAL': '축제',
  'CONCERT': '콘서트',
  'EXHIBITION': '전시',
  'SPORTS': '스포츠',
  'FOOD': '음식',
};

// 프론트엔드 EventForm 상태 타입
export interface EventFormData {
  title: string;
  type: string;  // 한국어 (시즌 이벤트, 프로모션 등)
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  description: string;
  imageUrl: string;
  targetAudience: string;
  ageRestriction: string;
  contactEmail: string;
  website: string;
  budget: number;  // 원화 금액
  expectedParticipants: number;
  requirements: string;  // 참여 조건
  weatherDependency: string;  // 날씨 영향 텍스트
  conditions: string;  // AI 매칭 조건
  frequency: number;  // 노출 빈도 (0-100)
  relevance: number;  // 관련도 (0-100)
  active: boolean;  // 활성화 여부
}

// 백엔드 API 요청 타입
export interface EventCreateRequest {
  title: string;
  description: string;
  type: string;  // 영어 enum (SEASONAL, CULTURAL 등)
  location: string;
  dateRange: {
    start: string;
    end: string;
  };
  organizer?: string;
  targetAudience?: string;
  ageRestriction?: string;
  contactEmail: string;
  website?: string;
  budget?: string;  // budget, mid-range, luxury
  budgetAmount?: number;
  expectedParticipants?: number;
  participationRequirements?: string;
  specialConditions?: string;
  isWeatherDependent?: boolean;
  weatherDependencyNote?: string;
  imageUrl?: string;
  status?: string;  // draft, active
  exposureFrequency?: number;
  relevanceScore?: number;
  matchingConditions?: string;
}

export interface EventUpdateRequest extends Partial<EventCreateRequest> {}

export interface EventCreateResponse {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface EventUpdateResponse {
  id: string;
  title: string;
  updatedAt: string;
}

export interface EventSummary {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
}

export interface AdminEventListResponse {
  success: boolean;
  data: AdminEvent[];
  pagination: PageInfo;
  summary: EventSummary;
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ===== Admin Event API =====

/**
 * Get admin event list with pagination and filters
 * GET /api/v1/admin/events
 *
 * @param params - Query parameters for pagination and filtering
 * @returns AdminEventListResponse containing:
 *   - data: 이벤트 목록
 *   - pagination: 페이지네이션 정보
 *   - summary: 요약 통계
 */
export async function getAdminEvents(params: GetEventsParams = {}): Promise<AdminEventListResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.type) queryParams.append('type', params.type);
  if (params.location) queryParams.append('location', params.location);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/admin/events${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '이벤트 목록을 불러오는데 실패했습니다');
  }

  return response.json();
}

/**
 * Delete an event
 * DELETE /api/v1/admin/events/:id
 */
export async function deleteAdminEvent(
  eventId: string
): Promise<ApiResponse<{ message: string; affectedItineraries: number }>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/events/${eventId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '이벤트 삭제에 실패했습니다');
  }

  return response.json();
}

/**
 * Get event detail by ID
 * GET /api/v1/admin/events/:id
 */
export async function getAdminEventDetail(
  eventId: string
): Promise<ApiResponse<AdminEventDetail>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/events/${eventId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '이벤트 상세 정보를 불러오는데 실패했습니다');
  }

  return response.json();
}

/**
 * Create a new event
 * POST /api/v1/admin/events
 */
export async function createAdminEvent(
  request: EventCreateRequest
): Promise<ApiResponse<EventCreateResponse>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '이벤트 생성에 실패했습니다');
  }

  return response.json();
}

/**
 * Update an existing event
 * PUT /api/v1/admin/events/:id
 */
export async function updateAdminEvent(
  eventId: string,
  request: EventUpdateRequest
): Promise<ApiResponse<EventUpdateResponse>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || '이벤트 수정에 실패했습니다');
  }

  return response.json();
}

// ===== Event Form 변환 유틸리티 =====

/**
 * EventForm 상태를 API 요청 객체로 변환
 * FE 필드명 → BE 필드명 매핑
 */
export function convertFormToRequest(formData: EventFormData): EventCreateRequest {
  return {
    title: formData.title,
    description: formData.description,
    type: EVENT_TYPE_MAP[formData.type] || 'OTHER',
    location: formData.location,
    dateRange: {
      start: formData.startDate,
      end: formData.endDate,
    },
    organizer: formData.organizer || undefined,
    targetAudience: formData.targetAudience || undefined,
    ageRestriction: formData.ageRestriction || undefined,
    contactEmail: formData.contactEmail,
    website: formData.website || undefined,
    budgetAmount: formData.budget || undefined,
    expectedParticipants: formData.expectedParticipants || undefined,
    participationRequirements: formData.requirements || undefined,
    isWeatherDependent: !!formData.weatherDependency,
    weatherDependencyNote: formData.weatherDependency || undefined,
    imageUrl: formData.imageUrl || undefined,
    status: formData.active ? 'active' : 'draft',
    exposureFrequency: formData.frequency,
    relevanceScore: formData.relevance,
    matchingConditions: formData.conditions || undefined,
  };
}

/**
 * API 응답을 EventForm 상태로 변환
 * BE 필드명 → FE 필드명 매핑
 */
export function convertDetailToForm(detail: AdminEventDetail): EventFormData {
  return {
    title: detail.title,
    type: EVENT_TYPE_REVERSE_MAP[detail.type.toUpperCase()] || '프로모션',
    startDate: detail.dateRange.start,
    endDate: detail.dateRange.end,
    location: detail.location,
    organizer: detail.organizer || '',
    description: detail.description,
    imageUrl: detail.imageUrl || '',
    targetAudience: detail.targetAudience || '',
    ageRestriction: detail.ageRestriction || '',
    contactEmail: detail.contactEmail,
    website: detail.website || '',
    budget: detail.budgetAmount || 0,
    expectedParticipants: detail.expectedParticipants || 0,
    requirements: detail.participationRequirements || '',
    weatherDependency: detail.weatherDependencyNote || '',
    conditions: detail.matchingConditions || '',
    frequency: detail.exposureFrequency,
    relevance: detail.relevanceScore,
    active: detail.status === 'active',
  };
}

/**
 * 이벤트 생성 헬퍼 함수
 * EventForm에서 직접 호출 가능
 */
export async function submitEventForm(
  formData: EventFormData,
  eventId?: string
): Promise<ApiResponse<EventCreateResponse | EventUpdateResponse>> {
  const request = convertFormToRequest(formData);

  if (eventId) {
    // 수정 모드
    return updateAdminEvent(eventId, request);
  } else {
    // 생성 모드
    return createAdminEvent(request);
  }
}

// ============================================
// System Status API
// ============================================

export interface ServiceStatusInfo {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency: number | null;
  lastChecked: string;
}

export interface ServerLoadInfo {
  cpu: number;
  memory: number;
  disk: number;
}

export interface SystemAlertInfo {
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface TrafficInfo {
  hourly: number[];
  daily: number[];
}

export interface UptimeInfo {
  api: number;
  database: number;
  ai: number;
}

export interface SystemStatusResponse {
  services: ServiceStatusInfo[];
  serverLoad: ServerLoadInfo;
  alerts: SystemAlertInfo[];
  traffic: TrafficInfo;
  uptime: UptimeInfo;
}

/**
 * Get system status
 * GET /api/v1/admin/system/status
 */
export async function getSystemStatus(): Promise<ApiResponse<SystemStatusResponse>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/system/status`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-store',
    },
  });
  return response.json();
}

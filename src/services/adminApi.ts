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

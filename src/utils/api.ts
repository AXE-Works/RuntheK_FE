/**
 * API Utility with automatic token refresh
 *
 * Features:
 * - Automatic Authorization header injection
 * - 401 error handling with token refresh
 * - Concurrent request handling during refresh
 */

import { env } from '@/config/env';
import {
  emitAuthLogout,
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '@/lib/auth/accessTokenStorage';

const API_BASE_URL = env.apiBaseUrl;

// Shared refresh promise — concurrent 401s share the same in-flight refresh.
// Reset to null in `finally` so a future 401 can trigger a new refresh.
let pendingRefresh: Promise<boolean> | null = null;

/**
 * Refresh access token using refresh token (httpOnly cookie).
 * Concurrent callers receive the same Promise<boolean>, so the network
 * round-trip happens once. On failure (`false`), each caller is responsible
 * for triggering its own logout / retry handling.
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (pendingRefresh) return pendingRefresh;

  pendingRefresh = (async () => {
    try {
      console.log('[Auth] Attempting to refresh access token...');
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send httpOnly cookie
      });

      if (!res.ok) {
        console.log('[Auth] Token refresh failed:', res.status);
        return false;
      }

      const data = await res.json();
      setAccessToken(data.data.accessToken);
      console.log('[Auth] Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[Auth] Token refresh error:', error);
      return false;
    } finally {
      pendingRefresh = null;
    }
  })();

  return pendingRefresh;
}

/**
 * Fetch wrapper with automatic authentication and token refresh
 *
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Response object
 *
 * @example
 * const res = await fetchWithAuth(`${API_BASE_URL}/users/profile`);
 * const data = await res.json();
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken();

  const authOptions: RequestInit = {
    ...options,
    credentials: 'include', // Send httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    },
  };

  let response = await fetch(url, authOptions);

  // Handle 401 Unauthorized — concurrent callers share one refresh.
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      const newToken = getAccessToken()!;
      const retryOptions: RequestInit = {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        },
      };
      response = await fetch(url, retryOptions);
    } else {
      // Refresh failed — trigger logout. Every concurrent caller reaches
      // this branch, so the dispatch is idempotent (event listeners must
      // tolerate duplicate auth:logout events).
      removeAccessToken();
      emitAuthLogout();
    }
  }

  return response;
}

/**
 * Multipart upload wrapper with automatic authentication and token refresh.
 *
 * Use this for any `FormData` body. The browser sets the `multipart/form-data`
 * boundary automatically, so this helper deliberately strips any caller-supplied
 * `Content-Type` header — letting one through breaks server-side parsing.
 *
 * On 401 the request is retried once after `refreshAccessToken()` succeeds.
 * The shared refresh promise from `fetchWithAuth` is reused, so concurrent
 * upload + JSON requests share a single refresh.
 */
export async function uploadWithAuth(
  url: string,
  formData: FormData,
  options: Omit<RequestInit, 'body' | 'credentials'> = {}
): Promise<Response> {
  const accessToken = getAccessToken();

  const buildHeaders = (token: string | null): Record<string, string> => {
    const merged: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    delete merged['Content-Type'];
    delete merged['content-type'];
    return merged;
  };

  const baseInit: RequestInit = {
    method: 'POST',
    ...options,
    credentials: 'include',
    headers: buildHeaders(accessToken),
    body: formData,
  };

  let response = await fetch(url, baseInit);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      const newToken = getAccessToken();
      response = await fetch(url, {
        method: 'POST',
        ...options,
        credentials: 'include',
        headers: buildHeaders(newToken),
        body: formData,
      });
    } else {
      removeAccessToken();
      emitAuthLogout();
    }
  }

  return response;
}

/**
 * Profile API Response Types
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  bio?: string;
  phoneCountryCode?: string;
  phone?: string;
  tripCount: number;
  totalCountriesVisited: number;
  preferences: {
    interests: string[];
    budgetPreference: 'budget' | 'mid-range' | 'luxury';
  };
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  country?: string;
  bio?: string;
  avatar?: string;
  phoneCountryCode?: string;
  phone?: string;
  preferences?: {
    interests?: string[];
    budgetPreference?: 'budget' | 'mid-range' | 'luxury';
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Get current user's profile
 * @returns User profile data
 */
export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch profile');
  }

  return response.json();
}

/**
 * Update current user's profile
 * @param data - Profile data to update
 * @returns Updated user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to update profile');
  }

  return response.json();
}

/**
 * Upload file to server (Admin only)
 * @param file - File to upload
 * @returns Upload result with filename and URL
 */
export interface FileUploadResponse {
  filename: string;
  url: string;
}

export async function uploadFile(file: File): Promise<ApiResponse<FileUploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await uploadWithAuth(`${API_BASE_URL}/admin/files/upload`, formData);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to upload file');
  }

  return response.json();
}

export { API_BASE_URL };

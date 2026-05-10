/**
 * API Utility with automatic token refresh
 *
 * Features:
 * - Automatic Authorization header injection
 * - 401 error handling with token refresh
 * - Concurrent request handling during refresh
 */

import { env } from '@/config/env';

const API_BASE_URL = env.apiBaseUrl;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Subscribe to token refresh completion
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers when token is refreshed
 */
function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
}

/**
 * Refresh access token using refresh token (httpOnly cookie)
 * @returns true if refresh successful, false otherwise
 */
export async function refreshAccessToken(): Promise<boolean> {
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
    localStorage.setItem('accessToken', data.data.accessToken);
    // refreshToken is now in httpOnly cookie, not in response body
    console.log('[Auth] Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('[Auth] Token refresh error:', error);
    return false;
  }
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
  const accessToken = localStorage.getItem('accessToken');

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

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshed = await refreshAccessToken();
      isRefreshing = false;

      if (refreshed) {
        const newToken = localStorage.getItem('accessToken')!;
        onTokenRefreshed(newToken);

        // Retry original request with new token
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
        // Refresh failed - trigger logout
        localStorage.removeItem('accessToken');
        // refreshToken is in httpOnly cookie, will be cleared by backend
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    } else {
      // Another refresh is in progress - wait for it
      return new Promise(resolve => {
        subscribeTokenRefresh(newToken => {
          const retryOptions: RequestInit = {
            ...options,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
            },
          };
          resolve(fetch(url, retryOptions));
        });
      });
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
  const accessToken = localStorage.getItem('accessToken');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/admin/files/upload`, {
    method: 'POST',
    headers: {
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to upload file');
  }

  return response.json();
}

export { API_BASE_URL };

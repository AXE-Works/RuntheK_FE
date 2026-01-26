// Prompt Management API Service
// Integrates with backend API: GET /api/v1/admin/prompts

import { fetchWithAuth } from '@/utils/api';

const API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8080/api/v1';

// API Response types
export interface PromptFromApi {
  id: number;
  name: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromptsApiResponse {
  prompts: PromptFromApi[];
  total: number;
}

export interface PromptHistoryApiResponse {
  name: string;
  versions: PromptFromApi[];
}

// Frontend model (transformed from API response)
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptRequest {
  name: string;
  content: string;
}

export interface UpdatePromptRequest {
  content: string;
  is_active?: boolean;
}

// Helper function to transform API response to frontend model
function transformPrompt(apiPrompt: PromptFromApi): PromptTemplate {
  return {
    id: String(apiPrompt.id),
    name: apiPrompt.name,
    content: apiPrompt.content,
    version: apiPrompt.version,
    isActive: apiPrompt.is_active,
    createdAt: apiPrompt.created_at,
    updatedAt: apiPrompt.updated_at,
  };
}

// API Functions

/**
 * Get all prompts from the backend
 */
export async function getPrompts(): Promise<PromptTemplate[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/prompts`);

    if (!response.ok) {
      throw new Error(`Failed to fetch prompts: ${response.status}`);
    }

    const data: PromptsApiResponse = await response.json();

    // Transform and sort by version descending (active first)
    const prompts = data.prompts.map(transformPrompt);
    prompts.sort((a, b) => {
      // Active prompts first
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      // Then by version descending
      return b.version - a.version;
    });

    return prompts;
  } catch (error) {
    console.error('[promptApi] Failed to fetch prompts:', error);
    throw error;
  }
}

/**
 * Get a single prompt by ID
 */
export async function getPromptById(id: string): Promise<PromptTemplate | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/prompts/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch prompt: ${response.status}`);
    }

    const data: PromptFromApi = await response.json();
    return transformPrompt(data);
  } catch (error) {
    console.error('[promptApi] Failed to fetch prompt by ID:', error);
    throw error;
  }
}

/**
 * Get the active prompt
 */
export async function getActivePrompt(): Promise<PromptTemplate | null> {
  try {
    const prompts = await getPrompts();
    return prompts.find(p => p.isActive) || null;
  } catch (error) {
    console.error('[promptApi] Failed to fetch active prompt:', error);
    throw error;
  }
}

/**
 * Create a new prompt
 */
export async function createPrompt(request: CreatePromptRequest): Promise<PromptTemplate> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create prompt: ${response.status}`);
    }

    const data: PromptFromApi = await response.json();
    return transformPrompt(data);
  } catch (error) {
    console.error('[promptApi] Failed to create prompt:', error);
    throw error;
  }
}

/**
 * Update an existing prompt (creates new version)
 */
export async function updatePrompt(id: string, request: UpdatePromptRequest): Promise<PromptTemplate> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/prompts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to update prompt: ${response.status}`);
    }

    const data: PromptFromApi = await response.json();
    return transformPrompt(data);
  } catch (error) {
    console.error('[promptApi] Failed to update prompt:', error);
    throw error;
  }
}

/**
 * Delete a prompt
 */
export async function deletePrompt(id: string): Promise<void> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/prompts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete prompt: ${response.status}`);
    }
  } catch (error) {
    console.error('[promptApi] Failed to delete prompt:', error);
    throw error;
  }
}

/**
 * Create a new version of an existing prompt
 */
export async function createPromptVersion(name: string, content: string): Promise<PromptTemplate> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/prompts/${encodeURIComponent(name)}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create prompt version: ${response.status}`);
    }

    const data: PromptFromApi = await response.json();
    return transformPrompt(data);
  } catch (error) {
    console.error('[promptApi] Failed to create prompt version:', error);
    throw error;
  }
}

/**
 * Get prompt history (all versions) by name
 */
export async function getPromptHistory(name: string): Promise<PromptTemplate[]> {
  try {
    const url = `${API_BASE_URL}/admin/prompts/${encodeURIComponent(name)}/history`;
    console.log('[promptApi] Fetching history from:', url);

    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch prompt history: ${response.status}`);
    }

    const data = await response.json();
    console.log('[promptApi] History response:', data);

    // Handle both possible response formats
    const versions = data.versions || data.prompts || (Array.isArray(data) ? data : []);

    if (!versions || versions.length === 0) {
      console.log('[promptApi] No versions found in response');
      return [];
    }

    // Transform and sort by version descending
    const transformed = versions.map(transformPrompt);
    transformed.sort((a, b) => b.version - a.version);

    return transformed;
  } catch (error) {
    console.error('[promptApi] Failed to fetch prompt history:', error);
    throw error;
  }
}

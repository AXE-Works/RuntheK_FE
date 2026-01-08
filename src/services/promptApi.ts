// Prompt Management API Service
// Frontend-only implementation with localStorage persistence

export type PromptType = 'itinerary' | 'place_recommendation' | 'activity_recommendation';

export const PROMPT_TYPE_LABELS: Record<PromptType, string> = {
  itinerary: '여행 일정 생성',
  place_recommendation: '장소 추천',
  activity_recommendation: '활동 추천',
};

export interface PromptTemplate {
  id: string;
  promptType: PromptType;
  name: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptRequest {
  promptType: PromptType;
  name: string;
  content: string;
}

export interface UpdatePromptRequest {
  name?: string;
  content?: string;
}

// localStorage key
const STORAGE_KEY = 'admin_prompts';

// Mock data for initial state
const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 'prompt-itinerary-1',
    promptType: 'itinerary',
    name: '기본 일정 생성',
    content: `You are an expert Korea travel planner. Generate a detailed day-by-day itinerary for a tourist visiting Korea.

Consider the following user preferences:
- Destination cities: {cities}
- Trip duration: {duration}
- Interests: {interests}
- Budget level: {budget}

For each day, provide:
1. Morning, afternoon, and evening activities
2. Specific locations with addresses
3. Estimated costs in KRW
4. Transportation recommendations between locations
5. Local food recommendations

Output the itinerary in JSON format with the following structure:
{
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [...]
    }
  ],
  "totalEstimatedCost": "₩XXX,XXX - ₩XXX,XXX",
  "travelTips": [...]
}`,
    isActive: true,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-15T10:30:00Z',
  },
  {
    id: 'prompt-itinerary-2',
    promptType: 'itinerary',
    name: '상세 비용 포함 버전',
    content: `You are an expert Korea travel planner with detailed knowledge of costs and pricing.

Generate a comprehensive day-by-day itinerary with DETAILED cost breakdowns for each activity.

User preferences:
- Destination cities: {cities}
- Trip duration: {duration}
- Interests: {interests}
- Budget level: {budget}

For EVERY activity, provide:
1. Activity name and description
2. Exact address and how to get there
3. DETAILED cost breakdown:
   - Entrance fees
   - Typical meal costs
   - Transportation costs
   - Optional add-ons
4. Opening hours and best time to visit
5. Tips for saving money

Include a daily budget summary and total trip cost estimate.`,
    isActive: false,
    createdAt: '2024-12-10T14:00:00Z',
    updatedAt: '2024-12-10T14:00:00Z',
  },
  {
    id: 'prompt-place-1',
    promptType: 'place_recommendation',
    name: '계절별 추천',
    content: `Recommend Korean tourist destinations based on the current season and user preferences.

Consider:
- User interests: {interests}
- Current season: {season}
- Travel style: {style}
- Budget: {budget}

Provide 5-10 destinations with:
- Name (Korean and English)
- Brief description (2-3 sentences)
- Best time to visit within the season
- Popular activities at this location
- Estimated visit duration
- Crowd level (low/medium/high)
- Photo opportunities

Prioritize hidden gems over overly touristy spots when appropriate.`,
    isActive: true,
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-12-05T11:00:00Z',
  },
  {
    id: 'prompt-activity-1',
    promptType: 'activity_recommendation',
    name: '기본 활동 추천',
    content: `Suggest activities for tourists in {city}, Korea.

Consider:
- Time of day: {timeSlot}
- User interests: {interests}
- Budget level: {budget}
- Group size: {groupSize}

For each activity recommendation, provide:
- Activity name
- Location and address
- Duration
- Estimated cost (in KRW)
- Why it's recommended for this user
- Booking requirements (if any)
- Alternative options if this is unavailable

Return 5-8 activity recommendations sorted by relevance.`,
    isActive: true,
    createdAt: '2024-11-25T11:00:00Z',
    updatedAt: '2024-11-25T11:00:00Z',
  },
];

// Helper function to get prompts from localStorage
function getStoredPrompts(): PromptTemplate[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.error('[promptApi] Failed to parse stored prompts');
    }
  }
  // Initialize with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPromptTemplates));
  return mockPromptTemplates;
}

// Helper function to save prompts to localStorage
function saveStoredPrompts(prompts: PromptTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

// Generate unique ID
function generateId(type: PromptType): string {
  return `prompt-${type}-${Date.now()}`;
}

// API Functions

/**
 * Get all prompts, optionally filtered by type
 */
export async function getPrompts(type?: PromptType): Promise<PromptTemplate[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  let prompts = getStoredPrompts();

  if (type) {
    prompts = prompts.filter(p => p.promptType === type);
  }

  // Sort by updatedAt descending
  prompts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return prompts;
}

/**
 * Get a single prompt by ID
 */
export async function getPromptById(id: string): Promise<PromptTemplate | null> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const prompts = getStoredPrompts();
  return prompts.find(p => p.id === id) || null;
}

/**
 * Get the active prompt for a specific type
 */
export async function getActivePrompt(type: PromptType): Promise<PromptTemplate | null> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const prompts = getStoredPrompts();
  return prompts.find(p => p.promptType === type && p.isActive) || null;
}

/**
 * Create a new prompt
 */
export async function createPrompt(request: CreatePromptRequest): Promise<PromptTemplate> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const prompts = getStoredPrompts();
  const now = new Date().toISOString();

  const newPrompt: PromptTemplate = {
    id: generateId(request.promptType),
    promptType: request.promptType,
    name: request.name,
    content: request.content,
    isActive: false, // New prompts are not active by default
    createdAt: now,
    updatedAt: now,
  };

  prompts.push(newPrompt);
  saveStoredPrompts(prompts);

  return newPrompt;
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(id: string, request: UpdatePromptRequest): Promise<PromptTemplate> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const prompts = getStoredPrompts();
  const index = prompts.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error('Prompt not found');
  }

  const updated: PromptTemplate = {
    ...prompts[index],
    ...(request.name !== undefined && { name: request.name }),
    ...(request.content !== undefined && { content: request.content }),
    updatedAt: new Date().toISOString(),
  };

  prompts[index] = updated;
  saveStoredPrompts(prompts);

  return updated;
}

/**
 * Delete a prompt
 */
export async function deletePrompt(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const prompts = getStoredPrompts();
  const prompt = prompts.find(p => p.id === id);

  if (!prompt) {
    throw new Error('Prompt not found');
  }

  if (prompt.isActive) {
    throw new Error('Cannot delete active prompt. Please activate another prompt first.');
  }

  const filtered = prompts.filter(p => p.id !== id);
  saveStoredPrompts(filtered);
}

/**
 * Activate a prompt (deactivates other prompts of the same type)
 */
export async function activatePrompt(id: string): Promise<PromptTemplate> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const prompts = getStoredPrompts();
  const targetIndex = prompts.findIndex(p => p.id === id);

  if (targetIndex === -1) {
    throw new Error('Prompt not found');
  }

  const targetPrompt = prompts[targetIndex];
  const now = new Date().toISOString();

  // Deactivate all other prompts of the same type
  const updated = prompts.map(p => {
    if (p.promptType === targetPrompt.promptType) {
      return {
        ...p,
        isActive: p.id === id,
        updatedAt: p.id === id ? now : p.updatedAt,
      };
    }
    return p;
  });

  saveStoredPrompts(updated);

  return updated.find(p => p.id === id)!;
}

/**
 * Reset prompts to default mock data (useful for testing)
 */
export async function resetToDefaults(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPromptTemplates));
}

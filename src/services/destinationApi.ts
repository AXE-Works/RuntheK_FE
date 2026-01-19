import {
  DestinationData,
  DestinationErrorCode,
  ApiDestinationResponse,
  ApiDestinationListResponse,
} from '@/lib/seo/types';
import { API_BASE_URL } from '@/utils/api';

/**
 * Custom error class for destination API errors
 */
export class DestinationApiError extends Error {
  constructor(
    public readonly code: DestinationErrorCode,
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'DestinationApiError';
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, DestinationApiError.prototype);
  }

  static notFound(slug: string): DestinationApiError {
    return new DestinationApiError('NOT_FOUND', `Destination not found: ${slug}`);
  }

  static networkError(message: string, error?: Error): DestinationApiError {
    return new DestinationApiError('NETWORK_ERROR', message, error);
  }

  static parseError(message: string, error?: Error): DestinationApiError {
    return new DestinationApiError('PARSE_ERROR', message, error);
  }
}

/**
 * Data source interface for destination data
 * Allows swapping between API and static JSON for pre-rendering
 */
export interface DestinationDataSource {
  getBySlug(slug: string): Promise<DestinationData | null>;
  getAll(): Promise<DestinationData[]>;
}

/**
 * API-based data source (current implementation)
 * - Returns null for 404 (destination not found)
 * - Throws DestinationApiError for other errors
 */
export const apiDataSource: DestinationDataSource = {
  async getBySlug(slug: string): Promise<DestinationData | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/destinations/slug/${slug}`);

      // 404 = destination doesn't exist (not an error, just null)
      if (res.status === 404) {
        return null;
      }

      // Other non-OK responses are actual errors
      if (!res.ok) {
        throw DestinationApiError.networkError(
          `API returned ${res.status}: ${res.statusText}`
        );
      }

      // Parse response
      let json: ApiDestinationResponse;
      try {
        json = await res.json();
      } catch (e) {
        throw DestinationApiError.parseError(
          'Failed to parse API response',
          e instanceof Error ? e : undefined
        );
      }

      return json.data ?? null;
    } catch (e) {
      // Re-throw DestinationApiError as-is
      if (e instanceof DestinationApiError) {
        throw e;
      }
      // Wrap other errors (network failures, etc.)
      throw DestinationApiError.networkError(
        'Failed to fetch destination',
        e instanceof Error ? e : undefined
      );
    }
  },

  async getAll(): Promise<DestinationData[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/destinations`);

      if (!res.ok) {
        throw DestinationApiError.networkError(
          `API returned ${res.status}: ${res.statusText}`
        );
      }

      let json: ApiDestinationListResponse;
      try {
        json = await res.json();
      } catch (e) {
        throw DestinationApiError.parseError(
          'Failed to parse API response',
          e instanceof Error ? e : undefined
        );
      }

      return json.data ?? [];
    } catch (e) {
      if (e instanceof DestinationApiError) {
        throw e;
      }
      throw DestinationApiError.networkError(
        'Failed to fetch destinations',
        e instanceof Error ? e : undefined
      );
    }
  }
};

/**
 * Static JSON-based data source (for future pre-rendering)
 *
 * Uncomment and use when implementing pre-rendering:
 *
 * export const staticDataSource: DestinationDataSource = {
 *   async getBySlug(slug: string) {
 *     try {
 *       const data = await import(`../data/destinations/${slug}.json`);
 *       return data.default;
 *     } catch {
 *       return null;
 *     }
 *   },
 *   async getAll() {
 *     try {
 *       const index = await import('../data/destinations/index.json');
 *       return index.default;
 *     } catch {
 *       return [];
 *     }
 *   }
 * };
 */

// Current data source (swap to staticDataSource for pre-rendering)
export const destinationDataSource = apiDataSource;

/**
 * Fetch destination by slug
 */
export async function getDestinationBySlug(slug: string): Promise<DestinationData | null> {
  return destinationDataSource.getBySlug(slug);
}

/**
 * Fetch all destinations
 */
export async function getAllDestinations(): Promise<DestinationData[]> {
  return destinationDataSource.getAll();
}

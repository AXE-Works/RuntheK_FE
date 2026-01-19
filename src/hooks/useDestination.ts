import { useState, useEffect } from 'react';
import { DestinationData, DestinationError, DestinationErrorCode } from '@/lib/seo/types';
import { getDestinationBySlug, DestinationApiError } from '@/services/destinationApi';

interface UseDestinationResult {
  destination: DestinationData | null;
  isLoading: boolean;
  error: DestinationError | null;
  /** True if destination was not found (404) - distinct from error */
  notFound: boolean;
}

/**
 * Normalize any error into a DestinationError
 */
function normalizeError(e: unknown, defaultCode: DestinationErrorCode = 'UNKNOWN'): DestinationError {
  if (e instanceof DestinationApiError) {
    return {
      code: e.code,
      message: e.message,
      originalError: e.originalError,
    };
  }
  if (e instanceof Error) {
    return {
      code: defaultCode,
      message: e.message,
      originalError: e,
    };
  }
  return {
    code: defaultCode,
    message: String(e),
  };
}

/**
 * Hook for fetching destination data by slug
 *
 * @param slug - Destination slug (e.g., "gangneung", "sokcho")
 * @returns Destination data, loading state, error, and notFound flag
 *
 * @example
 * const { destination, isLoading, error, notFound } = useDestination('gangneung');
 *
 * if (isLoading) return <Loading />;
 * if (notFound) return <NotFoundPage />;
 * if (error) return <ErrorPage code={error.code} message={error.message} />;
 * return <DestinationPage data={destination} />;
 */
export function useDestination(slug: string | undefined): UseDestinationResult {
  const [destination, setDestination] = useState<DestinationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<DestinationError | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Skip fetch if slug is empty or undefined
    if (!slug) {
      setDestination(null);
      setIsLoading(false);
      setNotFound(false);
      setError({
        code: 'INVALID_SLUG',
        message: 'No slug provided',
      });
      return;
    }

    let cancelled = false;

    async function fetchData() {
      // Reset state when slug changes
      setDestination(null);
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await getDestinationBySlug(slug);
        if (!cancelled) {
          if (data === null) {
            // API returned null = destination doesn't exist
            setNotFound(true);
          } else {
            setDestination(data);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(normalizeError(e));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { destination, isLoading, error, notFound };
}

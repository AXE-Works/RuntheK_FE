import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { buildDestinationSeo } from '@/lib/seo/buildDestinationSeo';
import { useDestination } from '@/hooks/useDestination';
import { DestinationContent } from '@/components/DestinationContent';
import { DestinationSkeleton } from '@/components/DestinationSkeleton';

/**
 * Dynamic destination page for API-fetched destinations
 * Uses URL pattern /destination/:slug and fetches data from API
 */
export function DestinationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { destination, isLoading, error, notFound } = useDestination(slug);

  // Show skeleton while loading
  if (isLoading) {
    return <DestinationSkeleton />;
  }

  // Redirect to home if destination not found or has error
  if (notFound || error || !destination) {
    return <Navigate to="/" replace />;
  }

  const seoData = buildDestinationSeo(destination, 'destination');

  const handlePlanTrip = () => {
    navigate('/', { state: { destination: destination.name, fromDestination: true } });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <Seo {...seoData} />
      <DestinationContent
        destination={destination}
        onPlanTrip={handlePlanTrip}
        onBackToHome={handleBackToHome}
      />
    </>
  );
}

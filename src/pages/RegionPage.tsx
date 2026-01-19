import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { buildDestinationSeo } from '@/lib/seo/buildDestinationSeo';
import { REGION_DATA, isValidRegionSlug } from '@/lib/seo/types';
import { DestinationContent } from '@/components/DestinationContent';

/**
 * Static region page for pre-defined destinations (Seoul, Busan, etc.)
 * Uses static data from REGION_DATA and 'region' URL pattern
 */
export function RegionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract region slug from pathname (e.g., "/seoul" or "/seoul/" -> "seoul")
  const regionSlug = location.pathname.replace(/^\/|\/$/g, '');

  // Validate region slug - if invalid, redirect to home
  if (!isValidRegionSlug(regionSlug)) {
    return <Navigate to="/" replace />;
  }

  const region = REGION_DATA[regionSlug];
  const seoData = buildDestinationSeo(region, 'region');

  const handlePlanTrip = () => {
    navigate('/', { state: { destination: region.name, fromRegion: true } });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <Seo {...seoData} />
      <DestinationContent
        destination={region}
        onPlanTrip={handlePlanTrip}
        onBackToHome={handleBackToHome}
      />
    </>
  );
}

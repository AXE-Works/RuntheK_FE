import { SeoProps, DestinationData, BASE_URL, JsonLdProps } from './types';

// URL pattern options: static regions use /seoul, dynamic uses /destination/gangneung
export type UrlPattern = 'region' | 'destination';

/**
 * Unified SEO builder for destination pages (both static and dynamic)
 *
 * @param data - Destination data (static REGION_DATA or API response)
 * @param urlPattern - 'region' for /seoul, 'destination' for /destination/gangneung
 * @returns SeoProps for Seo component
 */
export function buildDestinationSeo(
  data: DestinationData,
  urlPattern: UrlPattern = 'destination'
): SeoProps {
  // URL pattern determines the path
  const url = urlPattern === 'region'
    ? `${BASE_URL}/${data.slug}/`
    : `${BASE_URL}/destination/${data.slug}/`;

  // Use admin-provided values if available, otherwise auto-generate
  const title = data.metaTitle || `${data.name} Travel Guide 2025 | RunTheK`;
  const description = data.metaDescription ||
    `Plan your ${data.name} trip with AI-powered itineraries. ${data.description.slice(0, 100)}...`;
  const image = data.ogImage || data.imageUrl || `${BASE_URL}/og-image.png`;

  const touristDestinationJsonLd: JsonLdProps = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: data.name,
    description: data.description,
    url,
    image,
    touristType: ['Adventure tourists', 'Cultural tourists', 'Food tourists'],
    includesAttraction: data.highlights.map(highlight => ({
      '@type': 'TouristAttraction',
      name: highlight
    }))
  };

  const breadcrumbJsonLd: JsonLdProps = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${data.name} Travel Guide`,
        item: url
      }
    ]
  };

  return {
    title,
    description,
    canonical: url,
    openGraph: {
      title,
      description,
      url,
      image,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image
    },
    jsonLd: [touristDestinationJsonLd, breadcrumbJsonLd]
  };
}

/**
 * SEO builder for the home page
 */
export function buildHomeSeo(): SeoProps {
  return {
    title: 'Korean Experience Planner, Based on Your Taste | RunTheK',
    description: 'Plan your perfect Korea trip with AI-powered itineraries. Get personalized recommendations for Seoul, Busan, Jeju and more based on your interests, budget, and schedule.',
    canonical: `${BASE_URL}/`,
    openGraph: {
      title: 'Korean Experience Planner, Based on Your Taste | RunTheK',
      description: 'Plan your perfect Korea trip with AI-powered itineraries. Get personalized recommendations for Seoul, Busan, Jeju and more based on your interests, budget, and schedule.',
      url: `${BASE_URL}/`,
      image: `${BASE_URL}/og-image.png`,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Korean Experience Planner, Based on Your Taste | RunTheK',
      description: 'Plan your perfect Korea trip with AI-powered itineraries. Get personalized recommendations for Seoul, Busan, Jeju and more based on your interests, budget, and schedule.',
      image: `${BASE_URL}/og-image.png`
    }
  };
}

export const BASE_URL = 'https://runthek.com';

export interface OpenGraphProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
}

export interface TwitterProps {
  card?: 'summary' | 'summary_large_image';
  title: string;
  description: string;
  image?: string;
}

// Base JSON-LD interface
export interface BaseJsonLd {
  '@context': 'https://schema.org';
  '@type': string;
}

// Generic JSON-LD for backwards compatibility
export interface JsonLdProps extends BaseJsonLd {
  [key: string]: unknown;
}

// TouristDestination schema (schema.org/TouristDestination)
export interface TouristDestinationJsonLd extends BaseJsonLd {
  '@type': 'TouristDestination';
  name: string;
  description: string;
  url: string;
  image?: string;
  address?: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressRegion?: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  touristType?: string[];
}

// BreadcrumbList schema (schema.org/BreadcrumbList)
export interface BreadcrumbListJsonLd extends BaseJsonLd {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItemJsonLd[];
}

export interface BreadcrumbItemJsonLd {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

// Union type for all supported JSON-LD schemas
export type SupportedJsonLd = TouristDestinationJsonLd | BreadcrumbListJsonLd | JsonLdProps;

export interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: OpenGraphProps;
  twitter?: TwitterProps;
  jsonLd?: SupportedJsonLd | SupportedJsonLd[];
  noIndex?: boolean;
}

// Related itinerary type for destination page
export interface RelatedItinerary {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;        // "3 days"
  cities: string[];
  budget: string;          // "budget" | "mid-range" | "luxury"
  interests: string[];
  averageRating: number;
  viewCount: number;
  isFeatured: boolean;
  category: string;
  daysCount: number;
}

// Unified destination data type (static + dynamic)
export interface DestinationData {
  id?: number;                    // Dynamic destinations only (from API)
  slug: string;
  name: string;
  nameKo: string;                 // Korean name (renamed from koreanName)
  description: string;
  highlights: string[];
  imageUrl: string;
  metaTitle?: string;             // Optional (auto-generated if not provided)
  metaDescription?: string;       // Optional (auto-generated if not provided)
  ogImage?: string;               // Optional (falls back to imageUrl)
  relatedItineraries?: RelatedItinerary[]; // Related recommended tours
}

// Static region slugs
export type RegionSlug = 'seoul' | 'busan' | 'gyeongju' | 'jeonju' | 'jeju';

// Static region data (for pre-defined destinations)
export const REGION_DATA: Record<RegionSlug, DestinationData> = {
  seoul: {
    slug: 'seoul',
    name: 'Seoul',
    nameKo: '서울',
    description: "South Korea's vibrant capital, blending ancient palaces with modern skyscrapers, traditional markets with trendy shopping districts, and rich history with cutting-edge K-culture.",
    highlights: ['Gyeongbokgung Palace', 'Bukchon Hanok Village', 'Myeongdong Shopping', 'Hongdae Nightlife', 'N Seoul Tower'],
    metaTitle: 'Seoul Travel Guide 2025 - Plan Your Trip to Korea\'s Capital',
    metaDescription: 'Plan your Seoul trip with AI-powered itineraries. Explore palaces, K-pop hotspots, traditional markets, and modern attractions. Get personalized recommendations for your perfect Seoul adventure.',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200'
  },
  busan: {
    slug: 'busan',
    name: 'Busan',
    nameKo: '부산',
    description: "South Korea's coastal gem, famous for stunning beaches, fresh seafood, colorful temples perched on hillsides, and a vibrant port city culture.",
    highlights: ['Haeundae Beach', 'Gamcheon Culture Village', 'Haedong Yonggungsa Temple', 'Jagalchi Fish Market', 'Gwangalli Beach'],
    metaTitle: 'Busan Travel Guide 2025 - Beaches, Temples & Seafood',
    metaDescription: 'Explore Busan with custom AI itineraries. Discover beautiful beaches, hillside temples, fresh seafood markets, and vibrant nightlife. Plan your perfect Busan trip today.',
    imageUrl: 'https://images.unsplash.com/photo-1596419179126-6c308cf0e8fd?w=1200'
  },
  gyeongju: {
    slug: 'gyeongju',
    name: 'Gyeongju',
    nameKo: '경주',
    description: "The ancient capital of the Silla Kingdom, offering a treasure trove of UNESCO World Heritage sites, royal tombs, historic temples, and open-air museums.",
    highlights: ['Bulguksa Temple', 'Seokguram Grotto', 'Cheomseongdae Observatory', 'Anapji Pond', 'Gyeongju National Museum'],
    metaTitle: 'Gyeongju Travel Guide 2025 - Ancient Capital & UNESCO Sites',
    metaDescription: 'Discover Gyeongju, Korea\'s ancient Silla capital with AI-powered trip planning. Explore UNESCO World Heritage temples, royal tombs, and 2000 years of history.',
    imageUrl: 'https://images.unsplash.com/photo-1596419179126-6c308cf0e8fd?w=1200'
  },
  jeonju: {
    slug: 'jeonju',
    name: 'Jeonju',
    nameKo: '전주',
    description: "The birthplace of bibimbap and home to Korea's best-preserved traditional hanok village, offering authentic Korean cuisine, crafts, and cultural experiences.",
    highlights: ['Jeonju Hanok Village', 'Traditional Bibimbap', 'Gyeonggijeon Shrine', 'Omokdae Pavilion', 'Traditional Paper Making'],
    metaTitle: 'Jeonju Travel Guide 2025 - Traditional Food & Hanok Village',
    metaDescription: 'Experience Jeonju, birthplace of bibimbap and traditional hanok culture. Get AI-powered itineraries for Korean cuisine, crafts, and authentic cultural experiences.',
    imageUrl: 'https://images.unsplash.com/photo-1553354422-b6e0e1f9d162?w=1200'
  },
  jeju: {
    slug: 'jeju',
    name: 'Jeju Island',
    nameKo: '제주도',
    description: "South Korea's paradise island, featuring volcanic landscapes, pristine beaches, unique lava tube caves, and a relaxed island atmosphere perfect for nature lovers.",
    highlights: ['Hallasan National Park', 'Seongsan Ilchulbong', 'Manjanggul Lava Tube', 'Jeju Olle Trails', 'Cheonjiyeon Waterfall'],
    metaTitle: 'Jeju Island Travel Guide 2025 - Volcanic Wonders & Beaches',
    metaDescription: 'Plan your Jeju Island escape with AI-powered itineraries. Explore volcanic landscapes, beautiful beaches, UNESCO sites, and natural wonders. Your perfect island getaway awaits.',
    imageUrl: 'https://images.unsplash.com/photo-1596419179126-6c308cf0e8fd?w=1200'
  }
};

export function isValidRegionSlug(slug: string): slug is RegionSlug {
  return ['seoul', 'busan', 'gyeongju', 'jeonju', 'jeju'].includes(slug);
}

// API response types
export interface ApiDestinationResponse {
  success: boolean;
  data: DestinationData;
  error?: string;
}

export interface ApiDestinationListResponse {
  success: boolean;
  data: DestinationData[];
  error?: string;
}

// Error types for destination fetching
export type DestinationErrorCode =
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR'
  | 'INVALID_SLUG'
  | 'UNKNOWN';

export interface DestinationError {
  code: DestinationErrorCode;
  message: string;
  originalError?: Error;
}

import {
  TipDefinition,
  TipSelectionInput,
  TipSelectionConfig,
  SelectedTips,
  CityKey,
  SeasonKey,
  DEFAULT_CONFIG,
} from './types';
import { detectDestination } from './destinationDetector';
import { detectSeason } from './seasonDetector';

// ============================================================================
// Tip Definitions
// ============================================================================

/**
 * Common tips - applicable to all trips
 */
const COMMON_TIPS: TipDefinition[] = [
  {
    key: 'tips:dynamic.common.tmoney',
    category: 'common',
    priority: 1,
  },
  {
    key: 'tips:dynamic.common.cash',
    category: 'common',
    priority: 2,
  },
  {
    key: 'tips:dynamic.common.operatingHours',
    category: 'common',
    priority: 3,
  },
];

/**
 * City-specific tips
 */
const CITY_TIPS: Record<CityKey, TipDefinition[]> = {
  seoul: [
    {
      key: 'tips:dynamic.city.seoul.rushHour',
      category: 'city',
      priority: 1,
      cityKey: 'seoul',
    },
    {
      key: 'tips:dynamic.city.seoul.stairsDistance',
      category: 'city',
      priority: 2,
      cityKey: 'seoul',
    },
  ],
  busan: [
    {
      key: 'tips:dynamic.city.busan.coastalWind',
      category: 'city',
      priority: 1,
      cityKey: 'busan',
    },
    {
      key: 'tips:dynamic.city.busan.hills',
      category: 'city',
      priority: 2,
      cityKey: 'busan',
    },
  ],
  jeju: [
    {
      key: 'tips:dynamic.city.jeju.carRental',
      category: 'city',
      priority: 1,
      cityKey: 'jeju',
    },
    {
      key: 'tips:dynamic.city.jeju.weatherChange',
      category: 'city',
      priority: 2,
      cityKey: 'jeju',
    },
  ],
  gyeongju: [
    {
      key: 'tips:dynamic.city.gyeongju.historicSites',
      category: 'city',
      priority: 1,
      cityKey: 'gyeongju',
    },
    {
      key: 'tips:dynamic.city.gyeongju.bikeRental',
      category: 'city',
      priority: 2,
      cityKey: 'gyeongju',
    },
  ],
  gangneung: [
    {
      key: 'tips:dynamic.city.gangneung.coffeeStreet',
      category: 'city',
      priority: 1,
      cityKey: 'gangneung',
    },
    {
      key: 'tips:dynamic.city.gangneung.seafood',
      category: 'city',
      priority: 2,
      cityKey: 'gangneung',
    },
  ],
  other: [
    {
      key: 'tips:dynamic.city.other.localTransport',
      category: 'city',
      priority: 1,
      cityKey: 'other',
    },
    {
      key: 'tips:dynamic.city.other.translation',
      category: 'city',
      priority: 2,
      cityKey: 'other',
    },
  ],
};

/**
 * Season-specific tips
 */
const SEASON_TIPS: Record<SeasonKey, TipDefinition[]> = {
  summer: [
    {
      key: 'tips:dynamic.season.summer.heatHumidity',
      category: 'season',
      priority: 1,
      seasonKey: 'summer',
    },
  ],
  winter: [
    {
      key: 'tips:dynamic.season.winter.iceEarlySunset',
      category: 'season',
      priority: 1,
      seasonKey: 'winter',
    },
  ],
  rainy: [
    {
      key: 'tips:dynamic.season.rainy.indoorAlternatives',
      category: 'season',
      priority: 1,
      seasonKey: 'rainy',
    },
  ],
  spring: [
    {
      key: 'tips:dynamic.season.spring.cherryBlossomCrowds',
      category: 'season',
      priority: 1,
      seasonKey: 'spring',
    },
  ],
  fall: [
    {
      key: 'tips:dynamic.season.fall.perfectWeather',
      category: 'season',
      priority: 1,
      seasonKey: 'fall',
    },
  ],
};

// ============================================================================
// Selection Algorithm
// ============================================================================

/**
 * Selects appropriate tips based on itinerary, destination, and season
 * Returns up to 5 tips: 2 common + 1-2 city + 1 season
 */
export function selectTips(
  input: TipSelectionInput,
  config: TipSelectionConfig = DEFAULT_CONFIG
): SelectedTips {
  const {
    maxCommonTips = 2,
    maxCityTips = 2,
    maxSeasonTips = 1,
    maxTotalTips = 5,
  } = config;

  const selectedTips: TipDefinition[] = [];

  // Detect city and season
  const detectedCity = detectDestination(input.itinerary, input.cities);
  const detectedSeason = detectSeason(input.startDate);

  // 1. Select common tips (sorted by priority)
  const sortedCommonTips = [...COMMON_TIPS].sort((a, b) => a.priority - b.priority);
  const commonTipsToAdd = sortedCommonTips.slice(0, maxCommonTips);
  selectedTips.push(...commonTipsToAdd);

  // 2. Select city-specific tips
  const cityTips = CITY_TIPS[detectedCity] || CITY_TIPS.other;
  const sortedCityTips = [...cityTips].sort((a, b) => a.priority - b.priority);
  const cityTipsToAdd = sortedCityTips.slice(0, maxCityTips);
  selectedTips.push(...cityTipsToAdd);

  // 3. Select season-specific tips (if season detected)
  let seasonTipsCount = 0;
  if (detectedSeason) {
    const seasonTips = SEASON_TIPS[detectedSeason] || [];
    const sortedSeasonTips = [...seasonTips].sort((a, b) => a.priority - b.priority);
    const seasonTipsToAdd = sortedSeasonTips.slice(0, maxSeasonTips);
    selectedTips.push(...seasonTipsToAdd);
    seasonTipsCount = seasonTipsToAdd.length;
  }

  // 4. Enforce max total tips limit
  const finalTips = selectedTips.slice(0, maxTotalTips);

  return {
    tips: finalTips,
    metadata: {
      detectedCity,
      detectedSeason,
      tipCounts: {
        common: commonTipsToAdd.length,
        city: cityTipsToAdd.length,
        season: seasonTipsCount,
      },
    },
  };
}

/**
 * Gets all available tips for a specific category (for debugging/admin)
 */
export function getAllTipsForCategory(category: 'common' | 'city' | 'season'): TipDefinition[] {
  switch (category) {
    case 'common':
      return COMMON_TIPS;
    case 'city':
      return Object.values(CITY_TIPS).flat();
    case 'season':
      return Object.values(SEASON_TIPS).flat();
    default:
      return [];
  }
}

/**
 * Gets tips for a specific city
 */
export function getTipsForCity(cityKey: CityKey): TipDefinition[] {
  return CITY_TIPS[cityKey] || CITY_TIPS.other;
}

/**
 * Gets tips for a specific season
 */
export function getTipsForSeason(seasonKey: SeasonKey): TipDefinition[] {
  return SEASON_TIPS[seasonKey] || [];
}

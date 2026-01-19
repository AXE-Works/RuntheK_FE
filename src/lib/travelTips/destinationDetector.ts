import { ItineraryData } from '../../App';
import { CityKey } from './types';

const CITY_PATTERNS: Record<CityKey, RegExp[]> = {
  seoul: [/seoul/i, /서울/i, /gangnam/i, /myeongdong/i, /hongdae/i, /itaewon/i, /insadong/i, /bukchon/i],
  busan: [/busan/i, /부산/i, /haeundae/i, /gamcheon/i, /jagalchi/i],
  jeju: [/jeju/i, /제주/i, /hallasan/i, /seongsan/i, /udo/i],
  gyeongju: [/gyeongju/i, /경주/i, /bulguksa/i, /seokguram/i],
  gangneung: [/gangneung/i, /강릉/i, /sokcho/i, /속초/i],
  other: [],
};

const NOT_SURE_VALUES = ['not sure', 'not decided', 'unsure', '미정', 'undecided'];

/**
 * Detects the primary city from the itinerary and user selections
 * Returns 'seoul' as default for "Not Sure" selections
 */
export function detectDestination(
  itinerary: ItineraryData,
  selectedCities?: string[]
): CityKey {
  // Priority 1: Check selected cities
  if (selectedCities && selectedCities.length > 0) {
    for (const city of selectedCities) {
      const normalizedCity = city.toLowerCase().trim();

      // Handle "Not Sure" case - default to Seoul
      if (NOT_SURE_VALUES.some(v => normalizedCity.includes(v))) {
        return 'seoul';
      }

      // Match against city patterns
      for (const [cityKey, patterns] of Object.entries(CITY_PATTERNS)) {
        if (cityKey === 'other') continue;

        for (const pattern of patterns) {
          if (pattern.test(city)) {
            return cityKey as CityKey;
          }
        }
      }
    }
  }

  // Priority 2: Check itinerary title
  const title = itinerary.title?.toLowerCase() || '';
  for (const [cityKey, patterns] of Object.entries(CITY_PATTERNS)) {
    if (cityKey === 'other') continue;

    for (const pattern of patterns) {
      if (pattern.test(title)) {
        return cityKey as CityKey;
      }
    }
  }

  // Priority 3: Check activity locations
  const allLocations: string[] = [];
  for (const day of itinerary.days) {
    for (const activity of day.activities) {
      if (activity.location) {
        allLocations.push(activity.location);
      }
    }
  }

  // Count city mentions in locations
  const cityCounts: Record<CityKey, number> = {
    seoul: 0,
    busan: 0,
    jeju: 0,
    gyeongju: 0,
    gangneung: 0,
    other: 0,
  };

  for (const location of allLocations) {
    for (const [cityKey, patterns] of Object.entries(CITY_PATTERNS)) {
      if (cityKey === 'other') continue;

      for (const pattern of patterns) {
        if (pattern.test(location)) {
          cityCounts[cityKey as CityKey]++;
          break;
        }
      }
    }
  }

  // Find the city with the most mentions
  let maxCount = 0;
  let detectedCity: CityKey = 'seoul'; // Default fallback

  for (const [cityKey, count] of Object.entries(cityCounts)) {
    if (cityKey !== 'other' && count > maxCount) {
      maxCount = count;
      detectedCity = cityKey as CityKey;
    }
  }

  // If no specific city detected, return 'other' for generic tips
  if (maxCount === 0) {
    return 'other';
  }

  return detectedCity;
}

/**
 * Maps user-selected city names to CityKey
 */
export function mapCityToCityKey(city: string): CityKey {
  const normalizedCity = city.toLowerCase().trim();

  if (NOT_SURE_VALUES.some(v => normalizedCity.includes(v))) {
    return 'seoul';
  }

  for (const [cityKey, patterns] of Object.entries(CITY_PATTERNS)) {
    if (cityKey === 'other') continue;

    for (const pattern of patterns) {
      if (pattern.test(city)) {
        return cityKey as CityKey;
      }
    }
  }

  return 'other';
}

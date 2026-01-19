import { SeasonKey } from './types';

/**
 * Korean rainy season (장마) typically runs from mid-June to mid-July
 */
const RAINY_SEASON = {
  startMonth: 6,  // June
  startDay: 15,
  endMonth: 7,    // July
  endDay: 15,
};

/**
 * Detects the season based on the start date
 * Returns null if no date provided
 *
 * Season mapping:
 * - Spring: March 1 - May 31
 * - Summer: June 1 - August 31 (Rainy: June 15 - July 15 takes priority)
 * - Fall: September 1 - November 30
 * - Winter: December 1 - February 28/29
 */
export function detectSeason(startDate?: Date): SeasonKey | null {
  if (!startDate) {
    return null;
  }

  const date = new Date(startDate);
  const month = date.getMonth() + 1; // 0-indexed to 1-indexed
  const day = date.getDate();

  // Priority check: Rainy season (장마)
  if (isRainySeason(month, day)) {
    return 'rainy';
  }

  // Standard season detection
  if (month >= 3 && month <= 5) {
    return 'spring';
  }

  if (month >= 6 && month <= 8) {
    return 'summer';
  }

  if (month >= 9 && month <= 11) {
    return 'fall';
  }

  // December, January, February
  return 'winter';
}

/**
 * Checks if the date falls within the Korean rainy season (장마)
 */
function isRainySeason(month: number, day: number): boolean {
  // June 15 to June 30
  if (month === RAINY_SEASON.startMonth && day >= RAINY_SEASON.startDay) {
    return true;
  }

  // July 1 to July 15
  if (month === RAINY_SEASON.endMonth && day <= RAINY_SEASON.endDay) {
    return true;
  }

  return false;
}

/**
 * Gets a human-readable season name for display
 */
export function getSeasonDisplayName(season: SeasonKey): string {
  const names: Record<SeasonKey, string> = {
    spring: 'Spring',
    summer: 'Summer',
    fall: 'Fall',
    winter: 'Winter',
    rainy: 'Rainy Season',
  };
  return names[season];
}

/**
 * Gets the typical temperature range for a season in Korea
 */
export function getSeasonTemperatureRange(season: SeasonKey): { min: number; max: number } {
  const ranges: Record<SeasonKey, { min: number; max: number }> = {
    spring: { min: 8, max: 20 },   // 8-20°C
    summer: { min: 23, max: 33 },  // 23-33°C
    fall: { min: 10, max: 22 },    // 10-22°C
    winter: { min: -6, max: 5 },   // -6 to 5°C
    rainy: { min: 22, max: 30 },   // 22-30°C (humid)
  };
  return ranges[season];
}

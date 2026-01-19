import { TFunction } from 'i18next';
import {
  TipSelectionInput,
  TipSelectionConfig,
  SelectedTips,
  TipDefinition,
  DEFAULT_CONFIG,
} from './types';
import { selectTips } from './tipSelection';

// Re-export types
export type {
  TipCategory,
  CityKey,
  SeasonKey,
  TipDefinition,
  TipSelectionInput,
  TipSelectionConfig,
  TipMetadata,
  SelectedTips,
} from './types';

// Re-export utilities
export { detectDestination, mapCityToCityKey } from './destinationDetector';
export { detectSeason, getSeasonDisplayName, getSeasonTemperatureRange } from './seasonDetector';
export { selectTips, getAllTipsForCategory, getTipsForCity, getTipsForSeason } from './tipSelection';

/**
 * Main entry point - Gets travel tips based on itinerary and conditions
 *
 * @param input - Itinerary data and optional travel conditions
 * @param config - Optional configuration for tip selection limits
 * @returns Selected tips with metadata
 *
 * @example
 * ```tsx
 * const { tips, metadata } = getTravelTips({
 *   itinerary: currentItinerary,
 *   startDate: new Date('2024-07-15'),
 *   cities: ['Seoul', 'Busan'],
 * });
 * ```
 */
export function getTravelTips(
  input: TipSelectionInput,
  config: TipSelectionConfig = DEFAULT_CONFIG
): SelectedTips {
  return selectTips(input, config);
}

/**
 * Convenience function that returns translated tip strings directly
 *
 * @param input - Itinerary data and optional travel conditions
 * @param t - i18next translation function (from useTranslation hook)
 * @param config - Optional configuration for tip selection limits
 * @returns Array of translated tip strings ready for display
 *
 * @example
 * ```tsx
 * const { t } = useTranslation('tips');
 * const tips = getTranslatedTips(
 *   { itinerary, startDate, cities },
 *   t
 * );
 * // tips = ["T-money cards work on...", "Avoid rush hour...", ...]
 * ```
 */
export function getTranslatedTips(
  input: TipSelectionInput,
  t: TFunction,
  config: TipSelectionConfig = DEFAULT_CONFIG
): string[] {
  const { tips } = getTravelTips(input, config);

  return tips.map((tip: TipDefinition) => {
    // The key format is "tips:dynamic.category.subcategory.tipName"
    // We need to extract the path after "tips:" for translation
    const translationKey = tip.key.replace('tips:', '');
    return t(translationKey, { ns: 'tips' });
  });
}

/**
 * Gets tips with full metadata (for debugging or advanced use cases)
 */
export function getTravelTipsWithMetadata(
  input: TipSelectionInput,
  t: TFunction,
  config: TipSelectionConfig = DEFAULT_CONFIG
): {
  tips: string[];
  metadata: SelectedTips['metadata'];
  rawTips: TipDefinition[];
} {
  const result = getTravelTips(input, config);

  return {
    tips: result.tips.map((tip) => {
      const translationKey = tip.key.replace('tips:', '');
      return t(translationKey, { ns: 'tips' });
    }),
    metadata: result.metadata,
    rawTips: result.tips,
  };
}

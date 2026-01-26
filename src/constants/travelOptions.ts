/**
 * Shared travel style options for use across the application
 * Used in: TravelPlanForm, AdminItineraryEditor
 */

export const TRAVEL_STYLE_OPTIONS = [
  {
    value: 'relaxed',
    label: 'Relaxed Pace',
    labelKey: 'relaxedLabel',
    descKey: 'relaxedDesc',
    description: '2-3 activities per day, plenty of free time'
  },
  {
    value: 'balanced',
    label: 'Balanced',
    labelKey: 'balancedLabel',
    descKey: 'balancedDesc',
    description: '4-5 activities per day with breaks'
  },
  {
    value: 'packed',
    label: 'Packed Schedule',
    labelKey: 'packedLabel',
    descKey: 'packedDesc',
    description: 'Maximize experiences, full days'
  }
] as const;

export type TravelStyleValue = typeof TRAVEL_STYLE_OPTIONS[number]['value'];

/**
 * Get display label for a travel style value
 */
export function getTravelStyleLabel(value: string | null | undefined): string {
  if (!value) return '';
  const option = TRAVEL_STYLE_OPTIONS.find(opt => opt.value === value.toLowerCase());
  return option?.label || value;
}

/**
 * Mapping from TravelStyle to API budget parameter (for AI schedule generation)
 * Note: This is a legacy mapping used when calling the AI API
 */
export const TRAVEL_STYLE_TO_BUDGET_API: Record<string, string> = {
  'relaxed': 'budget',
  'balanced': 'mid-range',
  'packed': 'luxury',
};

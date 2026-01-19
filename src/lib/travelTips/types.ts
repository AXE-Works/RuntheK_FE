import { ItineraryData } from '../../App';

export type TipCategory = 'common' | 'city' | 'season';

export type CityKey = 'seoul' | 'busan' | 'jeju' | 'gyeongju' | 'gangneung' | 'other';

export type SeasonKey = 'summer' | 'winter' | 'rainy' | 'spring' | 'fall';

export interface TipDefinition {
  key: string;
  category: TipCategory;
  priority: number;
  cityKey?: CityKey;
  seasonKey?: SeasonKey;
}

export interface TipSelectionInput {
  itinerary: ItineraryData;
  startDate?: Date;
  cities?: string[];
}

export interface TipSelectionConfig {
  maxCommonTips?: number;
  maxCityTips?: number;
  maxSeasonTips?: number;
  maxTotalTips?: number;
}

export interface TipMetadata {
  detectedCity: CityKey;
  detectedSeason: SeasonKey | null;
  tipCounts: {
    common: number;
    city: number;
    season: number;
  };
}

export interface SelectedTips {
  tips: TipDefinition[];
  metadata: TipMetadata;
}

export const DEFAULT_CONFIG: TipSelectionConfig = {
  maxCommonTips: 2,
  maxCityTips: 2,
  maxSeasonTips: 1,
  maxTotalTips: 5,
};

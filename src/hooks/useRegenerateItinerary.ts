import { toast } from 'sonner';
import { useItineraryDraft } from '@/providers/ItineraryDraftProvider';
import { modifySchedule, ScheduleApiError } from '@/services/scheduleApi';

export interface UseRegenerateItineraryOptions {
  /**
   * Wraps `setIsGenerating` + `setGenerationStartTime` in App.tsx. Injected so
   * the overlay state stays in App.tsx until PR-7 relocates it to PlanPage.
   */
  setIsGenerating: (generating: boolean) => void;
}

export interface UseRegenerateItineraryResult {
  regenerate: (additionalNotes: string) => Promise<void>;
}

export function useRegenerateItinerary(
  options: UseRegenerateItineraryOptions,
): UseRegenerateItineraryResult {
  const { currentItinerary, rawAIResponse, applyRegenerateResult } = useItineraryDraft();

  const regenerate = async (additionalNotes: string) => {
    if (!currentItinerary || !rawAIResponse) {
      toast.error('No itinerary to modify. Please generate an itinerary first.');
      return;
    }

    options.setIsGenerating(true);

    try {
      const result = await modifySchedule(rawAIResponse.id, additionalNotes);

      applyRegenerateResult(result.itinerary, result.rawAIResponse);

      toast.success('Itinerary has been regenerated with your changes!');
    } catch (error) {
      console.error('[App] Failed to modify itinerary:', error);

      if (error instanceof ScheduleApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to regenerate itinerary. Please try again.');
      }
    } finally {
      options.setIsGenerating(false);
    }
  };

  return { regenerate };
}

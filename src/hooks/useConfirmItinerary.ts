import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { useItineraryDraft } from '@/providers/ItineraryDraftProvider';
import { appendConfirmedTrip, type ConfirmedTrip } from '@/lib/trips/tripStorage';
import { saveTripWithItinerary } from '@/services/tripApi';
import type { ItineraryData } from '@/App';

export interface UseConfirmItineraryOptions {
  /**
   * Called after a successful BE save, a local fallback save, or a no-rawAIResponse
   * local save. Wired by App.tsx to `() => setActiveTab('my-trips')` until PR-8/9
   * replaces tab state with `navigate('/my-trips')`.
   */
  onSaveSuccess?: () => void;
}

export interface UseConfirmItineraryResult {
  confirm: (itinerary: ItineraryData) => Promise<void>;
  isSaving: boolean;
}

export function useConfirmItinerary(
  options?: UseConfirmItineraryOptions,
): UseConfirmItineraryResult {
  const { currentUser, openAuthModal } = useAuth();
  const { rawAIResponse, userBudget, clearRawResponse } = useItineraryDraft();
  const [isSaving, setIsSaving] = useState(false);

  const confirm = async (itinerary: ItineraryData) => {
    if (!currentUser) {
      toast.error('Please login to save your trip');
      openAuthModal();
      return;
    }

    if (rawAIResponse) {
      setIsSaving(true);
      try {
        const response = await saveTripWithItinerary(
          rawAIResponse,
          userBudget,
          itinerary.title,
        );

        console.log('Trip saved to BE:', response);
        toast.success('Trip saved successfully!');

        const confirmedTrip: ConfirmedTrip = {
          id: response.data.tripId,
          tripId: response.data.tripId,
          itineraryId: response.data.itineraryId,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userCountry: currentUser.country,
          title: response.data.title || itinerary.title,
          duration: itinerary.duration,
          interests: itinerary.interests,
          budget: itinerary.budget,
          cities: response.data.cities || [],
          createdAt: response.data.createdAt || new Date().toISOString().split('T')[0],
          status: response.data.status || 'UPCOMING',
          totalCost: itinerary.totalEstimatedCost,
          itineraryData: itinerary,
          confirmed: true,
        };

        appendConfirmedTrip(confirmedTrip);
        clearRawResponse();
        options?.onSaveSuccess?.();
      } catch (error) {
        console.error('Failed to save trip to BE:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to save trip. Please try again.',
        );

        const confirmedTrip: ConfirmedTrip = {
          id: Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userCountry: currentUser.country,
          title: itinerary.title,
          duration: itinerary.duration,
          interests: itinerary.interests,
          budget: itinerary.budget,
          cities: [],
          createdAt: new Date().toISOString().split('T')[0],
          status: 'UPCOMING',
          totalCost: itinerary.totalEstimatedCost,
          itineraryData: itinerary,
          confirmed: true,
          savedLocally: true,
        };

        appendConfirmedTrip(confirmedTrip);

        toast.info('Trip saved locally. Will sync when online.');
        options?.onSaveSuccess?.();
      } finally {
        setIsSaving(false);
      }
    } else {
      const confirmedTrip: ConfirmedTrip = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userCountry: currentUser.country,
        title: itinerary.title,
        duration: itinerary.duration,
        interests: itinerary.interests,
        budget: itinerary.budget,
        cities: [],
        createdAt: new Date().toISOString().split('T')[0],
        status: 'UPCOMING',
        totalCost: itinerary.totalEstimatedCost,
        itineraryData: itinerary,
        confirmed: true,
      };

      appendConfirmedTrip(confirmedTrip);
      console.log('Confirmed trip saved locally:', confirmedTrip);

      options?.onSaveSuccess?.();
    }
  };

  return { confirm, isSaving };
}

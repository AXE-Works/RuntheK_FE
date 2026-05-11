import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Mail, Save, Share2 } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { buildHomeSeo } from '@/lib/seo/buildDestinationSeo';
import { downloadItineraryPdf } from '@/lib/itinerary/downloadItineraryPdf';
import { useConfirmItinerary } from '@/hooks/useConfirmItinerary';
import { useRegenerateItinerary } from '@/hooks/useRegenerateItinerary';
import { TravelPlanForm } from '@/components/TravelPlanForm';
import { ItineraryDisplay } from '@/components/ItineraryDisplay';
import { GeneratingOverlay } from '@/components/GeneratingOverlay';
import { RecommendedItineraryDetailPage } from '@/components/RecommendedItineraryDetailPage';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { useEvents } from '@/providers/EventsProvider';
import { useItineraryDraft } from '@/providers/ItineraryDraftProvider';
import type { ItineraryData } from '@/App';
import type { ScheduleGenerateResponse } from '@/services/scheduleApi';

export function PlanPage() {
  const { currentUser } = useAuth();
  const { events } = useEvents();
  const {
    currentItinerary,
    userStartDate,
    userSelectedCities,
    selectedDestination,
    setItinerary,
    updateTitle,
    selectDestination,
    resetDraft,
  } = useItineraryDraft();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [selectedBannerDetail, setSelectedBannerDetail] = useState<any>(null);

  const { t, i18n } = useTranslation();
  // TravelPlanForm 의 language prop 은 'ko'|'en'|'ja'|'zh' 형식을 기대.
  // i18next 가 'ko-KR' 같은 region 코드를 반환할 수 있으므로 short code 로 변환.
  const language = (i18n.language.split('-')[0] || 'en') as 'ko' | 'en' | 'ja' | 'zh';
  const location = useLocation();
  const navigate = useNavigate();

  // RegionPage / DestinationPage 에서 navigate('/plan', { state: {...} }) 진입 시 처리.
  // 기존 App.tsx 의 setShowHero(false)/setActiveTab('plan') 은 PR-9 잔존 영역이라 호출 안 함.
  useEffect(() => {
    if (location.state?.fromRegion || location.state?.fromDestination) {
      if (location.state.destination) {
        selectDestination({ name: location.state.destination });
      }
      // Clear state to prevent re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, selectDestination]);

  const handleSetIsGenerating = (generating: boolean) => {
    setIsGenerating(generating);
    setGenerationStartTime(generating ? Date.now() : null);
  };

  const handleItineraryGenerated = (
    itinerary: ItineraryData,
    rawResponse?: ScheduleGenerateResponse,
    budget?: string,
    startDate?: Date,
    cities?: string[],
  ) => {
    setItinerary(itinerary, rawResponse, budget, startDate, cities);
  };

  const { regenerate: handleRegenerateItinerary } = useRegenerateItinerary({
    setIsGenerating: handleSetIsGenerating,
  });

  const handleTitleChange = (newTitle: string) => {
    updateTitle(newTitle);
  };

  const { confirm: handleConfirmItinerary } = useConfirmItinerary({
    onSaveSuccess: () => navigate('/my-trips'),
  });

  const handleNewPlan = () => {
    resetDraft();
  };

  const handleDestinationSelect = (destination: any) => {
    selectDestination(destination);
    setSelectedBannerDetail(null);
  };

  const handleBannerDetail = (banner: any) => {
    setSelectedBannerDetail(banner);
  };

  return (
    <>
      <Seo {...buildHomeSeo()} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
        {selectedBannerDetail ? (
          <RecommendedItineraryDetailPage
            banner={selectedBannerDetail}
            onBack={() => setSelectedBannerDetail(null)}
            onApplyToTrip={handleDestinationSelect}
          />
        ) : !currentItinerary ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-[20px]">
                {t('hero.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                {t('hero.subtitle')}
              </p>
            </div>

            <TravelPlanForm
              onItineraryGenerated={handleItineraryGenerated}
              isGenerating={isGenerating}
              setIsGenerating={handleSetIsGenerating}
              selectedDestination={selectedDestination}
              onDestinationSelect={handleDestinationSelect}
              currentUser={currentUser}
              events={events}
              language={language}
              onBannerDetailView={handleBannerDetail}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-4xl mx-auto mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('itinerary.title')}</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 h-10 w-10"
                    title={t('trips:itinerary.actions.email')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 h-10 w-10"
                    title={t('trips:itinerary.actions.download')}
                    onClick={() => downloadItineraryPdf(t)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 h-10 w-10"
                    title={t('trips:itinerary.actions.share')}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ItineraryDisplay
              itinerary={currentItinerary}
              onEdit={handleNewPlan}
              onConfirm={handleConfirmItinerary}
              onRegenerate={handleRegenerateItinerary}
              onTitleChange={handleTitleChange}
              startDate={userStartDate}
              selectedCities={userSelectedCities}
            />
          </motion.div>
        )}
      </main>

      <GeneratingOverlay isVisible={isGenerating} startTime={generationStartTime} />
    </>
  );
}

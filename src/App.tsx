/**
 * Korea Travel AI Assistant
 * Version: 3.0.0
 * Last Updated: 2024-01-09
 * 
 * Features:
 * - Korean destination recommendation banners with detail pages
 * - English Plan Trip interface / Korean Admin interface
 * - Dropdown nationality selection
 * - Google social login & email signup with verification
 * - Admin user itinerary management
 * - Enhanced event management system
 * - Popular destinations image banners
 * - Interactive destination selection with auto-form filling
 * - Country-specific travel route banners with immersive visuals
 * - Mobile-optimized responsive design
 * - Auto-generated regional travel banners with editing capability
 * - Step 4 additional notes for personalized trip planning
 * - Banner management system with real-time editing
 * - Enhanced hero section with travel-focused background animations
 * - Redesigned Most Popular Destinations banner (Figma implementation)
 * - Extended daily itineraries (5-7 activities including meals)
 * - Advanced admin dashboard with ratings, destinations, and event parameter management
 * - Interactive activity rating system with 5-star ratings and like/dislike feedback
 * - Popular activities dashboard with real-time analytics and ranking system
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from './components/seo/Seo';
import { buildHomeSeo } from './lib/seo/buildDestinationSeo';
import { downloadItineraryPdf } from './lib/itinerary/downloadItineraryPdf';
import { useConfirmItinerary } from './hooks/useConfirmItinerary';
import { useRegenerateItinerary } from './hooks/useRegenerateItinerary';
import { TravelPlanForm } from './components/TravelPlanForm';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { AdminDashboard } from './components/AdminDashboard';
import { MyTrip } from './components/MyTrip';
import { AuthModal } from './components/AuthModal';
import { GeneratingOverlay } from './components/GeneratingOverlay';
import { RecommendedItineraryDetailPage } from './components/RecommendedItineraryDetailPage';
import { Button } from './components/ui/button';
import { Tabs, TabsContent } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { MapPin, Users, BarChart, ArrowLeft, Mail, Save, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import logo from '@/assets/ade16fc310679880d8b27a51a4119372559298ac.png';
import { LanguageSelector } from './components/header/LanguageSelector';
import { UserMenu } from './components/header/UserMenu';
import { useAuth } from './providers/AuthProvider';
import { useEvents } from './providers/EventsProvider';
import { useItineraryDraft } from './providers/ItineraryDraftProvider';
import type { ScheduleGenerateResponse } from './services/scheduleApi';

export interface ItineraryData {
  id: string;
  title: string;
  duration: string;
  interests: string[];
  budget: string;
  days: {
    day: number;
    title: string;
    activities: {
      time: string;
      activity: string;
      location: string;
      description: string;
      estimatedCost: string;
      isEvent?: boolean;
      eventType?: string;
      googleMapsUrl?: string;
      transportMode?: 'walking' | 'transit' | 'driving';
      transportDuration?: number;      // 이동시간 (분)
      transportDistance?: number;      // 이동거리 (km)
      transportDetails?: string;       // 대중교통 상세 (예: "2호선 → 3호선 환승")
      transportCost?: string;          // 예상 교통비
    }[];
  }[];
  totalEstimatedCost: string;
  travelTips?: string[];
}

export interface UserInput {
  duration?: string;
  cities: string[];
  budget: string;
  interests: string[];
  nationality?: string;
  additionalNotes?: string;
  startDate?: Date;
}

interface AppProps {
  // Phase 2 PR-2 임시 prop. 작업 7(별도 세션)에서 페이지 본격 분리 후 제거 예정.
  initialTab?: 'plan' | 'my-trips' | 'admin';
}

export default function App({ initialTab }: AppProps = {}) {
  const {
    currentUser,
    isAuthModalOpen,
    login,
    logout,
    updateUser,
    openAuthModal,
    closeAuthModal,
  } = useAuth();
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
  const [activeTab, setActiveTab] = useState<string>(initialTab ?? "plan");
  const [showHero, setShowHero] = useState(false); // Landing page disabled
  const [myTripsDefaultTab, setMyTripsDefaultTab] = useState<string>("my-trips");
  const { events, setEvents } = useEvents();
  const [language, setLanguage] = useState<'ko' | 'en' | 'ja' | 'zh'>('en');
  const [selectedBannerDetail, setSelectedBannerDetail] = useState<any>(null);

  const languageOptions = [
    { code: 'ko' as const, label: '한국어', flag: '🇰🇷' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' },
    { code: 'ja' as const, label: '日本語', flag: '🇯🇵' },
    { code: 'zh' as const, label: '中文', flag: '🇨🇳' },
  ];

  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  // Handle navigation from RegionPage or DestinationPage
  useEffect(() => {
    if (location.state?.fromRegion || location.state?.fromDestination) {
      setShowHero(false);
      setActiveTab('plan');
      if (location.state.destination) {
        selectDestination({ name: location.state.destination });
      }
      // Clear state to prevent re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, selectDestination]);

  // PR-7 C2 임시 가교: AppLayout 의 UserMenu 가 navigate('/my-trips?tab=profile') 로 진입할 때
  // App.tsx 의 myTripsDefaultTab state를 동기화한다. PR-8 에서 MyTripsPage 가 직접
  // search param 을 읽으면 이 useEffect 는 제거된다.
  useEffect(() => {
    if (location.pathname === '/my-trips') {
      const tab = new URLSearchParams(location.search).get('tab');
      setMyTripsDefaultTab(tab === 'profile' ? 'profile' : 'my-trips');
    }
  }, [location.pathname, location.search]);

  // Sync language state with i18n
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // auth:logout 시 페이지 전환 (showHero/activeTab) 만 처리.
  // currentItinerary/selectedDestination 리셋은 ItineraryDraftProvider 가 자체 구독.
  useEffect(() => {
    const handleAuthLogout = () => {
      setShowHero(true);
      setActiveTab("plan");
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const handleItineraryGenerated = (
    itinerary: ItineraryData,
    rawResponse?: ScheduleGenerateResponse,
    budget?: string,
    startDate?: Date,
    cities?: string[],
  ) => {
    setItinerary(itinerary, rawResponse, budget, startDate, cities);
  };

  // Wrapper function to manage both isGenerating and generationStartTime
  const handleSetIsGenerating = (generating: boolean) => {
    setIsGenerating(generating);
    setGenerationStartTime(generating ? Date.now() : null);
  };

  const { regenerate: handleRegenerateItinerary } = useRegenerateItinerary({
    setIsGenerating: handleSetIsGenerating,
  });

  // Handle title change from ItineraryDisplay
  const handleTitleChange = (newTitle: string) => {
    updateTitle(newTitle);
  };

  const { confirm: handleConfirmItinerary } = useConfirmItinerary({
    // PR-7 C2: navigate('/my-trips')도 함께 호출해 URL을 동기화한다. setActiveTab만
    // 변경할 경우 URL은 /plan 그대로라 UserMenu의 navigate('/plan') 기반 logout이
    // no-op이 되어 MyTrip이 unmount되지 않은 채 setCurrentUser(null)가 호출되고
    // MyTrip L230 conditional early return으로 Rules of Hooks 위반이 폭발한다.
    // setActiveTab 호출은 PR-9 까지 URL/state 양쪽 동기화를 위해 잔류.
    onSaveSuccess: () => {
      setActiveTab('my-trips');
      navigate('/my-trips');
    },
  });

  const handleNewPlan = () => {
    setShowHero(false);
    setActiveTab("plan");
    resetDraft();
  };

  const handleBackToHome = () => {
    setShowHero(true);
    setActiveTab("plan");
    resetDraft();
  };

  const handleLogout = async () => {
    // 페이지 전환 + draft 리셋을 await 전에 동기 실행해 my-trips/admin TabsContent를
    // unmount한 후 logout 호출. AuthProvider.logout()의 setCurrentUser(null) batch와
    // 여기 setState batch가 await로 분리되어, currentUser=null 중간 render에서
    // MyTrip의 conditional hook 위반이 노출되는 것을 회피한다.
    setShowHero(true);
    setActiveTab("plan");
    resetDraft();
    await logout();
  };

  const handleDestinationSelect = (destination: any) => {
    setShowHero(false);
    setActiveTab("plan");
    selectDestination(destination);
    // Clear banner detail page if open
    setSelectedBannerDetail(null);
  };

  const handleBannerDetail = (banner: any) => {
    setSelectedBannerDetail(banner);
  };

  const handleGoToMyTrips = () => {
    setShowHero(false);
    setActiveTab("my-trips");
    setMyTripsDefaultTab("my-trips");
  };

  const handleGoToProfile = () => {
    setShowHero(false);
    setActiveTab("my-trips");
    setMyTripsDefaultTab("profile");
  };

  const handleGoToAdmin = () => {
    setShowHero(false);
    setActiveTab("admin");
  };

  return (
    <>
      <Seo {...buildHomeSeo()} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
        {/* Recommended Itinerary Detail Page - Full Screen */}
        {selectedBannerDetail ? (
          <RecommendedItineraryDetailPage
            banner={selectedBannerDetail}
            onBack={() => setSelectedBannerDetail(null)}
            onApplyToTrip={handleDestinationSelect}
          />
        ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="plan" className="space-y-6">
            {!currentItinerary ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Welcome Section */}
                <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-[20px]">
                    {t('hero.title')}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                    {t('hero.subtitle')}
                  </p>
                </div>

                {/* Travel Plan Form with Recommended Tours */}
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
                {/* Itinerary Display */}
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
          </TabsContent>

          <TabsContent value="my-trips">
            <MyTrip
              currentUser={currentUser}
              onUpdateUser={updateUser}
              onCreateNewTrip={handleNewPlan}
              onOpenAuthModal={openAuthModal}
              defaultTab={myTripsDefaultTab}
              onTabChange={setMyTripsDefaultTab}
            />
          </TabsContent>

          <TabsContent value="admin">
            <AdminDashboard
              currentUser={currentUser}
              events={events}
              setEvents={setEvents}
            />
          </TabsContent>
        </Tabs>
        )}
      </main>

      {/* Generating Overlay — PR-8에서 PlanPage 로 이동 예정 */}
      <GeneratingOverlay
        isVisible={isGenerating}
        startTime={generationStartTime}
      />
    </>
  );
}
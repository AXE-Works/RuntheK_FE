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
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from './components/seo/Seo';
import { buildHomeSeo } from './lib/seo/buildDestinationSeo';
import { downloadItineraryPdf } from './lib/itinerary/downloadItineraryPdf';
import { useConfirmItinerary } from './hooks/useConfirmItinerary';
import { TravelPlanForm } from './components/TravelPlanForm';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { AdminDashboard } from './components/AdminDashboard';
import { MyTrip } from './components/MyTrip';
import { AuthModal } from './components/AuthModal';
import { GeneratingOverlay } from './components/GeneratingOverlay';
import { RecommendedItineraryDetailPage } from './components/RecommendedItineraryDetailPage';
import { Button } from './components/ui/button';
import { Tabs, TabsContent } from './components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Badge } from './components/ui/badge';
import { MapPin, Users, BarChart, ArrowLeft, LogIn, User, LogOut, Settings, Globe, Mail, Save, Share2, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import logo from '@/assets/ade16fc310679880d8b27a51a4119372559298ac.png';
import { useAuth } from './providers/AuthProvider';
import { useEvents } from './providers/EventsProvider';
import { useItineraryDraft } from './providers/ItineraryDraftProvider';
import { modifySchedule, ScheduleApiError, type ScheduleGenerateResponse } from './services/scheduleApi';
import { toast } from 'sonner';

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
    rawAIResponse,
    userStartDate,
    userSelectedCities,
    selectedDestination,
    setItinerary,
    applyRegenerateResult,
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

  const handleRegenerateItinerary = async (additionalNotes: string) => {
    if (!currentItinerary || !rawAIResponse) {
      toast.error('No itinerary to modify. Please generate an itinerary first.');
      return;
    }

    handleSetIsGenerating(true);

    try {
      // Call the modify API with the schedule ID and modification prompt
      const result = await modifySchedule(rawAIResponse.id, additionalNotes);

      // Update the itinerary with the modified result
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
      handleSetIsGenerating(false);
    }
  };

  // Handle title change from ItineraryDisplay
  const handleTitleChange = (newTitle: string) => {
    updateTitle(newTitle);
  };

  const { confirm: handleConfirmItinerary } = useConfirmItinerary({
    onSaveSuccess: () => setActiveTab('my-trips'),
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Seo {...buildHomeSeo()} />
      {/* Header */}
      <motion.header 
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex items-center cursor-pointer" onClick={handleBackToHome}>
                <img 
                  src={logo} 
                  alt="RuntheK - Your Personal Korea Travel Assistant" 
                  className="h-5 sm:h-6 w-auto object-contain"
                />
                <span className="ml-2 text-xl sm:text-2xl font-semibold text-gray-900">Travel</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4">
              {/* Version Badge - Hidden on mobile */}
              <Badge variant="outline" className="hidden sm:inline-flex text-xs border-gray-300 text-gray-600">
                v1.0.0
              </Badge>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3 hover:bg-gray-100">
                    <Globe className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline text-sm">
                      {languageOptions.find(l => l.code === language)?.flag}
                    </span>
                    <span className="sm:hidden text-sm">
                      {languageOptions.find(l => l.code === language)?.flag}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {languageOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.code}
                      onClick={() => setLanguage(option.code)}
                      className={language === option.code ? 'bg-gray-100' : ''}
                    >
                      <span className="mr-2">{option.flag}</span>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {currentItinerary && (
                <Button
                  variant="outline"
                  onClick={handleNewPlan}
                  className="hidden sm:flex border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('nav.newPlan')}
                </Button>
              )}
              
              {/* Travelers count - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{t('stats.travelersHelped', { count: '5,234' })}</span>
              </div>

              {/* User Menu */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                      data-testid="btn-user-menu"
                    >
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback className="bg-gray-100 text-gray-900 text-sm">
                          {currentUser.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="w-[200px] truncate text-sm text-gray-600">
                          {currentUser.email}
                        </p>
                        <Badge variant="outline" className="w-fit text-xs">
                          {currentUser.country}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleGoToProfile}>
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.profile')}
                    </DropdownMenuItem>
                    {isAdmin ? (
                      <DropdownMenuItem onClick={handleGoToAdmin}>
                        <Shield className="mr-2 h-4 w-4" />
                        {t('nav.admin')}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={handleGoToMyTrips}>
                        <Settings className="mr-2 h-4 w-4" />
                        {t('nav.myTrips')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={openAuthModal}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 sm:px-4"
                  size="sm"
                >
                  <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('nav.login')}</span>
                  <span className="sm:hidden">{t('nav.login')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <span className="text-[11px]">• {t('footer.poweredByAI')}</span>
              <span className="text-[11px]">• {t('footer.realTimeUpdates')}</span>
              <span className="text-[11px]">• {t('footer.support')}</span>
            </div>
            <p className="text-sm text-gray-500">
              {t('footer.copyright')} - {t('footer.tagline')}
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={(user) => {
          login(user);
          closeAuthModal();
        }}
      />

      {/* Generating Overlay */}
      <GeneratingOverlay
        isVisible={isGenerating}
        startTime={generationStartTime}
      />
    </div>
  );
}
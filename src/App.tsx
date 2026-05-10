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
import { saveTripWithItinerary } from './services/tripApi';
import { useAuth } from './providers/AuthProvider';
import { ScheduleGenerateResponse, modifySchedule, ScheduleApiError } from './services/scheduleApi';
import { toast } from 'sonner';
import { mockEvents, type EventItem } from '@/data/mockEvents';

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
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryData | null>(null);
  const [rawAIResponse, setRawAIResponse] = useState<ScheduleGenerateResponse | null>(null);
  const [userBudget, setUserBudget] = useState<string>('mid-range');
  const [userStartDate, setUserStartDate] = useState<Date | undefined>(undefined);
  const [userSelectedCities, setUserSelectedCities] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab ?? "plan");
  const [showHero, setShowHero] = useState(false); // Landing page disabled
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [confirmedTrips, setConfirmedTrips] = useState<any[]>([]);
  const [myTripsDefaultTab, setMyTripsDefaultTab] = useState<string>("my-trips");
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
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
        setSelectedDestination({ name: location.state.destination });
      }
      // Clear state to prevent re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Sync language state with i18n
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Reset draft state on auth:logout (currentUser is reset by AuthProvider).
  // PR-4 ItineraryDraftProvider 도입 시 자체 구독으로 이관 예정.
  useEffect(() => {
    const handleAuthLogout = () => {
      setShowHero(true);
      setCurrentItinerary(null);
      setActiveTab("plan");
      setSelectedDestination(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const handleItineraryGenerated = (
    itinerary: ItineraryData,
    rawResponse?: ScheduleGenerateResponse,
    budget?: string,
    startDate?: Date,
    cities?: string[]
  ) => {
    setCurrentItinerary(itinerary);
    if (rawResponse) {
      setRawAIResponse(rawResponse);
    }
    if (budget) {
      setUserBudget(budget);
    }
    if (startDate) {
      setUserStartDate(startDate);
    }
    if (cities) {
      setUserSelectedCities(cities);
    }
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
      setCurrentItinerary(result.itinerary);
      setRawAIResponse(result.rawAIResponse);

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
    if (currentItinerary) {
      setCurrentItinerary({
        ...currentItinerary,
        title: newTitle,
      });
    }
  };

  const handleConfirmItinerary = async (itinerary: ItineraryData) => {
    if (!currentUser) {
      toast.error('Please login to save your trip');
      openAuthModal();
      return;
    }

    // If we have the raw AI response, save to BE
    if (rawAIResponse) {
      setIsSavingTrip(true);
      try {
        const response = await saveTripWithItinerary(
          rawAIResponse,
          userBudget,
          itinerary.title
        );

        console.log('Trip saved to BE:', response);
        toast.success('Trip saved successfully!');

        // Create local trip record with BE response data
        const confirmedTrip = {
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
          confirmed: true
        };

        setConfirmedTrips(prev => [...prev, confirmedTrip]);

        // Also save to localStorage for offline access
        const existingTrips = JSON.parse(localStorage.getItem('confirmedTrips') || '[]');
        existingTrips.push(confirmedTrip);
        localStorage.setItem('confirmedTrips', JSON.stringify(existingTrips));

        // Clear the raw response after saving
        setRawAIResponse(null);

        // Navigate to My Trips
        setActiveTab("my-trips");
      } catch (error) {
        console.error('Failed to save trip to BE:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to save trip. Please try again.');

        // Fallback: Save locally only
        const confirmedTrip = {
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
          savedLocally: true // Flag for local-only trips
        };

        setConfirmedTrips(prev => [...prev, confirmedTrip]);
        const existingTrips = JSON.parse(localStorage.getItem('confirmedTrips') || '[]');
        existingTrips.push(confirmedTrip);
        localStorage.setItem('confirmedTrips', JSON.stringify(existingTrips));

        toast.info('Trip saved locally. Will sync when online.');
        setActiveTab("my-trips");
      } finally {
        setIsSavingTrip(false);
      }
    } else {
      // Fallback for regenerated itineraries or when raw response is not available
      const confirmedTrip = {
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
        confirmed: true
      };

      setConfirmedTrips(prev => [...prev, confirmedTrip]);
      console.log('Confirmed trip saved locally:', confirmedTrip);

      // Save to localStorage for persistence
      const existingTrips = JSON.parse(localStorage.getItem('confirmedTrips') || '[]');
      existingTrips.push(confirmedTrip);
      localStorage.setItem('confirmedTrips', JSON.stringify(existingTrips));

      // Navigate to My Trips
      setActiveTab("my-trips");
    }
  };

  const handleNewPlan = () => {
    setCurrentItinerary(null);
    setActiveTab("plan");
    setShowHero(false);
    setSelectedDestination(null);
  };

  const handleBackToHome = () => {
    setShowHero(true);
    setCurrentItinerary(null);
    setActiveTab("plan");
    setSelectedDestination(null);
  };

  const handleLogout = async () => {
    // 페이지 전환을 먼저 수행해 my-trips/admin TabsContent를 unmount한 후 logout 호출.
    // AuthProvider.logout()의 setCurrentUser(null) batch와 여기 setState batch가
    // await로 분리되어, currentUser=null 중간 render에서 MyTrip의 conditional hook
    // 위반이 노출되는 것을 회피한다. PR-4 ItineraryDraftProvider 도입 시 자체 정리로 이관 예정.
    setShowHero(true);
    setCurrentItinerary(null);
    setActiveTab("plan");
    setSelectedDestination(null);
    await logout();
  };

  const handleDestinationSelect = (destination: any) => {
    setSelectedDestination(destination);
    setShowHero(false);
    setActiveTab("plan");

    // Clear any existing itinerary
    setCurrentItinerary(null);
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
                    <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
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
                        onClick={async () => {
                          try {
                            const html2canvas = (await import('html2canvas')).default;
                            const { jsPDF } = await import('jspdf');

                            const content = document.querySelector('.max-w-4xl') as HTMLElement;
                            if (!content) {
                                alert(t('trips:itinerary.contentNotFound'));
                                return;
                            }

                            document.body.style.cursor = 'wait';

                            const inlineAllStyles = (source: HTMLElement, target: HTMLElement) => {
                                const computed = window.getComputedStyle(source);
                                const styleProps = [
                                    'color', 'background', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
                                    'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
                                    'borderColor', 'borderRadius', 'borderWidth', 'borderStyle',
                                    'font', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'textAlign', 'textTransform', 'textDecoration', 'letterSpacing',
                                    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                                    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
                                    'display', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
                                    'flex', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent', 'gap', 'order', 'flexGrow', 'flexShrink', 'flexBasis',
                                    'grid', 'gridTemplateColumns', 'gridTemplateRows', 'gridGap',
                                    'opacity', 'visibility', 'zIndex', 'boxShadow', 'overflow', 'whiteSpace', 'verticalAlign',
                                    'transform', 'transformOrigin', 'float', 'clear', 'listStyle'
                                ];

                                styleProps.forEach(prop => {
                                    const val = computed[prop as any];
                                    if (val) {
                                         if (typeof val === 'string' && val.includes('oklch')) {
                                             (target.style as any)[prop] = '#000000';
                                         } else {
                                             (target.style as any)[prop] = val;
                                         }
                                    }
                                });

                                for (let i = 0; i < source.children.length; i++) {
                                    if (target.children[i]) {
                                        inlineAllStyles(source.children[i] as HTMLElement, target.children[i] as HTMLElement);
                                    }
                                }
                            };

                            const canvas = await html2canvas(content, {
                              scale: 2,
                              useCORS: true,
                              logging: false,
                              windowWidth: 1280,
                              ignoreElements: (element) => element.tagName === 'IFRAME',
                              onclone: (clonedDoc) => {
                                const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
                                styles.forEach(s => s.remove());

                                const clonedContent = clonedDoc.querySelector('.max-w-4xl') as HTMLElement;
                                if (clonedContent) {
                                  const scrollables = clonedContent.querySelectorAll('.overflow-y-auto, [class*="max-h-"]');
                                  scrollables.forEach((el) => {
                                    (el as HTMLElement).style.overflow = 'visible';
                                    (el as HTMLElement).style.height = 'auto';
                                    (el as HTMLElement).style.maxHeight = 'none';
                                  });

                                  inlineAllStyles(content, clonedContent);
                                  clonedContent.style.backgroundColor = '#ffffff';
                                  clonedContent.style.color = '#000000';
                                }
                              }
                            });

                            const imgData = canvas.toDataURL('image/png');
                            const pdf = new jsPDF('p', 'mm', 'a4');
                            const pdfWidth = pdf.internal.pageSize.getWidth();
                            const pdfHeight = pdf.internal.pageSize.getHeight();
                            const imgWidth = pdfWidth;
                            const imgHeight = (canvas.height * imgWidth) / canvas.width;

                            let heightLeft = imgHeight;
                            let position = 0;

                            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                            heightLeft -= pdfHeight;

                            while (heightLeft >= 0) {
                              position = heightLeft - imgHeight;
                              pdf.addPage();
                              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                              heightLeft -= pdfHeight;
                            }

                            pdf.save('RuntheK_Itinerary.pdf');
                            document.body.style.cursor = 'default';

                          } catch (error) {
                            console.error('PDF Generation Error:', error);
                            document.body.style.cursor = 'default';
                            alert(t('trips:itinerary.pdfFailed'));
                          }
                        }}
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
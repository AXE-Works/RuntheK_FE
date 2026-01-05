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
import { useTranslation } from 'react-i18next';
import { TravelPlanForm } from './components/TravelPlanForm';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { AdminDashboard } from './components/AdminDashboard';
import { MyTrip } from './components/MyTrip';
import { HeroSection } from './components/HeroSection';
import { AuthModal } from './components/AuthModal';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Badge } from './components/ui/badge';
import { MapPin, Users, BarChart, ArrowLeft, LogIn, User, LogOut, Settings, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import logo from 'figma:asset/ade16fc310679880d8b27a51a4119372559298ac.png';
import { fetchWithAuth, API_BASE_URL } from './utils/api';
import { saveTripWithItinerary } from './services/tripApi';
import { ScheduleGenerateResponse } from './services/scheduleApi';
import { toast } from 'sonner';

const mockEvents = [
  {
    id: 1,
    title: '벚꽃 축제',
    type: '시즌 이벤트',
    conditions: '봄, 서울, 자연 관심사',
    active: true,
    impressions: 1234,
    clicks: 156,
    priority: '높음',
    targetAudience: '모든 연령',
    budget: 50000,
    expectedParticipants: 1000,
    location: '여의도 공원',
    startDate: '2024-04-01',
    endDate: '2024-04-15',
    description: '서울 여의도에서 열리는 봄 벚꽃 축제로 전통 공연과 먹거리를 즐길 수 있습니다.',
    organizer: '서울시청',
    contactEmail: 'cherry@seoul.go.kr',
    website: 'https://seoul.go.kr/cherry',
    requirements: '사전 예약 필요',
    weatherDependency: '우천시 취소',
    ageRestriction: '없음',
    frequency: 75,
    relevance: 85,
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
  },
  {
    id: 2,
    title: 'K-Pop 콘서트 할인',
    type: '프로모션',
    conditions: 'K-Culture 관심사, 서울',
    active: true,
    impressions: 856,
    clicks: 98,
    priority: '중간',
    targetAudience: '10-30대',
    budget: 100000,
    expectedParticipants: 500,
    location: '잠실 올림픽 공원',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    description: '인기 K-Pop 콘서트 티켓 20% 할인 혜택',
    organizer: 'SM Entertainment',
    contactEmail: 'events@sment.com',
    website: 'https://smtown.com',
    requirements: '멤버십 가입 필요',
    weatherDependency: '실내 공연',
    ageRestriction: '전연령 관람가',
    frequency: 45,
    relevance: 90,
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
  }
];

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

export default function App() {
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryData | null>(null);
  const [rawAIResponse, setRawAIResponse] = useState<ScheduleGenerateResponse | null>(null);
  const [userBudget, setUserBudget] = useState<string>('mid-range');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [activeTab, setActiveTab] = useState("plan");
  const [showHero, setShowHero] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [confirmedTrips, setConfirmedTrips] = useState<any[]>([]);
  const [myTripsDefaultTab, setMyTripsDefaultTab] = useState<string>("my-trips");
  const [events, setEvents] = useState(mockEvents);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [language, setLanguage] = useState<'ko' | 'en' | 'ja' | 'zh'>('en');

  const languageOptions = [
    { code: 'ko' as const, label: '한국어', flag: '🇰🇷' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' },
    { code: 'ja' as const, label: '日本語', flag: '🇯🇵' },
    { code: 'zh' as const, label: '中文', flag: '🇨🇳' },
  ];

  const { t, i18n } = useTranslation();

  // Sync language state with i18n
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setIsRestoringSession(false);
        return;
      }

      try {
        // Use fetchWithAuth for automatic token refresh on 401
        const res = await fetchWithAuth(`${API_BASE_URL}/users/profile`);

        if (!res.ok) {
          throw new Error('Session expired');
        }

        const data = await res.json();
        setCurrentUser({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          country: data.data.country || '',
          avatar: data.data.avatarUrl,
          role: data.data.role,
          provider: data.data.provider || 'email',
        });
        setShowHero(false); // Skip landing page for logged-in users
        console.log('[Session] Restored user session');
      } catch (error) {
        console.log('[Session] Token expired or invalid, clearing...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, []);

  // Listen for auth:logout event (triggered when token refresh fails)
  useEffect(() => {
    const handleAuthLogout = () => {
      setCurrentUser(null);
      setShowHero(true);
      setCurrentItinerary(null);
      setActiveTab("plan");
      setSelectedDestination(null);
      console.log('[Auth] Session expired, logged out automatically');
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const handleItineraryGenerated = (
    itinerary: ItineraryData,
    rawResponse?: ScheduleGenerateResponse,
    budget?: string
  ) => {
    setCurrentItinerary(itinerary);
    if (rawResponse) {
      setRawAIResponse(rawResponse);
    }
    if (budget) {
      setUserBudget(budget);
    }
  };

  const handleRegenerateItinerary = async (additionalNotes: string) => {
    if (!currentItinerary) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a user input object based on the current itinerary
    const baseUserInput: UserInput = {
      duration: currentItinerary.duration,
      cities: [], // Extract from current itinerary
      budget: currentItinerary.budget,
      interests: currentItinerary.interests,
      additionalNotes: additionalNotes
    };
    
    // Apply modifications based on additional notes
    const modifiedItinerary = generateModifiedItinerary(currentItinerary, additionalNotes, baseUserInput);
    
    setCurrentItinerary(modifiedItinerary);
    setIsGenerating(false);
  };

  // Simplified regeneration that modifies the existing itinerary based on additional notes
  const generateModifiedItinerary = (originalItinerary: ItineraryData, additionalNotes: string, userInput: UserInput): ItineraryData => {
    const numDays = originalItinerary.days.length;
    
    // Additional activities based on notes
    const additionalActivities: { [key: string]: any[] } = {
      food: [
        { activity: 'Temple Food Experience', location: 'Insadong, Seoul', description: 'Experience traditional Buddhist vegetarian cuisine' },
        { activity: 'Korean Street Food Night Market', location: 'Dongdaemun, Seoul', description: 'Late night food market with authentic Korean snacks' },
        { activity: 'Traditional Tea House', location: 'Insadong, Seoul', description: 'Experience Korean tea culture in a traditional setting' }
      ],
      culture: [
        { activity: 'Korean Traditional Music Performance', location: 'National Theater, Seoul', description: 'Traditional Korean music and dance performance' },
        { activity: 'Hanbok Rental Experience', location: 'Bukchon, Seoul', description: 'Wear traditional Korean clothing and explore historical areas' },
        { activity: 'Korean Calligraphy Class', location: 'Cultural Center, Seoul', description: 'Learn the art of Korean calligraphy' }
      ],
      accessibility: [
        { activity: 'Barrier-Free Seoul Tour', location: 'Various, Seoul', description: 'Wheelchair accessible attractions with barrier-free facilities' },
        { activity: 'Accessible Transportation Guide', location: 'Seoul Metro', description: 'Learn about accessible public transportation options' }
      ],
      photography: [
        { activity: 'Instagram Photo Spots Tour', location: 'Hongdae, Seoul', description: 'Visit the most photogenic locations in Seoul' },
        { activity: 'Sunrise Photography at Han River', location: 'Han River, Seoul', description: 'Capture beautiful sunrise views over Seoul' }
      ]
    };

    // Analyze additional notes for specific requests
    const lowerNotes = additionalNotes.toLowerCase();
    const modifiedDays = originalItinerary.days.map((day, dayIndex) => {
      let newActivities = [...day.activities];

      // Add activities based on notes
      if (lowerNotes.includes('food') || lowerNotes.includes('vegetarian') || lowerNotes.includes('restaurant')) {
        if (additionalActivities.food.length > 0) {
          const foodActivity = additionalActivities.food[dayIndex % additionalActivities.food.length];
          newActivities.splice(3, 0, {
            time: '05:00 PM',
            ...foodActivity,
            estimatedCost: userInput.budget === 'budget' ? '$15-25' : userInput.budget === 'mid-range' ? '$25-40' : '$40-80'
          });
        }
      }

      if (lowerNotes.includes('culture') || lowerNotes.includes('traditional') || lowerNotes.includes('history')) {
        if (additionalActivities.culture.length > 0) {
          const cultureActivity = additionalActivities.culture[dayIndex % additionalActivities.culture.length];
          newActivities.splice(1, 0, {
            time: '10:30 AM',
            ...cultureActivity,
            estimatedCost: userInput.budget === 'budget' ? '$10-20' : userInput.budget === 'mid-range' ? '$20-40' : '$40-80'
          });
        }
      }

      if (lowerNotes.includes('wheelchair') || lowerNotes.includes('accessible') || lowerNotes.includes('disability')) {
        if (additionalActivities.accessibility.length > 0) {
          const accessActivity = additionalActivities.accessibility[dayIndex % additionalActivities.accessibility.length];
          newActivities.push({
            time: '11:00 AM',
            ...accessActivity,
            estimatedCost: 'Free',
            isEvent: true,
            eventType: 'Accessible'
          });
        }
      }

      if (lowerNotes.includes('photo') || lowerNotes.includes('instagram') || lowerNotes.includes('picture')) {
        if (additionalActivities.photography.length > 0) {
          const photoActivity = additionalActivities.photography[dayIndex % additionalActivities.photography.length];
          newActivities.push({
            time: '06:00 AM',
            ...photoActivity,
            estimatedCost: userInput.budget === 'budget' ? '$5-15' : userInput.budget === 'mid-range' ? '$15-30' : '$30-60'
          });
        }
      }

      // Add a custom note-based activity
      if (additionalNotes.trim()) {
        newActivities.push({
          time: '03:30 PM',
          activity: '📝 Custom Request',
          location: 'Based on your preferences',
          description: `Special experience tailored to your request: ${additionalNotes.slice(0, 100)}${additionalNotes.length > 100 ? '...' : ''}`,
          estimatedCost: 'Varies',
          isEvent: true,
          eventType: 'Custom'
        });
      }

      return {
        ...day,
        title: day.title + ' (Updated)',
        activities: newActivities.slice(0, 8) // Limit to 8 activities per day
      };
    });

    return {
      ...originalItinerary,
      id: `itinerary-${Date.now()}`,
      title: `${originalItinerary.title} (Modified)`,
      days: modifiedDays,
      totalEstimatedCost: originalItinerary.totalEstimatedCost // Could be recalculated based on new activities
    };
  };

  const handleConfirmItinerary = async (itinerary: ItineraryData) => {
    if (!currentUser) {
      toast.error('Please login to save your trip');
      setShowAuthModal(true);
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

  const handleStartPlanning = () => {
    setShowHero(false);
    setActiveTab("plan");
  };

  const handleBackToHome = () => {
    setShowHero(true);
    setCurrentItinerary(null);
    setActiveTab("plan");
    setSelectedDestination(null);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    // Call backend logout API to invalidate refresh token
    if (refreshToken) {
      try {
        await fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
        console.log('[Logout] Backend logout successful');
      } catch (error) {
        console.error('[Logout] API error:', error);
        // Continue with local logout even if API fails
      }
    }

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Clear user state
    setCurrentUser(null);

    // Redirect to landing page
    setShowHero(true);
    setCurrentItinerary(null);
    setActiveTab("plan");
    setSelectedDestination(null);

    console.log('[Logout] User logged out successfully');
  };

  const handleDestinationSelect = (destination: any) => {
    setSelectedDestination(destination);
    setShowHero(false);
    setActiveTab("plan");
    
    // Clear any existing itinerary
    setCurrentItinerary(null);
  };

  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
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

  // Show loading while restoring session
  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  if (showHero && !currentItinerary) {
    return <HeroSection onStartPlanning={handleStartPlanning} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                v3.0.0
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
                    <DropdownMenuItem onClick={handleGoToMyTrips}>
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.myTrips')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-lg mx-auto mb-6 sm:mb-8 bg-gray-100">
            <TabsTrigger value="plan" className="data-[state=active]:bg-white data-[state=active]:text-black text-sm sm:text-base">
              {t('nav.planTrip')}
            </TabsTrigger>
            <TabsTrigger value="my-trips" className="data-[state=active]:bg-white data-[state=active]:text-black text-sm sm:text-base">
              {t('nav.myTrips')}
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-white data-[state=active]:text-black text-sm sm:text-base">
              {t('nav.admin')}
            </TabsTrigger>
          </TabsList>

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
                  setIsGenerating={setIsGenerating}
                  selectedDestination={selectedDestination}
                  onDestinationSelect={handleDestinationSelect}
                  currentUser={currentUser}
                  events={events}
                  language={language}
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
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleNewPlan}
                        variant="outline"
                        className="w-full sm:w-auto border-2 border-black bg-white text-black hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold h-12 sm:h-10 text-base sm:text-sm"
                      >
                        {t('itinerary.planAnother')}
                      </Button>
                    </motion.div>
                  </div>
                </div>
                
                <ItineraryDisplay 
                  itinerary={currentItinerary}
                  onEdit={handleNewPlan}
                  onConfirm={handleConfirmItinerary}
                  onRegenerate={handleRegenerateItinerary}
                />
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="my-trips">
            <MyTrip
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onCreateNewTrip={handleNewPlan}
              onOpenAuthModal={() => setShowAuthModal(true)}
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
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
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
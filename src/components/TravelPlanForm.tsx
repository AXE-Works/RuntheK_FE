import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Calendar as CalendarIcon, MapPin, Heart, DollarSign, Sparkles, MessageSquare, Edit2, Eye, Save, X } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { UserInput, ItineraryData } from '../App';
import { motion } from 'motion/react';
import { SuggestedBanners } from './SuggestedBanners';
import { TravelGuideAccordion } from './TravelGuideAccordion';
import { PopularDestinations } from './PopularDestinations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { generateSchedule, ScheduleApiError, ScheduleGenerateResponse } from '../services/scheduleApi';

interface TravelPlanFormProps {
  onItineraryGenerated: (
    itinerary: ItineraryData,
    rawResponse?: ScheduleGenerateResponse,
    budget?: string
  ) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  selectedDestination?: any;
  onDestinationSelect?: (destination: any) => void;
  currentUser?: any;
  events?: any[];
  language?: 'ko' | 'en' | 'ja' | 'zh';
}

const DESTINATION_OPTIONS = [
  { id: 'seoul', labelKey: 'seoul' },
  { id: 'busan', labelKey: 'busan' },
  { id: 'jeju', labelKey: 'jeju' },
  { id: 'gyeongju', labelKey: 'gyeongju' },
  { id: 'suwon', labelKey: 'suwon' },
  { id: 'notSure', labelKey: 'notSure' }
];

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CA', name: 'Canada' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EG', name: 'Egypt' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NO', name: 'Norway' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TR', name: 'Turkey' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'OTHER', name: 'Other' }
];

const INTERESTS = [
  { id: 'food', labelKey: 'food', icon: '🍜' },
  { id: 'local', labelKey: 'local', icon: '🏘️' },
  { id: 'kculture', labelKey: 'kculture', icon: '🎵' },
  { id: 'shopping', labelKey: 'shopping', icon: '🛍️' },
  { id: 'culture', labelKey: 'culture', icon: '🏛️' },
  { id: 'nature', labelKey: 'nature', icon: '🏔️' }
];

const TRAVEL_STYLE_OPTIONS = [
  { value: 'relaxed', labelKey: 'relaxedLabel', descKey: 'relaxedDesc' },
  { value: 'balanced', labelKey: 'balancedLabel', descKey: 'balancedDesc' },
  { value: 'packed', labelKey: 'packedLabel', descKey: 'packedDesc' }
];

// Mock AI itinerary generation
const generateMockItinerary = (userInput: UserInput, availableEvents: any[] = []): ItineraryData => {
  const duration = userInput.duration || '5 days';
  const numDays = parseInt(duration) || 5;
  const cities = userInput.cities.length > 0 ? userInput.cities : ['Seoul'];
  const additionalNotes = userInput.additionalNotes || '';
  
  const mockActivities = {
    culture: [
      { activity: 'Visit Gyeongbokgung Palace', location: 'Jongno-gu, Seoul', description: 'Explore the largest of the Five Grand Palaces built during the Joseon Dynasty' },
      { activity: 'Bukchon Hanok Village', location: 'Jongno-gu, Seoul', description: 'Walk through traditional Korean houses and experience old Seoul' },
      { activity: 'National Museum of Korea', location: 'Yongsan-gu, Seoul', description: 'Discover 5,000 years of Korean history and culture' },
      { activity: 'Changdeokgung Palace Secret Garden', location: 'Jongno-gu, Seoul', description: 'UNESCO World Heritage site with beautiful secret gardens' },
      { activity: 'Jogyesa Temple', location: 'Jongno-gu, Seoul', description: 'Main temple of Korean Buddhism in Seoul' }
    ],
    food: [
      { activity: 'Korean BBQ Experience', location: 'Gangnam-gu, Seoul', description: 'Authentic Korean barbecue with premium meat cuts' },
      { activity: 'Gwangjang Market Food Tour', location: 'Jongno-gu, Seoul', description: 'Try bindaetteok, mayak gimbap, and other street foods' },
      { activity: 'Cooking Class', location: 'Mapo-gu, Seoul', description: 'Learn to make kimchi and bulgogi with local chefs' },
      { activity: 'Fine Dining Korean Cuisine', location: 'Jung-gu, Seoul', description: 'Modern interpretation of traditional Korean flavors' },
      { activity: 'Street Food Tour in Myeongdong', location: 'Jung-gu, Seoul', description: 'Sample hotteok, tteokbokki, and Korean fried chicken' }
    ],
    shopping: [
      { activity: 'Myeongdong Shopping', location: 'Jung-gu, Seoul', description: 'Shop for cosmetics, fashion, and souvenirs' },
      { activity: 'Hongdae Area', location: 'Mapo-gu, Seoul', description: 'Trendy shopping and youth culture district' },
      { activity: 'Dongdaemun Design Plaza', location: 'Jung-gu, Seoul', description: 'Modern shopping complex and cultural hub' },
      { activity: 'Insadong Traditional Crafts', location: 'Jongno-gu, Seoul', description: 'Traditional Korean crafts and antiques shopping' },
      { activity: 'Gangnam Underground Shopping', location: 'Gangnam-gu, Seoul', description: 'Extensive underground shopping network' }
    ],
    nature: [
      { activity: 'Namsan Tower Hike', location: 'Jung-gu, Seoul', description: 'Hike up to Seoul\'s iconic landmark for city views' },
      { activity: 'Han River Cruise', location: 'Seoul', description: 'Relaxing cruise along Seoul\'s main river' },
      { activity: 'Jeju Hallasan National Park', location: 'Jeju Island', description: 'Hike South Korea\'s highest mountain' },
      { activity: 'Banpo Rainbow Bridge', location: 'Seocho-gu, Seoul', description: 'Musical fountain show with rainbow lights' },
      { activity: 'Seoullo 7017 Skygarden', location: 'Jung-gu, Seoul', description: 'Elevated botanical garden and walkway' }
    ],
    kculture: [
      { activity: 'K-Pop Experience', location: 'Gangnam-gu, Seoul', description: 'Visit entertainment companies and K-pop themed cafes' },
      { activity: 'Lotte World Tower', location: 'Songpa-gu, Seoul', description: 'Modern entertainment complex with amazing views' },
      { activity: 'Itaewon Cultural District', location: 'Yongsan-gu, Seoul', description: 'International district with diverse culture' },
      { activity: 'SM Town Museum', location: 'Gangnam-gu, Seoul', description: 'Interactive K-pop museum and experience center' },
      { activity: 'Korean Drama Filming Locations Tour', location: 'Various, Seoul', description: 'Visit famous K-drama shooting locations' }
    ]
  };

  // Restaurant options for lunch and dinner
  const restaurants = {
    lunch: [
      { activity: 'Traditional Korean Lunch', location: 'Various', description: 'Authentic Korean set meal (jeongsik) at local restaurant' },
      { activity: 'Bibimbap Restaurant', location: 'Various', description: 'Classic Korean mixed rice bowl with vegetables and meat' },
      { activity: 'Korean Noodle House', location: 'Various', description: 'Naengmyeon (cold noodles) or jjajangmyeon (black bean noodles)' },
      { activity: 'Korean Soup Restaurant', location: 'Various', description: 'Hearty Korean soup (jjigae) with side dishes' },
      { activity: 'Korean Cafe & Light Meal', location: 'Various', description: 'Korean-style cafe with desserts and light meals' }
    ],
    dinner: [
      { activity: 'Korean BBQ Dinner', location: 'Various', description: 'Premium Korean barbecue with banchan (side dishes)' },
      { activity: 'Hot Pot Restaurant', location: 'Various', description: 'Korean-style hot pot (jeongol) with fresh ingredients' },
      { activity: 'Seafood Restaurant', location: 'Various', description: 'Fresh Korean seafood with traditional preparation' },
      { activity: 'Korean Fried Chicken', location: 'Various', description: 'Crispy Korean-style fried chicken with beer' },
      { activity: 'Fine Dining Korean', location: 'Various', description: 'Upscale Korean cuisine with modern presentation' }
    ]
  };

  // Add activities based on additional notes
  if (additionalNotes.toLowerCase().includes('vegetarian') || additionalNotes.toLowerCase().includes('vegan')) {
    mockActivities.food.push({
      activity: 'Temple Food Experience',
      location: 'Insadong, Seoul',
      description: 'Experience traditional Buddhist vegetarian cuisine'
    });
    restaurants.lunch.push({
      activity: 'Vegetarian Korean Restaurant',
      location: 'Various',
      description: 'Plant-based Korean dishes and temple food style meals'
    });
    restaurants.dinner.push({
      activity: 'Vegan Korean Fine Dining',
      location: 'Various',
      description: 'Modern vegan interpretation of Korean cuisine'
    });
  }
  
  if (additionalNotes.toLowerCase().includes('wheelchair') || additionalNotes.toLowerCase().includes('accessible')) {
    mockActivities.culture.push({
      activity: 'Accessible Seoul Tour',
      location: 'Various locations, Seoul',
      description: 'Wheelchair-accessible attractions and barrier-free experiences'
    });
  }
  
  if (additionalNotes.toLowerCase().includes('photography') || additionalNotes.toLowerCase().includes('photo')) {
    mockActivities.culture.push({
      activity: 'Photography Tour',
      location: 'Gangnam-gu, Seoul',
      description: 'Instagram-worthy spots and professional photography guidance'
    });
  }

  // Use available events from Admin Dashboard
  const events = availableEvents.filter(e => e.active).map(e => ({
    ...e,
    activity: `🎉 ${e.title}`, // Add emoji for visibility
    estimatedCost: e.budget > 0 ? `${e.budget.toLocaleString()} KRW` : 'Free',
    isEvent: true,
    eventType: e.type,
    time: '03:00 PM' // Default time, will be overridden or positioned
  }));

  // Add note-specific events
  if (additionalNotes) {
    events.push({
      time: 'Morning',
      activity: '📝 Personalized Experience',
      location: 'Based on your notes',
      description: `Special arrangement based on your preferences: ${additionalNotes.slice(0, 100)}${additionalNotes.length > 100 ? '...' : ''}`,
      estimatedCost: 'Varies',
      isEvent: true,
      eventType: 'Custom',
      active: true,
      title: 'Personalized Experience',
      type: 'Custom',
      conditions: '',
      clicks: 0,
      impressions: 0,
      priority: 'High',
      targetAudience: 'All',
      budget: 0,
      expectedParticipants: 1,
      startDate: '',
      endDate: '',
      organizer: '',
      contactEmail: '',
      website: '',
      requirements: '',
      weatherDependency: '',
      ageRestriction: '',
      frequency: 100,
      relevance: 100,
      imageUrl: '',
      id: 9999
    });
  }

  const days = Array.from({ length: numDays }, (_, i) => {
    const dayActivities: any[] = [];
    
    // Morning Activity (9:00 AM)
    const morningInterest = userInput.interests[i % userInput.interests.length];
    if (morningInterest && mockActivities[morningInterest as keyof typeof mockActivities]) {
      const activities = mockActivities[morningInterest as keyof typeof mockActivities];
      const activity = activities[i % activities.length];
      dayActivities.push({
        time: '09:00 AM',
        ...activity,
        estimatedCost: userInput.budget === 'budget' ? '$10-20' : userInput.budget === 'mid-range' ? '$20-50' : '$50-100'
      });
    }

    // Lunch (12:00 PM)
    const lunchOption = restaurants.lunch[i % restaurants.lunch.length];
    dayActivities.push({
      time: '12:00 PM',
      ...lunchOption,
      estimatedCost: userInput.budget === 'budget' ? '$8-15' : userInput.budget === 'mid-range' ? '$15-25' : '$25-40'
    });

    // Afternoon Activity 1 (2:00 PM)
    const afternoonInterest1 = userInput.interests[(i + 1) % userInput.interests.length];
    if (afternoonInterest1 && mockActivities[afternoonInterest1 as keyof typeof mockActivities]) {
      const activities = mockActivities[afternoonInterest1 as keyof typeof mockActivities];
      const activity = activities[(i + 1) % activities.length];
      dayActivities.push({
        time: '02:00 PM',
        ...activity,
        estimatedCost: userInput.budget === 'budget' ? '$10-20' : userInput.budget === 'mid-range' ? '$20-50' : '$50-100'
      });
    }

    // Afternoon Activity 2 (4:00 PM)
    const afternoonInterest2 = userInput.interests[(i + 2) % userInput.interests.length];
    if (afternoonInterest2 && mockActivities[afternoonInterest2 as keyof typeof mockActivities]) {
      const activities = mockActivities[afternoonInterest2 as keyof typeof mockActivities];
      const activity = activities[(i + 2) % activities.length];
      dayActivities.push({
        time: '04:00 PM',
        ...activity,
        estimatedCost: userInput.budget === 'budget' ? '$10-20' : userInput.budget === 'mid-range' ? '$20-50' : '$50-100'
      });
    }

    // Dinner (7:00 PM)
    const dinnerOption = restaurants.dinner[i % restaurants.dinner.length];
    dayActivities.push({
      time: '07:00 PM',
      ...dinnerOption,
      estimatedCost: userInput.budget === 'budget' ? '$15-25' : userInput.budget === 'mid-range' ? '$25-40' : '$40-80'
    });

    // Evening Activity (9:00 PM) - Optional
    if (userInput.interests.includes('nightlife') || Math.random() > 0.5) {
      const eveningInterest = userInput.interests[(i + 3) % userInput.interests.length];
      if (eveningInterest && mockActivities[eveningInterest as keyof typeof mockActivities]) {
        const activities = mockActivities[eveningInterest as keyof typeof mockActivities];
        const activity = activities[(i + 3) % activities.length];
        dayActivities.push({
          time: '09:00 PM',
          ...activity,
          estimatedCost: userInput.budget === 'budget' ? '$10-20' : userInput.budget === 'mid-range' ? '$20-50' : '$50-100'
        });
      }
    }

    // Add events (100% chance per day for testing purposes)
    if (events.length > 0) {
      // Pick a random event that hasn't been used yet if possible, or just random
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      // Don't add duplicate events in the same day (though simple random check below handles one)
      // We will add it as an afternoon activity replacing or adding to it
      dayActivities.push({
        ...randomEvent,
        time: '03:30 PM' // distinct time
      });
    }

    return {
      day: i + 1,
      title: `Day ${i + 1} - Exploring ${cities[i % cities.length]}`,
      activities: dayActivities.slice(0, 7) // Limit to 7 activities per day maximum
    };
  });

  return {
    id: `itinerary-${Date.now()}`,
    title: `${duration} Korea Adventure`,
    duration,
    interests: userInput.interests,
    budget: userInput.budget,
    days,
    totalEstimatedCost: userInput.budget === 'budget' 
      ? `$${numDays * 100}-${numDays * 150}` 
      : userInput.budget === 'mid-range' 
      ? `$${numDays * 200}-${numDays * 300}` 
      : `$${numDays * 400}-${numDays * 600}`
  };
};

export function TravelPlanForm({ onItineraryGenerated, isGenerating, setIsGenerating, selectedDestination, onDestinationSelect, currentUser, events = [], language = 'en' }: TravelPlanFormProps) {
  const { t } = useTranslation(['form', 'common']);
  const [userInput, setUserInput] = useState<UserInput>({
    duration: '',
    cities: [],
    budget: 'mid-range',
    interests: [],
    nationality: '',
    startDate: undefined
  });
  const [isFromDestination, setIsFromDestination] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [customCity, setCustomCity] = useState('');

  // Auto-fill nationality from user profile
  useEffect(() => {
    if (currentUser?.country) {
      // Find the country code that matches the user's country name
      const matchingCountry = COUNTRIES.find(c => c.name === currentUser.country);
      if (matchingCountry) {
        setUserInput(prev => ({ ...prev, nationality: matchingCountry.code }));
      }
    }
  }, [currentUser]);

  // Auto-fill form when destination is selected
  useEffect(() => {
    if (selectedDestination && !isFromDestination) {
      setIsFromDestination(true);

      // Determine cities: prefer recommendedCities array, fallback to name mapping
      let cities: string[] = [];
      if (selectedDestination.recommendedCities && selectedDestination.recommendedCities.length > 0) {
        cities = selectedDestination.recommendedCities;
      } else {
        // Legacy city name mapping for PopularDestinations
        const cityMapping: { [key: string]: string } = {
          'Seoul': 'Seoul',
          'Jeju Island': 'Jeju Island',
          'Busan': 'Busan',
          'Gyeongju': 'Gyeongju',
          'Traditional Markets': 'Seoul'
        };
        const selectedCity = cityMapping[selectedDestination.name] || selectedDestination.name;
        cities = [selectedCity];
      }

      // Determine budget: prefer recommendedBudget, fallback to name-based defaults
      let budget = selectedDestination.recommendedBudget;
      if (!budget) {
        budget = selectedDestination.name === 'Seoul' ? 'mid-range' :
                 selectedDestination.name === 'Traditional Markets' ? 'budget' : 'mid-range';
      }

      // Parse startDate if provided as string
      let startDate: Date | undefined;
      if (selectedDestination.recommendedStartDate) {
        startDate = new Date(selectedDestination.recommendedStartDate);
        // Ensure it's a future date
        if (startDate < new Date()) {
          startDate = undefined;
        }
      }

      setUserInput(prev => ({
        ...prev,
        duration: selectedDestination.recommendedDuration || '5 days',
        cities: cities,
        interests: selectedDestination.recommendedInterests || [],
        budget: budget,
        startDate: startDate
      }));

      // Scroll to form section
      setTimeout(() => {
        const formSection = document.getElementById('travel-form-section');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [selectedDestination, isFromDestination]);

  const MAX_INTERESTS = 3;

  const handleInterestToggle = (interestId: string) => {
    setUserInput(prev => {
      const isAlreadySelected = prev.interests.includes(interestId);

      // 이미 선택된 경우 제거
      if (isAlreadySelected) {
        return {
          ...prev,
          interests: prev.interests.filter(id => id !== interestId)
        };
      }

      // 최대 개수 도달 시 추가 불가
      if (prev.interests.length >= MAX_INTERESTS) {
        return prev;
      }

      return {
        ...prev,
        interests: [...prev.interests, interestId]
      };
    });
  };

  const handleDestinationToggle = (destinationId: string) => {
    setUserInput(prev => ({
      ...prev,
      cities: prev.cities.includes(destinationId)
        ? prev.cities.filter(c => c !== destinationId)
        : [...prev.cities, destinationId]
    }));
  };

  const handleAddCustomCity = () => {
    const trimmedCity = customCity.trim();
    if (trimmedCity && !userInput.cities.includes(trimmedCity)) {
      setUserInput(prev => ({
        ...prev,
        cities: [...prev.cities, trimmedCity]
      }));
      setCustomCity('');
    }
  };

  const handleRemoveCustomCity = (city: string) => {
    setUserInput(prev => ({
      ...prev,
      cities: prev.cities.filter(c => c !== city)
    }));
  };

  const handleGenerate = async () => {
    if (!currentUser) {
      toast.error(t('form:validation.loginRequired'));
      return;
    }

    if (userInput.interests.length === 0) {
      toast.error(t('form:validation.selectInterests'));
      return;
    }

    if (!userInput.startDate) {
      toast.error(t('form:validation.dateRequired'));
      return;
    }

    setIsGenerating(true);

    // Convert 'notSure' to 'seoul' for API request
    const citiesToSend = userInput.cities.map(city => city === 'notSure' ? 'seoul' : city);

    try {
      const result = await generateSchedule({
        startDate: userInput.startDate,
        duration: userInput.duration,
        cities: citiesToSend,
        budget: userInput.budget,
        interests: userInput.interests,
        additionalNotes: additionalNotes,
        language: language,
      });
      // Pass itinerary, raw AI response, and user budget to parent
      onItineraryGenerated(result.itinerary, result.rawAIResponse, result.userBudget);
      toast.success(t('common:messages.itineraryGenerated'));
    } catch (error) {
      if (error instanceof ScheduleApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('common:messages.generateError'));
      }
      console.error('Schedule generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="travel-form-section">
      {/* Hero Banner - Simple & Bold Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="relative h-[320px] md:h-[400px] rounded-xl overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-gray-100 group">
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
              alt="Travel Adventure"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="bg-white border-2 border-black p-8 md:p-12 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full text-center relative">
              <div className="relative z-10 space-y-3">
                <h1 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none">
                  {t('form:hero.title').split(' ').slice(0, 2).join(' ')} <br/> {t('form:hero.title').split(' ').slice(2).join(' ')}
                </h1>
                <p className="text-base md:text-lg text-gray-600 font-bold">
                  {t('form:hero.subtitle')}
                </p>
              </div>
              
              {/* Decorative corners */}
              <div className="absolute top-3 left-3 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-3 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute bottom-3 left-3 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute bottom-3 right-3 w-2 h-2 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step 1: Basic Information */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
          <div className="bg-gray-50 border-b-2 border-black px-6 py-4">
            <h3 className="text-xl font-bold text-black flex items-center gap-3">
              <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-mono text-lg border-2 border-black">1</div>
              {t('form:sections.basicInfo')} <span className="text-gray-500 font-normal text-sm ml-auto">{t('form:sections.basicInfoOptional')}</span>
            </h3>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Date & Duration Section */}
            <div className="space-y-4">
              <Label className="text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t('form:labels.startDateHint')}
              </Label>

              {/* Date & Duration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-black uppercase tracking-wide">{t('form:labels.startDate')}</Label>
                  <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all rounded-lg ${
                        !userInput.startDate && "text-gray-500"
                      }`}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {userInput.startDate ? format(userInput.startDate, "PPP") : t('form:labels.pickDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 bg-white z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black rounded-lg" 
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={userInput.startDate}
                      onSelect={(date) => setUserInput(prev => ({ ...prev, startDate: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-4"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 font-medium">{t('form:labels.seasonalEventsHint')}</p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-black uppercase tracking-wide">{t('form:labels.duration')}</Label>
                <Select value={userInput.duration} onValueChange={(value) => setUserInput(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger className="w-full h-12 border-2 border-gray-200 hover:border-black transition-all rounded-lg">
                    <SelectValue placeholder={t('form:labels.selectDuration')} />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                    <SelectItem value="1 day">{t('form:duration.1day')}</SelectItem>
                    <SelectItem value="2 days">{t('form:duration.2days')}</SelectItem>
                    <SelectItem value="3 days">{t('form:duration.3days')}</SelectItem>
                    <SelectItem value="5 days">{t('form:duration.5days')}</SelectItem>
                    <SelectItem value="7 days">{t('form:duration.7days')}</SelectItem>
                    <SelectItem value="10 days">{t('form:duration.10days')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>

            {/* Destination Selection */}
            <div className="space-y-4 pt-6 border-t-2 border-gray-100">
              <Label className="text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('form:sections.whereToGo')}
              </Label>

              <div className="flex flex-wrap gap-3">
                {DESTINATION_OPTIONS.map((dest) => {
                  const isSelected = userInput.cities.includes(dest.id);
                  return (
                    <div
                      key={dest.id}
                      onClick={() => handleDestinationToggle(dest.id)}
                      className={`
                        cursor-pointer px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 border-2
                        ${isSelected
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(100,100,100,1)] translate-x-[-2px] translate-y-[-2px]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black'
                        }
                      `}
                    >
                      {t(`form:destinations.${dest.labelKey}`)}
                    </div>
                  );
                })}
              </div>

              {/* Custom city input */}
              <div className="flex gap-2 items-center mt-4">
                <Input
                  type="text"
                  placeholder={t('form:destinations.customPlaceholder')}
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCity()}
                  className="flex-1 h-10 border-2 border-gray-200 rounded-lg text-sm focus:border-black"
                />
                <Button
                  type="button"
                  onClick={handleAddCustomCity}
                  disabled={!customCity.trim()}
                  className="h-10 px-4 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                >
                  {t('form:destinations.addButton')}
                </Button>
              </div>

              {/* Custom cities display */}
              {userInput.cities.filter(c => !DESTINATION_OPTIONS.some(d => d.id === c)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {userInput.cities
                    .filter(city => !DESTINATION_OPTIONS.some(d => d.id === city))
                    .map((city) => (
                      <div
                        key={city}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {city}
                        <button
                          onClick={() => handleRemoveCustomCity(city)}
                          className="ml-1 text-gray-500 hover:text-black"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step 2: Interests */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
          <div className="bg-gray-50 border-b-2 border-black px-6 py-4">
            <h3 className="text-xl font-bold text-black flex items-center gap-3">
              <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-mono text-lg border-2 border-black">2</div>
              {t('form:sections.yourInterests')}
              <span className="text-sm font-medium text-gray-500 ml-auto">
                {userInput.interests.length}/{MAX_INTERESTS}
              </span>
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INTERESTS.map((interest) => {
                const isSelected = userInput.interests.includes(interest.id);
                const isDisabled = !isSelected && userInput.interests.length >= MAX_INTERESTS;
                return (
                  <div
                    key={interest.id}
                    onClick={() => !isDisabled && handleInterestToggle(interest.id)}
                    className={`
                      transition-all duration-200 border-2 rounded-xl p-2 flex flex-col items-center justify-center gap-2 h-20
                      ${isSelected
                        ? 'cursor-pointer bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(100,100,100,1)] translate-x-[-2px] translate-y-[-2px]'
                        : isDisabled
                          ? 'cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200 opacity-50'
                          : 'cursor-pointer bg-white text-gray-900 border-gray-200 hover:border-black hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="text-xl sm:text-2xl">{interest.icon}</div>
                    <p className="text-xs font-bold text-center leading-tight">
                      {t(`form:interestsList.${interest.labelKey}`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step 3: Budget */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
          <div className="bg-gray-50 border-b-2 border-black px-6 py-4">
            <h3 className="text-xl font-bold text-black flex items-center gap-3">
              <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-mono text-lg border-2 border-black">3</div>
              {t('form:sections.travelStyle')}
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRAVEL_STYLE_OPTIONS.map((option) => {
                const isSelected = userInput.budget === option.value;
                return (
                  <div
                    key={option.value}
                    onClick={() => setUserInput(prev => ({ ...prev, budget: option.value }))}
                    className={`
                      cursor-pointer transition-all duration-200 border-2 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2
                      ${isSelected
                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] translate-x-[-2px] translate-y-[-2px]'
                        : 'bg-white text-gray-900 border-gray-200 hover:border-black hover:shadow-md'
                      }
                    `}
                  >
                    <h3 className="font-bold text-lg">{t(`form:travelStyleOptions.${option.labelKey}`)}</h3>
                    <p className={`text-sm ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      {t(`form:travelStyleOptions.${option.descKey}`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step 4: Additional Notes */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
          <div className="bg-gray-50 border-b-2 border-black px-6 py-4">
            <h3 className="text-xl font-bold text-black flex items-center gap-3">
              <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-mono text-lg border-2 border-black">4</div>
              {t('form:sections.additionalNotes')} <span className="text-gray-500 font-normal text-sm ml-auto">{t('form:sections.basicInfoOptional')}</span>
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="additionalNotes" className="text-sm font-bold text-black uppercase tracking-wide mb-3 block">
                {t('form:sections.tellUsMore')}
              </Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={t('form:placeholders.additionalNotes')}
                className="min-h-[120px] border-2 border-gray-200 focus:border-black focus:ring-0 rounded-xl p-4 text-base resize-y"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 font-medium">
                  {t('form:notes.hint')}
                </p>
                <span className="text-xs text-gray-400 font-mono">
                  {additionalNotes.length}/500
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        className="text-center pb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !currentUser || !userInput.duration || userInput.interests.length === 0 || !userInput.startDate}
          size="lg"
          className="h-14 px-[24px] bg-black hover:bg-gray-900 text-white text-lg font-bold rounded-full shadow-[0px_4px_15px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0px_6px_20px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:hover:scale-100 text-[16px] py-[0px] mx-[12px] my-[0px]"
        >
          {isGenerating ? (
            <>
              <Sparkles className="h-5 w-5 mr-2 animate-spin" />
              {selectedDestination
                ? t('form:generate.generatingDestination', { destination: selectedDestination.name })
                : t('form:generate.generating')
              }
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              {selectedDestination
                ? t('form:generate.buttonDestination', { destination: selectedDestination.name })
                : t('form:generate.button')
              }
            </>
          )}
        </Button>

        {!currentUser && (
          <p className="text-sm text-amber-600 font-medium mt-3">
            * {t('form:validation.loginRequired')}
          </p>
        )}
        {currentUser && !userInput.duration && (
          <p className="text-sm text-red-600 font-medium mt-3 animate-pulse">
            * {t('form:validation.durationRequired')}
          </p>
        )}
        {currentUser && userInput.duration && userInput.interests.length === 0 && (
          <p className="text-sm text-red-600 font-medium mt-3 animate-pulse">
            * {t('form:validation.selectInterests')}
          </p>
        )}
        {currentUser && userInput.duration && userInput.interests.length > 0 && !userInput.startDate && (
          <p className="text-sm text-red-600 font-medium mt-3 animate-pulse">
            * {t('form:validation.dateRequired')}
          </p>
        )}
      </motion.div>

      {/* Suggested Banners Section */}
      <SuggestedBanners onBannerSelect={onDestinationSelect} />

      {/* Travel Guide Accordion Section (SEO) */}
      <TravelGuideAccordion />
    </div>
  );
}
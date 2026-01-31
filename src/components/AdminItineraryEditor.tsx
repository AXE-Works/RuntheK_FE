import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar as CalendarIcon,
  Star,
  Sparkles,
  Wand2,
  Loader2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  List,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Package,
  X,
  GripVertical
} from 'lucide-react';
import { generateSchedule, recommendPlaces, ScheduleApiError } from '../services/scheduleApi';
import { toast } from 'sonner';
import { TRAVEL_STYLE_OPTIONS, TRAVEL_STYLE_TO_BUDGET_API } from '../constants/travelOptions';
import { ImageUploadField } from './ImageUploadField';

interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost: string;
  googleMapsUrl?: string;
  isEvent?: boolean;
  eventType?: string;
}

interface Day {
  day: number;
  title: string;
  activities: Activity[];
}

interface ContentBlock {
  id: string;
  type: 'heading' | 'text' | 'image' | 'list' | 'highlights' | 'tips' | 'includes' | 'excludes' | 'whatToBring';
  content: string | string[];
  title?: string;
}

interface RichContent {
  introduction: string;
  highlights: string[];
  tips: string[];
  includes: string[];
  excludes: string[];
  whatToBring: string[];
  contentBlocks?: ContentBlock[];
}

interface RecommendedItinerary {
  id: string;
  title: string;
  description: string;
  duration: string;
  cities: string[];
  budget: string;
  travelStyle: string;
  interests: string[];
  imageUrl: string;
  rating: number;
  viewCount: number;
  active: boolean;
  featured: boolean;
  seoVisible: boolean;
  displayOrder: number;
  days: Day[];
  richContent?: RichContent;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminItineraryEditorProps {
  itinerary: RecommendedItinerary | null;
  onSave: (itinerary: RecommendedItinerary, imageFile?: File | null) => Promise<void>;
  onCancel: () => void;
}

const DESTINATION_OPTIONS = [
  { id: 'seoul', label: 'Seoul' },
  { id: 'busan', label: 'Busan' },
  { id: 'jeju', label: 'Jeju Island' },
  { id: 'gyeongju', label: 'Gyeongju' },
  { id: 'suwon', label: 'Suwon' },
  { id: 'notSure', label: 'Not Sure' }
];

const INTEREST_OPTIONS = [
  { id: 'food', label: 'Korean Food', icon: '🍜' },
  { id: 'local', label: 'Local Experience', icon: '🏘️' },
  { id: 'kculture', label: 'K-Pop & Entertainment', icon: '🎵' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'culture', label: 'Culture & History', icon: '🏛️' },
  { id: 'nature', label: 'Nature & Hiking', icon: '🏔️' }
];

// AI Recommendation categories for activity suggestions
const AI_RECOMMEND_CATEGORIES = [
  'Culture & History',
  'Korean Food',
  'Shopping',
  'Nature & Hiking',
  'Temples & Spirituality',
  'K-Pop & Entertainment',
  'Traditional Arts',
  'Nightlife'
];

// TRAVEL_STYLE_OPTIONS and TRAVEL_STYLE_TO_BUDGET_API are imported from '../constants/travelOptions'

const MAX_INTERESTS = 3;

// AI 응답을 Day[] 형식으로 변환
const convertAIResponseToDays = (itineraryData: {
  days: { day: number; title: string; activities: {
    time: string; activity: string; location: string;
    description: string; estimatedCost: string;
  }[] }[]
}): Day[] => {
  return itineraryData.days.map(day => ({
    day: day.day,
    title: day.title,
    activities: day.activities.map(act => ({
      time: act.time,
      activity: act.activity,
      location: act.location,
      description: act.description,
      estimatedCost: act.estimatedCost || '',
    })),
  }));
};

export function AdminItineraryEditor({ itinerary, onSave, onCancel }: AdminItineraryEditorProps) {
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Basic Info State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('5 days');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [cities, setCities] = useState<string[]>([]);
  const [customCity, setCustomCity] = useState('');
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [interests, setInterests] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [rating, setRating] = useState(4.5);
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [seoVisible, setSeoVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Schedule State
  const [days, setDays] = useState<Day[]>([]);
  
  // AI Suggestion State
  const [aiSuggestionMode, setAiSuggestionMode] = useState<{ dayIdx: number; actIdx: number } | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Activity[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Rich Content State
  const [richContent, setRichContent] = useState<RichContent>({
    introduction: '',
    highlights: [],
    tips: [],
    includes: [],
    excludes: [],
    whatToBring: [],
    contentBlocks: []
  });
  
  // Content Block State
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: 'sample-1',
      type: 'heading',
      content: 'Welcome to Seoul: The Heart of Korea'
    },
    {
      id: 'sample-2',
      type: 'text',
      content: 'Seoul is a vibrant metropolis that seamlessly blends ancient traditions with cutting-edge modernity. From historic palaces to trendy shopping districts, from traditional markets to high-tech entertainment venues, Seoul offers an unforgettable experience for every traveler.\n\nThis itinerary will guide you through the must-see attractions while also revealing hidden gems that only locals know about.'
    },
    {
      id: 'sample-3',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&h=600&fit=crop'
    },
    {
      id: 'sample-4',
      type: 'highlights',
      content: [
        'Visit 5 UNESCO World Heritage Sites including Gyeongbokgung Palace',
        'Experience authentic Korean BBQ in Gangnam district',
        'Explore trendy Hongdae and Itaewon neighborhoods',
        'Take Instagram-worthy photos at Bukchon Hanok Village',
        'Shop for K-beauty products in Myeongdong',
        'Enjoy panoramic city views from N Seoul Tower'
      ]
    },
    {
      id: 'sample-5',
      type: 'heading',
      content: 'What Makes This Trip Special'
    },
    {
      id: 'sample-6',
      type: 'list',
      content: [
        'Carefully curated itinerary mixing popular attractions with local favorites',
        'Optimized routes to minimize travel time and maximize experiences',
        'Flexible schedule allowing time for spontaneous discoveries',
        'Budget-friendly recommendations without compromising quality',
        'Cultural insights and etiquette tips for each location'
      ]
    },
    {
      id: 'sample-7',
      type: 'tips',
      content: [
        'Download Kakao Metro app for easy subway navigation - Seoul\'s metro system is incredibly efficient!',
        'Get a T-money card at any convenience store for seamless public transport payments',
        'Most restaurants close between 3-5 PM, so plan lunch before 2 PM',
        'Tipping is not customary in Korea - it might even be considered rude',
        'Learn basic phrases: "Annyeonghaseyo" (Hello), "Gamsahamnida" (Thank you)',
        'Many attractions offer free admission on certain days - check ahead!'
      ]
    },
    {
      id: 'sample-8',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&h=600&fit=crop'
    },
    {
      id: 'sample-9',
      type: 'includes',
      content: [
        'Detailed daily itineraries with optimized routes',
        'Public transportation directions for each location',
        'Estimated costs for all activities and meals',
        'Restaurant and café recommendations',
        'Cultural etiquette tips and local customs',
        'Emergency contact information',
        'Seasonal event suggestions based on your travel dates',
        'Photo spot recommendations at each location'
      ]
    },
    {
      id: 'sample-10',
      type: 'excludes',
      content: [
        'Flight tickets and travel insurance',
        'Accommodation bookings',
        'Personal expenses and shopping',
        'Optional tour guide services',
        'Visa application fees',
        'Travel SIM card or portable WiFi device',
        'Airport transfers (can be arranged separately)'
      ]
    },
    {
      id: 'sample-11',
      type: 'heading',
      content: 'Best Time to Visit Seoul'
    },
    {
      id: 'sample-12',
      type: 'text',
      content: 'Seoul is beautiful year-round, but each season offers unique experiences:\n\n🌸 Spring (March-May): Cherry blossoms and pleasant weather make this the most popular season. Book accommodations early!\n\n☀️ Summer (June-August): Hot and humid, but perfect for festivals and outdoor activities. Don\'t miss the summer night markets.\n\n🍁 Fall (September-November): Stunning autumn foliage and comfortable temperatures. Great for hiking and outdoor photography.\n\n❄️ Winter (December-February): Cold but magical, with winter light festivals and nearby ski resorts. Hot street food tastes even better!'
    }
  ]);

  // Initialize form with existing itinerary data
  useEffect(() => {
    if (itinerary) {
      setTitle(itinerary.title);
      setDescription(itinerary.description);
      setDuration(itinerary.duration); // Keep full duration string like "5 days"
      // Parse date from createdAt
      const parsedDate = itinerary.createdAt ? new Date(itinerary.createdAt.split('T')[0]) : undefined;
      setStartDate(parsedDate);
      setCities(itinerary.cities);
      setTravelStyle(itinerary.travelStyle || 'balanced');
      setInterests(itinerary.interests);
      setImageUrl(itinerary.imageUrl);
      setRating(itinerary.rating);
      setActive(itinerary.active);
      setFeatured(itinerary.featured);
      setSeoVisible(itinerary.seoVisible ?? true);
      setDisplayOrder(itinerary.displayOrder ?? 0);
      setDays(itinerary.days);
      const richData = itinerary.richContent || {
        introduction: '',
        highlights: [],
        tips: [],
        includes: [],
        excludes: [],
        whatToBring: [],
        contentBlocks: []
      };
      setRichContent(richData);
      setContentBlocks(richData.contentBlocks || []);
      setHasGenerated(true);
      setActiveTab('edit');
    }
  }, [itinerary]);

  // Mock 데이터 생성 함수 (API 연동 전 임시 사용)
  const generateMockItinerary = (numDays: number, selectedCities: string[], selectedInterests: string[]): Day[] => {
    const mockActivities: Record<string, { activity: string; location: string; description: string }[]> = {
      food: [
        { activity: 'Korean BBQ Experience', location: 'Gangnam-gu, Seoul', description: 'Authentic Korean barbecue with premium meat cuts' },
        { activity: 'Gwangjang Market Food Tour', location: 'Jongno-gu, Seoul', description: 'Try bindaetteok, mayak gimbap, and other street foods' },
        { activity: 'Traditional Korean Lunch', location: 'Various', description: 'Authentic Korean set meal (jeongsik) at local restaurant' },
        { activity: 'Street Food Tour in Myeongdong', location: 'Jung-gu, Seoul', description: 'Sample hotteok, tteokbokki, and Korean fried chicken' },
        { activity: 'Fine Dining Korean Cuisine', location: 'Jung-gu, Seoul', description: 'Modern interpretation of traditional Korean flavors' }
      ],
      culture: [
        { activity: 'Visit Gyeongbokgung Palace', location: 'Jongno-gu, Seoul', description: 'Explore the largest of the Five Grand Palaces built during the Joseon Dynasty' },
        { activity: 'Bukchon Hanok Village', location: 'Jongno-gu, Seoul', description: 'Walk through traditional Korean houses and experience old Seoul' },
        { activity: 'National Museum of Korea', location: 'Yongsan-gu, Seoul', description: 'Discover 5,000 years of Korean history and culture' },
        { activity: 'Changdeokgung Palace Secret Garden', location: 'Jongno-gu, Seoul', description: 'UNESCO World Heritage site with beautiful secret gardens' },
        { activity: 'Jogyesa Temple', location: 'Jongno-gu, Seoul', description: 'Main temple of Korean Buddhism in Seoul' }
      ],
      shopping: [
        { activity: 'Myeongdong Shopping', location: 'Jung-gu, Seoul', description: 'Shop for cosmetics, fashion, and souvenirs' },
        { activity: 'Hongdae Area', location: 'Mapo-gu, Seoul', description: 'Trendy shopping and youth culture district' },
        { activity: 'Dongdaemun Design Plaza', location: 'Jung-gu, Seoul', description: 'Modern shopping complex and cultural hub' },
        { activity: 'Insadong Traditional Crafts', location: 'Jongno-gu, Seoul', description: 'Traditional Korean crafts and antiques shopping' },
        { activity: 'Gangnam Underground Shopping', location: 'Gangnam-gu, Seoul', description: 'Extensive underground shopping network' }
      ],
      nature: [
        { activity: 'Namsan Tower Hike', location: 'Jung-gu, Seoul', description: "Hike up to Seoul's iconic landmark for city views" },
        { activity: 'Han River Cruise', location: 'Seoul', description: "Relaxing cruise along Seoul's main river" },
        { activity: 'Bukhansan National Park', location: 'Northern Seoul', description: 'Scenic mountain hiking with panoramic views' },
        { activity: 'Banpo Rainbow Bridge', location: 'Seocho-gu, Seoul', description: 'Musical fountain show with rainbow lights' },
        { activity: 'Seoullo 7017 Skygarden', location: 'Jung-gu, Seoul', description: 'Elevated botanical garden and walkway' }
      ],
      kculture: [
        { activity: 'K-Pop Experience', location: 'Gangnam-gu, Seoul', description: 'Visit entertainment companies and K-pop themed cafes' },
        { activity: 'Lotte World Tower', location: 'Songpa-gu, Seoul', description: 'Modern entertainment complex with amazing views' },
        { activity: 'SM Town Museum', location: 'Gangnam-gu, Seoul', description: 'Interactive K-pop museum and experience center' },
        { activity: 'Korean Drama Filming Locations Tour', location: 'Various, Seoul', description: 'Visit famous K-drama shooting locations' },
        { activity: 'HYBE Insight', location: 'Yongsan-gu, Seoul', description: 'BTS and HYBE artists exhibition and experience' }
      ],
      local: [
        { activity: 'Local Market Experience', location: 'Namdaemun, Seoul', description: 'Explore traditional Korean market life' },
        { activity: 'Korean Cooking Class', location: 'Mapo-gu, Seoul', description: 'Learn to make kimchi and bulgogi with local chefs' },
        { activity: 'Neighborhood Walk in Ikseon-dong', location: 'Jongno-gu, Seoul', description: 'Explore charming alleyways with cafes and shops' },
        { activity: 'Local Pub Hopping', location: 'Euljiro, Seoul', description: 'Experience authentic Korean nightlife in retro bars' },
        { activity: 'Morning Yoga at Han River', location: 'Yeouido, Seoul', description: 'Join locals for outdoor exercise along the river' }
      ]
    };

    const budgetRanges: Record<string, { low: string; mid: string; high: string }> = {
      relaxed: { low: '$10-20', mid: '$15-25', high: '$20-35' },
      balanced: { low: '$20-40', mid: '$30-50', high: '$40-70' },
      packed: { low: '$50-80', mid: '$70-100', high: '$80-150' }
    };

    const currentBudget = budgetRanges[travelStyle] || budgetRanges.balanced;

    return Array.from({ length: numDays }, (_, i) => {
      const dayActivities: Activity[] = [];
      const cityForDay = selectedCities.length > 0
        ? selectedCities[i % selectedCities.length]
        : 'Seoul';

      // Morning Activity
      const morningInterest = selectedInterests[i % selectedInterests.length] || 'culture';
      const morningActivities = mockActivities[morningInterest] || mockActivities.culture;
      dayActivities.push({
        time: '09:00 AM',
        ...morningActivities[i % morningActivities.length],
        estimatedCost: currentBudget.low
      });

      // Lunch
      dayActivities.push({
        time: '12:00 PM',
        activity: 'Traditional Korean Lunch',
        location: `${cityForDay}`,
        description: 'Enjoy authentic Korean cuisine at a local restaurant',
        estimatedCost: currentBudget.mid
      });

      // Afternoon Activity 1
      const afternoonInterest1 = selectedInterests[(i + 1) % selectedInterests.length] || 'shopping';
      const afternoonActivities1 = mockActivities[afternoonInterest1] || mockActivities.shopping;
      dayActivities.push({
        time: '02:00 PM',
        ...afternoonActivities1[(i + 1) % afternoonActivities1.length],
        estimatedCost: currentBudget.low
      });

      // Afternoon Activity 2
      const afternoonInterest2 = selectedInterests[(i + 2) % selectedInterests.length] || 'nature';
      const afternoonActivities2 = mockActivities[afternoonInterest2] || mockActivities.nature;
      dayActivities.push({
        time: '04:30 PM',
        ...afternoonActivities2[(i + 2) % afternoonActivities2.length],
        estimatedCost: currentBudget.low
      });

      // Dinner
      dayActivities.push({
        time: '07:00 PM',
        activity: 'Korean BBQ Dinner',
        location: `${cityForDay}`,
        description: 'Premium Korean barbecue with banchan (side dishes)',
        estimatedCost: currentBudget.high
      });

      return {
        day: i + 1,
        title: `Day ${i + 1} - Exploring ${cityForDay}`,
        activities: dayActivities
      };
    });
  };

  const handleGenerateAI = async () => {
    if (interests.length === 0) {
      toast.error('관심사를 최소 1개 선택해주세요!');
      return;
    }

    if (!startDate) {
      toast.error('시작 날짜를 선택해주세요!');
      return;
    }

    setIsGenerating(true);

    // Extract number from duration (e.g., "5 days" -> "5")
    const durationNum = parseInt(duration.split(' ')[0]) || 5;
    const citiesToUse = cities.length > 0 ? cities.map(c => c === 'notSure' ? 'Seoul' : c) : ['Seoul'];

    try {
      // 실제 AI API 호출
      // travelStyle을 직접 전달 (AI API의 travel_style 필드로 매핑됨)
      const result = await generateSchedule({
        startDate: startDate,
        duration: duration,
        cities: citiesToUse,
        budget: travelStyle,  // 'relaxed' | 'balanced' | 'packed'
        interests: interests,
        additionalNotes: additionalNotes,
        language: 'en',
      });

      // API 응답에서 days 추출하여 상태 업데이트
      const generatedDays: Day[] = result.itinerary.days.map(day => ({
        day: day.day,
        title: day.title,
        activities: day.activities.map(act => ({
          time: act.time,
          activity: act.activity,
          location: act.location,
          description: act.description,
          estimatedCost: act.estimatedCost,
          googleMapsUrl: act.googleMapsUrl,
          isEvent: act.isEvent,
          eventType: act.eventType,
        })),
      }));

      setDays(generatedDays);

      // Auto-fill some fields if empty
      if (!title) {
        setTitle(result.itinerary.title || `${durationNum} Days ${citiesToUse[0]} Adventure`);
      }
      if (!description) {
        setDescription(`Explore the best of ${citiesToUse.join(', ')} with this carefully curated ${durationNum}-day itinerary.`);
      }
      if (!imageUrl) {
        setImageUrl('https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800');
      }

      setHasGenerated(true);
      setActiveTab('edit');
      toast.success('AI 일정이 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('[AdminItineraryEditor] AI generation error:', error);

      if (error instanceof ScheduleApiError) {
        toast.error(error.message);
      } else {
        toast.error('일정 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!hasGenerated || days.length === 0) {
      alert('먼저 일정을 생성해주세요!');
      return;
    }

    const savedItinerary: RecommendedItinerary = {
      id: itinerary?.id || '',
      title,
      description,
      duration,
      cities,
      budget: TRAVEL_STYLE_TO_BUDGET_API[travelStyle] || 'mid-range',
      travelStyle,
      interests,
      imageUrl,
      rating,
      viewCount: itinerary?.viewCount || 0,
      active,
      featured,
      seoVisible,
      displayOrder,
      days,
      richContent: {
        ...richContent,
        contentBlocks
      },
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      createdAt: itinerary?.createdAt || '',
      updatedAt: itinerary?.updatedAt || ''
    };

    setIsSaving(true);
    try {
      await onSave(savedItinerary, imageFile);
    } finally {
      setIsSaving(false);
    }
  };

  // Schedule Management Functions
  const addDay = () => {
    const newDay: Day = {
      day: days.length + 1,
      title: `Day ${days.length + 1}`,
      activities: []
    };
    setDays([...days, newDay]);
  };

  const updateDay = (index: number, field: keyof Day, value: any) => {
    const updated = days.map((day, idx) => 
      idx === index ? { ...day, [field]: value } : day
    );
    setDays(updated);
  };

  const deleteDay = (index: number) => {
    setDays(days.filter((_, idx) => idx !== index).map((day, idx) => ({ ...day, day: idx + 1 })));
  };

  const addActivity = (dayIndex: number) => {
    const newActivity: Activity = {
      time: '09:00 AM',
      activity: 'New Activity',
      location: 'Location',
      description: 'Activity description',
      estimatedCost: '$0',
      isEvent: false
    };
    const updated = days.map((day, idx) => 
      idx === dayIndex ? { ...day, activities: [...day.activities, newActivity] } : day
    );
    setDays(updated);
  };

  const updateActivity = (dayIndex: number, activityIndex: number, field: keyof Activity, value: any) => {
    const updated = days.map((day, dIdx) => 
      dIdx === dayIndex 
        ? {
            ...day,
            activities: day.activities.map((act, aIdx) => 
              aIdx === activityIndex ? { ...act, [field]: value } : act
            )
          }
        : day
    );
    setDays(updated);
  };

  const deleteActivity = (dayIndex: number, activityIndex: number) => {
    const updated = days.map((day, dIdx) => 
      dIdx === dayIndex 
        ? { ...day, activities: day.activities.filter((_, aIdx) => aIdx !== activityIndex) }
        : day
    );
    setDays(updated);
  };

  // AI Spot Suggestion Functions
  // POST /api/v1/admin/recommend-places API 연동
  const generateActivitySuggestions = async (prompt: string, currentActivity: Activity) => {
    if (!prompt.trim()) {
      toast.error('프롬프트를 입력해주세요!');
      return;
    }

    setIsLoadingAI(true);

    try {
      // Get destination from cities or use Seoul as default
      const destination = cities.length > 0
        ? DESTINATION_OPTIONS.find(opt => opt.id === cities[0])?.label || cities[0]
        : 'Seoul';

      // Convert budget (travel style) to API format
      const apiRequest = {
        prompt: prompt,
        destination: destination,
        interests: interests,
        budget: TRAVEL_STYLE_TO_BUDGET_API[travelStyle] || 'mid-range',
        count: 3,
      };

      const response = await recommendPlaces(apiRequest);

      // Convert API response to Activity[] format
      const suggestions: Activity[] = response.recommendations.map(rec => ({
        time: currentActivity.time,
        activity: rec.activity,
        location: rec.location,
        description: rec.description || '',
        estimatedCost: rec.estimatedCost,
        googleMapsUrl: rec.googleMapsUrl,
        isEvent: false,
      }));

      setAiSuggestions(suggestions);

      if (suggestions.length === 0) {
        toast.info('추천 결과가 없습니다. 다른 키워드를 시도해보세요.');
      }
    } catch (error) {
      console.error('[AdminItineraryEditor] AI recommendation error:', error);

      if (error instanceof ScheduleApiError) {
        toast.error(error.message);
      } else {
        toast.error('AI 추천 생성 중 오류가 발생했습니다.');
      }
      setAiSuggestions([]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const selectAISuggestion = (dayIdx: number, actIdx: number, suggestion: Activity) => {
    // 한 번에 모든 필드 업데이트 (React 배치 업데이트 문제 방지)
    const updated = days.map((day, dIdx) =>
      dIdx === dayIdx
        ? {
            ...day,
            activities: day.activities.map((act, aIdx) =>
              aIdx === actIdx
                ? {
                    ...act,
                    activity: suggestion.activity,
                    location: suggestion.location,
                    description: suggestion.description,
                    estimatedCost: suggestion.estimatedCost,
                    googleMapsUrl: suggestion.googleMapsUrl
                  }
                : act
            )
          }
        : day
    );
    setDays(updated);

    // Exit AI mode
    setAiSuggestionMode(null);
    setAiSuggestions([]);
    setAiPrompt('');
  };

  const cancelAISuggestion = () => {
    setAiSuggestionMode(null);
    setAiSuggestions([]);
    setAiPrompt('');
  };

  // Rich Content Management
  const addToList = (field: keyof RichContent, value: string) => {
    if (!value.trim()) return;
    setRichContent({
      ...richContent,
      [field]: [...(richContent[field] as string[]), value]
    });
  };

  const removeFromList = (field: keyof RichContent, index: number) => {
    setRichContent({
      ...richContent,
      [field]: (richContent[field] as string[]).filter((_, idx) => idx !== index)
    });
  };

  const [newHighlight, setNewHighlight] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newInclude, setNewInclude] = useState('');
  const [newExclude, setNewExclude] = useState('');
  const [newWhatToBring, setNewWhatToBring] = useState('');

  // Content Block Management
  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'list' || type === 'highlights' || type === 'tips' || type === 'includes' || type === 'excludes' || type === 'whatToBring' ? [] : '',
      title: type === 'heading' ? 'New Heading' : undefined
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(contentBlocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteContentBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...contentBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setContentBlocks(newBlocks);
  };

  const moveBlockDown = (index: number) => {
    if (index === contentBlocks.length - 1) return;
    const newBlocks = [...contentBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setContentBlocks(newBlocks);
  };

  // Drag and Drop: Content block reordering
  const reorderContentBlocks = (oldIndex: number, newIndex: number) => {
    setContentBlocks(prev => arrayMove(prev, oldIndex, newIndex));
  };

  // Handle content block drag end event
  const handleContentBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = contentBlocks.findIndex(block => block.id === active.id);
      const newIndex = contentBlocks.findIndex(block => block.id === over.id);
      reorderContentBlocks(oldIndex, newIndex);
    }
  };

  const addItemToBlockList = (blockId: string, item: string) => {
    if (!item.trim()) return;
    setContentBlocks(contentBlocks.map(block => {
      if (block.id === blockId && Array.isArray(block.content)) {
        return { ...block, content: [...block.content, item] };
      }
      return block;
    }));
  };

  const removeItemFromBlockList = (blockId: string, itemIndex: number) => {
    setContentBlocks(contentBlocks.map(block => {
      if (block.id === blockId && Array.isArray(block.content)) {
        return { ...block, content: block.content.filter((_, idx) => idx !== itemIndex) };
      }
      return block;
    }));
  };

  const loadSampleContentBlocks = () => {
    const sampleBlocks: ContentBlock[] = [
      {
        id: 'sample-1',
        type: 'heading',
        content: 'Welcome to Seoul: The Heart of Korea'
      },
      {
        id: 'sample-2',
        type: 'text',
        content: 'Seoul is a vibrant metropolis that seamlessly blends ancient traditions with cutting-edge modernity. From historic palaces to trendy shopping districts, from traditional markets to high-tech entertainment venues, Seoul offers an unforgettable experience for every traveler.\n\nThis itinerary will guide you through the must-see attractions while also revealing hidden gems that only locals know about.'
      },
      {
        id: 'sample-3',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&h=600&fit=crop'
      },
      {
        id: 'sample-4',
        type: 'highlights',
        content: [
          'Visit 5 UNESCO World Heritage Sites including Gyeongbokgung Palace',
          'Experience authentic Korean BBQ in Gangnam district',
          'Explore trendy Hongdae and Itaewon neighborhoods',
          'Take Instagram-worthy photos at Bukchon Hanok Village',
          'Shop for K-beauty products in Myeongdong',
          'Enjoy panoramic city views from N Seoul Tower'
        ]
      },
      {
        id: 'sample-5',
        type: 'heading',
        content: 'What Makes This Trip Special'
      },
      {
        id: 'sample-6',
        type: 'list',
        content: [
          'Carefully curated itinerary mixing popular attractions with local favorites',
          'Optimized routes to minimize travel time and maximize experiences',
          'Flexible schedule allowing time for spontaneous discoveries',
          'Budget-friendly recommendations without compromising quality',
          'Cultural insights and etiquette tips for each location'
        ]
      },
      {
        id: 'sample-7',
        type: 'tips',
        content: [
          'Download Kakao Metro app for easy subway navigation - Seoul\'s metro system is incredibly efficient!',
          'Get a T-money card at any convenience store for seamless public transport payments',
          'Most restaurants close between 3-5 PM, so plan lunch before 2 PM',
          'Tipping is not customary in Korea - it might even be considered rude',
          'Learn basic phrases: "Annyeonghaseyo" (Hello), "Gamsahamnida" (Thank you)',
          'Many attractions offer free admission on certain days - check ahead!'
        ]
      },
      {
        id: 'sample-8',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&h=600&fit=crop'
      },
      {
        id: 'sample-9',
        type: 'includes',
        content: [
          'Detailed daily itineraries with optimized routes',
          'Public transportation directions for each location',
          'Estimated costs for all activities and meals',
          'Restaurant and café recommendations',
          'Cultural etiquette tips and local customs',
          'Emergency contact information',
          'Seasonal event suggestions based on your travel dates',
          'Photo spot recommendations at each location'
        ]
      },
      {
        id: 'sample-10',
        type: 'excludes',
        content: [
          'Flight tickets and travel insurance',
          'Accommodation bookings',
          'Personal expenses and shopping',
          'Optional tour guide services',
          'Visa application fees',
          'Travel SIM card or portable WiFi device',
          'Airport transfers (can be arranged separately)'
        ]
      },
      {
        id: 'sample-11',
        type: 'heading',
        content: 'Best Time to Visit Seoul'
      },
      {
        id: 'sample-12',
        type: 'text',
        content: 'Seoul is beautiful year-round, but each season offers unique experiences:\n\n🌸 Spring (March-May): Cherry blossoms and pleasant weather make this the most popular season. Book accommodations early!\n\n☀️ Summer (June-August): Hot and humid, but perfect for festivals and outdoor activities. Don\'t miss the summer night markets.\n\n🍁 Fall (September-November): Stunning autumn foliage and comfortable temperatures. Great for hiking and outdoor photography.\n\n❄️ Winter (December-February): Cold but magical, with winter light festivals and nearby ski resorts. Hot street food tastes even better!'
      }
    ];
    setContentBlocks(sampleBlocks);
  };

  const handleDestinationToggle = (destinationId: string) => {
    setCities(prev =>
      prev.includes(destinationId) ? prev.filter(c => c !== destinationId) : [...prev, destinationId]
    );
  };

  const handleAddCustomCity = () => {
    const trimmedCity = customCity.trim();
    if (trimmedCity && !cities.includes(trimmedCity)) {
      setCities(prev => [...prev, trimmedCity]);
      setCustomCity('');
    }
  };

  const handleRemoveCustomCity = (city: string) => {
    setCities(prev => prev.filter(c => c !== city));
  };

  const handleInterestToggle = (interestId: string) => {
    setInterests(prev => {
      const isAlreadySelected = prev.includes(interestId);

      // 이미 선택된 경우 제거
      if (isAlreadySelected) {
        return prev.filter(id => id !== interestId);
      }

      // 최대 개수 도달 시 추가 불가
      if (prev.length >= MAX_INTERESTS) {
        return prev;
      }

      return [...prev, interestId];
    });
  };

  // Drag and Drop: Activity reordering
  const reorderActivities = (dayIdx: number, oldIndex: number, newIndex: number) => {
    setDays(prev => prev.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      const newActivities = arrayMove(day.activities, oldIndex, newIndex);
      return { ...day, activities: newActivities };
    }));
  };

  // DnD sensors for better UX
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent, dayIdx: number) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[2]);
      const newIndex = parseInt(over.id.toString().split('-')[2]);
      reorderActivities(dayIdx, oldIndex, newIndex);
    }
  };

  // SortableActivityCard component for drag and drop
  interface SortableActivityCardProps {
    id: string;
    dayIdx: number;
    actIdx: number;
    activity: Activity;
    aiSuggestionMode: { dayIdx: number; actIdx: number } | null;
    setAiSuggestionMode: React.Dispatch<React.SetStateAction<{ dayIdx: number; actIdx: number } | null>>;
    setAiPrompt: React.Dispatch<React.SetStateAction<string>>;
    setAiSuggestions: React.Dispatch<React.SetStateAction<Activity[]>>;
    updateActivity: (dayIndex: number, activityIndex: number, field: keyof Activity, value: any) => void;
    deleteActivity: (dayIndex: number, activityIndex: number) => void;
    aiPrompt: string;
    aiSuggestions: Activity[];
    isLoadingAI: boolean;
    generateActivitySuggestions: (prompt: string, currentActivity: Activity) => Promise<void>;
    cancelAISuggestion: () => void;
    selectAISuggestion: (dayIdx: number, actIdx: number, suggestion: Activity) => void;
  }

  const SortableActivityCard: React.FC<SortableActivityCardProps> = ({
    id,
    dayIdx,
    actIdx,
    activity,
    aiSuggestionMode,
    setAiSuggestionMode,
    setAiPrompt,
    setAiSuggestions,
    updateActivity,
    deleteActivity,
    aiPrompt,
    aiSuggestions,
    isLoadingAI,
    generateActivitySuggestions,
    cancelAISuggestion,
    selectAISuggestion,
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 'auto',
    };

    return (
      <div
        ref={setNodeRef}
        style={style as React.CSSProperties}
        className={`border-2 rounded-lg overflow-hidden ${
          activity.isEvent
            ? 'border-yellow-400 bg-yellow-50'
            : 'border-black bg-white'
        }`}
      >
        {/* Header Row: Drag Handle + Number + Time + Cost */}
        <div className="flex items-center gap-4 p-4 border-b-2 border-gray-100">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
            title="드래그하여 순서 변경"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div className="bg-black text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0">
            {actIdx + 1}
          </div>
          <Input
            value={activity.time}
            onChange={(e) => updateActivity(dayIdx, actIdx, 'time', e.target.value)}
            placeholder="09:00 AM"
            className="w-32 h-9 px-3 py-2 bg-yellow-400 border-2 border-black rounded font-bold text-sm focus:ring-0 focus:border-black"
          />
          {activity.isEvent && (
            <Badge className="bg-black text-white border-2 border-black rounded px-3 py-1.5 text-xs font-bold">
              EVENT
            </Badge>
          )}
          <div className="flex-1" />
          <Input
            value={activity.estimatedCost}
            onChange={(e) => updateActivity(dayIdx, actIdx, 'estimatedCost', e.target.value)}
            placeholder="$20-50"
            className="w-28 h-9 px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded font-bold text-sm text-right focus:ring-0 focus:border-black"
          />
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4">
          {/* Activity Name */}
          <Input
            value={activity.activity}
            onChange={(e) => updateActivity(dayIdx, actIdx, 'activity', e.target.value)}
            placeholder="Activity name"
            className="font-bold text-lg border-0 border-b-2 border-gray-200 rounded-none px-0 py-2 focus:ring-0 focus:border-black"
          />

          {/* Location */}
          <div className="flex items-center gap-2 py-1">
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <Input
              value={activity.location}
              onChange={(e) => updateActivity(dayIdx, actIdx, 'location', e.target.value)}
              placeholder="Location"
              className="flex-1 text-sm text-gray-600 border-0 border-b border-gray-200 rounded-none px-0 py-1 focus:ring-0 focus:border-black"
            />
          </div>

          {/* Description */}
          <Textarea
            value={activity.description}
            onChange={(e) => updateActivity(dayIdx, actIdx, 'description', e.target.value)}
            placeholder="Activity description"
            rows={2}
            className="text-sm text-gray-600 border-2 border-gray-200 rounded-lg p-3 resize-none focus:ring-0 focus:border-black"
          />
        </div>

        {/* Footer: Action Buttons */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-t-2 border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={activity.isEvent || false}
                onCheckedChange={(checked) => updateActivity(dayIdx, actIdx, 'isEvent', checked)}
              />
              <Label className="text-xs font-bold text-gray-600">이벤트</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAiSuggestionMode({ dayIdx, actIdx });
                setAiPrompt('');
                setAiSuggestions([]);
              }}
              className="border-2 border-purple-500 text-purple-700 hover:bg-purple-50 h-9 px-3 text-xs font-bold"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              AI 추천
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteActivity(dayIdx, actIdx)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 px-3"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>

        {/* AI Suggestion Mode */}
        {aiSuggestionMode?.dayIdx === dayIdx && aiSuggestionMode?.actIdx === actIdx && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-4 bg-purple-50 border-t-2 border-purple-200 space-y-4"
          >
            {/* Category Selection */}
            <div className="space-y-3">
              <label style={{ color: '#581c87', fontWeight: 'bold', fontSize: '14px' }}>카테고리 선택</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {AI_RECOMMEND_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setAiPrompt(category)}
                    disabled={isLoadingAI}
                    style={{
                      padding: '6px 12px',
                      fontSize: '13px',
                      fontWeight: aiPrompt === category ? 600 : 500,
                      borderRadius: '16px',
                      border: `1.5px solid ${aiPrompt === category ? '#9333ea' : '#d1d5db'}`,
                      backgroundColor: aiPrompt === category ? '#f3e8ff' : 'white',
                      color: aiPrompt === category ? '#7c3aed' : '#4b5563',
                      cursor: isLoadingAI ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isLoadingAI ? 0.5 : 1
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={cancelAISuggestion}
                  disabled={isLoadingAI}
                  style={{
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: isLoadingAI ? 'not-allowed' : 'pointer',
                    opacity: isLoadingAI ? 0.5 : 1
                  }}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => generateActivitySuggestions(aiPrompt, activity)}
                  disabled={isLoadingAI || !aiPrompt.trim()}
                  style={{
                    backgroundColor: (isLoadingAI || !aiPrompt.trim()) ? '#a78bfa' : '#9333ea',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '0 20px',
                    height: '36px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    border: 'none',
                    cursor: (isLoadingAI || !aiPrompt.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoadingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      생성중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      추천받기
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-bold text-purple-900">AI 추천 결과 (선택하세요)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiSuggestions.map((suggestion, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => selectAISuggestion(dayIdx, actIdx, suggestion)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-purple-900 group-hover:text-purple-700 line-clamp-2">
                            {suggestion.activity}
                          </h4>
                          <Badge className="bg-purple-600 text-white text-xs shrink-0">
                            옵션 {idx + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-purple-700">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{suggestion.location}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{suggestion.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                          <span className="text-xs font-bold text-purple-800">{suggestion.estimatedCost}</span>
                          <Button
                            size="sm"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAISuggestion(dayIdx, actIdx, suggestion);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs font-bold"
                          >
                            선택
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  // SortableContentBlock component for drag and drop
  interface SortableContentBlockProps {
    block: ContentBlock;
    index: number;
    updateContentBlock: (id: string, updates: Partial<ContentBlock>) => void;
    deleteContentBlock: (id: string) => void;
    moveBlockUp: (index: number) => void;
    moveBlockDown: (index: number) => void;
    addItemToBlockList: (blockId: string, item: string) => void;
    removeItemFromBlockList: (blockId: string, itemIndex: number) => void;
    totalBlocks: number;
  }

  const SortableContentBlock: React.FC<SortableContentBlockProps> = ({
    block,
    index,
    updateContentBlock,
    deleteContentBlock,
    moveBlockUp,
    moveBlockDown,
    addItemToBlockList,
    removeItemFromBlockList,
    totalBlocks,
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: block.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 'auto',
    };

    return (
      <div
        ref={setNodeRef}
        style={style as React.CSSProperties}
        className="bg-white border-2 border-black p-6 relative"
      >
        {/* Block Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
              title="드래그하여 순서 변경"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <span className="font-bold uppercase text-sm">
              {block.type === 'heading' && '📌 제목'}
              {block.type === 'text' && '📝 텍스트'}
              {block.type === 'image' && '🖼️ 이미지'}
              {block.type === 'list' && '📋 리스트'}
              {block.type === 'highlights' && '⭐ 하이라이트'}
              {block.type === 'tips' && '💡 여행 팁'}
              {block.type === 'includes' && '✅ 포함사항'}
              {block.type === 'excludes' && '❌ 불포함사항'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveBlockUp(index)}
              disabled={index === 0}
              className="border-2 border-black rounded-none hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveBlockDown(index)}
              disabled={index === totalBlocks - 1}
              className="border-2 border-black rounded-none hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteContentBlock(block.id)}
              className="border-2 border-red-600 text-red-600 rounded-none hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Block Content */}
        {block.type === 'heading' && (
          <div>
            <Input
              value={block.content as string}
              onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
              placeholder="제목을 입력하세요"
              className="border-2 border-black rounded-none text-2xl font-bold focus-visible:ring-0 focus-visible:border-black"
            />
          </div>
        )}

        {block.type === 'text' && (
          <div>
            <Textarea
              value={block.content as string}
              onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
              placeholder="자유롭게 텍스트를 작성하세요..."
              rows={6}
              className="border-2 border-black rounded-none focus-visible:ring-0 focus-visible:border-black resize-y"
            />
          </div>
        )}

        {block.type === 'image' && (
          <div className="space-y-3">
            <ImageUploadField
              value={block.content as string}
              onChange={(url) => updateContentBlock(block.id, { content: url })}
              showUrlInput={true}
              height="h-48"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        )}

        {(block.type === 'list' || block.type === 'highlights' || block.type === 'tips' ||
          block.type === 'includes' || block.type === 'excludes') && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder={`항목 추가 (Enter로 추가)`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    addItemToBlockList(block.id, input.value);
                    input.value = '';
                  }
                }}
                className="border-2 border-black rounded-none"
              />
              <Button
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement);
                  addItemToBlockList(block.id, input.value);
                  input.value = '';
                }}
                className="bg-black text-white rounded-none hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {(Array.isArray(block.content) ? block.content : []).map((item, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 border-2 border-gray-300 bg-gray-50">
                  <span className="flex items-center gap-2">
                    {block.type === 'highlights' && '✓'}
                    {block.type === 'tips' && '💡'}
                    {block.type === 'includes' && '✅'}
                    {block.type === 'excludes' && '❌'}
                    {block.type === 'list' && '•'}
                    <span>{item}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItemFromBlockList(block.id, idx)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
            {(Array.isArray(block.content) ? block.content : []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-300">
                아직 항목이 없습니다. 위에서 항목을 추가하세요.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-2 border-black rounded-none hover:bg-black hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">
              {itinerary ? '추천 여행 일정 수정' : '새 추천 여행 일정 만들기'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {hasGenerated ? '생성된 일정을 수정하고 저장하세요' : 'AI로 여행 일정을 자동 생성하세요'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasGenerated || isSaving}
          className="bg-black text-white rounded-none hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold h-12 px-8 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            '저장하기'
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b-2 border-black bg-transparent p-0 h-auto rounded-none mb-8">
          {[
            { value: 'generate', label: '기본 정보 & 생성', disabled: false },
            { value: 'edit', label: '일정 편집', disabled: !hasGenerated },
            { value: 'content', label: 'Rich Content', disabled: !hasGenerated },
            { value: 'preview', label: '미리보기', disabled: !hasGenerated }
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className="rounded-none border-b-4 border-transparent px-8 py-4 font-bold uppercase tracking-tight data-[state=active]:border-black data-[state=active]:bg-transparent hover:text-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
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
                  Basic Information <span className="text-gray-500 font-normal text-sm ml-auto">Optional</span>
                </h3>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Date & Duration Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    When do you want to start?
                  </Label>

                  {/* Date & Duration Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-black uppercase tracking-wide">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all rounded-lg ${
                              !startDate && "text-gray-500"
                            }`}
                          >
                            <CalendarIcon className="mr-3 h-5 w-5" />
                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-white z-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black rounded-lg"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => setStartDate(date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-4"
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-500 font-medium">We'll suggest seasonal events based on this.</p>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-black uppercase tracking-wide">Duration</Label>
                      <Select value={duration} onValueChange={(value) => setDuration(value)}>
                        <SelectTrigger className="w-full h-12 border-2 border-gray-200 hover:border-black transition-all rounded-lg">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                          <SelectItem value="1 day">1 day</SelectItem>
                          <SelectItem value="2 days">2 days</SelectItem>
                          <SelectItem value="3 days">3 days</SelectItem>
                          <SelectItem value="5 days">5 days</SelectItem>
                          <SelectItem value="7 days">7 days</SelectItem>
                          <SelectItem value="10 days">10 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Destination Selection */}
                <div className="space-y-4 pt-6 border-t-2 border-gray-100">
                  <Label className="text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Where do you want to go?
                  </Label>

                  <div className="flex flex-wrap gap-3">
                    {DESTINATION_OPTIONS.map((dest) => {
                      const isSelected = cities.includes(dest.id);
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
                          {dest.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom city input */}
                  <div className="flex gap-2 items-center mt-4">
                    <Input
                      type="text"
                      placeholder="Or type a custom city..."
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
                      Add
                    </Button>
                  </div>

                  {/* Custom cities display */}
                  {cities.filter(c => !DESTINATION_OPTIONS.some(d => d.id === c)).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {cities
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
                  Your Interests
                  <span className="text-sm font-medium text-gray-500 ml-auto">
                    {interests.length}/{MAX_INTERESTS}
                  </span>
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = interests.includes(interest.id);
                    const isDisabled = !isSelected && interests.length >= MAX_INTERESTS;
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
                          {interest.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3: Travel Style */}
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
                  Travel Style
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TRAVEL_STYLE_OPTIONS.map((option) => {
                    const isSelected = travelStyle === option.value;
                    return (
                      <div
                        key={option.value}
                        onClick={() => setTravelStyle(option.value)}
                        className={`
                          cursor-pointer transition-all duration-200 border-2 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2
                          ${isSelected
                            ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] translate-x-[-2px] translate-y-[-2px]'
                            : 'bg-white text-gray-900 border-gray-200 hover:border-black hover:shadow-md'
                          }
                        `}
                      >
                        <h3 className="font-bold text-lg">{option.label}</h3>
                        <p className={`text-sm ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                          {option.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 4: Anything we should know? */}
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
                  Anything we should know? <span className="text-gray-500 font-normal text-sm ml-auto">Optional</span>
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="additionalNotes" className="text-sm font-bold text-black uppercase tracking-wide mb-3 block">
                    Tell us more about your preferences
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Share any specific preferences, dietary restrictions, accessibility needs, or special requests. For example: vegetarian restaurants, wheelchair accessible spots, photography locations, avoiding crowded places..."
                    className="min-h-[120px] border-2 border-gray-200 focus:border-black focus:ring-0 rounded-xl p-4 text-base resize-y"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500 font-medium">
                      This helps the AI create a more personalized itinerary for you
                    </p>
                    <span className="text-xs text-gray-400 font-mono">
                      {additionalNotes.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 5: Admin Settings */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
              <div className="bg-gray-50 border-b-2 border-black px-6 py-4">
                <h3 className="text-xl font-bold text-black flex items-center gap-3">
                  <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-mono text-lg border-2 border-black">5</div>
                  Admin Settings <span className="text-gray-500 font-normal text-sm ml-auto">Optional</span>
                </h3>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-black uppercase tracking-wide">제목 (선택사항)</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="비어있으면 자동 생성"
                      className="border-2 border-gray-200 focus:border-black focus:ring-0 rounded-lg h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-black uppercase tracking-wide">평점</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(parseFloat(e.target.value))}
                      className="border-2 border-gray-200 focus:border-black focus:ring-0 rounded-lg h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-black uppercase tracking-wide">설명 (선택사항)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="비어있으면 자동 생성"
                    className="min-h-[120px] border-2 border-gray-200 focus:border-black focus:ring-0 rounded-xl p-4 text-base resize-y"
                  />
                </div>

                <ImageUploadField
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="이미지 (선택사항)"
                  placeholder="비어있으면 기본 이미지 사용"
                  height="h-40"
                  deferUpload={true}
                  onFileSelect={setImageFile}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-2 border-black rounded-lg">
                    <div>
                      <Label className="font-bold uppercase text-sm">활성 상태</Label>
                      <p className="text-xs text-gray-600 mt-1">사용자에게 표시 여부</p>
                    </div>
                    <Switch checked={active} onCheckedChange={setActive} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 border-2 border-black rounded-lg">
                    <div>
                      <Label className="font-bold uppercase text-sm">Featured 추천</Label>
                      <p className="text-xs text-gray-600 mt-1">메인 페이지 강조</p>
                    </div>
                    <Switch checked={featured} onCheckedChange={setFeatured} />
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
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={handleGenerateAI}
              disabled={isGenerating || interests.length === 0 || !startDate}
              size="lg"
              className="h-14 px-[24px] bg-black hover:bg-gray-900 text-white text-lg font-bold rounded-full shadow-[0px_4px_15px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0px_6px_20px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:hover:scale-100 text-[16px] py-[0px] mx-[12px] my-[0px]"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                  Generating Your Perfect Korea Trip...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate My Korea Itinerary
                </>
              )}
            </Button>

            {interests.length === 0 && (
              <p className="text-sm text-red-600 font-medium mt-3 animate-pulse">
                * Please select at least one interest to continue
              </p>
            )}
            {interests.length > 0 && !startDate && (
              <p className="text-sm text-red-600 font-medium mt-3 animate-pulse">
                * Please select a start date to continue
              </p>
            )}

            {hasGenerated && (
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg inline-block">
                <p className="text-green-800 font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  일정이 성공적으로 생성되었습니다! "일정 편집" 탭에서 확인하세요.
                </p>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Edit Schedule Tab */}
        <TabsContent value="edit" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold uppercase tracking-tight">생성된 일정 편집</h3>
            <Button
              onClick={addDay}
              className="bg-black text-white rounded-none hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Day 추가
            </Button>
          </div>

          <div className="space-y-4">
            {days.map((day, dayIdx) => (
              <Card key={dayIdx} className="border-2 border-black shadow-none rounded-none">
                <CardHeader className="border-b-2 border-black bg-gray-50 py-4">
                  <div className="flex items-center gap-4">
                    <span className="font-black text-xl whitespace-nowrap shrink-0">Day {day.day}</span>
                    <Input
                      value={day.title}
                      onChange={(e) => updateDay(dayIdx, 'title', e.target.value)}
                      placeholder="Day title"
                      className="flex-1 border-2 border-black rounded-none focus-visible:ring-0 focus-visible:border-black"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDay(dayIdx)}
                      className="border-2 border-red-600 text-red-600 rounded-none hover:bg-red-600 hover:text-white shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, dayIdx)}
                  >
                    <SortableContext
                      items={day.activities.map((_, idx) => `activity-${dayIdx}-${idx}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {day.activities.map((activity, actIdx) => (
                        <SortableActivityCard
                          key={`activity-${dayIdx}-${actIdx}`}
                          id={`activity-${dayIdx}-${actIdx}`}
                          dayIdx={dayIdx}
                          actIdx={actIdx}
                          activity={activity}
                          aiSuggestionMode={aiSuggestionMode}
                          setAiSuggestionMode={setAiSuggestionMode}
                          setAiPrompt={setAiPrompt}
                          setAiSuggestions={setAiSuggestions}
                          updateActivity={updateActivity}
                          deleteActivity={deleteActivity}
                          aiPrompt={aiPrompt}
                          aiSuggestions={aiSuggestions}
                          isLoadingAI={isLoadingAI}
                          generateActivitySuggestions={generateActivitySuggestions}
                          cancelAISuggestion={cancelAISuggestion}
                          selectAISuggestion={selectAISuggestion}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  <Button
                    variant="outline"
                    onClick={() => addActivity(dayIdx)}
                    className="w-full border-2 border-dashed border-gray-400 rounded-none hover:border-black hover:bg-gray-100 h-11 font-bold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Activity 추가
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {days.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 font-medium mb-4">생성된 일정이 없습니다</p>
              <p className="text-sm text-gray-400">먼저 "기본 정보 & 생성" 탭에서 일정을 생성하세요</p>
            </div>
          )}
        </TabsContent>

        {/* Rich Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-black p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">📝 블록 기반 콘텐츠 에디터</h3>
                <p className="text-sm text-gray-700">
                  자유롭게 콘텐츠 블록을 추가하고 순서를 조정하세요. 텍스트, 이미지, 리스트 등 다양한 형식을 지원합니다.
                </p>
              </div>
              {contentBlocks.length === 0 && (
                <Button
                  onClick={loadSampleContentBlocks}
                  className="bg-purple-600 hover:bg-purple-700 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  샘플 데이터 로드
                </Button>
              )}
            </div>
          </div>

          {/* Add Block Buttons */}
          <div className="bg-white border-2 border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-bold uppercase">콘텐츠 블록 추가</Label>
              {contentBlocks.length > 0 && (
                <Button
                  onClick={() => {
                    if (confirm('현재 콘텐츠를 모두 삭제하고 샘플 데이터를 로드하시겠습니까?')) {
                      loadSampleContentBlocks();
                    }
                  }}
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-700 hover:bg-purple-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  샘플 데이터 다시 로드
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => addContentBlock('heading')}
                className="border-2 border-black bg-white text-black hover:bg-black hover:text-white rounded-none h-auto py-3 flex-col gap-2"
              >
                <Type className="h-5 w-5" />
                <span className="text-xs font-bold">제목</span>
              </Button>
              <Button
                onClick={() => addContentBlock('text')}
                className="border-2 border-black bg-white text-black hover:bg-black hover:text-white rounded-none h-auto py-3 flex-col gap-2"
              >
                <Type className="h-5 w-5" />
                <span className="text-xs font-bold">텍스트</span>
              </Button>
              <Button
                onClick={() => addContentBlock('image')}
                className="border-2 border-black bg-white text-black hover:bg-black hover:text-white rounded-none h-auto py-3 flex-col gap-2"
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs font-bold">이미지</span>
              </Button>
              <Button
                onClick={() => addContentBlock('list')}
                className="border-2 border-black bg-white text-black hover:bg-black hover:text-white rounded-none h-auto py-3 flex-col gap-2"
              >
                <List className="h-5 w-5" />
                <span className="text-xs font-bold">리스트</span>
              </Button>
              <Button
                onClick={() => addContentBlock('highlights')}
                className="border-2 border-yellow-400 bg-yellow-50 text-black hover:bg-yellow-400 rounded-none h-auto py-3 flex-col gap-2"
              >
                <Star className="h-5 w-5" />
                <span className="text-xs font-bold">하이라이트</span>
              </Button>
              <Button
                onClick={() => addContentBlock('tips')}
                className="border-2 border-blue-400 bg-blue-50 text-black hover:bg-blue-400 rounded-none h-auto py-3 flex-col gap-2"
              >
                <Lightbulb className="h-5 w-5" />
                <span className="text-xs font-bold">여행 팁</span>
              </Button>
              <Button
                onClick={() => addContentBlock('includes')}
                className="border-2 border-green-400 bg-green-50 text-black hover:bg-green-400 rounded-none h-auto py-3 flex-col gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-xs font-bold">포함사항</span>
              </Button>
              <Button
                onClick={() => addContentBlock('excludes')}
                className="border-2 border-red-400 bg-red-50 text-black hover:bg-red-400 rounded-none h-auto py-3 flex-col gap-2"
              >
                <XCircle className="h-5 w-5" />
                <span className="text-xs font-bold">불포함</span>
              </Button>
            </div>
          </div>

          {/* Content Blocks */}
          <div className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleContentBlockDragEnd}
            >
              <SortableContext
                items={contentBlocks.map(block => block.id)}
                strategy={verticalListSortingStrategy}
              >
                {contentBlocks.map((block, index) => (
                  <SortableContentBlock
                    key={block.id}
                    block={block}
                    index={index}
                    updateContentBlock={updateContentBlock}
                    deleteContentBlock={deleteContentBlock}
                    moveBlockUp={moveBlockUp}
                    moveBlockDown={moveBlockDown}
                    addItemToBlockList={addItemToBlockList}
                    removeItemFromBlockList={removeItemFromBlockList}
                    totalBlocks={contentBlocks.length}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {contentBlocks.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 bg-gray-50">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 font-bold mb-2">콘텐츠 블록이 없습니다</p>
                <p className="text-sm text-gray-400">위의 버튼을 눌러 첫 블록을 추가하세요</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="bg-gray-50 p-6 border-2 border-gray-300 rounded-lg">
            <p className="text-sm text-gray-600 mb-2 font-bold">🔍 고객 화면 미리보기</p>
            <p className="text-xs text-gray-500">실제 고객에게 보여질 화면입니다. 수정이 필요하면 다른 탭에서 편집하세요.</p>
          </div>

          {/* Customer View */}
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
            {/* Header Image */}
            <div className="w-full h-64 bg-gray-200 border-b-2 border-black overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <MapPin className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            <div className="p-8 space-y-8">
              {/* Title & Meta */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-black uppercase">{title || '제목 없음'}</h1>
                  {featured && (
                    <Badge className="bg-yellow-400 text-black border-2 border-black rounded-none">
                      FEATURED
                    </Badge>
                  )}
                  {active && (
                    <Badge className="bg-green-500 text-white border-2 border-black rounded-none">
                      ACTIVE
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-lg">{description || '설명이 없습니다'}</p>
                
                {/* Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="border-2 border-black p-3">
                    <CalendarIcon className="h-4 w-4 mb-2" />
                    <p className="text-xs text-gray-500 uppercase">기간</p>
                    <p className="font-bold">{duration} days</p>
                  </div>
                  <div className="border-2 border-black p-3">
                    <MapPin className="h-4 w-4 mb-2" />
                    <p className="text-xs text-gray-500 uppercase">도시</p>
                    <p className="font-bold">{cities.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="border-2 border-black p-3">
                    <DollarSign className="h-4 w-4 mb-2" />
                    <p className="text-xs text-gray-500 uppercase">예산</p>
                    <p className="font-bold uppercase">{TRAVEL_STYLE_TO_BUDGET_API[travelStyle] || 'mid-range'}</p>
                  </div>
                  <div className="border-2 border-black p-3">
                    <Star className="h-4 w-4 mb-2" />
                    <p className="text-xs text-gray-500 uppercase">평점</p>
                    <p className="font-bold">{rating.toFixed(1)} ⭐</p>
                  </div>
                </div>

                {/* Interests */}
                {interests.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <span
                        key={interest}
                        className="text-xs bg-black text-white px-3 py-1 font-bold uppercase"
                      >
                        #{interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rich Content Section */}
              {contentBlocks.length > 0 && (
                <div className="border-t-4 border-black pt-8">
                  <div className="mb-8">
                    <h3 className="text-3xl font-black uppercase mb-2 flex items-center gap-3">
                      <Sparkles className="h-8 w-8" />
                      Rich Content
                    </h3>
                    <p className="text-gray-600">여행에 대한 자세한 정보와 유용한 팁</p>
                  </div>
                  
                  <div className="space-y-6">
                    {contentBlocks.map((block, index) => (
                      <div key={block.id}>
                        {block.type === 'heading' && (
                          <div className="border-l-4 border-black pl-6 py-2">
                            <h2 className="text-2xl font-black uppercase">{block.content as string}</h2>
                          </div>
                        )}

                        {block.type === 'text' && (
                          <div className="border-l-4 border-gray-400 pl-6 py-2">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{block.content as string}</p>
                          </div>
                        )}

                        {block.type === 'image' && block.content && (
                          <div className="border-2 border-black overflow-hidden">
                            <img
                              src={block.content as string}
                              alt="Content image"
                              className="w-full h-96 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                              }}
                            />
                          </div>
                        )}

                        {block.type === 'list' && (Array.isArray(block.content) ? block.content : []).length > 0 && (
                          <div className="bg-gray-50 border-2 border-black p-6">
                            <ul className="space-y-2">
                              {(Array.isArray(block.content) ? block.content : []).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-800">
                                  <span className="font-bold">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'highlights' && (Array.isArray(block.content) ? block.content : []).length > 0 && (
                          <div className="bg-yellow-50 border-2 border-black p-6">
                            <h3 className="text-xl font-bold mb-4 uppercase flex items-center gap-2">
                              <Star className="h-5 w-5" />
                              주요 하이라이트
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(Array.isArray(block.content) ? block.content : []).map((highlight, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-yellow-600 font-bold">✓</span>
                                  <span className="text-gray-800">{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'tips' && (Array.isArray(block.content) ? block.content : []).length > 0 && (
                          <div className="bg-blue-50 border-2 border-black p-6">
                            <h3 className="text-xl font-bold mb-4 uppercase">💡 여행 팁</h3>
                            <ul className="space-y-2">
                              {(Array.isArray(block.content) ? block.content : []).map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-800">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'includes' && (Array.isArray(block.content) ? block.content : []).length > 0 && (
                          <div className="border-2 border-black bg-green-50 p-6">
                            <h3 className="text-lg font-bold mb-4 uppercase text-green-900">
                              ✓ 포함 사항
                            </h3>
                            <ul className="space-y-2">
                              {(Array.isArray(block.content) ? block.content : []).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'excludes' && (Array.isArray(block.content) ? block.content : []).length > 0 && (
                          <div className="border-2 border-black bg-red-50 p-6">
                            <h3 className="text-lg font-bold mb-4 uppercase text-red-900">
                              ✗ 불포함 사항
                            </h3>
                            <ul className="space-y-2">
                              {(Array.isArray(block.content) ? block.content : []).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-red-600 font-bold">✗</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary Days */}
              {days.length > 0 && (
                <div className="border-t-4 border-black pt-8">
                  <div className="mb-6">
                    <h3 className="text-3xl font-black uppercase mb-2 flex items-center gap-3">
                      <CalendarIcon className="h-8 w-8" />
                      여행 일정
                    </h3>
                    <p className="text-gray-600">일별 상세 일정과 활동</p>
                  </div>
                  <div className="space-y-6">
                    {days.map((day) => (
                      <div key={day.day} className="border-2 border-black bg-gray-50">
                        <div className="flex items-center gap-4 bg-black text-white p-4">
                          <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-black text-xl border-2 border-white">
                            {day.day}
                          </div>
                          <h4 className="text-xl font-bold">{day.title}</h4>
                        </div>
                        <div className="p-6 space-y-4">
                          {day.activities.map((activity, actIdx) => (
                            <div
                              key={actIdx}
                              className={`flex gap-4 p-4 border-2 ${
                                activity.isEvent
                                  ? 'border-yellow-400 bg-yellow-100'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    activity.isEvent
                                      ? 'bg-black text-white'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {actIdx + 1}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-bold bg-yellow-400 px-2 py-1 border border-black text-sm">
                                    {activity.time}
                                  </span>
                                  {activity.isEvent && (
                                    <Badge className="bg-black text-white border-2 border-black text-xs">
                                      EVENT
                                    </Badge>
                                  )}
                                </div>
                                <h5 className="font-bold text-lg mb-2">{activity.activity}</h5>
                                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>{activity.location}</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{activity.description}</p>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-gray-500" />
                                  <span className="font-bold text-sm">{activity.estimatedCost}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
            <p className="text-sm font-bold text-yellow-900">
              ⚠️ 이 화면은 실제 고객에게 보여지는 최종 결과물입니다. 수정이 필요하면 다른 탭에서 편집하세요.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
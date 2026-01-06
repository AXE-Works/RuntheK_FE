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
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
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
  Package
} from 'lucide-react';

interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost: string;
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
  interests: string[];
  imageUrl: string;
  rating: number;
  viewCount: number;
  bookingCount: number;
  active: boolean;
  featured: boolean;
  days: Day[];
  richContent?: RichContent;
  createdAt: string;
  updatedAt: string;
}

interface AdminItineraryEditorProps {
  itinerary: RecommendedItinerary | null;
  onSave: (itinerary: RecommendedItinerary) => void;
  onCancel: () => void;
}

const KOREAN_CITIES = [
  'Seoul Gangnam',
  'Seoul Gangbuk',
  'Busan',
  'Jeju Island',
  'Gyeongju',
  'Incheon',
  'Daegu',
  'Suwon (Gyeonggi)',
  'Jeonju (Jeolla)',
  'Yeosu (Jeolla)'
];

const INTEREST_OPTIONS = [
  { id: 'culture', label: 'Culture & History', icon: '🏛️' },
  { id: 'food', label: 'Korean Food', icon: '🍜' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'nature', label: 'Nature & Hiking', icon: '🏔️' },
  { id: 'kculture', label: 'K-Pop & Entertainment', icon: '🎵' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
  { id: 'temples', label: 'Temples & Spirituality', icon: '⛩️' },
  { id: 'traditional', label: 'Traditional Arts', icon: '🎨' }
];

// AI 생성 Mock 함수
const generateAIItinerary = async (data: {
  title: string;
  duration: string;
  cities: string[];
  budget: string;
  interests: string[];
}): Promise<Day[]> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 2500));

  const numDays = parseInt(data.duration) || 5;
  const days: Day[] = [];

  // Mock activities based on interests
  const activityPool: { [key: string]: Activity[] } = {
    culture: [
      { time: '09:00 AM', activity: 'Visit Gyeongbokgung Palace', location: 'Jongno-gu, Seoul', description: 'Explore the largest royal palace', estimatedCost: '$3' },
      { time: '02:00 PM', activity: 'Bukchon Hanok Village', location: 'Jongno-gu, Seoul', description: 'Traditional Korean houses', estimatedCost: 'Free' }
    ],
    food: [
      { time: '12:00 PM', activity: 'Korean BBQ Lunch', location: 'Gangnam, Seoul', description: 'Authentic Korean barbecue experience', estimatedCost: '$20-30' },
      { time: '06:00 PM', activity: 'Gwangjang Market Food Tour', location: 'Jongno-gu, Seoul', description: 'Traditional Korean street food', estimatedCost: '$15-25' }
    ],
    nature: [
      { time: '10:00 AM', activity: 'Namsan Mountain Hike', location: 'Jung-gu, Seoul', description: 'Scenic hike with city views', estimatedCost: 'Free' },
      { time: '03:00 PM', activity: 'Han River Park', location: 'Various locations, Seoul', description: 'Riverside relaxation and activities', estimatedCost: 'Free' }
    ],
    shopping: [
      { time: '02:00 PM', activity: 'Myeongdong Shopping', location: 'Jung-gu, Seoul', description: 'K-beauty and fashion shopping', estimatedCost: '$50-100' },
      { time: '04:00 PM', activity: 'Gangnam Underground Shopping', location: 'Gangnam, Seoul', description: 'Trendy fashion and accessories', estimatedCost: '$30-80' }
    ],
    nightlife: [
      { time: '08:00 PM', activity: 'Hongdae Night Scene', location: 'Mapo-gu, Seoul', description: 'Live music and club culture', estimatedCost: '$20-40' },
      { time: '09:00 PM', activity: 'Itaewon Night Tour', location: 'Yongsan-gu, Seoul', description: 'International dining and bars', estimatedCost: '$30-50' }
    ],
    kculture: [
      { time: '11:00 AM', activity: 'K-pop Dance Class', location: 'Gangnam, Seoul', description: 'Learn K-pop choreography', estimatedCost: '$25' },
      { time: '03:00 PM', activity: 'K-Drama Filming Locations', location: 'Various, Seoul', description: 'Visit famous drama scenes', estimatedCost: '$15' }
    ]
  };

  for (let i = 0; i < numDays; i++) {
    const dayActivities: Activity[] = [];
    
    // Add 3-4 activities per day based on selected interests
    const selectedInterests = data.interests.length > 0 ? data.interests : ['culture', 'food'];
    const numActivities = 3 + Math.floor(Math.random() * 2);
    
    for (let j = 0; j < numActivities; j++) {
      const interest = selectedInterests[j % selectedInterests.length];
      const pool = activityPool[interest] || activityPool['culture'];
      const activity = pool[Math.floor(Math.random() * pool.length)];
      dayActivities.push({ ...activity });
    }

    days.push({
      day: i + 1,
      title: `Day ${i + 1} - ${data.cities[i % data.cities.length] || 'Seoul'}`,
      activities: dayActivities
    });
  }

  return days;
};

export function AdminItineraryEditor({ itinerary, onSave, onCancel }: AdminItineraryEditorProps) {
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Basic Info State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('5');
  const [startDate, setStartDate] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [budget, setBudget] = useState('mid');
  const [interests, setInterests] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [rating, setRating] = useState(4.5);
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  
  // Schedule State
  const [days, setDays] = useState<Day[]>([]);
  
  // AI Suggestion State
  const [aiSuggestionMode, setAiSuggestionMode] = useState<{ dayIdx: number; actIdx: number } | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Activity[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
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
      setDuration(itinerary.duration.split(' ')[0]); // Extract number from "5 days"
      setStartDate(itinerary.createdAt.split('T')[0]);
      setCities(itinerary.cities);
      setBudget(itinerary.budget);
      setInterests(itinerary.interests);
      setImageUrl(itinerary.imageUrl);
      setRating(itinerary.rating);
      setActive(itinerary.active);
      setFeatured(itinerary.featured);
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

  const handleGenerateAI = async () => {
    if (cities.length === 0) {
      alert('도시를 최소 1개 선택해주세요!');
      return;
    }
    if (interests.length === 0) {
      alert('관심사를 최소 1개 선택해주세요!');
      return;
    }

    setIsGenerating(true);
    
    try {
      const generatedDays = await generateAIItinerary({
        title,
        duration,
        cities,
        budget,
        interests
      });
      
      setDays(generatedDays);
      
      // Auto-fill some fields if empty
      if (!title) {
        setTitle(`${duration} Days ${cities[0]} Adventure`);
      }
      if (!description) {
        setDescription(`Explore the best of ${cities.join(', ')} with this carefully curated ${duration}-day itinerary.`);
      }
      if (!imageUrl) {
        setImageUrl('https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800');
      }
      
      setHasGenerated(true);
      setActiveTab('edit');
    } catch (error) {
      alert('일정 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!hasGenerated || days.length === 0) {
      alert('먼저 일정을 생성해주세요!');
      return;
    }

    const savedItinerary: RecommendedItinerary = {
      id: itinerary?.id || '',
      title,
      description,
      duration: `${duration} days`,
      cities,
      budget,
      interests,
      imageUrl,
      rating,
      viewCount: itinerary?.viewCount || 0,
      bookingCount: itinerary?.bookingCount || 0,
      active,
      featured,
      days,
      richContent: {
        ...richContent,
        contentBlocks
      },
      createdAt: itinerary?.createdAt || '',
      updatedAt: itinerary?.updatedAt || ''
    };
    onSave(savedItinerary);
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
  const generateActivitySuggestions = async (prompt: string, currentActivity: Activity) => {
    if (!prompt.trim()) {
      alert('프롬프트를 입력해주세요!');
      return;
    }

    setIsLoadingAI(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI suggestions based on prompt
      const suggestions: Activity[] = [];
      const keywords = prompt.toLowerCase();

      // Generate 3 different suggestions
      if (keywords.includes('cafe') || keywords.includes('카페') || keywords.includes('coffee')) {
        suggestions.push(
          {
            time: currentActivity.time,
            activity: 'Artisan Cafe in Samcheong-dong',
            location: 'Samcheong-dong, Seoul',
            description: 'Enjoy specialty coffee in a traditional hanok cafe with beautiful garden views',
            estimatedCost: '$8-15',
            isEvent: false
          },
          {
            time: currentActivity.time,
            activity: 'Cafe Onion Anguk',
            location: 'Anguk, Seoul',
            description: 'Trendy industrial-style cafe in a renovated factory building',
            estimatedCost: '$10-18',
            isEvent: false
          },
          {
            time: currentActivity.time,
            activity: 'Cafe Layered Gangnam',
            location: 'Gangnam, Seoul',
            description: 'Multi-story themed cafe with unique desserts and photo zones',
            estimatedCost: '$12-20',
            isEvent: false
          }
        );
      } else if (keywords.includes('restaurant') || keywords.includes('food') || keywords.includes('음식') || keywords.includes('식당')) {
        suggestions.push(
          {
            time: currentActivity.time,
            activity: 'Tosokchon Samgyetang',
            location: 'Gyeongbokgung, Seoul',
            description: 'Famous ginseng chicken soup restaurant near the palace',
            estimatedCost: '$15-25',
            isEvent: false
          },
          {
            time: currentActivity.time,
            activity: 'Gwangjang Market Food Tour',
            location: 'Jongno, Seoul',
            description: 'Traditional market with authentic Korean street food',
            estimatedCost: '$10-20',
            isEvent: false
          },
          {
            time: currentActivity.time,
            activity: 'Jungsik',
            location: 'Gangnam, Seoul',
            description: 'Michelin 2-star modern Korean fine dining',
            estimatedCost: '$80-150',
            isEvent: false
          }
        );
      } else if (keywords.includes('museum') || keywords.includes('박물관') || keywords.includes('gallery')) {
        suggestions.push(
          {
            time: currentActivity.time,
            activity: 'National Museum of Korea',
            location: 'Yongsan, Seoul',
            description: 'Largest museum in Korea showcasing Korean history and culture',
            estimatedCost: 'Free',
            isEvent: false
          },
          {
            time: currentActivity.time,
            activity: 'Leeum Samsung Museum',
            location: 'Itaewon, Seoul',
            description: 'Contemporary art museum with traditional and modern collections',
            estimatedCost: '$10',
            isEvent: false
          },
          {
            time: currentActivity.time,
            activity: 'teamLab Borderless Seoul',
            location: 'Seongsu, Seoul',
            description: 'Immersive digital art experience with interactive exhibits',
            estimatedCost: '$25-30',
            isEvent: false
          }
        );
      } else {
        // Generic suggestions based on interests
        suggestions.push(
          {
            time: currentActivity.time,
            activity: 'Bukchon Hanok Village',
            location: 'Jongno-gu, Seoul',
            description: 'Traditional Korean houses with cultural experience',
            estimatedCost: 'Free',
            isEvent: false
          },
          {
            time: currentActivity.time,
            activity: 'N Seoul Tower Observatory',
            location: 'Namsan, Seoul',
            description: 'Iconic tower with panoramic city views',
            estimatedCost: '$10-15',
            isEvent: false
          },
          {
            time: currentActivity.time,
            activity: 'Han River Bike Tour',
            location: 'Han River Park, Seoul',
            description: 'Scenic cycling along the Han River with bike rental',
            estimatedCost: '$5-10',
            isEvent: false
          }
        );
      }

      setAiSuggestions(suggestions);
    } catch (error) {
      alert('AI 추천 생성 중 오류가 발생했습니다.');
      setAiSuggestions([]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const selectAISuggestion = (dayIdx: number, actIdx: number, suggestion: Activity) => {
    updateActivity(dayIdx, actIdx, 'activity', suggestion.activity);
    updateActivity(dayIdx, actIdx, 'location', suggestion.location);
    updateActivity(dayIdx, actIdx, 'description', suggestion.description);
    updateActivity(dayIdx, actIdx, 'estimatedCost', suggestion.estimatedCost);
    
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

  const toggleCity = (city: string) => {
    setCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
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
          disabled={!hasGenerated}
          className="bg-black text-white rounded-none hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold h-12 px-8 disabled:opacity-50"
        >
          저장하기
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
                {/* Date & Duration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-black uppercase tracking-wide">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-12 border-2 border-gray-200 hover:border-black focus-visible:border-black focus-visible:ring-0 transition-all rounded-lg"
                    />
                    <p className="text-xs text-gray-500 font-medium">We'll suggest seasonal events based on this.</p>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-black uppercase tracking-wide">Duration</Label>
                    <select
                      value={`${duration} days`}
                      onChange={(e) => setDuration(e.target.value.split(' ')[0])}
                      className="w-full h-12 border-2 border-gray-200 hover:border-black focus:border-black transition-all rounded-lg px-3"
                    >
                      <option value="1 day">1 day</option>
                      <option value="2 days">2 days</option>
                      <option value="3 days">3 days</option>
                      <option value="5 days">5 days</option>
                      <option value="7 days">7 days</option>
                      <option value="10 days">10 days</option>
                    </select>
                  </div>
                </div>

                {/* Cities Selection */}
                <div className="space-y-4 pt-6 border-t-2 border-gray-100">
                  <Label className="text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Interested Cities
                  </Label>
                  
                  <div className="flex flex-wrap gap-3">
                    {KOREAN_CITIES.map((city) => {
                      const isSelected = cities.includes(city);
                      return (
                        <div
                          key={city}
                          onClick={() => toggleCity(city)}
                          className={`
                            cursor-pointer px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 border-2
                            ${isSelected 
                              ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(100,100,100,1)] translate-x-[-2px] translate-y-[-2px]' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black'
                            }
                          `}
                        >
                          {city}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {cities.length === 0 
                      ? "Select cities or leave empty for all recommendations." 
                      : `${cities.length} cities selected.`}
                  </p>
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
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = interests.includes(interest.id);
                    return (
                      <div
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`
                          cursor-pointer transition-all duration-200 border-2 rounded-xl p-2 flex flex-col items-center justify-center gap-2 h-20
                          ${isSelected
                            ? 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(100,100,100,1)] translate-x-[-2px] translate-y-[-2px]'
                            : 'bg-white text-gray-900 border-gray-200 hover:border-black hover:shadow-sm'
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
                  Budget Range
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'budget', label: 'Budget ($50-100/day)', description: 'Hostels, street food, public transport' },
                    { value: 'mid', label: 'Mid-range ($100-200/day)', description: 'Hotels, restaurants, some experiences' },
                    { value: 'luxury', label: 'Luxury ($200+/day)', description: 'Premium hotels, fine dining, private tours' }
                  ].map((option) => {
                    const isSelected = budget === option.value;
                    return (
                      <div
                        key={option.value}
                        onClick={() => setBudget(option.value)}
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

          {/* Step 4: Admin Settings */}
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

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-black uppercase tracking-wide">이미지 URL (선택사항)</Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="비어있으면 기본 이미지 사용"
                    className="border-2 border-gray-200 focus:border-black focus:ring-0 rounded-lg h-12"
                  />
                </div>

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
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button
              onClick={handleGenerateAI}
              disabled={isGenerating || interests.length === 0}
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
                <CardHeader className="border-b-2 border-black bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 flex items-center gap-4">
                      <span className="font-black text-xl">Day {day.day}</span>
                      <Input
                        value={day.title}
                        onChange={(e) => updateDay(dayIdx, 'title', e.target.value)}
                        placeholder="Day title"
                        className="border-2 border-black rounded-none focus-visible:ring-0 focus-visible:border-black"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDay(dayIdx)}
                      className="border-2 border-red-600 text-red-600 rounded-none hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {day.activities.map((activity, actIdx) => (
                    <div 
                      key={actIdx} 
                      className={`relative border-2 rounded-lg overflow-hidden ${
                        activity.isEvent 
                          ? 'border-yellow-400 bg-yellow-50' 
                          : 'border-black bg-white'
                      }`}
                    >
                      {/* Activity Number Badge */}
                      <div className="absolute -left-3 top-6 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-4 border-white z-10">
                        {actIdx + 1}
                      </div>

                      <div className="pl-16 pr-6 py-6 space-y-4">
                        {/* Time and Cost Row */}
                        <div className="flex items-start justify-between gap-3">
                          <Input
                            value={activity.time}
                            onChange={(e) => updateActivity(dayIdx, actIdx, 'time', e.target.value)}
                            placeholder="09:00 AM"
                            className="w-32 h-10 px-3 py-2 bg-yellow-400 border-2 border-black rounded font-bold text-sm focus:ring-0 focus:border-black"
                          />
                          {activity.isEvent && (
                            <Badge className="bg-black text-white border-2 border-black rounded px-3 py-1.5 text-xs font-bold">
                              EVENT
                            </Badge>
                          )}
                          <Input
                            value={activity.estimatedCost}
                            onChange={(e) => updateActivity(dayIdx, actIdx, 'estimatedCost', e.target.value)}
                            placeholder="$20-50"
                            className="w-28 h-10 px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded font-bold text-sm text-right focus:ring-0 focus:border-black"
                          />
                        </div>

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
                          rows={3}
                          className="text-sm text-gray-600 border-2 border-gray-200 rounded-lg p-3 resize-none focus:ring-0 focus:border-black"
                        />

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t-2 border-gray-100">
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
                            className="mt-4 pt-5 border-t-2 border-purple-200 space-y-4"
                          >
                            {/* Prompt Input */}
                            <div className="space-y-2">
                              <Label className="text-sm font-bold text-purple-900">AI에게 요청하기</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={aiPrompt}
                                  onChange={(e) => setAiPrompt(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !isLoadingAI) {
                                      generateActivitySuggestions(aiPrompt, activity);
                                    }
                                  }}
                                  placeholder="예: 카페 추천해줘, 박물관 찾아줘, 맛집 알려줘"
                                  className="flex-1 border-2 border-purple-300 focus:border-purple-500 focus:ring-0 rounded-lg h-11 px-4"
                                  disabled={isLoadingAI}
                                />
                                <Button
                                  onClick={() => generateActivitySuggestions(aiPrompt, activity)}
                                  disabled={isLoadingAI || !aiPrompt.trim()}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 h-11"
                                >
                                  {isLoadingAI ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      생성중...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-4 w-4 mr-2" />
                                      추천받기
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={cancelAISuggestion}
                                  className="border-2 border-gray-300 hover:bg-gray-100 h-11 px-4"
                                  disabled={isLoadingAI}
                                >
                                  취소
                                </Button>
                              </div>
                              <p className="text-xs text-purple-600">
                                💡 Tip: "카페", "식당", "박물관" 등 구체적으로 입력하면 더 정확한 추천을 받을 수 있어요
                              </p>
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
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => addActivity(dayIdx)}
                    className="w-full border-2 border-dashed border-gray-400 rounded-lg hover:border-black hover:bg-gray-50 h-12"
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
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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
            {contentBlocks.map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-black p-6 relative"
              >
                {/* Block Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3">
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
                      disabled={index === contentBlocks.length - 1}
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
                    <Input
                      value={block.content as string}
                      onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                      placeholder="이미지 URL을 입력하세요 (https://...)"
                      className="border-2 border-black rounded-none focus-visible:ring-0 focus-visible:border-black"
                    />
                    {block.content && (
                      <div className="border-2 border-gray-300 p-2 bg-gray-50">
                        <img
                          src={block.content as string}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-2">미리보기</p>
                      </div>
                    )}
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
                      {(block.content as string[]).map((item, idx) => (
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
                    {(block.content as string[]).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-300">
                        아직 항목이 없습니다. 위에서 항목을 추가하세요.
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}

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
                    <Calendar className="h-4 w-4 mb-2" />
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
                    <p className="font-bold uppercase">{budget}</p>
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

                        {block.type === 'list' && (block.content as string[]).length > 0 && (
                          <div className="bg-gray-50 border-2 border-black p-6">
                            <ul className="space-y-2">
                              {(block.content as string[]).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-800">
                                  <span className="font-bold">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'highlights' && (block.content as string[]).length > 0 && (
                          <div className="bg-yellow-50 border-2 border-black p-6">
                            <h3 className="text-xl font-bold mb-4 uppercase flex items-center gap-2">
                              <Star className="h-5 w-5" />
                              주요 하이라이트
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(block.content as string[]).map((highlight, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-yellow-600 font-bold">✓</span>
                                  <span className="text-gray-800">{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'tips' && (block.content as string[]).length > 0 && (
                          <div className="bg-blue-50 border-2 border-black p-6">
                            <h3 className="text-xl font-bold mb-4 uppercase">💡 여행 팁</h3>
                            <ul className="space-y-2">
                              {(block.content as string[]).map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-800">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'includes' && (block.content as string[]).length > 0 && (
                          <div className="border-2 border-black bg-green-50 p-6">
                            <h3 className="text-lg font-bold mb-4 uppercase text-green-900">
                              ✓ 포함 사항
                            </h3>
                            <ul className="space-y-2">
                              {(block.content as string[]).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'excludes' && (block.content as string[]).length > 0 && (
                          <div className="border-2 border-black bg-red-50 p-6">
                            <h3 className="text-lg font-bold mb-4 uppercase text-red-900">
                              ✗ 불포함 사항
                            </h3>
                            <ul className="space-y-2">
                              {(block.content as string[]).map((item, idx) => (
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
                      <Calendar className="h-8 w-8" />
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

      {/* Sticky Save Button */}
      <div className="sticky bottom-0 bg-white border-t-2 border-black py-4 flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-2 border-black rounded-none hover:bg-gray-100"
        >
          취소
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasGenerated}
          className="bg-black text-white rounded-none hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold px-8 disabled:opacity-50"
        >
          저장하기
        </Button>
      </div>
    </div>
  );
}
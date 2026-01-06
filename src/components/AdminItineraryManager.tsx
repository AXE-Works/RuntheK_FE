import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { AdminItineraryEditor } from './AdminItineraryEditor';
import { motion } from 'motion/react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';

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
    }[];
  }[];
  richContent?: {
    introduction: string;
    highlights: string[];
    tips: string[];
    includes: string[];
    excludes: string[];
    whatToBring: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface AdminItineraryManagerProps {
  currentUser?: any;
}

// Mock data
const mockRecommendedItineraries: RecommendedItinerary[] = [
  {
    id: 'rec-1',
    title: 'Seoul Highlights 5 Days',
    description: '서울의 필수 명소를 둘러보는 5일 코스입니다. 전통과 현대가 공존하는 서울의 매력을 느껴보세요.',
    duration: '5 days',
    cities: ['Seoul'],
    budget: 'mid',
    interests: ['culture', 'food', 'history'],
    imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800',
    rating: 4.8,
    viewCount: 1234,
    bookingCount: 89,
    active: true,
    featured: true,
    days: [
      {
        day: 1,
        title: 'Arrival & Traditional Seoul',
        activities: [
          {
            time: '09:00 AM',
            activity: 'Gyeongbokgung Palace',
            location: 'Jongno-gu, Seoul',
            description: 'Visit the largest royal palace',
            estimatedCost: '$3'
          },
          {
            time: '12:00 PM',
            activity: 'Traditional Korean Lunch',
            location: 'Insadong',
            description: 'Experience authentic Korean cuisine',
            estimatedCost: '$15-25'
          }
        ]
      }
    ],
    richContent: {
      introduction: 'Discover the heart of Korea in this comprehensive 5-day journey through Seoul.',
      highlights: ['Gyeongbokgung Palace', 'N Seoul Tower', 'Bukchon Hanok Village'],
      tips: ['Wear comfortable shoes', 'Book tickets in advance'],
      includes: ['Professional guide', 'Entrance fees', 'Some meals'],
      excludes: ['Flight tickets', 'Personal expenses'],
      whatToBring: ['Camera', 'Comfortable walking shoes', 'Weather-appropriate clothing'],
      contentBlocks: [
        {
          id: 'block-1',
          type: 'heading',
          content: 'Welcome to Seoul: The Heart of Korea'
        },
        {
          id: 'block-2',
          type: 'text',
          content: 'Seoul is a vibrant metropolis that seamlessly blends ancient traditions with cutting-edge modernity. From historic palaces to trendy shopping districts, from traditional markets to high-tech entertainment venues, Seoul offers an unforgettable experience for every traveler.\n\nThis itinerary will guide you through the must-see attractions while also revealing hidden gems that only locals know about.'
        },
        {
          id: 'block-3',
          type: 'image',
          content: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&h=600&fit=crop'
        },
        {
          id: 'block-4',
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
          id: 'block-5',
          type: 'tips',
          content: [
            'Download Kakao Metro app for easy subway navigation',
            'Get a T-money card at any convenience store',
            'Most restaurants close between 3-5 PM',
            'Tipping is not customary in Korea',
            'Learn basic phrases: "Annyeonghaseyo" (Hello)'
          ]
        },
        {
          id: 'block-6',
          type: 'includes',
          content: [
            'Professional English-speaking guide',
            'All entrance fees to palaces and museums',
            'Korean BBQ lunch experience',
            'Public transportation passes',
            'Welcome dinner at traditional restaurant'
          ]
        },
        {
          id: 'block-7',
          type: 'excludes',
          content: [
            'International flight tickets',
            'Travel insurance',
            'Personal expenses and shopping',
            'Optional activities and tours'
          ]
        }
      ]
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: 'rec-2',
    title: 'Busan Coastal Adventure 4 Days',
    description: '부산의 아름다운 해변과 해산물 요리를 즐기는 4일 여행 코스입니다.',
    duration: '4 days',
    cities: ['Busan'],
    budget: 'budget',
    interests: ['nature', 'food', 'beaches'],
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    rating: 4.6,
    viewCount: 856,
    bookingCount: 67,
    active: true,
    featured: false,
    days: [
      {
        day: 1,
        title: 'Haeundae Beach & Seafood',
        activities: [
          {
            time: '10:00 AM',
            activity: 'Haeundae Beach',
            location: 'Haeundae-gu, Busan',
            description: 'Relax at Korea\'s most famous beach',
            estimatedCost: 'Free'
          }
        ]
      }
    ],
    richContent: {
      introduction: 'Experience the vibrant coastal city of Busan.',
      highlights: ['Haeundae Beach', 'Gamcheon Culture Village', 'Jagalchi Fish Market'],
      tips: ['Try fresh seafood', 'Visit early morning for best views'],
      includes: ['Hotel accommodation', 'Breakfast', 'City tour'],
      excludes: ['Lunch and dinner', 'Personal shopping'],
      whatToBring: ['Sunscreen', 'Swimsuit', 'Light jacket'],
      contentBlocks: [
        {
          id: 'busan-1',
          type: 'heading',
          content: 'Busan: Korea\'s Coastal Gem'
        },
        {
          id: 'busan-2',
          type: 'text',
          content: 'Busan is South Korea\'s second-largest city and a paradise for beach lovers and seafood enthusiasts. Known for its stunning beaches, vibrant markets, and colorful hillside villages, Busan offers a perfect blend of urban excitement and natural beauty.\n\nThis 4-day adventure will take you through the best of Busan\'s coastal attractions and cultural landmarks.'
        },
        {
          id: 'busan-3',
          type: 'image',
          content: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=600&fit=crop'
        },
        {
          id: 'busan-4',
          type: 'highlights',
          content: [
            'Relax at Haeundae Beach, Korea\'s most famous beach',
            'Explore the colorful Gamcheon Culture Village',
            'Visit Jagalchi Fish Market for fresh seafood',
            'Walk along Gwangalli Beach at sunset',
            'Hike to Haedong Yonggungsa Temple by the sea',
            'Experience traditional spa culture at a jjimjilbang'
          ]
        },
        {
          id: 'busan-5',
          type: 'list',
          content: [
            'Budget-friendly accommodation near Haeundae Beach',
            'Easy public transportation with detailed directions',
            'Mix of famous attractions and local hidden spots',
            'Flexible itinerary with options for all weather conditions',
            'Perfect for solo travelers, couples, and families'
          ]
        },
        {
          id: 'busan-6',
          type: 'tips',
          content: [
            'Bring sunscreen and beach gear for Haeundae',
            'Try raw fish (hoe) at Jagalchi Market',
            'Best time to visit is spring or fall for pleasant weather',
            'Download Busan Metro app for easy navigation',
            'Many beach cafes offer beautiful ocean views'
          ]
        },
        {
          id: 'busan-7',
          type: 'includes',
          content: [
            'Daily breakfast at hotel',
            'Busan city pass for public transportation',
            'Entry to Haedong Yonggungsa Temple',
            'Gamcheon Culture Village walking tour',
            'Beach equipment rental vouchers'
          ]
        },
        {
          id: 'busan-8',
          type: 'excludes',
          content: [
            'Lunch and dinner meals',
            'Private transportation or taxis',
            'Water sports activities',
            'Spa and jjimjilbang entrance fees',
            'Souvenirs and personal shopping'
          ]
        }
      ]
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  }
];

export function AdminItineraryManager({ currentUser }: AdminItineraryManagerProps) {
  const [itineraries, setItineraries] = useState<RecommendedItinerary[]>(mockRecommendedItineraries);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<RecommendedItinerary | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expandedItineraries, setExpandedItineraries] = useState<Set<string>>(new Set());

  const filteredItineraries = itineraries.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cities.some(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = () => {
    setEditingItinerary(null);
    setShowEditor(true);
  };

  const handleEdit = (itinerary: RecommendedItinerary) => {
    setEditingItinerary(itinerary);
    setShowEditor(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 추천 여행 일정을 삭제하시겠습니까?')) {
      setItineraries(itineraries.filter(item => item.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setItineraries(itineraries.map(item =>
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  const handleToggleFeatured = (id: string) => {
    setItineraries(itineraries.map(item =>
      item.id === id ? { ...item, featured: !item.featured } : item
    ));
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItineraries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItineraries(newExpanded);
  };

  const handleSave = (itinerary: RecommendedItinerary) => {
    if (editingItinerary) {
      // Update existing
      setItineraries(itineraries.map(item =>
        item.id === editingItinerary.id ? { ...itinerary, updatedAt: new Date().toISOString().split('T')[0] } : item
      ));
    } else {
      // Create new
      const newItinerary = {
        ...itinerary,
        id: `rec-${Date.now()}`,
        viewCount: 0,
        bookingCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setItineraries([newItinerary, ...itineraries]);
    }
    setShowEditor(false);
    setEditingItinerary(null);
  };

  if (showEditor) {
    return (
      <AdminItineraryEditor
        itinerary={editingItinerary}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingItinerary(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black pb-6">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">추천 여행 일정 관리</h2>
          <p className="text-sm text-gray-600 mt-1">사용자에게 추천할 여행 일정을 생성하고 관리합니다</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-black text-white rounded-none hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold h-12"
        >
          <Plus className="h-4 w-4 mr-2" />
          새 추천 일정 만들기
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '총 추천 일정', value: itineraries.length, icon: MapPin },
          { label: '활성 일정', value: itineraries.filter(i => i.active).length, icon: Star },
          { label: '총 조회수', value: itineraries.reduce((sum, i) => sum + i.viewCount, 0).toLocaleString(), icon: Eye },
          { label: '총 예약수', value: itineraries.reduce((sum, i) => sum + i.bookingCount, 0).toLocaleString(), icon: TrendingUp }
        ].map((stat) => (
          <Card key={stat.label} className="border-2 border-black shadow-none rounded-none hover:bg-black hover:text-white transition-colors group">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="제목, 도시, 설명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-2 border-black rounded-none h-12 focus-visible:ring-0 focus-visible:border-black"
        />
      </div>

      {/* Itineraries Grid - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItineraries.map((itinerary, index) => (
          <motion.div
            key={itinerary.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="border-2 border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group h-full flex flex-col">
              {/* Image */}
              <div className="w-full h-40 bg-gray-200 border-b-2 border-black overflow-hidden relative">
                <img
                  src={itinerary.imageUrl}
                  alt={itinerary.title}
                  className="w-full h-full object-cover"
                />
                {/* Badges overlay */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {itinerary.featured && (
                    <Badge className="bg-yellow-400 text-black border border-black text-xs px-1.5 py-0.5">
                      FEATURED
                    </Badge>
                  )}
                  <Badge
                    className={`border border-black text-xs px-1.5 py-0.5 ${
                      itinerary.active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {itinerary.active ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-bold mb-1 line-clamp-1">{itinerary.title}</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>

                {/* Meta info - compact 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{itinerary.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="font-medium truncate">{itinerary.cities[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="font-medium">{itinerary.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{itinerary.viewCount}</span>
                  </div>
                </div>

                {/* Interest tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {itinerary.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="text-[10px] bg-gray-100 px-1.5 py-0.5 font-medium text-gray-500 uppercase"
                    >
                      #{interest}
                    </span>
                  ))}
                </div>

                {/* Actions - compact horizontal */}
                <div className="mt-auto pt-3 border-t border-gray-200 flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(itinerary)}
                    className="flex-1 h-8 border border-black rounded-none hover:bg-black hover:text-white text-xs font-bold"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleFeatured(itinerary.id)}
                    className={`h-8 w-8 p-0 border border-black rounded-none ${
                      itinerary.featured ? 'bg-yellow-400' : 'bg-white hover:bg-yellow-100'
                    }`}
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpanded(itinerary.id)}
                    className="h-8 w-8 p-0 border border-gray-300 rounded-none hover:bg-gray-100"
                  >
                    {expandedItineraries.has(itinerary.id) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(itinerary.id)}
                    className="h-8 w-8 p-0 border border-red-400 text-red-600 rounded-none hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <Label className="text-xs text-gray-500">활성화</Label>
                  <Switch
                    checked={itinerary.active}
                    onCheckedChange={() => handleToggleActive(itinerary.id)}
                  />
                </div>
              </div>

              {/* Expanded Schedule - Full width below card */}
              {expandedItineraries.has(itinerary.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t-2 border-black bg-gray-50 p-3 space-y-2"
                >
                  {itinerary.days.map((day) => (
                    <div key={day.day} className="border border-black bg-white p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs">
                          {day.day}
                        </div>
                        <h4 className="font-bold text-xs">{day.title}</h4>
                      </div>
                      <div className="space-y-1">
                        {day.activities.slice(0, 2).map((activity, actIdx) => (
                          <div
                            key={actIdx}
                            className="flex items-center gap-2 text-xs text-gray-600"
                          >
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{activity.time}</span>
                            <span className="truncate">{activity.activity}</span>
                          </div>
                        ))}
                        {day.activities.length > 2 && (
                          <p className="text-xs text-gray-400">+{day.activities.length - 2} more activities</p>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItineraries.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
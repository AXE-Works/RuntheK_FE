import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ItineraryDetailModal } from './ItineraryDetailModal';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventForm } from './EventForm';
import logo from 'figma:asset/2837fdead800498e4b0136649e9bfa4bce6e67ea.png';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Clock,
  Star,
  Search,
  Settings,
  BarChart as BarChartIcon,
  Target,
  Sliders,
  Globe,
  Cake,
  UserCheck,
  TrendingDown,
  Grid3x3,
  LayoutList,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  User,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

// Mock data
const mockStats = {
  totalUsers: 5234,
  dailySignups: 45,
  activeUsers: 1234,
  itinerariesCreated: 8765,
  eventClickRate: 12.5
};

// User demographics data
const mockUserDemographics = {
  countries: [
    { name: '미국', count: 1456, percentage: 27.8 },
    { name: '일본', count: 892, percentage: 17.1 },
    { name: '중국', count: 743, percentage: 14.2 },
    { name: '영국', count: 521, percentage: 10.0 },
    { name: '독일', count: 398, percentage: 7.6 },
    { name: '기타', count: 1224, percentage: 23.3 }
  ],
  ageGroups: [
    { name: '18-25', count: 1573, percentage: 30.1 },
    { name: '26-35', count: 1884, percentage: 36.0 },
    { name: '36-45', count: 1047, percentage: 20.0 },
    { name: '46-55', count: 521, percentage: 10.0 },
    { name: '55+', count: 209, percentage: 4.0 }
  ],
  gender: [
    { name: '여성', count: 2930, percentage: 56.0 },
    { name: '남성', count: 2146, percentage: 41.0 },
    { name: '기타', count: 158, percentage: 3.0 }
  ]
};

const mockAPIStatus = [
  { name: 'OpenAI GPT-4', status: 'active' },
  { name: 'Google Maps', status: 'active' },
  { name: '한국관광공사', status: 'active' },
  { name: '데이터베이스', status: 'active' }
];

// Mock users data
const mockUsers = [
  {
    id: 1,
    email: 'john@email.com',
    name: 'John Smith',
    country: '미국',
    signupDate: '2024-03-15',
    lastLogin: '2024-10-28',
    status: '활성',
    tripCount: 3,
    totalSpent: '$3,500',
    interests: ['culture', 'food']
  },
  {
    id: 2,
    email: 'sarah@email.com',
    name: 'Sarah Kim',
    country: '싱가포르',
    signupDate: '2024-03-14',
    lastLogin: '2024-10-29',
    status: '활성',
    tripCount: 2,
    totalSpent: '$2,800',
    interests: ['kculture', 'shopping']
  },
  {
    id: 3,
    email: 'mike@email.com',
    name: 'Mike Johnson',
    country: '캐나다',
    signupDate: '2024-03-13',
    lastLogin: '2024-10-27',
    status: '활성',
    tripCount: 1,
    totalSpent: '$1,200',
    interests: ['nature', 'adventure']
  },
  {
    id: 4,
    email: 'emma.wilson@email.com',
    name: 'Emma Wilson',
    country: '영국',
    signupDate: '2024-03-12',
    lastLogin: '2024-10-30',
    status: '활성',
    tripCount: 4,
    totalSpent: '$5,200',
    interests: ['culture', 'history', 'food']
  },
  {
    id: 5,
    email: 'carlos.r@email.com',
    name: 'Carlos Rodriguez',
    country: '스페인',
    signupDate: '2024-03-11',
    lastLogin: '2024-10-26',
    status: '활성',
    tripCount: 2,
    totalSpent: '$3,100',
    interests: ['nightlife', 'food']
  },
  {
    id: 6,
    email: 'akiko.t@email.com',
    name: 'Akiko Tanaka',
    country: '일본',
    signupDate: '2024-03-10',
    lastLogin: '2024-10-25',
    status: '활성',
    tripCount: 5,
    totalSpent: '$4,800',
    interests: ['nature', 'wellness']
  }
];

// Mock popular activities
const mockPopularActivities = [
  {
    activity: 'Korean BBQ Experience',
    location: 'Gangnam-gu, Seoul',
    totalRatings: 2847,
    averageRating: 4.9,
    likesCount: 2654,
    dislikesCount: 193,
    likePercentage: 93.2,
    category: 'Food',
    priceRange: '$25-40',
    timesRecommended: 1243,
    trend: '+15%'
  },
  {
    activity: 'Visit Gyeongbokgung Palace',
    location: 'Jongno-gu, Seoul',
    totalRatings: 3124,
    averageRating: 4.8,
    likesCount: 2987,
    dislikesCount: 137,
    likePercentage: 95.6,
    category: 'Culture',
    priceRange: '$10-15',
    timesRecommended: 1567,
    trend: '+8%'
  },
  {
    activity: 'Gwangjang Market Food Tour',
    location: 'Jongno-gu, Seoul',
    totalRatings: 1892,
    averageRating: 4.7,
    likesCount: 1743,
    dislikesCount: 149,
    likePercentage: 92.1,
    category: 'Food',
    priceRange: '$15-25',
    timesRecommended: 987,
    trend: '+22%'
  }
];

const getPopularActivitiesFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem('activityRatings');
    if (!stored) return mockPopularActivities;
    
    const ratings = JSON.parse(stored);
    const activityMap = new Map();
    
    ratings.forEach((rating: any) => {
      const key = `${rating.activity}-${rating.location}`;
      if (!activityMap.has(key)) {
        activityMap.set(key, {
          activity: rating.activity,
          location: rating.location,
          ratings: [],
          likes: 0,
          dislikes: 0
        });
      }
      
      const entry = activityMap.get(key);
      if (rating.rating > 0) entry.ratings.push(rating.rating);
      if (rating.liked === true) entry.likes++;
      if (rating.liked === false) entry.dislikes++;
    });
    
    const aggregated = Array.from(activityMap.values()).map(entry => ({
      activity: entry.activity,
      location: entry.location,
      totalRatings: entry.ratings.length,
      averageRating: entry.ratings.length > 0 ? (entry.ratings.reduce((a, b) => a + b, 0) / entry.ratings.length) : 0,
      likesCount: entry.likes,
      dislikesCount: entry.dislikes,
      likePercentage: entry.likes + entry.dislikes > 0 ? ((entry.likes / (entry.likes + entry.dislikes)) * 100) : 0,
      category: 'User Generated',
      priceRange: 'Various',
      timesRecommended: entry.ratings.length,
      trend: '+New'
    })).sort((a, b) => b.likesCount - a.likesCount);
    
    return [...aggregated, ...mockPopularActivities].sort((a, b) => b.likesCount - a.likesCount);
  } catch {
    return mockPopularActivities;
  }
};

interface AdminDashboardProps {
  currentUser?: any;
  events: any[];
  setEvents: (events: any[]) => void;
}

export function AdminDashboard({ currentUser, events, setEvents }: AdminDashboardProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [showItineraryDetail, setShowItineraryDetail] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<any>(null);
  const [showAddTripForm, setShowAddTripForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  
  // User management states
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Trip search state
  const [tripSearchTerm, setTripSearchTerm] = useState('');
  
  // Event management states
  const [eventSortBy, setEventSortBy] = useState('latest');
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const eventsPerPage = 10;

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: '시즌 이벤트',
    location: '',
    targetAudience: '',
    startDate: '',
    endDate: '',
    budget: 0,
    expectedParticipants: 0,
    conditions: '',
    description: '',
    organizer: '',
    contactEmail: '',
    website: '',
    requirements: '',
    ageRestriction: '',
    weatherDependency: '',
    active: true,
    frequency: 50,
    relevance: 50,
    imageUrl: ''
  });

  const [newTrip, setNewTrip] = useState({
    userName: '',
    userEmail: '',
    userCountry: '',
    title: '',
    duration: '',
    interests: [] as string[],
    budget: '',
    totalCost: '',
    rating: 0,
    feedback: '',
    status: '확정됨'
  });

  // Add sample trips initially
  const addSampleTripsInitial = () => {
    const sampleTrips = [
      {
        id: Date.now() + 1,
        userId: 101,
        userName: 'Emma Wilson',
        userEmail: 'emma.wilson@email.com',
        userCountry: '영국',
        title: '7 Days Seoul Cultural Experience',
        duration: '7 days',
        interests: ['culture', 'history', 'food'],
        budget: 'mid-range',
        cities: ['Seoul'],
        createdAt: '2024-03-20',
        status: '완료',
        totalCost: '$1,400-2,000',
        rating: 4.9,
        feedback: '한국의 전통 문화를 깊이 체험할 수 있어서 정말 만족했습니다.',
        confirmed: true,
        itineraryData: { days: [] }
      },
      {
        id: Date.now() + 2,
        userId: 102,
        userName: 'Sarah Kim',
        userEmail: 'sarah@email.com',
        userCountry: '싱가포르',
        title: '5 Days K-Pop & Shopping Tour',
        duration: '5 days',
        interests: ['kculture', 'shopping', 'nightlife'],
        budget: 'luxury',
        cities: ['Seoul'],
        createdAt: '2024-03-18',
        status: '확정됨',
        totalCost: '$2,000-3,000',
        rating: 4.5,
        feedback: 'Great tour!',
        confirmed: true,
        itineraryData: { days: [] }
      }
    ];
    localStorage.setItem('confirmedTrips', JSON.stringify(sampleTrips));
  };

  const getConfirmedTrips = () => {
    try {
      const confirmed = localStorage.getItem('confirmedTrips');
      const trips = confirmed ? JSON.parse(confirmed) : [];
      if (trips.length === 0) {
        const hasAddedSamples = localStorage.getItem('hasAddedSampleTrips');
        if (!hasAddedSamples) {
          addSampleTripsInitial();
          localStorage.setItem('hasAddedSampleTrips', 'true');
          const newConfirmed = localStorage.getItem('confirmedTrips');
          return newConfirmed ? JSON.parse(newConfirmed) : [];
        }
      }
      return trips;
    } catch {
      return [];
    }
  };

  // Calculate Event Statistics
  const paginatedEvents = events.slice(
    (eventCurrentPage - 1) * eventsPerPage,
    eventCurrentPage * eventsPerPage
  );
  const totalEventPages = Math.ceil(events.length / eventsPerPage);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event = {
      ...newEvent,
      id: events.length + 1,
      impressions: 0,
      clicks: 0,
      priority: '중간',
    };
    setEvents([event, ...events]);
    setShowEventForm(false);
    setNewEvent({
      title: '', type: '시즌 이벤트', location: '', targetAudience: '', startDate: '', endDate: '',
      budget: 0, expectedParticipants: 0, conditions: '', description: '', organizer: '',
      contactEmail: '', website: '', requirements: '', ageRestriction: '', weatherDependency: '',
      active: true, frequency: 50, relevance: 50, imageUrl: ''
    });
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowEventForm(true);
  };

  const handleViewItinerary = (itinerary: any) => {
    setSelectedItinerary(itinerary);
    setShowItineraryDetail(true);
  };

  const clearAllTrips = () => {
    if (window.confirm('정말 모든 여행 일정을 삭제하시겠습니까?')) {
      localStorage.removeItem('confirmedTrips');
      window.location.reload();
    }
  };

  const handleAddTrip = () => {
    const trips = getConfirmedTrips();
    const trip = { ...newTrip, id: Date.now(), createdAt: new Date().toISOString().split('T')[0], confirmed: true };
    localStorage.setItem('confirmedTrips', JSON.stringify([trip, ...trips]));
    setShowAddTripForm(false);
    setNewTrip({
      userName: '', userEmail: '', userCountry: '', title: '', duration: '',
      interests: [], budget: '', totalCost: '', rating: 0, feedback: '', status: '확정됨'
    });
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleViewUserDetail = (user: any) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleToggleUserStatus = (userId: number) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === '활성' ? '비활성' : '활성' } : u
    ));
  };

  const getUserTrips = (email: string) => {
    const trips = getConfirmedTrips();
    return trips.filter((t: any) => t.userEmail === email || t.userName === selectedUser?.name); // Fallback to name matching if email not found
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-6 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-[8px] p-[0px] mt-[0px] mr-[0px] ml-[10px]">관리자 대시보드</h1>
            <p className="text-gray-500 font-medium p-[0px] mt-[0px] mr-[0px] mb-[0px] ml-[10px]">RuntheK 통합 관리 시스템</p>
          </div>
          <div className="flex gap-4">
             <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-[4px] mt-[0px] mr-[10px] ml-[0px]">시스템 상태</p>
                <div className="flex items-center gap-2 mx-[10px] my-[0px]">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-sm">정상 가동 중</span>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
      >
        {[
          { key: 'totalUsers', label: '총 사용자', value: mockStats.totalUsers },
          { key: 'dailySignups', label: '일일 가입', value: mockStats.dailySignups },
          { key: 'itinerariesCreated', label: '생성된 일정', value: mockStats.itinerariesCreated },
          { key: 'activeUsers', label: '활성 사용자', value: mockStats.activeUsers }
        ].map((stat) => (
          <Card key={stat.key} className="border-2 border-black shadow-none rounded-none hover:bg-black hover:text-white transition-colors group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-gray-500 group-hover:text-gray-400">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full justify-start border-b border-black bg-transparent p-0 h-auto rounded-none mb-8">
            {['users', 'itineraries', 'events', 'system'].map((tab) => (
              <TabsTrigger 
                key={tab}
                value={tab}
                className="rounded-none border-b-4 border-transparent px-6 py-3 font-bold uppercase tracking-tight data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-gray-600 transition-all"
              >
                {tab === 'users' && '사용자'}
                {tab === 'itineraries' && '여행 일정'}
                {tab === 'events' && '이벤트'}
                {tab === 'system' && '시스템'}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold uppercase tracking-tight">사용자 관리</h2>
               <div className="flex gap-2">
                 <Input 
                   placeholder="사용자 검색..." 
                   value={userSearchTerm}
                   onChange={(e) => setUserSearchTerm(e.target.value)}
                   className="w-64 border-black rounded-none focus:ring-0 focus:border-black"
                 />
                 <Button className="bg-black text-white rounded-none hover:bg-gray-800">
                   <Search className="h-4 w-4" />
                 </Button>
               </div>
            </div>

            <div className="border-2 border-black">
              <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-black text-white font-bold uppercase text-xs tracking-wider">
                <span>이메일</span>
                <span>이름</span>
                <span>국가</span>
                <span>가입일</span>
                <span>상태</span>
                <span className="text-center">관리</span>
              </div>
              
              {filteredUsers.map((user) => (
                <div key={user.id} className="border-t border-black p-4 grid grid-cols-1 md:grid-cols-6 gap-4 items-center hover:bg-gray-50 transition-colors">
                  <span className="truncate font-medium">{user.email}</span>
                  <span>{user.name}</span>
                  <span>{user.country}</span>
                  <span className="text-sm text-gray-500">{user.signupDate}</span>
                  <div className="flex items-center gap-2">
                     <Switch 
                        checked={user.status === '활성'} 
                        onCheckedChange={() => handleToggleUserStatus(user.id)}
                        className="data-[state=checked]:bg-green-500"
                     />
                     <span className={`text-xs font-bold ${user.status === '활성' ? 'text-green-600' : 'text-gray-400'}`}>
                        {user.status}
                     </span>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewUserDetail(user)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Itineraries Tab */}
          <TabsContent value="itineraries" className="space-y-8">
            {/* Header Section - Aligned in one line as requested */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-black pb-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight whitespace-nowrap">사용자 여행 일정 관리</h2>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="사용자, 도시, 제목으로 검색..." 
                      className="pl-10 border-black rounded-none h-10 focus-visible:ring-0 focus-visible:border-black transition-all"
                      value={tripSearchTerm}
                      onChange={(e) => setTripSearchTerm(e.target.value)}
                    />
                 </div>
                 <Button 
                   onClick={clearAllTrips}
                   variant="outline"
                   className="h-10 border-black rounded-none hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors whitespace-nowrap"
                 >
                   <Trash2 className="h-4 w-4 mr-2" />
                   전체 삭제
                 </Button>
                 <Button 
                   onClick={() => setShowAddTripForm(true)}
                   className="h-10 bg-black text-white rounded-none hover:bg-gray-800 whitespace-nowrap"
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   여행 추가
                 </Button>
              </div>
            </div>

            {/* Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: '총 여행', value: getConfirmedTrips().length, icon: Calendar },
                 { label: '완료됨', value: getConfirmedTrips().filter((t: any) => t.status === '완료').length, icon: CheckCircle },
                 { label: '진행중', value: getConfirmedTrips().filter((t: any) => t.status === '진행중').length, icon: Clock },
                 { label: '평균 평점', value: '4.8', icon: Star }
               ].map((stat) => (
                 <div key={stat.label} className="bg-gray-50 p-4 border border-black flex items-center justify-between group hover:bg-black hover:text-white transition-colors">
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1 opacity-60">{stat.label}</p>
                      <p className="text-2xl font-black">{stat.value}</p>
                    </div>
                    <stat.icon className="h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity" />
                 </div>
               ))}
            </div>

            {/* Content Grid */}
            <div className="grid gap-4">
              {getConfirmedTrips()
                .filter((itinerary: any) => {
                  if (!tripSearchTerm) return true;
                  const searchLower = tripSearchTerm.toLowerCase();
                  return (
                    itinerary.userName?.toLowerCase().includes(searchLower) ||
                    itinerary.title?.toLowerCase().includes(searchLower)
                  );
                })
                .map((itinerary: any, index: number) => (
                  <motion.div
                    key={itinerary.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="group border border-gray-200 hover:border-black bg-white p-6 transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex flex-col md:flex-row gap-6 justify-between">
                        <div className="space-y-3 flex-1">
                           <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-black">{itinerary.title}</h3>
                              <Badge variant="outline" className="rounded-none border-black text-black">{itinerary.status}</Badge>
                              {itinerary.rating > 0 && (
                                <span className="flex items-center text-sm font-bold">
                                  <Star className="h-4 w-4 fill-black text-black mr-1" />
                                  {itinerary.rating}
                                </span>
                              )}
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="block text-xs uppercase tracking-wider text-gray-400">사용자</span>
                                {itinerary.userName}
                              </div>
                              <div>
                                <span className="block text-xs uppercase tracking-wider text-gray-400">기간</span>
                                {itinerary.duration}
                              </div>
                              <div>
                                <span className="block text-xs uppercase tracking-wider text-gray-400">예산</span>
                                {itinerary.totalCost}
                              </div>
                              <div>
                                <span className="block text-xs uppercase tracking-wider text-gray-400">날짜</span>
                                {itinerary.createdAt}
                              </div>
                           </div>
                           {itinerary.interests && (
                             <div className="flex gap-2 pt-2">
                               {itinerary.interests.map((tag: string) => (
                                 <span key={tag} className="text-xs bg-gray-100 px-2 py-1 font-medium text-gray-600 uppercase tracking-wide">
                                   #{tag}
                                 </span>
                               ))}
                             </div>
                           )}
                        </div>
                        <div className="flex items-center">
                           <Button 
                             onClick={() => handleViewItinerary(itinerary)}
                             className="w-full md:w-auto rounded-none border-2 border-black bg-transparent text-black hover:bg-black hover:text-white font-bold transition-all"
                           >
                             상세보기
                           </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center border-b border-black pb-6 mb-6">
               <h2 className="text-2xl font-bold uppercase tracking-tight">이벤트 관리</h2>
               <Button 
                 onClick={() => setShowEventForm(true)} 
                 className="bg-black text-white rounded-none hover:bg-gray-800"
               >
                 <Plus className="h-4 w-4 mr-2" />
                 이벤트 생성
               </Button>
            </div>

            {showEventForm && (
              <div className="mb-8 border-2 border-black p-6 bg-gray-50">
                 <EventForm
                   newEvent={newEvent}
                   setNewEvent={setNewEvent}
                   editingEvent={editingEvent}
                   onSubmit={handleCreateEvent}
                   onCancel={() => {
                     setShowEventForm(false);
                     setEditingEvent(null);
                   }}
                 />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedEvents.map((event) => (
                <div key={event.id} className={`border-2 border-black bg-white transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${!event.active ? 'opacity-50 grayscale' : ''}`}>
                   {event.imageUrl && (
                     <div className="h-48 overflow-hidden border-b-2 border-black relative">
                        <ImageWithFallback 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute top-4 right-4">
                           <Badge className="bg-black text-white rounded-none hover:bg-black">{event.type}</Badge>
                        </div>
                     </div>
                   )}
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <h3 className="text-xl font-bold leading-tight">{event.title}</h3>
                         <div className={`h-3 w-3 rounded-full ${event.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                      
                      <div className="space-y-3 text-sm text-gray-600 mb-6">
                         <div className="flex items-center gap-2">
                           <Calendar className="h-4 w-4" />
                           <span>{event.startDate} ~ {event.endDate}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <MapPin className="h-4 w-4" />
                           <span>{event.location}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Target className="h-4 w-4" />
                           <span>{event.targetAudience}</span>
                         </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="flex-1 rounded-none border-black hover:bg-black hover:text-white"
                           onClick={() => handleEditEvent(event)}
                         >
                           수정
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm"
                           className="flex-1 rounded-none border-black text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                           onClick={() => handleDeleteEvent(event.id)}
                         >
                           삭제
                         </Button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* API Status Card */}
              <Card className="border-2 border-black rounded-none shadow-none">
                <CardHeader className="bg-black text-white p-4">
                  <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    API 서비스 상태
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {mockAPIStatus.map((api, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                        <span className="font-bold">{api.name}</span>
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                           <span className="text-sm text-green-600 font-bold uppercase">{api.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Server Load Card */}
              <Card className="border-2 border-black rounded-none shadow-none">
                <CardHeader className="bg-black text-white p-4">
                  <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    서버 부하
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-center items-center h-[200px]">
                   <div className="text-5xl font-black mb-2">24%</div>
                   <p className="text-gray-500 font-medium mb-4">CPU 사용량 (안정적)</p>
                   <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-black">
                      <div className="h-full bg-green-500 w-[24%]"></div>
                   </div>
                   <div className="w-full flex justify-between mt-2 text-xs text-gray-400">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                   </div>
                </CardContent>
              </Card>

              {/* Recent Alerts */}
              <Card className="border-2 border-black rounded-none shadow-none">
                 <CardHeader className="bg-black text-white p-4">
                  <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    시스템 알림
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                     <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                        <p className="font-bold text-sm">데이터베이스 백업 완료</p>
                        <p className="text-xs text-gray-500 mt-1">오늘, 03:00 AM</p>
                     </div>
                     <div className="p-4 border-l-4 border-green-400 bg-green-50">
                        <p className="font-bold text-sm">시스템 정기 점검 완료</p>
                        <p className="text-xs text-gray-500 mt-1">어제, 11:00 PM</p>
                     </div>
                     <div className="p-4 border-l-4 border-blue-400 bg-blue-50">
                        <p className="font-bold text-sm">새로운 버전 배포 v2.1.0</p>
                        <p className="text-xs text-gray-500 mt-1">2024-11-20</p>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Detailed Metrics */}
            <div className="border-2 border-black bg-white p-6">
               <h3 className="text-xl font-black uppercase mb-6">트래픽 분석</h3>
               <div className="h-[300px] w-full flex items-end justify-between gap-2 px-4 pb-4 border-b-2 border-black">
                  {[45, 60, 35, 80, 55, 90, 70, 65, 85, 50, 40, 95].map((h, i) => (
                    <div key={i} className="w-full bg-gray-100 hover:bg-black transition-colors relative group h-full flex items-end">
                       <div 
                         style={{ height: `${h}%` }} 
                         className="w-full bg-black opacity-20 group-hover:opacity-100 transition-all"
                       ></div>
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none">
                          {h * 10} visits
                       </div>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:59</span>
               </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* User Detail Modal */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-2xl border-2 border-black rounded-none p-0 overflow-hidden">
           <DialogHeader className="p-6 bg-black text-white rounded-none">
              <DialogTitle className="text-2xl font-bold uppercase tracking-wider">사용자 프로필</DialogTitle>
              <DialogDescription className="text-gray-400 text-sm mt-1">
                선택한 사용자의 상세 정보와 활동 내역입니다.
              </DialogDescription>
           </DialogHeader>
           {selectedUser && (
             <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
               {/* Basic Info */}
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-xs uppercase text-gray-400 tracking-widest">이름</Label>
                    <p className="text-lg font-bold border-b border-gray-200 py-1">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-gray-400 tracking-widest">이메일</Label>
                    <p className="text-lg font-bold border-b border-gray-200 py-1">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-gray-400 tracking-widest">국가</Label>
                    <p className="text-lg font-bold border-b border-gray-200 py-1">{selectedUser.country}</p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-gray-400 tracking-widest">가입일</Label>
                    <p className="text-lg font-bold border-b border-gray-200 py-1">{selectedUser.signupDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-gray-400 tracking-widest">최근 로그인</Label>
                    <p className="text-lg font-bold border-b border-gray-200 py-1">{selectedUser.lastLogin}</p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-gray-400 tracking-widest">상태</Label>
                    <div className="flex items-center gap-2 py-1">
                       <div className={`w-3 h-3 rounded-full ${selectedUser.status === '활성' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                       <span className="font-bold">{selectedUser.status}</span>
                    </div>
                  </div>
               </div>
               
               {/* Detailed Stats */}
               <div className="bg-gray-50 p-4 border border-gray-200">
                 <h4 className="font-bold uppercase text-sm mb-4">활동 요약</h4>
                 <div className="flex justify-between text-center divide-x divide-gray-200">
                    <div className="flex-1 px-2">
                       <p className="text-3xl font-black">{selectedUser.tripCount}</p>
                       <p className="text-xs text-gray-500 uppercase">생성한 여행</p>
                    </div>
                    <div className="flex-1 px-2">
                       <p className="text-3xl font-black">{selectedUser.totalSpent}</p>
                       <p className="text-xs text-gray-500 uppercase">총 예상 지출</p>
                    </div>
                    <div className="flex-1 px-2">
                       <div className="flex gap-1 flex-wrap justify-center">
                          {selectedUser.interests.map((i: any) => (
                            <Badge key={i} variant="secondary" className="rounded-none text-[10px] px-1">{i}</Badge>
                          ))}
                       </div>
                       <p className="text-xs text-gray-500 uppercase mt-1">선호 관심사</p>
                    </div>
                 </div>
               </div>

               {/* Recent Trips Section */}
               <div>
                 <h4 className="font-bold uppercase text-lg mb-4 tracking-tight flex items-center gap-2">
                   <Calendar className="w-5 h-5" />
                   최근 생성한 여행 일정
                 </h4>
                 
                 {getUserTrips(selectedUser.email).length > 0 ? (
                   <div className="space-y-3">
                     {getUserTrips(selectedUser.email).slice(0, 3).map((trip: any) => (
                       <div key={trip.id} className="border border-gray-200 p-4 hover:border-black transition-colors flex justify-between items-center bg-white">
                         <div>
                           <p className="font-bold text-base">{trip.title}</p>
                           <div className="flex gap-2 text-xs text-gray-500 mt-1">
                             <span>{trip.duration}</span>
                             <span>•</span>
                             <span>{trip.createdAt} 생성</span>
                             <span>•</span>
                             <span>{trip.status}</span>
                           </div>
                         </div>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="rounded-none text-xs h-8"
                           onClick={() => {
                             setShowUserDetail(false);
                             handleViewItinerary(trip);
                           }}
                         >
                           상세보기
                         </Button>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8 bg-gray-50 text-gray-400 border border-dashed border-gray-300">
                     <p>생성된 여행 일정이 없습니다.</p>
                   </div>
                 )}
               </div>
             </div>
           )}
        </DialogContent>
      </Dialog>

      {/* Itinerary Detail Modal Logic */}
      {showItineraryDetail && selectedItinerary && (
        <Dialog open={showItineraryDetail} onOpenChange={setShowItineraryDetail}>
           <DialogContent className="max-w-4xl h-[80vh] flex flex-col border-2 border-black rounded-none p-0">
              <DialogHeader className="p-6 border-b-2 border-black bg-gray-50">
                 <div className="flex justify-between items-start">
                    <div>
                       <DialogTitle className="text-3xl font-black uppercase leading-none mb-2">
                         {selectedItinerary.title}
                       </DialogTitle>
                       <DialogDescription className="flex items-center gap-2">
                         <span className="font-bold text-black">{selectedItinerary.userName}</span>
                         <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                         <span>{selectedItinerary.duration}</span>
                       </DialogDescription>
                    </div>
                    <Badge className="bg-black text-white rounded-none text-lg px-4 py-1">
                      {selectedItinerary.totalCost}
                    </Badge>
                 </div>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto p-6">
                 {selectedItinerary.itineraryData?.days ? (
                   <div className="space-y-8 relative before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-[2px] before:bg-gray-200">
                     {selectedItinerary.itineraryData.days.map((day: any) => (
                       <div key={day.day} className="relative pl-12">
                          <div className="absolute left-0 top-0 h-10 w-10 bg-black text-white flex items-center justify-center font-bold text-lg rounded-full border-4 border-white z-10 shadow-lg">
                             {day.day}
                          </div>
                          <h4 className="text-xl font-bold mb-4 pt-2">{day.title}</h4>
                          <div className="space-y-4">
                             {day.activities?.map((activity: any, idx: number) => (
                               <div key={idx} className="bg-white border border-gray-200 p-4 hover:border-black transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                     <span className="font-mono font-bold text-sm bg-gray-100 px-2 py-1">{activity.time}</span>
                                     <span className="text-sm font-bold text-gray-500">{activity.estimatedCost}</span>
                                  </div>
                                  <h5 className="font-bold text-lg mb-1">{activity.activity}</h5>
                                  <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                                  {activity.location && (
                                    <div className="flex items-center text-xs text-gray-400 uppercase tracking-wider font-bold">
                                       <MapPin className="h-3 w-3 mr-1" />
                                       {activity.location}
                                    </div>
                                  )}
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Calendar className="h-16 w-16 mb-4 opacity-20" />
                      <p className="text-lg font-bold uppercase tracking-widest">일정 상세 정보 없음</p>
                   </div>
                 )}
              </div>
           </DialogContent>
        </Dialog>
      )}
      
      {/* Add Trip Form would go here if needed, keeping hidden for this redesign focus */}
    </div>
  );
}

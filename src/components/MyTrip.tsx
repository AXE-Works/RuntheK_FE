import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';
import { User, MapPin, Calendar, DollarSign, Heart, Eye, Edit, Trash2, Star, Bookmark, Clock, Users, ArrowRight } from 'lucide-react';
import { ItineraryData } from '../App';
import { TripDetailView } from './TripDetailView';

interface MyTripProps {
  currentUser: any;
  onUpdateUser: (user: any) => void;
  onCreateNewTrip?: () => void;
  onOpenAuthModal?: () => void;
}

// Mock data for user trips and bookmarked trips
const mockUserTrips = [
  {
    id: '1',
    title: 'Seoul & Busan Adventure',
    duration: '5 days',
    cities: ['Seoul', 'Busan'],
    budget: 'Medium ($1000-2000)',
    interests: ['Culture', 'Food', 'Shopping'],
    createdAt: '2024-01-15',
    status: '완료',
    totalCost: '$1,450',
    rating: 4.8,
    views: 234,
    likes: 12
  },
  {
    id: '2',
    title: 'Jeju Island Nature Trip',
    duration: '3 days',
    cities: ['Jeju'],
    budget: 'Budget (Under $1000)',
    interests: ['Nature', 'Adventure'],
    createdAt: '2024-01-08',
    status: '진행중',
    totalCost: '$780',
    rating: null,
    views: 156,
    likes: 8
  }
];

const mockBookmarkedTrips = [
  {
    id: '3',
    title: 'Traditional Korea Experience',
    duration: '7 days',
    cities: ['Seoul', 'Gyeongju', 'Jeonju'],
    budget: 'Luxury ($2000+)',
    interests: ['Culture', 'History', 'Food'],
    creator: 'Sarah Johnson',
    creatorCountry: 'USA',
    createdAt: '2024-01-20',
    rating: 4.9,
    totalCost: '$2,350',
    views: 892,
    likes: 47
  },
  {
    id: '4',
    title: 'K-Pop & Modern Seoul',
    duration: '4 days',
    cities: ['Seoul'],
    budget: 'Medium ($1000-2000)',
    interests: ['Entertainment', 'Shopping', 'Food'],
    creator: 'Yuki Tanaka',
    creatorCountry: 'Japan',
    createdAt: '2024-01-18',
    rating: 4.7,
    totalCost: '$1,200',
    views: 567,
    likes: 23
  }
];

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bangladesh', 'Belgium', 'Belize', 'Brazil', 'Bulgaria',
  'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Czech Republic',
  'Denmark',
  'Egypt', 'Estonia',
  'Finland', 'France',
  'Georgia', 'Germany', 'Greece',
  'Hong Kong', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kuwait',
  'Laos', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
  'Malaysia', 'Mexico', 'Mongolia', 'Morocco', 'Myanmar',
  'Nepal', 'Netherlands', 'New Zealand', 'Norway',
  'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia',
  'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
  'Taiwan', 'Thailand', 'Turkey',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uzbekistan',
  'Venezuela', 'Vietnam',
  'Other'
];

export function MyTrip({ currentUser, onUpdateUser, onCreateNewTrip, onOpenAuthModal }: MyTripProps) {
  const [activeTab, setActiveTab] = useState('my-trips'); // Changed default tab to 'my-trips'
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(currentUser || {});
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailViewTrip, setDetailViewTrip] = useState<any>(null);

  // Get confirmed trips from localStorage
  const getConfirmedTrips = () => {
    try {
      const confirmed = localStorage.getItem('confirmedTrips');
      const confirmedTrips = confirmed ? JSON.parse(confirmed) : [];
      // Filter trips for current user
      if (currentUser) {
        return confirmedTrips.filter((trip: any) => trip.userEmail === currentUser.email);
      }
      return [];
    } catch {
      return [];
    }
  };

  // Combine mock trips with confirmed trips from localStorage
  const getAllUserTrips = () => {
    const confirmedTrips = getConfirmedTrips().map((trip: any) => ({
      ...trip,
      duration: trip.duration || '5 days',
      cities: trip.cities || ['Seoul'],
      budget: trip.budget || 'Medium ($1000-2000)',
      interests: trip.interests || ['Culture'],
      status: trip.status || '확정됨',
      totalCost: trip.totalCost || trip.totalEstimatedCost || '$1,000',
      views: Math.floor(Math.random() * 200) + 50,
      likes: Math.floor(Math.random() * 20) + 1
    }));
    
    return [...confirmedTrips, ...mockUserTrips];
  };

  const userTrips = getAllUserTrips();

  // Update editedUser when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setEditedUser(currentUser);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-gray-100 rounded-full p-6 mb-6">
          <User className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your trips</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Create an account or sign in to manage your travel plans, save favorite destinations, and track your trip history.
        </p>
        <Button size="lg" className="bg-black text-white hover:bg-gray-800" onClick={onOpenAuthModal}>
          <User className="h-5 w-5 mr-2" />
          Sign In
        </Button>
      </div>
    );
  }

  const handleSaveProfile = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedUser(currentUser);
    setIsEditing(false);
  };

  const handleViewTripDetail = (trip: any) => {
    setDetailViewTrip(trip);
    setShowDetailView(true);
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setDetailViewTrip(null);
  };

  // Confirmed Trip Banner Component
  const ConfirmedTripBanner = ({ trip }: { trip: any }) => (
    <motion.div
      className="relative overflow-hidden rounded-lg bg-gradient-to-r from-black to-gray-800 p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 group"
      onClick={() => handleViewTripDetail(trip)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-600 text-white">Confirmed</Badge>
            <Badge variant="outline" className="border-white/30 text-white">
              {trip.status}
            </Badge>
          </div>
          <h3 className="text-xl font-bold group-hover:text-blue-300 transition-colors">
            {trip.title}
          </h3>
          <div className="flex items-center space-x-4 text-gray-300">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{trip.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{trip.cities?.join(', ') || 'Seoul'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>{trip.totalCost}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {trip.interests?.map((interest: string) => (
              <Badge key={interest} variant="secondary" className="bg-white/20 text-white border-white/20">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right space-y-1">
            <div className="text-sm text-gray-300">Created</div>
            <div className="font-medium">{trip.createdAt}</div>
          </div>
          <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 group-hover:to-white/10 transition-all duration-300" />
    </motion.div>
  );

  const TripCard = ({ trip, isBookmarked = false }: { trip: any; isBookmarked?: boolean }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => setSelectedTrip(trip)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 group-hover:text-blue-600 transition-colors">
              {trip.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {trip.duration}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {trip.cities?.join(', ') || 'Seoul'}
              </span>
            </CardDescription>
          </div>
          {isBookmarked ? (
            <Bookmark className="h-5 w-5 text-yellow-500 fill-current" />
          ) : (
            <Badge variant={trip.status === '완료' ? 'default' : 'secondary'}>
              {trip.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {trip.interests?.map((interest: string) => (
              <Badge key={interest} variant="outline" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {trip.totalCost}
            </span>
            <span className="text-xs">{trip.createdAt}</span>
          </div>

          {isBookmarked && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {trip.creator}
              </span>
              <Badge variant="outline" className="text-xs">
                {trip.creatorCountry}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {trip.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {trip.rating}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {trip.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {trip.likes}
              </span>
            </div>
            
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {trip.confirmed ? (
                <Button variant="outline" size="sm" onClick={() => handleViewTripDetail(trip)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setSelectedTrip(trip)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (showDetailView && detailViewTrip) {
    return <TripDetailView trip={detailViewTrip} onBack={handleBackFromDetail} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600 text-[12px]">
            Manage your travel plans, preferences, and saved destinations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="my-trips">My Trips</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* My Trips Tab - Now first */}
          <TabsContent value="my-trips" className="space-y-6">
            {/* Confirmed Trips Banner Section */}
            {getConfirmedTrips().length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Confirmed Trips</h2>
                    <p className="text-gray-600">Your finalized travel plans ready for adventure</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  {getConfirmedTrips().map((trip) => (
                    <ConfirmedTripBanner key={trip.id} trip={trip} />
                  ))}
                </div>
              </div>
            )}

            {/* All Trips Section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {getConfirmedTrips().length > 0 ? 'All Travel Plans' : 'My Travel Plans'}
                </h2>
                <p className="text-gray-600">
                  {getConfirmedTrips().length > 0 ? 'Complete overview of all your trips' : 'Trips you\'ve created and planned'}
                </p>
              </div>
              <Button onClick={onCreateNewTrip}>
                <MapPin className="h-4 w-4 mr-2" />
                Create New Trip
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {userTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>

            {userTrips.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 mb-4 mx-auto w-fit">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-4">Start planning your first Korea adventure!</p>
                <Button onClick={onCreateNewTrip}>Plan Your First Trip</Button>
              </div>
            )}
          </TabsContent>

          {/* Bookmarks Tab - Now second */}
          <TabsContent value="bookmarks" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Saved Trips</h2>
              <p className="text-gray-600">Travel plans you've bookmarked from other users</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {mockBookmarkedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} isBookmarked={true} />
              ))}
            </div>

            {mockBookmarkedTrips.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 mb-4 mx-auto w-fit">
                  <Bookmark className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
                <p className="text-gray-600 mb-4">
                  Discover and save inspiring travel plans from other users
                </p>
                <Button variant="outline">Explore Public Trips</Button>
              </div>
            )}
          </TabsContent>

          {/* Profile Tab - Now third */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription className="text-[13px] px-[0px] py-[5px]">
                      Manage your personal information and travel preferences
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "destructive" : "outline"}
                    onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)} className="text-[13px]"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name || 'User'} />
                    <AvatarFallback className="text-lg">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{currentUser?.name || 'User'}</h3>
                    <p className="text-gray-600">{currentUser?.email || 'No email'}</p>
                    <Badge variant="outline">{currentUser?.country || 'Not specified'}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={isEditing ? (editedUser?.name || '') : (currentUser?.name || '')}
                      onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? (editedUser?.email || '') : (currentUser?.email || '')}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={isEditing ? (editedUser?.country || '') : (currentUser?.country || '')}
                      onValueChange={(value) => setEditedUser({ ...editedUser, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex gap-2">
                      <Select
                        value={isEditing ? (editedUser?.countryCode || '+1') : (currentUser?.countryCode || '+1')}
                        onValueChange={(value) => setEditedUser({ ...editedUser, countryCode: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">+1 (US)</SelectItem>
                          <SelectItem value="+44">+44 (UK)</SelectItem>
                          <SelectItem value="+81">+81 (JP)</SelectItem>
                          <SelectItem value="+82">+82 (KR)</SelectItem>
                          <SelectItem value="+86">+86 (CN)</SelectItem>
                          <SelectItem value="+91">+91 (IN)</SelectItem>
                          <SelectItem value="+61">+61 (AU)</SelectItem>
                          <SelectItem value="+65">+65 (SG)</SelectItem>
                          <SelectItem value="+33">+33 (FR)</SelectItem>
                          <SelectItem value="+49">+49 (DE)</SelectItem>
                          <SelectItem value="+39">+39 (IT)</SelectItem>
                          <SelectItem value="+34">+34 (ES)</SelectItem>
                          <SelectItem value="+7">+7 (RU)</SelectItem>
                          <SelectItem value="+55">+55 (BR)</SelectItem>
                          <SelectItem value="+52">+52 (MX)</SelectItem>
                          <SelectItem value="+27">+27 (ZA)</SelectItem>
                          <SelectItem value="+971">+971 (AE)</SelectItem>
                          <SelectItem value="+966">+966 (SA)</SelectItem>
                          <SelectItem value="+63">+63 (PH)</SelectItem>
                          <SelectItem value="+66">+66 (TH)</SelectItem>
                          <SelectItem value="+84">+84 (VN)</SelectItem>
                          <SelectItem value="+60">+60 (MY)</SelectItem>
                          <SelectItem value="+62">+62 (ID)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        className="flex-1"
                        value={isEditing ? (editedUser?.phone || '') : (currentUser?.phone || '')}
                        onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                        placeholder="Phone number"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {userTrips.length}
                    </div>
                    <div className="text-sm text-gray-600 text-[12px]">Trips Created</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {mockBookmarkedTrips.length}
                    </div>
                    <div className="text-sm text-gray-600 text-[12px] text-[13px]">Bookmarks</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">4.8</div>
                    <div className="text-sm text-gray-600 text-[12px]">Avg Rating</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">390</div>
                    <div className="text-sm text-gray-600 text-[12px]">Total Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Trip Detail Modal */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedTrip?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {selectedTrip?.duration}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {selectedTrip?.cities?.join(', ')}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {selectedTrip?.totalCost}
              </span>
              {selectedTrip?.creator && (
                <span className="text-gray-600">
                  Created by {selectedTrip.creator}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrip && (
            <div className="space-y-6">
              {/* Trip Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="text-lg font-bold">{selectedTrip.rating || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Eye className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-lg font-bold">{selectedTrip.views}</div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-lg font-bold">{selectedTrip.likes}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-lg font-bold">{selectedTrip.createdAt}</div>
                  <div className="text-sm text-gray-600">Created</div>
                </div>
              </div>

              {/* Creator Info (for bookmarked trips) */}
              {selectedTrip.creator && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 p-2 bg-blue-100 rounded-full" />
                    <div>
                      <p className="font-medium">Created by {selectedTrip.creator}</p>
                      <p className="text-sm text-gray-600">From {selectedTrip.creatorCountry}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trip Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Trip Overview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{selectedTrip.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Budget:</span>
                      <span className="ml-2 font-medium">{selectedTrip.budget}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cities:</span>
                      <span className="ml-2 font-medium">{selectedTrip.cities?.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2">
                        <Badge variant={selectedTrip.status === '완료' ? 'default' : 'secondary'}>
                          {selectedTrip.status}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrip.interests?.map((interest: string) => (
                      <Badge key={interest} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sample Itinerary Preview */}
                <div>
                  <h4 className="font-semibold mb-3">Sample Itinerary</h4>
                  <div className="space-y-3">
                    {Array.from({ length: parseInt(selectedTrip.duration) || 3 }, (_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium mb-2">Day {i + 1} - Exploring {selectedTrip.cities?.[i % selectedTrip.cities.length] || 'Seoul'}</h5>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-xs bg-gray-100 px-2 py-1 rounded">09:00 AM</span>
                            <span>{selectedTrip.interests?.[0] === 'Culture' ? 'Visit traditional palace' : 'Morning activity based on interests'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-xs bg-gray-100 px-2 py-1 rounded">12:00 PM</span>
                            <span>Traditional Korean lunch</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-xs bg-gray-100 px-2 py-1 rounded">02:00 PM</span>
                            <span>{selectedTrip.interests?.[1] === 'Shopping' ? 'Shopping district exploration' : 'Afternoon activity'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-xs bg-gray-100 px-2 py-1 rounded">07:00 PM</span>
                            <span>Korean BBQ dinner</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {!selectedTrip.creator && selectedTrip.confirmed && (
                    <Button className="flex-1" onClick={() => handleViewTripDetail(selectedTrip)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Details & Rate
                    </Button>
                  )}
                  {!selectedTrip.creator && !selectedTrip.confirmed && (
                    <Button className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Trip
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    {selectedTrip.creator ? 'Save to My Trips' : 'Share Trip'}
                  </Button>
                  {!selectedTrip.confirmed && (
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Itinerary
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )} 
        </DialogContent>
      </Dialog>
    </div>
  );
}
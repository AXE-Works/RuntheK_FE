import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';
import { User, MapPin, Calendar, DollarSign, Heart, Eye, Edit, Star, Bookmark, Clock, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { TripDetailView } from './TripDetailView';
import { getProfile, updateProfile, UpdateProfileRequest } from '../utils/api';
import { getTrips, getBookmarks, getTripById, TripListItem, BookmarkItem, TripDetailResponse } from '../services/tripApi';
import { toast } from 'sonner';

// ===== Types =====

interface MyTripProps {
  currentUser: any;
  onUpdateUser: (user: any) => void;
  onCreateNewTrip?: () => void;
  onOpenAuthModal?: () => void;
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
}

// Extended trip type for UI display
// Note: TripListItem now includes budget, interests, daysCount, activitiesCount, averageRating from BE
interface TripDisplayItem extends TripListItem {
  totalCost?: string;       // Optional UI-specific field
  rating?: number;          // Alias for averageRating
  confirmed?: boolean;      // Derived from status
}

// Extended bookmark type for UI display
interface BookmarkDisplayItem extends BookmarkItem {
  budget?: string;
}

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

// ===== Budget Level Display Mapping (BE returns lowercase) =====
const BUDGET_LEVEL_DISPLAY: Record<string, string> = {
  'budget': 'Budget (Under $1000)',
  'mid-range': 'Mid-range ($1000-2000)',
  'luxury': 'Luxury ($2000+)',
};

// ===== Status Display Mapping (BE returns lowercase) =====
const STATUS_DISPLAY: Record<string, string> = {
  'upcoming': 'Upcoming',
  'ongoing': 'In Progress',
  'completed': 'Completed',
};

export function MyTrip({ currentUser, onUpdateUser, onCreateNewTrip, onOpenAuthModal, defaultTab, onTabChange }: MyTripProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'my-trips');

  // Sync with defaultTab from parent
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Notify parent of tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(currentUser || {});
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailViewTrip, setDetailViewTrip] = useState<any>(null);

  // Profile API states
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ===== Trip API States =====
  const [trips, setTrips] = useState<TripDisplayItem[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState<string | null>(null);
  const [tripsFetched, setTripsFetched] = useState(false);

  // ===== Bookmark API States =====
  const [bookmarks, setBookmarks] = useState<BookmarkDisplayItem[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [bookmarksError, setBookmarksError] = useState<string | null>(null);
  const [bookmarksFetched, setBookmarksFetched] = useState(false);

  // ===== Trip Detail States =====
  const [tripDetailLoading, setTripDetailLoading] = useState(false);

  // ===== Handle Trip Click - Fetch Details =====
  const handleTripClick = useCallback(async (trip: TripDisplayItem | BookmarkDisplayItem) => {
    // Set basic info immediately for quick display
    setSelectedTrip(trip);
    setTripDetailLoading(true);

    try {
      const response = await getTripById(trip.id);
      if (response.success && response.data) {
        // Merge detail data with existing data
        setSelectedTrip({
          ...trip,
          ...response.data,
          rating: response.data.averageRating,
        });
      }
    } catch (error) {
      console.error('[MyTrip] Failed to fetch trip details:', error);
      // Keep the basic info, just without detailed itinerary
    } finally {
      setTripDetailLoading(false);
    }
  }, []);

  // ===== Fetch Trips from API =====
  const fetchTrips = useCallback(async () => {
    if (!currentUser) return;

    setTripsLoading(true);
    setTripsError(null);

    try {
      const response = await getTrips(1, 50); // Fetch up to 50 trips
      const items = response?.items ?? [];
      const displayTrips: TripDisplayItem[] = items.map(trip => ({
        ...trip,
        // BE already returns budget field, just add display version if needed
        confirmed: trip.status === 'upcoming' || trip.status === 'ongoing',
      }));
      setTrips(displayTrips);
      console.log('[MyTrip] Fetched trips:', displayTrips);
    } catch (error) {
      console.error('[MyTrip] Failed to fetch trips:', error);
      setTripsError(error instanceof Error ? error.message : 'Failed to load trips');
    } finally {
      setTripsLoading(false);
    }
  }, [currentUser]);

  // ===== Fetch Bookmarks from API =====
  const fetchBookmarks = useCallback(async () => {
    if (!currentUser) return;

    setBookmarksLoading(true);
    setBookmarksError(null);

    try {
      const response = await getBookmarks(1, 50); // Fetch up to 50 bookmarks
      const items = response?.items ?? [];
      const displayBookmarks: BookmarkDisplayItem[] = items.map(bookmark => ({
        ...bookmark,
        budget: BUDGET_LEVEL_DISPLAY[bookmark.budgetLevel] || 'Mid-range',
      }));
      setBookmarks(displayBookmarks);
      console.log('[MyTrip] Fetched bookmarks:', displayBookmarks);
    } catch (error) {
      console.error('[MyTrip] Failed to fetch bookmarks:', error);
      setBookmarksError(error instanceof Error ? error.message : 'Failed to load bookmarks');
    } finally {
      setBookmarksLoading(false);
    }
  }, [currentUser]);

  // ===== Fetch trips when entering my-trips tab =====
  useEffect(() => {
    if (currentUser && activeTab === 'my-trips' && !tripsFetched) {
      fetchTrips();
      setTripsFetched(true);
    }
  }, [currentUser?.id, activeTab, tripsFetched, fetchTrips]);

  // ===== Fetch bookmarks when entering bookmarks tab =====
  useEffect(() => {
    if (currentUser && activeTab === 'bookmarks' && !bookmarksFetched) {
      fetchBookmarks();
      setBookmarksFetched(true);
    }
  }, [currentUser?.id, activeTab, bookmarksFetched, fetchBookmarks]);

  // ===== Reset fetch flags when user changes =====
  useEffect(() => {
    setTripsFetched(false);
    setBookmarksFetched(false);
  }, [currentUser?.id]);

  // Get confirmed trips (upcoming or ongoing status - BE returns lowercase)
  const confirmedTrips = trips.filter(trip => trip.status === 'upcoming' || trip.status === 'ongoing');

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

  // Fetch profile from API
  const fetchProfile = useCallback(async () => {
    if (!currentUser) return;

    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await getProfile();
      if (response.success && response.data) {
        // Update both local state and parent state
        // Map BE phoneCountryCode → FE countryCode
        const profileData = {
          ...currentUser,
          ...response.data,
          countryCode: response.data.phoneCountryCode || currentUser.countryCode,
        };
        onUpdateUser(profileData);
        setEditedUser(profileData);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Don't show error on initial load if user data exists from auth
      if (!currentUser.name) {
        setProfileError(error instanceof Error ? error.message : 'Failed to load profile');
      }
    } finally {
      setProfileLoading(false);
    }
  }, [currentUser, onUpdateUser]);

  // Fetch profile only when first entering profile tab (not after save)
  const [profileFetched, setProfileFetched] = useState(false);

  useEffect(() => {
    if (currentUser && activeTab === 'profile' && !profileFetched) {
      fetchProfile();
      setProfileFetched(true);
    }
  }, [currentUser?.id, activeTab, profileFetched]);

  // Reset profileFetched when leaving profile tab
  useEffect(() => {
    if (activeTab !== 'profile') {
      setProfileFetched(false);
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError(null);

    try {
      // Prepare update request with all editable fields
      const updateData: UpdateProfileRequest = {
        name: editedUser.name,
        country: editedUser.country,
        bio: editedUser.bio,
        avatar: editedUser.avatar,
        phoneCountryCode: editedUser.countryCode,  // FE countryCode → BE phoneCountryCode
        phone: editedUser.phone,
      };

      // Remove undefined/null values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateProfileRequest] === undefined ||
            updateData[key as keyof UpdateProfileRequest] === null) {
          delete updateData[key as keyof UpdateProfileRequest];
        }
      });

      console.log('[Profile] Updating with data:', updateData);

      const response = await updateProfile(updateData);
      console.log('[Profile] Update response:', response);

      if (response.success && response.data) {
        // Map BE phoneCountryCode → FE countryCode
        const updatedUser = {
          ...currentUser,
          ...response.data,
          countryCode: response.data.phoneCountryCode || currentUser.countryCode,
        };
        onUpdateUser(updatedUser);
        setEditedUser(updatedUser);
        toast.success('Profile updated successfully');
      }

      setIsEditing(false);
    } catch (error) {
      console.error('[Profile] Failed to update:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setProfileError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(currentUser);
    setIsEditing(false);
  };

  const handleViewTripDetail = async (trip: any) => {
    // 1. 먼저 현재 데이터로 화면 표시 (로딩 UX 개선)
    setDetailViewTrip(trip);
    setShowDetailView(true);

    // 2. localStorage에 완전한 데이터가 있는지 확인
    const hasLocalData = trip.itineraryData?.days && trip.itineraryData.days.length > 0;

    if (hasLocalData) {
      // localStorage 데이터가 완전하면 API 호출 생략
      console.log('Using cached trip data from localStorage');
      return;
    }

    // 3. 완전한 데이터가 없으면 API 호출
    try {
      const response = await getTripById(trip.id);
      if (response.success && response.data) {
        // API 응답의 days를 itineraryData.days 형태로 변환하여 병합
        const enrichedTrip = {
          ...trip,
          ...response.data,
          itineraryData: {
            ...trip.itineraryData,
            days: response.data.days || trip.itineraryData?.days || []
          }
        };
        setDetailViewTrip(enrichedTrip);
      }
    } catch (error) {
      console.error('Failed to fetch trip details:', error);
      // 에러 시 기존 데이터 유지 (이미 화면에 표시됨)
    }
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setDetailViewTrip(null);
  };

  // Confirmed Trip Banner Component
  const ConfirmedTripBanner = ({ trip }: { trip: TripDisplayItem }) => (
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
              {STATUS_DISPLAY[trip.status] || trip.status}
            </Badge>
          </div>
          <h3 className="text-xl font-bold group-hover:text-blue-300 transition-colors">
            {trip.title}
          </h3>
          <div className="flex items-center space-x-4 text-gray-300">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{trip.duration} days</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{trip.cities?.join(', ') || 'Korea'}</span>
            </div>
            {trip.startDate && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(trip.startDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {trip.interests && trip.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trip.interests.map((interest: string) => (
                <Badge key={interest} variant="secondary" className="bg-white/20 text-white border-white/20">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right space-y-1">
            <div className="text-sm text-gray-300">Created</div>
            <div className="font-medium">{new Date(trip.confirmedAt).toLocaleDateString()}</div>
          </div>
          <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 group-hover:to-white/10 transition-all duration-300" />
    </motion.div>
  );

  // Trip Card Component
  const TripCard = ({ trip, isBookmarked = false }: { trip: TripDisplayItem | BookmarkDisplayItem; isBookmarked?: boolean }) => {
    const bookmarkTrip = trip as BookmarkDisplayItem;
    const displayTrip = trip as TripDisplayItem;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => handleTripClick(trip)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1 group-hover:text-blue-600 transition-colors">
                {trip.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {trip.duration} days
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {trip.cities?.join(', ') || 'Korea'}
                </span>
              </CardDescription>
            </div>
            {isBookmarked ? (
              <Bookmark className="h-5 w-5 text-yellow-500 fill-current" />
            ) : (
              <Badge variant={displayTrip.status === 'completed' ? 'default' : 'secondary'}>
                {STATUS_DISPLAY[displayTrip.status] || displayTrip.status}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {trip.interests && trip.interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {trip.interests.map((interest: string) => (
                  <Badge key={interest} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {trip.budget || BUDGET_LEVEL_DISPLAY[bookmarkTrip.budgetLevel] || 'Mid-range'}
              </span>
              <span className="text-xs">{new Date(trip.confirmedAt).toLocaleDateString()}</span>
            </div>

            {isBookmarked && bookmarkTrip.creator && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {bookmarkTrip.creator.name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {bookmarkTrip.creator.country}
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
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {displayTrip.confirmed ? (
                  <Button variant="outline" size="sm" onClick={() => handleViewTripDetail(trip)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleTripClick(trip); }}>
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
  };

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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="my-trips">My Trips</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* My Trips Tab - Now first */}
          <TabsContent value="my-trips" className="space-y-6">
            {/* Loading State */}
            {tripsLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                <p className="text-gray-600">Loading your trips...</p>
              </div>
            )}

            {/* Error State */}
            {tripsError && !tripsLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-red-50 rounded-full p-4 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load trips</h3>
                <p className="text-gray-600 mb-4">{tripsError}</p>
                <Button onClick={() => { setTripsFetched(false); fetchTrips(); }} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Content (only show when not loading and no error) */}
            {!tripsLoading && !tripsError && (
              <>
                {/* Confirmed Trips Banner Section */}
                {confirmedTrips.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Confirmed Trips</h2>
                        <p className="text-gray-600">Your finalized travel plans ready for adventure</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {confirmedTrips.map((trip) => (
                        <ConfirmedTripBanner key={trip.id} trip={trip} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Trips Section */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {confirmedTrips.length > 0 ? 'All Travel Plans' : 'My Travel Plans'}
                    </h2>
                    <p className="text-gray-600">
                      {confirmedTrips.length > 0 ? 'Complete overview of all your trips' : 'Trips you\'ve created and planned'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setTripsFetched(false); fetchTrips(); }}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={onCreateNewTrip}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Create New Trip
                    </Button>
                  </div>
                </div>

                {trips.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {trips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full p-6 mb-4 mx-auto w-fit">
                      <MapPin className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
                    <p className="text-gray-600 mb-4">Start planning your first Korea adventure!</p>
                    <Button onClick={onCreateNewTrip}>Plan Your First Trip</Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Bookmarks Tab - Now second */}
          <TabsContent value="bookmarks" className="space-y-6">
            {/* Loading State */}
            {bookmarksLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                <p className="text-gray-600">Loading your bookmarks...</p>
              </div>
            )}

            {/* Error State */}
            {bookmarksError && !bookmarksLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-red-50 rounded-full p-4 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load bookmarks</h3>
                <p className="text-gray-600 mb-4">{bookmarksError}</p>
                <Button onClick={() => { setBookmarksFetched(false); fetchBookmarks(); }} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Content */}
            {!bookmarksLoading && !bookmarksError && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Saved Trips</h2>
                    <p className="text-gray-600">Travel plans you've bookmarked from other users</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setBookmarksFetched(false); fetchBookmarks(); }}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {bookmarks.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {bookmarks.map((bookmark) => (
                      <TripCard key={bookmark.id} trip={bookmark} isBookmarked={true} />
                    ))}
                  </div>
                ) : (
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
              </>
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
                  <div className="flex items-center gap-2">
                    {profileLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    )}
                    <Button
                      variant={isEditing ? "destructive" : "outline"}
                      onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                      className="text-[13px]"
                      disabled={profileLoading || profileSaving}
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>
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

                {/* Error message */}
                {profileError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{profileError}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-red-700 hover:text-red-800 hover:bg-red-100"
                      onClick={() => setProfileError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}

                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancelEdit} disabled={profileSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={profileSaving}>
                      {profileSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {trips.length}
                    </div>
                    <div className="text-sm text-gray-600 text-[12px]">Trips Created</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {bookmarks.length}
                    </div>
                    <div className="text-sm text-gray-600 text-[12px]">Bookmarks</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {trips.length > 0
                        ? (trips.reduce((acc, t) => acc + (t.rating || 0), 0) / trips.filter(t => t.rating).length || 0).toFixed(1)
                        : '-'}
                    </div>
                    <div className="text-sm text-gray-600 text-[12px]">Avg Rating</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {confirmedTrips.length}
                    </div>
                    <div className="text-sm text-gray-600 text-[12px]">Active Trips</div>
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
                  <div className="text-lg font-bold">{selectedTrip.views ?? 'N/A'}</div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-lg font-bold">{selectedTrip.likes ?? 'N/A'}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-lg font-bold">{selectedTrip.confirmedAt ? new Date(selectedTrip.confirmedAt).toLocaleDateString() : '-'}</div>
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
                  <h4 className="font-semibold mb-3">Itinerary</h4>
                  <div className="space-y-3">
                    {tripDetailLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">Loading itinerary...</span>
                      </div>
                    ) : selectedTrip.days && selectedTrip.days.length > 0 ? (
                      selectedTrip.days.map((day: { day: number; title: string; activities?: { time: string; activity: string; location?: string }[] }) => (
                        <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium mb-2">Day {day.day} - {day.title || 'Exploring'}</h5>
                          <div className="space-y-2 text-sm text-gray-600">
                            {day.activities && day.activities.length > 0 ? (
                              day.activities.map((activity, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="w-16 text-xs bg-gray-100 px-2 py-1 rounded">{activity.time || '--:--'}</span>
                                  <span>{activity.activity}</span>
                                  {activity.location && (
                                    <span className="text-gray-400 text-xs">@ {activity.location}</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-400 italic">No activities scheduled</div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 italic p-4 border border-dashed rounded-lg text-center">
                        No itinerary data available
                      </div>
                    )}
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
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Edit2, Eye, Save, X, Users, Star, MapPin, Plus, Loader2, AlertCircle, Calendar, Wallet } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { getRecommendedTrips, getRecommendedTripDetail, RecommendedTripResponse, RecommendedDayResponse } from '../services/tripApi';
import { useTranslation } from 'react-i18next';

// Default banner images for API data without images
const DEFAULT_BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1591366152219-48d643eb3aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW91bCUyMG1vZGVybiUyMGFyY2hpdGVjdHVyZSUyMHNreWxpbmV8ZW58MXx8fHwxNzU3NDYyODkxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1674637966553-3073f47b4610?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMGplanUlMjBpc2xhbmQlMjB2b2xjYW5vJTIwbW91bnRhaW58ZW58MXx8fHwxNzU3NDYyODk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1556974060-89c066b25199?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGtvcmVhJTIwY29hc3RhbCUyMGJlYWNoJTIwY29sb3JmdWwlMjBob3VzZXN8ZW58MXx8fHwxNzU3NDYyOTAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1704871576680-d7d8b0d07315?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdqdSUyMGtvcmVhJTIwYW5jaWVudCUyMHRlbXBsZSUyMHBhZ29kYXxlbnwxfHx8fDE3NTc0NjI5MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

interface SuggestedBannersProps {
  onBannerSelect?: (banner: any) => void;
  onBannerDetailView?: (banner: any) => void;
}

interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  duration: string;
  visitors: string;
  rating: number;
  highlights: string[];
  category: string;
  isEditable?: boolean;
  // Additional fields from API
  startDate?: string | null;
  budget?: string;
  travelStyle?: string;
  cities?: string[];
  interests?: string[];
  // Rich content from API (parsed JSON object or array for legacy)
  richContent?: {
    introduction?: string;
    highlights?: string[];
    tips?: string[];
    includes?: string[];
    excludes?: string[];
    whatToBring?: string[];
    contentBlocks?: any[];
    conclusion?: string;
  } | any[];
  // Schedule data (from API or mock)
  detailedSchedule?: any[];
}

export function SuggestedBanners({ onBannerSelect, onBannerDetailView }: SuggestedBannersProps) {
  const { t } = useTranslation('tours');
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BannerData>>({});
  const [detailBanner, setDetailBanner] = useState<BannerData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format visitors count
  const formatVisitors = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K+`;
    return String(count);
  };

  // Fetch recommended trips from API
  useEffect(() => {
    const fetchRecommendedTrips = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiTrips = await getRecommendedTrips(8);

        if (apiTrips.length > 0) {
          // Transform API response to BannerData format
          // Note: days are not included in list response, will be fetched on detail view
          const apiBanners: BannerData[] = apiTrips.map((trip, index) => ({
            id: trip.id,
            title: trip.title,
            subtitle: trip.subtitle || trip.description || `Explore Korea's ${trip.category?.toLowerCase() || 'travel'} experiences`,
            image: trip.image || trip.imageUrl || DEFAULT_BANNER_IMAGES[index % DEFAULT_BANNER_IMAGES.length],
            duration: trip.duration,
            visitors: formatVisitors(trip.visitors || trip.viewCount || 0),
            rating: trip.rating || trip.averageRating || 0,
            highlights: trip.highlights || trip.interests || [],
            category: trip.category || 'Cultural',
            isEditable: false, // API data is not editable
            startDate: null,
            budget: trip.budget,
            cities: trip.cities || [],
            // detailedSchedule will be loaded when clicking detail button
            detailedSchedule: undefined,
          }));
          setBanners(apiBanners);
        } else {
          // No data from API - show empty state (no mock data fallback)
          console.log('[SuggestedBanners] No recommended trips available from API');
          setBanners([]);
        }
      } catch (err) {
        console.error('[SuggestedBanners] Failed to fetch from API:', err);
        setError(t('curated.error'));
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedTrips();
  }, [t]);

  const handleEditBanner = (banner: BannerData) => {
    setEditingBanner(banner.id);
    setEditForm({
      title: banner.title,
      subtitle: banner.subtitle,
      duration: banner.duration,
      category: banner.category,
      highlights: banner.highlights
    });
  };

  const handleSaveEdit = () => {
    if (editingBanner && editForm) {
      setBanners(prev => prev.map(banner => 
        banner.id === editingBanner 
          ? { ...banner, ...editForm }
          : banner
      ));
      setEditingBanner(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
    setEditForm({});
  };

  const handleBannerClick = (banner: BannerData) => {
    if (editingBanner === banner.id) return;
    if (onBannerSelect) {
      // Map category to valid interest IDs
      const categoryToInterest: { [key: string]: string } = {
        'urban': 'culture',
        'nature': 'nature',
        'cultural': 'culture',
        'food': 'food',
        'historical': 'culture',
        'coastal': 'nature',
      };

      // Determine interests: use highlights if they match valid interest IDs, otherwise map from category
      const validInterests = ['food', 'local', 'kculture', 'shopping', 'culture', 'nature'];
      let interests: string[] = [];

      if (banner.highlights && banner.highlights.length > 0) {
        // Filter highlights to only valid interest IDs
        const matchedInterests = banner.highlights.filter(h =>
          validInterests.includes(h.toLowerCase())
        ).map(h => h.toLowerCase());

        if (matchedInterests.length > 0) {
          interests = matchedInterests;
        }
      }

      // Fallback to category mapping if no valid interests found
      if (interests.length === 0) {
        const mappedInterest = categoryToInterest[banner.category.toLowerCase()];
        if (mappedInterest) {
          interests = [mappedInterest];
        }
      }

      onBannerSelect({
        id: banner.id,  // Include unique ID for change detection
        name: banner.title,
        subtitle: banner.subtitle,
        // Form auto-fill parameters
        recommendedDuration: banner.duration,
        recommendedInterests: interests,
        recommendedCities: banner.cities || [],
        recommendedBudget: banner.budget || 'mid-range',
        recommendedStartDate: banner.startDate,
        // Additional info
        description: banner.subtitle,
        rating: banner.rating,
        visitors: banner.visitors,
        image: banner.image
      });
    }
  };

  const handleBannerDetail = async (banner: BannerData) => {
    // If onBannerDetailView is provided, use full page view instead of modal
    if (onBannerDetailView) {
      // For mock data with existing schedule, use it directly
      if (banner.detailedSchedule && banner.detailedSchedule.length > 0) {
        onBannerDetailView(banner);
        return;
      }

      // For API data (IDs starting with "rec_"), fetch detail from API
      if (banner.id.startsWith('rec_')) {
        setDetailLoading(true);

        try {
          const detail = await getRecommendedTripDetail(banner.id);

          // Parse richContent if it's a JSON string
          let parsedRichContent: BannerData['richContent'] | undefined;
          if (detail.richContent) {
            try {
              parsedRichContent = JSON.parse(detail.richContent);
            } catch {
              // If not valid JSON, ignore
              console.log('[SuggestedBanners] richContent is not valid JSON');
            }
          }

          // Transform API response to banner format with detailed schedule
          const detailedBanner: BannerData = {
            ...banner,
            subtitle: detail.description || banner.subtitle,
            travelStyle: detail.travelStyle || banner.travelStyle,
            richContent: parsedRichContent,
            detailedSchedule: detail.days?.map((day: RecommendedDayResponse) => ({
              day: day.dayNumber,
              title: day.title,
              activities: day.activities.map(act => ({
                time: act.activityTime || '',
                name: act.activityName,
                location: act.location || '',
                description: act.description || '',
                price: act.estimatedCost || '',
                googleMapsUrl: act.googleMapsUrl || undefined,
                isEvent: act.isEvent || false,
                eventType: act.eventType || ''
              }))
            })) || []
          };

          onBannerDetailView(detailedBanner);
        } catch (err) {
          console.error('[SuggestedBanners] Failed to fetch detail:', err);
          // Show banner without detailed schedule
          onBannerDetailView(banner);
        } finally {
          setDetailLoading(false);
        }
        return;
      }

      // No mock data fallback - just show banner without detailed schedule
      onBannerDetailView(banner);
      return;
    }

    // Fallback: Show modal dialog (for backwards compatibility)
    // For data with existing schedule, use it directly
    if (banner.detailedSchedule && banner.detailedSchedule.length > 0) {
      setDetailBanner(banner);
      return;
    }

    // For API data (IDs starting with "rec_"), fetch detail from API
    if (banner.id.startsWith('rec_')) {
      setDetailLoading(true);
      setDetailBanner(banner); // Show dialog immediately with loading state

      try {
        const detail = await getRecommendedTripDetail(banner.id);

        // Parse richContent if it's a JSON string
        let parsedRichContent: BannerData['richContent'] | undefined;
        if (detail.richContent) {
          try {
            parsedRichContent = JSON.parse(detail.richContent);
          } catch {
            console.log('[SuggestedBanners] richContent is not valid JSON');
          }
        }

        // Transform API response to banner format with detailed schedule
        const detailedBanner: BannerData = {
          ...banner,
          subtitle: detail.description || banner.subtitle,
          richContent: parsedRichContent,
          detailedSchedule: detail.days?.map((day: RecommendedDayResponse) => ({
            day: day.dayNumber,
            title: day.title,
            activities: day.activities.map(act => ({
              time: act.activityTime || '',
              name: act.activityName,
              location: act.location || '',
              description: act.description || '',
              price: act.estimatedCost || '',
              googleMapsUrl: act.googleMapsUrl || undefined,
              isEvent: act.isEvent || false,
              eventType: act.eventType || ''
            }))
          })) || []
        };

        setDetailBanner(detailedBanner);
      } catch (err) {
        console.error('[SuggestedBanners] Failed to fetch detail:', err);
        // Keep the banner without detailed schedule (will show TBD message)
      } finally {
        setDetailLoading(false);
      }
      return;
    }

    // No mock data fallback - just show banner without detailed schedule
    setDetailBanner(banner);
  };

  // Loading skeleton component
  const BannerSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-48 w-full" />
    </div>
  );

  return (
    <motion.section
      className="space-y-6 px-4 md:px-0"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900">{t('curated.title')}</h3>
        <p className="text-xs md:text-base text-gray-600 max-w-2xl mx-auto">
          {t('curated.subtitle')}
        </p>
      </div>

      {/* Error message (if using fallback data) */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {[...Array(4)].map((_, i) => <BannerSkeleton key={`skeleton-top-${i}`} />)}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {[...Array(4)].map((_, i) => <BannerSkeleton key={`skeleton-bottom-${i}`} />)}
          </div>
        </>
      ) : banners.length === 0 ? (
        // Empty state
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">{t('curated.empty.title')}</p>
          <p className="text-sm mt-1">{t('curated.empty.description')}</p>
        </div>
      ) : (
        /* Auto-scrolling Carousel */
        <div className="relative overflow-hidden">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .carousel-track {
              display: flex;
              width: fit-content;
              animation: marquee 40s linear infinite;
            }
            .carousel-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="carousel-track">
            {/* First set of banners */}
            {banners.map((banner, index) => (
              <div key={banner.id} style={{ flexShrink: 0, width: '280px', padding: '0 8px' }}>
                <BannerCard
                  banner={banner}
                  index={index}
                  isEditing={editingBanner === banner.id}
                  editForm={editForm}
                  onEdit={handleEditBanner}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  onClick={handleBannerClick}
                  onFormChange={setEditForm}
                  onDetail={handleBannerDetail}
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {banners.map((banner, index) => (
              <div key={`dup-${banner.id}`} style={{ flexShrink: 0, width: '280px', padding: '0 8px' }}>
                <BannerCard
                  banner={banner}
                  index={index + banners.length}
                  isEditing={false}
                  editForm={{}}
                  onEdit={handleEditBanner}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  onClick={handleBannerClick}
                  onFormChange={setEditForm}
                  onDetail={handleBannerDetail}
                />
              </div>
            ))}
          </div>
          {/* Gradient overlays for smooth fade effect - using bg-gray-50 (#f9fafb) */}
          <div
            className="absolute left-0 top-0 bottom-0 w-10 md:w-16 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to right, rgba(249,250,251,1) 0%, rgba(249,250,251,0.8) 30%, rgba(249,250,251,0.4) 60%, rgba(249,250,251,0) 100%)'
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-10 md:w-16 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to left, rgba(249,250,251,1) 0%, rgba(249,250,251,0.8) 30%, rgba(249,250,251,0.4) 60%, rgba(249,250,251,0) 100%)'
            }}
          />
        </div>
      )}

      {/* Auto-generation Info - Only show when there are banners */}
      {banners.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mt-6">
          <div className="flex items-start space-x-2 md:space-x-3">
            <div className="bg-blue-500 rounded-full p-1 flex-shrink-0">
              <Users className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-medium text-blue-900 mb-1">{t('curated.autoGenerated.title')}</h4>
              <p className="text-[10px] md:text-xs text-blue-700">
                {t('curated.autoGenerated.description')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {detailBanner && (
        <Dialog open={true} onOpenChange={() => setDetailBanner(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{detailBanner.title}</DialogTitle>
              <DialogDescription>
                View detailed travel schedule, highlights, and quick facts about this experience.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Hero Image */}
              <div className="relative rounded-xl overflow-hidden">
                <ImageWithFallback
                  src={detailBanner.image}
                  alt={detailBanner.title}
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-lg mb-2">{detailBanner.subtitle}</p>
                  <div className="flex items-center space-x-4 text-white text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{detailBanner.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{detailBanner.visitors} yearly visitors</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Tour Overview</h4>
                    {detailBanner.subtitle ? (
                      <p className="text-gray-700 text-sm leading-relaxed">{detailBanner.subtitle}</p>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <p className="text-gray-500 text-sm">TBD - Description coming soon</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Quick Facts</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {detailBanner.duration}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Category:</span>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {detailBanner.category}
                        </Badge>
                      </div>
                      {detailBanner.budget && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <Badge variant="outline" className="border-gray-300 text-gray-700 capitalize">
                            {detailBanner.budget}
                          </Badge>
                        </div>
                      )}
                      {detailBanner.startDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="text-gray-900 font-medium">
                            {new Date(detailBanner.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Popularity:</span>
                        <span className="text-gray-900 font-medium">{detailBanner.visitors}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-900 font-medium">{detailBanner.rating}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Top Highlights</h4>
                    <ul className="space-y-2">
                      {detailBanner.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-2 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Recommended For</h4>
                    <p className="text-gray-500 text-sm text-center">
                      TBD - Recommendation details coming soon
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Schedule Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Detailed Travel Schedule</h4>
                {detailLoading ? (
                  /* Loading state */
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
                    <p className="text-gray-500 text-sm">Loading detailed schedule...</p>
                  </div>
                ) : detailBanner.detailedSchedule && detailBanner.detailedSchedule.length > 0 ? (
                  <div className="space-y-6">
                    {detailBanner.detailedSchedule.map((daySchedule: any) => (
                      <div key={daySchedule.day} className="bg-gray-50 rounded-lg p-5">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                            {daySchedule.day}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">Day {daySchedule.day}</h5>
                            <p className="text-sm text-gray-600">{daySchedule.title}</p>
                          </div>
                        </div>
                        <div className="space-y-3 ml-11">
                          {daySchedule.activities.map((activity: any, actIndex: number) => (
                            <div key={actIndex} className="flex space-x-3">
                              <div className="flex-shrink-0 w-14 text-xs font-medium text-gray-500">
                                {activity.time}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* TBD message when detailed schedule is not available */
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <Calendar className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-amber-800 text-sm font-medium">
                      Detailed itinerary will be available soon
                    </p>
                    <p className="text-amber-600 text-xs mt-1">
                      TBD - Full day-by-day schedule coming in future update
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                  onClick={() => {
                    handleBannerClick(detailBanner);
                    setDetailBanner(null);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Apply to My Trip Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailBanner(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.section>
  );
}

interface BannerCardProps {
  banner: BannerData;
  index: number;
  isEditing: boolean;
  editForm: Partial<BannerData>;
  onEdit: (banner: BannerData) => void;
  onSave: () => void;
  onCancel: () => void;
  onClick: (banner: BannerData) => void;
  onFormChange: (form: Partial<BannerData>) => void;
  onDetail: (banner: BannerData) => void;
}

function BannerCard({ 
  banner, 
  index, 
  isEditing, 
  editForm, 
  onEdit, 
  onSave, 
  onCancel, 
  onClick, 
  onFormChange,
  onDetail
}: BannerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
      className="relative"
    >
      <Card className={`group hover:shadow-xl transition-all duration-300 border-gray-200 bg-white overflow-hidden h-full ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="relative h-48">
          <ImageWithFallback
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Action Buttons in Top Right */}
          {!isEditing && (
            <div className="absolute top-2 right-2 flex space-x-1">
              {/* View Details Button */}
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 p-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onDetail(banner);
                }}
              >
                <Eye className="h-3 w-3 text-white" />
              </Button>
              
              {/* Edit Button */}
              {banner.isEditable && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 p-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(banner);
                  }}
                >
                  <Edit2 className="h-3 w-3 text-white" />
                </Button>
              )}
            </div>
          )}

          {/* Save/Cancel Buttons for Editing */}
          {isEditing && (
            <div className="absolute top-2 right-2 flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="bg-green-500 hover:bg-green-600 text-white p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-red-500 hover:bg-red-600 text-white p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            {isEditing ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => onFormChange({ ...editForm, title: e.target.value })}
                  className="text-white bg-white/20 border-white/30 placeholder:text-white/70"
                  placeholder="Banner title"
                />
                <Textarea
                  value={editForm.subtitle || ''}
                  onChange={(e) => onFormChange({ ...editForm, subtitle: e.target.value })}
                  className="text-white bg-white/20 border-white/30 placeholder:text-white/70 text-sm"
                  placeholder="Banner subtitle"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <Input
                    value={editForm.duration || ''}
                    onChange={(e) => onFormChange({ ...editForm, duration: e.target.value })}
                    className="text-white bg-white/20 border-white/30 placeholder:text-white/70 text-xs"
                    placeholder="Duration"
                  />
                  <Select 
                    value={editForm.category || ''} 
                    onValueChange={(value) => onFormChange({ ...editForm, category: value })}
                  >
                    <SelectTrigger className="text-white bg-white/20 border-white/30 text-xs">
                      <div className="text-white">Category</div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Urban">Urban</SelectItem>
                      <SelectItem value="Nature">Nature</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Historical">Historical</SelectItem>
                      <SelectItem value="Coastal">Coastal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-bold mb-1 leading-tight line-clamp-1">{banner.title}</h3>
                <p className="text-xs text-white/90 mb-2 line-clamp-1">{banner.subtitle}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 text-xs">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{banner.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <Users className="h-3 w-3" />
                    <span>{banner.visitors}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="border-white/50 text-white bg-white/10 text-[10px] px-2 py-0.5">
                    {banner.duration}
                  </Badge>
                  <Badge variant="outline" className="border-white/50 text-white bg-white/10 text-[10px] px-2 py-0.5">
                    {banner.category}
                  </Badge>
                </div>

                {/* Apply to Form Button */}
                <Button
                  size="sm"
                  className="w-full bg-white text-black hover:bg-gray-200 text-[10px] py-0.5 h-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(banner);
                  }}
                >
                  <Plus className="h-2.5 w-2.5 mr-1" />
                  Apply to Form
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
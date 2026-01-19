import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { motion } from 'motion/react';
import {
  Calendar,
  MapPin,
  Star,
  Clock,
  DollarSign,
  ChevronRight,
  X,
  Loader2,
  Users,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getPublicRecommendedDetail, PublicRecommendedItinerary } from '@/services/recommendedApi';

interface PublicItineraryDetailModalProps {
  itineraryId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPlanTrip?: () => void;
}

export function PublicItineraryDetailModal({
  itineraryId,
  isOpen,
  onClose,
  onPlanTrip
}: PublicItineraryDetailModalProps) {
  const [itinerary, setItinerary] = useState<PublicRecommendedItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && itineraryId) {
      setLoading(true);
      setError(null);

      getPublicRecommendedDetail(itineraryId)
        .then(data => {
          setItinerary(data);
        })
        .catch(err => {
          console.error('Failed to load itinerary:', err);
          setError('Failed to load itinerary details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, itineraryId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setItinerary(null);
      setError(null);
    }
  }, [isOpen]);

  const getBudgetLabel = (budget: string) => {
    const labels: Record<string, string> = {
      'budget': 'Budget-Friendly',
      'mid-range': 'Mid-Range',
      'luxury': 'Luxury'
    };
    return labels[budget] || budget;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 text-center p-6">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : itinerary ? (
          <>
            {/* Hero Image */}
            <div className="relative h-64 sm:h-80">
              <ImageWithFallback
                src={itinerary.imageUrl || 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200'}
                alt={itinerary.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {itinerary.isFeatured && (
                  <Badge className="bg-yellow-500 text-black">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge className="bg-white/90 text-gray-800">
                  {itinerary.category}
                </Badge>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {itinerary.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-white/90">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{itinerary.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{itinerary.cities.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{itinerary.averageRating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-white/70">({itinerary.viewCount?.toLocaleString() || 0} views)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border-gray-200">
                  <CardContent className="p-3 text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                    <p className="text-sm font-medium">{itinerary.duration}</p>
                    <p className="text-xs text-gray-500">Duration</p>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-3 text-center">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                    <p className="text-sm font-medium capitalize">{getBudgetLabel(itinerary.budget)}</p>
                    <p className="text-xs text-gray-500">Budget</p>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-3 text-center">
                    <MapPin className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                    <p className="text-sm font-medium">{itinerary.cities.length} Cities</p>
                    <p className="text-xs text-gray-500">Destinations</p>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-3 text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                    <p className="text-sm font-medium">{itinerary.targetAudience || 'Everyone'}</p>
                    <p className="text-xs text-gray-500">Best For</p>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {itinerary.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                  <p className="text-gray-700 leading-relaxed">{itinerary.description}</p>
                </div>
              )}

              {/* Rich Content - Introduction */}
              {itinerary.richContent?.introduction && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{itinerary.richContent.introduction}</p>
                </div>
              )}

              {/* Interests */}
              {itinerary.interests && itinerary.interests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Trip Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary" className="capitalize">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Day-by-Day Itinerary */}
              {itinerary.days && itinerary.days.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Day-by-Day Itinerary</h3>
                  <div className="space-y-4">
                    {itinerary.days.map((day) => (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: day.day * 0.05 }}
                      >
                        <Card className="border border-gray-200 overflow-hidden">
                          <CardContent className="p-0">
                            {/* Day Header */}
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                  {day.day}
                                </div>
                                <h4 className="font-semibold text-gray-900">{day.title}</h4>
                              </div>
                            </div>

                            {/* Activities */}
                            <div className="divide-y divide-gray-100">
                              {day.activities.map((activity, idx) => (
                                <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-start gap-3">
                                    {activity.time && (
                                      <div className="flex items-center gap-1 text-gray-500 min-w-[60px]">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-xs">{activity.time}</span>
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 text-sm">{activity.activity}</p>
                                      {activity.location && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                          <MapPin className="h-3 w-3" />
                                          {activity.location}
                                        </p>
                                      )}
                                      {activity.description && (
                                        <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                      )}
                                    </div>
                                    {activity.estimatedCost && (
                                      <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {activity.estimatedCost}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rich Content - Tips */}
              {itinerary.richContent?.tips && itinerary.richContent.tips.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Travel Tips
                  </h3>
                  <ul className="space-y-2">
                    {itinerary.richContent.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rich Content - What's Included */}
              {itinerary.richContent?.includes && itinerary.richContent.includes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">What's Included</h4>
                      <ul className="space-y-1.5">
                        {itinerary.richContent.includes.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {itinerary.richContent?.excludes && itinerary.richContent.excludes.length > 0 && (
                    <Card className="border-red-200 bg-red-50/50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">What's Not Included</h4>
                        <ul className="space-y-1.5">
                          {itinerary.richContent.excludes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* CTA */}
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-600 mb-3">
                    Want a personalized version of this trip?
                  </p>
                  <Button
                    onClick={() => {
                      onClose();
                      onPlanTrip?.();
                    }}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Create Your Custom Itinerary
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

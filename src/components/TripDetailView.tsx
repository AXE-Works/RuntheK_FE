import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { MapPin, Clock, DollarSign, Calendar, Star, ExternalLink, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Info, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { ItineraryData } from '../App';

interface TripDetailViewProps {
  trip: any;
  onBack: () => void;
}

export function TripDetailView({ trip, onBack }: TripDetailViewProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [overallReview, setOverallReview] = useState('');
  const [activityRatings, setActivityRatings] = useState<{ [key: string]: number }>({});
  const [activityReviews, setActivityReviews] = useState<{ [key: string]: string }>({});
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [highlightedActivity, setHighlightedActivity] = useState<string | null>(null);

  const handleOverallRatingSubmit = () => {
    if (overallRating > 0) {
      // Save the rating to localStorage or send to backend
      const ratings = JSON.parse(localStorage.getItem('tripRatings') || '{}');
      ratings[trip.id] = {
        overallRating,
        overallReview,
        submittedAt: new Date().toISOString(),
        tripTitle: trip.title
      };
      localStorage.setItem('tripRatings', JSON.stringify(ratings));
      alert('Thank you for your review! Your feedback helps other travelers.');
    }
  };

  const handleActivityRating = (activityKey: string, rating: number) => {
    setActivityRatings(prev => ({
      ...prev,
      [activityKey]: rating
    }));
  };

  const handleActivityReviewSubmit = (activityKey: string) => {
    if (activityRatings[activityKey] > 0) {
      // Save activity rating
      const ratings = JSON.parse(localStorage.getItem('activityRatings') || '{}');
      if (!ratings[trip.id]) ratings[trip.id] = {};
      ratings[trip.id][activityKey] = {
        rating: activityRatings[activityKey],
        review: activityReviews[activityKey] || '',
        submittedAt: new Date().toISOString()
      };
      localStorage.setItem('activityRatings', JSON.stringify(ratings));
      setShowReviewDialog(false);
      setSelectedActivity(null);
    }
  };

  const generateGoogleMapsUrl = (location: string) => {
    const query = encodeURIComponent(`${location}, South Korea`);
    return `https://maps.google.com/?q=${query}`;
  };

  const generateSearchUrl = (activity: string, location: string) => {
    const query = encodeURIComponent(`${activity} ${location} Korea`);
    return `https://www.google.com/search?q=${query}`;
  };

  const generateTripAdvisorUrl = (activity: string, location: string) => {
    const query = encodeURIComponent(`${activity} ${location} Korea`);
    return `https://www.tripadvisor.com/Search?q=${query}`;
  };

  const generateYelp = (activity: string, location: string) => {
    const query = encodeURIComponent(`${activity} ${location} Korea`);
    return `https://www.yelp.com/search?find_desc=${query}`;
  };

  const RatingStars = ({ rating, onRatingChange, readonly = false }: { rating: number; onRatingChange?: (rating: number) => void; readonly?: boolean }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star 
              className={`h-5 w-5 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`} 
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
            <p className="text-gray-600">Trip Details & Review</p>
          </div>
        </div>

        {/* Trip Overview Card */}
        <Card className="bg-black text-white border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">{trip.title}</h2>
                  <div className="flex items-center space-x-4 text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{trip.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{trip.totalCost}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.cities?.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {trip.interests?.map((interest: string) => (
                      <Badge key={interest} variant="secondary" className="bg-white/20 text-white border-white/20">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge variant={trip.status === '완료' ? 'default' : 'secondary'}>
                  {trip.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Overall Trip Rating Section */}
      {trip.status === '완료' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Rate Your Overall Trip Experience</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Overall Rating</Label>
                <RatingStars rating={overallRating} onRatingChange={setOverallRating} />
              </div>
              <div className="space-y-2">
                <Label>Share Your Experience (Optional)</Label>
                <Textarea
                  value={overallReview}
                  onChange={(e) => setOverallReview(e.target.value)}
                  placeholder="Tell other travelers about your Korea trip experience..."
                  className="min-h-[100px]"
                />
              </div>
              <Button 
                onClick={handleOverallRatingSubmit}
                disabled={overallRating === 0}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Submit Trip Review
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Detailed Itinerary */}
      {trip.itineraryData && (
        <div className="space-y-12">
          {trip.itineraryData.days?.map((day: any, dayIndex: number) => (
            <motion.div 
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: dayIndex * 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Daily Map (Span 4) */}
              <div className="lg:col-span-5 xl:col-span-4 h-full">
                 <div className="sticky top-6">
                    <Card className="border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white rounded-none">
                        {/* Header Section */}
                        <div className="p-5 border-b-2 border-black bg-white">
                            <div className="flex items-start gap-4">
                                <div className="bg-black text-white w-12 h-12 flex items-center justify-center text-xl font-black shrink-0 shadow-sm">
                                    {day.day}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase leading-none tracking-tight">{day.title}</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                        {day.activities?.length || 0} STOPS • {day.activities?.length || 0} RECOMMENDED SPOTS
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="relative h-[400px] bg-gray-100 group overflow-hidden">
                           {/* Map Background */}
                           <div 
                                className="absolute inset-0 bg-cover bg-center grayscale opacity-80 transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1662140246046-fc44f41e4362?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbWFwJTIwdG9wJTIwZG93biUyMGJsYWNrJTIwYW5kJTIwd2hpdGV8ZW58MXx8fHwxNzY2MDQ1NzgxfDA&ixlib=rb-4.1.0&q=80&w=1080')` }}
                           />
                           
                           {/* Simulated Route Line */}
                           <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                                <path d="M 120 100 Q 180 150 240 120 T 320 200" stroke="black" strokeWidth="3" fill="none" strokeDasharray="6 4" />
                           </svg>

                           {/* Simulated Pins */}
                           {day.activities?.map((act: any, idx: number) => {
                               const activityKey = `${day.day}-${idx}`;
                               const isHighlighted = highlightedActivity === activityKey;

                               // Generate pseudo-random positions for demo purposes
                               // In a real app, these would be calculated from geo-coordinates relative to the map bounds
                               const leftPos = 20 + ((idx * 23) % 60);
                               const topPos = 20 + ((idx * 17) % 60);
                               
                               return (
                                  <div 
                                      key={idx}
                                      className={`absolute w-8 h-8 -ml-4 -mt-8 flex flex-col items-center group/pin cursor-pointer z-10 hover:z-20 transition-all duration-300 ${isHighlighted ? 'scale-125 z-30' : 'hover:scale-110'}`}
                                      style={{ 
                                          top: `${topPos}%`, 
                                          left: `${leftPos}%` 
                                      }}
                                      onMouseEnter={() => setHighlightedActivity(activityKey)}
                                      onMouseLeave={() => setHighlightedActivity(null)}
                                  >
                                      <div className={`border-2 border-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative transition-colors duration-300 ${isHighlighted ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                          {idx + 1}
                                      </div>
                                      <div className="w-0.5 h-3 bg-black"></div>
                                      
                                      {/* Tooltip */}
                                      <div className="absolute bottom-full mb-2 opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap z-30">
                                          <div className="bg-black text-white text-xs font-bold px-3 py-1.5 shadow-lg">
                                              {act.activity}
                                          </div>
                                      </div>
                                  </div>
                               );
                           })}
                           
                           {/* Floating Action Button */}
                           <div className="absolute bottom-5 right-5 z-20">
                                <Button className="bg-white text-black border-2 border-black hover:bg-gray-50 font-bold text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-10 px-4 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Open Full Route
                                </Button>
                           </div>
                        </div>
                    </Card>
                 </div>
              </div>

              {/* Right Column: Timeline (Span 8) */}
              <div className="lg:col-span-7 xl:col-span-8">
                 <div className="pl-6 border-l-2 border-black/10 ml-3 lg:ml-0 h-full">
                    <div className="space-y-4">
                        {day.activities?.map((activity: any, activityIndex: number) => {
                          const activityKey = `${day.day}-${activityIndex}`;
                          const hasRating = activityRatings[activityKey] > 0;
                          const isHighlighted = highlightedActivity === activityKey;
                          
                          return (
                            <motion.div 
                              key={activityIndex} 
                              onMouseEnter={() => setHighlightedActivity(activityKey)}
                              onMouseLeave={() => setHighlightedActivity(null)}
                              whileHover={{ scale: 1.01 }}
                              className={`group relative bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${isHighlighted ? 'ring-2 ring-black ring-offset-2' : ''}`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 space-y-2">
                                  {/* Time & Tag */}
                                  <div className="flex items-center flex-wrap gap-2">
                                    <div className="inline-flex items-center font-bold text-sm bg-black text-white px-2 py-1">
                                        <Clock className="h-3 w-3 mr-1.5" />
                                        {activity.time}
                                    </div>
                                    {activity.isEvent && (
                                        <div className="inline-flex items-center font-bold text-sm bg-yellow-400 text-black border border-black px-2 py-1">
                                            <Sparkles className="h-3 w-3 mr-1.5" />
                                            {activity.eventType}
                                        </div>
                                    )}
                                  </div>
                                  
                                  {/* Content */}
                                  <div>
                                      <h4 className="font-bold text-lg leading-tight">{activity.activity}</h4>
                                      <div className="flex items-center text-gray-600 text-sm mt-1 font-medium">
                                          <MapPin className="h-3.5 w-3.5 mr-1" />
                                          {activity.location}
                                      </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-700 leading-relaxed border-l-2 border-gray-200 pl-3">
                                      {activity.description}
                                  </p>

                                  {/* Action Links */}
                                  <div className="flex flex-wrap gap-2 pt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                      <a href={generateGoogleMapsUrl(activity.location)} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded-md border border-transparent hover:border-black transition-all" title="View on Maps">
                                          <MapPin className="h-4 w-4" />
                                      </a>
                                      <a href={generateSearchUrl(activity.activity, activity.location)} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded-md border border-transparent hover:border-black transition-all" title="Google Search">
                                          <Info className="h-4 w-4" />
                                      </a>
                                  </div>

                                  {/* Activity Rating Section (Conditional) */}
                                  {trip.status === '완료' && (
                                    <div className="pt-3 mt-2 border-t-2 border-dashed border-gray-200">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs font-bold uppercase text-gray-500">Rate Experience</Label>
                                          <RatingStars 
                                            rating={activityRatings[activityKey] || 0} 
                                            onRatingChange={(rating) => handleActivityRating(activityKey, rating)}
                                          />
                                        </div>
                                        {activityRatings[activityKey] > 0 && (
                                          <Dialog open={showReviewDialog && selectedActivity === activityKey} onOpenChange={(open) => {
                                            setShowReviewDialog(open);
                                            if (!open) setSelectedActivity(null);
                                          }}>
                                            <DialogTrigger asChild>
                                              <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setSelectedActivity(activityKey)}
                                                className="border-2 border-black hover:bg-black hover:text-white transition-all text-xs h-8"
                                              >
                                                <MessageSquare className="h-3 w-3 mr-1" />
                                                Write Review
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                              <DialogHeader>
                                                <DialogTitle className="font-black text-xl">Review: {activity.activity}</DialogTitle>
                                                <DialogDescription>
                                                  Share your experience and rate this activity to help other travelers
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <div>
                                                  <Label className="font-bold">Your Rating</Label>
                                                  <div className="mt-1">
                                                    <RatingStars rating={activityRatings[activityKey]} readonly />
                                                  </div>
                                                </div>
                                                <div>
                                                  <Label className="font-bold">Review (Optional)</Label>
                                                  <Textarea
                                                    value={activityReviews[activityKey] || ''}
                                                    onChange={(e) => setActivityReviews(prev => ({
                                                      ...prev,
                                                      [activityKey]: e.target.value
                                                    }))}
                                                    placeholder="Share your experience with this activity..."
                                                    className="min-h-[100px] border-2 border-black focus:ring-0 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                                                  />
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                  <Button 
                                                    variant="ghost" 
                                                    onClick={() => setShowReviewDialog(false)}
                                                  >
                                                    Cancel
                                                  </Button>
                                                  <Button 
                                                    onClick={() => handleActivityReviewSubmit(activityKey)}
                                                    className="bg-black hover:bg-gray-800 text-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                                                  >
                                                    Submit Review
                                                  </Button>
                                                </div>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Cost & Rating Badge */}
                                <div className="flex flex-col items-end gap-2">
                                    <div className="font-bold text-sm bg-gray-100 border border-black px-2 py-1 min-w-[60px] text-center">
                                        {activity.estimatedCost}
                                    </div>
                                    {hasRating && (
                                        <div className="flex items-center bg-yellow-100 px-2 py-1 border border-yellow-500 rounded-sm">
                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                                            <span className="font-bold text-xs">{activityRatings[activityKey]}</span>
                                        </div>
                                    )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Trip Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">💡 Trip Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{trip.duration}</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{trip.cities?.length || 1}</div>
                <div className="text-sm text-gray-600">Cities Visited</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{trip.totalCost}</div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{trip.interests?.length || 0}</div>
                <div className="text-sm text-gray-600">Interests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

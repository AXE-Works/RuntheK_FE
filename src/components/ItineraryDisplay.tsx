import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { MapPin, Clock, Star, ExternalLink, CheckCircle, Edit2, RotateCcw, Info, MessageSquare, Sparkles, Mail, Save, Share2, Footprints, Train, Car } from 'lucide-react';
import { ItineraryData } from '../App';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ItineraryMap } from './ItineraryMap';
import { getTranslatedTips } from '../lib/travelTips';

interface ItineraryDisplayProps {
  itinerary: ItineraryData;
  onEdit: () => void;
  onConfirm?: (itinerary: ItineraryData) => void;
  onRegenerate?: (additionalNotes: string) => void;
  startDate?: Date;
  selectedCities?: string[];
}

export function ItineraryDisplay({ itinerary, onEdit, onConfirm, onRegenerate, startDate, selectedCities }: ItineraryDisplayProps) {
  const { t } = useTranslation(['trips', 'common', 'tips']);
  const [editedTitle, setEditedTitle] = useState('');
  const [showEditTitle, setShowEditTitle] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeMapState, setActiveMapState] = useState<{ dayIndex: number; activityIndex: number; location: string } | null>(null);

  // Dynamic travel tips based on itinerary, destination, and season
  const dynamicTips = useMemo(() => {
    return getTranslatedTips(
      {
        itinerary,
        startDate,
        cities: selectedCities,
      },
      t
    );
  }, [itinerary, startDate, selectedCities, t]);

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

  const handleConfirmItinerary = () => {
    if (onConfirm) {
      onConfirm(itinerary);
    }
  };

  const handleRegenerateWithNotes = async () => {
    if (onRegenerate) {
      setIsRegenerating(true);
      try {
        await onRegenerate(editNotes);
        setShowEditDialog(false);
        setEditNotes('');
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  // Helper: Extract days from duration string ("3 days" → "3")
  const extractDays = (duration: string): string => {
    const match = duration.match(/\d+/);
    return match ? match[0] : duration;
  };

  // Helper: Format interests array to natural sentence
  // ["food", "shopping", "kculture"] → "food, shopping, and kculture"
  const formatInterests = (interests: string[]): string => {
    if (interests.length === 0) return '';
    if (interests.length === 1) return interests[0];
    if (interests.length === 2) return `${interests[0]} and ${interests[1]}`;
    return `${interests.slice(0, -1).join(', ')}, and ${interests[interests.length - 1]}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="relative overflow-hidden text-white border-0 min-h-[200px]">
          <div className="absolute inset-0">
             <ImageWithFallback
               src="https://images.unsplash.com/photo-1605972586338-d2464af3fe70?q=80&w=2000&auto=format&fit=crop"
               alt="Korean Landscape"
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-black/40" />
          </div>
          <CardContent className="relative p-4 md:p-6 z-10">
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-full max-w-2xl">
                  {/* Editable Title Section */}
                  <div className="group relative flex items-center gap-2 h-[40px]">
                    {showEditTitle ? (
                        <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
                            <input
                                autoFocus
                                type="text"
                                className="bg-black/20 backdrop-blur-sm text-white text-lg md:text-2xl font-bold border-b-2 border-white focus:border-white focus:outline-none w-full px-2 py-1 rounded-t"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        // Update the actual itinerary title
                                        itinerary.title = editedTitle;
                                        setShowEditTitle(false);
                                    }
                                    if (e.key === 'Escape') {
                                        setEditedTitle(itinerary.title);
                                        setShowEditTitle(false);
                                    }
                                }}
                            />
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-full"
                                onClick={() => {
                                    itinerary.title = editedTitle;
                                    setShowEditTitle(false);
                                }}
                            >
                                <CheckCircle className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <div 
                            className="flex items-center gap-3 cursor-pointer select-none"
                            onClick={() => {
                                setEditedTitle(itinerary.title);
                                setShowEditTitle(true);
                            }}
                        >
                            <h1 className="text-lg md:text-2xl font-bold decoration-dashed decoration-white/40 underline-offset-8 hover:underline transition-all">
                                {itinerary.title}
                            </h1>
                            <div className="bg-white/20 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30 hover:scale-110">
                                <Edit2 className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-300">
                    A {extractDays(itinerary.duration)}-day plan focused on {formatInterests(itinerary.interests)}—based on your travel pace and location flow.
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="pt-3 md:pt-4 border-t border-white/20">
                <div className="text-center mb-3 md:mb-4">
                  <p className="text-gray-300 text-xs md:text-sm">{t('trips:itinerary.actionPrompt')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
                  {onConfirm && (
                    <Button
                      size="lg"
                      className="bg-black text-white hover:bg-gray-800 text-sm md:text-base h-12 px-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase tracking-wide"
                      onClick={() => {
                        // Confirm and provide feedback
                        if (confirm(t('trips:itinerary.confirmSavePrompt'))) {
                            handleConfirmItinerary();
                        }
                      }}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {t('trips:itinerary.confirmSave')}
                    </Button>
                  )}
                  
                  <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="lg"
                        className="bg-white text-black border-2 border-black hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm md:text-base h-10 md:h-11"
                      >
                        <Edit2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        {t('trips:itinerary.modifyRegenerate')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{t('trips:itinerary.modifyTitle')}</DialogTitle>
                        <DialogDescription>
                          {t('trips:itinerary.modifyDescription')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>{t('trips:itinerary.additionalRequests')}</Label>
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder={t('trips:itinerary.placeholder')}
                            className="min-h-[120px]"
                            maxLength={500}
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{t('trips:itinerary.regenerateNote')}</span>
                            <span>{editNotes.length}/500</span>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                            disabled={isRegenerating}
                          >
                            {t('common:buttons.cancel')}
                          </Button>
                          <Button
                            onClick={handleRegenerateWithNotes}
                            disabled={isRegenerating || editNotes.trim() === ''}
                            className="bg-black hover:bg-gray-800"
                          >
                            {isRegenerating ? (
                              <>
                                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                {t('trips:itinerary.regenerating')}
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                {t('trips:itinerary.regenerateItinerary')}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Star className="h-5 w-5 text-gray-600" />
              <span>{t('trips:itinerary.tripHighlights')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-gray-900">{t('trips:itinerary.highlights.cultural')}</h3>
                <p className="text-sm text-gray-600">{t('trips:itinerary.highlights.culturalDesc')}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-gray-900">{t('trips:itinerary.highlights.local')}</h3>
                <p className="text-sm text-gray-600">{t('trips:itinerary.highlights.localDesc')}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-gray-900">{t('trips:itinerary.highlights.events')}</h3>
                <p className="text-sm text-gray-600">{t('trips:itinerary.highlights.eventsDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Itinerary */}
      <div className="space-y-6">
        {itinerary.days.map((day, dayIndex) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + dayIndex * 0.1 }}
          >
            <Card className="overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="bg-white border-b-2 border-black px-4 py-4 md:px-6 md:py-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle className="flex items-center space-x-3 text-black">
                    <div className="bg-black text-white rounded-none w-10 h-10 flex items-center justify-center text-lg font-black shadow-[3px_3px_0px_0px_rgba(150,150,150,1)]">
                      {day.day}
                    </div>
                    <div>
                        <span className="text-xl md:text-2xl font-black uppercase tracking-tight block">{day.title}</span>
                        <span className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">{t('trips:itinerary.stops', { count: day.activities.length })} • {t('trips:itinerary.recommendedSpots', { count: day.activities.filter((a: any) => !a.activity.toLowerCase().includes('breakfast')).length })}</span>
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                    {/* Map Section (Desktop: Sticky Right, Mobile: Top) */}
                    <div className="relative w-full h-[300px] lg:h-auto lg:min-h-[600px] border-b-2 lg:border-b-0 lg:border-r-2 border-black bg-gray-100 order-first lg:order-last">
                        <ItineraryMap
                            activities={day.activities}
                            activeIndex={activeMapState?.dayIndex === dayIndex ? activeMapState.activityIndex : null}
                            onMarkerClick={(index) => {
                                setActiveMapState({
                                    dayIndex,
                                    activityIndex: index,
                                    location: day.activities[index].location
                                });
                            }}
                        />
                        <div className="absolute bottom-4 right-4 z-10">
                            <a
                                href={`https://www.google.com/maps/dir/${day.activities.map((a: any) => encodeURIComponent(a.location)).join('/')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <MapPin className="h-3 w-3 mr-2" />
                                {t('trips:itinerary.openFullRoute')}
                            </a>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="relative p-4 md:p-6 bg-gray-50/50 h-full">
                        <div className="relative pl-2">
                            {/* Vertical Route Line */}
                            <div className="absolute left-[19px] top-4 bottom-4 w-[4px] bg-black/10 rounded-full" />
                            
                            <div className="space-y-4">
                                {day.activities.map((activity: any, activityIndex: number) => (
                                <React.Fragment key={activityIndex}>
                                    {/* Transport Mode Indicator (between activities) */}
                                    {activityIndex > 0 && activity.transportMode && (
                                        <div className="relative flex gap-4 pl-[3px]">
                                            <div className="flex-none w-10 flex justify-center">
                                                <div
                                                    className="flex items-center justify-center w-8 h-8 rounded-full border-2"
                                                    style={{
                                                        borderColor: activity.transportMode === 'walking' ? '#3B82F6' : activity.transportMode === 'transit' ? '#10B981' : '#EF4444',
                                                        backgroundColor: activity.transportMode === 'walking' ? '#EFF6FF' : activity.transportMode === 'transit' ? '#ECFDF5' : '#FEF2F2',
                                                    }}
                                                >
                                                    {activity.transportMode === 'walking' && <Footprints className="h-4 w-4 text-blue-500" />}
                                                    {activity.transportMode === 'transit' && <Train className="h-4 w-4 text-green-500" />}
                                                    {activity.transportMode === 'driving' && <Car className="h-4 w-4 text-red-500" />}
                                                </div>
                                            </div>
                                            <div
                                                className="flex-1 px-3 py-2 rounded text-xs"
                                                style={{
                                                    backgroundColor: activity.transportMode === 'walking' ? '#EFF6FF' : activity.transportMode === 'transit' ? '#ECFDF5' : '#FEF2F2',
                                                    color: activity.transportMode === 'walking' ? '#1D4ED8' : activity.transportMode === 'transit' ? '#059669' : '#DC2626',
                                                }}
                                            >
                                                <div className="font-medium">
                                                    {activity.transportMode === 'walking' && `🚶 ${t('trips:itinerary.transport.walk')}`}
                                                    {activity.transportMode === 'transit' && `🚇 ${t('trips:itinerary.transport.transit')}`}
                                                    {activity.transportMode === 'driving' && `🚗 ${t('trips:itinerary.transport.drive')}`}
                                                    {activity.transportDuration && ` · ${activity.transportDuration} min`}
                                                    {activity.transportDistance && ` · ${activity.transportDistance} km`}
                                                    {activity.transportCost && ` · ${activity.transportCost}`}
                                                </div>
                                                {activity.transportDetails && (
                                                    <div className="mt-1 opacity-80 text-[11px]">
                                                        {activity.transportDetails}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                <motion.div
                                    className="relative flex gap-4 group"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: activityIndex * 0.1 }}
                                    onMouseEnter={() => setActiveMapState({ dayIndex, activityIndex, location: activity.location })}
                                    onMouseLeave={() => setActiveMapState(null)}
                                >
                                    {/* Timeline Marker */}
                                    <div className="relative z-10 flex-none pt-1">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-black text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${activity.isEvent ? 'bg-black text-white' : activeMapState?.dayIndex === dayIndex && activeMapState?.activityIndex === activityIndex ? 'bg-yellow-400 text-black' : 'bg-white group-hover:bg-black group-hover:text-white'}`}>
                                        {activityIndex + 1}
                                    </div>
                                    </div>

                                    {/* Compact Activity Card */}
                                    <div className={`flex-1 border-2 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 relative cursor-pointer ${activity.isEvent ? 'bg-yellow-100' : activeMapState?.dayIndex === dayIndex && activeMapState?.activityIndex === activityIndex ? 'bg-yellow-50' : 'bg-white'}`} onClick={() => setActiveMapState({ dayIndex, activityIndex, location: activity.location })}>
                                        {/* Connector */}
                                        <div className="absolute top-4 left-[-10px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-black border-b-[6px] border-b-transparent" />
                                        <div className={`absolute top-4 left-[-7px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-b-[6px] border-b-transparent ${activity.isEvent ? 'border-r-yellow-100' : 'border-r-white'}`} />

                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className={`h-5 rounded-none border border-black font-bold px-1.5 text-black text-[10px] ${activity.isEvent ? 'bg-white' : 'bg-yellow-300'}`}>
                                                        {activity.time}
                                                    </Badge>
                                                    {activity.isEvent && (
                                                        <Badge className="h-5 rounded-none border border-black bg-black text-white text-[10px]">
                                                            {t('trips:itinerary.event')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-base leading-tight">{activity.activity}</h4>
                                            </div>
                                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 border border-black whitespace-nowrap">
                                                {activity.estimatedCost}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center text-xs font-bold text-gray-500 mb-2 truncate">
                                            <MapPin className="h-3 w-3 mr-1 text-black flex-shrink-0" />
                                            <span className="truncate">{activity.location}</span>
                                        </div>
                                        
                                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                            {activity.description}
                                        </p>

                                        {/* Ultra Compact Actions */}
                                        <div className="flex gap-2">
                                            <a
                                                href={activity.googleMapsUrl || generateGoogleMapsUrl(activity.location)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center px-2 py-1.5 text-[10px] font-bold border border-black bg-white hover:bg-gray-50"
                                            >
                                                <MapPin className="h-3 w-3 mr-1" /> {t('trips:itinerary.map')}
                                            </a>
                                            <a
                                                href={generateSearchUrl(activity.activity, activity.location)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center px-2 py-1.5 text-[10px] font-bold border border-black bg-white hover:bg-gray-50"
                                            >
                                                <Info className="h-3 w-3 mr-1" /> {t('trips:itinerary.info')}
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                                </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Travel Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">💡 {t('tips:title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {(itinerary.travelTips && itinerary.travelTips.length > 0
                ? itinerary.travelTips
                : dynamicTips.length > 0
                  ? dynamicTips
                  : [
                      t('tips:items.language'),
                      t('tips:items.transportation'),
                      t('tips:items.cash'),
                      t('tips:items.tipping'),
                      t('tips:items.wifi'),
                    ]
              ).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="flex justify-center space-x-4 pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Button
          variant="outline"
          size="icon"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 w-12"
          title={t('trips:itinerary.actions.email')}
        >
          <Mail className="h-5 w-5" />
        </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 w-12"
            title={t('trips:itinerary.actions.download')}
            onClick={async () => {
              try {
                const html2canvas = (await import('html2canvas')).default;
                const { jsPDF } = await import('jspdf');
                
                const content = document.querySelector('.max-w-4xl') as HTMLElement;
                if (!content) {
                    alert(t('trips:itinerary.contentNotFound'));
                    return;
                }
                
                document.body.style.cursor = 'wait';

                // Robust style inliner to survive "oklch" errors
                const inlineAllStyles = (source: HTMLElement, target: HTMLElement) => {
                    const computed = window.getComputedStyle(source);
                    
                    // We must copy pretty much everything to be safe if we are nuking stylesheets
                    const styleProps = [
                        'color', 'background', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
                        'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
                        'borderColor', 'borderRadius', 'borderWidth', 'borderStyle',
                        'font', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'textAlign', 'textTransform', 'textDecoration', 'letterSpacing',
                        'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                        'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
                        'display', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
                        'flex', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent', 'gap', 'order', 'flexGrow', 'flexShrink', 'flexBasis',
                        'grid', 'gridTemplateColumns', 'gridTemplateRows', 'gridGap',
                        'opacity', 'visibility', 'zIndex', 'boxShadow', 'overflow', 'whiteSpace', 'verticalAlign',
                        'transform', 'transformOrigin', 'float', 'clear', 'listStyle'
                    ];

                    styleProps.forEach(prop => {
                        const val = computed[prop as any];
                        if (val) {
                             // CRITICAL: Check if value contains "oklch". If so, we are in trouble because 
                             // getComputedStyle SHOULD have resolved it. If it didn't, we skip it or force black.
                             if (typeof val === 'string' && val.includes('oklch')) {
                                 // Fallback for browsers that might return unresolved vars (rare but possible)
                                 (target.style as any)[prop] = '#000000'; 
                             } else {
                                 (target.style as any)[prop] = val;
                             }
                        }
                    });

                    // Recursion
                    for (let i = 0; i < source.children.length; i++) {
                        if (target.children[i]) {
                            inlineAllStyles(source.children[i] as HTMLElement, target.children[i] as HTMLElement);
                        }
                    }
                };

                const canvas = await html2canvas(content, {
                  scale: 2,
                  useCORS: true,
                  logging: false,
                  windowWidth: 1280,
                  ignoreElements: (element) => element.tagName === 'IFRAME',
                  onclone: (clonedDoc) => {
                    // 1. NUKE ALL STYLESHEETS
                    // This is the only way to guarantee html2canvas doesn't try to parse 
                    // the Tailwind CSS file containing "oklch"
                    const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
                    styles.forEach(s => s.remove());

                    const clonedContent = clonedDoc.querySelector('.max-w-4xl') as HTMLElement;
                    if (clonedContent) {
                      // 2. Expand scrollable areas
                      const scrollables = clonedContent.querySelectorAll('.overflow-y-auto, [class*="max-h-"]');
                      scrollables.forEach((el) => {
                        (el as HTMLElement).style.overflow = 'visible';
                        (el as HTMLElement).style.height = 'auto';
                        (el as HTMLElement).style.maxHeight = 'none';
                      });

                      // 3. INLINE ALL COMPUTED STYLES
                      // Since we removed stylesheets, we must manually apply all computed styles 
                      // from the original document to the clone.
                      inlineAllStyles(content, clonedContent);
                      
                      // 4. Force white background just in case
                      clonedContent.style.backgroundColor = '#ffffff';
                      clonedContent.style.color = '#000000';
                    }
                  }
                });
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pdfWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                let heightLeft = imgHeight;
                let position = 0;
                
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
                
                while (heightLeft >= 0) {
                  position = heightLeft - imgHeight;
                  pdf.addPage();
                  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                  heightLeft -= pdfHeight;
                }
                
                pdf.save('RuntheK_Itinerary.pdf');
                document.body.style.cursor = 'default';
                
              } catch (error) {
                console.error('PDF Generation Error:', error);
                document.body.style.cursor = 'default';
                alert(t('trips:itinerary.pdfFailed'));
              }
            }}
          >
            <Save className="h-5 w-5" />
          </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 w-12"
          title={t('trips:itinerary.actions.share')}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
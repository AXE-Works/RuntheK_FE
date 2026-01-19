import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Star, Users, MapPin, Calendar, DollarSign, Plus, Type, Image as ImageIcon, Video, List, Lightbulb, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GoogleMap } from './GoogleMap';
import { motion } from 'motion/react';

interface RichContentItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'heading' | 'list' | 'highlight' | 'tip' | 'included' | 'excluded';
  content: string;
  caption?: string;
  items?: string[];
}

interface BannerDetailPageProps {
  banner: any;
  onBack: () => void;
  onApplyToTrip?: (banner: any) => void;
}

export function BannerDetailPage({ banner, onBack, onApplyToTrip }: BannerDetailPageProps) {
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Buttons Row */}
          <div className="flex items-center justify-between mb-[26px] mt-[0px] mr-[0px] ml-[0px]">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-2 border-black hover:bg-black hover:text-white transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {onApplyToTrip && (
              <Button
                onClick={() => onApplyToTrip(banner)}
                className="bg-black text-white hover:bg-gray-800 border-2 border-black text-[12px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Apply to Trip
              </Button>
            )}
          </div>

          {/* Title Row */}
          <h1 className="text-xl md:text-2xl font-bold text-center px-[0px] py-[8px] text-[22px]">{banner.title}</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-100">
        <ImageWithFallback
          src={banner.image}
          alt={banner.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h2 className="text-3xl md:text-5xl font-black text-white">{banner.title}</h2>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl">{banner.subtitle}</p>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-white/30">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-bold">{banner.rating}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-white/30">
                  <Users className="h-5 w-5 text-white" />
                  <span className="text-white font-bold">{banner.visitors} visitors</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-white/30">
                  <Calendar className="h-5 w-5 text-white" />
                  <span className="text-white font-bold">{banner.duration}</span>
                </div>
                <Badge className="bg-white text-black border-2 border-white font-bold px-4 py-2 text-sm">
                  {banner.category}
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="bg-black text-white p-6 border-b-4 border-black">
                <h3 className="text-2xl font-black uppercase">Overview</h3>
              </div>
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed text-lg text-[14px]">
                  {banner.subtitle || banner.description || `Explore the best of ${banner.title}`}
                </p>
              </div>
            </motion.section>

            {/* Rich Content Section */}
            {banner.richContent && banner.richContent.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="border-b-4 border-black pb-4">
                  <h3 className="text-3xl font-black uppercase flex items-center gap-3">
                    <Sparkles className="h-8 w-8" />
                    Rich Content
                  </h3>
                  <p className="text-gray-600 mt-2">Detailed travel information and useful tips</p>
                </div>

                <div className="space-y-6">
                  {banner.richContent.map((item: RichContentItem, index: number) => {
                    // Handle both single items and array-based content
                    const itemContent = item.content;
                    const itemItems = item.items;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                      >
                        {/* Heading Block */}
                        {item.type === 'heading' && (
                          <div className="border-l-4 border-black pl-6 py-2">
                            <h2 className="text-2xl font-black uppercase">{itemContent}</h2>
                          </div>
                        )}

                        {/* Text Block */}
                        {item.type === 'text' && (
                          <div className="border-l-4 border-gray-400 pl-6 py-2">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg text-[13px]">
                              {itemContent}
                            </p>
                          </div>
                        )}

                        {/* Image Block */}
                        {item.type === 'image' && itemContent && (
                          <div className="border-2 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <img
                              src={itemContent}
                              alt={item.caption || 'Content image'}
                              className="w-full h-96 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                              }}
                            />
                            {item.caption && (
                              <div className="p-4 bg-gray-50 border-t-2 border-black">
                                <p className="text-sm text-gray-600">{item.caption}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* List Block - supports both 'items' and 'content' array */}
                        {item.type === 'list' && (itemItems || (Array.isArray(itemContent) && itemContent.length > 0)) && (
                          <div className="bg-gray-50 border-2 border-black p-6">
                            <ul className="space-y-2">
                              {(itemItems || itemContent as string[]).map((listItem: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-800">
                                  <span className="font-bold">•</span>
                                  <span>{listItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Highlights Block - array of items displayed as a section */}
                        {item.type === 'highlights' && (itemItems || (Array.isArray(itemContent) && itemContent.length > 0)) && (
                          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-xl font-bold mb-4 uppercase flex items-center gap-2">
                              <Star className="h-5 w-5" />
                              Top Highlights
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(itemItems || itemContent as string[]).map((highlight: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="font-bold">✓</span>
                                  <span className="text-gray-800 text-[14px]">{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tips Block - array of items */}
                        {item.type === 'tips' && (itemItems || (Array.isArray(itemContent) && itemContent.length > 0)) && (
                          <div className="bg-gray-50 border-2 border-black p-6">
                            <h3 className="text-xl font-bold mb-4 uppercase flex items-center gap-2">
                              <Lightbulb className="h-5 w-5" />
                              Travel Tips
                            </h3>
                            <ul className="space-y-2">
                              {(itemItems || itemContent as string[]).map((tip: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-800">
                                  <span className="font-bold">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Includes Block */}
                        {(item.type === 'includes' || item.type === 'included') && (itemItems || (Array.isArray(itemContent) && itemContent.length > 0)) && (
                          <div className="border-2 border-black bg-white p-6">
                            <h3 className="text-lg font-bold mb-4 uppercase flex items-center gap-2">
                              <CheckCircle className="h-5 w-5" />
                              What's Included
                            </h3>
                            <ul className="space-y-2">
                              {(itemItems || itemContent as string[]).map((includedItem: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="font-bold">✓</span>
                                  <span>{includedItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Excludes Block */}
                        {(item.type === 'excludes' || item.type === 'excluded') && (itemItems || (Array.isArray(itemContent) && itemContent.length > 0)) && (
                          <div className="border-2 border-black bg-gray-50 p-6">
                            <h3 className="text-lg font-bold mb-4 uppercase flex items-center gap-2">
                              <XCircle className="h-5 w-5" />
                              What's Excluded
                            </h3>
                            <ul className="space-y-2">
                              {(itemItems || itemContent as string[]).map((excludedItem: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="font-bold">✗</span>
                                  <span>{excludedItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Single Highlight Block (legacy support) */}
                        {item.type === 'highlight' && typeof itemContent === 'string' && (
                          <div className="bg-black text-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="h-6 w-6" />
                              <span className="font-black uppercase text-sm">Highlight</span>
                            </div>
                            <p className="font-bold text-xl leading-relaxed whitespace-pre-wrap">
                              {itemContent}
                            </p>
                          </div>
                        )}

                        {/* Single Tip Block (legacy support) */}
                        {item.type === 'tip' && typeof itemContent === 'string' && (
                          <div className="bg-gray-50 border-2 border-black p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <Lightbulb className="h-6 w-6" />
                              <span className="font-black uppercase text-sm">Travel Tip</span>
                            </div>
                            <p className="font-medium text-lg leading-relaxed whitespace-pre-wrap">
                              {itemContent}
                            </p>
                          </div>
                        )}

                        {/* Video Block */}
                        {item.type === 'video' && itemContent && (
                          <div className="border-2 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="p-4 bg-black text-white border-b-2 border-black flex items-center gap-2">
                              <Video className="h-5 w-5" />
                              <span className="font-bold uppercase text-sm">Video</span>
                            </div>
                            <div className="aspect-video bg-black">
                              <iframe
                                src={itemContent}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                            {item.caption && (
                              <div className="p-4 bg-gray-50 border-t-2 border-black">
                                <p className="text-sm text-gray-600">{item.caption}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* Detailed Schedule Section */}
            {banner.detailedSchedule && banner.detailedSchedule.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-3">
                  Day-by-Day Itinerary
                </h3>

                <div className="space-y-6">
                  {banner.detailedSchedule.map((daySchedule: any, dayIndex: number) => (
                    <motion.div
                      key={daySchedule.day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + dayIndex * 0.1 }}
                      className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                    >
                      {/* Day Header */}
                      <div className="bg-white border-b-2 border-black px-4 py-4 md:px-6 md:py-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center space-x-3 text-black">
                            <div className="bg-black text-white rounded-none w-10 h-10 flex items-center justify-center text-lg font-black shadow-[3px_3px_0px_0px_rgba(150,150,150,1)]">
                              {daySchedule.day}
                            </div>
                            <div>
                              <span className="text-xl md:text-2xl font-black uppercase tracking-tight block">
                                DAY {daySchedule.day} - {daySchedule.title}
                              </span>
                              <span className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">
                                {daySchedule.activities?.length || 0} STOPS • {daySchedule.activities?.filter((a: any) => !a.name.toLowerCase().includes('breakfast')).length || 0} RECOMMENDED SPOTS
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                        {/* Timeline Section (Left on Desktop, Top on Mobile) */}
                        <div className="p-4 md:p-6 space-y-4 order-last lg:order-first">
                          {daySchedule.activities && daySchedule.activities.map((activity: any, activityIndex: number) => (
                            <motion.div
                              key={activityIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: activityIndex * 0.1 }}
                              className="relative flex gap-4"
                            >
                              {/* Timeline Marker */}
                              <div className="relative z-10 flex-none pt-1">
                                <div className={`w-10 h-10 rounded-full border-4 border-black flex items-center justify-center font-black text-sm shadow-[3px_3px_0px_0px_rgba(150,150,150,1)] ${
                                  activity.isEvent ? 'bg-yellow-400' : 'bg-white'
                                }`}>
                                  {activityIndex + 1}
                                </div>
                                {activityIndex < (daySchedule.activities?.length || 0) - 1 && (
                                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-1 h-full bg-gray-300" />
                                )}
                              </div>

                              {/* Activity Card */}
                              <div className={`flex-1 border-2 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 relative cursor-pointer ${
                                activity.isEvent ? 'bg-yellow-100' : 'bg-white'
                              }`}>
                                {/* Connector Arrow */}
                                <div className="absolute top-4 left-[-10px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-black border-b-[6px] border-b-transparent" />
                                <div className={`absolute top-4 left-[-7px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-b-[6px] border-b-transparent ${
                                  activity.isEvent ? 'border-r-yellow-100' : 'border-r-white'
                                }`} />

                                {/* Event Badge */}
                                {activity.isEvent && (
                                  <div className="absolute top-2 right-2 bg-black text-white text-[10px] font-black px-2 py-1 rounded">
                                    EVENT
                                  </div>
                                )}

                                {/* Time Badge */}
                                <div className="inline-block bg-yellow-400 text-black border-2 border-black px-2 py-1 text-xs font-black mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  {activity.time}
                                </div>

                                {/* Activity Title */}
                                <h4 className="font-black text-base md:text-lg mb-1 text-black">
                                  {activity.name}
                                </h4>

                                {/* Location */}
                                <div className="flex items-start gap-1 text-xs text-gray-600 mb-2">
                                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span className="font-medium">{activity.location || 'Various'}</span>
                                </div>

                                {/* Description */}
                                <p className="text-xs md:text-sm text-gray-700 mb-3 line-clamp-2">
                                  {activity.description}
                                </p>

                                {/* Price */}
                                {activity.price && (
                                  <div className="inline-block border-2 border-black px-2 py-1 text-xs font-black mb-3">
                                    {activity.price}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold border-2 border-black bg-white hover:bg-black hover:text-white transition-colors">
                                    <MapPin className="h-3 w-3" />
                                    Map
                                  </button>
                                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold border-2 border-black bg-white hover:bg-black hover:text-white transition-colors">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Info
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Map Section (Right on Desktop, Top on Mobile) */}
                        <div className="relative w-full h-[300px] lg:h-auto lg:min-h-[600px] border-b-2 lg:border-b-0 lg:border-l-2 border-black bg-gray-100 order-first lg:order-last">
                          <GoogleMap
                            activities={daySchedule.activities}
                            height="100%"
                            showRoute={true}
                            zoom={13}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-24"
            >
              <h4 className="font-black text-lg mb-4 uppercase">Top Highlights</h4>
              <ul className="space-y-3">
                {banner.highlights.map((highlight: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t-2 border-gray-200 space-y-4">
                <h4 className="font-black text-lg uppercase">Quick Facts</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Duration:</span>
                    <Badge variant="outline" className="border-2 border-black font-bold">
                      {banner.duration}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Category:</span>
                    <Badge variant="outline" className="border-2 border-black font-bold">
                      {banner.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{banner.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Popularity:</span>
                    <span className="font-bold">{banner.visitors}</span>
                  </div>
                </div>
              </div>

              {onApplyToTrip && (
                <Button
                  onClick={() => onApplyToTrip(banner)}
                  className="w-full mt-6 bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Apply to My Trip
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-black text-white py-12 mt-12 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <h3 className="text-2xl md:text-3xl font-black uppercase">Ready to Start Your Adventure?</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Click "Apply to My Trip" to automatically fill your travel form with this itinerary
          </p>
          {onApplyToTrip && (
            <Button
              onClick={() => onApplyToTrip(banner)}
              size="lg"
              className="bg-white text-black hover:bg-gray-200 border-2 border-white font-bold shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Apply to My Trip Plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

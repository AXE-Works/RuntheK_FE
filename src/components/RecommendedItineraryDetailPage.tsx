/**
 * RecommendedItineraryDetailPage
 *
 * 추천 여행일정 상세 페이지
 * - AdminItineraryEditor의 미리보기 탭 디자인을 레퍼런스로 함
 * - 네오브루탈리즘 디자인 시스템
 * - Rich Content (contentBlocks) 완전 지원
 * - Day별 구글맵 UI 통합
 * - Apply to my trip plan 기능
 */

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  Navigation
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GoogleMap } from './GoogleMap';
import { motion, AnimatePresence } from 'motion/react';

// ContentBlock 형식 - AdminItineraryEditor와 동일
interface ContentBlock {
  id: string;
  type: 'heading' | 'text' | 'image' | 'list' | 'highlights' | 'tips' | 'includes' | 'excludes' | 'whatToBring';
  content: string | string[];
  title?: string;
}

// RichContent 전체 구조 (백엔드 저장 형식)
interface RichContentData {
  introduction?: string;
  highlights?: string[];
  tips?: string[];
  includes?: string[];
  excludes?: string[];
  whatToBring?: string[];
  contentBlocks?: ContentBlock[];
}

interface Activity {
  time: string;
  name: string;
  location: string;
  description: string;
  price?: string;
  googleMapsUrl?: string;
  isEvent?: boolean;
  eventType?: string;
}

interface DaySchedule {
  day: number;
  title: string;
  activities: Activity[];
}

interface RecommendedItineraryDetailPageProps {
  banner: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    image: string;
    duration: string;
    visitors: string;
    rating: number;
    highlights: string[];
    category: string;
    cities?: string[];
    budget?: string;
    travelStyle?: string;
    interests?: string[];
    startDate?: string | null;
    richContent?: ContentBlock[] | RichContentData;
    detailedSchedule?: DaySchedule[];
  };
  onBack: () => void;
  onApplyToTrip?: (banner: any) => void;
}

export function RecommendedItineraryDetailPage({
  banner,
  onBack,
  onApplyToTrip
}: RecommendedItineraryDetailPageProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1])); // Day 1 expanded by default
  const [selectedDayForMap, setSelectedDayForMap] = useState<number>(1);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Normalize richContent to ContentBlock[] format
   * Handles both legacy array format and new object format with contentBlocks
   * Converts string content to arrays for list-type blocks
   */
  const getContentBlocks = (): ContentBlock[] => {
    if (!banner.richContent) return [];

    // Helper to convert string content to array (split by newline)
    const normalizeContent = (content: string | string[], type: string): string | string[] => {
      const listTypes = ['list', 'highlights', 'tips', 'includes', 'excludes', 'whatToBring'];
      if (listTypes.includes(type) && typeof content === 'string') {
        return content.split('\n').filter(item => item.trim() !== '');
      }
      return content;
    };

    // Check if it's already an array (legacy format)
    if (Array.isArray(banner.richContent)) {
      // Normalize content in legacy blocks too
      return banner.richContent.map(block => ({
        ...block,
        content: normalizeContent(block.content, block.type)
      }));
    }

    // It's the new object format with contentBlocks
    const richData = banner.richContent as RichContentData;
    const blocks: ContentBlock[] = [];

    // Add introduction as text block if exists
    if (richData.introduction) {
      blocks.push({
        id: 'intro',
        type: 'text',
        content: richData.introduction
      });
    }

    // Add highlights if exists and not in contentBlocks
    if (richData.highlights && richData.highlights.length > 0) {
      blocks.push({
        id: 'highlights',
        type: 'highlights',
        content: richData.highlights
      });
    }

    // Add tips if exists
    if (richData.tips && richData.tips.length > 0) {
      blocks.push({
        id: 'tips',
        type: 'tips',
        content: richData.tips
      });
    }

    // Add includes if exists
    if (richData.includes && richData.includes.length > 0) {
      blocks.push({
        id: 'includes',
        type: 'includes',
        content: richData.includes
      });
    }

    // Add excludes if exists
    if (richData.excludes && richData.excludes.length > 0) {
      blocks.push({
        id: 'excludes',
        type: 'excludes',
        content: richData.excludes
      });
    }

    // Add whatToBring if exists
    if (richData.whatToBring && richData.whatToBring.length > 0) {
      blocks.push({
        id: 'whatToBring',
        type: 'whatToBring',
        content: richData.whatToBring
      });
    }

    // Add contentBlocks if exists (these take precedence for detailed content)
    if (richData.contentBlocks && richData.contentBlocks.length > 0) {
      // Filter out duplicates based on type
      const existingTypes = new Set(blocks.map(b => b.type));
      richData.contentBlocks.forEach(block => {
        // Normalize content (convert string to array for list-type blocks)
        const normalizedBlock: ContentBlock = {
          ...block,
          content: normalizeContent(block.content, block.type)
        };

        // For array-type blocks, check if we already added from top-level
        if (['highlights', 'tips', 'includes', 'excludes', 'whatToBring'].includes(block.type)) {
          if (!existingTypes.has(block.type)) {
            blocks.push(normalizedBlock);
          }
        } else {
          blocks.push(normalizedBlock);
        }
      });
    }

    return blocks;
  };

  const contentBlocks = getContentBlocks();

  // Toggle day expansion
  const toggleDayExpand = (dayNum: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayNum)) {
        newSet.delete(dayNum);
      } else {
        newSet.add(dayNum);
      }
      return newSet;
    });
  };

  // Get activities for selected day (for map)
  const getActivitiesForMap = () => {
    const day = banner.detailedSchedule?.find(d => d.day === selectedDayForMap);
    return day?.activities || [];
  };

  // Extract duration number for display
  const getDurationDays = () => {
    const match = banner.duration.match(/\d+/);
    return match ? parseInt(match[0]) : banner.detailedSchedule?.length || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-2 border-black hover:bg-black hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back
            </Button>

            {onApplyToTrip && (
              <Button
                onClick={() => onApplyToTrip(banner)}
                className="bg-black text-white hover:bg-gray-800 border-2 border-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Apply to Trip
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Image Section */}
      <section className="relative w-full h-64 bg-gray-200 border-b-4 border-black overflow-hidden">
        {banner.image ? (
          <ImageWithFallback
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <MapPin className="h-24 w-24 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title & Meta Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border-4 border-black p-6 md:p-8 mb-8"
        >
          {/* Title with Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-2xl md:text-3xl font-black uppercase text-balance">
              {banner.title || 'Untitled Itinerary'}
            </h1>
            {banner.category && (
              <Badge className="bg-black text-white border-2 border-black rounded-none font-bold">
                {banner.category}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-6 text-pretty">
            {banner.subtitle || banner.description || 'Explore the best of Korea'}
          </p>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-2 border-black p-4">
              <Calendar className="h-5 w-5 mb-2" aria-hidden="true" />
              <p className="text-xs text-gray-500 uppercase font-medium">Duration</p>
              <p className="font-bold text-lg" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {getDurationDays()} days
              </p>
            </div>
            <div className="border-2 border-black p-4">
              <MapPin className="h-5 w-5 mb-2" aria-hidden="true" />
              <p className="text-xs text-gray-500 uppercase font-medium">Cities</p>
              <p className="font-bold truncate" title={banner.cities?.join(', ') || 'N/A'}>
                {banner.cities?.join(', ') || 'N/A'}
              </p>
            </div>
            <div className="border-2 border-black p-4">
              <Clock className="h-5 w-5 mb-2" aria-hidden="true" />
              <p className="text-xs text-gray-500 uppercase font-medium">Travel Style</p>
              <p className="font-bold">{banner.travelStyle || 'N/A'}</p>
            </div>
            <div className="border-2 border-black p-4">
              <Star className="h-5 w-5 mb-2" aria-hidden="true" />
              <p className="text-xs text-gray-500 uppercase font-medium">Rating</p>
              <p className="font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {banner.rating?.toFixed(1) || '0.0'} / 5
              </p>
            </div>
          </div>

          {/* Interests Tags */}
          {banner.interests && banner.interests.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {banner.interests.map((interest) => (
                <span
                  key={interest}
                  className="text-xs bg-black text-white px-3 py-1.5 font-bold uppercase"
                >
                  #{interest}
                </span>
              ))}
            </div>
          )}
        </motion.section>

        {/* Rich Content Section */}
        {contentBlocks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="border-b-4 border-black pb-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3">
                <Sparkles className="h-7 w-7" aria-hidden="true" />
                About This Trip
              </h2>
              <p className="text-gray-600 mt-2">Detailed information and travel tips</p>
            </div>

            <div className="space-y-6">
              {contentBlocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                >
                  {/* Heading Block */}
                  {block.type === 'heading' && (
                    <div className="border-l-4 border-black pl-6 py-2">
                      <h3 className="text-xl md:text-2xl font-black uppercase text-balance">
                        {block.content as string}
                      </h3>
                    </div>
                  )}

                  {/* Text Block */}
                  {block.type === 'text' && (
                    <div className="border-l-4 border-gray-400 pl-6 py-2">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {block.content as string}
                      </p>
                    </div>
                  )}

                  {/* Image Block */}
                  {block.type === 'image' && block.content && (
                    <div className="border-2 border-black overflow-hidden">
                      <img
                        src={block.content as string}
                        alt="Travel content"
                        className="w-full h-80 object-cover"
                        width={800}
                        height={320}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                        }}
                      />
                    </div>
                  )}

                  {/* List Block */}
                  {block.type === 'list' && Array.isArray(block.content) && block.content.length > 0 && (
                    <div className="bg-gray-50 border-2 border-black p-6">
                      <ul className="space-y-2">
                        {block.content.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-800">
                            <span className="font-bold mt-0.5" aria-hidden="true">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Highlights Block */}
                  {block.type === 'highlights' && Array.isArray(block.content) && block.content.length > 0 && (
                    <div className="bg-yellow-50 border-2 border-black p-6">
                      <h4 className="text-lg font-bold mb-4 uppercase flex items-center gap-2">
                        <Star className="h-5 w-5" aria-hidden="true" />
                        Top Highlights
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {block.content.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-600 font-bold" aria-hidden="true">✓</span>
                            <span className="text-gray-800">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tips Block */}
                  {block.type === 'tips' && Array.isArray(block.content) && block.content.length > 0 && (
                    <div className="bg-blue-50 border-2 border-black p-6">
                      <h4 className="text-lg font-bold mb-4 uppercase flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" aria-hidden="true" />
                        Travel Tips
                      </h4>
                      <ul className="space-y-2">
                        {block.content.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-800">
                            <span className="text-blue-600 font-bold" aria-hidden="true">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Includes Block */}
                  {block.type === 'includes' && Array.isArray(block.content) && block.content.length > 0 && (
                    <div className="border-2 border-black bg-green-50 p-6">
                      <h4 className="text-lg font-bold mb-4 uppercase text-green-900 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                        What's Included
                      </h4>
                      <ul className="space-y-2">
                        {block.content.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600 font-bold" aria-hidden="true">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Excludes Block */}
                  {block.type === 'excludes' && Array.isArray(block.content) && block.content.length > 0 && (
                    <div className="border-2 border-black bg-red-50 p-6">
                      <h4 className="text-lg font-bold mb-4 uppercase text-red-900 flex items-center gap-2">
                        <XCircle className="h-5 w-5" aria-hidden="true" />
                        What's Not Included
                      </h4>
                      <ul className="space-y-2">
                        {block.content.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-red-600 font-bold" aria-hidden="true">✗</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What to Bring Block */}
                  {block.type === 'whatToBring' && Array.isArray(block.content) && block.content.length > 0 && (
                    <div className="border-2 border-black bg-purple-50 p-6">
                      <h4 className="text-lg font-bold mb-4 uppercase text-purple-900 flex items-center gap-2">
                        <Package className="h-5 w-5" aria-hidden="true" />
                        What to Bring
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {block.content.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-purple-600 font-bold" aria-hidden="true">□</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Day-by-Day Itinerary with Map */}
        {banner.detailedSchedule && banner.detailedSchedule.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="border-b-4 border-black pb-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3">
                <Calendar className="h-7 w-7" aria-hidden="true" />
                Day-by-Day Itinerary
              </h2>
              <p className="text-gray-600 mt-2">
                Detailed daily schedule with {banner.detailedSchedule.length} days of activities
              </p>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Select day to view on map">
              {banner.detailedSchedule.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDayForMap(day.day)}
                  role="tab"
                  aria-selected={selectedDayForMap === day.day}
                  aria-controls={`map-panel-${day.day}`}
                  className={`px-4 py-2 border-2 border-black font-bold transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                    selectedDayForMap === day.day
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  Day {day.day}
                </button>
              ))}
            </div>

            {/* Main Layout: Timeline + Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline Column */}
              <div className="space-y-4">
                {banner.detailedSchedule.map((day, dayIndex) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 + dayIndex * 0.1 }}
                    className="bg-white border-2 border-black overflow-hidden"
                  >
                    {/* Day Header - Clickable */}
                    <button
                      onClick={() => {
                        toggleDayExpand(day.day);
                        setSelectedDayForMap(day.day);
                      }}
                      className="w-full flex items-center justify-between bg-black text-white p-4 hover:bg-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset"
                      aria-expanded={expandedDays.has(day.day)}
                      aria-controls={`day-content-${day.day}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black text-lg">
                          {day.day}
                        </div>
                        <div className="text-left">
                          <span className="font-bold block">Day {day.day}</span>
                          <span className="text-sm text-gray-300 truncate block max-w-[200px]">
                            {day.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-300">
                          {day.activities.length} activities
                        </span>
                        {expandedDays.has(day.day) ? (
                          <ChevronUp className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-5 w-5" aria-hidden="true" />
                        )}
                      </div>
                    </button>

                    {/* Day Content - Expandable */}
                    <AnimatePresence>
                      {expandedDays.has(day.day) && (
                        <motion.div
                          id={`day-content-${day.day}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-4">
                            {day.activities.map((activity, actIdx) => (
                              <div
                                key={actIdx}
                                className={`relative flex gap-4 ${
                                  activity.isEvent ? 'bg-yellow-50' : ''
                                }`}
                              >
                                {/* Timeline Indicator */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                  <div
                                    className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm ${
                                      activity.isEvent ? 'bg-yellow-400' : 'bg-white'
                                    }`}
                                  >
                                    {actIdx + 1}
                                  </div>
                                  {actIdx < day.activities.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-gray-300 mt-1" aria-hidden="true" />
                                  )}
                                </div>

                                {/* Activity Card */}
                                <div className={`flex-1 border-2 border-black p-4 ${
                                  activity.isEvent ? 'bg-yellow-100' : 'bg-white'
                                }`}>
                                  {/* Event Badge */}
                                  {activity.isEvent && (
                                    <Badge className="bg-black text-white text-xs mb-2">
                                      EVENT
                                    </Badge>
                                  )}

                                  {/* Time */}
                                  <div className="inline-block bg-yellow-400 text-black border border-black px-2 py-0.5 text-xs font-bold mb-2">
                                    <Clock className="h-3 w-3 inline mr-1" aria-hidden="true" />
                                    {activity.time}
                                  </div>

                                  {/* Activity Name */}
                                  <h4 className="font-bold text-base mb-1">{activity.name}</h4>

                                  {/* Location */}
                                  <div className="flex items-start gap-1 text-xs text-gray-600 mb-2">
                                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                    <span className="line-clamp-1">{activity.location || 'Location TBD'}</span>
                                  </div>

                                  {/* Description */}
                                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                    {activity.description}
                                  </p>

                                  {/* Price & Map Link */}
                                  <div className="flex items-center justify-between">
                                    {activity.price && (
                                      <span className="text-xs font-bold border border-black px-2 py-1">
                                        {activity.price}
                                      </span>
                                    )}
                                    {activity.googleMapsUrl && (
                                      <a
                                        href={activity.googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                        aria-label={`Open ${activity.name} in Google Maps`}
                                      >
                                        <Navigation className="h-3 w-3" aria-hidden="true" />
                                        View Map
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Map Column - Sticky */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div
                  id={`map-panel-${selectedDayForMap}`}
                  role="tabpanel"
                  aria-labelledby={`day-tab-${selectedDayForMap}`}
                  className="border-2 border-black bg-white overflow-hidden"
                >
                  <div className="bg-black text-white p-3 flex items-center justify-between">
                    <span className="font-bold">Day {selectedDayForMap} Map</span>
                    <span className="text-xs text-gray-300">
                      {getActivitiesForMap().length} locations
                    </span>
                  </div>
                  <div className="h-[400px] lg:h-[500px]">
                    <GoogleMap
                      activities={getActivitiesForMap()}
                      height="100%"
                      showRoute={true}
                      zoom={13}
                    />
                  </div>
                </div>

                {/* Highlights Sidebar on Desktop */}
                <div className="hidden lg:block mt-6 border-2 border-black bg-white p-6">
                  <h3 className="font-bold text-lg mb-4 uppercase">Top Highlights</h3>
                  <ul className="space-y-2">
                    {banner.highlights.slice(0, 5).map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 flex-shrink-0" aria-hidden="true" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Bottom CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-black text-white border-4 border-black p-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-4 text-balance">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            Apply this itinerary to your trip plan and customize it to your preferences
          </p>
          {onApplyToTrip && (
            <Button
              onClick={() => onApplyToTrip(banner)}
              size="lg"
              className="bg-white text-black hover:bg-gray-200 border-2 border-white font-bold focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
              Apply to My Trip Plan
            </Button>
          )}
        </motion.section>
      </main>
    </div>
  );
}

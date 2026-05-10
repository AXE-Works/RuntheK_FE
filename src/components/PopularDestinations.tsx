import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Star, Users, ArrowRight, Eye, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import bannerImage from '@/assets/3a1a22d8b95ada8e9dda55dbabda0c9a7fb403c6.png';

const SEOUL_DESTINATION = {
  id: 1,
  name: 'Seoul',
  subtitle: 'Modern Capital City',
  description: 'Experience the perfect blend of ancient traditions and cutting-edge technology in Korea\'s vibrant capital.',
  rating: 4.8,
  visitors: '12M+',
  highlights: ['Gyeongbokgung Palace', 'Myeongdong Shopping', 'Han River'],
  recommendedInterests: ['culture', 'food', 'shopping', 'kculture'],
  recommendedDuration: '5 days',
  image: bannerImage,
  countryPreferences: [
    { country: 'China', flag: '🇨🇳', percentage: 32, reason: 'K-Culture & Shopping' },
    { country: 'Japan', flag: '🇯🇵', percentage: 28, reason: 'Traditional Culture' },
    { country: 'USA', flag: '🇺🇸', percentage: 18, reason: 'Entertainment & Food' },
    { country: 'Thailand', flag: '🇹🇭', percentage: 12, reason: 'Cultural Experience' }
  ],
  detailedSchedule: [
    {
      day: 1,
      title: 'Arrival & Gyeongbokgung Palace',
      activities: [
        { time: '09:00', name: 'Arrive at Incheon Airport', description: 'Immigration and customs' },
        { time: '11:00', name: 'Hotel Check-in', description: 'Myeongdong area hotel' },
        { time: '14:00', name: 'Gyeongbokgung Palace', description: 'Main royal palace of Joseon Dynasty' },
        { time: '16:30', name: 'National Folk Museum', description: 'Inside palace grounds' },
        { time: '18:00', name: 'Dinner at Traditional Restaurant', description: 'Korean BBQ experience' }
      ]
    },
    {
      day: 2,
      title: 'Modern Seoul & Shopping',
      activities: [
        { time: '10:00', name: 'Myeongdong Shopping District', description: 'K-beauty and fashion' },
        { time: '12:00', name: 'Lunch at Food Street', description: 'Street food and local cuisine' },
        { time: '14:00', name: 'N Seoul Tower', description: 'Panoramic city views' },
        { time: '17:00', name: 'Hongdae Area', description: 'Youth culture and street performances' },
        { time: '19:00', name: 'Dinner & Nightlife', description: 'Korean fusion cuisine' }
      ]
    },
    {
      day: 3,
      title: 'Han River & Traditional Culture',
      activities: [
        { time: '09:00', name: 'Bukchon Hanok Village', description: 'Traditional Korean houses' },
        { time: '11:00', name: 'Insadong Cultural Street', description: 'Arts, crafts, and tea houses' },
        { time: '13:00', name: 'Lunch at Traditional Restaurant', description: 'Korean set menu' },
        { time: '15:00', name: 'Han River Park', description: 'Cycling or picnic by the river' },
        { time: '18:00', name: 'Banpo Bridge Rainbow Fountain', description: 'Evening light show' }
      ]
    },
    {
      day: 4,
      title: 'DMZ Tour (Optional) or Free Day',
      activities: [
        { time: '08:00', name: 'DMZ Tour Departure', description: 'Full day tour to Korean border' },
        { time: '18:00', name: 'Return to Seoul', description: 'Evening at leisure' },
        { time: '19:00', name: 'Dinner at Gangnam', description: 'Modern Seoul dining experience' }
      ]
    },
    {
      day: 5,
      title: 'Departure Day',
      activities: [
        { time: '09:00', name: 'Last-minute Shopping', description: 'Souvenirs and gifts' },
        { time: '11:00', name: 'Hotel Check-out', description: 'Prepare for departure' },
        { time: '13:00', name: 'Airport Transfer', description: 'Head to Incheon Airport' },
        { time: '16:00', name: 'Departure', description: 'Flight home' }
      ]
    }
  ]
};

const OTHER_DESTINATIONS = [
  {
    id: 2,
    name: 'Jeju Island',
    subtitle: 'Natural Paradise',
    description: 'Discover pristine beaches, volcanic landscapes, and unique island culture.',
    image: 'https://images.unsplash.com/photo-1663196435958-622534f65d71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWp1JTIwaXNsYW5kJTIwa29yZWElMjBuYXR1cmV8ZW58MXx8fHwxNzU3NDMxOTM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    popularity: '89%',
    visitors: '8M+',
    rating: 4.9,
    highlights: ['Hallasan Mountain', 'Beautiful Beaches', 'Seongsan Ilchulbong'],
    recommendedInterests: ['nature', 'culture', 'food'],
    recommendedDuration: '4 days',
    detailedSchedule: [
      {
        day: 1,
        title: 'Arrival & East Coast',
        activities: [
          { time: '10:00', name: 'Arrive at Jeju Airport', description: 'Pick up rental car' },
          { time: '12:00', name: 'Lunch at Local Restaurant', description: 'Fresh seafood' },
          { time: '14:00', name: 'Seongsan Ilchulbong', description: 'UNESCO World Heritage sunrise peak' },
          { time: '16:00', name: 'Seongeup Folk Village', description: 'Traditional Jeju culture' },
          { time: '18:00', name: 'Dinner & Hotel Check-in', description: 'East coast accommodation' }
        ]
      },
      {
        day: 2,
        title: 'Hallasan Mountain Hiking',
        activities: [
          { time: '07:00', name: 'Early Start to Hallasan', description: 'Summit hike' },
          { time: '15:00', name: 'Return from Hike', description: 'Rest and refresh' },
          { time: '18:00', name: 'Black Pork BBQ Dinner', description: 'Jeju specialty cuisine' }
        ]
      },
      {
        day: 3,
        title: 'Beaches & Waterfalls',
        activities: [
          { time: '09:00', name: 'Hamdeok Beach', description: 'Swimming and relaxation' },
          { time: '12:00', name: 'Lunch at Beach Cafe', description: 'Ocean view dining' },
          { time: '14:00', name: 'Jeongbang Waterfall', description: 'Waterfall by the sea' },
          { time: '16:00', name: 'Cheonjiyeon Waterfall', description: 'Beautiful valley walk' }
        ]
      },
      {
        day: 4,
        title: 'West Coast & Departure',
        activities: [
          { time: '09:00', name: 'O\'sulloc Tea Museum', description: 'Green tea plantation' },
          { time: '11:00', name: 'Spirited Garden', description: 'Bonsai garden' },
          { time: '13:00', name: 'Lunch & Shopping', description: 'Last-minute souvenirs' },
          { time: '15:00', name: 'Airport Transfer', description: 'Return rental car' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Busan',
    subtitle: 'Coastal Gem',
    description: 'Korea\'s vibrant port city with stunning coastlines and fresh seafood.',
    image: 'https://images.unsplash.com/photo-1708957472625-53d23195e40a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGtvcmVhJTIwY29hc3RhbCUyMGNpdHl8ZW58MXx8fHwxNzU3NDMxOTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    popularity: '82%',
    visitors: '6M+',
    rating: 4.7,
    highlights: ['Haeundae Beach', 'Jagalchi Market', 'Gamcheon Village'],
    recommendedInterests: ['nature', 'food', 'culture'],
    recommendedDuration: '3 days',
    detailedSchedule: [
      {
        day: 1,
        title: 'Arrival & Beach Time',
        activities: [
          { time: '11:00', name: 'Arrive in Busan', description: 'Train or flight arrival' },
          { time: '13:00', name: 'Haeundae Beach', description: 'Famous beach and lunch' },
          { time: '15:00', name: 'Dongbaek Island Walk', description: 'Coastal walking trail' },
          { time: '17:00', name: 'The Bay 101', description: 'Modern waterfront area' }
        ]
      },
      {
        day: 2,
        title: 'Cultural Busan',
        activities: [
          { time: '09:00', name: 'Gamcheon Culture Village', description: 'Colorful hillside village' },
          { time: '11:30', name: 'Jagalchi Fish Market', description: 'Korea\'s largest seafood market' },
          { time: '13:00', name: 'Lunch at Market', description: 'Live fish and raw seafood' },
          { time: '15:00', name: 'Haedong Yonggungsa Temple', description: 'Seaside Buddhist temple' }
        ]
      },
      {
        day: 3,
        title: 'Shopping & Departure',
        activities: [
          { time: '09:00', name: 'Seomyeon Shopping District', description: 'Local shopping area' },
          { time: '11:00', name: 'Spa or Jjimjilbang', description: 'Korean bathhouse experience' },
          { time: '13:00', name: 'Lunch & Last Shopping', description: 'Souvenirs and snacks' }
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Gyeongju',
    subtitle: 'Ancient Capital',
    description: 'Ancient capital with UNESCO World Heritage sites and rich history.',
    image: 'https://images.unsplash.com/photo-1572608957298-845202fad05d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdqdSUyMGtvcmVhJTIwYW5jaWVudCUyMHRlbXBsZXxlbnwxfHx8fDE3NTc0MzE5NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    popularity: '75%',
    visitors: '4M+',
    rating: 4.6,
    highlights: ['Bulguksa Temple', 'Seokguram Grotto', 'Tumuli Park'],
    recommendedInterests: ['culture', 'temples', 'traditional'],
    recommendedDuration: '3 days',
    detailedSchedule: [
      {
        day: 1,
        title: 'Arrival & Tumuli Park',
        activities: [
          { time: '10:00', name: 'Arrive in Gyeongju', description: 'Check into hotel' },
          { time: '11:00', name: 'Tumuli Park', description: 'Royal burial mounds' },
          { time: '13:00', name: 'Lunch at Traditional Restaurant', description: 'Gyeongju bread and ssambap' },
          { time: '14:30', name: 'Cheomseongdae Observatory', description: 'Oldest astronomical observatory in Asia' },
          { time: '16:00', name: 'Anapji Pond', description: 'Beautiful palace pond' }
        ]
      },
      {
        day: 2,
        title: 'UNESCO Heritage Sites',
        activities: [
          { time: '08:00', name: 'Bulguksa Temple', description: 'UNESCO World Heritage temple' },
          { time: '10:30', name: 'Seokguram Grotto', description: 'Mountain-top stone Buddha' },
          { time: '13:00', name: 'Lunch at Temple Food Restaurant', description: 'Buddhist vegetarian cuisine' },
          { time: '15:00', name: 'Gyeongju National Museum', description: 'Ancient Silla artifacts' }
        ]
      },
      {
        day: 3,
        title: 'Countryside & Departure',
        activities: [
          { time: '09:00', name: 'Yangdong Folk Village', description: 'UNESCO traditional village' },
          { time: '11:00', name: 'Traditional Tea House', description: 'Hanok tea experience' },
          { time: '13:00', name: 'Lunch & Shopping', description: 'Local crafts and souvenirs' }
        ]
      }
    ]
  }
];

interface PopularDestinationsProps {
  onDestinationSelect?: (destination: any) => void;
}

export function PopularDestinations({ onDestinationSelect }: PopularDestinationsProps) {
  const { t } = useTranslation(['destinations', 'common']);
  const [detailDestination, setDetailDestination] = useState<any>(null);

  const handleDestinationClick = (destination: any) => {
    if (onDestinationSelect) {
      onDestinationSelect(destination);
    }
  };

  const handleShowDetails = (destination: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailDestination(destination);
  };

  return (
    <motion.section 
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Header */}
      <div className="text-center space-y-2 px-4">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900">{t('destinations:popular.title')}</h3>
        <p className="text-xs md:text-base text-gray-600 max-w-2xl mx-auto">
          {t('destinations:popular.subtitle')}
        </p>
      </div>

      {/* Main Featured Banner - Seoul */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative mb-8 px-4"
      >
        <Card 
          className="overflow-hidden border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="relative">
            {/* Background Image */}
            <div className="absolute inset-0">
              <ImageWithFallback
                src={bannerImage}
                alt="Seoul Modern Capital City"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
            
            {/* View Details Button */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 h-7 md:h-10 px-2 md:px-4 text-xs"
                onClick={(e) => handleShowDetails(SEOUL_DESTINATION, e)}
              >
                <Eye className="h-3 w-3 md:h-4 md:w-4 text-white md:mr-2" />
                <span className="hidden md:inline text-white text-sm">{t('destinations:actions.viewDetails')}</span>
              </Button>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-3 md:p-8 text-white min-h-[160px] md:min-h-[280px] flex flex-col justify-center">
              <div className="max-w-2xl">
                <h4 className="text-base md:text-3xl font-bold mb-1 md:mb-2">{SEOUL_DESTINATION.subtitle}</h4>
                <p className="text-xs md:text-lg mb-2 md:mb-4 text-gray-100 leading-relaxed line-clamp-2">
                  {SEOUL_DESTINATION.description}
                </p>
                
                {/* Rating and Visitors */}
                <div className="flex items-center space-x-2 md:space-x-6 mb-2 md:mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs md:text-lg font-medium">{SEOUL_DESTINATION.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3 md:h-5 md:w-5" />
                    <span className="text-xs md:text-lg">{SEOUL_DESTINATION.visitors}</span>
                  </div>
                </div>
                
                {/* Highlights */}
                <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-6">
                  {SEOUL_DESTINATION.highlights.map((highlight, idx) => (
                    <Badge key={idx} variant="outline" className="border-white/40 text-white bg-white/20 hover:bg-white/30 text-[10px] md:text-sm px-1.5 py-0 md:px-2.5">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-3">
                  <Button
                    className="bg-white text-gray-900 hover:bg-gray-100 group/btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDestinationClick(SEOUL_DESTINATION);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('destinations:actions.applyToForm')}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/40 text-white bg-white/10 hover:bg-white/20"
                    onClick={(e) => handleShowDetails(SEOUL_DESTINATION, e)}
                  >
                    {t('destinations:actions.viewSchedule')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Grid of Other Destinations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {OTHER_DESTINATIONS.map((destination, index) => (
          <motion.div
            key={destination.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
          >
            <Card 
              className="group hover:shadow-xl transition-all duration-300 border-gray-200 bg-white overflow-hidden h-full"
            >
              <div className="relative h-48">
                <ImageWithFallback
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* View Details Button */}
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 p-1.5"
                    onClick={(e) => handleShowDetails(destination, e)}
                  >
                    <Eye className="h-3 w-3 text-white" />
                  </Button>
                </div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="font-bold text-lg mb-1 line-clamp-1">{destination.name}</h4>
                  <p className="text-sm text-white/90 mb-2 line-clamp-1">{destination.subtitle}</p>
                  
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{destination.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{destination.visitors}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs opacity-75">{t('destinations:actions.recommended')}: {destination.recommendedDuration}</span>
                  </div>

                  {/* Apply to Form Button */}
                  <Button
                    size="sm"
                    className="w-full bg-white text-black hover:bg-gray-200 text-[10px] py-0.5 h-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDestinationClick(destination);
                    }}
                  >
                    <Plus className="h-2.5 w-2.5 mr-1" />
                    {t('destinations:actions.applyToForm')}
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900">{t('destinations:details.topHighlights')}</h5>
                  <div className="flex flex-wrap gap-1">
                    {destination.highlights.slice(0, 2).map((highlight, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-gray-300 text-gray-600">
                        {highlight}
                      </Badge>
                    ))}
                    {destination.highlights.length > 2 && (
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                        {t('destinations:details.more', { count: destination.highlights.length - 2 })}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detail Dialog */}
      {detailDestination && (
        <Dialog open={true} onOpenChange={() => setDetailDestination(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{detailDestination.name} - {detailDestination.subtitle}</DialogTitle>
              <DialogDescription>
                {t('destinations:dialog.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Hero Image */}
              <div className="relative rounded-xl overflow-hidden">
                <ImageWithFallback
                  src={detailDestination.image}
                  alt={detailDestination.name}
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-lg mb-2">{detailDestination.description}</p>
                  <div className="flex items-center space-x-4 text-white text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{detailDestination.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{detailDestination.visitors} {t('destinations:details.yearlyVisitors')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('destinations:details.tourOverview')}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {detailDestination.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('destinations:details.quickFacts')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t('destinations:details.duration')}:</span>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {detailDestination.recommendedDuration}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t('destinations:details.popularity')}:</span>
                        <span className="text-gray-900 font-medium">{detailDestination.visitors}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t('destinations:details.rating')}:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-900 font-medium">{detailDestination.rating}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{t('destinations:details.topHighlights')}</h4>
                    <ul className="space-y-2">
                      {detailDestination.highlights.map((highlight: string, index: number) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-2 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{t('destinations:details.recommendedFor')}</h4>
                    <p className="text-sm text-gray-600">
                      {t('destinations:details.recommendedForDesc', { interests: detailDestination.recommendedInterests.join(', ') })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Schedule Section */}
              {detailDestination.detailedSchedule && detailDestination.detailedSchedule.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">{t('destinations:details.detailedSchedule')}</h4>
                  <div className="space-y-6">
                    {detailDestination.detailedSchedule.map((daySchedule: any) => (
                      <div key={daySchedule.day} className="bg-gray-50 rounded-lg p-5">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                            {daySchedule.day}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{t('destinations:details.day', { day: daySchedule.day })}</h5>
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
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                  onClick={() => {
                    handleDestinationClick(detailDestination);
                    setDetailDestination(null);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('destinations:actions.applyToMyTripPlan')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailDestination(null)}
                >
                  {t('common:buttons.close')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.section>
  );
}
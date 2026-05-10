import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TourDetailModal } from './TourDetailModal';
import exampleImage from '@/assets/441b7c322663b0c22bc75be1f0b9d085555f709d.png';

const RECOMMENDED_TOURS = [
  {
    id: 1,
    title: 'Classic South Korea tour',
    subtitle: 'Historic palaces and temples',
    duration: '13 days',
    price: '£7,195pp',
    rating: 4.8,
    reviewCount: 124,
    image: 'https://images.unsplash.com/photo-1629137440345-c2e6c107ef0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW91bCUyMGtvcmVhJTIwY2hlcnJ5JTIwYmxvc3NvbXxlbnwxfHx8fDE3NTc0Mjk5MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Cultural'
  },
  {
    id: 2,
    title: 'A family adventure in South Korea',
    subtitle: 'Perfect for all ages',
    duration: '11 days',
    price: '£5,780pp',
    rating: 4.9,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1713079438827-b8ae8d66d763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWp1JTIwaXNsYW5kJTIwa29yZWElMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzU3NDI5ODkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Family'
  },
  {
    id: 3,
    title: 'Japan by land & sea',
    subtitle: 'Seoul to Tokyo adventure',
    duration: '21 days',
    price: '£18,535pp',
    rating: 4.7,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1755382947833-dd8d2e58efa7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGtvcmVhJTIwY2l0eXxlbnwxfHx8fDE3NTc0MDQ3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Premium'
  },
  {
    id: 4,
    title: 'Japan with Azamara cruise',
    subtitle: 'Luxury sea and land',
    duration: '24 days',
    price: '£13,900pp',
    rating: 4.9,
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1667494400197-4c238f658ca2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdqdSUyMGtvcmVhJTIwdGVtcGxlfGVufDF8fHx8MTc1NzM0ODA2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Luxury'
  }
];

const RECOMMENDED_ACTIVITIES = [
  {
    id: 1,
    title: 'Tour to the North Korean border zone',
    subtitle: 'DMZ experience',
    image: exampleImage,
    category: 'Historical'
  },
  {
    id: 2,
    title: 'Highlights of Gyeongju tour',
    subtitle: 'Ancient capital exploration',
    image: 'https://images.unsplash.com/photo-1667494400197-4c238f658ca2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdqdSUyMGtvcmVhJTIwdGVtcGxlfGVufDF8fHx8MTc1NzM0ODA2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Cultural'
  },
  {
    id: 3,
    title: 'Tour of Eastern Jeju Island',
    subtitle: 'Natural wonders',
    image: 'https://images.unsplash.com/photo-1713079438827-b8ae8d66d763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWp1JTIwaXNsYW5kJTIwa29yZWElMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzU3NDI5ODkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Nature'
  }
];

export function RecommendedTours() {
  const { t } = useTranslation(['tours']);
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [showTourDetail, setShowTourDetail] = useState(false);

  const handleViewTour = (tour: any) => {
    setSelectedTour(tour);
    setShowTourDetail(true);
  };

  return (
    <div className="space-y-12">
      {/* Suggested Tours Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{t('tours:suggested.title')}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t('tours:suggested.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECOMMENDED_TOURS.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
            >
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-gray-200 bg-white overflow-hidden h-full">
                <div className="relative h-64">
                  <ImageWithFallback
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg mb-1 leading-tight">{tour.title}</h3>
                    <p className="text-sm text-white/90 mb-3">{tour.subtitle}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <span>{t('tours:labels.durationFrom', { duration: tour.duration, price: tour.price })}</span>
                      </div>
                    </div>

                    {/* View This Tour Button */}
                    <Button
                      size="sm"
                      onClick={() => handleViewTour(tour)}
                      className="w-full bg-white/90 backdrop-blur-sm text-black hover:bg-white transition-all duration-300 font-medium"
                    >
                      {t('tours:actions.viewTour')}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Suggested Activities Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="space-y-6"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{t('tours:activities.title')}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t('tours:activities.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RECOMMENDED_ACTIVITIES.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
            >
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-gray-200 bg-white overflow-hidden h-full">
                <div className="relative h-64">
                  <ImageWithFallback
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-bold text-xl mb-2 leading-tight">{activity.title}</h3>
                    <p className="text-white/90">{activity.subtitle}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tour Detail Modal */}
      <TourDetailModal 
        tour={selectedTour}
        isOpen={showTourDetail}
        onClose={() => setShowTourDetail(false)}
      />
    </div>
  );
}
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Clock, 
  Plane, 
  Hotel, 
  Utensils,
  Camera,
  X
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TourDetailModalProps {
  tour: any;
  isOpen: boolean;
  onClose: () => void;
}

export function TourDetailModal({ tour, isOpen, onClose }: TourDetailModalProps) {
  if (!tour) return null;

  const itinerary = [
    {
      day: 1,
      title: "Arrival in Seoul",
      activities: [
        "Airport pickup and hotel check-in",
        "Welcome dinner at traditional Korean restaurant",
        "Evening stroll in Myeongdong"
      ]
    },
    {
      day: 2,
      title: "Palace & Traditional Culture",
      activities: [
        "Visit Gyeongbokgung Palace",
        "Explore Bukchon Hanok Village",
        "Traditional tea ceremony experience"
      ]
    },
    {
      day: 3,
      title: "Modern Seoul",
      activities: [
        "Hongdae district exploration",
        "K-Pop entertainment experience",
        "Han River cruise"
      ]
    }
  ];

  const included = [
    "Accommodation (4-star hotels)",
    "Daily breakfast",
    "Airport transfers",
    "English-speaking guide",
    "Entrance fees to attractions",
    "Traditional cultural experiences"
  ];

  const notIncluded = [
    "International flights",
    "Lunch and dinner (except welcome dinner)",
    "Personal expenses",
    "Travel insurance",
    "Optional activities"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {tour.title}
              </DialogTitle>
              <p className="text-gray-600">{tour.subtitle}</p>
              <div className="flex items-center space-x-4">
                <Badge className="bg-black text-white">
                  <Calendar className="h-3 w-3 mr-1" />
                  {tour.duration}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{tour.rating}</span>
                  <span className="text-gray-500">({tour.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-xl overflow-hidden"
          >
            <ImageWithFallback
              src={tour.image}
              alt={tour.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="text-white">
                <p className="text-lg font-bold">From {tour.price}</p>
                <p className="text-sm opacity-90">per person</p>
              </div>
            </div>
          </motion.div>

          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tour Overview</h3>
                <p className="text-gray-700 leading-relaxed">
                  Discover the perfect blend of ancient traditions and modern innovation in South Korea. 
                  This carefully crafted tour takes you through the bustling streets of Seoul, 
                  the serene beauty of traditional palaces, and the vibrant K-culture that has 
                  captivated the world. Experience authentic Korean cuisine, visit UNESCO World 
                  Heritage sites, and immerse yourself in the rich cultural heritage of the Land of Morning Calm.
                </p>
              </div>

              {/* Itinerary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Day-by-Day Itinerary</h3>
                <div className="space-y-4">
                  {itinerary.map((day) => (
                    <Card key={day.day} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {day.day}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{day.title}</h4>
                            <ul className="space-y-1">
                              {day.activities.map((activity, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Facts */}
              <Card className="border border-gray-200">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Quick Facts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{tour.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Max 16 people</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Plane className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Airport transfers included</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Hotel className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">4-star accommodation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card className="border border-gray-200">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">What's Included</h3>
                  <ul className="space-y-2">
                    {included.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* What's Not Included */}
              <Card className="border border-gray-200">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">What's Not Included</h3>
                  <ul className="space-y-2">
                    {notIncluded.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Book Now */}
              <Card className="border border-gray-200 bg-gray-50">
                <CardContent className="p-4 space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{tour.price}</p>
                    <p className="text-sm text-gray-600">per person</p>
                  </div>
                  <Button className="w-full bg-black text-white hover:bg-gray-800">
                    Request a Quote
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Free cancellation up to 24 hours before departure
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
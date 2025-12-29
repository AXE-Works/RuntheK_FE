import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Edit2, Eye, Save, X, Users, Star, MapPin, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

// Mock user-generated travel course data
const USER_GENERATED_COURSES = [
  {
    id: 1,
    title: 'Seoul Modern Capital City',
    subtitle: 'Experience the perfect blend of ancient tradition...',
    duration: '5 days',
    visitors: '12M+',
    rating: 4.8,
    highlights: ['Gyeongbokgung Palace', 'Myeongdong Shopping', 'Han River'],
    category: 'Urban',
    userId: 'user123',
    createdAt: '2024-01-05',
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
  },
  {
    id: 2,
    title: 'Jeju Natural Paradise',
    subtitle: 'Discover pristine beaches and volcanic landscapes',
    duration: '4 days',
    visitors: '8M+',
    rating: 4.9,
    highlights: ['Hallasan Mountain', 'Beautiful Beaches', 'Seongsan Ilchulbong'],
    category: 'Nature',
    userId: 'user456',
    createdAt: '2024-01-04',
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
          { time: '16:00', name: 'Cheonjiyeon Waterfall', description: 'Beautiful valley walk' },
          { time: '18:00', name: 'Seogwipo Night Market', description: 'Local street food' }
        ]
      },
      {
        day: 4,
        title: 'West Coast & Departure',
        activities: [
          { time: '09:00', name: 'O\'sulloc Tea Museum', description: 'Green tea plantation' },
          { time: '11:00', name: 'Spirited Garden', description: 'Bonsai garden' },
          { time: '13:00', name: 'Lunch & Shopping', description: 'Last-minute souvenirs' },
          { time: '15:00', name: 'Airport Transfer', description: 'Return rental car' },
          { time: '17:00', name: 'Departure', description: 'Flight home' }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Busan Coastal Adventure',
    subtitle: 'Korea\'s vibrant port city with stunning coastlines',
    duration: '3 days',
    visitors: '6M+',
    rating: 4.7,
    highlights: ['Haeundae Beach', 'Gamcheon Village', 'Jagalchi Market'],
    category: 'Coastal',
    userId: 'user789',
    createdAt: '2024-01-03',
    detailedSchedule: [
      {
        day: 1,
        title: 'Arrival & Beach Time',
        activities: [
          { time: '11:00', name: 'Arrive in Busan', description: 'Train or flight arrival' },
          { time: '13:00', name: 'Haeundae Beach', description: 'Famous beach and lunch' },
          { time: '15:00', name: 'Dongbaek Island Walk', description: 'Coastal walking trail' },
          { time: '17:00', name: 'The Bay 101', description: 'Modern waterfront area' },
          { time: '19:00', name: 'Seafood Dinner', description: 'Fresh catch of the day' }
        ]
      },
      {
        day: 2,
        title: 'Cultural Busan',
        activities: [
          { time: '09:00', name: 'Gamcheon Culture Village', description: 'Colorful hillside village' },
          { time: '11:30', name: 'Jagalchi Fish Market', description: 'Korea\'s largest seafood market' },
          { time: '13:00', name: 'Lunch at Market', description: 'Live fish and raw seafood' },
          { time: '15:00', name: 'Haedong Yonggungsa Temple', description: 'Seaside Buddhist temple' },
          { time: '17:00', name: 'Gwangalli Beach', description: 'Diamond Bridge views' }
        ]
      },
      {
        day: 3,
        title: 'Shopping & Departure',
        activities: [
          { time: '09:00', name: 'Seomyeon Shopping District', description: 'Local shopping area' },
          { time: '11:00', name: 'Spa or Jjimjilbang', description: 'Korean bathhouse experience' },
          { time: '13:00', name: 'Lunch & Last Shopping', description: 'Souvenirs and snacks' },
          { time: '15:00', name: 'Departure', description: 'Train or flight home' }
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Gyeongju Historical Journey',
    subtitle: 'Ancient capital with UNESCO World Heritage sites',
    duration: '3 days',
    visitors: '4M+',
    rating: 4.6,
    highlights: ['Bulguksa Temple', 'Seokguram Grotto', 'Tumuli Park'],
    category: 'Cultural',
    userId: 'user101',
    createdAt: '2024-01-02',
    detailedSchedule: [
      {
        day: 1,
        title: 'Arrival & Tumuli Park',
        activities: [
          { time: '10:00', name: 'Arrive in Gyeongju', description: 'Check into hotel' },
          { time: '11:00', name: 'Tumuli Park', description: 'Royal burial mounds' },
          { time: '13:00', name: 'Lunch at Traditional Restaurant', description: 'Gyeongju bread and ssambap' },
          { time: '14:30', name: 'Cheomseongdae Observatory', description: 'Oldest astronomical observatory in Asia' },
          { time: '16:00', name: 'Anapji Pond', description: 'Beautiful palace pond' },
          { time: '18:00', name: 'Dinner & Night Walk', description: 'Evening stroll around pond' }
        ]
      },
      {
        day: 2,
        title: 'UNESCO Heritage Sites',
        activities: [
          { time: '08:00', name: 'Bulguksa Temple', description: 'UNESCO World Heritage temple' },
          { time: '10:30', name: 'Seokguram Grotto', description: 'Mountain-top stone Buddha' },
          { time: '13:00', name: 'Lunch at Temple Food Restaurant', description: 'Buddhist vegetarian cuisine' },
          { time: '15:00', name: 'Gyeongju National Museum', description: 'Ancient Silla artifacts' },
          { time: '17:00', name: 'Hwangnidan Street', description: 'Trendy cafes and shops' }
        ]
      },
      {
        day: 3,
        title: 'Countryside & Departure',
        activities: [
          { time: '09:00', name: 'Yangdong Folk Village', description: 'UNESCO traditional village' },
          { time: '11:00', name: 'Traditional Tea House', description: 'Hanok tea experience' },
          { time: '13:00', name: 'Lunch & Shopping', description: 'Local crafts and souvenirs' },
          { time: '15:00', name: 'Departure', description: 'Return to Seoul or Busan' }
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'Korean Culinary Experience',
    subtitle: 'Immerse in authentic Korean food culture',
    duration: '2 days',
    visitors: '10M+',
    rating: 4.8,
    highlights: ['Gwangjang Market', 'Street Food Tours', 'Cooking Classes'],
    category: 'Food',
    userId: 'user202',
    createdAt: '2024-01-01',
    detailedSchedule: [
      {
        day: 1,
        title: 'Market Tours & Street Food',
        activities: [
          { time: '10:00', name: 'Gwangjang Market Tour', description: 'Bindaetteok and mayak kimbap' },
          { time: '12:00', name: 'Tteokbokki & Sundae Tasting', description: 'Street food favorites' },
          { time: '14:00', name: 'Namdaemun Market', description: 'Kalguksu and mandu' },
          { time: '16:00', name: 'Traditional Tea House', description: 'Korean tea and desserts' },
          { time: '18:00', name: 'Korean BBQ Dinner', description: 'Premium hanwoo beef' }
        ]
      },
      {
        day: 2,
        title: 'Cooking Class & Fine Dining',
        activities: [
          { time: '09:00', name: 'Traditional Market Visit', description: 'Ingredient shopping with chef' },
          { time: '10:30', name: 'Korean Cooking Class', description: 'Learn to make kimchi and bulgogi' },
          { time: '13:00', name: 'Enjoy Your Creations', description: 'Lunch of what you cooked' },
          { time: '15:00', name: 'Korean Dessert Cafe', description: 'Bingsu and traditional sweets' },
          { time: '18:00', name: 'Fine Dining Experience', description: 'Modern Korean cuisine' }
        ]
      }
    ]
  },
  {
    id: 6,
    title: 'Traditional Hanbok Culture',
    subtitle: 'Experience Korea\'s traditional clothing and culture',
    duration: '1 day',
    visitors: '5M+',
    rating: 4.5,
    highlights: ['Hanbok Rental', 'Palace Photos', 'Tea Ceremony'],
    category: 'Cultural',
    userId: 'user303',
    createdAt: '2023-12-30',
    detailedSchedule: [
      {
        day: 1,
        title: 'Hanbok Day Experience',
        activities: [
          { time: '09:00', name: 'Hanbok Rental Shop', description: 'Choose and dress in traditional hanbok' },
          { time: '10:00', name: 'Gyeongbokgung Palace', description: 'Free entry with hanbok, photo spots' },
          { time: '12:00', name: 'Bukchon Hanok Village', description: 'Traditional houses photoshoot' },
          { time: '13:00', name: 'Lunch in Hanbok', description: 'Traditional Korean meal' },
          { time: '14:30', name: 'Insadong Tea Ceremony', description: 'Traditional tea house experience' },
          { time: '16:00', name: 'Return Hanbok & Shopping', description: 'Insadong crafts and souvenirs' }
        ]
      }
    ]
  },
  {
    id: 7,
    title: 'DMZ Historical Tour',
    subtitle: 'Explore the Korean War history and border area',
    duration: '1 day',
    visitors: '3M+',
    rating: 4.4,
    highlights: ['Joint Security Area', 'Tunnel Tours', 'War Memorial'],
    category: 'Historical',
    userId: 'user404',
    createdAt: '2023-12-29',
    detailedSchedule: [
      {
        day: 1,
        title: 'DMZ Full Day Tour',
        activities: [
          { time: '07:00', name: 'Pickup from Seoul', description: 'Tour bus departure' },
          { time: '09:00', name: 'Imjingak Park', description: 'Freedom Bridge and monuments' },
          { time: '10:30', name: 'Third Infiltration Tunnel', description: 'Underground tunnel walk' },
          { time: '12:00', name: 'Dora Observatory', description: 'View into North Korea' },
          { time: '13:00', name: 'Lunch at Local Restaurant', description: 'DMZ area cuisine' },
          { time: '14:30', name: 'Dorasan Station', description: 'Northernmost station in South Korea' },
          { time: '16:00', name: 'Return to Seoul', description: 'Tour conclusion' }
        ]
      }
    ]
  },
  {
    id: 8,
    title: 'Mountain Hiking Adventure',
    subtitle: 'Explore Korea\'s beautiful mountain trails',
    duration: '2 days',
    visitors: '2M+',
    rating: 4.6,
    highlights: ['Seoraksan Trail', 'Mountain Temples', 'Natural Springs'],
    category: 'Nature',
    userId: 'user505',
    createdAt: '2023-12-28',
    detailedSchedule: [
      {
        day: 1,
        title: 'Seoraksan National Park',
        activities: [
          { time: '06:00', name: 'Depart from Seoul', description: 'Bus to Seoraksan' },
          { time: '09:00', name: 'Sinheungsa Temple', description: 'Bronze Buddha statue' },
          { time: '10:00', name: 'Ulsanbawi Rock Hike', description: 'Challenging rock formation climb' },
          { time: '14:00', name: 'Lunch at Park Restaurant', description: 'Mountain food specialties' },
          { time: '15:30', name: 'Biryong Falls Trail', description: 'Scenic waterfall hike' },
          { time: '18:00', name: 'Check-in to Mountain Lodge', description: 'Evening relaxation' }
        ]
      },
      {
        day: 2,
        title: 'Hot Springs & Return',
        activities: [
          { time: '08:00', name: 'Morning Temple Visit', description: 'Peaceful mountain temple' },
          { time: '10:00', name: 'Sokcho Hot Springs', description: 'Natural mineral baths' },
          { time: '12:00', name: 'Lunch at Seafood Restaurant', description: 'Fresh East Sea catch' },
          { time: '14:00', name: 'Return to Seoul', description: 'Bus journey back' }
        ]
      }
    ]
  }
];

const BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1591366152219-48d643eb3aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW91bCUyMG1vZGVybiUyMGFyY2hpdGVjdHVyZSUyMHNreWxpbmV8ZW58MXx8fHwxNzU3NDYyODkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1674637966553-3073f47b4610?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMGplanUlMjBpc2xhbmQlMjB2b2xjYW5vJTIwbW91bnRhaW58ZW58MXx8fHwxNzU3NDYyODk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1556974060-89c066b25199?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGtvcmVhJTIwY29hc3RhbCUyMGJlYWNoJTIwY29sb3JmdWwlMjBob3VzZXN8ZW58MXx8fHwxNzU3NDYyOTAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1704871576680-d7d8b0d07315?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdqdSUyMGtvcmVhJTIwYW5jaWVudCUyMHRlbXBsZSUyMHBhZ29kYXxlbnwxfHx8fDE3NTc0NjI5MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1594021113115-f1b48e63ef06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMGtvcmVhJTIwZm9vZCUyBtYXJrZXQlMjBzdHJlZXQlMjB0cmFkaXRpb25hbHxlbnwxfHx8fDE3NTc0NjI5MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1627630228864-c323baf59f26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMGhhbmJvayUyMHRyYWRpdGlvbmFsJTIwcGFsYWNlJTIwY3VsdHVyZXxlbnwxfHx8fDE3NTc0NjI5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1742734704504-c1554ab47cab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMGRteiUyMGJvcmRlciUyMGhpc3RvcmljYWwlMjBzaXRlfGVufDF8fHx8MTc1NzQ2MjkyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1577328284865-56f2943d785d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMGhpa2luZyUyMG1vdW50YWluJTIwbmF0dXJlJTIwdHJhaWx8ZW58MXx8fHwxNzU3NDYyOTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
];

interface SuggestedBannersProps {
  onBannerSelect?: (banner: any) => void;
}

interface BannerData {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  duration: string;
  visitors: string;
  rating: number;
  highlights: string[];
  category: string;
  isEditable?: boolean;
}

export function SuggestedBanners({ onBannerSelect }: SuggestedBannersProps) {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [editingBanner, setEditingBanner] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<BannerData>>({});
  const [detailBanner, setDetailBanner] = useState<BannerData | null>(null);

  // Auto-generate banners from user course data
  useEffect(() => {
    const generatedBanners = USER_GENERATED_COURSES.map((course, index) => ({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      image: BANNER_IMAGES[index % BANNER_IMAGES.length],
      duration: course.duration,
      visitors: course.visitors,
      rating: course.rating,
      highlights: course.highlights,
      category: course.category,
      isEditable: true
    }));
    setBanners(generatedBanners);
  }, []);

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
      onBannerSelect({
        name: banner.title,
        subtitle: banner.subtitle,
        recommendedDuration: banner.duration,
        recommendedInterests: [banner.category.toLowerCase()],
        description: banner.subtitle,
        rating: banner.rating,
        visitors: banner.visitors,
        image: banner.image
      });
    }
  };

  const handleBannerDetail = (banner: BannerData) => {
    // Find the full course data with detailed schedule
    const fullCourse = USER_GENERATED_COURSES.find(c => c.id === banner.id);
    setDetailBanner(fullCourse ? { ...banner, detailedSchedule: fullCourse.detailedSchedule } : banner);
  };

  return (
    <motion.section
      className="space-y-6 px-4 md:px-0"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900">Suggested Korea Travel Experiences</h3>
        <p className="text-xs md:text-base text-gray-600 max-w-2xl mx-auto">
          Discover popular travel routes created by real travelers. Click any experience to auto-fill your travel form!
        </p>
      </div>

      {/* Top Row - 4 Banners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {banners.slice(0, 4).map((banner, index) => (
          <BannerCard
            key={banner.id}
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
        ))}
      </div>

      {/* Bottom Row - 4 Banners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {banners.slice(4, 8).map((banner, index) => (
          <BannerCard
            key={banner.id}
            banner={banner}
            index={index + 4}
            isEditing={editingBanner === banner.id}
            editForm={editForm}
            onEdit={handleEditBanner}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            onClick={handleBannerClick}
            onFormChange={setEditForm}
            onDetail={handleBannerDetail}
          />
        ))}
      </div>

      {/* Auto-generation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mt-6">
        <div className="flex items-start space-x-2 md:space-x-3">
          <div className="bg-blue-500 rounded-full p-1 flex-shrink-0">
            <Users className="h-3 w-3 md:h-4 md:w-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-medium text-blue-900 mb-1">Auto-Generated Content</h4>
            <p className="text-[10px] md:text-xs text-blue-700">
              These banners are automatically created from {USER_GENERATED_COURSES.length} user-generated travel courses. 
              The system analyzes popular destinations, ratings, and travel patterns to suggest the best experiences.
            </p>
          </div>
        </div>
      </div>

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
                    <p className="text-gray-600 leading-relaxed">
                      {detailBanner.subtitle} - This carefully curated experience showcases 
                      the best of what this destination has to offer, combining must-see 
                      attractions with authentic local experiences.
                    </p>
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
                    <p className="text-sm text-gray-600">
                      This experience is perfect for travelers interested in {detailBanner.category.toLowerCase()} 
                      activities and cultural immersion. Suitable for all age groups and fitness levels.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Schedule Section */}
              {detailBanner.detailedSchedule && detailBanner.detailedSchedule.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Detailed Travel Schedule</h4>
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
                </div>
              )}

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
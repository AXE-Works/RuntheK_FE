import { useState } from 'react';
import { DestinationData } from '@/lib/seo/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, Star, Clock, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import logo from 'figma:asset/ade16fc310679880d8b27a51a4119372559298ac.png';
import { PublicItineraryDetailModal } from './PublicItineraryDetailModal';

interface DestinationContentProps {
  destination: DestinationData;
  onPlanTrip: () => void;
  onBackToHome: () => void;
}

/**
 * Unified destination page content component
 * Used by both RegionPage (static) and DestinationPage (dynamic)
 */
export function DestinationContent({
  destination,
  onPlanTrip,
  onBackToHome
}: DestinationContentProps) {
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTourClick = (tourId: string) => {
    setSelectedItineraryId(tourId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center cursor-pointer"
              onClick={onBackToHome}
            >
              <img
                src={logo}
                alt="RuntheK"
                className="h-6 w-auto object-contain"
              />
              <span className="ml-2 text-2xl font-semibold text-gray-900">Travel</span>
            </div>
            <Button
              onClick={onPlanTrip}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Start Planning
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[50vh] min-h-[400px] bg-cover bg-center"
        style={{ backgroundImage: `url(${destination.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center text-white px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              {destination.name} Travel Guide 2025
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mb-2">
              {destination.nameKo}
            </p>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover the best of {destination.name} with AI-powered trip planning
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            About {destination.name}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-4xl">
            {destination.description}
          </p>
        </motion.section>

        {/* Highlights Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Top Attractions in {destination.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destination.highlights.map((highlight, index) => (
              <motion.div
                key={highlight}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {highlight}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Must-visit attraction
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why Plan Your {destination.name} Trip with RunTheK?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Itineraries
              </h3>
              <p className="text-gray-600">
                Get personalized day-by-day plans based on your interests and travel style
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Local Recommendations
              </h3>
              <p className="text-gray-600">
                Discover hidden gems and authentic experiences curated by local experts
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Save Planning Time
              </h3>
              <p className="text-gray-600">
                Create your complete {destination.name} itinerary in minutes, not hours
              </p>
            </div>
          </div>
        </motion.section>

        {/* Related Itineraries Section */}
        {destination.relatedItineraries && destination.relatedItineraries.length > 0 && (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Recommended Tours in {destination.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {destination.relatedItineraries.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Card
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleTourClick(tour.id)}
                  >
                    {/* Image with gradient overlay - fixed height */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={tour.imageUrl || 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400'}
                        alt={tour.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Featured badge */}
                      {tour.isFeatured && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-black text-xs">
                          Featured
                        </Badge>
                      )}

                      {/* Duration & Budget badges */}
                      <div className="absolute bottom-2 left-2 flex gap-2">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs">
                          {tour.duration}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs capitalize">
                          {tour.budget}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                        {tour.title}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {tour.averageRating?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({tour.viewCount?.toLocaleString() || 0} views)
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA Section */}
        <motion.section
          className="text-center bg-black rounded-2xl p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Explore {destination.name}?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Start planning your perfect {destination.name} adventure with our AI travel assistant.
            Get a personalized itinerary tailored to your interests, budget, and schedule.
          </p>
          <Button
            size="lg"
            onClick={onPlanTrip}
            className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6 h-auto"
          >
            Plan Your {destination.name} Trip
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={logo}
                alt="RuntheK"
                className="h-5 w-auto object-contain"
              />
              <span className="ml-2 text-lg font-semibold text-gray-900">Travel</span>
            </div>
            <p className="text-sm text-gray-500">
              Your AI-powered Korea travel assistant
            </p>
          </div>
        </div>
      </footer>

      {/* Itinerary Detail Modal */}
      <PublicItineraryDetailModal
        itineraryId={selectedItineraryId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlanTrip={onPlanTrip}
      />
    </div>
  );
}

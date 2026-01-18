import React from 'react';
import { motion } from 'motion/react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from './ui/accordion';
import {
  Globe,
  MapPin,
  UtensilsCrossed,
  Lightbulb,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface GuideSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

const guideSections: GuideSection[] = [
  {
    id: 'korea-at-a-glance',
    icon: <Globe className="h-5 w-5 text-gray-600" />,
    title: 'Korea at a glance',
    content: (
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
        <p className="text-gray-400 italic">Content coming soon...</p>
        <ul className="space-y-2 list-disc list-inside">
          <li>Best times to visit Korea</li>
          <li>Typical trip length</li>
          <li>Getting around cities</li>
          <li>Payment & connectivity basics</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'things-to-do',
    icon: <MapPin className="h-5 w-5 text-gray-600" />,
    title: 'Things to Do in Korea',
    content: (
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
        <p className="text-gray-400 italic">Content coming soon...</p>
        <ul className="space-y-2 list-disc list-inside">
          <li>Neighborhood walks and local markets</li>
          <li>Cultural sites and everyday landmarks</li>
          <li>Seasonal activities people actually plan around</li>
          <li>Day trips and short-distance routes</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'food-dining',
    icon: <UtensilsCrossed className="h-5 w-5 text-gray-600" />,
    title: 'Korean Food & Dining Context',
    content: (
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
        <p className="text-gray-400 italic">Content coming soon...</p>
        <ul className="space-y-2 list-disc list-inside">
          <li>Everyday meals vs. occasion-based dining</li>
          <li>How meal timing affects daily plans</li>
          <li>Areas people choose for food, not just famous dishes</li>
          <li>How food fits into a full-day route</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'things-to-know',
    icon: <Lightbulb className="h-5 w-5 text-gray-600" />,
    title: 'Things to know before you go',
    content: (
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
        <p className="text-gray-400 italic">Content coming soon...</p>
        <ul className="space-y-2 list-disc list-inside">
          <li>Transportation basics (T-money, trains)</li>
          <li>Seasonal considerations</li>
          <li>Cultural norms travelers often miss</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'how-it-works',
    icon: <Sparkles className="h-5 w-5 text-gray-600" />,
    title: 'How this planner works',
    content: (
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
        <p className="text-gray-400 italic">Content coming soon...</p>
        <ul className="space-y-2 list-disc list-inside">
          <li>How preferences shape the itinerary</li>
          <li>How pace and distance are considered</li>
          <li>How local context is applied</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'faq',
    icon: <HelpCircle className="h-5 w-5 text-gray-600" />,
    title: 'FAQ',
    content: (
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p className="text-gray-400 italic">Content coming soon...</p>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-700">How is this different from a tour itinerary?</p>
            <p className="text-gray-500 mt-1">TBD</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Can I adjust my plan later?</p>
            <p className="text-gray-500 mt-1">TBD</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Do I need exact dates?</p>
            <p className="text-gray-500 mt-1">TBD</p>
          </div>
        </div>
      </div>
    ),
  },
];

export function TravelGuideAccordion() {
  return (
    <motion.section
      className="space-y-6 px-4 md:px-0"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900">
          Plan Your Korea Trip
        </h3>
        <p className="text-xs md:text-base text-gray-600 max-w-2xl mx-auto">
          Everything you need to know before visiting Korea
        </p>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {guideSections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border-b border-gray-200"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <span className="text-base font-medium text-gray-900">
                    {section.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
}

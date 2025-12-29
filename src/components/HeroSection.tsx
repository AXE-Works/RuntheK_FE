import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Plane, MapPin, Heart, Star, Sparkles, Camera, Compass, Mountain, Map, Globe, Backpack, Train, Building2, TreePine, Waves } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import travelIcon1 from 'figma:asset/177ddc65e5d8b8b62892207d206d125838f7503f.png';
import travelIcon2 from 'figma:asset/f22cd6caca8a6adcf9d14066d71db254d1dd3efe.png';
import logo from 'figma:asset/ade16fc310679880d8b27a51a4119372559298ac.png';

interface HeroSectionProps {
  onStartPlanning: () => void;
}

// Enhanced travel icons with more symbolic elements
const travelIcons = [
  { icon: Plane, size: 'h-8 w-8', opacity: 0.08 },
  { icon: Camera, size: 'h-7 w-7', opacity: 0.06 },
  { icon: Compass, size: 'h-9 w-9', opacity: 0.07 },
  { icon: Mountain, size: 'h-8 w-8', opacity: 0.05 },
  { icon: Map, size: 'h-7 w-7', opacity: 0.08 },
  { icon: Globe, size: 'h-8 w-8', opacity: 0.06 },
  { icon: Backpack, size: 'h-7 w-7', opacity: 0.07 },
  { icon: Train, size: 'h-8 w-8', opacity: 0.05 },
  { icon: Building2, size: 'h-7 w-7', opacity: 0.06 },
  { icon: TreePine, size: 'h-8 w-8', opacity: 0.07 },
  { icon: Waves, size: 'h-7 w-7', opacity: 0.05 },
  { icon: MapPin, size: 'h-6 w-6', opacity: 0.08 }
];

const inspiringQuotes = [
  "Every journey begins with a single step",
  "Discover the magic of Korea",
  "Adventure awaits in the Land of Morning Calm",
  "Create memories that last a lifetime"
];

export function HeroSection({ onStartPlanning }: HeroSectionProps) {
  const { t } = useTranslation();
  const [currentQuote, setCurrentQuote] = useState(0);
  const [floatingIcons, setFloatingIcons] = useState<Array<{ 
    id: number; 
    IconComponent: any; 
    size: string;
    opacity: number;
    x: number; 
    y: number; 
    delay: number;
    rotation: number;
    scale: number;
  }>>([]);

  useEffect(() => {
    // Generate floating travel icons with varied sizes and positions
    const icons = Array.from({ length: 12 }, (_, i) => {
      const iconData = travelIcons[i % travelIcons.length];
      return {
        id: i,
        IconComponent: iconData.icon,
        size: iconData.size,
        opacity: iconData.opacity,
        x: Math.random() * 90 + 5, // Keep within 5-95% to avoid edge cutoffs
        y: Math.random() * 90 + 5,
        delay: Math.random() * 3,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.6 // Random scale between 0.8 and 1.4
      };
    });
    setFloatingIcons(icons);

    // Rotate quotes
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % inspiringQuotes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map((item) => (
          <motion.div
            key={item.id}
            className="absolute"
            style={{ 
              left: `${item.x}%`, 
              top: `${item.y}%`,
              opacity: item.opacity,
              transform: `scale(${item.scale}) rotate(${item.rotation}deg)`
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [item.rotation, item.rotation + 15, item.rotation - 15, item.rotation],
              scale: [item.scale, item.scale * 1.1, item.scale]
            }}
            transition={{
              duration: 8 + Math.random() * 4, // Varied duration 8-12 seconds
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut",
            }}
          >
            <item.IconComponent className={`${item.size} text-gray-400`} />
          </motion.div>
        ))}
        
        {/* Add Figma Assets as Additional Decorative Elements */}
        <motion.div
          className="absolute opacity-5"
          style={{ left: '15%', top: '20%' }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 10, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: 1,
            ease: "easeInOut",
          }}
        >
          <ImageWithFallback
            src={travelIcon1}
            alt="Travel decoration"
            className="w-16 h-16 opacity-30"
          />
        </motion.div>
        
        <motion.div
          className="absolute opacity-4"
          style={{ left: '75%', top: '60%' }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, -8, 5, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            delay: 2,
            ease: "easeInOut",
          }}
        >
          <ImageWithFallback
            src={travelIcon2}
            alt="Travel decoration"
            className="w-20 h-20 opacity-25"
          />
        </motion.div>
        
        {/* Additional large symbolic icons */}
        <motion.div
          className="absolute opacity-6"
          style={{ left: '85%', top: '15%' }}
          animate={{
            y: [0, -35, 0],
            rotate: [0, 12, -8, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            delay: 0.5,
            ease: "easeInOut",
          }}
        >
          <Plane className="w-12 h-12 text-gray-300" />
        </motion.div>
        
        <motion.div
          className="absolute opacity-5"
          style={{ left: '92%', top: '75%' }}
          animate={{
            y: [0, -22, 0],
            rotate: [0, 8, -12, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            delay: 3,
            ease: "easeInOut",
          }}
        >
          <Mountain className="w-14 h-14 text-gray-300" />
        </motion.div>
        
        <motion.div
          className="absolute opacity-3"
          style={{ left: '45%', top: '8%' }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, -6, 10, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            delay: 2.5,
            ease: "easeInOut",
          }}
        >
          <Compass className="w-11 h-11 text-gray-300" />
        </motion.div>
        
        {/* Korean Cultural Elements */}
        <motion.div
          className="absolute opacity-8"
          style={{ left: '25%', top: '85%' }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            delay: 4,
            ease: "easeInOut",
          }}
        >
          <div className="text-4xl opacity-15">🏯</div>
        </motion.div>
        
        <motion.div
          className="absolute opacity-7"
          style={{ left: '65%', top: '12%' }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, -8, 8, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            delay: 5,
            ease: "easeInOut",
          }}
        >
          <div className="text-3xl opacity-12">🌸</div>
        </motion.div>
        
        <motion.div
          className="absolute opacity-6"
          style={{ left: '12%', top: '40%' }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            delay: 6,
            ease: "easeInOut",
          }}
        >
          <div className="text-3xl opacity-10">🎒</div>
        </motion.div>
        
        <motion.div
          className="absolute opacity-5"
          style={{ left: '78%', top: '35%' }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, -12, 12, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            delay: 7,
            ease: "easeInOut",
          }}
        >
          <div className="text-2xl opacity-8">🍜</div>
        </motion.div>
        
        <motion.div
          className="absolute opacity-4"
          style={{ left: '55%', top: '82%' }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 6, -6, 0],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            delay: 8,
            ease: "easeInOut",
          }}
        >
          <div className="text-2xl opacity-6">📸</div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
        
        {/* Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 blur-3xl rounded-full opacity-50 pointer-events-none" />

        {/* Floating Elements Container */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          
          {/* Top Left - Suitcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -20, 0], rotate: -12 }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] left-[2%] md:left-[10%] w-42 md:w-60 z-10"
          >
            <div className="bg-white p-3 rounded-2xl shadow-xl rotate-[-6deg]">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-50">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1757865579170-8d64d9aab467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" 
                  alt="Travel Suitcase" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </motion.div>

          {/* Top Right - Pottery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, 25, 0], rotate: 12 }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[12%] right-[2%] md:right-[10%] w-48 md:w-72 z-10"
          >
            <div className="bg-white p-3 rounded-2xl shadow-xl rotate-[12deg]">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-50">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1607253852325-7b7c623a253e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" 
                  alt="Korean Pottery" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </motion.div>

          {/* Middle Left - Palace Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0, y: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[45%] left-[-30px] md:left-[5%] w-60 md:w-80 z-10 hidden md:block"
          >
            <div className="bg-white p-4 rounded-2xl shadow-2xl -rotate-6">
              <div className="aspect-video rounded-lg overflow-hidden mb-2">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1682648354214-a92f654a0c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" 
                  alt="Palace" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <p className="text-sm font-bold text-gray-400 text-center">{t('hero.palaceTour')}</p>
            </div>
          </motion.div>

          {/* Bottom Right - Bibimbap */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -15, 0], rotate: -5 }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-[10%] right-[5%] md:right-[15%] w-52 md:w-80 z-10"
          >
            <div className="relative">
               <ImageWithFallback 
                 src="https://images.unsplash.com/photo-1606687826420-9973a460fa70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" 
                 alt="Bibimbap" 
                 className="w-full h-full object-contain drop-shadow-2xl" 
               />
            </div>
          </motion.div>
          
          {/* Bottom Left - Fan */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, 20, 0], rotate: 15 }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[12%] left-[5%] md:left-[15%] w-42 md:w-64 z-10"
          >
             <div className="bg-white p-3 rounded-2xl shadow-xl rotate-6">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-50">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1600566977838-58ca846e9eb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" 
                  alt="Traditional Fan" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </motion.div>

           {/* Top Center - Mask (Small) */}
           <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute top-[8%] left-[45%] w-20 md:w-24 z-0 opacity-80 hidden md:block"
          >
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1700580446340-1bd00129863d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" 
              alt="Mask" 
              className="w-full h-full object-contain drop-shadow-lg" 
            />
          </motion.div>
        </div>

        {/* Central Content */}
        <div className="relative z-20 flex flex-col items-center text-center space-y-8 max-w-4xl px-4">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200 px-4 py-1 rounded-full mb-6 text-xs font-bold tracking-wider uppercase">
              {t('hero.badge')}
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black text-gray-900 tracking-tighter leading-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            RuntheK
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-500 font-bold tracking-[0.3em] uppercase max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {t('hero.tagline')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-4"
          >
            <Button
              onClick={onStartPlanning}
              className="h-14 px-12 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {t('hero.getStarted')}
            </Button>
          </motion.div>

          {/* Handdrawn arrow and text (simulated) */}
          <motion.div 
            className="absolute right-0 md:-right-32 top-[70%] hidden md:block transform rotate-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
             <div className="flex flex-col items-center">
                <p className="font-handwriting text-gray-500 text-sm mb-2">{t('hero.startJourney')} ⤵</p>
                <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 transform rotate-90">
                  <path d="M10 10 C 20 20, 40 10, 40 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M30 35 L 40 40 L 45 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-gray-50">
          <path d="M0,0V20c120,30,240,30,360,20s240-10,360,20s240,50,360,20s240-50,360,20v60H0V0z" />
        </svg>
      </div>
    </div>
  );
}
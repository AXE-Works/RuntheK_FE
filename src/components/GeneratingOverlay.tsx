import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin, Calendar, Star, CheckCircle, Lightbulb, Loader2 } from 'lucide-react';

interface GeneratingOverlayProps {
  isVisible: boolean;
  startTime: number | null;
}

interface Step {
  id: string;
  translationKey: string;
  icon: React.ComponentType<{ className?: string }>;
  startSecond: number;
  endSecond: number;
}

const STEPS: Step[] = [
  { id: 'analyzing', translationKey: 'form:generating.steps.analyzing', icon: Sparkles, startSecond: 0, endSecond: 8 },
  { id: 'findingDestinations', translationKey: 'form:generating.steps.findingDestinations', icon: MapPin, startSecond: 8, endSecond: 18 },
  { id: 'creatingItinerary', translationKey: 'form:generating.steps.creatingItinerary', icon: Calendar, startSecond: 18, endSecond: 30 },
  { id: 'addingRecommendations', translationKey: 'form:generating.steps.addingRecommendations', icon: Star, startSecond: 30, endSecond: 40 },
  { id: 'finalizing', translationKey: 'form:generating.steps.finalizing', icon: CheckCircle, startSecond: 40, endSecond: Infinity },
];

export function GeneratingOverlay({ isVisible, startTime }: GeneratingOverlayProps) {
  const { t } = useTranslation(['form', 'tips']);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Get generating tips from i18n
  const tips = useMemo(() => {
    const translatedTips = t('tips:generating', { returnObjects: true });
    return Array.isArray(translatedTips) ? translatedTips : [];
  }, [t]);

  // Calculate current step based on elapsed time
  const currentStepIndex = useMemo(() => {
    for (let i = STEPS.length - 1; i >= 0; i--) {
      if (elapsedSeconds >= STEPS[i].startSecond) {
        return i;
      }
    }
    return 0;
  }, [elapsedSeconds]);

  // Update elapsed time every 100ms
  useEffect(() => {
    if (!isVisible || !startTime) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedSeconds(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, startTime]);

  // Cycle tips every 6 seconds
  useEffect(() => {
    if (!isVisible || tips.length === 0) {
      setCurrentTipIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % tips.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isVisible, tips.length]);

  // Reset tip index when becoming visible
  useEffect(() => {
    if (isVisible) {
      setCurrentTipIndex(Math.floor(Math.random() * Math.max(1, tips.length)));
    }
  }, [isVisible, tips.length]);

  const CurrentStepIcon = STEPS[currentStepIndex].icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center max-w-md mx-4 px-8 py-8 text-center bg-white rounded-2xl shadow-2xl"
          >
            {/* Spinner with icon */}
            <div className="relative mb-8">
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-500"
              />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  key={currentStepIndex}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentStepIcon className="w-8 h-8 text-blue-500" />
                </motion.div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('form:generating.title')}
            </h2>

            {/* Steps progress */}
            <div className="w-full space-y-3 mb-8">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={false}
                    animate={{
                      opacity: isPending ? 0.4 : 1,
                    }}
                    className="flex items-center gap-3"
                  >
                    {/* Step indicator */}
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500'
                          : isCurrent
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    {/* Step text */}
                    <span
                      className={`text-sm text-left ${
                        isCompleted
                          ? 'text-green-600'
                          : isCurrent
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-400'
                      }`}
                    >
                      {t(step.translationKey)}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Travel tip section */}
            {tips.length > 0 && (
              <div className="w-full bg-amber-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-medium text-amber-700 mb-1">
                      {t('form:generating.tipPrefix')}
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentTipIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="text-sm text-amber-800"
                      >
                        {tips[currentTipIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* Wait message */}
            <p className="text-sm text-gray-500">
              {t('form:generating.pleaseWait')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

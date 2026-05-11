import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/header/LanguageSelector';
import { UserMenu } from '@/components/header/UserMenu';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/providers/AuthProvider';
import { useItineraryDraft } from '@/providers/ItineraryDraftProvider';
import logo from '@/assets/ade16fc310679880d8b27a51a4119372559298ac.png';

export function AppLayout() {
  const { isAuthModalOpen, login, closeAuthModal } = useAuth();
  const { currentItinerary, resetDraft } = useItineraryDraft();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBackToHome = () => {
    resetDraft();
    navigate('/plan');
  };

  const handleNewPlan = () => {
    resetDraft();
    navigate('/plan');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <motion.header
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex items-center cursor-pointer" onClick={handleBackToHome}>
                <img
                  src={logo}
                  alt="RuntheK - Your Personal Korea Travel Assistant"
                  className="h-5 sm:h-6 w-auto object-contain"
                />
                <span className="ml-2 text-xl sm:text-2xl font-semibold text-gray-900">Travel</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-4">
              <Badge variant="outline" className="hidden sm:inline-flex text-xs border-gray-300 text-gray-600">
                v1.0.0
              </Badge>

              <LanguageSelector />

              {currentItinerary && (
                <Button
                  variant="outline"
                  onClick={handleNewPlan}
                  className="hidden sm:flex border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {t('nav.newPlan')}
                </Button>
              )}

              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{t('stats.travelersHelped', { count: '5,234' })}</span>
              </div>

              <UserMenu />
            </div>
          </div>
        </div>
      </motion.header>

      <Outlet />

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <span className="text-[11px]">• {t('footer.poweredByAI')}</span>
              <span className="text-[11px]">• {t('footer.realTimeUpdates')}</span>
              <span className="text-[11px]">• {t('footer.support')}</span>
            </div>
            <p className="text-sm text-gray-500">
              {t('footer.copyright')} - {t('footer.tagline')}
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={(user) => {
          login(user);
          closeAuthModal();
        }}
      />
    </div>
  );
}

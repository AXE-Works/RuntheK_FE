import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useItineraryDraft } from '@/providers/ItineraryDraftProvider';
import { MyTrip } from '@/components/MyTrip';

export function MyTripsPage() {
  const { currentUser, updateUser, openAuthModal } = useAuth();
  const { resetDraft } = useItineraryDraft();
  const navigate = useNavigate();
  const location = useLocation();

  // 진입 시점의 URL search param 으로 초기 탭 결정. MyTrip 내부 tab 전환은
  // URL 동기화 없이 지역 state 만 갱신 (history entry 누적 회피).
  const initialTab =
    new URLSearchParams(location.search).get('tab') === 'profile' ? 'profile' : 'my-trips';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const handleCreateNewTrip = () => {
    resetDraft();
    navigate('/plan');
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
      <MyTrip
        currentUser={currentUser}
        onUpdateUser={updateUser}
        onCreateNewTrip={handleCreateNewTrip}
        onOpenAuthModal={openAuthModal}
        defaultTab={activeTab}
        onTabChange={setActiveTab}
      />
    </main>
  );
}

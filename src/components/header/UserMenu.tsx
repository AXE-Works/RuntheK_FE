import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, User, LogOut, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/AuthProvider';
import { useItineraryDraft } from '@/providers/ItineraryDraftProvider';

interface UserMenuProps {
  /**
   * 외부 logout 핸들러. 주입되면 자체 navigate+logout 대신 이것을 호출.
   *
   * 사용 이유: PR-7 C1 시점에는 UserMenu가 App.tsx 헤더에 mount되며,
   * 라우트 변경 시 App.tsx 인스턴스 자체가 unmount/remount된다. 자체
   * navigate('/plan')는 PlanPage/MyTripsPage가 서로 다른 컴포넌트라
   * 즉시 commit되지 않을 수 있어, await logout 내 setCurrentUser(null) 사이에
   * my-trips MyTrip이 currentUser=null 상태로 render되어 conditional hook이
   * 위반된다. App.tsx의 setActiveTab/setShowHero 동기 호출은 같은 App
   * 인스턴스 안에서 즉시 TabsContent를 unmount하므로 race가 없다.
   *
   * PR-7 C2에서 UserMenu가 AppLayout으로 이동하면 AppLayout 자체는 라우트
   * 변경에도 mount 유지되므로 onLogout 없이 자체 navigate 처리만으로 안전하다.
   */
  onLogout?: () => void | Promise<void>;
}

export function UserMenu({ onLogout }: UserMenuProps = {}) {
  const { currentUser, openAuthModal, logout } = useAuth();
  const { resetDraft } = useItineraryDraft();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isAdmin =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';

  const handleGoToProfile = () => {
    navigate('/my-trips?tab=profile');
  };

  const handleGoToAdmin = () => {
    navigate('/admin');
  };

  const handleGoToMyTrips = () => {
    navigate('/my-trips');
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
      return;
    }
    // MyTrip L230의 `if (!currentUser) return ...` 뒤에 L249의 useCallback이 정의되어 있어,
    // setCurrentUser(null)가 MyTrip mount 상태에서 트리거되면 "Rendered fewer hooks"
    // Rules of Hooks 위반이 폭발한다. await logout 전에 MyTripsPage가 unmount되어야 한다.
    //
    // navigate('/plan') 후 macrotask 양보(setTimeout 0)로 React가 라우트 변경의 commit
    // (MyTripsPage unmount + PlanPage mount)을 마치도록 보장한 뒤 logout()을 호출한다.
    // 이 패턴은 일정 저장 후 /my-trips로 URL이 실제로 이동했을 때만 효과가 있다 —
    // useConfirmItinerary 의 onSaveSuccess가 navigate('/my-trips')를 호출하도록 보장.
    navigate('/plan');
    resetDraft();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await logout();
  };

  if (!currentUser) {
    return (
      <Button
        onClick={openAuthModal}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 sm:px-4"
        size="sm"
      >
        <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">{t('nav.login')}</span>
        <span className="sm:hidden">{t('nav.login')}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full"
          data-testid="btn-user-menu"
        >
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-gray-100 text-gray-900 text-sm">
              {currentUser.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{currentUser.name}</p>
            <p className="w-[200px] truncate text-sm text-gray-600">
              {currentUser.email}
            </p>
            <Badge variant="outline" className="w-fit text-xs">
              {currentUser.country}
            </Badge>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleGoToProfile}>
          <User className="mr-2 h-4 w-4" />
          {t('nav.profile')}
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem onClick={handleGoToAdmin}>
            <Shield className="mr-2 h-4 w-4" />
            {t('nav.admin')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleGoToMyTrips}>
            <Settings className="mr-2 h-4 w-4" />
            {t('nav.myTrips')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

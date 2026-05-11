import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useEvents } from '@/providers/EventsProvider';
import { AdminDashboard } from '@/components/AdminDashboard';

export function AdminPage() {
  const { currentUser } = useAuth();
  const { events, setEvents } = useEvents();

  // 페이지 레벨 권한 가드. AdminDashboard 내부 거부 UI (L813) 는 보조 안전망.
  // AuthProvider 의 isRestoringSession=true 일 때 children 미 mount → 가드 race-free.
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin';
  if (!isAdmin) return <Navigate to="/plan" replace />;

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
      <AdminDashboard currentUser={currentUser} events={events} setEvents={setEvents} />
    </main>
  );
}

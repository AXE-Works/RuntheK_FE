import App from '@/App';

// Phase 2 PR-2: route skeleton wrapper. 작업 6(별도 세션)에서
// App.tsx의 admin 탭 본문을 이 컴포넌트로 이전하면서 권한 가드(Navigate to /plan)도 추가한다.
// 현재는 AdminDashboard 내부의 거부 UI(L811)가 비관리자 접근을 차단한다.
export function AdminPage() {
  return <App initialTab="admin" />;
}

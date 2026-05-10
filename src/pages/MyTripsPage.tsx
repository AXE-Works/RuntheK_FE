import App from '@/App';

// Phase 2 PR-2: route skeleton wrapper. 작업 6(별도 세션)에서
// App.tsx의 my-trips 탭 본문을 이 컴포넌트로 이전한다.
export function MyTripsPage() {
  return <App initialTab="my-trips" />;
}

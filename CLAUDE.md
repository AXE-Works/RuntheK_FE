# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status — React + Vite → Next.js 마이그레이션 진행 중

이 프론트엔드는 **React + Vite에서 Next.js로 마이그레이션 중**입니다. 모든 비-trivial 변경 전에 `../docs/NextJS_Migration_Plan/` 문서를 먼저 읽고, 자신이 진행할 phase의 명세 범위를 벗어나지 마세요.

### 마이그레이션 단계

| Phase | 문서 | 상태 |
|---|---|---|
| Phase 1 — 사전 정리 | `phase-1-cleanup.md` | ✅ DONE (`Phase1` 브랜치 9 커밋) |
| Phase 1.5 — E2E test 셋업 | `phase-1.5-e2e.md` | ✅ DONE (`Phase1.5` 브랜치 4 FE + 1 BE 커밋) |
| Phase 2 — App.tsx 분리 | `phase-2-app-split.md` | 대기 |
| Phase 3 — Next.js 골격 + Tailwind v4 정상화 | `phase-3-scaffold.md` | 대기 |
| Phase 4 — Client/Server 경계 + i18n 전환 | `phase-4-client-boundary.md` | 대기 |
| Phase 5 — Infra (토큰/인증/refresh) | `phase-5-infra.md` | 대기 (5-K는 Phase 1 PR-6c로 선행 완료) |
| Phase 6 — Maps SDK 전환 | `phase-6-maps.md` | 대기 |
| Phase 7 — Deploy + cookie auth | `phase-7-deploy.md` | 대기 |

> 단일 진실 공급원: `../docs/NextJS_Migration_Plan/nextjs-migration-overview.md` §0 Canonical Decisions

### Phase 1 결과 — 진입 시 이미 적용된 가정

| 항목 | 위치 | 비고 |
|---|---|---|
| Path alias | `@/*` → `src/*` | `vite.config.ts` runtime + `tsconfig.json` paths 양쪽 등록. **`figma:asset/*`** 및 **버전 suffix(`vaul@1.1.2` 등) alias 모두 제거됨 — 재도입 금지** |
| Env 진입점 | `src/config/env.ts` | 모든 환경변수의 단일 모듈. `import.meta.env` 직접 참조 금지. 새 환경변수도 여기에 추가 |
| TypeScript | `tsconfig.json` + `src/vite-env.d.ts` | `npm run typecheck` 가능. Phase 3 Next.js 이전 시 `vite-env.d.ts` 삭제 예정 |
| 401 token refresh | `utils/api.ts:refreshAccessToken` | shared `pendingRefresh` promise. 동시 401은 같은 promise를 await. **별도 subscriber 패턴 도입 금지** |
| Multipart 업로드 | `utils/api.ts:uploadWithAuth` | **`fetch` 직접 호출 금지.** 5곳(`uploadFile` + adminApi 4 with-file 함수)이 helper로 일원화됨 |
| AI 서버 fallback | `env.scheduleApiBaseUrl` / `env.promptApiBaseUrl` | 둘 다 `runthek-api.onrender.com/api/v1`. **BE URL fallback 금지** (5-H 정정) |

### Phase 1.5 결과 — E2E 회귀 안전망

| 항목 | 위치 | 비고 |
|---|---|---|
| E2E 도구 | `@playwright/test@1.59.1` + `playwright.config.ts` (chromium only) | `npm run e2e` / `e2e:ui` / `e2e:codegen` |
| 골든패스 시나리오 | `tests/e2e/golden-path-plan.spec.ts` | login → plan → save → my-trips. 모든 BE/AI 호출은 `page.route()` fixture stub |
| BE/AI 응답 fixture | `tests/e2e/fixtures/{auth,users,schedule,trips}/*.json` (6개) | 실제 BE shape 기반. 변경 시 `npm run e2e:fixture-capture` 후 검토 |
| BE 시드 계정 | `BE_Korea_Travel_AI_Assistant/.../E2eAccountInitializer.java` | `@Profile("dev")` ApplicationRunner — `e2e-user@runthek.test` / `e2e-admin@runthek.test` (둘 다 `Test1234!`) |
| 안정 selector | TravelPlanForm/ItineraryDisplay에 `data-testid` 5건 | `interest-*` / `style-*` / `city-*` / `btn-generate` / `btn-save-itinerary` — i18n 변경/Phase 2 리팩터링에도 안정 |
| GitHub Actions | `.github/workflows/e2e-pr.yml` (PR fixture stub) + `e2e-nightly.yml` (cron 17:00 UTC, real BE) | branch protection 등록은 Phase 2 PR-8 머지 후 |
| Phase 1.5 backlog | sonner `<Toaster />` 미마운트 / "3 days days" 중복 텍스트 / BE/FE snake↔camel drift (`trip_id` vs `tripId`) | 별도 이슈, 마이그레이션과 무관 |

### Phase 1 종료 시점 의도적 부채 — 절대 손대지 말 것

- **`src/styles/globals.css`** (218 lines, `@theme inline`/`@custom-variant` v4 source) — 어디에서도 import되지 않음. Tailwind v4 빌드 파이프라인 자체가 부재(`tailwindcss`/`@tailwindcss/postcss` deps 0건). 현 dev/build는 사전 컴파일된 `src/index.css` (5,487 lines) 사용. **Phase 3 PR-1.5에서 `@tailwindcss/postcss` 정식 도입.**
- **`App.tsx` (1,052 lines)** — 모든 글로벌 상태 + 라우팅 분기. **Phase 2에서 라우트별 분리.** Phase 1/3 작업 중에 함부로 손대지 말 것.
- **누적 TS 에러 4,590건** — `npm run typecheck` 결과는 인벤토리 상태. ~94%(4,212건)가 `@types/react`/`@types/react-dom` 부재로 단일 fix 가능. **마이그레이션 PR 비대화 방지를 위해 본 작업과 별개 backlog로 분리.**

## Tech Stack (현재 — Vite 기반)

- **Build:** Vite 6.3.5 + SWC (Phase 3에서 Next.js로 전환)
- **Framework:** React 18.3.1 + TypeScript 5.9
- **Routing:** Hybrid — `react-router-dom` v6 `BrowserRouter` (`src/main.tsx`, 7 routes: `/seoul`, `/busan`, `/gyeongju`, `/jeonju`, `/jeju`, `/destination/:slug`, `/verify-email`) + `App.tsx` catch-all (`path="/*"`) 내부에서 tab state(`activeTab`: `"plan" | "my-trips" | "admin"`)로 화면 전환. **Phase 2/3에서 Next.js App Router로 일괄 교체.**
- **Styling:** Tailwind v4 (사전 컴파일 산출물 `src/index.css` 사용 — 빌드 파이프라인은 Phase 3에서 정식 도입)
- **i18n:** i18next + i18next-browser-languagedetector (EN/KO/JA/ZH 4개 locale, localStorage key `i18nextLng`). **Phase 4에서 next-intl로 교체 예정.**
- **UI:** Radix UI primitives 35+ + class-variance-authority(CVA)
- **Maps:** @react-google-maps/api (Phase 6에서 SDK 전환 검토)
- **Animations:** motion library
- **Forms:** react-hook-form
- **Charts:** Recharts (admin)
- **Icons:** lucide-react
- **Notifications:** sonner

## 명령어

```bash
npm install
npm run dev                  # localhost:3000 (auto-open)
npm run build                # Vite production build → /build
npm run typecheck            # tsc --noEmit (인벤토리 — 누적 에러 fix는 별도 작업)
npm run e2e                  # Playwright golden path (login → plan → save → my-trips)
npm run e2e:ui               # Playwright UI mode (interactive debugging)
npm run e2e:codegen          # Playwright recorder against http://localhost:3000
npm run e2e:fixture-capture  # 로컬 BE에서 응답 캡처 → tests/e2e/fixtures/ 갱신
npm run e2e:fixture-diff     # 로컬 BE 응답 vs 캡처 fixture shape diff (Nightly용)
```

## Path Alias

```ts
'@/*' → 'src/*'   // vite.config.ts + tsconfig.json paths
```

새 모듈은 가능한 절대 경로(`@/...`)로 import. 같은 폴더 내부는 상대 경로 OK.

## 환경 변수 — `src/config/env.ts` 단일 진입점

```ts
import { env } from '@/config/env';

env.apiBaseUrl            // VITE_API_BASE_URL          → BE
env.scheduleApiBaseUrl    // VITE_AI_API_BASE_URL       → AI 서버 (schedule)
env.promptApiBaseUrl      // VITE_AI_API_BASE_URL       → AI 서버 (prompt)
env.googleMapsApiKey      // VITE_GOOGLE_MAPS_API_KEY
env.googleClientId        // VITE_GOOGLE_CLIENT_ID
```

> Phase 3 마이그레이션 시 `readEnv` 본문만 `process.env.NEXT_PUBLIC_*` 참조로 교체. 호출처 8개 파일은 손대지 않음 — **이것이 본 격리의 핵심 가치**. 새 변수 추가 시 이 패턴을 따라 `env` 객체에 항목 추가.

## API & 인증

### 일반 호출
```ts
import { fetchWithAuth, API_BASE_URL } from '@/utils/api';

const res = await fetchWithAuth(`${API_BASE_URL}/users/profile`);
```
- `Authorization: Bearer <accessToken>` 자동 주입 (localStorage에서 읽음)
- `credentials: 'include'` 자동 부여 (httpOnly refreshToken 쿠키 동봉)
- 401 발생 시 `refreshAccessToken()` 자동 호출 → shared `pendingRefresh` promise. 성공 시 retry, 실패 시 `auth:logout` event dispatch. **listener는 idempotent해야 함** (동시 401 수만큼 dispatch될 수 있음)

### Multipart 업로드
```ts
import { uploadWithAuth, API_BASE_URL } from '@/utils/api';

const formData = new FormData();
formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
formData.append('file', file);

// POST (default)
const res = await uploadWithAuth(`${API_BASE_URL}/admin/files/upload`, formData);

// PUT
const res = await uploadWithAuth(url, formData, { method: 'PUT' });
```
- ❌ **`fetch` 직접 호출로 multipart 보내지 말 것** (Phase 1 PR-6d로 5곳 모두 helper로 일원화됨)
- `Content-Type` 헤더는 helper가 강제 제거 — 브라우저가 boundary와 함께 자동 설정 (caller가 잘못 넘겨도 안전)
- 401 자동 갱신 + `credentials: 'include'` 적용

### Token storage
- `accessToken`: localStorage (Phase 5에서 in-memory/Cookie 검토 — `phase-5-infra.md`)
- `refreshToken`: httpOnly cookie (`Path=/api/v1/auth`) — 코드에서 직접 읽기 불가

## API Ownership (overview §0.3)

| 호출처 | 대상 서버 | base URL |
|---|---|---|
| `utils/api.ts:fetchWithAuth` (모든 일반 호출) | BE (Spring Boot) | `env.apiBaseUrl` |
| `services/scheduleApi.ts` | AI 서버 | `env.scheduleApiBaseUrl` |
| `services/promptApi.ts` | AI 서버 | `env.promptApiBaseUrl` |

> `services/promptApi.ts`는 `fetchWithAuth` 사용 (관리자 인증 필요), 단 base URL은 AI 서버. `scheduleApi.ts`는 cookie 인증 불필요.

## 주요 데이터 타입

```typescript
interface ItineraryData {
  id: string;
  title: string;
  duration: string;
  interests: string[];
  budget: string;
  days: { day: number; title: string; activities: Activity[] }[];
  totalEstimatedCost: string;
}

interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost: string;
  googleMapsUrl?: string;       // Format: https://maps.google.com/?q=lat,lng
  transportMode?: 'walking' | 'transit' | 'driving';
}
```

## localStorage keys

- `confirmedTrips` — 사용자 저장 일정
- `accessToken` — JWT access (5h)
- `i18nextLng` — i18next language detector

## 컴포넌트 구조 (현재 — Phase 2에서 분리 예정)

```
App.tsx (1,052 lines, all global state)
├── HeroSection — Landing page with animated travel icons
├── AuthModal — Google OAuth + email signup
├── Tabs
│   ├── Plan Trip
│   │   ├── TravelPlanForm — 6-step wizard
│   │   ├── PopularDestinations / SuggestedBanners / RecommendedTours
│   │   └── ItineraryDisplay
│   │       └── ItineraryMap — Google Maps + routes
│   ├── My Trips → MyTrip
│   └── Admin (관리자) → AdminDashboard (8 tabs)
```

App.tsx 글로벌 상태: `currentItinerary`, `currentUser`, `activeTab`, `confirmedTrips`, `events`, `selectedDestination`.

## UI 패턴

- Radix UI 래퍼는 `src/components/ui/`에 위치. 새 컴포넌트는 기존 wrapper를 우선 활용 + CVA variant 패턴.
- 조건부 클래스는 `src/lib/utils.ts`의 `cn()` helper 사용.

## 언어 정책

- **Customer UI** (Plan Trip / My Trips): English only
- **Admin Dashboard** (관리자용): Korean only — 8 tabs: 사용자, 여행일정, 평점, 목적지, 이벤트, 이벤트 설정, 시스템, 인기활동

## 도메인 상수

- **Cities (15)**: Seoul, Busan, Jeju Island, Gyeongju, Incheon, Daegu, Daejeon, Gwangju, Jeonju, Gangneung, Sokcho, Suwon, Andong, Tongyeong, Yeosu
- **Interests (8)**: food, culture, nature, shopping, nightlife, kculture, wellness, adventure
- **Budget**: budget, mid-range, luxury
- **Duration**: 3 days, 5 days, 7 days, 10+ days

## Backend Integration

대부분 데이터는 클라이언트 mock 상태. BE API 명세는:
- `../BE_Korea_Travel_AI_Assistant/FE_DocumentationForBE/API_SPECIFICATION.md`
- `../BE_Korea_Travel_AI_Assistant/FE_DocumentationForBE/DB_SCHEMA.md`
- `../BE_Korea_Travel_AI_Assistant/FE_DocumentationForBE/PAGE_STRUCTURE.md`

## 마이그레이션 작업 시 행동 원칙

1. **Phase 경계를 지킬 것** — 진행 중인 phase 명세 외 영역은 손대지 말 것. 특히:
   - Phase 1 종료 시점 부채(`globals.css`, App.tsx, 누적 TS 에러)는 해당 phase가 처리할 때까지 보존.
   - 다른 phase 인계 사항(`overview.md` §7.9 누적 결정)이 깨지지 않도록 주의.
2. **이미 적용된 Phase 1 패턴 재구현 금지** — `uploadWithAuth`, `env.*`, shared `pendingRefresh` 등 helper가 있으면 그것을 사용. `fetch` 직접 호출, `import.meta.env` 직접 참조, 별도 subscriber 패턴 등 도입 금지.
3. **마이그레이션 외 backlog는 별도 이슈로 분리** — 누적 TS 에러 fix, BE SecurityConfig 누락(`/api/v1/auth/resend-verification`), `/api/v1/admin/prompts` 컨트롤러 0건, RateLimitFilter / FileUploadService 검증 등은 본 마이그레이션 외 backlog.
4. **검증** — `npm run build` 통과 + 4개 골든 패스 (메인 / Plan Trip → AI 일정 생성 / 일정 상세 지도 렌더 / 로그인+이메일 인증 / 관리자 대시보드).
5. **새 패키지 설치 전 사용자 통지** (글로벌 CLAUDE.md 조항) — typescript / @types/* / next 등.

## 참조 문서

- `../CLAUDE.md` — 모노레포 루트 (FE + BE 합본 가이드)
- `../docs/NextJS_Migration_Plan/nextjs-migration-overview.md` — §0 Canonical Decisions, §0.1 App Router Tree, §0.3 API Ownership, §0.4 FE Folder, §7.9 누적 결정
- `../docs/NextJS_Migration_Plan/phase-{1..7}-*.md` — 각 phase 상세 명세
- `../BE_Korea_Travel_AI_Assistant/FE_DocumentationForBE/` — API 명세 + DB 스키마

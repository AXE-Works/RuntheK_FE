# Korea Travel AI Assistant - 페이지 구조 분석

> BE 서버 개발을 위한 FE 페이지별 데이터 요구사항 분석

---

## API 도출 기준

> **비즈니스 관점**: UI에 기능이 존재하면 해당 기능을 위한 API가 필요함.
> 현재 mock/localStorage로 처리된 부분은 서버 API로 대체되어야 함.

| 현재 FE 구현 | API 필요 여부 |
|--------------|---------------|
| localStorage 사용 | ✅ 서버 API로 대체 |
| mock 데이터 하드코딩 | ✅ 서버 API로 대체 (관리자가 관리) |
| UI에 기능 존재 | ✅ 해당 기능 API 필요 |
| 상수 데이터 (도시, 관심사 등) | ❌ FE 상수로 유지 가능 |

---

## 전체 구조 개요

```
App.tsx (Root)
├── HeroSection (랜딩 페이지)
├── AuthModal (인증 모달)
├── Header (네비게이션 + 사용자 메뉴)
└── Tabs (메인 네비게이션)
    ├── Plan Trip (여행 계획)
    ├── My Trips (내 여행)
    └── Admin (관리자) - 관리자 전용
```

---

## 1. 인증 시스템 (AuthModal.tsx)

### 1.1 컴포넌트 구조
```
AuthModal
├── SignIn Tab
│   ├── Google OAuth 버튼
│   └── Email 로그인 폼 (email, password)
└── SignUp Tab
    ├── Step 1: 회원가입 폼 (name, email, password, country)
    └── Step 2: 이메일 인증 확인 버튼
```

### 1.2 사용자 데이터 구조
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  country: string;      // 국적 (150+ 국가)
  avatar?: string;      // 프로필 이미지 URL
  provider: 'google' | 'email';
  createdAt?: Date;
}
```

### 1.3 필요 API (6개)

| API | Method | 설명 | 비즈니스 근거 |
|-----|--------|------|---------------|
| `/auth/google` | POST | Google OAuth 콜백 | Google 로그인 지원 |
| `/auth/signup` | POST | 회원가입 + 이메일 발송 | 이메일 회원가입 (폼 한번에 제출) |
| `/auth/verify` | POST | 이메일 인증 확인 | 이메일 링크/버튼 클릭 시 인증 완료 |
| `/auth/login` | POST | 이메일 로그인 | 이메일 로그인 |
| `/auth/me` | GET | 현재 사용자 정보 | 앱 시작 시 로그인 상태 확인 |
| `/auth/logout` | POST | 로그아웃 | 토큰 무효화 |

> **변경사항**: 기존 `/auth/signup/email` + `/auth/signup/verify` + `/auth/signup/complete` 3단계를
> `/auth/signup` + `/auth/verify` 2단계로 통합 (FE에서 한번에 폼 제출)

---

## 2. Plan Trip 탭

### 2.1 컴포넌트 구조
```
Plan Trip Tab
├── TravelPlanForm (6단계 여행 계획 폼)
│   ├── Step 1: 기본 정보 (시작일, 기간)
│   ├── Step 2: 도시 선택
│   ├── Step 3: 관심사 선택
│   ├── Step 4: 예산 선택
│   ├── Step 5: 국적 선택
│   └── Step 6: 추가 요청사항
├── PopularDestinations (인기 목적지)
├── SuggestedBanners (추천 여행 코스)
├── RecommendedTours (추천 투어) - 미구현
└── ItineraryDisplay (생성된 일정 표시)
```

### 2.2 TravelPlanForm 입력 데이터
```typescript
interface UserInput {
  startDate?: Date;           // 여행 시작일
  duration: string;           // "3 days", "5 days", "7 days", "10+ days"
  cities: string[];           // 선택한 도시들
  interests: string[];        // 선택한 관심사들
  budget: string;             // "budget" | "mid-range" | "luxury"
  nationality?: string;       // 국적
  additionalNotes?: string;   // 추가 요청사항 (최대 500자)
}
```

### 2.3 도시 목록 (15개)
```typescript
const CITIES = [
  'Seoul', 'Busan', 'Jeju Island', 'Gyeongju', 'Incheon',
  'Daegu', 'Daejeon', 'Gwangju', 'Jeonju', 'Gangneung',
  'Sokcho', 'Suwon', 'Andong', 'Tongyeong', 'Yeosu'
];
```

### 2.4 관심사 목록 (8개)
```typescript
const INTERESTS = [
  { id: 'food', label: 'Food & Cuisine' },
  { id: 'culture', label: 'Culture & History' },
  { id: 'nature', label: 'Nature & Outdoors' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'kculture', label: 'K-Culture' },
  { id: 'wellness', label: 'Wellness & Relaxation' },
  { id: 'adventure', label: 'Adventure Activities' }
];
```

### 2.5 PopularDestinations 데이터
```typescript
interface Destination {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  rating: number;             // 4.6 ~ 4.9
  visitors: string;           // "12M+", "8M+", etc.
  highlights: string[];       // 주요 명소 3개
  recommendedInterests: string[];
  recommendedDuration: string;
  image: string;
  countryPreferences?: {      // 국가별 선호도 (Seoul만)
    country: string;
    flag: string;
    percentage: number;
    reason: string;
  }[];
  detailedSchedule: DaySchedule[];
}

interface DaySchedule {
  day: number;
  title: string;
  activities: {
    time: string;
    name: string;
    description: string;
  }[];
}
```

### 2.6 SuggestedBanners 데이터
```typescript
interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  duration: string;
  visitors: string;
  rating: number;
  highlights: string[];
  category: 'Urban' | 'Nature' | 'Cultural' | 'Food' | 'Historical' | 'Coastal';
  userId: string;             // 생성한 사용자
  createdAt: string;
  isEditable: boolean;
  detailedSchedule: DaySchedule[];
}
```

### 2.7 ItineraryDisplay (AI 생성 일정)
```typescript
interface ItineraryData {
  id: string;
  title: string;
  duration: string;
  interests: string[];
  budget: string;
  days: {
    day: number;
    title: string;
    activities: Activity[];
  }[];
  totalEstimatedCost: string;
  createdAt?: Date;
  userId?: string;
}

interface Activity {
  time: string;               // "09:00", "14:00"
  activity: string;           // 활동명
  location: string;           // 장소
  description: string;        // 설명
  estimatedCost: string;      // "₩15,000", "Free"
  isEvent?: boolean;          // 이벤트 여부
  eventType?: string;         // 이벤트 타입
  eventId?: string;           // 연결된 이벤트 ID
}
```

### 2.8 Plan Trip 필요 API (6개)

| API | Method | 설명 | 비즈니스 근거 |
|-----|--------|------|---------------|
| `/destinations` | GET | 인기 목적지 목록 | 관리자가 목적지 관리 (현재 하드코딩) |
| `/destinations/:id` | GET | 목적지 상세 + 추천 일정 | 목적지별 상세 정보 제공 |
| `/banners` | GET | 추천 여행 코스 목록 | 관리자가 배너 관리 (현재 하드코딩) |
| `/banners/:id` | GET | 배너 상세 정보 | 배너 클릭 시 상세 일정 표시 |
| `/itinerary/generate` | POST | AI 일정 생성 | 핵심 기능 - AI 기반 일정 생성 |
| `/itinerary/regenerate` | POST | 수정사항 반영 재생성 | 사용자 피드백으로 일정 수정 |

---

## 3. My Trips 탭 (MyTrip.tsx)

### 3.1 컴포넌트 구조
```
My Trips Tab
├── Sub Tabs
│   ├── My Trips (내 여행)
│   │   ├── Trip Cards List
│   │   └── TripDetailView (상세 보기)
│   ├── Bookmarks (북마크)
│   │   └── 다른 사용자의 저장된 여행
│   └── Profile (프로필)
│       └── 사용자 정보 편집
└── "Create New Trip" 버튼 → Plan Trip으로 이동
```

### 3.2 Trip Card 데이터
```typescript
interface ConfirmedTrip extends ItineraryData {
  confirmedAt: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
  startDate?: Date;
  ratings?: ActivityRating[];   // 활동별 평점
}

interface ActivityRating {
  dayIndex: number;
  activityIndex: number;
  rating: number;               // 1-5 별점
  review?: string;
}
```

### 3.3 Profile 데이터
```typescript
interface UserProfile extends User {
  bio?: string;
  tripCount: number;
  totalCountriesVisited?: number;
  preferences?: {
    interests: string[];
    budgetPreference: string;
  };
}
```

### 3.4 My Trips 필요 API (11개)

| API | Method | 설명 | 비즈니스 근거 |
|-----|--------|------|---------------|
| `/trips` | GET | 내 여행 목록 | 확정된 여행 목록 표시 (현재 localStorage) |
| `/trips/:id` | GET | 여행 상세 | 대용량 일정 데이터 최적화 |
| `/trips` | POST | 여행 확정 (저장) | 생성된 일정 저장 (현재 localStorage) |
| `/trips/:id` | PUT | 여행 수정 | 일정 변경 기능 |
| `/trips/:id` | DELETE | 여행 삭제 | 여행 삭제 기능 |
| `/trips/:id/ratings` | POST | 활동 평점 저장 | 활동별 별점/리뷰 (현재 localStorage) |
| `/bookmarks` | GET | 북마크 목록 | 저장한 다른 사용자 여행 (Bookmarks 탭) |
| `/bookmarks/:tripId` | POST | 북마크 추가 | "Save to My Trips" 버튼 |
| `/bookmarks/:tripId` | DELETE | 북마크 삭제 | 북마크 해제 |
| `/users/profile` | GET | 프로필 조회 | Profile 탭 표시 |
| `/users/profile` | PUT | 프로필 수정 | "Save Changes" 버튼 |

---

## 4. Admin Dashboard (AdminDashboard.tsx)

### 4.1 컴포넌트 구조
```
Admin Dashboard (관리자)
├── 8개 탭
│   ├── 사용자 (users)
│   ├── 여행일정 (itineraries)
│   ├── 평점 (ratings)
│   ├── 목적지 (destinations)
│   ├── 이벤트 (events)
│   ├── 이벤트 설정 (event-settings)
│   ├── 시스템 (system)
│   └── 인기활동 (popular-activities)
└── 통계 대시보드
```

### 4.2 사용자 탭 (users)
```typescript
interface AdminUser extends User {
  status: 'active' | 'inactive' | 'banned';
  signupDate: string;
  lastActive: string;
  tripCount: number;
  totalRatings: number;
}

// 테이블 컬럼: 이름, 이메일, 국적, 가입일, 상태, 액션
```

### 4.3 여행일정 탭 (itineraries)
```typescript
interface AdminItinerary extends ItineraryData {
  userId: string;
  userName: string;
  userEmail: string;
  confirmedAt: Date;
  status: 'active' | 'completed' | 'cancelled';
}

// 검색: 제목, 사용자명, 도시
// 필터: 상태, 기간
```

### 4.4 평점 탭 (ratings)
```typescript
interface AdminRating {
  id: string;
  tripId: string;
  tripTitle: string;
  userId: string;
  userName: string;
  activityName: string;
  location: string;
  rating: number;
  review?: string;
  createdAt: Date;
}

// 통계: 평균 평점, 총 리뷰 수, 평점 분포
```

### 4.5 목적지 탭 (destinations)
```typescript
interface AdminDestination extends Destination {
  totalVisitors: number;
  totalTrips: number;
  averageRating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// CRUD: 목적지 추가/수정/삭제
```

### 4.6 이벤트 탭 (events)
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  type: string;               // "festival", "promotion", "exhibition", etc.
  location: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  budget: string;
  targetAudience: string;
  expectedParticipants: number;
  organizer: string;
  contactEmail: string;
  website?: string;
  specialConditions?: string;
  isWeatherDependent: boolean;
  ageRestriction?: string;
  status: 'draft' | 'active' | 'ended' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.7 이벤트 설정 탭 (event-settings)
```typescript
interface EventSettings {
  maxEventsPerDay: number;
  defaultEventDuration: number;
  eventCategories: string[];
  notificationSettings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  integrationSettings: {
    autoAddToItinerary: boolean;
    priorityLevel: 'low' | 'medium' | 'high';
  };
}
```

### 4.8 시스템 탭 (system)
```typescript
interface SystemStatus {
  services: {
    name: string;           // "API Server", "Database", "AI Service", etc.
    status: 'operational' | 'degraded' | 'down';
    latency?: number;
    lastChecked: Date;
  }[];
  serverLoad: {
    cpu: number;
    memory: number;
    disk: number;
  };
  alerts: {
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }[];
  traffic: {
    hourly: number[];
    daily: number[];
  };
}
```

### 4.9 인기활동 탭 (popular-activities)
```typescript
interface PopularActivity {
  rank: number;
  activityName: string;
  location: string;
  category: string;
  totalBookings: number;
  averageRating: number;
  ratingCount: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

// 차트: 활동별 예약 추이, 평점 분포, 카테고리별 통계
```

### 4.10 Admin 필요 API (22개)

#### 사용자 관리 (4개)
| API | Method | 설명 | 비즈니스 근거 |
|-----|--------|------|---------------|
| `/admin/users` | GET | 사용자 목록 | 사용자 탭 테이블 (현재 mockUsers) |
| `/admin/users/:id` | GET | 사용자 상세 + 여행 이력 | 사용자 상세 모달 |
| `/admin/users/:id/status` | PATCH | 계정 활성화/비활성화 | 상태 토글 버튼 |
| `/admin/users/:id` | DELETE | 사용자 삭제 | 삭제 버튼 |

#### 여행일정 관리 (4개)
| API | Method | 설명 | 비즈니스 근거 |
|-----|--------|------|---------------|
| `/admin/itineraries` | GET | 전체 여행 목록 | 여행일정 탭 (현재 localStorage) |
| `/admin/itineraries/:id` | GET | 여행 상세 | 상세 보기 모달 |
| `/admin/itineraries` | POST | 관리자 여행 추가 | "여행 추가" 버튼 |
| `/admin/itineraries/:id` | DELETE | 여행 삭제 | 삭제 기능 |

#### 평점 관리 (3개)
| API | Method | 설명 | 비즈니스 근거 |
|-----|--------|------|---------------|
| `/admin/ratings` | GET | 전체 평점 목록 | 평점 탭 테이블 (현재 localStorage) |
| `/admin/ratings/stats` | GET | 평점 통계 | 평균, 분포, 트렌드 차트 |
| `/admin/ratings/:id` | DELETE | 부적절한 리뷰 삭제 | 리뷰 관리 |

#### 목적지 관리 (4개)
| API | Method | 설명 | 비즈니스 근거 |
|-----|--------|------|---------------|
| `/admin/destinations` | GET | 목적지 목록 | 목적지 탭 (현재 하드코딩) |
| `/admin/destinations` | POST | 목적지 추가 | 신규 목적지 등록 |
| `/admin/destinations/:id` | PUT | 목적지 수정 | 정보 업데이트 |
| `/admin/destinations/:id` | DELETE | 목적지 삭제 | 목적지 비활성화 |

#### 이벤트 관리 (5개)
| API | Method | 설명 | 비즈니스 근거 |
|-----|--------|------|---------------|
| `/admin/events` | GET | 이벤트 목록 | 이벤트 탭 (props로 전달) |
| `/admin/events` | POST | 이벤트 생성 | EventForm 제출 |
| `/admin/events/:id` | GET | 이벤트 상세 | 상세 보기 |
| `/admin/events/:id` | PUT | 이벤트 수정 | 이벤트 편집 |
| `/admin/events/:id` | DELETE | 이벤트 삭제 | 삭제 버튼 |

#### 시스템/통계 (2개)
| API | Method | 설명 | 비즈니스 근거 |
|-----|--------|------|---------------|
| `/admin/system/status` | GET | 시스템 상태 | 시스템 탭 - 서비스 모니터링 |
| `/admin/activities/popular` | GET | 인기 활동 순위 | 인기활동 탭 (현재 localStorage 집계) |

---

## 5. 공통 컴포넌트

### 5.1 Header
```
Header
├── Logo (클릭 시 Hero로)
├── Navigation Tabs
│   ├── Plan Trip
│   ├── My Trips (로그인 시)
│   └── Admin (관리자만)
├── User Menu (로그인 시)
│   ├── Profile
│   ├── Settings
│   └── Logout
└── Sign In 버튼 (비로그인 시)
```

### 5.2 ItineraryDetailModal
- 여행 일정 상세 모달
- 일별 활동 목록
- Google Maps 연동
- 활동별 평점 매기기
- PDF 다운로드

---

## 6. 데이터 흐름 요약

```
1. 사용자 인증
   AuthModal → /auth/* APIs → User 데이터 저장

2. 여행 계획 생성
   TravelPlanForm → /itinerary/generate → ItineraryData 수신
   ↓
   ItineraryDisplay에서 확인/수정
   ↓
   확정 시 → /trips POST → confirmedTrips에 저장

3. 내 여행 관리
   MyTrip → /trips GET → 여행 목록 표시
   ↓
   상세 보기 → /trips/:id GET
   ↓
   평점 매기기 → /trips/:id/ratings POST

4. 관리자 기능
   AdminDashboard → /admin/* APIs → 데이터 CRUD
```

---

## 7. LocalStorage 사용 현황 (BE 마이그레이션 필요)

| Key | 현재 용도 | 마이그레이션 대상 API |
|-----|----------|----------------------|
| `confirmedTrips` | 확정된 여행 목록 | `/trips` |
| `tripRatings` | 여행 전체 평점 | `/trips/:id/ratings` |
| `activityRatings` | 활동별 평점/리뷰 | `/trips/:id/ratings` |
| `hasAddedSampleTrips` | 샘플 데이터 여부 | 서버 초기화 시 처리 |
| 사용자 세션 | 로그인 상태 | JWT/Session |

---

## 8. API 요약 (고객용 / 관리자용 분류)

### 8.1 고객용 API (Customer) - 23개

| 분류 | API | Method | 설명 |
|------|-----|--------|------|
| **인증** | `/auth/google` | POST | Google OAuth |
| | `/auth/signup` | POST | 회원가입 |
| | `/auth/verify` | POST | 이메일 인증 |
| | `/auth/login` | POST | 로그인 |
| | `/auth/me` | GET | 현재 사용자 정보 |
| | `/auth/logout` | POST | 로그아웃 |
| **목적지/배너** | `/destinations` | GET | 인기 목적지 목록 |
| | `/destinations/:id` | GET | 목적지 상세 |
| | `/banners` | GET | 추천 여행 코스 |
| | `/banners/:id` | GET | 배너 상세 |
| **일정 생성** | `/itinerary/generate` | POST | AI 일정 생성 |
| | `/itinerary/regenerate` | POST | 일정 재생성 |
| **내 여행** | `/trips` | GET | 내 여행 목록 |
| | `/trips/:id` | GET | 여행 상세 |
| | `/trips` | POST | 여행 저장 |
| | `/trips/:id` | PUT | 여행 수정 |
| | `/trips/:id` | DELETE | 여행 삭제 |
| | `/trips/:id/ratings` | POST | 평점 저장 |
| **북마크** | `/bookmarks` | GET | 북마크 목록 |
| | `/bookmarks/:tripId` | POST | 북마크 추가 |
| | `/bookmarks/:tripId` | DELETE | 북마크 삭제 |
| **프로필** | `/users/profile` | GET | 프로필 조회 |
| | `/users/profile` | PUT | 프로필 수정 |

### 8.2 관리자용 API (Admin) - 22개

| 분류 | API | Method | 설명 |
|------|-----|--------|------|
| **사용자** | `/admin/users` | GET | 사용자 목록 |
| | `/admin/users/:id` | GET | 사용자 상세 |
| | `/admin/users/:id/status` | PATCH | 상태 변경 |
| | `/admin/users/:id` | DELETE | 사용자 삭제 |
| **여행일정** | `/admin/itineraries` | GET | 전체 여행 목록 |
| | `/admin/itineraries/:id` | GET | 여행 상세 |
| | `/admin/itineraries` | POST | 여행 추가 |
| | `/admin/itineraries/:id` | DELETE | 여행 삭제 |
| **평점** | `/admin/ratings` | GET | 평점 목록 |
| | `/admin/ratings/stats` | GET | 평점 통계 |
| | `/admin/ratings/:id` | DELETE | 평점 삭제 |
| **목적지** | `/admin/destinations` | GET | 목적지 목록 |
| | `/admin/destinations` | POST | 목적지 추가 |
| | `/admin/destinations/:id` | PUT | 목적지 수정 |
| | `/admin/destinations/:id` | DELETE | 목적지 삭제 |
| **이벤트** | `/admin/events` | GET | 이벤트 목록 |
| | `/admin/events` | POST | 이벤트 생성 |
| | `/admin/events/:id` | GET | 이벤트 상세 |
| | `/admin/events/:id` | PUT | 이벤트 수정 |
| | `/admin/events/:id` | DELETE | 이벤트 삭제 |
| **시스템** | `/admin/system/status` | GET | 시스템 상태 |
| | `/admin/activities/popular` | GET | 인기 활동 순위 |

### 8.3 요약

| 구분 | API 수 | 인증 필요 |
|------|--------|----------|
| 고객용 (Customer) | 23 | 일부 (인증 제외 대부분) |
| 관리자용 (Admin) | 22 | 전체 + 관리자 권한 |
| **총합** | **45** | |

---

## 다음 단계

1. **Phase 2**: 위 데이터 구조를 기반으로 DB 스키마 설계
2. **Phase 3**: API 엔드포인트 상세 명세 작성 (Request/Response 정의)
3. **Phase 4**: BE 프로젝트 셋업 및 구현

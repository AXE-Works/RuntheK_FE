# Korea Travel AI Assistant - API Specification

> Version: 1.1.0
> Last Updated: 2024-12-23
> Base URL: `/api/v1`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Common Patterns](#3-common-patterns)
4. [Customer APIs (22 Endpoints)](#4-customer-apis-22-endpoints)
5. [Admin APIs (22 Endpoints)](#5-admin-apis-22-endpoints)
6. [Error Responses](#6-error-responses)
7. [Pagination Strategy](#7-pagination-strategy)
8. [Caching Strategy](#8-caching-strategy)
9. [Performance Optimization](#9-performance-optimization)

---

## 1. Overview

### 1.1 API Categories

| Category | Count | Base Path | Description |
|----------|-------|-----------|-------------|
| Customer APIs | 22 | `/api/v1/*` | End-user facing APIs |
| Admin APIs | 22 | `/api/v1/admin/*` | Administrator APIs |
| **Total** | **44** | | |

### 1.2 Excluded APIs (AI 기능 배제)

> **근거**: `agent_context.md` - "AI 기능을 제공하는 서비스는 별도로 개발 될 예정임. 따라서 AI가 요구되는 기능들은 배제해야함."

| Endpoint | Method | 배제 사유 | 대체 방안 |
|----------|--------|----------|----------|
| `/itinerary/generate` | POST | AI 기반 일정 자동 생성 기능 | 별도 AI 서비스에서 구현 예정 |
| `/itinerary/regenerate` | POST | AI 기반 일정 수정/재생성 기능 | 별도 AI 서비스에서 구현 예정 |

#### 배제 상세 설명

**1. POST `/itinerary/generate`**
- **기능**: 사용자 입력(기간, 도시, 예산, 관심사)을 기반으로 AI가 최적의 여행 일정 자동 생성
- **배제 사유**: LLM(GPT-4 등) 연동이 필요한 핵심 AI 기능
- **FE 현재 상태**: `generateMockItinerary()` 함수로 Mock 데이터 반환 중
- **향후 계획**: AI 서비스 개발 후 연동

**2. POST `/itinerary/regenerate`**
- **기능**: 추가 요청사항(채식, 접근성, 사진 명소 등)을 자연어로 분석하여 기존 일정 수정
- **배제 사유**: 자연어 처리(NLP) 및 LLM 연동 필요
- **FE 현재 상태**: `generateModifiedItinerary()` 함수로 키워드 매칭 Mock 처리 중
- **향후 계획**: AI 서비스 개발 후 연동

#### BE 구현 시 대안

AI 배제로 인해 BE에서는 **수동 일정 관리** 방식으로 구현:

| 기존 AI API | 대체 BE API | 설명 |
|------------|------------|------|
| `POST /itinerary/generate` | `POST /trips` | 사용자가 직접 일정 생성/저장 |
| `POST /itinerary/regenerate` | `PUT /trips/:id` | 사용자가 직접 일정 수정 |

### 1.3 Design Principles

- **RESTful**: Resource-oriented URLs with standard HTTP methods
- **Consistency**: Uniform request/response structure
- **Security**: JWT-based authentication with role-based access control
- **Performance**: Optimized pagination, caching, and lazy loading
- **Maintainability**: Clear separation of concerns and versioned APIs

---

## 2. Authentication & Authorization

### 2.1 Authentication Mechanism

```
Authorization: Bearer <JWT_TOKEN>
```

### 2.2 Token Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user | admin",
  "iat": 1703145600,
  "exp": 1703232000
}
```

### 2.3 Role Definitions

| Role | Access Level | Description |
|------|--------------|-------------|
| `guest` | Public | Unauthenticated access (limited endpoints) |
| `user` | Customer | Authenticated regular users |
| `admin` | Full | Administrative access to all resources |

### 2.4 Auth Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Conditional | `Bearer <token>` for protected endpoints |
| `X-Request-ID` | Optional | Unique request identifier for tracing |
| `Accept-Language` | Optional | `en` or `ko` for localized responses |

---

## 3. Common Patterns

### 3.1 Base Response Structure

**Success Response**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-12-22T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

**Paginated Response**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2024-12-22T10:00:00Z"
  }
}
```

**Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-12-22T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### 3.2 Common Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max: 100) |
| `sort` | string | `-createdAt` | Sort field (prefix `-` for descending) |
| `search` | string | - | Full-text search query |
| `fields` | string | - | Comma-separated fields to include |

---

## 4. Customer APIs (24 Endpoints)

### 4.1 Authentication APIs (7 endpoints)

---

#### 4.1.1 POST `/auth/google`

**Description**: Authenticate via Google OAuth

**Auth Required**: No

**Request**
```json
{
  "idToken": "google_id_token_string",
  "accessToken": "google_access_token_string"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "name": "John Doe",
      "email": "john@gmail.com",
      "avatar": "https://lh3.googleusercontent.com/...",
      "country": null,
      "provider": "google",
      "createdAt": "2024-12-22T10:00:00Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 86400
    },
    "isNewUser": true
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 401 | `INVALID_GOOGLE_TOKEN` - Google token verification failed |
| 403 | `ACCOUNT_SUSPENDED` - Account has been suspended |

---

#### 4.1.2 POST `/auth/signup`

**Description**: Register new user with email and send verification email

**Auth Required**: No

**Request**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "country": "United States"
}
```

**Validation Rules**
| Field | Rules |
|-------|-------|
| `name` | Required, 2-50 characters |
| `email` | Required, valid email format |
| `password` | Required, min 8 chars, 1 uppercase, 1 number |
| `country` | Required, valid country from predefined list |

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "message": "Verification email sent",
    "email": "john@example.com",
    "expiresIn": 3600
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 400 | `VALIDATION_ERROR` - Invalid input data |
| 409 | `EMAIL_ALREADY_EXISTS` - Email already registered |

---

#### 4.1.3 POST `/auth/verify`

**Description**: Verify email with token from verification email

**Auth Required**: No

**Request**
```json
{
  "email": "john@example.com",
  "token": "verification_token_from_email"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "country": "United States",
      "provider": "email",
      "createdAt": "2024-12-22T10:00:00Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 86400
    }
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 400 | `INVALID_TOKEN` - Verification token is invalid |
| 410 | `TOKEN_EXPIRED` - Verification token has expired |

---

#### 4.1.4 POST `/auth/login`

**Description**: Login with email and password

**Auth Required**: No

**Request**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null,
      "country": "United States",
      "provider": "email",
      "createdAt": "2024-12-22T10:00:00Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 86400
    }
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 401 | `INVALID_CREDENTIALS` - Email or password incorrect |
| 403 | `EMAIL_NOT_VERIFIED` - Email verification required |
| 403 | `ACCOUNT_SUSPENDED` - Account has been suspended |
| 429 | `TOO_MANY_ATTEMPTS` - Rate limit exceeded |

---

#### 4.1.5 GET `/auth/me`

**Description**: Get current authenticated user information

**Auth Required**: Yes (User)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "country": "United States",
    "provider": "email",
    "createdAt": "2024-12-22T10:00:00Z",
    "tripCount": 5,
    "preferences": {
      "interests": ["food", "culture"],
      "budgetPreference": "mid-range"
    }
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 401 | `UNAUTHORIZED` - Invalid or expired token |

---

#### 4.1.6 POST `/auth/logout`

**Description**: Logout and invalidate current token

**Auth Required**: Yes (User)

**Request**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

#### 4.1.7 POST `/auth/refresh`

**Description**: Refresh access token using refresh token

**Auth Required**: No (but requires valid refresh token)

**Request**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 401 | `INVALID_REFRESH_TOKEN` - Refresh token is invalid or revoked |
| 401 | `TOKEN_EXPIRED` - Refresh token has expired |

---

### 4.2 Destination & Banner APIs (4 endpoints)

---

#### 4.2.1 GET `/destinations`

**Description**: Get list of popular destinations

**Auth Required**: No

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of destinations (max: 50) |
| `interests` | string | - | Filter by interests (comma-separated) |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "dest_seoul",
      "name": "Seoul",
      "subtitle": "The Heart of Korea",
      "description": "South Korea's dynamic capital...",
      "rating": 4.8,
      "visitors": "12M+",
      "highlights": ["Gyeongbokgung Palace", "Myeongdong", "N Seoul Tower"],
      "recommendedInterests": ["culture", "food", "shopping"],
      "recommendedDuration": "3-5 days",
      "image": "https://cdn.example.com/seoul.jpg",
      "countryPreferences": [
        {
          "country": "Japan",
          "flag": "🇯🇵",
          "percentage": 28,
          "reason": "Cultural proximity"
        }
      ]
    }
  ],
  "meta": {
    "total": 15
  }
}
```

**Cache**: `Cache-Control: public, max-age=3600`

---

#### 4.2.2 GET `/destinations/:id`

**Description**: Get destination details with recommended schedule

**Auth Required**: No

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Destination ID |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "dest_seoul",
    "name": "Seoul",
    "subtitle": "The Heart of Korea",
    "description": "South Korea's dynamic capital combines...",
    "rating": 4.8,
    "visitors": "12M+",
    "highlights": ["Gyeongbokgung Palace", "Myeongdong", "N Seoul Tower"],
    "recommendedInterests": ["culture", "food", "shopping"],
    "recommendedDuration": "3-5 days",
    "image": "https://cdn.example.com/seoul.jpg",
    "countryPreferences": [...],
    "detailedSchedule": [
      {
        "day": 1,
        "title": "Historical Seoul",
        "activities": [
          {
            "time": "09:00",
            "name": "Gyeongbokgung Palace",
            "description": "Explore the main royal palace of Joseon dynasty"
          }
        ]
      }
    ]
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 404 | `DESTINATION_NOT_FOUND` - Destination does not exist |

**Cache**: `Cache-Control: public, max-age=3600`

---

#### 4.2.3 GET `/banners`

**Description**: Get list of suggested travel course banners

**Auth Required**: No

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 6 | Number of banners (max: 20) |
| `category` | string | - | Filter by category |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "banner_001",
      "title": "Seoul City Explorer",
      "subtitle": "Best of Korean Capital",
      "image": "https://cdn.example.com/banner1.jpg",
      "duration": "3 days",
      "visitors": "5K+",
      "rating": 4.7,
      "highlights": ["Gyeongbokgung", "Hongdae", "Han River"],
      "category": "Urban"
    }
  ]
}
```

**Cache**: `Cache-Control: public, max-age=1800`

---

#### 4.2.4 GET `/banners/:id`

**Description**: Get banner details with full schedule

**Auth Required**: No

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Banner ID |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "banner_001",
    "title": "Seoul City Explorer",
    "subtitle": "Best of Korean Capital",
    "image": "https://cdn.example.com/banner1.jpg",
    "duration": "3 days",
    "visitors": "5K+",
    "rating": 4.7,
    "highlights": ["Gyeongbokgung", "Hongdae", "Han River"],
    "category": "Urban",
    "createdAt": "2024-12-01T00:00:00Z",
    "detailedSchedule": [
      {
        "day": 1,
        "title": "Palace & Traditional Culture",
        "activities": [
          {
            "time": "09:00",
            "name": "Gyeongbokgung Palace",
            "description": "Morning palace tour with changing of guards"
          }
        ]
      }
    ]
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 404 | `BANNER_NOT_FOUND` - Banner does not exist |

---

### 4.3 Itinerary Generation APIs (2 endpoints)

---

#### 4.3.1 POST `/itinerary/generate`

**Description**: Generate AI-powered travel itinerary

**Auth Required**: Yes (User)

**Request**
```json
{
  "startDate": "2024-12-25",
  "duration": "5 days",
  "cities": ["Seoul", "Busan"],
  "interests": ["food", "culture", "nature"],
  "budget": "mid-range",
  "nationality": "United States",
  "additionalNotes": "I would like to experience local markets and traditional food. Prefer less crowded places."
}
```

**Validation Rules**
| Field | Rules |
|-------|-------|
| `startDate` | Optional, ISO date format, must be future date |
| `duration` | Required, one of: `3 days`, `5 days`, `7 days`, `10+ days` |
| `cities` | Required, 1-5 cities from valid list |
| `interests` | Required, 1-8 interests from valid list |
| `budget` | Required, one of: `budget`, `mid-range`, `luxury` |
| `nationality` | Optional, valid country name |
| `additionalNotes` | Optional, max 500 characters |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "itin_abc123",
    "title": "Seoul & Busan Adventure",
    "duration": "5 days",
    "interests": ["food", "culture", "nature"],
    "budget": "mid-range",
    "days": [
      {
        "day": 1,
        "title": "Arrival & Seoul Exploration",
        "activities": [
          {
            "time": "09:00",
            "activity": "Airport Arrival",
            "location": "Incheon International Airport",
            "description": "Arrive at Incheon Airport and take AREX to Seoul Station",
            "estimatedCost": "₩9,500",
            "isEvent": false
          },
          {
            "time": "12:00",
            "activity": "Gwangjang Market",
            "location": "Jongno-gu, Seoul",
            "description": "Experience authentic Korean street food at the oldest market",
            "estimatedCost": "₩15,000",
            "isEvent": false
          },
          {
            "time": "15:00",
            "activity": "Winter Festival 2024",
            "location": "Cheonggyecheon Stream",
            "description": "Special winter light festival with lantern displays",
            "estimatedCost": "Free",
            "isEvent": true,
            "eventType": "festival",
            "eventId": "evt_winter2024"
          }
        ]
      }
    ],
    "totalEstimatedCost": "₩850,000 - ₩1,200,000",
    "generatedAt": "2024-12-22T10:00:00Z"
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 400 | `VALIDATION_ERROR` - Invalid input data |
| 429 | `RATE_LIMIT_EXCEEDED` - Too many generation requests |
| 503 | `AI_SERVICE_UNAVAILABLE` - AI service temporarily down |

**Performance Notes**
- Typical response time: 3-8 seconds
- Rate limit: 10 requests per hour per user
- Consider implementing streaming response for better UX

---

#### 4.3.2 POST `/itinerary/regenerate`

**Description**: Regenerate itinerary with user feedback

**Auth Required**: Yes (User)

**Request**
```json
{
  "originalItineraryId": "itin_abc123",
  "feedback": "I want more food experiences and less museum visits. Also, please include a day trip to Nami Island.",
  "keepDays": [1, 3],
  "modifyDays": [2, 4, 5]
}
```

**Validation Rules**
| Field | Rules |
|-------|-------|
| `originalItineraryId` | Required, valid itinerary ID |
| `feedback` | Required, 10-1000 characters |
| `keepDays` | Optional, array of day numbers to preserve |
| `modifyDays` | Optional, array of day numbers to regenerate |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "itin_def456",
    "parentId": "itin_abc123",
    "title": "Seoul & Busan Food Adventure",
    "duration": "5 days",
    "interests": ["food", "culture", "nature"],
    "budget": "mid-range",
    "days": [...],
    "totalEstimatedCost": "₩900,000 - ₩1,300,000",
    "generatedAt": "2024-12-22T11:00:00Z",
    "changes": [
      "Added 3 more food experiences",
      "Replaced museum visits with market tours",
      "Added Nami Island day trip on Day 4"
    ]
  }
}
```

---

### 4.4 Trip Management APIs (6 endpoints)

---

#### 4.4.1 GET `/trips`

**Description**: Get list of user's confirmed trips

**Auth Required**: Yes (User)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page (max: 50) |
| `status` | string | - | Filter: `upcoming`, `ongoing`, `completed` |
| `sort` | string | `-confirmedAt` | Sort field |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "trip_abc123",
      "title": "Seoul & Busan Adventure",
      "duration": "5 days",
      "interests": ["food", "culture"],
      "budget": "mid-range",
      "status": "upcoming",
      "startDate": "2024-12-25",
      "confirmedAt": "2024-12-20T10:00:00Z",
      "thumbnail": "https://cdn.example.com/seoul.jpg",
      "daysCount": 5,
      "activitiesCount": 18,
      "averageRating": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

#### 4.4.2 GET `/trips/:id`

**Description**: Get detailed trip information

**Auth Required**: Yes (User)

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Trip ID |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "trip_abc123",
    "title": "Seoul & Busan Adventure",
    "duration": "5 days",
    "interests": ["food", "culture", "nature"],
    "budget": "mid-range",
    "status": "upcoming",
    "startDate": "2024-12-25",
    "confirmedAt": "2024-12-20T10:00:00Z",
    "days": [
      {
        "day": 1,
        "title": "Arrival & Seoul Exploration",
        "activities": [
          {
            "time": "09:00",
            "activity": "Airport Arrival",
            "location": "Incheon International Airport",
            "description": "Arrive at Incheon Airport...",
            "estimatedCost": "₩9,500",
            "isEvent": false,
            "rating": null
          }
        ]
      }
    ],
    "totalEstimatedCost": "₩850,000 - ₩1,200,000",
    "ratings": []
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 404 | `TRIP_NOT_FOUND` - Trip does not exist or not owned by user |

---

#### 4.4.3 POST `/trips`

**Description**: Save/confirm a generated itinerary as a trip

**Auth Required**: Yes (User)

**Request**
```json
{
  "itineraryId": "itin_abc123",
  "startDate": "2024-12-25"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "trip_abc123",
    "title": "Seoul & Busan Adventure",
    "duration": "5 days",
    "status": "upcoming",
    "startDate": "2024-12-25",
    "confirmedAt": "2024-12-22T10:00:00Z"
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 400 | `INVALID_ITINERARY` - Itinerary ID is invalid |
| 409 | `TRIP_ALREADY_EXISTS` - Trip already confirmed from this itinerary |

---

#### 4.4.4 PUT `/trips/:id`

**Description**: Update trip details

**Auth Required**: Yes (User)

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Trip ID |

**Request**
```json
{
  "title": "My Seoul Adventure 2024",
  "startDate": "2024-12-26",
  "days": [
    {
      "day": 1,
      "title": "Updated Day 1",
      "activities": [...]
    }
  ]
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "trip_abc123",
    "title": "My Seoul Adventure 2024",
    "updatedAt": "2024-12-22T11:00:00Z"
  }
}
```

---

#### 4.4.5 DELETE `/trips/:id`

**Description**: Delete a trip

**Auth Required**: Yes (User)

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Trip ID |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Trip deleted successfully"
  }
}
```

---

#### 4.4.6 POST `/trips/:id/ratings`

**Description**: Save ratings for trip activities

**Auth Required**: Yes (User)

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Trip ID |

**Request**
```json
{
  "ratings": [
    {
      "dayIndex": 0,
      "activityIndex": 1,
      "rating": 5,
      "review": "Amazing experience! The food was incredible."
    },
    {
      "dayIndex": 0,
      "activityIndex": 2,
      "rating": 4,
      "review": "Great palace tour."
    }
  ]
}
```

**Validation Rules**
| Field | Rules |
|-------|-------|
| `ratings` | Required, array of rating objects |
| `dayIndex` | Required, valid day index (0-based) |
| `activityIndex` | Required, valid activity index (0-based) |
| `rating` | Required, integer 1-5 |
| `review` | Optional, max 500 characters |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Ratings saved successfully",
    "savedCount": 2,
    "tripAverageRating": 4.5
  }
}
```

---

### 4.5 Bookmark APIs (3 endpoints)

---

#### 4.5.1 GET `/bookmarks`

**Description**: Get list of bookmarked trips

**Auth Required**: Yes (User)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "bookmark_001",
      "tripId": "trip_xyz789",
      "trip": {
        "id": "trip_xyz789",
        "title": "Jeju Island Paradise",
        "duration": "4 days",
        "thumbnail": "https://cdn.example.com/jeju.jpg",
        "rating": 4.9,
        "creatorName": "TravelExpert",
        "creatorAvatar": "https://..."
      },
      "bookmarkedAt": "2024-12-21T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### 4.5.2 POST `/bookmarks/:tripId`

**Description**: Add a trip to bookmarks

**Auth Required**: Yes (User)

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `tripId` | string | Trip ID to bookmark |

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "bookmark_001",
    "tripId": "trip_xyz789",
    "bookmarkedAt": "2024-12-22T10:00:00Z"
  }
}
```

**Errors**
| Code | Message |
|------|---------|
| 404 | `TRIP_NOT_FOUND` - Trip does not exist |
| 409 | `ALREADY_BOOKMARKED` - Trip is already bookmarked |

---

#### 4.5.3 DELETE `/bookmarks/:tripId`

**Description**: Remove a trip from bookmarks

**Auth Required**: Yes (User)

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `tripId` | string | Trip ID to remove from bookmarks |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Bookmark removed successfully"
  }
}
```

---

### 4.6 Profile APIs (2 endpoints)

---

#### 4.6.1 GET `/users/profile`

**Description**: Get current user's profile

**Auth Required**: Yes (User)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "country": "United States",
    "bio": "Travel enthusiast exploring Korea!",
    "tripCount": 5,
    "totalCountriesVisited": 12,
    "preferences": {
      "interests": ["food", "culture", "nature"],
      "budgetPreference": "mid-range"
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### 4.6.2 PUT `/users/profile`

**Description**: Update current user's profile

**Auth Required**: Yes (User)

**Request**
```json
{
  "name": "John Doe Updated",
  "country": "Canada",
  "bio": "Korean food lover and K-culture fan!",
  "avatar": "https://example.com/new-avatar.jpg",
  "preferences": {
    "interests": ["food", "kculture"],
    "budgetPreference": "luxury"
  }
}
```

**Validation Rules**
| Field | Rules |
|-------|-------|
| `name` | Optional, 2-50 characters |
| `country` | Optional, valid country name |
| `bio` | Optional, max 200 characters |
| `avatar` | Optional, valid URL |
| `preferences.interests` | Optional, array of valid interest IDs |
| `preferences.budgetPreference` | Optional, one of: `budget`, `mid-range`, `luxury` |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "name": "John Doe Updated",
    "country": "Canada",
    "bio": "Korean food lover and K-culture fan!",
    "updatedAt": "2024-12-22T10:00:00Z"
  }
}
```

---

## 5. Admin APIs (22 Endpoints)

> All Admin APIs require authentication with `admin` role.
> Base path: `/api/v1/admin`

### 5.1 User Management APIs (4 endpoints)

---

#### 5.1.1 GET `/admin/users`

**Description**: Get list of all users (Admin)

**Auth Required**: Yes (Admin)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `status` | string | - | Filter: `active`, `inactive`, `banned` |
| `search` | string | - | Search by name or email |
| `country` | string | - | Filter by country |
| `sort` | string | `-createdAt` | Sort field |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "usr_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "country": "United States",
      "provider": "email",
      "status": "active",
      "signupDate": "2024-01-15T10:00:00Z",
      "lastActive": "2024-12-21T15:30:00Z",
      "tripCount": 5,
      "totalRatings": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500,
    "totalPages": 75,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalUsers": 1500,
    "activeUsers": 1200,
    "newUsersThisMonth": 150
  }
}
```

---

#### 5.1.2 GET `/admin/users/:id`

**Description**: Get user details with travel history (Admin)

**Auth Required**: Yes (Admin)

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User ID |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "country": "United States",
    "provider": "email",
    "status": "active",
    "signupDate": "2024-01-15T10:00:00Z",
    "lastActive": "2024-12-21T15:30:00Z",
    "tripCount": 5,
    "totalRatings": 12,
    "recentTrips": [
      {
        "id": "trip_001",
        "title": "Seoul Adventure",
        "confirmedAt": "2024-12-01T00:00:00Z",
        "status": "completed"
      }
    ],
    "activityLog": [
      {
        "action": "trip_created",
        "timestamp": "2024-12-20T10:00:00Z",
        "details": "Created trip: Seoul Adventure"
      }
    ]
  }
}
```

---

#### 5.1.3 PATCH `/admin/users/:id/status`

**Description**: Update user account status (Admin)

**Auth Required**: Yes (Admin)

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User ID |

**Request**
```json
{
  "status": "banned",
  "reason": "Violation of terms of service"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "status": "banned",
    "statusChangedAt": "2024-12-22T10:00:00Z",
    "statusChangedBy": "admin_001"
  }
}
```

---

#### 5.1.4 DELETE `/admin/users/:id`

**Description**: Delete user account (Admin)

**Auth Required**: Yes (Admin)

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User ID |

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `deleteData` | boolean | false | Also delete all user's trips and ratings |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully",
    "deletedTrips": 5,
    "deletedRatings": 12
  }
}
```

---

### 5.2 Itinerary Management APIs (4 endpoints)

---

#### 5.2.1 GET `/admin/itineraries`

**Description**: Get all itineraries across all users (Admin)

**Auth Required**: Yes (Admin)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |
| `status` | string | - | Filter: `active`, `completed`, `cancelled` |
| `search` | string | - | Search in title, user name, cities |
| `userId` | string | - | Filter by user ID |
| `dateFrom` | string | - | Filter by confirmed date (from) |
| `dateTo` | string | - | Filter by confirmed date (to) |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "trip_abc123",
      "title": "Seoul & Busan Adventure",
      "userId": "usr_xyz789",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "duration": "5 days",
      "cities": ["Seoul", "Busan"],
      "status": "active",
      "confirmedAt": "2024-12-20T10:00:00Z",
      "startDate": "2024-12-25"
    }
  ],
  "pagination": {...},
  "summary": {
    "totalItineraries": 5000,
    "activeItineraries": 200,
    "completedItineraries": 4500
  }
}
```

---

#### 5.2.2 GET `/admin/itineraries/:id`

**Description**: Get itinerary details (Admin)

**Auth Required**: Yes (Admin)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "trip_abc123",
    "title": "Seoul & Busan Adventure",
    "userId": "usr_xyz789",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "duration": "5 days",
    "interests": ["food", "culture"],
    "budget": "mid-range",
    "status": "active",
    "confirmedAt": "2024-12-20T10:00:00Z",
    "days": [...],
    "totalEstimatedCost": "₩850,000 - ₩1,200,000",
    "ratings": [...]
  }
}
```

---

#### 5.2.3 POST `/admin/itineraries`

**Description**: Create itinerary for a user (Admin)

**Auth Required**: Yes (Admin)

**Request**
```json
{
  "userId": "usr_xyz789",
  "title": "Admin Created Seoul Trip",
  "duration": "3 days",
  "interests": ["culture", "food"],
  "budget": "mid-range",
  "startDate": "2024-12-30",
  "days": [...]
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "trip_admin001",
    "title": "Admin Created Seoul Trip",
    "createdBy": "admin_001",
    "createdAt": "2024-12-22T10:00:00Z"
  }
}
```

---

#### 5.2.4 DELETE `/admin/itineraries/:id`

**Description**: Delete an itinerary (Admin)

**Auth Required**: Yes (Admin)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Itinerary deleted successfully"
  }
}
```

---

### 5.3 Rating Management APIs (3 endpoints)

---

#### 5.3.1 GET `/admin/ratings`

**Description**: Get all ratings and reviews (Admin)

**Auth Required**: Yes (Admin)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |
| `minRating` | integer | - | Filter minimum rating (1-5) |
| `maxRating` | integer | - | Filter maximum rating (1-5) |
| `hasReview` | boolean | - | Filter only with text review |
| `location` | string | - | Filter by location |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "rating_001",
      "tripId": "trip_abc123",
      "tripTitle": "Seoul Adventure",
      "userId": "usr_xyz789",
      "userName": "John Doe",
      "activityName": "Gwangjang Market",
      "location": "Seoul",
      "rating": 5,
      "review": "Amazing food experience!",
      "createdAt": "2024-12-21T15:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### 5.3.2 GET `/admin/ratings/stats`

**Description**: Get rating statistics (Admin)

**Auth Required**: Yes (Admin)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `30d` | Time period: `7d`, `30d`, `90d`, `1y` |
| `groupBy` | string | `location` | Group by: `location`, `activity`, `date` |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRatings": 5000,
      "averageRating": 4.3,
      "totalReviews": 2500,
      "ratingsThisPeriod": 500
    },
    "distribution": {
      "5": 2000,
      "4": 1500,
      "3": 800,
      "2": 400,
      "1": 300
    },
    "trend": [
      { "date": "2024-12-15", "count": 50, "average": 4.2 },
      { "date": "2024-12-16", "count": 65, "average": 4.4 }
    ],
    "topRated": [
      {
        "name": "Gwangjang Market",
        "location": "Seoul",
        "averageRating": 4.8,
        "ratingCount": 250
      }
    ],
    "lowestRated": [...]
  }
}
```

**Cache**: `Cache-Control: private, max-age=300`

---

#### 5.3.3 DELETE `/admin/ratings/:id`

**Description**: Delete inappropriate rating/review (Admin)

**Auth Required**: Yes (Admin)

**Request**
```json
{
  "reason": "Inappropriate content"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Rating deleted successfully",
    "deletedAt": "2024-12-22T10:00:00Z"
  }
}
```

---

### 5.4 Destination Management APIs (4 endpoints)

---

#### 5.4.1 GET `/admin/destinations`

**Description**: Get all destinations with admin details (Admin)

**Auth Required**: Yes (Admin)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |
| `isActive` | boolean | - | Filter by active status |
| `search` | string | - | Search by name |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "dest_seoul",
      "name": "Seoul",
      "subtitle": "The Heart of Korea",
      "totalVisitors": 12500000,
      "totalTrips": 5000,
      "averageRating": 4.8,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-12-20T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### 5.4.2 POST `/admin/destinations`

**Description**: Create new destination (Admin)

**Auth Required**: Yes (Admin)

**Request**
```json
{
  "name": "Gyeongju",
  "subtitle": "Museum Without Walls",
  "description": "Ancient capital of the Silla Kingdom...",
  "highlights": ["Bulguksa Temple", "Seokguram Grotto", "Tumuli Park"],
  "recommendedInterests": ["culture", "history"],
  "recommendedDuration": "2-3 days",
  "image": "https://cdn.example.com/gyeongju.jpg",
  "detailedSchedule": [
    {
      "day": 1,
      "title": "Historical Sites",
      "activities": [
        {
          "time": "09:00",
          "name": "Bulguksa Temple",
          "description": "UNESCO World Heritage Buddhist temple"
        }
      ]
    }
  ],
  "isActive": true
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "dest_gyeongju",
    "name": "Gyeongju",
    "createdAt": "2024-12-22T10:00:00Z"
  }
}
```

---

#### 5.4.3 PUT `/admin/destinations/:id`

**Description**: Update destination (Admin)

**Auth Required**: Yes (Admin)

**Request**
```json
{
  "subtitle": "Updated subtitle",
  "description": "Updated description...",
  "isActive": false
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "dest_gyeongju",
    "name": "Gyeongju",
    "updatedAt": "2024-12-22T11:00:00Z"
  }
}
```

---

#### 5.4.4 DELETE `/admin/destinations/:id`

**Description**: Delete/deactivate destination (Admin)

**Auth Required**: Yes (Admin)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hardDelete` | boolean | false | Permanently delete (vs soft delete) |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Destination deactivated successfully"
  }
}
```

---

### 5.5 Event Management APIs (5 endpoints)

---

#### 5.5.1 GET `/admin/events`

**Description**: Get all events (Admin)

**Auth Required**: Yes (Admin)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |
| `status` | string | - | Filter: `draft`, `active`, `ended`, `cancelled` |
| `type` | string | - | Filter by event type |
| `location` | string | - | Filter by location |
| `dateFrom` | string | - | Filter events starting from |
| `dateTo` | string | - | Filter events ending by |

**Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "evt_winter2024",
      "title": "Seoul Winter Festival 2024",
      "type": "festival",
      "location": "Cheonggyecheon Stream, Seoul",
      "dateRange": {
        "start": "2024-12-20T00:00:00Z",
        "end": "2025-01-15T23:59:59Z"
      },
      "status": "active",
      "expectedParticipants": 500000,
      "createdAt": "2024-11-01T00:00:00Z"
    }
  ],
  "pagination": {...},
  "summary": {
    "totalEvents": 50,
    "activeEvents": 15,
    "upcomingEvents": 25
  }
}
```

---

#### 5.5.2 POST `/admin/events`

**Description**: Create new event (Admin)

**Auth Required**: Yes (Admin)

**Request**
```json
{
  "title": "Seoul Winter Festival 2024",
  "description": "Annual winter celebration with lantern displays...",
  "type": "festival",
  "location": "Cheonggyecheon Stream, Seoul",
  "dateRange": {
    "start": "2024-12-20",
    "end": "2025-01-15"
  },
  "budget": "mid-range",
  "targetAudience": "Families, Tourists",
  "expectedParticipants": 500000,
  "organizer": "Seoul Metropolitan Government",
  "contactEmail": "festival@seoul.go.kr",
  "website": "https://festival.seoul.go.kr",
  "specialConditions": "Weather dependent - indoor alternatives available",
  "isWeatherDependent": true,
  "ageRestriction": null,
  "status": "active"
}
```

**Validation Rules**
| Field | Rules |
|-------|-------|
| `title` | Required, 5-100 characters |
| `description` | Required, 20-2000 characters |
| `type` | Required, valid event type |
| `location` | Required, 5-200 characters |
| `dateRange.start` | Required, valid date |
| `dateRange.end` | Required, valid date, after start |
| `contactEmail` | Required, valid email |

**Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "evt_winter2024",
    "title": "Seoul Winter Festival 2024",
    "status": "active",
    "createdAt": "2024-12-22T10:00:00Z"
  }
}
```

---

#### 5.5.3 GET `/admin/events/:id`

**Description**: Get event details (Admin)

**Auth Required**: Yes (Admin)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "evt_winter2024",
    "title": "Seoul Winter Festival 2024",
    "description": "Annual winter celebration...",
    "type": "festival",
    "location": "Cheonggyecheon Stream, Seoul",
    "dateRange": {
      "start": "2024-12-20T00:00:00Z",
      "end": "2025-01-15T23:59:59Z"
    },
    "budget": "mid-range",
    "targetAudience": "Families, Tourists",
    "expectedParticipants": 500000,
    "organizer": "Seoul Metropolitan Government",
    "contactEmail": "festival@seoul.go.kr",
    "website": "https://festival.seoul.go.kr",
    "specialConditions": "Weather dependent",
    "isWeatherDependent": true,
    "ageRestriction": null,
    "status": "active",
    "itineraryInclusionCount": 250,
    "createdAt": "2024-11-01T00:00:00Z",
    "updatedAt": "2024-12-15T10:00:00Z"
  }
}
```

---

#### 5.5.4 PUT `/admin/events/:id`

**Description**: Update event (Admin)

**Auth Required**: Yes (Admin)

**Request**
```json
{
  "title": "Seoul Winter Festival 2024 - Extended!",
  "dateRange": {
    "start": "2024-12-20",
    "end": "2025-01-31"
  },
  "status": "active"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "evt_winter2024",
    "title": "Seoul Winter Festival 2024 - Extended!",
    "updatedAt": "2024-12-22T10:00:00Z"
  }
}
```

---

#### 5.5.5 DELETE `/admin/events/:id`

**Description**: Delete event (Admin)

**Auth Required**: Yes (Admin)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Event deleted successfully",
    "affectedItineraries": 15
  }
}
```

---

### 5.6 System & Analytics APIs (2 endpoints)

---

#### 5.6.1 GET `/admin/system/status`

**Description**: Get system health and status (Admin)

**Auth Required**: Yes (Admin)

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "name": "API Server",
        "status": "operational",
        "latency": 45,
        "lastChecked": "2024-12-22T10:00:00Z"
      },
      {
        "name": "Database",
        "status": "operational",
        "latency": 12,
        "lastChecked": "2024-12-22T10:00:00Z"
      },
      {
        "name": "AI Service",
        "status": "operational",
        "latency": 350,
        "lastChecked": "2024-12-22T10:00:00Z"
      },
      {
        "name": "CDN",
        "status": "operational",
        "latency": 25,
        "lastChecked": "2024-12-22T10:00:00Z"
      }
    ],
    "serverLoad": {
      "cpu": 45.2,
      "memory": 62.8,
      "disk": 38.5
    },
    "alerts": [
      {
        "id": "alert_001",
        "type": "warning",
        "message": "High AI service latency detected",
        "timestamp": "2024-12-22T09:30:00Z"
      }
    ],
    "traffic": {
      "hourly": [120, 145, 180, 210, 195, 160, 140, 130],
      "daily": [5000, 5200, 4800, 5500, 5800, 6000, 5200]
    },
    "uptime": {
      "api": 99.95,
      "database": 99.99,
      "aiService": 99.80
    }
  }
}
```

**Cache**: `Cache-Control: no-store` (real-time data)

---

#### 5.6.2 GET `/admin/activities/popular`

**Description**: Get popular activities ranking (Admin)

**Auth Required**: Yes (Admin)

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `30d` | Time period: `7d`, `30d`, `90d`, `1y` |
| `limit` | integer | 20 | Number of activities |
| `category` | string | - | Filter by category |

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "activityName": "Gwangjang Market",
        "location": "Seoul",
        "category": "Food",
        "totalBookings": 2500,
        "averageRating": 4.8,
        "ratingCount": 1800,
        "trend": "up",
        "trendPercentage": 15.5
      },
      {
        "rank": 2,
        "activityName": "Gyeongbokgung Palace",
        "location": "Seoul",
        "category": "Culture",
        "totalBookings": 2300,
        "averageRating": 4.7,
        "ratingCount": 2000,
        "trend": "stable",
        "trendPercentage": 2.1
      }
    ],
    "categoryStats": [
      { "category": "Food", "totalBookings": 8000, "percentage": 32 },
      { "category": "Culture", "totalBookings": 6500, "percentage": 26 },
      { "category": "Nature", "totalBookings": 4500, "percentage": 18 }
    ],
    "trendChart": [
      { "date": "2024-12-01", "bookings": 500 },
      { "date": "2024-12-08", "bookings": 650 }
    ]
  }
}
```

**Cache**: `Cache-Control: private, max-age=600`

---

## 6. Error Responses

### 6.1 Standard Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `BAD_REQUEST` | Invalid request format |
| 400 | `VALIDATION_ERROR` | Input validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 401 | `TOKEN_EXPIRED` | JWT token has expired |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 403 | `ACCOUNT_SUSPENDED` | User account is suspended |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `UNPROCESSABLE_ENTITY` | Semantic validation error |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### 6.2 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for request body",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Must be a valid email address"
      },
      {
        "field": "password",
        "code": "TOO_SHORT",
        "message": "Must be at least 8 characters"
      }
    ],
    "suggestion": "Please check the field requirements and try again"
  },
  "meta": {
    "timestamp": "2024-12-22T10:00:00Z",
    "requestId": "req_abc123",
    "path": "/api/v1/auth/signup"
  }
}
```

### 6.3 Rate Limiting Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703235600
Retry-After: 60
```

---

## 7. Pagination Strategy

### 7.1 Offset-Based Pagination

Used for most list endpoints where total count is needed.

**Request**
```
GET /api/v1/trips?page=2&limit=20
```

**Response**
```json
{
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### 7.2 Cursor-Based Pagination

Recommended for real-time feeds and large datasets.

**Request**
```
GET /api/v1/admin/ratings?cursor=eyJpZCI6MTAwfQ&limit=20
```

**Response**
```json
{
  "pagination": {
    "limit": 20,
    "nextCursor": "eyJpZCI6MTIwfQ",
    "prevCursor": "eyJpZCI6ODB9",
    "hasNext": true,
    "hasPrev": true
  }
}
```

### 7.3 Pagination Best Practices

| Scenario | Strategy | Reason |
|----------|----------|--------|
| User trip list | Offset | Total count needed for UI |
| Admin user list | Offset | Total count + filtering |
| Rating feed | Cursor | Real-time updates, large data |
| Activity log | Cursor | Chronological, large data |

---

## 8. Caching Strategy

### 8.1 Cache Levels

```
┌─────────────────────────────────────────────────────┐
│                    Client Cache                      │
│         (Browser, HTTP Cache-Control)               │
├─────────────────────────────────────────────────────┤
│                     CDN Cache                        │
│           (CloudFront, Cloudflare)                  │
├─────────────────────────────────────────────────────┤
│                 Application Cache                    │
│              (Redis, In-Memory)                     │
├─────────────────────────────────────────────────────┤
│                   Database                          │
│              (PostgreSQL, etc.)                     │
└─────────────────────────────────────────────────────┘
```

### 8.2 Endpoint Cache Configuration

| Endpoint | Cache-Control | TTL | Cache Level |
|----------|---------------|-----|-------------|
| `GET /destinations` | `public, max-age=3600` | 1 hour | CDN + Client |
| `GET /destinations/:id` | `public, max-age=3600` | 1 hour | CDN + Client |
| `GET /banners` | `public, max-age=1800` | 30 min | CDN + Client |
| `GET /auth/me` | `private, max-age=300` | 5 min | Client only |
| `GET /trips` | `private, max-age=60` | 1 min | Client only |
| `GET /admin/ratings/stats` | `private, max-age=300` | 5 min | Redis |
| `GET /admin/activities/popular` | `private, max-age=600` | 10 min | Redis |
| `GET /admin/system/status` | `no-store` | 0 | None |

### 8.3 Cache Invalidation Strategy

| Trigger | Invalidated Cache |
|---------|-------------------|
| Destination created/updated | `/destinations`, `/destinations/:id` |
| Banner created/updated | `/banners`, `/banners/:id` |
| Event created/updated | Related itinerary caches |
| Rating created | `/admin/ratings/stats`, `/admin/activities/popular` |

### 8.4 ETag Support

For resources that change infrequently:

```
Request:
GET /api/v1/destinations/dest_seoul
If-None-Match: "abc123"

Response (if unchanged):
304 Not Modified
ETag: "abc123"
```

---

## 9. Performance Optimization

### 9.1 Database Query Optimization

| Optimization | Applicable Endpoints | Description |
|--------------|---------------------|-------------|
| Indexing | All list endpoints | Composite indexes on frequently filtered columns |
| Pagination | All list endpoints | Limit results, avoid full table scans |
| Selective fields | `GET /trips` | Return summary data for lists |
| Lazy loading | `GET /trips/:id` | Load full data only on detail view |
| Aggregation caching | `/admin/ratings/stats` | Pre-compute statistics periodically |

### 9.2 Recommended Database Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status_created ON users(status, created_at DESC);

-- Trips
CREATE INDEX idx_trips_user_status ON trips(user_id, status);
CREATE INDEX idx_trips_confirmed_at ON trips(confirmed_at DESC);

-- Ratings
CREATE INDEX idx_ratings_trip ON ratings(trip_id);
CREATE INDEX idx_ratings_created ON ratings(created_at DESC);

-- Events
CREATE INDEX idx_events_status_date ON events(status, start_date, end_date);
CREATE INDEX idx_events_location ON events(location);
```

### 9.3 API Response Optimization

| Technique | Benefit | Implementation |
|-----------|---------|----------------|
| Field selection | Reduced payload | `?fields=id,title,status` |
| Compression | Reduced bandwidth | `Accept-Encoding: gzip, br` |
| Sparse fieldsets | Reduced DB load | Only fetch requested fields |
| Batch endpoints | Reduced requests | `POST /batch` for multiple operations |

### 9.4 AI Itinerary Generation Optimization

```
┌──────────────────────────────────────────────────────────┐
│                   Client Request                          │
├──────────────────────────────────────────────────────────┤
│              1. Rate Limiting Check                       │
│         (10 requests/hour per user)                       │
├──────────────────────────────────────────────────────────┤
│              2. Request Queuing                           │
│         (Prevent concurrent generations)                  │
├──────────────────────────────────────────────────────────┤
│              3. Cache Check                               │
│    (Similar request within 1 hour? Return cached)        │
├──────────────────────────────────────────────────────────┤
│              4. AI Service Call                           │
│         (Streaming response recommended)                  │
├──────────────────────────────────────────────────────────┤
│              5. Result Caching                            │
│         (Cache for similar future requests)               │
└──────────────────────────────────────────────────────────┘
```

### 9.5 Recommended Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Auth endpoints | 5 | 1 minute |
| AI generation | 10 | 1 hour |
| Standard GET | 100 | 1 minute |
| Standard POST/PUT/DELETE | 30 | 1 minute |
| Admin endpoints | 200 | 1 minute |

### 9.6 Connection Pooling

```yaml
Database:
  min_pool_size: 10
  max_pool_size: 50
  connection_timeout: 5000ms
  idle_timeout: 300000ms

Redis:
  max_connections: 20
  connection_timeout: 3000ms
```

---

## Appendix A: Data Type Reference

### A.1 Common Enums

```typescript
// User Status
type UserStatus = 'active' | 'inactive' | 'banned';

// Trip Status
type TripStatus = 'upcoming' | 'ongoing' | 'completed';

// Event Status
type EventStatus = 'draft' | 'active' | 'ended' | 'cancelled';

// Budget Level
type BudgetLevel = 'budget' | 'mid-range' | 'luxury';

// Duration
type Duration = '3 days' | '5 days' | '7 days' | '10+ days';

// Auth Provider
type AuthProvider = 'google' | 'email';

// Banner Category
type BannerCategory = 'Urban' | 'Nature' | 'Cultural' | 'Food' | 'Historical' | 'Coastal';
```

### A.2 Valid Cities (15)

```typescript
const VALID_CITIES = [
  'Seoul', 'Busan', 'Jeju Island', 'Gyeongju', 'Incheon',
  'Daegu', 'Daejeon', 'Gwangju', 'Jeonju', 'Gangneung',
  'Sokcho', 'Suwon', 'Andong', 'Tongyeong', 'Yeosu'
];
```

### A.3 Valid Interests (8)

```typescript
const VALID_INTERESTS = [
  'food', 'culture', 'nature', 'shopping',
  'nightlife', 'kculture', 'wellness', 'adventure'
];
```

---

## Appendix B: API Summary Table

### B.1 Customer APIs (24)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/auth/google` | No | Google OAuth |
| 2 | POST | `/auth/signup` | No | Email signup |
| 3 | POST | `/auth/verify` | No | Email verification |
| 4 | POST | `/auth/login` | No | Email login |
| 5 | GET | `/auth/me` | User | Get current user |
| 6 | POST | `/auth/logout` | User | Logout |
| 7 | POST | `/auth/refresh` | No | Refresh access token |
| 8 | GET | `/destinations` | No | List destinations |
| 9 | GET | `/destinations/:id` | No | Destination detail |
| 10 | GET | `/banners` | No | List banners |
| 11 | GET | `/banners/:id` | No | Banner detail |
| 12 | POST | `/itinerary/generate` | User | Generate itinerary |
| 13 | POST | `/itinerary/regenerate` | User | Regenerate itinerary |
| 14 | GET | `/trips` | User | List trips |
| 15 | GET | `/trips/:id` | User | Trip detail |
| 16 | POST | `/trips` | User | Save trip |
| 17 | PUT | `/trips/:id` | User | Update trip |
| 18 | DELETE | `/trips/:id` | User | Delete trip |
| 19 | POST | `/trips/:id/ratings` | User | Add ratings |
| 20 | GET | `/bookmarks` | User | List bookmarks |
| 21 | POST | `/bookmarks/:tripId` | User | Add bookmark |
| 22 | DELETE | `/bookmarks/:tripId` | User | Remove bookmark |
| 23 | GET | `/users/profile` | User | Get profile |
| 24 | PUT | `/users/profile` | User | Update profile |

### B.2 Admin APIs (22)

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | GET | `/admin/users` | List users |
| 2 | GET | `/admin/users/:id` | User detail |
| 3 | PATCH | `/admin/users/:id/status` | Update status |
| 4 | DELETE | `/admin/users/:id` | Delete user |
| 5 | GET | `/admin/itineraries` | List itineraries |
| 6 | GET | `/admin/itineraries/:id` | Itinerary detail |
| 7 | POST | `/admin/itineraries` | Create itinerary |
| 8 | DELETE | `/admin/itineraries/:id` | Delete itinerary |
| 9 | GET | `/admin/ratings` | List ratings |
| 10 | GET | `/admin/ratings/stats` | Rating statistics |
| 11 | DELETE | `/admin/ratings/:id` | Delete rating |
| 12 | GET | `/admin/destinations` | List destinations |
| 13 | POST | `/admin/destinations` | Create destination |
| 14 | PUT | `/admin/destinations/:id` | Update destination |
| 15 | DELETE | `/admin/destinations/:id` | Delete destination |
| 16 | GET | `/admin/events` | List events |
| 17 | POST | `/admin/events` | Create event |
| 18 | GET | `/admin/events/:id` | Event detail |
| 19 | PUT | `/admin/events/:id` | Update event |
| 20 | DELETE | `/admin/events/:id` | Delete event |
| 21 | GET | `/admin/system/status` | System status |
| 22 | GET | `/admin/activities/popular` | Popular activities |

---

*Document generated: 2024-12-22*
*API Version: 1.0.0*

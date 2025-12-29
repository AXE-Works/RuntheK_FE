# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korea Travel AI Assistant - React + TypeScript frontend for AI-powered Korean travel planning. Bilingual app: English UI for tourists, Korean admin dashboard for administrators.

## Commands

```bash
npm install     # Install dependencies
npm run dev     # Start dev server (localhost:3000, auto-opens browser)
npm run build   # Production build to /build directory
```

## Tech Stack

- **Build:** Vite 6.3.5 with SWC
- **Framework:** React 18.3.1 + TypeScript
- **Styling:** Tailwind CSS + class-variance-authority (CVA)
- **UI Components:** Radix UI primitives (35+ components in `src/components/ui/`)
- **Animations:** motion library
- **Forms:** react-hook-form
- **Charts:** Recharts (admin analytics)
- **Icons:** lucide-react
- **Notifications:** sonner (toast)
- **Theme:** next-themes (dark mode support)

## Architecture

### Navigation
Tab-based navigation (no React Router). Tabs: "plan" | "my-trips" | "admin"

### Component Hierarchy
```
App.tsx (Root - 3000+ lines, manages all global state)
├── HeroSection → Landing page with animated travel icons
├── AuthModal → Google OAuth / Email signup
├── Tabs
│   ├── Plan Trip
│   │   ├── TravelPlanForm → 6-step travel planning wizard
│   │   ├── PopularDestinations, SuggestedBanners, RecommendedTours
│   │   └── ItineraryDisplay → Generated itinerary view
│   ├── My Trips
│   │   └── MyTrip → User's saved itineraries
│   └── Admin (관리자)
│       └── AdminDashboard → 8-tab Korean admin interface
```

### State Management
All state in App.tsx via useState:
- `currentItinerary` - Generated itinerary data
- `currentUser` - Auth user data
- `activeTab` - Current navigation tab
- `confirmedTrips` - Saved trips (persisted to localStorage)
- `events` - Event database
- `selectedDestination` - Selected destination for planning

### Key Data Types
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

interface UserInput {
  duration?: string;
  cities: string[];
  budget: string;
  interests: string[];
  nationality?: string;
  additionalNotes?: string;
  startDate?: Date;
}
```

## Path Aliases

Configured in `vite.config.ts`:
- `@/*` → `src/*`
- `figma:asset/*` → Figma PNG assets in `src/assets/`

## Key Patterns

### UI Components
All Radix UI wrappers in `src/components/ui/`. Use existing components; follow CVA pattern for variants.

### Styling
Tailwind utility classes + `cn()` helper from `src/lib/utils` for conditional classes.

### Forms
TravelPlanForm uses 6-step wizard pattern. EventForm for admin event management.

### Data Persistence
localStorage key: `confirmedTrips` for saved itineraries.

## Admin Dashboard Tabs (Korean)

1. 사용자 (Users) - User management
2. 여행일정 (Itineraries) - Trip management
3. 평점 (Ratings) - Review management
4. 목적지 (Destinations) - Destination database
5. 이벤트 (Events) - Event CRUD
6. 이벤트 설정 (Event Settings) - Global settings
7. 시스템 (System) - API status
8. 인기활동 (Popular Activities) - Analytics

## Backend Integration

Currently all data is mocked client-side. Backend API specifications are documented in:
- `FE_DocumentationForBE/API_SPECIFICATION.md` - Full API endpoints
- `FE_DocumentationForBE/DB_SCHEMA.md` - Database schema
- `FE_DocumentationForBE/PAGE_STRUCTURE.md` - Page-by-page data requirements

## Language Policy

- **Customer UI (Plan Trip, My Trips)**: English only
- **Admin Dashboard**: Korean only (관리자용)

## Notes

- Figma design: https://www.figma.com/design/UHEaJ1tkkRN97RwM1GwE74/-A-Korea-Travel-AI-Assistant
- 15 Korean cities/regions available for selection
- 150+ countries for nationality dropdown

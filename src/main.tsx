import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./i18n"; // Initialize i18n before App
import { RegionPage } from "./pages/RegionPage.tsx";
import { DestinationPage } from "./pages/DestinationPage.tsx";
import { EmailVerificationPage } from "./pages/EmailVerificationPage.tsx";
import { PlanPage } from "./pages/PlanPage";
import { MyTripsPage } from "./pages/MyTripsPage";
import { AdminPage } from "./pages/AdminPage";
import { AppLayout } from "./layouts/AppLayout";
import { AuthProvider } from "./providers/AuthProvider";
import { ItineraryDraftProvider } from "./providers/ItineraryDraftProvider";
import { EventsProvider } from "./providers/EventsProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <ItineraryDraftProvider>
          <EventsProvider>
            <Routes>
          {/* Phase 2 PR-2: route skeleton — root redirects to /plan */}
          <Route path="/" element={<Navigate to="/plan" replace />} />

          {/* Phase 2 PR-7: AppLayout (Header + Footer + AuthModal) wraps main app routes.
              DestinationContent / EmailVerificationPage는 자체 헤더/푸터를 보유하므로 외부에 둔다. */}
          <Route element={<AppLayout />}>
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/my-trips" element={<MyTripsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/plan" replace />} />
          </Route>

          {/* Static region pages (existing URLs for SEO) — DestinationContent가 자체 헤더/푸터 보유 */}
          <Route path="/seoul" element={<RegionPage />} />
          <Route path="/busan" element={<RegionPage />} />
          <Route path="/gyeongju" element={<RegionPage />} />
          <Route path="/jeonju" element={<RegionPage />} />
          <Route path="/jeju" element={<RegionPage />} />

          {/* Dynamic destination pages — DestinationContent가 자체 헤더/푸터 보유 */}
          <Route path="/destination/:slug" element={<DestinationPage />} />

          {/* Email verification page — 자체 풀스크린 레이아웃 */}
          <Route path="/verify-email" element={<EmailVerificationPage />} />
        </Routes>
          </EventsProvider>
        </ItineraryDraftProvider>
      </AuthProvider>
    </BrowserRouter>
  </HelmetProvider>
);

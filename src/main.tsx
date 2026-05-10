import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./i18n"; // Initialize i18n before App
import App from "./App.tsx";
import { RegionPage } from "./pages/RegionPage.tsx";
import { DestinationPage } from "./pages/DestinationPage.tsx";
import { EmailVerificationPage } from "./pages/EmailVerificationPage.tsx";
import { PlanPage } from "./pages/PlanPage";
import { MyTripsPage } from "./pages/MyTripsPage";
import { AdminPage } from "./pages/AdminPage";
import { AuthProvider } from "./providers/AuthProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Phase 2 PR-2: route skeleton — root redirects to /plan */}
          <Route path="/" element={<Navigate to="/plan" replace />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/my-trips" element={<MyTripsPage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* Static region pages (existing URLs for SEO) */}
          <Route path="/seoul" element={<RegionPage />} />
          <Route path="/busan" element={<RegionPage />} />
          <Route path="/gyeongju" element={<RegionPage />} />
          <Route path="/jeonju" element={<RegionPage />} />
          <Route path="/jeju" element={<RegionPage />} />

          {/* Dynamic destination pages (new admin-created destinations) */}
          <Route path="/destination/:slug" element={<DestinationPage />} />

          {/* Email verification page */}
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          {/* 임시 catch-all — 작업 7(별도 세션)에서 제거 예정 */}
          <Route path="/*" element={<App />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </HelmetProvider>
);

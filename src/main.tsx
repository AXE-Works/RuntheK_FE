import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./i18n"; // Initialize i18n before App
import App from "./App.tsx";
import { RegionPage } from "./pages/RegionPage.tsx";
import { DestinationPage } from "./pages/DestinationPage.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <BrowserRouter>
      <Routes>
        {/* Static region pages (existing URLs for SEO) */}
        <Route path="/seoul" element={<RegionPage />} />
        <Route path="/busan" element={<RegionPage />} />
        <Route path="/gyeongju" element={<RegionPage />} />
        <Route path="/jeonju" element={<RegionPage />} />
        <Route path="/jeju" element={<RegionPage />} />

        {/* Dynamic destination pages (new admin-created destinations) */}
        <Route path="/destination/:slug" element={<DestinationPage />} />

        {/* Main app */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </HelmetProvider>
);

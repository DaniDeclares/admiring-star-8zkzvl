// filename: src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Main Brand Pages
import HomePage from "./pages/Homepage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";

// Services Hub & Operating Divisions
import ServicesPage from "./pages/ServicesPage.jsx";
import BusinessSolutionsPage from "./pages/services/BusinessSolutionsPage.jsx";
import PrintStudioPage from "./pages/services/PrintStudioPage.jsx";
import EventsPage from "./pages/services/EventsPage.jsx";
import PropertyPage from "./pages/services/PropertyPage.jsx";
import ConciergePage from "./pages/services/ConciergePage.jsx";
import ExpressGoodsPage from "./pages/services/ExpressGoodsPage.jsx";
import WeddingsDivisionPage from "./pages/WeddingsDivisionPage.jsx";

// Partner Network & B2B Ecosystem
import NetworkHubPage from "./pages/NetworkHubPage.jsx";
import ContentMarketingPage from "./pages/ContentMarketingPage.jsx";

// Marketplace & Shop
import ShopPage from "./pages/ShopPage.jsx";

// Industries & Public Sector
import GovConPage from "./pages/GovConPage.jsx";
import RealEstatePage from "./pages/RealEstatePage.jsx";

// Resources & Insights Blog
import BlogPage from "./pages/BlogPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";

// Dual Intake & Booking Engines
import BookPage from "./pages/BookPage.jsx";
import RequestServicePage from "./pages/RequestServicePage.jsx";

// Command Centers, Portals & Client Features
import AdminDashboardPage from "./pages/portal/AdminDashboardPage.jsx";
import VendorPortal from "./pages/portal/VendorPortal.jsx";
import ClientPhotoPortal from "./pages/portal/ClientPhotoPortal.jsx";

function App() {
  return (
    <Routes>
      {/* ROOT ROUTE -> BRAND HOMEPAGE */}
      <Route path="/" element={<HomePage />} />

      {/* MAIN BRAND ROUTES */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* SERVICES HUB & OPERATING DIVISIONS */}
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/business-solutions" element={<BusinessSolutionsPage />} />
      <Route path="/services/print-studio" element={<PrintStudioPage />} />
      <Route path="/services/events" element={<EventsPage />} />
      <Route path="/services/property" element={<PropertyPage />} />
      <Route path="/services/concierge" element={<ConciergePage />} />
      <Route path="/services/express-goods" element={<ExpressGoodsPage />} />
      <Route path="/events/weddings" element={<WeddingsDivisionPage />} />

      {/* PARTNER ECOSYSTEM & NETWORK */}
      <Route path="/network" element={<NetworkHubPage />} />
      <Route path="/partner" element={<NetworkHubPage />} />
      <Route path="/campaigns" element={<ContentMarketingPage />} />

      {/* MARKETPLACE & SHOP */}
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/marketplace" element={<ShopPage />} />

      {/* INDUSTRIES & PUBLIC SECTOR */}
      <Route path="/industries/government" element={<GovConPage />} />
      <Route path="/govcon" element={<Navigate to="/industries/government" replace />} />
      <Route path="/industries/real-estate" element={<RealEstatePage />} />

      {/* DUAL INTAKE ENGINES */}
      <Route path="/book" element={<BookPage />} />
      <Route path="/request-service" element={<RequestServicePage />} />

      {/* COMMAND CENTERS & PORTALS */}
      <Route path="/portal/admin" element={<AdminDashboardPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/portal/vendors" element={<VendorPortal />} />
      <Route path="/portal/photos" element={<ClientPhotoPortal />} />

      {/* BLOG & RESOURCES */}
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />

      {/* LEGACY URL REDIRECTS */}
      <Route path="/field-services" element={<Navigate to="/services/property" replace />} />
      <Route path="/events" element={<Navigate to="/services/events" replace />} />
      <Route path="/signature-services" element={<Navigate to="/services" replace />} />
      <Route path="/intake" element={<Navigate to="/book" replace />} />

      {/* CATCH-ALL REDIRECT TO HOMEPAGE */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

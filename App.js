import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Core Brand Pages
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";

// Services
import ServicesPage from "./pages/ServicesPage.jsx";
import BusinessSolutionsPage from "./pages/services/BusinessSolutionsPage.jsx";
import PrintStudioPage from "./pages/services/PrintStudioPage.jsx";
import EventsPage from "./pages/services/EventsPage.jsx";
import PropertyPage from "./pages/services/PropertyPage.jsx";
import ConciergePage from "./pages/services/ConciergePage.jsx";

// Weddings Division
import WeddingsDivisionPage from "./divisions/events/WeddingsDivisionPage.jsx";

// Marketplace & Content Engine
import ShopPage from "./pages/ShopPage.jsx";
import ContentMarketingPage from "./pages/ContentMarketingPage.jsx";

// Industries
import GovConPage from "./pages/GovConPage.jsx";
import RealEstatePage from "./pages/RealEstatePage.jsx";

// Network
import NetworkHubPage from "./network/NetworkHubPage.jsx";

// Internal Portals
import DashboardPage from "./pages/admin/DashboardPage.jsx";
import ClientPhotoPortal from "./pages/portal/ClientPhotoPortal.jsx";
import VendorPortal from "./pages/portal/VendorPortal.jsx";

// Resources & Booking
import BlogPage from "./pages/BlogPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";

function App() {
  return (
    <Routes>
      {/* PARENT ENTERPRISE BRAND */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/marketing" element={<ContentMarketingPage />} />

      {/* SERVICE DIVISIONS */}
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/business" element={<BusinessSolutionsPage />} />
      <Route path="/services/business-solutions" element={<BusinessSolutionsPage />} />
      <Route path="/services/creative" element={<PrintStudioPage />} />
      <Route path="/services/print-studio" element={<PrintStudioPage />} />
      <Route path="/services/property" element={<PropertyPage />} />
      <Route path="/services/concierge" element={<ConciergePage />} />

      {/* EVENTS & WEDDINGS DIVISION */}
      <Route path="/services/events" element={<EventsPage />} />
      <Route path="/events/weddings" element={<WeddingsDivisionPage />} />

      {/* MARKETPLACE COMMERCE */}
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/marketplace" element={<ShopPage />} />

      {/* INDUSTRIES */}
      <Route path="/industries/government" element={<GovConPage />} />
      <Route path="/industries/real-estate" element={<RealEstatePage />} />

      {/* PARTNER NETWORK */}
      <Route path="/network" element={<NetworkHubPage />} />

      {/* INTERNAL OPERATIONS (HIDDEN FROM PUBLIC NAV) */}
      <Route path="/portal/admin" element={<DashboardPage />} />
      <Route path="/portal/dashboard" element={<DashboardPage />} />
      <Route path="/portal/photos" element={<ClientPhotoPortal />} />
      <Route path="/portal/vendors" element={<VendorPortal />} />

      {/* UNIVERSAL INTAKE & BOOKING */}
      <Route path="/book" element={<BookingPage />} />

      {/* BLOG */}
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />

      {/* LEGACY REDIRECTS */}
      <Route path="/request-service" element={<Navigate to="/book" replace />} />
      <Route path="/field-services" element={<Navigate to="/services/property" replace />} />
      <Route path="/events" element={<Navigate to="/services/events" replace />} />
      <Route path="/signature-services" element={<Navigate to="/services" replace />} />

      {/* 404 FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

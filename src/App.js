// src/App.js
import React, { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

// Global Components
import FestivalBanner from "./components/FestivalBanner.jsx";
import Navbar from "./components/Navbar.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";
import { SHOW_FESTIVAL } from "./data/siteConfig.js";
import { loadHubSpotTracking } from "./lib/loadHubSpot.js";

// Public Pages
import Homepage from "./pages/HomePage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
codex/redesign-danideclares.com-for-service-booking
import BookPage from "./pages/BookPage.jsx";
import PayPage from "./pages/PayPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
=======
import BookingPage from "./pages/BookingPage.jsx";
import PayPage from "./pages/PayPage.jsx";

import FestivalPage from "./pages/FestivalPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import FacilityVisitsPage from "./pages/FacilityVisitsPage.jsx";
import FederalPage from "./pages/FederalPage.jsx";
import TaxServicesPage from "./pages/TaxServicesPage.jsx";

// Newly created Public Pages
codex/redesign-danideclares.com-for-service-booking
import PackagesPage from "./pages/PackagesPage.jsx";
=======
import PaymentCancel from "./pages/PaymentCancel.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import TravelQuotePage from "./pages/TravelQuotePage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";

// Auth & Dashboard
import LoginPage from "./pages/LoginPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import NotaryDashboard from "./pages/NotaryDashboard.jsx";
import VendorPortal from "./pages/VendorPortal.jsx";
import FestivalDashboard from "./pages/FestivalDashboard.jsx";
import PartnerOnboarding from "./pages/PartnerOnboarding.jsx";
// You can remove SuccessPage/CancelPage if you fully switch to PaymentSuccess/PaymentCancel
import SuccessPage from "./pages/SuccessPage.jsx";
import CancelPage from "./pages/CancelPage.jsx";

export default function App() {
  const location = useLocation();
  const gaMeasurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "mcjs";
    script.src =
      "https://chimpstatic.com/mcjs-connected/js/users/a28036bff232caaa9e6879b80/db34d9bf94e068347531b6748.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    loadHubSpotTracking();
  }, []);

  useEffect(() => {
    if (!isProduction || !gaMeasurementId) {
      return;
    }

    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    if (!window.gtag) {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }

    if (!document.getElementById("ga-script")) {
      const gaScript = document.createElement("script");
      gaScript.id = "ga-script";
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
      document.head.appendChild(gaScript);
    }

    window.gtag("js", new Date());
    window.gtag("config", gaMeasurementId, { send_page_view: false });
  }, [gaMeasurementId, isProduction]);

  useEffect(() => {
    if (!isProduction || !gaMeasurementId || !window.gtag) {
      return;
    }

    window.gtag("event", "page_view", {
      page_path: `${location.pathname}${location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [gaMeasurementId, isProduction, location]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window._hsq = window._hsq || [];
    window._hsq.push(["setPath", `${location.pathname}${location.search}`]);
    window._hsq.push(["trackPageView"]);
  }, [location]);
  return (
    <>
      {SHOW_FESTIVAL && <FestivalBanner />}
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/facility-visits" element={<FacilityVisitsPage />} />
        <Route path="/federal" element={<FederalPage />} />
        <Route
          path="/federal-services"
          element={<Navigate to="/federal" replace />}
        />
        <Route path="/tax" element={<Navigate to="/tax-services" replace />} />
        <Route path="/tax-services" element={<TaxServicesPage />} />
        <Route path="/shop" element={<ShopPage />} />
codex/redesign-danideclares.com-for-service-booking
        <Route path="/services" element={<PackagesPage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/notary" element={<Navigate to="/services" replace />} />
        <Route path="/weddings" element={<Navigate to="/services" replace />} />
        <Route path="/financial" element={<Navigate to="/services" replace />} />
        <Route path="/real-estate" element={<Navigate to="/services" replace />} />
        <Route path="/legal-services" element={<Navigate to="/services" replace />} />
        <Route path="/packages" element={<Navigate to="/services" replace />} />
        <Route path="/bookings" element={<Navigate to="/book" replace />} />
=======
        <Route path="/book" element={<BookingPage />} />
        <Route path="/bookings" element={<Navigate to="/book" replace />} />
        <Route path="/pay" element={<PayPage />} />

        <Route path="/travel-quote" element={<TravelQuotePage />} />
        <Route path="/festival" element={<FestivalPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route
          path="/onboarding"
          element={<Navigate to="/partner-onboarding" replace />}
        />
        <Route path="/partner-onboarding" element={<PartnerOnboarding />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

codex/redesign-danideclares.com-for-service-booking
        {/* Newly added service pages */}
=======
        {/* Legacy service routes */}
        <Route path="/notary" element={<Navigate to="/services" replace />} />
        <Route
          path="/apostille"
          element={<Navigate to="/book?service=apostille" replace />}
        />
        <Route
          path="/officiant"
          element={<Navigate to="/book?service=officiant" replace />}
        />
        <Route path="/packages" element={<Navigate to="/services" replace />} />
        <Route path="/real-estate" element={<Navigate to="/services" replace />} />
        <Route path="/legal-services" element={<Navigate to="/services" replace />} />
        <Route
          path="/professional-services"
          element={<Navigate to="/services" replace />}
        />
        <Route path="/weddings" element={<Navigate to="/services" replace />} />
        <Route path="/financial" element={<Navigate to="/services" replace />} />
        <Route path="/events" element={<Navigate to="/services" replace />} />

        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Phase-2 Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notary-dashboard" element={<NotaryDashboard />} />
          <Route path="/vendor-portal" element={<VendorPortal />} />
          <Route
            path="/festival-dashboard"
            element={<FestivalDashboard />}
          />
          {/* legacy or alternate success/cancel */}
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
        </Route>
      </Routes>

      <CookieConsent />
      <Footer />
    </>
  );
}

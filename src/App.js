// src/App.js
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Global Components
import FestivalBanner from "./components/FestivalBanner.jsx";
import Navbar from "./components/Navbar.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";
import { SHOW_FESTIVAL } from "./data/siteConfig.js";

// Public Pages
import Homepage from "./pages/HomePage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import FinancialPage from "./pages/FinancialPage.jsx";
import WeddingsPage from "./pages/WeddingsPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import NotaryPage from "./pages/NotaryPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import FestivalPage from "./pages/FestivalPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";

// Newly created Public Pages
import PackagesPage from "./pages/PackagesPage.jsx";
import RealEstatePage from "./pages/RealEstatePage.jsx";
import LegalServicesPage from "./pages/LegalServicesPage.jsx";
import PaymentCancel from "./pages/PaymentCancel.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import TravelQuotePage from "./pages/TravelQuotePage.jsx";

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
  const gaMeasurementId =
    process.env.NEXT_PUBLIC_GA_ID ||
    process.env.REACT_APP_GA_MEASUREMENT_ID;
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

  return (
    <>
      {SHOW_FESTIVAL && <FestivalBanner />}
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/notary" element={<NotaryPage />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/travel-quote" element={<TravelQuotePage />} />
        <Route path="/festival" element={<FestivalPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        {/* Newly added service pages */}
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/real-estate" element={<RealEstatePage />} />
        <Route path="/legal-services" element={<LegalServicesPage />} />
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
          <Route
            path="/partner-onboarding"
            element={<PartnerOnboarding />}
          />
          {/* legacy or alternate success/cancel */}
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
        </Route>
      </Routes>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

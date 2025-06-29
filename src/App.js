import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

// Global Components
import FestivalBanner from "./components/FestivalBanner.jsx";
import Navbar from "./components/Navbar.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";

// Public Pages
import Homepage from "./pages/HomePage.jsx";
import CoachingPage from "./pages/CoachingPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import WeddingsPage from "./pages/WeddingsPage.jsx";
import NotaryPage from "./pages/NotaryPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import FinancialPage from "./pages/FinancialPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import FestivalPage from "./pages/FestivalPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";

// Phase-2 / Private Pages & Auth
import LoginPage from "./pages/LoginPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import NotaryDashboard from "./pages/NotaryDashboard.jsx";
import VendorPortal from "./pages/VendorPortal.jsx";
import FestivalDashboard from "./pages/FestivalDashboard.jsx";
import PartnerOnboarding from "./pages/PartnerOnboarding.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import CancelPage from "./pages/CancelPage.jsx";

export default function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.id = "mcjs";
    script.src =
      "https://chimpstatic.com/mcjs-connected/js/users/a28036bff232caaa9e6879b80/db34d9bf94e068347531b6748.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <FestivalBanner />
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/notary" element={<NotaryPage />} />
        <Route path="/festival" element={<FestivalPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

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

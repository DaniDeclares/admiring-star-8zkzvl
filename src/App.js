// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Shared UI components
import FestivalBanner from "./components/FestivalBanner.jsx";
import Navbar from "./components/Navbar.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";

// Pages
import Homepage from "./pages/Homepage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import CoachingPage from "./pages/CoachingPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import WeddingsPage from "./pages/WeddingsPage.jsx";
import NotaryPage from "./pages/NotaryPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import FinancialPage from "./pages/FinancialPage.jsx";
import FestivalPage from "./pages/FestivalPage.jsx";

export default function App() {
  return (
    <Router>
      <FestivalBanner />
      <Navbar />

      <Routes>
        <Route path="/"           element={<Homepage />} />
        <Route path="/blog"       element={<BlogPage />} />
        <Route path="/shop"       element={<ShopPage />} />
        <Route path="/coaching"   element={<CoachingPage />} />
        <Route path="/events"     element={<EventsPage />} />
        <Route path="/weddings"   element={<WeddingsPage />} />
        <Route path="/notary"     element={<NotaryPage />} />
        <Route path="/contact"    element={<ContactPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/financial"  element={<FinancialPage />} />
        <Route path="/festival"   element={<FestivalPage />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </Router>
  );
}
<Route path="*" element={<Navigate to="/" replace />} />

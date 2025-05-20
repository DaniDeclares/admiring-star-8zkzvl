import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// global styles
import "./index.css";

// site-wide chrome
import FestivalBanner from "./components/FestivalBanner.jsx";
import "./components/FestivalBanner.css";
import Navbar from "./components/Navbar.jsx";
import "./components/Navbar.css";
import SocialLinks from "./components/SocialLinks.jsx";
import "./components/SocialLinks.css";
import CookieConsent from "./components/CookieConsent.jsx";
import "./components/CookieConsent.css";
import Footer from "./components/Footer.jsx";
import "./components/Footer.css";

// pages + their styles
import Homepage from "./pages/Homepage.jsx";
import "./pages/Homepage.css";
import BlogPage from "./pages/BlogPage.jsx";
import "./pages/BlogPage.css";
import ShopPage from "./pages/ShopPage.jsx";
import "./pages/ShopPage.css";
import CoachingPage from "./pages/CoachingPage.jsx";
import "./pages/CoachingPage.css";
import EventsPage from "./pages/EventsPage.jsx";
import "./pages/EventsPage.css";
import WeddingsPage from "./pages/WeddingsPage.jsx";
import "./pages/WeddingsPage.css";
import NotaryPage from "./pages/NotaryPage.jsx";
import "./pages/NotaryPage.css";
import ContactPage from "./pages/ContactPage.jsx";
import "./pages/ContactPage.css";
import MembershipPage from "./pages/MembershipPage.jsx";
import "./pages/MembershipPage.css";
import FinancialPage from "./pages/FinancialPage.jsx";
import "./pages/FinancialPage.css";
import FestivalPage from "./pages/FestivalPage.jsx";
import "./pages/FestivalPage.css";

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
        <Route path="/finance"    element={<FinancialPage />} />
        <Route path="/festival"   element={<FestivalPage />} />
 

        {/* invalid URLs → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </Router>
  );
}

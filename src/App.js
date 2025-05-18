import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// global styles
import "./index.css";

// site-wide chrome
import FestivalBanner from "./components/FestivalBanner";
import "./components/FestivalBanner.css";
import Navbar from "./components/Navbar";
import "./components/Navbar.css";
import SocialLinks from "./components/SocialLinks";
import "./components/SocialLinks.css";
import CookieConsent from "./components/CookieConsent";
import "./components/CookieConsent.css";
import Footer from "./components/Footer";
import "./components/Footer.css";

// pages + their styles
import Homepage from "./pages/Homepage";
import "./pages/Homepage.css";
import BlogPage from "./pages/BlogPage";
import "./pages/BlogPage.css";
import ShopPage from "./pages/ShopPage";
import "./pages/ShopPage.css";
import CoachingPage from "./pages/CoachingPage";
import "./pages/CoachingPage.css";
import EventsPage from "./pages/EventsPage";
import "./pages/EventsPage.css";
import WeddingsPage from "./pages/WeddingsPage";
import "./pages/WeddingsPage.css";
import NotaryPage from "./pages/NotaryPage";
import "./pages/NotaryPage.css";
import ContactPage from "./pages/ContactPage";
import "./pages/ContactPage.css";
import MembershipPage from "./pages/MembershipPage";
import "./pages/MembershipPage.css";

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

        {/* invalid URLs → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </Router>
  );
}

// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CookieConsent from "./CookieConsent";
import Navbar from "./Navbar";

import Homepage from "./Homepage";
import WeddingsPage from "./WeddingsPage";
import CalendarPage from "./CalendarPage";
import CoachingPage from "./CoachingPage";
import EventsPage from "./EventsPage";
import NotaryPage from "./NotaryPage";
import RegisterPage from "./RegisterPage";
import SpeakerInfoPage from "./SpeakerInfoPage";
import SponsorPage from "./SponsorPage";
import FinancialPage from "./FinancialPage";
import MerchPage from "./MerchPage";
import BlogPage from "./BlogPage";
import BlogPostPage from "./BlogPostPage";
import ContactPage from "./ContactPage";
import MagazinePage from "./MagazinePage";
import FAQPage from "./FAQPage";
import CartPage from "./CartPage"; // ← Add this import

export default function App() {
  return (
    <Router>
      {/* show cookie banner before anything else */}
      <CookieConsent />

      {/* your main navigation */}
      <Navbar />

      {/* all your routes */}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/notary" element={<NotaryPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/speakers" element={<SpeakerInfoPage />} />
        <Route path="/sponsor" element={<SponsorPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/merch" element={<MerchPage />} />
        <Route path="/cart" element={<CartPage />} /> {/* ← New cart route */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/magazine" element={<MagazinePage />} />
        <Route path="/faq" element={<FAQPage />} />
      </Routes>
    </Router>
  );
}

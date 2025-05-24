import React from "react";
import { Routes, Route } from "react-router-dom";

import FestivalBanner from "./components/FestivalBanner.jsx";
import Navbar from "./components/Navbar.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";

import Homepage from "./pages/Homepage.jsx";
import CoachingPage from "./pages/CoachingPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import WeddingsPage from "./pages/WeddingsPage.jsx";
import NotaryPage from "./pages/NotaryPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import FinancialPage from "./pages/FinancialPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";

export default function App() {
  return (
    <>
      <FestivalBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/notary" element={<NotaryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/festival" element={<FestivalPage />} />
      </Routes>
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

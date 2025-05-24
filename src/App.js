import React from "react";
import { Routes, Route } from "react-router-dom";

import FestivalBanner from "./components/FestivalBanner.jsx";
import Navbar from "./components/Navbar.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";

import Homepage from "./pages/Homepage.jsx";
import CoachingPage from "./pages/CoachingPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import WeddingsPage from "./pages/WeddingsPage.jsx";

export default function App() {
  return (
    <>
      <FestivalBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
      </Routes>
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

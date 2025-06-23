import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import FestivalBanner from "./components/FestivalBanner.jsx";
import Navbar from "./components/Navbar.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";

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

export default function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.id = "mcjs";
    script.src = "https://chimpstatic.com/mcjs-connected/js/users/a28036bff232caaa9e6879b80/db34d9bf94e068347531b6748.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <FestivalBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/notary" element={<NotaryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/festival" element={<FestivalPage />} />
      </Routes>
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

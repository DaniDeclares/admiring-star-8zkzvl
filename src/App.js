import React from "react";
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
<<<<<<< HEAD
import BlogPostPage from "./pages/BlogPostPage.jsx";  // ← ADD THIS LINE
import ShopPage from "./pages/ShopPage.jsx";
import FestivalPage from "./pages/FestivalPage.jsx";
=======
import ShopPage from "./pages/ShopPage.jsx";
>>>>>>> 64b40dc7b9889077ee874c87a365fe2330bda43f

export default function App() {
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
<<<<<<< HEAD
        <Route path="/blog/:slug" element={<BlogPostPage />} />  {/* ← NEW BLOG POST ROUTE */}
        <Route path="/festival" element={<FestivalPage />} />
=======
>>>>>>> 64b40dc7b9889077ee874c87a365fe2330bda43f
      </Routes>
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

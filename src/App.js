import React from "react";
import { Routes, Route } from "react-router-dom";

import FestivalBanner from "./components/FestivalBanner.jsx";
import Navbar from "./components/Navbar.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";

import CoachingPage from "./pages/CoachingPage.jsx"; // or any other safe, working page

export default function App() {
  return (
    <>
      <FestivalBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<div style={{ padding: '2rem' }}>TEST CONTENT: Home route is working ✅</div>} />
        <Route path="/coaching" element={<CoachingPage />} />
      </Routes>
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";

import Homepage from "./pages/Homepage.jsx";
import CoachingPage from "./pages/CoachingPage.jsx"; // or any other safe, working page

export default function App() {
  return (
    <>
      <FestivalBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/coaching" element={<CoachingPage />} />
      </Routes>
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

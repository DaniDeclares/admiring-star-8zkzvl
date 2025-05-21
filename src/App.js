import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
// import BlogPage from "./pages/BlogPage.jsx";
// import "./pages/BlogPage.css";
// add other pages back as needed

export default function App() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

      <Routes>
        <Route path="/" element={<Homepage />} />
        {/* add more routes like below when ready */}
        {/* <Route path="/shop" element={<ShopPage />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

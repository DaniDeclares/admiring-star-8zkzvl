import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FestivalBanner from "./components/FestivalBanner.jsx";
import Navbar from "./components/Navbar.jsx";
import SocialLinks from "./components/SocialLinks.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <Router>
      <FestivalBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<div>Hello from App</div>} />
      </Routes>
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </Router>
  );
}

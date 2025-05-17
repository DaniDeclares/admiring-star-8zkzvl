// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Global styles & resets
import "./index.css";

// Site chrome
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Homepage from "./pages/Homepage";
import BlogPage from "./pages/BlogPage";
import CoachingPage from "./pages/CoachingPage";
import ContactPage from "./pages/ContactPage";
import EventsPage from "./pages/EventsPage";
import NotaryPage from "./pages/NotaryPage";
import ShopPage from "./pages/ShopPage";
import WeddingsPage from "./pages/WeddingsPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* homepage on “/” */}
        <Route path="/" element={<Homepage />} />

        {/* core site pages */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/notary" element={<NotaryPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/weddings" element={<WeddingsPage />} />

        {/* fallback to homepage (or swap in a 404 component if you add one) */}
        <Route path="*" element={<Homepage />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;

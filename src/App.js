import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Homepage from "./pages/Homepage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import CoachingPage from "./pages/CoachingPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import WeddingsPage from "./pages/WeddingsPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotaryPage from "./pages/NotaryPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/coaching" element={<CoachingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/weddings" element={<WeddingsPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/notary" element={<NotaryPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

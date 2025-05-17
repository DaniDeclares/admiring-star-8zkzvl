// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Core pages
import HomePage from './HomePage';
import CoachingPage from './CoachingPage';
import EventsPage from './EventsPage';
import WeddingsPage from './WeddingsPage';
import NotaryPage from './NotaryPage';
import BlogPage from './BlogPage';
import LegalPage from './LegalPage';
import ShopPage from './ShopPage';
import ContactPage from './ContactPage';

// Optional: a shared Layout (header/nav/footer)
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/notary" element={<NotaryPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;

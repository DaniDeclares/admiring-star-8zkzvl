import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RequestServicePage from './pages/RequestServicePage';
import GovConPage from './pages/GovConPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/request-service" element={<RequestServicePage />} />
      <Route path="/services" element={<RequestServicePage />} />
      <Route path="/field-services" element={<RequestServicePage />} />
      <Route path="/events" element={<RequestServicePage />} />
      <Route path="/signature-services" element={<RequestServicePage />} />
      <Route path="/govcon" element={<GovConPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
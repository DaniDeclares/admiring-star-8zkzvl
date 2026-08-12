import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
// Core Brand Pages
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
// Services
import ServicesPage from "./pages/ServicesPage.jsx";
import BusinessSolutionsPage from "./pages/services/BusinessSolutionsPage.jsx";
import PrintStudioPage from "./pages/services/PrintStudioPage.jsx";
import EventsPage from "./pages/services/EventsPage.jsx";
import PropertyPage from "./pages/services/PropertyPage.jsx";
import ConciergePage from "./pages/services/ConciergePage.jsx";
// Weddings Division & Subpages
import WeddingsDivisionPage from "./divisions/events/WeddingsDivisionPage.jsx";
import WeddingsPage from "./pages/WeddingsPage.jsx";
import FestivalPage from "./pages/FestivalPage.jsx";
import FederalPage from "./pages/FederalPage.jsx";
import FacilityVisitsPage from "./pages/FacilityVisitsPage.jsx";
import ExpressGoodsPage from "./pages/ExpressGoodsPage.jsx";
import PackagesPage from "./pages/PackagesPage.jsx";
import PartnerNetwork from "./pages/PartnerNetwork";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import MembershipPage from "./pages/MembershipPage";
import NotaryPage from "./pages/NotaryPage";
import RequestServicePage from "./pages/RequestServicePage";
import TravelQuotePage from "./pages/TravelQuotePage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
export default function App() {
return (
<Layout>
<Routes>
{/* Core Pages */}
<Route path="/" element={<HomePage />} />
<Route path="/about" element={<AboutPage />} />
<Route path="/contact" element={<ContactPage />} />
{/* Services */}
<Route path="/services" element={<ServicesPage />} />
<Route path="/services/business" element={<BusinessSolutionsPage />} />
<Route path="/services/print-studio" element={<PrintStudioPage />} />
<Route path="/services/events" element={<EventsPage />} />
<Route path="/services/property" element={<PropertyPage />} />
<Route path="/services/concierge" element={<ConciergePage />} />
<Route path="/services/express-goods" element={<ExpressGoodsPage />} />
<Route path="/services/facility-visits" element={<FacilityVisitsPage />} />
<Route path="/services/federal" element={<FederalPage />} />
<Route path="/services/notary" element={<NotaryPage />} />
{/* Weddings & Events Subpages */}
<Route path="/weddings" element={<WeddingsDivisionPage />} />
<Route path="/events/weddings" element={<WeddingsPage />} />
<Route path="/events/festivals" element={<FestivalPage />} />
{/* Client Portals, Packages & Tools */}
<Route path="/packages" element={<PackagesPage />} />
<Route path="/membership" element={<MembershipPage />} />
<Route path="/partner-network" element={<PartnerNetwork />} />
<Route path="/travel-quote" element={<TravelQuotePage />} />
<Route path="/request-service" element={<RequestServicePage />} />
{/* Blog */}
<Route path="/blog" element={<BlogPage />} />
<Route path="/blog/:slug" element={<BlogPostPage />} />
{/* Legal */}
<Route path="/terms" element={<TermsPage />} />
<Route path="/privacy" element={<PrivacyPage />} />
{/* Clean Legacy Redirects (No duplicates) */}
<Route path="/field-services" element={<Navigate to="/services/property" replace />} />
<Route path="/events" element={<Navigate to="/services/events" replace />} />
<Route path="/signature-services" element={<Navigate to="/services" replace />} />
{/* 404 Fallback /}
<Route path="" element={<Navigate to="/" replace />} />
</Routes>
</Layout>
);
}

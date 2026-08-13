import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import BusinessSolutionsPage from "./pages/BusinessSolutionsPage.jsx";
import PrintStudioPage from "./pages/services/PrintStudioPage.jsx";
import EventsPage from "./pages/services/EventsPage.jsx";
import PropertyServicesPage from "./pages/services/PropertyPage.jsx";
import ConciergePage from "./pages/services/ConciergePage.jsx";
import FederalPage from "./pages/FederalPage.jsx";
import FacilityVisitsPage from "./pages/FacilityVisitsPage.jsx";
import ExpressGoodsPage from "./pages/ExpressGoodsPage.jsx";
import NotaryPage from "./pages/NotaryPage.jsx";
import WeddingsDivisionPage from "./divisions/events/WeddingsDivisionPage.jsx";
import WeddingsPage from "./pages/WeddingsPage.jsx";
import FestivalPage from "./pages/FestivalPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import RealEstatePage from "./pages/RealEstatePage.jsx";
import PackagesPage from "./pages/PackagesPage.jsx";
import PartnerNetwork from "./pages/PartnerNetwork.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import NetworkHubPage from "./pages/NetworkHubPage.jsx";
import VendorPortal from "./pages/VendorPortal.jsx";
import RequestServicePage from "./pages/RequestServicePage.jsx";
import ResidentConciergePage from "./pages/ResidentConciergeProductionPage.jsx";
import ResidentFulfillmentPage from "./pages/ResidentFulfillmentPage.jsx";
import TravelQuotePage from "./pages/TravelQuotePage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

export default function App(){return <Layout><Routes>
<Route path="/" element={<HomePage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/services" element={<ServicesPage/>}/><Route path="/services/business" element={<BusinessSolutionsPage/>}/><Route path="/services/business-solutions" element={<BusinessSolutionsPage/>}/><Route path="/services/print-studio" element={<PrintStudioPage/>}/><Route path="/services/events" element={<EventsPage/>}/><Route path="/services/property" element={<PropertyServicesPage/>}/><Route path="/property" element={<PropertyServicesPage/>}/><Route path="/services/concierge" element={<ConciergePage/>}/><Route path="/services/express-goods" element={<ExpressGoodsPage/>}/><Route path="/services/facility-visits" element={<FacilityVisitsPage/>}/><Route path="/services/federal" element={<FederalPage/>}/><Route path="/services/notary" element={<NotaryPage/>}/>
<Route path="/resident-concierge" element={<ResidentConciergePage/>}/><Route path="/resident-dispatch" element={<ResidentConciergePage/>}/><Route path="/portal/resident-fulfillment" element={<ResidentFulfillmentPage/>}/>
<Route path="/weddings" element={<WeddingsDivisionPage/>}/><Route path="/events/weddings" element={<WeddingsPage/>}/><Route path="/events/festivals" element={<FestivalPage/>}/><Route path="/festival" element={<FestivalPage/>}/><Route path="/book" element={<BookingPage/>}/><Route path="/shop" element={<ShopPage/>}/><Route path="/travel-quote" element={<TravelQuotePage/>}/><Route path="/request-service" element={<RequestServicePage/>}/><Route path="/real-estate" element={<RealEstatePage/>}/><Route path="/industries/real-estate" element={<RealEstatePage/>}/><Route path="/packages" element={<PackagesPage/>}/><Route path="/membership" element={<MembershipPage/>}/><Route path="/partner-network" element={<PartnerNetwork/>}/><Route path="/network" element={<NetworkHubPage/>}/><Route path="/portal/vendors" element={<VendorPortal/>}/><Route path="/industries/government" element={<FederalPage/>}/><Route path="/blog" element={<BlogPage/>}/><Route path="/blog/:slug" element={<BlogPostPage/>}/><Route path="/terms" element={<TermsPage/>}/><Route path="/privacy" element={<PrivacyPage/>}/><Route path="/field-services" element={<Navigate to="/services/property" replace/>}/><Route path="/events" element={<Navigate to="/services/events" replace/>}/><Route path="/signature-services" element={<Navigate to="/services" replace/>}/><Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></Layout>}

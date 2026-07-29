import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";


// Main Pages
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
import ExpressGoodsPage from "./pages/services/ExpressGoodsPage.jsx";


// Marketplace
import ShopPage from "./pages/ShopPage.jsx";


// Industries
import GovConPage from "./pages/GovConPage.jsx";
import RealEstatePage from "./pages/RealEstatePage.jsx";


// Resources
import BlogPage from "./pages/BlogPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";


// Booking
import BookingPage from "./pages/BookingPage.jsx";


function App() {

return (

<Routes>


{/* MAIN */}

<Route 
path="/" 
element={<HomePage />} 
/>

<Route 
path="/about" 
element={<AboutPage />} 
/>

<Route 
path="/contact" 
element={<ContactPage />} 
/>


{/* SERVICES */}

<Route 
path="/services" 
element={<ServicesPage />} 
/>


<Route 
path="/services/business-solutions" 
element={<BusinessSolutionsPage />} 
/>


<Route 
path="/services/print-studio" 
element={<PrintStudioPage />} 
/>


<Route 
path="/services/events" 
element={<EventsPage />} 
/>


<Route 
path="/services/property" 
element={<PropertyPage />} 
/>


<Route 
path="/services/concierge" 
element={<ConciergePage />} 
/>


<Route 
path="/services/express-goods" 
element={<ExpressGoodsPage />} 
/>



{/* MARKETPLACE */}

<Route 
path="/shop" 
element={<ShopPage />} 
/>


<Route 
path="/marketplace" 
element={<ShopPage />} 
/>



{/* INDUSTRIES */}

<Route 
path="/industries/government" 
element={<GovConPage />} 
/>


<Route 
path="/industries/real-estate" 
element={<RealEstatePage />} 
/>



{/* BOOKING */}

<Route 
path="/book" 
element={<BookingPage />} 
/>



{/* BLOG */}

<Route 
path="/blog" 
element={<BlogPage />} 
/>


<Route 
path="/blog/:slug" 
element={<BlogPostPage />} 
/>



{/* OLD URL REDIRECTS */}

<Route 
path="/request-service" 
element={<Navigate to="/book" replace />} 
/>


<Route 
path="/field-services" 
element={<Navigate to="/services/property" replace />} 
/>


<Route 
path="/events" 
element={<Navigate to="/services/events" replace />} 
/>


<Route 
path="/signature-services" 
element={<Navigate to="/services" replace />} 
/>



{/* 404 */}

<Route 
path="*" 
element={<Navigate to="/" replace />} 
/>


</Routes>

);

}


export default App;

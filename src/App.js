import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import CommercialCatalogPage from "./pages/CommercialCatalogPage.jsx";
import BusinessSolutionsPage from "./pages/BusinessSolutionsPage.jsx";
import PrintStudioPage from "./pages/services/PrintStudioPage.jsx";
import EventsPage from "./pages/services/EventsPage.jsx";
import PropertyServicesPage from "./pages/services/PropertyPage.jsx";
import ConciergePage from "./pages/services/ConciergePage.jsx";
import FederalPage from "./pages/FederalPage.jsx";
import FacilityVisitsPage from "./pages/FacilityVisitsPage.jsx";
import ExpressGoodsPage from "./pages/ExpressGoodsPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import RealEstatePage from "./pages/RealEstatePage.jsx";
import PackagesPage from "./pages/PackagesPage.jsx";
import PartnerNetwork from "./pages/PartnerNetwork.jsx";
import MembershipPage from "./pages/MembershipPage.jsx";
import NetworkHubPage from "./pages/NetworkHubPage.jsx";
import RequestServicePage from "./pages/RequestServicePage.jsx";
import PayPage from "./pages/PayPage.jsx";
import ResidentWelcomePage from "./pages/ResidentWelcomePage.jsx";
import ResidentFulfillmentPage from "./pages/portal/ResidentFulfillmentPage.jsx";
import OperationsConsolePage from "./pages/portal/OperationsConsolePage.jsx";
import ProviderApprovalPage from "./pages/portal/ProviderApprovalPage.jsx";
import PortalWorkspacePage from "./pages/portal/PortalWorkspacePage.jsx";
import ProviderAssignmentsPage from "./pages/portal/ProviderAssignmentsPage.jsx";
import ProviderSchedulePage from "./pages/portal/ProviderSchedulePage.jsx";
import ProviderChecklistPage from "./pages/portal/ProviderChecklistPage.jsx";
import ProviderAgreementPage from "./pages/portal/ProviderAgreementPage.jsx";
import ProviderEvidencePage from "./pages/portal/ProviderEvidencePage.jsx";
import ProviderPayoutsPage from "./pages/portal/ProviderPayoutsPage.jsx";
import ProviderProfilePage from "./pages/portal/ProviderProfilePage.jsx";
import ProviderServicesPage from "./pages/portal/ProviderServicesPage.jsx";
import ProviderMessagesPage from "./pages/portal/ProviderMessagesPage.jsx";
import QuoteBuilderPage from "./pages/portal/QuoteBuilderPage.jsx";
import ContractAcquisitionPage from "./pages/portal/ContractAcquisitionPage.jsx";
import ContractingPeriodPage from "./pages/portal/ContractingPeriodPage.jsx";
import PortalAccessPage from "./pages/PortalAccessPage.jsx";
import PortalLoginPage from "./pages/PortalLoginPage.jsx";
import PortalForgotPasswordPage from "./pages/PortalForgotPasswordPage.jsx";
import PortalResetPasswordPage from "./pages/PortalResetPasswordPage.jsx";
import ChangePasswordPage from "./pages/portal/ChangePasswordPage.jsx";
import NotificationSettingsPage from "./pages/portal/NotificationSettingsPage.jsx";
import VendorOnboardingUploadPage from "./pages/VendorOnboardingUploadPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import WeddingsPage from "./pages/WeddingsPage.jsx";

// ServiceCta and several service detail pages build "/book?service=X" links
// expecting RequestServicePage's ?service= param to pre-select that service.
// A plain <Navigate to="/request-service"> drops the query string entirely,
// silently losing the service selection. Preserve it on redirect.
function BookRedirect() {
  const location = useLocation();
  return <Navigate to={`/request-service${location.search}`} replace />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/catalog" element={<CommercialCatalogPage />} />
        <Route path="/services/business" element={<BusinessSolutionsPage />} />
        <Route path="/services/business-solutions" element={<BusinessSolutionsPage />} />
        <Route path="/services/print-studio" element={<PrintStudioPage />} />
        <Route path="/services/events" element={<EventsPage />} />
        <Route path="/services/property" element={<PropertyServicesPage />} />
        <Route path="/property" element={<PropertyServicesPage />} />
        <Route path="/services/concierge" element={<ConciergePage />} />
        <Route path="/services/express-goods" element={<ExpressGoodsPage />} />
        <Route path="/services/facility-visits" element={<FacilityVisitsPage />} />
        <Route path="/services/federal" element={<FederalPage />} />
        <Route path="/resident-concierge" element={<ResidentWelcomePage />} />
        <Route path="/resident-welcome" element={<ResidentWelcomePage />} />
        <Route path="/resident-dispatch" element={<Navigate to="/request-service" replace />} />
        <Route path="/request-service" element={<RequestServicePage />} />
        <Route path="/pay" element={<PayPage />} />

        {/* One platform, three role-based experiences. */}
        <Route path="/portal" element={<PortalWorkspacePage />} />
        <Route path="/portal/customer" element={<Navigate to="/portal" replace />} />
        <Route path="/portal/provider" element={<Navigate to="/portal" replace />} />
        <Route path="/portal/my-portal" element={<Navigate to="/portal" replace />} />
        <Route path="/my-portal" element={<Navigate to="/portal" replace />} />
        <Route path="/provider" element={<Navigate to="/portal/access?role=provider" replace />} />
        <Route path="/provider/login" element={<Navigate to="/portal/login?role=provider" replace />} />
        <Route path="/providers" element={<PortalAccessPage />} />
        <Route path="/portal/access" element={<PortalAccessPage />} />
        <Route path="/portal/providers" element={<PortalAccessPage />} />
        <Route path="/portal/partners" element={<PortalAccessPage />} />
        <Route path="/portal/login" element={<PortalLoginPage />} />
        <Route path="/portal/forgot-password" element={<PortalForgotPasswordPage />} />
        <Route path="/portal/reset-password" element={<PortalResetPasswordPage />} />
        <Route path="/portal/change-password" element={<ChangePasswordPage />} />
        <Route path="/portal/settings" element={<NotificationSettingsPage />} />
        <Route path="/portal/provider-agreement" element={<ProviderAgreementPage />} />
        <Route path="/portal/vendor-onboarding" element={<VendorOnboardingUploadPage />} />
        <Route path="/portal/assignments" element={<ProviderAssignmentsPage />} />
        <Route path="/portal/schedule" element={<ProviderSchedulePage />} />
        <Route path="/portal/checklist" element={<ProviderChecklistPage />} />
        <Route path="/portal/evidence" element={<ProviderEvidencePage />} />
        <Route path="/portal/payouts" element={<ProviderPayoutsPage />} />
        <Route path="/portal/profile" element={<ProviderProfilePage />} />
        <Route path="/portal/services" element={<ProviderServicesPage />} />
        <Route path="/portal/messages" element={<ProviderMessagesPage />} />
        <Route path="/portal/resident-fulfillment" element={<ResidentFulfillmentPage />} />
        <Route path="/portal/operations" element={<OperationsConsolePage />} />
        <Route path="/portal/provider-approval" element={<ProviderApprovalPage />} />
        <Route path="/portal/acquisition" element={<ContractAcquisitionPage />} />
        <Route path="/portal/contracting" element={<ContractingPeriodPage />} />
        <Route path="/portal/quotes" element={<QuoteBuilderPage />} />
        <Route path="/portal/resident" element={<PortalWorkspacePage />} />
        <Route path="/portal/property-manager" element={<PortalWorkspacePage />} />
        <Route path="/portal/procurement" element={<PortalWorkspacePage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/events/weddings" element={<WeddingsPage />} />
        <Route path="/events/festivals" element={<Navigate to="/request-service" replace />} />
        <Route path="/festival" element={<Navigate to="/request-service" replace />} />
        <Route path="/book" element={<BookRedirect />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/travel-quote" element={<Navigate to="/request-service" replace />} />
        <Route path="/real-estate" element={<RealEstatePage />} />
        <Route path="/industries/real-estate" element={<RealEstatePage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/partner-network" element={<PartnerNetwork />} />
        <Route path="/network" element={<NetworkHubPage />} />
        <Route path="/portal/vendors" element={<Navigate to="/portal/vendor-onboarding" replace />} />
        <Route path="/industries/government" element={<FederalPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/field-services" element={<Navigate to="/services/property" replace />} />
        <Route path="/events" element={<Navigate to="/services/events" replace />} />
        <Route path="/signature-services" element={<Navigate to="/services" replace />} />
        <Route path="/govcon" element={<Navigate to="/industries/government" replace />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

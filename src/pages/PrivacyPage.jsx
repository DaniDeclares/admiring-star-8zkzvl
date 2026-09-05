import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPage() {
  return (
    <main style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', padding: '60px 20px' }}>
      <Helmet><title>Privacy Policy | DANI DECLARES LLC</title></Helmet>
      <article style={{ maxWidth: '860px', margin: '0 auto', lineHeight: 1.7 }}>
        <h1 style={{ color: '#8B1E2E' }}>Privacy Policy</h1>
        <p><strong>Effective Date: September 5, 2026</strong></p>
        <p>DANI DECLARES LLC (“DANI DECLARES,” “we,” “us,” or “our”) provides operations, concierge, property, real-estate, business, document, event, logistics, and institutional support services. This Privacy Policy explains how we collect, use, disclose, and protect information submitted through our website, service-request forms, customer portal, provider intake, vendor-onboarding workflows, and related communications.</p>

        <h2>1. Information We Collect</h2>
        <p>Depending on the service or relationship, we may collect contact information, account credentials, organization information, service addresses, property information, appointment details, requested services, documents uploaded for service or vendor onboarding, communications, payment-related transaction information, and completion evidence such as photographs or service records.</p>
        <p>We do not ask customers to submit passwords, bank login credentials, Social Security numbers, or other sensitive information through ordinary service forms unless a specific legally or operationally necessary workflow expressly requires it.</p>

        <h2>2. How We Use Information</h2>
        <ul>
          <li>Provide, schedule, quote, dispatch, document, and close requested services.</li>
          <li>Create and manage customer, resident, provider, partner, and organizational accounts.</li>
          <li>Verify service scope, property relationships, provider qualification, and vendor requirements.</li>
          <li>Process payments, refunds, invoices, and related transaction records through applicable payment providers.</li>
          <li>Communicate about requests, appointments, service changes, account activity, and business operations.</li>
          <li>Protect the security and integrity of our systems and investigate suspected misuse.</li>
          <li>Meet legal, regulatory, tax, contractual, accounting, and recordkeeping obligations.</li>
        </ul>

        <h2>3. Service Providers and Data Sharing</h2>
        <p>We may share information with qualified service providers, contractors, technology vendors, payment processors, communications providers, professional advisers, government or regulatory authorities when required, and other parties necessary to provide the requested service. We do not sell customer information as a business model.</p>
        <p>Provider access is controlled by the DANI DECLARES operating workflow. A person who submits a provider application is not automatically authorized to receive customer work.</p>

        <h2>4. Payments</h2>
        <p>Where online payments are offered, payment-card information is handled through the applicable payment processor and payment environment rather than intentionally stored by DANI DECLARES in ordinary website application records. Customers should review the applicable processor’s privacy and security practices as well.</p>

        <h2>5. Cookies, Analytics, and Technical Data</h2>
        <p>Our website and supporting infrastructure may process technical information such as IP address, browser/device information, pages viewed, referring source, timestamps, and application events for security, diagnostics, performance, analytics, and service improvement. Specific analytics or advertising technologies may change as the website evolves.</p>

        <h2>6. Data Retention</h2>
        <p>We retain information for as long as reasonably necessary for the purpose for which it was collected, including service history, accounting, tax, contractual, compliance, dispute-resolution, security, and legal obligations. Retention periods may differ by record type.</p>

        <h2>7. Security and Breach Response</h2>
        <p>We use reasonable administrative, technical, and organizational safeguards appropriate to the information we handle. No internet system can be guaranteed completely secure. If a legally reportable security incident occurs, DANI DECLARES will follow applicable notification requirements, including applicable Georgia and South Carolina breach-notification laws.</p>

        <h2>8. Your Choices and Requests</h2>
        <p>You may contact us to ask about information associated with your customer or business relationship, request correction of inaccurate information, or ask questions about our privacy practices. Certain records may need to be retained to satisfy legal, contractual, security, accounting, or operational requirements.</p>

        <h2>9. Marketing Communications</h2>
        <p>If we send commercial email, we will provide an appropriate unsubscribe mechanism and honor applicable opt-out requirements. Any SMS or other marketing program will use the consent and disclosure process applicable to that program and will provide the required opt-out mechanism.</p>

        <h2>10. Children</h2>
        <p>Our services and portal are intended for adults and organizations. We do not knowingly solicit personal information from children through the website.</p>

        <h2>11. State and Service-Area Scope</h2>
        <p>DANI DECLARES currently operates and activates services in Georgia and South Carolina, with additional markets activated as the applicable service, location, licensing, qualification, and operational requirements are satisfied. Privacy obligations may vary based on the customer, transaction, data involved, and jurisdiction.</p>

        <h2>12. Contact</h2>
        <p>DANI DECLARES LLC<br />Phone: (470) 485-7173<br />Email: admin@danideclares.com</p>

        <p style={{ marginTop: '40px', fontSize: '0.9rem' }}><em>This Privacy Policy is an operational website notice and is not legal advice. DANI DECLARES will update it as its services, systems, jurisdictions, and applicable legal requirements change.</em></p>
      </article>
    </main>
  );
}

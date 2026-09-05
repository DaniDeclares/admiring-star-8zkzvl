import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TermsPage() {
  return (
    <main style={{ backgroundColor: '#F8F5F1', fontFamily: 'sans-serif', color: '#333', padding: '60px 20px' }}>
      <Helmet><title>Terms of Service | DANI DECLARES LLC</title></Helmet>
      <article style={{ maxWidth: '860px', margin: '0 auto', lineHeight: 1.7 }}>
        <h1 style={{ color: '#8B1E2E' }}>Terms of Service</h1>
        <p><strong>Effective Date: September 5, 2026</strong></p>
        <p>These Terms govern use of the DANI DECLARES website, service-request system, customer portal, provider intake, vendor-onboarding workflows, and related services. By using these systems or accepting a DANI DECLARES proposal, estimate, order, or service confirmation, you agree to the terms applicable to that transaction.</p>

        <h2>1. Services and Scope</h2>
        <p>DANI DECLARES provides administrative, concierge, property, real-estate, business, document, logistics, event, and institutional execution support. A service is not confirmed merely because it appears on the website or a request is submitted. DANI DECLARES may need to review scope, location, availability, licensing, safety, provider capability, materials, travel, or other requirements before accepting work.</p>

        <h2>2. Pricing, Quotes, and Pass-Through Costs</h2>
        <p>Published prices are for the specific offer and customer relationship shown. Some services require a quote or scope confirmation. Taxes, government/statutory fees, materials, disposal, travel, third-party charges, rush charges, and other pass-through costs may be separate when applicable and will be disclosed before confirmation when reasonably determinable.</p>
        <p>A quote or estimate is based on the information available when prepared. Material changes in scope, conditions, access, quantity, location, timing, or customer requirements may require an approved change order or revised quote.</p>

        <h2>3. Requests, Scheduling, and Cancellation</h2>
        <p>Submitting a request does not guarantee a particular appointment time or provider. Work is scheduled after scope and availability are confirmed. Cancellation, rescheduling, rush, no-access, waiting-time, and other applicable charges will be governed by the service-specific terms presented at booking or in the applicable proposal.</p>

        <h2>4. Third-Party Providers and Specialists</h2>
        <p>DANI DECLARES may use qualified workers, contractors, vendors, specialists, and other fulfillment resources. A provider prospect is not authorized to perform DANI DECLARES work until the applicable qualification, compliance, agreement, capability, and assignment requirements are satisfied. Some regulated or credential-sensitive services may be declined, referred, or limited to appropriately qualified providers.</p>

        <h2>5. Customer Responsibilities</h2>
        <p>Customers are responsible for providing accurate information, lawful access to locations, required permissions, safe working conditions, and any customer-controlled documents or instructions necessary for the requested service. Customers must not use DANI DECLARES services for unlawful activity or ask DANI DECLARES to misrepresent facts, credentials, records, or compliance status.</p>

        <h2>6. Documents, Notary, and Legal Boundaries</h2>
        <p>DANI DECLARES is not a law firm and does not provide legal advice. Administrative document preparation, courier, filing, notary, signing, authentication-support, and related services are limited to the authority and scope applicable to the specific service and jurisdiction. Customers remain responsible for the legal substance of their documents and for obtaining legal advice when needed.</p>

        <h2>7. Customer-Provided Information and Property</h2>
        <p>Customers authorize DANI DECLARES and applicable fulfillment personnel to handle information and property reasonably necessary to perform the confirmed service. Customers should not provide credentials, banking passwords, Social Security numbers, or other unnecessary sensitive information through ordinary intake channels.</p>

        <h2>8. Service Evidence and Communications</h2>
        <p>DANI DECLARES may maintain service records, completion notes, photographs, timestamps, messages, approvals, invoices, and other evidence reasonably necessary to operate, verify, bill, support, and audit a service.</p>

        <h2>9. Payments</h2>
        <p>Where payment is required, the applicable payment method, amount, timing, taxes, fees, and refund or cancellation terms will be presented with the transaction or proposal. Payment processing may be provided by a third-party payment processor subject to its own terms and policies.</p>

        <h2>10. Website and Portal Availability</h2>
        <p>We work to keep our website and portal available and secure, but we do not guarantee uninterrupted or error-free operation. Planned maintenance, third-party outages, network failures, security events, and other circumstances may affect availability.</p>

        <h2>11. Prohibited Use</h2>
        <p>You may not interfere with the website or portal, attempt unauthorized access, submit malicious code, impersonate another person or organization, misuse another customer’s property or information, or use DANI DECLARES systems to facilitate unlawful activity.</p>

        <h2>12. Marketing and Communications</h2>
        <p>Commercial email and any future SMS marketing will be handled in accordance with applicable consent, identification, and opt-out requirements. Transactional or service-related communications may continue when reasonably necessary to perform a requested service or manage an account.</p>

        <h2>13. Changes</h2>
        <p>We may update these Terms as the business, website, services, jurisdictions, and applicable requirements change. The version in effect for a particular transaction may be supplemented by the service-specific proposal, order, agreement, or other written terms provided for that transaction.</p>

        <h2>14. Contact</h2>
        <p>DANI DECLARES LLC<br />Phone: (470) 485-7173<br />Email: admin@danideclares.com</p>

        <p style={{ marginTop: '40px', fontSize: '0.9rem' }}><em>These Terms are an operational website terms notice and are not legal advice. Service-specific contracts and legally required disclosures control where they expressly differ from these general website terms.</em></p>
      </article>
    </main>
  );
}

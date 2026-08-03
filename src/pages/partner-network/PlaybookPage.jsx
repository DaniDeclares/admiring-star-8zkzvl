import React from 'react';
import './PlaybookPage.css';

const PlaybookPage = () => {
  const handleTapToReview = () => {
    // Replace with your direct Google Business Review URL
    window.open('https://g.page/r/your-google-review-link/review', '_blank');
  };

  const handleBookConsult = () => {
    // Direct link to your TidyCal or Housecall Pro booking page
    window.location.href = 'mailto:vendors@danideclares.com?subject=Business Growth Consult Request';
  };

  return (
    <div className="playbook-container">
      {/* HERO BANNER - PAGE 01 */}
      <header className="playbook-hero">
        <div className="hero-badge">DANI DECLARES LLC • BUSINESS GROWTH CENTER</div>
        <h1 className="hero-title">BUSINESS GROWTH PLAYBOOK</h1>
        <p className="hero-subtitle">
          BUILD A BUSINESS THAT WORKS EVEN WHEN YOU'RE <strong>BUSY</strong>.
        </p>
        <p className="hero-pills">
          MORE CUSTOMERS • BETTER SYSTEMS • STRONGER BRANDING • SMARTER OPERATIONS
        </p>
        <div className="hero-actions">
          <button className="btn-gold" onClick={handleBookConsult}>
            Book a Support Consult
          </button>
          <button className="btn-outline" onClick={handleTapToReview}>
            Tap To Connect / Leave Review
          </button>
        </div>
      </header>

      {/* SECTION 1: NEED MORE CUSTOMERS? - PAGE 03 */}
      <section className="playbook-section bg-cream">
        <div className="section-header">
          <span className="page-num">PAGE 03</span>
          <h2>NEED MORE CUSTOMERS?</h2>
          <p className="section-tagline">"We turn moments into connections and connections into customers."</p>
        </div>

        <div className="grid-2col">
          <div className="card-problem">
            <h3>THE PROBLEM</h3>
            <p>People visit your booth, website, or business—but leave without taking the next step.</p>
            <h3>HOW WE HELP</h3>
            <p>We create smart customer touchpoints that encourage visitors to:</p>
            <ul>
              <li>✔ Leave a Google 5-Star Review</li>
              <li>✔ Book an appointment instantly</li>
              <li>✔ Save your contact card (vCard)</li>
              <li>✔ Join your email & SMS list</li>
              <li>✔ Follow your social media channels</li>
            </ul>
          </div>

          <div className="card-solutions">
            <h3>FEATURED SMART SOLUTIONS</h3>
            <div className="solution-item">
              <strong>SmartTap™ NFC Cards</strong>
              <p>Tap to share contact info, website, and social profiles instantly.</p>
            </div>
            <div className="solution-item">
              <strong>Smart Review Stands</strong>
              <p>Countertop acrylic displays that make it easy for happy clients to leave a 5-star Google review on the spot.</p>
            </div>
            <div className="solution-item">
              <strong>QR & Booking Stations</strong>
              <p>Direct customers to book, view service menus, or pay with one scan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: NEED BETTER BRANDING? - PAGE 04 */}
      <section className="playbook-section bg-burgundy text-light">
        <div className="section-header">
          <span className="page-num gold">PAGE 04</span>
          <h2>NEED BETTER BRANDING?</h2>
          <p className="section-tagline">"Strong brand. Stronger business. Better results."</p>
        </div>

        <div className="grid-2col">
          <div className="card-problem dark">
            <h3>THE PROBLEM</h3>
            <p>Inconsistent materials can make even great businesses look unpolished.</p>
            <h3>EXPECTED OUTCOME</h3>
            <p>Customers recognize your brand. Trust increases. Your business stands out before you even speak.</p>
            <div className="stat-box">
              <strong>DID YOU KNOW?</strong>
              <p>Consistent branding can increase revenue by up to 23% and build long-term customer loyalty.</p>
            </div>
          </div>

          <div className="card-solutions dark">
            <h3>BRAND ASSETS & CUSTOM PRODUCTION</h3>
            <ul>
              <li><strong>Brand Identity Assets:</strong> Logos, color palettes, fonts, and style guidelines.</li>
              <li><strong>Custom Apparel & Uniforms:</strong> Heat-pressed T-shirts, fleece hoodies, and caps.</li>
              <li><strong>Branded Displays & Swag:</strong> Sublimated ceramic mugs, canvas tote bags, and event table covers.</li>
              <li><strong>Marketing Print Materials:</strong> Full-color service flyers, menus, rack cards, and leave-behinds.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3: NEED BETTER OPERATIONS? - PAGES 05 & 06 */}
      <section className="playbook-section bg-cream">
        <div className="section-header">
          <span className="page-num">PAGES 05 & 06</span>
          <h2>NEED BETTER OPERATIONS & SYSTEMS?</h2>
          <p className="section-tagline">"Service • Systems • Execution • Support — We come to you and handle everything."</p>
        </div>

        <div className="grid-3col">
          <div className="feature-card">
            <h4>Property Reset Operations</h4>
            <p>Turn-key move-in/move-out resets, deep cleaning, appliance detailing, and HD before/after photo condition reports.</p>
          </div>
          <div className="feature-card">
            <h4>SOP Manuals & Vendor Packets</h4>
            <p>Step-by-step Standard Operating Procedures, compliance forms, W-9, and COI insurance binders.</p>
          </div>
          <div className="feature-card">
            <h4>Automated Booking & Scheduling</h4>
            <p>Online booking integration (Housecall Pro, TidyCal) with automated SMS/email reminders to eliminate no-shows.</p>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <footer className="playbook-footer">
        <h3>READY TO BUILD SYSTEMS THAT WORK FOR YOU?</h3>
        <p>Let's create the structure that helps your business grow and thrive.</p>
        <div className="footer-contact">
          <p>📞 <strong>Direct Handler:</strong> (470) 682-9348</p>
          <p>📧 <strong>Email:</strong> vendors@danideclares.com</p>
          <p>🌐 <strong>Website:</strong> danideclares.com</p>
        </div>
      </footer>
    </div>
  );
};

export default PlaybookPage;

import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./EventsPage.css";

export default function EventsPage() {
  return (
    <>
      <Helmet>
        <title>Event Planning & Execution — Dani Declares LLC</title>
        <meta name="description" content="Full-service event planning, wedding planning, officiating, balloon arches, custom decor, and day-of execution across Metro Atlanta and South Carolina." />
      </Helmet>
      <div className="ep-page">

        <header className="ep-header">
          <div className="ep-container">
            <h1>Event Planning & Execution</h1>
            <p>We don't just decorate. We plan, coordinate, and execute your entire event from start to finish.</p>
            <div className="ep-header-ctas">
              <a href="tel:4706829348" className="ep-btn-primary">Call / Text (470) 682-9348</a>
              <Link to="/contact" className="ep-btn-secondary">Request a Consultation</Link>
            </div>
          </div>
        </header>

        <section className="ep-section ep-types">
          <div className="ep-container">
            <h2>Events We Handle</h2>
            <ul className="ep-two-col">
              <li>Weddings (full planning)</li>
              <li>Wedding officiating</li>
              <li>Birthday parties</li>
              <li>Baby & bridal showers</li>
              <li>Children's parties</li>
              <li>Graduation celebrations</li>
              <li>Corporate & business events</li>
              <li>Community & church events</li>
              <li>Vow renewals</li>
              <li>Private dinners & celebrations</li>
              <li>Pop-up events</li>
              <li>Large-scale productions</li>
            </ul>
          </div>
        </section>

        <section className="ep-section ep-alt ep-services">
          <div className="ep-container">
            <h2>What We Offer</h2>
            <div className="ep-grid">
              <div className="ep-card">
                <h3>Full Wedding Planning</h3>
                <p>Complete wedding planning from concept to execution. Venue guidance, vendor sourcing, timeline creation, design direction, and full day-of management.</p>
              </div>
              <div className="ep-card">
                <h3>Wedding Officiating</h3>
                <p>Professional, personalized ceremony officiating. We work with you to create a ceremony that reflects your story and your style.</p>
              </div>
              <div className="ep-card">
                <h3>Event Planning & Coordination</h3>
                <p>Full planning support for parties, showers, corporate events, and celebrations. Budget planning, vendor coordination, and timeline management.</p>
              </div>
              <div className="ep-card">
                <h3>Day-Of Coordination</h3>
                <p>Already planned your event? We manage the day so you don't have to. Vendor point of contact, setup oversight, timeline execution, and problem-solving.</p>
              </div>
              <div className="ep-card">
                <h3>Balloon Arches & Custom Decor</h3>
                <p>Custom balloon installations, arches, backdrops, and themed decor. We design and install pieces that make your event stand out.</p>
              </div>
              <div className="ep-card">
                <h3>Setup & Breakdown</h3>
                <p>Full setup and breakdown service. We arrive early, execute the floor plan, manage vendor arrivals, and handle cleanup coordination.</p>
              </div>
              <div className="ep-card">
                <h3>Custom Event Production</h3>
                <p>Custom labels, stickers, favor tags, signage, seating charts, welcome signs, table numbers, and branded event details produced in-house.</p>
              </div>
              <div className="ep-card">
                <h3>Vendor Coordination</h3>
                <p>We source, communicate with, and coordinate all vendors so you have one point of contact from start to finish.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="ep-section ep-process">
          <div className="ep-container">
            <h2>Our Process</h2>
            <ol className="ep-steps">
              <li><span className="ep-num">1</span><div><strong>Discovery & Vision</strong> — We learn your event type, guest count, budget, theme, and goals.</div></li>
              <li><span className="ep-num">2</span><div><strong>Scope & Strategy</strong> — We separate planning, execution, and production so your budget is realistic.</div></li>
              <li><span className="ep-num">3</span><div><strong>Design & Experience</strong> — We build the look, feel, and flow of your event.</div></li>
              <li><span className="ep-num">4</span><div><strong>Vendor & Production</strong> — We coordinate what gets rented, purchased, or produced in-house.</div></li>
              <li><span className="ep-num">5</span><div><strong>Execution Plan</strong> — Timeline, setup plan, vendor schedule, and day-of flow created.</div></li>
              <li><span className="ep-num">6</span><div><strong>Event Day</strong> — We run the day. You enjoy it.</div></li>
            </ol>
          </div>
        </section>

        <section className="ep-section ep-alt ep-pricing">
          <div className="ep-container">
            <h2>Investment</h2>
            <p className="ep-pricing-sub">Every event is custom quoted based on type, guest count, location, planning needs, design complexity, and production requirements.</p>
            <div className="ep-pkg-grid">
              <div className="ep-pkg-card">
                <h3>Day-Of Coordination</h3>
                <p>For clients who have planned their event and need professional support to execute it.</p>
                <p className="ep-price">Starting at $650</p>
              </div>
              <div className="ep-pkg-card">
                <h3>Planning + Coordination</h3>
                <p>Planning support plus full day-of coordination and execution.</p>
                <p className="ep-price">Starting at $1,200</p>
              </div>
              <div className="ep-pkg-card featured">
                <h3>Full-Service Planning</h3>
                <p>Complete event management from concept through execution and breakdown.</p>
                <p className="ep-price">Starting at $2,500</p>
              </div>
              <div className="ep-pkg-card">
                <h3>Custom Production</h3>
                <p>Balloon arches, custom decor, printed items, favors, and branded event details.</p>
                <p className="ep-price">Custom Quote</p>
              </div>
            </div>
          </div>
        </section>

        <section className="ep-section ep-bundle">
          <div className="ep-container">
            <h2>Bundle Your Event</h2>
            <p className="ep-bundle-sub">Combine event services with other Dani Declares services for a complete experience.</p>
            <div className="ep-bundle-grid">
              <div className="ep-bundle-card">
                <h3>Wedding Bundle</h3>
                <p>Full wedding planning + officiating + balloon arches + custom decor + printed programs, menus & place cards + setup & breakdown</p>
              </div>
              <div className="ep-bundle-card">
                <h3>Party Bundle</h3>
                <p>Event planning + balloon arches + custom labels & favors + setup & breakdown + custom printed items</p>
              </div>
              <div className="ep-bundle-card">
                <h3>Corporate Event Bundle</h3>
                <p>Event coordination + setup & breakdown + branded signage & printed materials + vendor coordination</p>
              </div>
            </div>
            <Link to="/contact" className="ep-btn-primary">Request a Bundle Quote</Link>
          </div>
        </section>

        <section className="ep-section ep-gallery">
          <div className="ep-container">
            <h2>Our Work</h2>
            <div className="ep-photo-grid">
              <img src="/weddings/FloralWedding_Couple_GoldChairs.jpg" alt="Wedding ceremony setup" loading="lazy" />
              <img src="/weddings/LakefrontWedding_CeremonySetup.jpg" alt="Lakefront wedding ceremony" loading="lazy" />
              <img src="/weddings/MansionWedding_Kiss_Umbrella.jpg" alt="Wedding couple" loading="lazy" />
              <img src="/weddings/barn-ceiling-drapery.jpg" alt="Event venue decor" loading="lazy" />
              <img src="/weddings/BridalBouquet_White_Greenery.jpg" alt="Bridal bouquet" loading="lazy" />
              <img src="/weddings/ReceptionTable_Candles_Florals.jpg" alt="Reception table setup" loading="lazy" />
            </div>
          </div>
        </section>

        <section className="ep-section ep-cta">
          <div className="ep-container">
            <h2>Ready to Plan Your Event?</h2>
            <p>Every event starts with a consultation. Tell us what you need and we will build the right plan.</p>
            <div className="ep-header-ctas">
              <a href="tel:4706829348" className="ep-btn-primary">Call / Text GA: (470) 682-9348</a>
              <a href="tel:8643265362" className="ep-btn-primary">Call / Text SC: (864) 326-5362</a>
              <Link to="/contact" className="ep-btn-secondary">Request a Consultation</Link>
              <a href="mailto:events@danideclares.com" className="ep-btn-secondary">Email Events Team</a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
import React from "react";
import { Helmet } from "react-helmet-async";
import "./FestivalPage.css";

import FacePaintMamaDaughter from "../assets/festival-images/istockphoto-147288826-612x612.webp";
import TugOfWar from "../assets/festival-images/istockphoto-1048325338-612x612.webp";
import FamilyFunCarnival from "../assets/festival-images/istockphoto-1266364936-612x612.jpg";
import SmilingFamily from "../assets/festival-images/istockphoto-1495159969-612x612.webp";
import ParkFamily from "../assets/festival-images/istockphoto-2164186356-612x612.webp";
import KidEntrepreneur1 from "../assets/festival-images/kid entrepenuer 1.jpg";
import KidEntrepreneur2 from "../assets/festival-images/kid entrepenuer 2.jpg";
import KidEntrepreneur4 from "../assets/festival-images/kid entrepenuer 4.jpg";
import LemonadeStand from "../assets/festival-images/kid entreprenuer 7.jpg";
import KidPhotographer from "../assets/festival-images/pexels-photo-7551751.jpeg";
import Teamwork from "../assets/festival-images/pexels-kampus-7669176.jpg";

export default function FestivalPage() {
  return (
    <>
      <Helmet>
        <title>Declare Your Worth Festival • Nov 29–30, 2025 | Brook Run Park</title>
        <meta name="description" content="Financial literacy, entrepreneurship, family fun, and local vendors—join us Nov 29–30, 2025 at Brook Run Park, Doraville, GA. Free admission for kids!" />
      </Helmet>

      <main className="festival-page">
        <section className="festival-hero" style={{ backgroundImage: `url(${FamilyFunCarnival})` }}>
          <div className="festival-hero-overlay">
            <h1>Declare Your Worth Festival</h1>
            <p>November 29–30, 2025 • Brook Run Park, Doraville, GA</p>
          </div>
        </section>

        <section className="festival-overview event-overview">
          <h2>About the Festival</h2>
          <p>Welcome to the inaugural <strong>Declare Your Worth Festival</strong>—a community celebration of financial literacy, small business, and family fun. Admission is <strong>FREE for kids</strong>!</p>
          <div className="festival-images-grid">
            <img src={FacePaintMamaDaughter} alt="Mom and daughter with face paint" />
            <img src={SmilingFamily} alt="Family at a carnival" />
            <img src={ParkFamily} alt="Family walking through booths" />
          </div>
        </section>

        <section className="festival-schedule">
          <h2>What to Expect</h2>

          <div className="schedule-card">
            <h3>Kid Zone Highlights</h3>
            <ul>
              <li>Paper-Mâché Piggy Bank Workshop</li>
              <li>Kid Entrepreneur Marketplace</li>
              <li>Lemonade Stand Challenge</li>
              <li>Kid Photographer Booth</li>
              <li>Money Match Memory Game</li>
            </ul>
            <div className="festival-images-grid kid-images-grid">
              <img src={KidEntrepreneur1} alt="Kid entrepreneur" />
              <img src={KidEntrepreneur2} alt="Young designer" />
              <img src={KidEntrepreneur4} alt="Clothing designer" />
              <img src={LemonadeStand} alt="Lemonade stand" />
              <img src={KidPhotographer} alt="Kid photographer" />
            </div>
          </div>

          <div className="schedule-card">
            <h3>Workshops & Demos</h3>
            <ul>
              <li>Budget Board Art Corner</li>
              <li>Market to Money Cooking Demo</li>
              <li>Transportation Budgeting with Lyft</li>
              <li>Chill & Budget Yoga + Wellness</li>
            </ul>
            <div className="festival-images-grid workshop-images-grid">
              <img src={TugOfWar} alt="Tug of war" />
              <img src={Teamwork} alt="Teamwork activity" />
            </div>
          </div>

          <div className="schedule-card">
            <h3>Live Entertainment & Raffles</h3>
            <ul>
              <li>MadCap Puppets “Money Matters” Show</li>
              <li>Raffle Wall (Lyft credits, Maker Kits, VIP prizes)</li>
              <li>Storytime & Sticker Rewards</li>
            </ul>
          </div>
        </section>

        <section className="festival-vendors">
          <h2>Vendor, Speaker & Sponsor Packages</h2>
          <div className="vendor-grid">
            <div className="vendor-card">
              <h3>General Admission</h3>
              <p>$20 per adult</p>
              <a href="https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02" target="_blank" rel="noopener noreferrer" className="btn">Buy Now</a>
            </div>

            <div className="vendor-card">
              <h3>VIP Admission</h3>
              <p>$65 per person</p>
              <a href="https://buy.stripe.com/6oU14m45H8CW1Hx9176kg03" target="_blank" rel="noopener noreferrer" className="btn">Buy Now</a>
            </div>

            <div className="vendor-card">
              <h3>Standard Vendor Booth</h3>
              <p>$150</p>
              <a href="https://buy.stripe.com/4gwg2vf0H2eC6dqfZc" target="_blank" rel="noopener noreferrer" className="btn">Reserve</a>
            </div>

            <div className="vendor-card">
              <h3>Premium Vendor Booth</h3>
              <p>$250 (High Traffic Zone)</p>
              <a href="https://buy.stripe.com/6oU28mbGh68C8dq7sZ" target="_blank" rel="noopener noreferrer" className="btn">Reserve</a>
            </div>

            <div className="vendor-card">
              <h3>Speaker Slot</h3>
              <p>$75</p>
              <a href="https://buy.stripe.com/7sI7v23qv2eC7qM3cB" target="_blank" rel="noopener noreferrer" className="btn">Apply</a>
            </div>

            <div className="vendor-card">
              <h3>Bronze Event Sponsor</h3>
              <p>$250 or $50/month</p>
              <a href="https://buy.stripe.com/3cs7v23qv2eC7qM3cB" target="_blank" rel="noopener noreferrer" className="btn">Become a Sponsor</a>
            </div>
          </div>
        </section>

        <section className="festival-faq">
          <h2>FAQs</h2>
          <div className="faq-item">
            <h3>Where is the festival?</h3>
            <p>Brook Run Park, 4770 N Peachtree Rd, Dunwoody, GA 30338</p>
          </div>
          <div className="faq-item">
            <h3>What happens after I buy?</h3>
            <p>You’ll receive an email with your ticket confirmation, plus vendor/speaker setup details if applicable.</p>
          </div>
          <div className="faq-item">
            <h3>Can kids attend free?</h3>
            <p>Yes! Children 12 and under enter free with a paid adult.</p>
          </div>
        </section>

        <section className="festival-cta">
          <h2>Claim Your Spot</h2>
          <div className="festival-cta-buttons">
            <a href="https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02" className="btn burgundy">Buy General Admission</a>
            <a href="https://buy.stripe.com/6oU14m45H8CW1Hx9176kg03" className="btn burgundy">Buy VIP Ticket</a>
            <a href="/contact" className="btn">Contact Us</a>
          </div>
          <p className="cta-note">Vendor, speaker, and sponsor spots are limited. Book yours now!</p>
        </section>
      </main>
    </>
  );
}

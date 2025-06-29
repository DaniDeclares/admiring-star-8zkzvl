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
        <meta name="description" content="Join the Declare Your Worth Festival! 2 days of financial literacy, fun, and entrepreneurship. Vendors, speakers, workshops, kid zone & more!" />
      </Helmet>

      <main className="festival-page">
        {/* Hero */}
        <section className="festival-hero" style={{ backgroundImage: `url(${FamilyFunCarnival})` }}>
          <div className="festival-hero-overlay">
            <h1>Declare Your Worth Festival</h1>
            <p>November 29–30, 2025 • Brook Run Park, Doraville, GA</p>
          </div>
        </section>

        {/* Why This Festival Matters */}
        <section className="festival-purpose-section">
          <h2>Why This Festival Matters</h2>
          <p>
            Growing up, I didn’t have access to financial literacy workshops, entrepreneurship mentors, or community events that taught money management in a fun, real-life way. 
            That’s why I created the Declare Your Worth Festival: to help families, creatives, and small businesses gain tools and confidence they didn’t get in school.
          </p>
          <p>
            Whether you're a parent, an aspiring entrepreneur, a notary, or just someone looking to take control of your finances—this event is for YOU.
          </p>
          <a href="/festival" className="btn burgundy">See Full Festival Schedule</a>
        </section>

        {/* About the Festival */}
        <section className="festival-overview event-overview">
          <h2>Festival Highlights</h2>
          <p>2 days of workshops, vendors, speakers, food, live music, kids activities, and interactive budgeting experiences.</p>
          <div className="festival-images-grid">
            <img src={FacePaintMamaDaughter} alt="Face paint" />
            <img src={SmilingFamily} alt="Family" />
            <img src={ParkFamily} alt="Walking through booths" />
          </div>
        </section>

        {/* Kid Zone */}
        <section className="schedule-card">
          <h3>Kid Zone Highlights (Free for Kids!)</h3>
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
        </section>

        {/* Workshops & Entertainment */}
        <section className="schedule-card">
          <h3>Workshops, Demos & Live Entertainment</h3>
          <ul>
            <li>Budget Board Art Corner</li>
            <li>Market to Money Cooking Demo</li>
            <li>Transportation Budgeting (with Lyft)</li>
            <li>Chill & Budget Yoga + Wellness</li>
            <li>MadCap Puppets “Money Matters” Show</li>
            <li>Raffle Wall with Gift Cards, Swag, & a Free Wedding Giveaway</li>
          </ul>
          <div className="festival-images-grid workshop-images-grid">
            <img src={TugOfWar} alt="Tug of war" />
            <img src={Teamwork} alt="Team activity" />
          </div>
        </section>

        {/* Ticket Tiers */}
        <section className="vendor-grid">
          <div className="vendor-card">
            <h3>General Admission</h3>
            <p>$20 per adult</p>
            <a href="https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02" target="_blank" rel="noopener noreferrer" className="btn">Buy Now</a>
          </div>
          <div className="vendor-card">
            <h3>VIP Admission</h3>
            <p>$65 per person</p>
            <a href="https://buy.stripe.com/6oU14m45H8CW1Hx9176kg03" target="_blank" rel="noopener noreferrer" className="btn">Buy VIP</a>
          </div>
        </section>

        {/* Vendor Booths */}
        <section className="vendor-grid">
          <div className="vendor-card">
            <h3>Standard Vendor Table</h3>
            <p>$150</p>
            <a href="https://buy.stripe.com/4gMaEWdGh6uO2LBgtz6kg07" target="_blank" rel="noopener noreferrer" className="btn">Reserve</a>
          </div>
          <div className="vendor-card">
            <h3>Premium Vendor Booth (High Traffic)</h3>
            <p>$250</p>
            <a href="https://buy.stripe.com/3cI5kC6dP1auae3a5b6kg06" target="_blank" rel="noopener noreferrer" className="btn">Reserve</a>
          </div>
          <div className="vendor-card">
            <h3>Double-Sized Vendor Booth</h3>
            <p>$300</p>
            <a href="https://buy.stripe.com/3cI14mdGh6uO5XN1yF6kg05" target="_blank" rel="noopener noreferrer" className="btn">Reserve</a>
          </div>
          <div className="vendor-card">
            <h3>Virtual Vendor Booth</h3>
            <p>$75</p>
            <a href="https://buy.stripe.com/fZu8wOgStf1kgCr5OV6kg0j" target="_blank" rel="noopener noreferrer" className="btn">Apply</a>
          </div>
        </section>

        {/* Speaker Slots */}
        <section className="vendor-grid">
          <div className="vendor-card">
            <h3>Speaker Slot</h3>
            <p>$75</p>
            <a href="https://buy.stripe.com/bJe6oG31D6uO85V4KR6kg0l" target="_blank" rel="noopener noreferrer" className="btn">Apply to Speak</a>
          </div>
          <div className="vendor-card">
            <h3>Premium Speaker Slot</h3>
            <p>$250</p>
            <a href="https://buy.stripe.com/eVqaEW31D5qKfynelr6kg04" target="_blank" rel="noopener noreferrer" className="btn">Apply Premium</a>
          </div>
        </section>

        {/* Sponsorship Packages */}
        <section className="vendor-grid">
          <div className="vendor-card">
            <h3>Bronze Sponsor</h3>
            <p>$250 or $50/month</p>
            <a href="https://buy.stripe.com/14A8wO45H2eygCrcdj6kg0c" target="_blank" rel="noopener noreferrer" className="btn">Become Bronze Sponsor</a>
          </div>
          <div className="vendor-card">
            <h3>Gold Sponsor</h3>
            <p>$500 or $100/month</p>
            <a href="https://buy.stripe.com/28E9AS6dP9H04TJ6SZ6kg0a" target="_blank" rel="noopener noreferrer" className="btn">Become Gold Sponsor</a>
          </div>
          <div className="vendor-card">
            <h3>Platinum Sponsor</h3>
            <p>$1,000 or $250/month</p>
            <a href="https://buy.stripe.com/14A5kCfOp3iC85V9176kg08" target="_blank" rel="noopener noreferrer" className="btn">Become Platinum Sponsor</a>
          </div>
        </section>

        {/* Final Call-to-Action */}
        <section className="festival-cta">
          <h2>Ready to Join the Movement?</h2>
          <a href="https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02" className="btn burgundy">Buy General Admission</a>
          <a href="/contact" className="btn">Have a Question?</a>
          <p className="cta-note">Vendor, speaker, and sponsor spots WILL sell out—secure yours today!</p>
        </section>
      </main>
    </>
  );
}

import React from "react";
import { Helmet } from "react-helmet-async";
import "./FestivalPage.css";

// Festival images (Update paths as needed; only import images you use!)
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
        <title>Declare Your Worth Festival • Brook Run Park, Nov 29–30, 2025</title>
        <meta
          name="description"
          content="Join us November 29–30, 2025 at Brook Run Park for a weekend of financial literacy, family fun, local vendors, and community empowerment. Free for kids!"
        />
      </Helmet>

      <main className="festival-page">
        {/* HERO SECTION */}
        <section
          className="festival-hero"
          style={{ backgroundImage: `url(${FamilyFunCarnival})` }}
        >
          <div className="festival-hero-overlay">
            <h1>Declare Your Worth Festival</h1>
            <p>November 29–30, 2025 • Brook Run Park, Doraville, GA</p>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="festival-overview event-overview">
          <h2>About the Festival</h2>
          <p>
            Welcome to the inaugural <strong>Declare Your Worth Festival</strong>—a
            community celebration focusing on financial literacy, entrepreneurship, and family fun.
            Happening right after Thanksgiving and before Christmas, our goal is to help families
            and creatives “declare their worth” and set themselves up for a financially strong
            new year. Bring the whole crew: admission is <strong>FREE for kids</strong>!
          </p>
          <div className="festival-images-grid">
            <img src={FacePaintMamaDaughter} alt="Mom and daughter with face paint" />
            <img src={SmilingFamily} alt="Family at a carnival" />
            <img src={ParkFamily} alt="Family walking through festival booths" />
          </div>
        </section>

        {/* SCHEDULE HIGHLIGHTS */}
        <section className="festival-schedule">
          <h2>What to Expect</h2>
          <p>
            Two days packed with workshops, live entertainment, local vendors, and hands-on Kid Zone activities—making money matters fun for all ages:
          </p>

          {/* Kid Zone */}
          <div className="schedule-card">
            <h3>Kid Zone Activities (Free for Kids)</h3>
            <ul>
              <li><strong>Paper-Mâché Piggy Bank Workshop:</strong> Kids create their own piggy bank and learn the basics of saving.</li>
              <li><strong>Money Match Memory Game:</strong> Matching game teaching needs vs. wants, saving vs. spending.</li>
              <li><strong>“Tiny Entrepreneur” Booths:</strong> Kids (ages 6–12) craft simple products and “sell” them with play money.</li>
              <li><strong>Kid Entrepreneur Marketplace:</strong> Partnered with Biz Kids Academy & Acton Children’s Business Fair for real kid-run businesses.</li>
              <li><strong>Lemonade Stand Challenge:</strong> Teams compete to create the most profitable stand—learning pricing and customer service.</li>
              <li><strong>Kid Photographer Booth:</strong> Local teens capture festival portraits and learn creative commerce.</li>
            </ul>
            <div className="festival-images-grid kid-images-grid">
              <img src={KidEntrepreneur1} alt="Kid entrepreneur at table" />
              <img src={KidEntrepreneur2} alt="Young designer" />
              <img src={KidEntrepreneur4} alt="Girl designing clothes" />
              <img src={LemonadeStand} alt="Kid running lemonade stand" />
              <img src={KidPhotographer} alt="Kid holding a camera" />
            </div>
          </div>

          {/* Workshops */}
          <div className="schedule-card">
            <h3>Workshops & Demos</h3>
            <ul>
              <li><strong>“Market to Money” Cooking Demo:</strong> Plan a week’s groceries under $20 with Atlanta Farmers Market pros.</li>
              <li><strong>DIY Budget Board Art Corner:</strong> Kids/teens design vision boards tracking savings goals with MAKESHOP kits.</li>
              <li><strong>Paper-Mâché Piggy Bank (Adults):</strong> Craft a piggy bank stand from upcycled materials, discussing cost vs. value.</li>
              <li><strong>Chill & Budget Yoga + Financial Wellness:</strong> Meditation/yoga flow plus “Budgeting Basics” for grownups.</li>
              <li><strong>Budgeting for Transportation (Lyft):</strong> Lyft reps teach you to compare ride-share, transit, or car costs—get discount codes!</li>
              <li><strong>Upcycle & Sell Booth:</strong> Make marketable crafts with Maker’s Mark ATL artists. Kids price items and “reinvest” earnings.</li>
            </ul>
            <div className="festival-images-grid workshop-images-grid">
              <img src={TugOfWar} alt="Tug of war with families" />
              <img src={Teamwork} alt="Team doing a collaborative activity" />
            </div>
          </div>

          {/* Entertainment */}
          <div className="schedule-card">
            <h3>Live Entertainment & Raffles</h3>
            <ul>
              <li><strong>MadCap Puppets “Money Matters” Show:</strong> Custom puppet show teaching saving and budgeting, twice daily in the Kid Zone.</li>
              <li><strong>Storytime & Sticker Rewards:</strong> Coloring pages and stickers for participating kids.</li>
              <li><strong>Raffle Wall:</strong> Win Lyft credits, Maker’s Mark ATL kits, yoga passes, and a full wedding package giveaway (officiant, photographer, florals, merch bundle).</li>
            </ul>
            <div className="entertainment-image">
              <img src={FamilyFunCarnival} alt="Families enjoying carnival games" />
            </div>
          </div>
        </section>

        {/* VENDORS & SPONSORS */}
        <section className="festival-vendors">
          <h2>Vendor & Sponsorship Opportunities</h2>
          <p>
            Showcase your brand in front of 1,500+ families and entrepreneurs! Select your option below:
          </p>
          <div className="vendor-grid">
            {/* Attendee Tickets */}
            <div className="vendor-card">
              <h3>Attendee Tickets</h3>
              <ul>
                <li>
                  <strong>General Admission:</strong> $20 &mdash;{" "}
                  <a href="https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02" target="_blank" rel="noopener noreferrer">Buy Here</a>
                </li>
                <li>
                  <strong>VIP Admission:</strong> $65 &mdash;{" "}
                  <a href="https://buy.stripe.com/6oU14m45H8CW1Hx9176kg03" target="_blank" rel="noopener noreferrer">Buy Here</a>
                </li>
              </ul>
            </div>
            {/* Speaker, Vendor, Sponsorships: Copy your previous code for these sections, as shown above! */}
            {/* ... */}
          </div>
        </section>

        {/* FAQ & CTA */}
        <section className="festival-faq">
          <h2>FAQs & Logistics</h2>
          <div className="faq-item">
            <h3>Where is the festival located?</h3>
            <p>
              <strong>Brook Run Park</strong> • 4770 N Peachtree Rd, Dunwoody, GA 30338 — just on the Doraville border. Look for “Declare Your Worth” banners.
            </p>
          </div>
          {/* Other FAQs... */}
        </section>

        {/* Final CTA */}
        <section className="festival-cta">
          <h2>Ready to Declare Your Worth?</h2>
          <div className="festival-cta-buttons">
            <a href="https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02" className="btn burgundy">
              Buy General Admission ($20)
            </a>
            <a href="https://buy.stripe.com/6oU14m45H8CW1Hx9176kg03" className="btn burgundy">
              Buy VIP Admission ($65)
            </a>
            <a href="/contact" className="btn">
              Contact Us
            </a>
          </div>
          <p className="cta-note">
            Vendor, speaker, and sponsorship spots are limited—book yours today!
          </p>
        </section>
      </main>
    </>
  );
}

import React from "react";
import { Helmet } from "react-helmet-async";
import "./FestivalPage.css";

// Import festival images (place these files in src/assets/festival/)
import FacePaintMamaDaughter from "../assets/festival/istockphoto-147288826-612x612.webp";
import TugOfWar from "../assets/festival/istockphoto-1048325338-612x612.webp";
import FamilyFunCarnival from "../assets/festival/istockphoto-1266364936-612x612.jpg";
import SmilingFamily from "../assets/festival/istockphoto-1495159969-612x612.webp";
import ParkFamily from "../assets/festival/istockphoto-2164186356-612x612.webp";
import KidEntrepreneur1 from "../assets/festival/kid entrepenuer 1.jpg";
import KidEntrepreneur2 from "../assets/festival/kid entrepenuer 2.jpg";
import KidEntrepreneur4 from "../assets/festival/kid entrepenuer 4.jpg";
import LemonadeStand from "../assets/festival/kid entreprenuer 7.jpg";
import KidPhotographer from "../assets/festival/pexels-photo-7551751.jpeg";
import Teamwork from "../assets/festival/pexels-photo-7590860.jpeg"; // renamed example

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
          style={{
            backgroundImage: `url(${FamilyFunCarnival})`,
          }}
        >
          <div className="festival-hero-overlay">
            <h1>Declare Your Worth Festival</h1>
            <p>
              November 29–30, 2025 • Brook Run Park, Doraville, GA
            </p>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="festival-overview">
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
            This two-day festival is packed with interactive workshops, live entertainment, local
            vendors, and hands-on Kid Zone activities—designed to make money matters fun for all
            ages. Below are the featured activations:
          </p>

          <div className="schedule-card">
            <h3>Kid Zone Activities (Free for Kids)</h3>
            <ul>
              <li>
                <strong>Paper-Mâché Piggy Bank Workshop:</strong> Kids create their own
                personalized piggy bank while learning the basics of saving. Supplies provided!
              </li>
              <li>
                <strong>Money Match Memory Game:</strong> A fun matching game teaching needs vs.
                wants, saving vs. spending.
              </li>
              <li>
                <strong>“Tiny Entrepreneur” Booths:</strong> Children (ages 6–12) can craft simple
                products (friendship bracelets, keychains, homemade crafts) and “sell” them with
                play money, learning supply cost vs. profit.
              </li>
              <li>
                <strong>Kid Entrepreneur Marketplace:</strong> Partnered with I’RAISE, Biz Kids
                Academy, and Acton Children’s Business Fair to showcase real kid-run businesses.
              </li>
              <li>
                <strong>Lemonade Stand Challenge:</strong> Teams of kiddos compete to create the
                most profitable stand (learning pricing, customer service, and budgeting).
              </li>
              <li>
                <strong>Kid Photographer Booth:</strong> Local teen photographers from Creative
                Loafing clubs capture portraits for a low fee—teaches asset value and creative
                commerce.
              </li>
            </ul>
            <div className="kid-images-grid">
              <img src={KidEntrepreneur1} alt="Kid entrepreneur at table" />
              <img src={KidEntrepreneur2} alt="Young designer with sewing supplies" />
              <img src={KidEntrepreneur4} alt="Girl designing clothes" />
              <img src={LemonadeStand} alt="Kid running a lemonade stand" />
              <img src={KidPhotographer} alt="Kid holding a camera" />
            </div>
          </div>

          <div className="schedule-card">
            <h3>Workshops & Demos</h3>
            <ul>
              <li>
                <strong>“Market to Money” Cooking Demo (Atlanta Farmers Market):</strong> Learn how
                to plan a week’s groceries under \$20, shop for budget-friendly produce, and make a
                healthy snack. Includes “Grocery Budget Planner” handouts.
              </li>
              <li>
                <strong>DIY Budget Board Art Corner (Tech Alpharetta & MAKESHOP):</strong> Kids and
                teens design vision boards tracking savings goals. Digital vision board stations &
                maker kits provided.
              </li>
              <li>
                <strong>Paper-Mâché Piggy Bank for Adults (MAKESHOP Assistance):</strong> Learn how
                to craft a decorative piggy bank stand from upcycled materials while discussing the
                cost vs. value of creative projects.
              </li>
              <li>
                <strong>Adult “Chill & Budget” Yoga + Financial Wellness (Satsang Yoga & Flow Yoga
                Center):</strong> A 20-minute guided meditation/yoga flow to reduce stress,
                followed by a 25-minute “Budgeting Basics” workshop. Free “Mind & Money” tip cards
                and relaxation lounge access.
              </li>
              <li>
                <strong>Budgeting for Transportation (Lyft Collaboration):</strong> Lyft reps lead a
                30-minute session on comparing ride-share vs. public transit vs. car costs. Free
                discounted ride codes and “Transit Budget Planner” worksheets.
              </li>
              <li>
                <strong>Upcycle & Sell Booth (Maker’s Mark ATL):</strong> Learn how to transform
                recycled materials into marketable crafts. Volunteer artists guide kids to price
                items, set up tiny storefronts, and reinvest “earnings” into a mock savings fund.
              </li>
              <li>
                <strong>DIY Budget Board Maker Station (The Handmaded Co.):</strong> Craft supplies
                provided for kids to plan savings goals visually—includes take-home “Budget Board
                Kit” and guidance on costs vs. profits.
              </li>
            </ul>
            <div className="workshop-images-grid">
              <img src={TugOfWar} alt="Tug of war with families" />
              <img src={Teamwork} alt="Team doing a collaborative activity" />
            </div>
          </div>

          <div className="schedule-card">
            <h3>Live Entertainment & Raffles</h3>
            <ul>
              <li>
                <strong>MadCap Puppets “Money Matters” Puppet Show:</strong> A 20–25 minute custom
                performance teaching needs vs. wants, saving basics, and budgeting fun—twice
                daily in the Kid Zone.
              </li>
              <li>
                <strong>Storytime & Sticker Rewards:</strong> Puppet-themed coloring pages and “Storytime
                Savings” stickers for participating children.
              </li>
              <li>
                <strong>Raffle Wall:</strong> Win prizes including \$
                <strong>25</strong> Lyft ride credits, AFM gift cards, Maker’s Mark ATL upcycled craft kits,
                Satsang Yoga class vouchers, Flow Yoga passes, and a full wedding package giveaway
                (officiant fee, photographer, florals, and T-shirt merch bundle).
              </li>
            </ul>
            <div className="entertainment-image">
              <img
                src={FamilyFunCarnival}
                alt="Families enjoying carnival games"
              />
            </div>
          </div>
        </section>

        {/* VENDORS & SPONSORS */}
        <section className="festival-vendors">
          <h2>Vendor & Sponsorship Opportunities</h2>
          <p>
            Showcase your brand in front of 1,500+ families and entrepreneurs. We offer vendor booths,
            sponsorship packages, and custom activations to match your marketing goals. Here are our
            main tiers (all links are live Stripe checkout pages):
          </p>

          <div className="vendor-grid">
            {/* Tickets */}
            <div className="vendor-card">
              <h3>Attendee Tickets</h3>
              <ul>
                <li>
                  <strong>General Admission:</strong> \$20 &mdash;{" "}
                  <a
                    href="https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buy Here
                  </a>
                </li>
                <li>
                  <strong>VIP Admission:</strong> \$65 &mdash;{" "}
                  <a
                    href="https://buy.stripe.com/6oU14m45H8CW1Hx9176kg03"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buy Here
                  </a>
                </li>
              </ul>
            </div>

            {/* Speaker Slots */}
            <div className="vendor-card">
              <h3>Speaker Slots</h3>
              <ul>
                <li>
                  <strong>Standard Speaker Slot:</strong> \$75 &mdash;{" "}
                  <a
                    href="https://buy.stripe.com/bJe6oG31D6uO85V4KR6kg0l"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Here
                  </a>
                </li>
                <li>
                  <strong>Premium Speaker Slot:</strong> \$200 &mdash;{" "}
                  <a
                    href="https://buy.stripe.com/eVqaEW31D5qKfynelr6kg04"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Here
                  </a>
                </li>
              </ul>
            </div>

            {/* Vendor Booths */}
            <div className="vendor-card">
              <h3>Vendor Booths</h3>
              <ul>
                <li>
                  <strong>Standard Vendor Table:</strong> \$150 &mdash;{" "}
                  <a
                    href="https://buy.stripe.com/4gMaEWdGh6uO2LBgtz6kg07"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reserve Here
                  </a>
                </li>
                <li>
                  <strong>Premium Vendor Booth (High Traffic):</strong> \$250 &mdash;{" "}
                  <a
                    href="https://buy.stripe.com/3cI5kC6dP1auae3a5b6kg06"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reserve Here
                  </a>
                </li>
                <li>
                  <strong>Double-Sized Vendor Booth:</strong> \$300 &mdash;{" "}
                  <a
                    href="https://buy.stripe.com/3cI14mdGh6uO5XN1yF6kg05"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reserve Here
                  </a>
                </li>
                <li>
                  <strong>Virtual Vendor Booth:</strong> \$75 &mdash;{" "}
                  <a
                    href="https://buy.stripe.com/fZu8wOgStf1kgCr5OV6kg0j"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reserve Here
                  </a>
                </li>
              </ul>
            </div>

            {/* Sponsorships */}
            <div className="vendor-card">
              <h3>Sponsorship Tiers</h3>
              <ul>
                <li>
                  <strong>Event Platinum Partner:</strong> \$250/month or \$1,000/year
                  <ul>
                    <li>
                      <a
                        href="https://buy.stripe.com/14A5kCfOp3iC85V9176kg08"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Monthly
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://buy.stripe.com/00wdR86dP7yS4TJdhn6kg09"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Yearly
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Event Gold Sponsor:</strong> \$100/month or \$500/year
                  <ul>
                    <li>
                      <a
                        href="https://buy.stripe.com/28E9AS6dP9H04TJ6SZ6kg0a"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Monthly
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://buy.stripe.com/5kQ7sKgStdXg2LB3GN6kg0b"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Yearly
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Event Bronze Sponsor:</strong> \$50/month or \$250/year
                  <ul>
                    <li>
                      <a
                        href="https://buy.stripe.com/14A8wO45H2eygCrcdj6kg0c"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Monthly
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://buy.stripe.com/dRm00i9q1cTcgCr4KR6kg0d"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Yearly
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Declare Your Worth – Company Sponsor:</strong> \$97/month or \$997/year
                  <ul>
                    <li>
                      <a
                        href="https://buy.stripe.com/eVq6oG8lXg5ocmbelr6kg0e"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Monthly
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://buy.stripe.com/4gMbJ031D5qKae3elr6kg0g"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Yearly
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Event Community Sponsor:</strong> \$25/month or \$240/year
                  <ul>
                    <li>
                      <a
                        href="https://buy.stripe.com/7sY8wO6dP2eybi76SZ6kg0h"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Monthly
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://buy.stripe.com/8x2aEW59L9H0bi71yF6kg0i"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Yearly
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQs & Logistics */}
        <section className="festival-faq">
          <h2>FAQs & Logistics</h2>
          <div className="faq-item">
            <h3>Where is the festival located?</h3>
            <p>
              <strong>Brook Run Park</strong> • 4770 N Peachtree Rd, Dunwoody, GA 30338 — just on
              the Doraville border. Look for the “Declare Your Worth” banners near the main shelter.
            </p>
          </div>
          <div className="faq-item">
            <h3>What are the hours?</h3>
            <p>
              <strong>Saturday, Nov 29:</strong> 10:00 AM – 6:00 PM  
              <br />
              <strong>Sunday, Nov 30:</strong> 12:00 PM – 5:00 PM
            </p>
          </div>
          <div className="faq-item">
            <h3>How much does it cost?</h3>
            <p>
              Kids get in for <strong>FREE</strong>! Adult tickets are \$20 (general) or \$65 (VIP).
              Vendor booths, speaker slots, and sponsorships are extra (see above).
            </p>
          </div>
          <div className="faq-item">
            <h3>Is parking available?</h3>
            <p>
              Yes, Brook Run Park has a large free parking lot. Look for festival signage—parking
              attendants will guide you to designated festival spots.
            </p>
          </div>
          <div className="faq-item">
            <h3>Do I need to bring anything?</h3>
            <p>
              Just yourself and a curious mind! If you’re a vendor/sponsor, your booth will come
              with a 10×10 tent, table, two chairs, and power. Check your vendor packet for any
              additional supplies you need to bring (e.g., extension cords, tablecloths).
            </p>
          </div>
          <div className="faq-item">
            <h3>Can I volunteer?</h3>
            <p>
              Absolutely! We need volunteers for set-up, Kid Zone helpers, and raffle ticket
              sellers. Contact us <a href="/contact">here</a> to sign up.
            </p>
          </div>
          <div className="faq-item">
            <h3>Who is organizing this?</h3>
            <p>
              <strong>Dani Declares LLC</strong> — a women-owned business on a mission to empower
              families, entrepreneurs, and creatives through financial literacy, coaching, and
              community-building events.
            </p>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="festival-cta">
          <h2>Ready to Declare Your Worth?</h2>
          <div className="festival-cta-buttons">
            <a href="https://buy.stripe.com/fZu28qdGhcTc2LBelr6kg02" className="btn burgundy">
              Buy General Admission (\$20)
            </a>
            <a href="https://buy.stripe.com/6oU14m45H8CW1Hx9176kg03" className="btn burgundy">
              Buy VIP Admission (\$65)
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

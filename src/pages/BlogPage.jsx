import React from "react";

// Chrome
import FestivalBanner from "../components/FestivalBanner.jsx";
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar.jsx";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks.jsx";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent.jsx";
import "../components/CookieConsent.css";
import Footer from "../components/Footer.jsx";
import "../components/Footer.css";

// Styles
import "./BlogPage.css";

export default function BlogPage() {
  const posts = [
    {
      title: "Why You Need Life Insurance—Now, Not Later",
      summary: "It’s not just for the elderly. Protect your family and build wealth.",
      link: "#",
    },
    {
      title: "Top 5 Tips for a Smooth Wedding Ceremony",
      summary: "From your vows to your venue—how to plan a ceremony you’ll actually enjoy.",
      link: "#",
    },
    {
      title: "Declare Your Worth: The Mindset Shift",
      summary: "Here’s what happens when you stop asking for permission.",
      link: "#",
    },
  ];

  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="blog-page">
        <h1>Dani Declares Blog</h1>
        <p className="tagline">Stories, strategies, and spotlight features for every life chapter.</p>

        <div className="blog-grid">
          {posts.map((p) => (
            <div key={p.title} className="blog-card">
              <h2>{p.title}</h2>
              <p>{p.summary}</p>
              <a className="btn btn--secondary" href={p.link}>
                Read More
              </a>
            </div>
          ))}
        </div>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

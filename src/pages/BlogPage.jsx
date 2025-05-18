// src/pages/BlogPage.jsx
import React from "react";
import { Link } from "react-router-dom";

// site chrome  
import FestivalBanner from "../components/FestivalBanner";  
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent";
import "../components/CookieConsent.css";
import Footer from "../components/Footer";
import "../components/Footer.css";

// page styles
import "./BlogPage.css";

const POSTS = [
  {
    title: "5 Financial Tips for Newlyweds",
    date: "May 1, 2025",
    excerpt:
      "Set yourselves up for success with these 5 simple budgeting and saving strategies designed just for couples tying the knot.",
    img: `${process.env.PUBLIC_URL}/assets/blog/newlyweds-finance.jpg`,
    link: "/blog/financial-tips-newlyweds",
  },
  {
    title: "How to Plan a Pop-Up Wedding",
    date: "April 15, 2025",
    excerpt:
      "Discover the steps to host an intimate, stylish pop-up wedding—venue scouting, decor hacks, and vendor coordination.",
    img: `${process.env.PUBLIC_URL}/assets/blog/popup-wedding-guide.jpg`,
    link: "/blog/popup-wedding-guide",
  },
  {
    title: "Master Your Money Mindset",
    date: "April 1, 2025",
    excerpt:
      "Unlock the mindset shifts that will help you break financial fears and build lasting wealth—your journey starts here.",
    img: `${process.env.PUBLIC_URL}/assets/blog/money-mindset.jpg`,
    link: "/blog/master-your-money-mindset",
  },
  {
    title: "Top 10 Side Hustles for Creatives",
    date: "March 20, 2025",
    excerpt:
      "From digital design to event planning, explore ten creative side hustles you can launch today—no corporate boss required.",
    img: `${process.env.PUBLIC_URL}/assets/blog/side-hustles-creatives.jpg`,
    link: "/blog/side-hustles-creatives",
  },
];

export default function BlogPage() {
  return (
    <>
      {/* top banner + nav */}
      <FestivalBanner />
      <Navbar />

      {/* main content */}
      <main className="page blog-page">
        <header className="blog-hero">
          <h1>Dani Declares Blog</h1>
          <p>Insights, guides, and inspiration on weddings, finance, entrepreneurship, and more.</p>
        </header>

        <section className="posts-grid">
          {POSTS.map((post) => (
            <Link to={post.link} key={post.link} className="post-card">
              <div className="post-image">
                <img src={post.img} alt={post.title} />
              </div>
              <div className="post-content">
                <h3>{post.title}</h3>
                <p className="post-date">{post.date}</p>
                <p className="post-excerpt">{post.excerpt}</p>
                <span className="read-more">Read More →</span>
              </div>
            </Link>
          ))}
        </section>
      </main>

      {/* footer chrome */}
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

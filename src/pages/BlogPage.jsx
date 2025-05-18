import React from "react";
import { Link } from "react-router-dom";

// Chrome
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

// Styles
import "./BlogPage.css";

const POSTS = [
  {
    title: "5 Financial Tips for Newlyweds",
    date: "May 1, 2025",
    excerpt: "Set yourselves up for success with these simple budgeting strategies.",
    img: "/blog/newlyweds-finance.jpg",
    link: "/blog/financial-tips-newlyweds"
  },
  /* …other posts… */
];

export default function BlogPage() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="blog-page">
        <header className="blog-hero">
          <h1>Dani Declares Blog</h1>
          <p>Insights, guides, and inspiration on weddings, finance, entrepreneurship, and more.</p>
        </header>

        <div className="posts-grid">
          {POSTS.map((post) => (
            <Link key={post.link} to={post.link} className="post-card">
              <img src={post.img} alt={post.title} />
              <div className="post-content">
                <h3>{post.title}</h3>
                <p className="post-date">{post.date}</p>
                <p className="post-excerpt">{post.excerpt}</p>
                <span className="read-more">Read More →</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}

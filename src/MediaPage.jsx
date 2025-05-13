// src/MediaPage.jsx
import React from "react";
import Footer from "./Footer";
import "./MediaPage.css";

export default function MediaPage() {
  return (
    <>
      <div className="page media-page">
        <h1 className="hero-title">Media & Press</h1>
        <p className="hero-subtitle">
          Watch, listen, and read about Dani Declares.
        </p>

        {/* YouTube Playlist */}
        <section className="media-section">
          <h2>YouTube Series</h2>
          <div className="embed-container">
            <iframe
              src="https://www.youtube.com/embed/videoseries?list=YOUR_PLAYLIST_ID"
              title="I Do Declare Playlist"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Podcast Embed */}
        <section className="media-section">
          <h2>Podcast</h2>
          <div className="embed-container">
            <iframe
              src="https://open.spotify.com/embed-podcast/show/YOUR_SPOTIFY_SHOW_ID"
              title="Dani Declares Podcast"
              frameBorder="0"
              allow="encrypted-media"
              loading="lazy"
            ></iframe>
          </div>
        </section>

        {/* Press Mentions */}
        <section className="media-section">
          <h2>Press & Features</h2>
          <div className="press-logos">
            <a
              href="https://example.com/article1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/press/logo1.png" alt="Featured in Magazine A" />
            </a>
            <a
              href="https://example.com/article2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/press/logo2.png" alt="Interview on Podcast B" />
            </a>
            <a
              href="https://example.com/article3"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/press/logo3.png" alt="Guest on Show C" />
            </a>
          </div>
        </section>

        {/* Call to Action */}
        <div className="cta-box">
          <a href="/speaker" className="cta-button">
            Book Dani as a Speaker
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}

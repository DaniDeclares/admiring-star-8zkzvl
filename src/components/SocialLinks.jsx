// src/SocialLinks.jsx
import React from "react";
import "./SocialLinks.css";

export default function SocialLinks() {
  return (
    <div className="social-links" aria-label="Social media links">
      <a
        href="https://www.facebook.com/107462168514558"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <i className="fab fa-facebook-f" /> Facebook
      </a>
      <a
        href="https://twitter.com/Danideclares"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (Twitter)"
      >
        <i className="fab fa-twitter" /> X
      </a>
      <a
        href="https://www.instagram.com/danideclares/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <i className="fab fa-instagram" /> Instagram
      </a>
      <a
        href="https://www.youtube.com/channel/UCxdmPWN5oWPu9i3cPHB7aOA"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
      >
        <i className="fab fa-youtube" /> YouTube
      </a>
      <a
        href="https://www.linkedin.com/in/dandeclaresns/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <i className="fab fa-linkedin-in" /> LinkedIn
      </a>
      <a
        href="https://www.tiktok.com/@danideclaresns?lang=en"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
      >
        <i className="fab fa-tiktok" /> TikTok
      </a>
      <a
        href="https://www.pinterest.com/danideclaresns/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pinterest"
      >
        <i className="fab fa-pinterest" /> Pinterest
      </a>
      <a
        href="https://www.yelp.com/biz/dani-declares-notary-services-grand-rapids-2"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Yelp"
      >
        <i className="fab fa-yelp" /> Yelp
      </a>
    </div>
  );
}

import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <p>
          <strong>Consultation:</strong>{" "}
          <a
            href="https://tidycal.com/danideclaresns"
            target="_blank"
            rel="noopener noreferrer"
          >
            tidycal.com/danideclaresns
          </a>
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:admin@danideclares.com">admin@danideclares.com</a> |{" "}
          <a href="mailto:danideclaresns@gmail.com">danideclaresns@gmail.com</a>
        </p>
        <p>
          <strong>Call:</strong>{" "}
          <a href="tel:+14705234892">(470) 523-4892</a> |{" "}
          <a href="tel:+18643265362">(864) 326-5362</a>
        </p>
      </div>

      <div className="footer-social">
        {[
          ["Instagram", "https://www.instagram.com/danideclares"],
          ["Facebook", "https://www.facebook.com/danideclares"],
          ["TikTok", "https://www.tiktok.com/@danideclares"],
          ["YouTube", "https://www.youtube.com/@danideclares"],
          ["LinkedIn", "https://www.linkedin.com/in/danielle-williams-2129aaa5/"],
        ].map(([label, link]) => (
          <a key={label} href={link} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ))}
      </div>

      <p className="footer-bottom">
        © {new Date().getFullYear()} Dani Declares. All rights reserved.
      </p>
    </footer>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <p>
          Book a consultation:{" "}
          <a
            href="https://tidycal.com/danideclaresns"
            target="_blank"
            rel="noopener noreferrer"
          >
            tidycal.com/danideclaresns
          </a>
        </p>
        <p>
          Email:{" "}
          <a href="mailto:admin@danideclares.com">admin@danideclares.com</a> |{" "}
          <a href="mailto:danideclaresns@gmail.com">danideclaresns@gmail.com</a>
        </p>
        <p>
          Call: <a href="tel:4705234892">(470) 523-4892</a> |{" "}
          <a href="tel:8643265362">(864) 326-5362</a>
        </p>
      </div>

      <div className="footer-social">
        <a
          href="https://www.instagram.com/danideclares"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        <a
          href="https://www.facebook.com/danideclares"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <a
          href="https://www.tiktok.com/@danideclares"
          target="_blank"
          rel="noopener noreferrer"
        >
          TikTok
        </a>
        <a
          href="https://www.youtube.com/@danideclares"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube
        </a>
        <a
          href="https://www.linkedin.com/in/danielle-williams-2129aaa5/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </div>

      <p className="footer-bottom">
        © {new Date().getFullYear()} Dani Declares. All rights reserved.
      </p>
    </footer>
  );
}

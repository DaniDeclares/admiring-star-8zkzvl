// src/BlogPostPage.jsx
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import Footer from "./Footer";
import "./BlogPostPage.css";

const POSTS = [
  {
    slug: "financial-tips-newlyweds",
    title: "5 Financial Tips for Newlyweds",
    date: "May 1, 2025",
    img: "/blog/newlyweds-finance.jpg",
    content: `
      <p>Congratulations on tying the knot! As you begin this new chapter, here are five money tips to keep you both on solid financial footing:</p>
      <ol>
        <li><strong>Merge & Track:</strong> Create a shared budget spreadsheet. List all incomes, recurring bills, and savings goals so you both see the full picture.</li>
        <li><strong>Set Mini-Goals:</strong> Break large goals (down payment, vacation) into monthly targets—then automate transfers to savings.</li>
        <li><strong>Emergency Fund:</strong> Aim for 3–6 months of expenses in a high-yield savings account before splurges.</li>
        <li><strong>Debt Pay-Down Plan:</strong> Tackle high-interest debt first. Use the “snowball” or “avalanche” method, whichever keeps you motivated.</li>
        <li><strong>Regular Money Dates:</strong> Once a month, sit down together, review your budget, celebrate wins, and adjust for any life changes.</li>
      </ol>
      <p>By teamwork, automation, and regular check-ins, you’ll build both your savings and trust—together.</p>
    `,
  },
  {
    slug: "popup-wedding-guide",
    title: "How to Plan a Pop-Up Wedding",
    date: "April 15, 2025",
    img: "/blog/popup-wedding-guide.jpg",
    content: `
      <p>Pop-up weddings are intimate, stylish, and surprisingly easy to pull together at short notice. Follow these steps:</p>
      <h3>1. Pick Your Spot</h3>
      <p>Scout public parks, rooftops, or private venues that allow small ceremonies. Confirm permit and timing requirements.</p>
      <h3>2. Minimalist Decor</h3>
      <p>Rent or DIY a simple arch, fold-up chairs, and one or two statement floral pieces to keep costs low.</p>
      <h3>3. Vendor Coordination</h3>
      <p>Book your officiant, photographer, and any rentals as a “package.” We specialize in pop-up ceremonies and can handle all logistics.</p>
      <h3>4. Guest Experience</h3>
      <p>Send digital invites 2–4 weeks out. Provide a suggested dress code and a map. Offer a small refreshment bar or food truck after the “I do.”</p>
      <p>With a tight timeline and clear roles, your pop-up wedding will feel effortless and unforgettable.</p>
    `,
  },
  {
    slug: "master-your-money-mindset",
    title: "Master Your Money Mindset",
    date: "April 1, 2025",
    img: "/blog/money-mindset.jpg",
    content: `
      <p>Your beliefs about money shape your financial reality. Here are four mindset shifts to accelerate your wealth journey:</p>
      <ul>
        <li><strong>Scarcity → Abundance:</strong> Replace “I can’t afford that” with “How can I create the resources I need?”</li>
        <li><strong>Fear → Curiosity:</strong> Instead of avoiding budgeting, ask “What patterns can I learn from my spending?”</li>
        <li><strong>One-Time → Habit:</strong> Automate savings so wealth-building becomes routine, not a one-off effort.</li>
        <li><strong>Competition → Collaboration:</strong> Surround yourself with peers who share goals—and hold each other accountable.</li>
      </ul>
      <p>Pair these shifts with a clear plan (see our <a href="/financial">Financial Planning page</a>) and watch your confidence—and net worth—grow.</p>
    `,
  },
  {
    slug: "side-hustles-creatives",
    title: "Top 10 Side Hustles for Creatives",
    date: "March 20, 2025",
    img: "/blog/side-hustles-creatives.jpg",
    content: `
      <p>If you’re a creative looking to monetize your skills, consider these ten side hustles:</p>
      <ol>
        <li>Freelance graphic design</li>
        <li>Social-media content creation</li>
        <li>Wedding or event videography</li>
        <li>Custom illustration or digital art commissions</li>
        <li>Online courses or workshops</li>
        <li>Stock photography contributor</li>
        <li>Print-on-demand merchandise</li>
        <li>Web design for small businesses</li>
        <li>Personalized wedding stationery</li>
        <li>Brand consulting for startups</li>
      </ol>
      <p>Choose one that aligns with your passion, set aside a dedicated “hustle hour,” and leverage your existing network for referrals.</p>
    `,
  },
];

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return <Navigate to="/blog" replace />;

  return (
    <>
      <div className="page blog-post-page">
        <header className="post-hero">
          <h1>{post.title}</h1>
          <p className="post-date">{post.date}</p>
          <img src={post.img} alt={post.title} className="post-image" />
        </header>
        <article
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
      <Footer />
    </>
  );
}

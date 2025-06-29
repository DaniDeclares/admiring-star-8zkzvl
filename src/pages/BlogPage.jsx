import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import posts from "../posts/posts";
import "./BlogPage.css";

// Mailchimp form (✅ Replace with your actual Mailchimp list URL!)
const MAILCHIMP_FORM = `
<div id="mc_embed_signup">
  <form action="https://YOUR-USERNAME.usXX.list-manage.com/subscribe/post?u=XXXX&amp;id=XXXX" method="post" target="_blank" novalidate>
    <input type="email" name="EMAIL" class="email" id="mce-EMAIL" placeholder="Your email" required style="padding:8px 14px; border-radius:6px; border:1px solid #8B1E2E; margin-right:10px;"/>
    <input type="submit" value="Subscribe" name="subscribe" class="btn btn--primary" style="background:#8B1E2E;color:#fff; border:none; border-radius:6px; padding:9px 18px;"/>
  </form>
</div>
`;

export default function BlogPage() {
  return (
    <main className="blog-page">
      <Helmet>
        <title>Dani Declares Blog</title>
        <meta
          name="description"
          content="Stories, strategies, and spotlight interviews from the Dani Declares community. Read, learn, and stay inspired."
        />
      </Helmet>

      <h1 className="blog-title">Dani Declares Blog</h1>
      <p className="blog-tagline">
        Stories, strategies, and spotlights for every life chapter.
      </p>

      {/* Mailchimp Subscribe Form */}
      <div
        className="blog-mailchimp"
        dangerouslySetInnerHTML={{ __html: MAILCHIMP_FORM }}
      />

      <div className="blog-grid">
        {posts.map((p) => {
          const slug = p.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return (
            <div key={p.title} className="blog-card">
              <h2 className="blog-card-title">{p.title}</h2>
              <p className="blog-meta">
                {p.date} &nbsp;|&nbsp; {p.author}
              </p>
              <p className="blog-summary">{p.summary}</p>
              <Link className="btn btn--secondary" to={`/blog/${slug}`}>
                Read Full Post
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import posts from "../posts/posts";
import "./BlogPage.css";

// Mailchimp form (get your Mailchimp embed code and update the action!)
const MAILCHIMP_FORM = `
<div id="mc_embed_signup">
  <form action="https://YOUR-USERNAME.usXX.list-manage.com/subscribe/post?u=XXXX&amp;id=XXXX" method="post" target="_blank" novalidate>
    <input type="email" name="EMAIL" class="email" id="mce-EMAIL" placeholder="Your email" required>
    <input type="submit" value="Subscribe" name="subscribe" class="btn btn--primary">
  </form>
</div>
`;

export default function BlogPage() {
  return (
    <main className="blog-page">
      <h1>Dani Declares Blog</h1>
      <p className="tagline">Stories, strategies, and spotlight features for every life chapter.</p>

      {/* Mailchimp Subscribe */}
      <div
        className="blog-mailchimp"
        dangerouslySetInnerHTML={{ __html: MAILCHIMP_FORM }}
      />

      <div className="blog-grid">
        {posts.map((p) => {
          // generate a slug for each post
          const slug = p.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return (
            <div key={p.title} className="blog-card">
              <h2>{p.title}</h2>
              <p className="blog-meta">
                <span>{p.date}</span> | By {p.author}
              </p>
              <p>{p.summary}</p>
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

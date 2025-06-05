import React from "react";
import { useParams, Link } from "react-router-dom";
import posts from "../posts/posts";
import "./BlogPage.css"; // Reuse blog page styles

export default function BlogPostPage() {
  const { slug } = useParams();

  const post = posts.find(
    (p) =>
      p.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") === slug
  );

  if (!post)
    return (
      <main className="blog-post-page" style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ color: "#8B1E2E" }}>Post not found.</h2>
        <Link to="/blog" className="btn btn--secondary" style={{ marginTop: 20 }}>
          ← Back to Blog
        </Link>
      </main>
    );

  return (
    <main className="blog-post-page" style={{ maxWidth: 720, margin: "2rem auto", padding: 18 }}>
      <Link to="/blog" className="btn btn--secondary" style={{ marginBottom: 24 }}>
        ← Back to Blog
      </Link>
      <h1 className="blog-title" style={{ marginTop: 10 }}>{post.title}</h1>
      <div className="blog-meta" style={{ color: "#8B1E2E", marginBottom: 22 }}>
        {post.date} &nbsp;|&nbsp; {post.author}
      </div>
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
    </main>
  );
}

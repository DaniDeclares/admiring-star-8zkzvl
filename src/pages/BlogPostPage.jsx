import React from "react";
import { useParams, Link } from "react-router-dom";
import posts from "../posts/posts";

export default function BlogPostPage() {
  const { slug } = useParams();
  // Make a simple slug (replace spaces with dashes, lowercase)
  const post = posts.find(
    (p) =>
      p.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") === slug
  );

  if (!post) return <main style={{ padding: 40 }}>Post not found.</main>;

  return (
    <main className="blog-post-page" style={{ maxWidth: 700, margin: "2rem auto", padding: 16 }}>
      <Link to="/blog" style={{ color: "#8B1E2E", textDecoration: "underline" }}>← Back to Blog</Link>
      <h1>{post.title}</h1>
      <div style={{ color: "#888", marginBottom: 20 }}>
        {post.date} | By {post.author}
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </main>
  );
}

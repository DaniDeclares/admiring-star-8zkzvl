import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import posts from "../posts/posts";
import "./BlogPage.css";

export default function BlogPostPage() {
  const { slug } = useParams();

  const post = posts.find(
    (p) =>
      p.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") === slug
  );

  if (!post) {
    return (
      <main className="blog-post-page not-found">
        <Helmet>
          <title>Post Not Found • Dani Declares Blog</title>
        </Helmet>
        <h2>Oops! Post Not Found.</h2>
        <Link to="/blog" className="btn btn--secondary">
          ← Back to Blog
        </Link>
      </main>
    );
  }

  return (
    <main className="blog-post-page">
      <Helmet>
        <title>{post.title} • Dani Declares Blog</title>
      </Helmet>

      <Link to="/blog" className="btn btn--secondary back-btn">
        ← Back to Blog
      </Link>

      <h1 className="blog-title">{post.title}</h1>

      <div className="blog-meta">
        {post.date} &nbsp;|&nbsp; {post.author}
      </div>

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </main>
  );
}

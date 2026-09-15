import React from "react";
import { useParams, Link } from "react-router-dom";
import { BLOG_POSTS } from "../data/blogPosts.js";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1B0A0E', backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link to="/blog" style={{ color: '#8B1E2E', fontWeight: '700', textDecoration: 'none' }}>&larr; Back to Articles</Link>
        {post ? (
          <>
            <div style={{ fontSize: '0.85rem', color: '#C8B273', fontWeight: '700', marginTop: '1.5rem' }}>{post.date}</div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1B0A0E', marginTop: '0.5rem', marginBottom: '1rem' }}>{post.title}</h1>
            <p style={{ fontSize: '1.1rem', color: '#4A3B43', lineHeight: '1.7' }}>{post.desc}</p>
            <p style={{ fontSize: '0.95rem', color: '#8A7A80', marginTop: '2rem', fontStyle: 'italic' }}>Full article coming soon.</p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1B0A0E', marginTop: '1.5rem', marginBottom: '1rem' }}>Article not found</h1>
            <p style={{ fontSize: '1.1rem', color: '#4A3B43', lineHeight: '1.7' }}>We couldn't find that article. It may have moved or been removed.</p>
          </>
        )}
      </div>
    </div>
  );
}

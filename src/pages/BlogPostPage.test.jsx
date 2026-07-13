import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BlogPostPage from "./BlogPostPage";
import posts from "../posts/posts";

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const renderWithSlug = (slug) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/blog/${slug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe("BlogPostPage", () => {
  afterEach(() => {
    document.title = "";
  });

  it("renders the blog post title and metadata for a valid slug", async () => {
    const post = posts[0];
    const slug = slugify(post.title);

    renderWithSlug(slug);

    expect(
      screen.getByRole("heading", { name: post.title })
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${post.date}\\s*\\|\\s*${post.author}`))
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to blog/i })
    ).toHaveAttribute("href", "/blog");

    await waitFor(() => {
      expect(document.title).toBe(`${post.title} • Dani Declares Blog`);
    });
  });

  it("renders the not found UI for an invalid slug", async () => {
    renderWithSlug("missing-post");

    expect(
      screen.getByRole("heading", { name: /oops! post not found\./i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to blog/i })
    ).toHaveAttribute("href", "/blog");

    await waitFor(() => {
      expect(document.title).toBe("Post Not Found • Dani Declares Blog");
    });
  });
});

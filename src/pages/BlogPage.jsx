import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
import { isValidEmail, submitLeadIntake } from "../lib/secureIntake.js";
import posts from "../posts/posts";
import "./BlogPage.css";

const initialSubscribeForm = {
  fullName: "",
  email: "",
};

export default function BlogPage() {
  const [subscribeForm, setSubscribeForm] = useState(initialSubscribeForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const publicPhone = siteConfig.phoneNumbers.public;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSubscribeForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!subscribeForm.fullName.trim()) return "Enter your name to subscribe.";
    if (!isValidEmail(subscribeForm.email)) return "Enter a valid email address to subscribe.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setStatus("error");
      setMessage(validationMessage);
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      await submitLeadIntake({
        contextTag: "blog_subscribe_submit",
        leadPayload: {
          full_name: subscribeForm.fullName,
          organization_name: null,
          phone: null,
          email: subscribeForm.email,
          source_text: "Blog Subscribe Page",
          status: "new",
          notes: "Blog subscriber requested updates from the blog page.",
        },
        requestPayload: null,
      });

      setSubscribeForm(initialSubscribeForm);
      setStatus("success");
      setMessage("Thanks for subscribing. We’ll share new stories and updates soon.");
    } catch (error) {
      setStatus("error");
      setMessage(
        `We couldn't save your subscription right now. Please try again or call or text ${publicPhone.display}.`
      );
    }
  };

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

      <div className="blog-mailchimp">
        <form onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            name="fullName"
            className="email"
            value={subscribeForm.fullName}
            onChange={handleChange}
            placeholder="Your name"
            autoComplete="name"
            required
          />
          <input
            type="email"
            name="email"
            className="email"
            value={subscribeForm.email}
            onChange={handleChange}
            placeholder="Your email"
            autoComplete="email"
            required
          />
          <input
            type="submit"
            value={status === "submitting" ? "Submitting..." : "Subscribe"}
            name="subscribe"
            className="btn btn--primary"
            disabled={status === "submitting"}
          />
        </form>
      </div>

      {message && (
        <p className={`blog-subscribe-message blog-subscribe-message--${status}`} role="status" aria-live="polite">
          {message}
        </p>
      )}

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

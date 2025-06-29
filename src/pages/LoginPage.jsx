import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ALLOWED = ["acct_123","acct_456"]; // replace with your account IDs

export default function LoginPage() {
  const [id, setId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (ALLOWED.includes(id)) {
      localStorage.setItem("stripeAccount", id);
      navigate("/dashboard");
    } else {
      alert("Unknown account ID");
    }
  };

  return (
    <main className="login-page">
      <h1>Vendor & Notary Login</h1>
      <input
        type="text"
        placeholder="Enter your Stripe Account ID"
        value={id}
        onChange={e => setId(e.target.value)}
      />
      <button onClick={handleSubmit} className="btn btn--primary">
        Sign In
      </button>
    </main>
  );
}

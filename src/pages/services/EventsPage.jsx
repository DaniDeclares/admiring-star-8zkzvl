import React from "react";
import { Link } from "react-router-dom";

export default function EventsPage() {
  const capabilities = [
    "Event planning & coordination",
    "Community and resident programming",
    "Event production, setup & takedown",
    "Vendor and venue coordination",
    "Wedding and private-event logistics",
    "Seasonal and holiday experiences",
  ];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", color: "#1B0A0E", backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      <section style={{ backgroundColor: "#0F050A", color: "#F8F5F1", padding: "4.5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "850px", margin: "0 auto" }}>
          <div style={{ color: "#C8B273", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Division 10 • Experiences & Resident Programming
          </div>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, marginBottom: "1.25rem", color: "#F8F5F1" }}>
            Events, Experiences & Production
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#D1C7BD", lineHeight: 1.6 }}>
            DANI DECLARES plans, coordinates and executes experiences across residential, commercial, community and private-event environments.
          </p>
        </div>
      </section>

      <section style={{ padding: "4.5rem 1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          {capabilities.map((name) => (
            <div key={name} style={{ backgroundColor: "#F8F5F1", border: "1px solid #E2D9D0", padding: "1.75rem", borderRadius: 8 }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1B0A0E" }}>{name}</h2>
              <p style={{ fontSize: "0.9rem", color: "#5A4A52", lineHeight: 1.5, marginTop: "0.75rem" }}>
                Scope, delivery model and commercial treatment are determined through the canonical catalog and event intake. Historical package prices are not used.
              </p>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: "#F8F5F1", border: "1px solid #E2D9D0", borderRadius: 8, padding: "2.5rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1B0A0E", marginBottom: "0.75rem" }}>Plan an event with DANI DECLARES</h3>
          <p style={{ color: "#5A4A52", marginBottom: "1.75rem", maxWidth: 700, marginInline: "auto", lineHeight: 1.6 }}>
            Tell us the event type, date, location, guest or resident population, production needs and desired outcome. We will determine the appropriate scope and quote path.
          </p>
          <Link to="/request-service" style={{ backgroundColor: "#8B1E2E", color: "#FFFFFF", padding: "0.85rem 2rem", borderRadius: 4, fontWeight: 800, textDecoration: "none" }}>
            Request Event Planning &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}

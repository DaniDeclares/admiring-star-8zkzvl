import React from "react";
import { Link } from "react-router-dom";

const frontDoors = [
  {
    title: "Turnover & Make-Ready",
    text: "Get vacant units moving toward rent-ready with cleaning, reset support, punch-list coordination, vendor handoff and readiness documentation.",
  },
  {
    title: "Property Rescue & Field Dispatch",
    text: "When the site team needs extra execution capacity, we coordinate field support, small-job response, supply logistics and time-sensitive property needs.",
  },
  {
    title: "Property Condition & Documentation",
    text: "Get clear site checks, condition documentation, organized photos and management-ready reporting that gives your team a reliable view of the property.",
  },
  {
    title: "Office & Operations Rescue",
    text: "Bring property-office coordination, records cleanup, vendor administration and operational support into one dependable relationship when your team needs extra capacity.",
  },
];

export default function PropertyPage() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#211417", background: "#fbf8f4", minHeight: "100vh" }}>
      <section style={{ background: "linear-gradient(135deg,#250b12,#5b1424)", color: "white", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 24 }}>
          <div style={{ color: "#d7b980", textTransform: "uppercase", letterSpacing: 3, fontSize: 12, fontWeight: 800 }}>
            Property Management & Apartments
          </div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem,6vw,4.6rem)", lineHeight: 1.02 }}>
            Dependable execution for the work your property team needs handled.
          </h1>
          <p style={{ maxWidth: 790, fontSize: 19, lineHeight: 1.65, color: "#eadfe0", margin: 0 }}>
            DANI DECLARES supports apartment communities, property teams and ownership groups with field execution, turnover support, documentation and operational assistance.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/request-service?channelType=B2B_APT" style={{ background: "#d7b980", color: "#2a0b12", padding: "14px 22px", borderRadius: 7, fontWeight: 800, textDecoration: "none" }}>
              Request Property Support
            </Link>
            <a href="tel:+14704857173" style={{ border: "1px solid #d7b980", color: "white", padding: "14px 22px", borderRadius: 7, fontWeight: 700, textDecoration: "none" }}>
              Call (470) 485-7173
            </a>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3.5rem 1.5rem 5rem" }}>
        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2.4, fontWeight: 800, color: "#7a2637" }}>
            Start here
          </div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 10px" }}>
            Four ways to put the right support around your property team.
          </h2>
          <p style={{ maxWidth: 780, color: "#66565a", lineHeight: 1.7 }}>
            Choose the kind of support you need, or send us the situation and we'll confirm the appropriate scope, availability and next step.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginTop: 22 }}>
            {frontDoors.map((item) => (
              <article key={item.title} style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 14, padding: 24 }}>
                <h3 style={{ margin: "0 0 10px", color: "#66192b", fontSize: 23 }}>{item.title}</h3>
                <p style={{ margin: 0, lineHeight: 1.65, color: "#6c5c60" }}>{item.text}</p>
                <Link
                  to="/request-service?channelType=B2B_APT"
                  style={{ display: "inline-flex", marginTop: 18, background: "#6b1426", color: "white", padding: "11px 16px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}
                >
                  Tell Us What You Need
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 28, marginBottom: 48 }}>
          <h2 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Built to grow with the property.</h2>
          <p style={{ color: "#66565a", lineHeight: 1.7, maxWidth: 820, marginBottom: 20 }}>
            Start with a single request, a property-level need or a recurring operational gap. We confirm the scope, coordinate the right execution path and document the result before expanding the relationship.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
            {[
              ["1", "Tell us what is happening"],
              ["2", "We confirm the scope"],
              ["3", "We coordinate the work"],
              ["4", "We document the result"],
              ["5", "Expand support when it makes sense"],
            ].map(([number, text]) => (
              <div key={number} style={{ background: "#f7f1ec", padding: 16, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#8d6418" }}>{number}</div>
                <div style={{ marginTop: 5, fontWeight: 800, color: "#5b1424" }}>{text}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: "center", background: "#6b1426", color: "white", padding: "38px 24px", borderRadius: 12 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "0 0 10px" }}>
            Need something handled this week?
          </h2>
          <p style={{ color: "#eddde1", maxWidth: 660, margin: "0 auto 20px", lineHeight: 1.6 }}>
            Send the scope. We'll confirm the appropriate service, availability and next step.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link to="/request-service?channelType=B2B_APT" style={{ background: "white", color: "#6b1426", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>
              Request Property Support
            </Link>
            <a href="tel:+14704857173" style={{ border: "1px solid #ead5da", color: "white", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>
              (470) 485-7173
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

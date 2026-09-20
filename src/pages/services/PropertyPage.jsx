import React from "react";
import { Link } from "react-router-dom";

const directServices = [
  {
    category: "Turnover & Make-Ready",
    problem: "Compress the turn window and get a vacant unit back toward leasing-ready condition.",
    services: [
      ["DNI-02A-025", "Turnover Ready Basic", "$375 starting"],
      ["DNI-02A-026", "Turnover Ready Standard", "$650 starting"],
      ["DNI-02A-027", "Turnover Ready Premium", "$950 starting"],
    ],
  },
  {
    category: "Property Condition & Documentation",
    problem: "Create independent, timestamped condition evidence for move-in, move-out and damage records.",
    services: [
      ["DNI-02A-031", "Property Condition Report", "$275"],
      ["DNI-02A-029", "Move-In / Move-Out Photo Report", "$150"],
      ["DNI-02A-033", "Damage Documentation Pack", "$225"],
    ],
  },
  {
    category: "Pre-Audit Property Readiness",
    problem: "Prepare the physical property and documentation picture before an inspection or readiness review.",
    services: [
      ["DNI-03A-015", "Pre-Listing Walkthrough", "$85"],
      ["DNI-02A-017", "Site Status Verification", "$150"],
      ["DNI-02A-024", "Final Walkthrough Prep Package", "$175"],
    ],
  },
  {
    category: "Property Operations Dispatch",
    problem: "Resolve structured field tasks that are too small for a major contractor but still require accountable execution.",
    services: [
      ["DNI-02A-023", "Turnover Scout", "$125"],
      ["DNI-02A-034", "Local Field Visit", "$95"],
      ["DNI-02A-035", "Notice Posting Run", "$125"],
      ["DNI-02A-036", "Document Courier Run", "$95"],
    ],
  },
  {
    category: "Administrative Operations Support",
    problem: "Clear leasing-office backlogs, records drift and compliance tracking work.",
    services: [
      ["DNI-04A-036", "Quick Admin Rescue", "$125"],
      ["DNI-04A-040", "Records Cleanup Sprint", "$350"],
      ["DNI-04A-017", "CRM / Property System Cleanup", "$275"],
      ["DNI-04A-039", "Compliance Tracker Setup", "$450"],
    ],
  },
  {
    category: "Recurring Property Operations Support",
    problem: "Build predictable operational support around a property's recurring needs.",
    services: [
      ["DNI-04A-034", "Monthly HQ Support - Core", "$1,250 / month"],
    ],
  },
  {
    category: "Vendor Coordination",
    problem: "Keep property teams from becoming the dispatcher between multiple outside vendors.",
    services: [
      ["DNI-02A-020", "Work Order Coordination", "$225"],
    ],
  },
];

const requestLink = (sku) =>
  "/request-service?channelType=B2B_APT&service=" + encodeURIComponent(sku);

export default function PropertyPage() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#211417", background: "#fbf8f4", minHeight: "100vh" }}>
      <section style={{ background: "linear-gradient(135deg,#250b12,#5b1424)", color: "white", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 22 }}>
          <div style={{ color: "#d7b980", textTransform: "uppercase", letterSpacing: 3, fontSize: 12, fontWeight: 800 }}>
            Property Management & Apartments
          </div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem,6vw,4.6rem)", lineHeight: 1.02 }}>
            Property Operations
          </h1>
          <p style={{ maxWidth: 800, fontSize: 19, lineHeight: 1.65, color: "#eadfe0", margin: 0 }}>
            Outcome-based support for apartment and property-management teams: turnover, condition documentation, field dispatch, office rescue and coordinated property operations.
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
        <section style={{ marginBottom: 42 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2.4, fontWeight: 800, color: "#7a2637" }}>
            The Property Operations Menu
          </div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 10px" }}>
            Start with the outcome. We’ll scope the work and confirm the quote.
          </h2>
          <p style={{ maxWidth: 820, color: "#66565a", lineHeight: 1.7, margin: 0 }}>
            This is the property-management menu—not the resident cleaning catalog. Choose the operational outcome that matches the problem, then send the request into the CH02 quote/intake path.
          </p>
        </section>

        <div style={{ display: "grid", gap: 30 }}>
          {directServices.map((section) => (
            <section key={section.category} style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 26 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#9a741f", fontWeight: 800 }}>
                Property solution
              </div>
              <h2 style={{ fontFamily: "Georgia, serif", color: "#5b1424", fontSize: 28, margin: "7px 0 8px" }}>
                {section.category}
              </h2>
              <p style={{ color: "#66565a", lineHeight: 1.6, maxWidth: 780, marginTop: 0 }}>
                {section.problem}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12, marginTop: 18 }}>
                {section.services.map(([sku, name, price]) => (
                  <article key={sku} style={{ border: "1px solid #eee5e0", borderRadius: 9, padding: 18, background: "#fdfbf9" }}>
                    <div style={{ fontSize: 11, color: "#80666b", letterSpacing: 1, fontWeight: 800 }}>{sku}</div>
                    <h3 style={{ margin: "6px 0 8px", color: "#66192b", fontSize: 19 }}>{name}</h3>
                    <div style={{ fontWeight: 900, color: "#5b1424", marginBottom: 14 }}>{price}</div>
                    <Link to={requestLink(sku)} style={{ display: "inline-block", background: "#6b1426", color: "white", padding: "10px 14px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}>
                      Request a Quote
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}

          <section style={{ background: "#2a0b12", color: "white", borderRadius: 12, padding: 28 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#d7b980", fontWeight: 800 }}>
              Composed / emergency work
            </div>
            <h2 style={{ fontFamily: "Georgia, serif", margin: "8px 0 10px" }}>Eviction, abandonment & multi-vendor recovery</h2>
            <p style={{ color: "#dbcdd0", lineHeight: 1.65, maxWidth: 780 }}>
              When a property needs trash-out coordination, access logistics, condition documentation and turnover work coordinated as one operational response, send the full scope. DANI will build the appropriate composed quote rather than forcing a multi-vendor emergency into a single generic service.
            </p>
            <Link to="/request-service?channelType=B2B_APT" style={{ display: "inline-flex", marginTop: 8, background: "#d7b980", color: "#2a0b12", padding: "12px 17px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}>
              Request Emergency Property Quote
            </Link>
          </section>
        </div>

        <section style={{ marginTop: 40, background: "#f7f1ec", borderRadius: 12, padding: 26 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#7a2637", fontWeight: 800 }}>
            What happens next
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginTop: 14 }}>
            {[
              ["1", "Choose the operational outcome."],
              ["2", "Tell us the property, location, scope, condition and timing."],
              ["3", "We confirm the applicable service, requirements and quote path."],
              ["4", "You receive the quote/proposal and next step."],
            ].map(([n, label]) => (
              <div key={n} style={{ background: "white", borderRadius: 8, padding: 16 }}>
                <div style={{ color: "#9a741f", fontWeight: 900 }}>{n}</div>
                <div style={{ color: "#5b1424", fontWeight: 800, marginTop: 5, lineHeight: 1.45 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

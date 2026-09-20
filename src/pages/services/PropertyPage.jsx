import React from "react";
import { Link } from "react-router-dom";

const entryServices = [
  ["Common-area cleaning", "Keep hallways, stairwells, laundry rooms, leasing offices, clubhouses and shared spaces clean, presentable and ready for residents."],
  ["Unit turns & make-ready", "Prepare vacant units for their next resident with cleaning, reset support, punch-list coordination and readiness documentation."],
  ["Inspections & property documentation", "Receive clear condition checks, photo documentation and site-status reporting that gives your team a reliable view of the property."],
  ["Punch-list & maintenance support", "Move minor repairs, touch-ups and make-ready items forward through qualified service providers."],
  ["Move-in support", "Coordinate welcome materials, resident packets, move-in supplies and other details that help create a smoother resident experience."],
  ["Ongoing property support", "Bring recurring service coordination, facility support and resident-experience needs under one dependable operating relationship."],
];

const featuredSolutions = [
  { sku: "DNI-02A-026", label: "Turnover Ready Standard", outcome: "Expanded turnover coordination with before-and-after documentation, vendor handoff and a final readiness report." },
  { sku: "DNI-02A-027", label: "Turnover Ready Premium", outcome: "Priority turnover support with kickoff, vendor coordination, progress updates, final walkthrough and management-ready reporting." },
];

const additionalServices = [
  ["Property inspections", "Condition checks, site verification and documentation."],
  ["Photo documentation", "Organized photos and clear field notes for your records."],
  ["Common-area support", "Cleaning and upkeep for shared property spaces."],
  ["Office support", "Leasing-office cleaning and operational assistance."],
  ["Move-in readiness", "Support preparing units and materials for incoming residents."],
  ["Vendor coordination", "Field coordination and follow-through for property needs."],
];

export default function PropertyPage() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#211417", background: "#fbf8f4", minHeight: "100vh" }}>
      <section style={{ background: "linear-gradient(135deg,#250b12,#5b1424)", color: "white", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 24 }}>
          <div style={{ color: "#d7b980", textTransform: "uppercase", letterSpacing: 3, fontSize: 12, fontWeight: 800 }}>Property Management & Apartments</div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem,6vw,4.6rem)", lineHeight: 1.02 }}>Start small. Prove the work. Expand the account.</h1>
          <p style={{ maxWidth: 790, fontSize: 19, lineHeight: 1.65, color: "#eadfe0", margin: 0 }}>
            DANI DECLARES provides dependable property support for apartment communities, property teams and ownership groups—from individual service requests to ongoing operational support.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/request-service?channelType=B2B_APT" style={{ background: "#d7b980", color: "#2a0b12", padding: "14px 22px", borderRadius: 7, fontWeight: 800, textDecoration: "none" }}>Request Property Support</Link>
            <a href="tel:+14704857173" style={{ border: "1px solid #d7b980", color: "white", padding: "14px 22px", borderRadius: 7, fontWeight: 700, textDecoration: "none" }}>Call (470) 485-7173</a>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3.5rem 1.5rem 5rem" }}>
        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2.4, fontWeight: 800, color: "#7a2637" }}>Start here</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 10px" }}>Solutions for the work property teams need handled.</h2>
          <p style={{ maxWidth: 780, color: "#66565a", lineHeight: 1.7 }}>
            Choose a service that matches the immediate need, or tell us what is happening and we'll help identify the right way to handle it.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginTop: 22 }}>
            {featuredSolutions.map(item => {
              return (
                <article key={item.sku} style={{ background: "white", border: "2px solid #d8bd78", borderRadius: 14, padding: 24 }}>
                  <h3 style={{ margin: "0 0 8px", color: "#66192b", fontSize: 24 }}>{item.label}</h3>
                  <p style={{ margin: 0, lineHeight: 1.6, color: "#6c5c60" }}>{item.outcome}</p>
                  <Link
                    to={"/request-service?channelType=B2B_APT&service=" + encodeURIComponent(item.sku)}
                    style={{ display: "inline-flex", marginTop: 16, background: "#6b1426", color: "white", padding: "12px 18px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}
                  >
                    Request a Quote
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2.4, fontWeight: 800, color: "#7a2637" }}>Property support</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 10px" }}>Give us one problem first.</h2>
          <p style={{ maxWidth: 760, color: "#66565a", lineHeight: 1.7 }}>
            Start with one hallway, one office, one unit turn, one punch list or one inspection. We document the work, build the relationship and expand only where it creates value.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginTop: 22 }}>
            {entryServices.map(([title, text]) => (
              <article key={title} style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: "0 0 8px", color: "#66192b" }}>{title}</h3>
                <p style={{ margin: 0, lineHeight: 1.6, color: "#6c5c60" }}>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#7a2637", fontWeight: 800 }}>More ways we can help</div>
            <h2 style={{ fontFamily: "Georgia, serif", margin: "8px 0 18px" }}>Flexible support for day-to-day property needs.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 10 }}>
              {additionalServices.map(([title, text]) => (
                <div key={title} style={{ border: "1px solid #eee5e0", borderRadius: 9, padding: 14 }}>
                  <strong style={{ display: "block", color: "#66192b" }}>{title}</strong>
                  <span style={{ display: "block", fontSize: 13, color: "#7a6a6e", marginTop: 4 }}>{text}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#7a6a6e", lineHeight: 1.6, marginTop: 18 }}>
              Service scope, availability and pricing are confirmed based on the property, requested work and current requirements.
            </p>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 48 }}>
          <div style={{ background: "#2a0b12", color: "white", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#d7b980", fontWeight: 800 }}>Ongoing support</div>
            <h2 style={{ fontFamily: "Georgia, serif", margin: "8px 0 18px" }}>Build a relationship that grows with the property.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
              {[
                ["Property Support", "Recurring help with the services your property needs most."],
                ["Resident Experience", "Support for resident-facing details, programs and move-in needs."],
                ["Operations Support", "A broader service relationship built around your team's priorities."],
              ].map(([label, text]) => (
                <div key={label} style={{ padding: 16, border: "1px solid #60323c", borderRadius: 9 }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{label}</div>
                  <div style={{ color: "#dbcdd0", marginTop: 6, lineHeight: 1.5 }}>{text}</div>
                </div>
              ))}
            </div>
            <p style={{ color: "#dbcdd0", lineHeight: 1.6, marginTop: 18 }}>
              For recurring relationships, we'll review the property's needs, service mix and expected cadence before presenting a tailored proposal.
            </p>
            <Link to="/request-service?channelType=B2B_APT" style={{ display: "inline-flex", marginTop: 14, background: "#d7b980", color: "#2a0b12", padding: "11px 16px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}>Discuss Ongoing Support</Link>
          </div>
        </section>

        <section style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 28, marginBottom: 48 }}>
          <h2 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>A simple way to get started</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
            {[
              ["1", "Tell us what you need"],
              ["2", "We confirm the scope"],
              ["3", "We handle the work"],
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
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "0 0 10px" }}>Need something handled this week?</h2>
          <p style={{ color: "#eddde1", maxWidth: 660, margin: "0 auto 20px", lineHeight: 1.6 }}>Send the scope. We'll confirm the appropriate service, availability and next step.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link to="/request-service?channelType=B2B_APT" style={{ background: "white", color: "#6b1426", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>Request Property Support</Link>
            <a href="tel:+14704857173" style={{ border: "1px solid #ead5da", color: "white", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>(470) 485-7173</a>
          </div>
        </section>
      </main>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";

const services = [
  { name: "Resident Refresh", detail: "Routine apartment cleaning and reset support.", price: "1BR from $85" },
  { name: "Deep Structural Reset", detail: "Deeper cleaning for buildup, seasonal resets and move preparation.", price: "1BR from $233.75" },
  { name: "Deposit Security Move-Out Turn", detail: "Vacant-unit move-out cleaning with condition-based quoting where needed.", price: "1BR from $318.75" },
  { name: "Valet Wash, Dry & Fold", detail: "Resident laundry support with community resident pricing.", price: "$38.25 / basket" },
  { name: "Home Watch / Absence Check", detail: "Visual household check while you are away, subject to property access rules.", price: "from $55.25 / visit" },
  { name: "Household & Concierge Support", detail: "Organization, errands, move support, pet/plant support and other household requests are available through the service intake process.", price: "Request a quote" },
];

export default function ResidentWelcomePage() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#fbf8f4", minHeight: "100vh", color: "#211417" }}>
      <section style={{ background: "linear-gradient(145deg,#5d1325,#2a0b12)", color: "white", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "#d7b980", fontWeight: 800 }}>Welcome Home</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem,7vw,4.5rem)", margin: "10px 0 14px", lineHeight: 1.04 }}>Your resident concierge is one request away.</h1>
          <p style={{ maxWidth: 700, margin: "0 auto", color: "#eadde0", fontSize: 18, lineHeight: 1.65 }}>DANI DECLARES supports participating apartment residents with cleaning, laundry, household support, move services and other everyday execution needs.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <Link to="/request-service" style={{ background: "#d7b980", color: "#2a0b12", padding: "14px 22px", borderRadius: 7, fontWeight: 800, textDecoration: "none" }}>Request resident service</Link>
            <a href="tel:+14704857173" style={{ border: "1px solid #d7b980", color: "white", padding: "14px 22px", borderRadius: 7, fontWeight: 700, textDecoration: "none" }}>(470) 485-7173</a>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "3.25rem 1.5rem 5rem" }}>
        <section style={{ background: "#fff", border: "1px solid #e4d9d3", borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Participating-community resident benefit</h2>
          <p style={{ lineHeight: 1.7, color: "#65565a", marginBottom: 0 }}>Eligible services may receive the approved community resident benefit or a property-specific override. Government fees, pass-through costs, materials and protected/severe-condition charges are not automatically discounted. Eligibility is confirmed at booking.</p>
        </section>

        <section>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2.4, fontWeight: 800, color: "#7a2637" }}>Popular resident services</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 20px" }}>A simple place to start</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
            {services.map((service) => (
              <article key={service.name} style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: "0 0 7px", color: "#66192b" }}>{service.name}</h3>
                <p style={{ margin: "0 0 12px", color: "#6b5c60", lineHeight: 1.6 }}>{service.detail}</p>
                <strong style={{ color: "#5a1526" }}>{service.price}</strong>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          <div style={{ background: "#f2e8df", padding: 22, borderRadius: 10 }}><h3 style={{ marginTop: 0 }}>How it works</h3><p style={{ marginBottom: 0, color: "#65565a", lineHeight: 1.65 }}>Submit your request, identify your apartment community, and share the scope. We verify eligibility, availability and the final quote before work is scheduled.</p></div>
          <div style={{ background: "#f2e8df", padding: 22, borderRadius: 10 }}><h3 style={{ marginTop: 0 }}>Need something not listed?</h3><p style={{ marginBottom: 0, color: "#65565a", lineHeight: 1.65 }}>Use the same request form. The full DANI DECLARES catalog includes additional household, move, organization, event, document and concierge support subject to availability and fulfillment gates.</p></div>
        </section>

        <section style={{ textAlign: "center", marginTop: 38, background: "#6b1426", color: "white", padding: "34px 22px", borderRadius: 12 }}>
          <h2 style={{ fontFamily: "Georgia, serif", margin: "0 0 10px" }}>Ready when you are.</h2>
          <p style={{ color: "#ebdce0", margin: "0 auto 18px", maxWidth: 620, lineHeight: 1.6 }}>Tell us what needs to be handled and we will route the request through the correct resident service lane.</p>
          <Link to="/request-service" style={{ display: "inline-block", background: "white", color: "#6b1426", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>Start a request</Link>
        </section>
      </main>
    </div>
  );
}

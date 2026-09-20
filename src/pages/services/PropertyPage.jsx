import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const entryServices = [
  ["Common-area cleaning", "Hallways, stairwells, laundry rooms, leasing offices, clubhouses and shared spaces."],
  ["Unit turns & make-ready", "Vacant-unit cleaning, deep resets, punch-list coordination and move-in readiness."],
  ["Property inspections & photo logs", "Visual condition checks, before/after documentation and site-status reporting."],
  ["Handyman & punch-list support", "Minor repair and make-ready support routed only through qualified fulfillment lanes."],
  ["Resident move-in support", "Welcome packets, resident kits, move-in materials and community-specific resident concierge access."],
  ["Ongoing property operations", "Recurring service coordination, facility support, resident-experience programs and account retainers."],
];

const featuredSolutions = [
  { sku: "DNI-02A-026", label: "Turnover Ready Standard", outcome: "Expanded turnover coordination, before/after documentation, light admin coordination, vendor handoff and final readiness reporting." },
  { sku: "DNI-02A-027", label: "Turnover Ready Premium", outcome: "Priority turnover support with kickoff, vendor coordination, progress updates, final walkthrough and management-ready reporting." },
];

const retainerNames = ["Property Support", "Resident Experience", "Operations Partner"];

export default function PropertyPage() {
  const [catalog, setCatalog] = useState([]);
  useEffect(() => {
    fetch("/api/verify-commercial-intent?catalog=1&channelType=B2B_APT")
      .then(r => r.json())
      .then(d => { if (d.success) setCatalog(d.services || []); })
      .catch(() => {});
  }, []);

  const bySku = useMemo(() => new Map(catalog.map(s => [s.serviceId, s])), [catalog]);
  const otherServices = useMemo(
    () => catalog.filter(s => String(s.division) === "02" && !featuredSolutions.some(x => x.sku === s.serviceId) && s.intakeAvailable),
    [catalog]
  );

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#211417", background: "#fbf8f4", minHeight: "100vh" }}>
      <section style={{ background: "linear-gradient(135deg,#250b12,#5b1424)", color: "white", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 24 }}>
          <div style={{ color: "#d7b980", textTransform: "uppercase", letterSpacing: 3, fontSize: 12, fontWeight: 800 }}>Property Management & Apartments</div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem,6vw,4.6rem)", lineHeight: 1.02 }}>Start small. Prove the work. Expand the account.</h1>
          <p style={{ maxWidth: 790, fontSize: 19, lineHeight: 1.65, color: "#eadfe0", margin: 0 }}>
            DANI DECLARES gives apartment communities one operating partner for the recurring work that keeps units, common areas, resident experience and property documentation moving.
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
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 10px" }}>Two composed solutions for the work property teams feel first.</h2>
          <p style={{ maxWidth: 780, color: "#66565a", lineHeight: 1.7 }}>
            Choose the scope that matches the immediate problem. The request carries the property relationship into CH02 automatically, so the quote starts with the correct commercial pricing context and the submitted customer information.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginTop: 22 }}>
            {featuredSolutions.map(item => {
              const s = bySku.get(item.sku);
              return (
                <article key={item.sku} style={{ background: "white", border: "2px solid #d8bd78", borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#7a2637", fontWeight: 900 }}>CH02 · Property Management</div>
                  <h3 style={{ margin: "9px 0 8px", color: "#66192b", fontSize: 24 }}>{item.label}</h3>
                  <p style={{ margin: 0, lineHeight: 1.6, color: "#6c5c60" }}>{item.outcome}</p>
                  <div style={{ marginTop: 14, fontWeight: 900, color: "#5b1424" }}>
                    {s?.baseCustomerPrice != null ? "$" + Number(s.baseCustomerPrice).toFixed(2) : "Quote required"}
                  </div>
                  <Link to={"/request-service?channelType=B2B_APT&service=" + encodeURIComponent(item.sku)} style={{ display: "inline-flex", marginTop: 16, background: "#6b1426", color: "white", padding: "12px 18px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}>Get Quote Now</Link>
                </article>
              );
            })}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2.4, fontWeight: 800, color: "#7a2637" }}>Low-friction entry services</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 10px" }}>Give us one problem first.</h2>
          <p style={{ maxWidth: 760, color: "#66565a", lineHeight: 1.7 }}>Start with one hallway, one office, one unit turn, one punch list or one inspection. We document the work, build the relationship and expand only where it creates value.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginTop: 22 }}>
            {entryServices.map(([title, text]) => <article key={title} style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 10, padding: 20 }}><h3 style={{ margin: "0 0 8px", color: "#66192b" }}>{title}</h3><p style={{ margin: 0, lineHeight: 1.6, color: "#6c5c60" }}>{text}</p></article>)}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#7a2637", fontWeight: 800 }}>Other CH02 services</div>
            <h2 style={{ fontFamily: "Georgia, serif", margin: "8px 0 18px" }}>Browse the property operations menu</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 10 }}>
              {otherServices.slice(0, 24).map(s => <div key={s.serviceId} style={{ border: "1px solid #eee5e0", borderRadius: 9, padding: 14 }}>
                <strong style={{ display: "block", color: "#66192b" }}>{s.name}</strong>
                <span style={{ display: "block", fontSize: 12, color: "#7a6a6e", marginTop: 4 }}>{s.publicPriceDisplay || (s.baseCustomerPrice != null ? "Starting at $" + Number(s.baseCustomerPrice).toFixed(2) : "Quote required")}</span>
                <Link to={"/request-service?channelType=B2B_APT&service=" + encodeURIComponent(s.serviceId)} style={{ display: "inline-block", marginTop: 8, color: "#8d6418", fontSize: 12, fontWeight: 900 }}>Get quote →</Link>
              </div>)}
            </div>
            <p style={{ fontSize: 12, color: "#7a6a6e", lineHeight: 1.5, marginTop: 16 }}>Variable, recurring, regulated or provider-dependent scopes remain quote-controlled. Prices shown here are resolved from the CH02 commercial catalog.</p>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 48 }}>
          <div style={{ background: "#2a0b12", color: "white", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#d7b980", fontWeight: 800 }}>Account expansion</div>
            <h2 style={{ fontFamily: "Georgia, serif", margin: "8px 0 18px" }}>Recurring property relationships</h2>
            {retainerNames.map(label => <div key={label} style={{ padding: "15px 0", borderBottom: "1px solid #60323c" }}><div style={{ fontWeight: 800, fontSize: 18 }}>{label}</div><div style={{ color: "#d7b980", marginTop: 4 }}>Request recurring quote</div></div>)}
            <p style={{ color: "#dbcdd0", lineHeight: 1.6, marginTop: 18 }}>Recurring relationships are quoted through the CH02 commercial workflow so scope, service mix, capacity and fulfillment readiness are captured before a recurring price is committed.</p>
            <Link to="/request-service?channelType=B2B_APT" style={{ display: "inline-flex", marginTop: 14, background: "#d7b980", color: "#2a0b12", padding: "11px 16px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}>Request Property Support</Link>
          </div>
        </section>

        <section style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 28, marginBottom: 48 }}>
          <h2 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>The account-growth model</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
            {["1. Pilot service", "2. Document results", "3. Add recurring work", "4. Expand across property", "5. Expand across portfolio"].map(x => <div key={x} style={{ background: "#f7f1ec", padding: 16, borderRadius: 8, fontWeight: 800, color: "#5b1424" }}>{x}</div>)}
          </div>
        </section>

        <section style={{ textAlign: "center", background: "#6b1426", color: "white", padding: "38px 24px", borderRadius: 12 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "0 0 10px" }}>Need something handled this week?</h2>
          <p style={{ color: "#eddde1", maxWidth: 660, margin: "0 auto 20px", lineHeight: 1.6 }}>Send the scope. We will confirm the appropriate service lane, pricing, fulfillment requirements and next available step.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link to="/request-service?channelType=B2B_APT" style={{ background: "white", color: "#6b1426", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>Request Property Support</Link>
            <a href="tel:+14704857173" style={{ border: "1px solid #ead5da", color: "white", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>(470) 485-7173</a>
          </div>
        </section>
      </main>
    </div>
  );
}

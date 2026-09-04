import React from "react";
import { Link } from "react-router-dom";

const entryServices = [
  ["Common-area cleaning", "Hallways, stairwells, laundry rooms, leasing offices, clubhouses and shared spaces."],
  ["Unit turns & make-ready", "Vacant-unit cleaning, deep resets, punch-list coordination and move-in readiness."],
  ["Property inspections & photo logs", "Visual condition checks, before/after documentation and site-status reporting."],
  ["Handyman & punch-list support", "Minor repair and make-ready support routed only through qualified fulfillment lanes."],
  ["Resident move-in support", "Welcome packets, resident kits, move-in materials and community-specific resident concierge access."],
  ["Ongoing property operations", "Recurring service coordination, facility support, resident-experience programs and account retainers."],
];

const starterRates = [
  ["Standard 1-2BR Unit Turn", "$350 / unit"],
  ["Deep Move-In / Reset", "$450 / unit"],
  ["Minimum Maintenance Dispatch", "$85 / call"],
  ["Commercial Handyman", "$55 / hour"],
  ["Half-Day Punch List", "$200 / 4 hours"],
  ["Full-Day Facility Blitz", "$375 / 8 hours"],
  ["Property Inspection / Photo Log", "$125 / visit"],
  ["Resident Welcome Packet", "$8.50 / packet"],
  ["Custom Resident Welcome Kit", "$75 / package"],
];

const retainers = [
  ["Property Support", "$1,500 / month"],
  ["Resident Experience", "$3,250 / month"],
  ["Operations Partner", "$4,500 / month"],
];

export default function PropertyPage() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#211417", background: "#fbf8f4", minHeight: "100vh" }}>
      <section style={{ background: "linear-gradient(135deg,#250b12,#5b1424)", color: "white", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 24 }}>
          <div style={{ color: "#d7b980", textTransform: "uppercase", letterSpacing: 3, fontSize: 12, fontWeight: 800 }}>CH02 - Property Management & Apartments</div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem,6vw,4.6rem)", lineHeight: 1.02 }}>Start small. Prove the work. Expand the account.</h1>
          <p style={{ maxWidth: 790, fontSize: 19, lineHeight: 1.65, color: "#eadfe0", margin: 0 }}>
            DANI DECLARES gives apartment communities one operating partner for the recurring work that keeps units, common areas, resident experience and property documentation moving.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/request-service" style={{ background: "#d7b980", color: "#2a0b12", padding: "14px 22px", borderRadius: 7, fontWeight: 800, textDecoration: "none" }}>Request a property quote</Link>
            <a href="mailto:vendors@danideclares.com?subject=Property%20Vendor%20Conversation" style={{ border: "1px solid #d7b980", color: "white", padding: "14px 22px", borderRadius: 7, fontWeight: 700, textDecoration: "none" }}>Email vendor team</a>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3.5rem 1.5rem 5rem" }}>
        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2.4, fontWeight: 800, color: "#7a2637" }}>Low-friction entry services</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 10px" }}>Give us one problem first.</h2>
          <p style={{ maxWidth: 760, color: "#66565a", lineHeight: 1.7 }}>You do not have to begin with a large contract. Start with one hallway, one office, one unit turn, one punch list or one inspection. We document the work, build the relationship and expand only where it creates value.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginTop: 22 }}>
            {entryServices.map(([title, text]) => <article key={title} style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 10, padding: 20 }}><h3 style={{ margin: "0 0 8px", color: "#66192b" }}>{title}</h3><p style={{ margin: 0, lineHeight: 1.6, color: "#6c5c60" }}>{text}</p></article>)}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20, marginBottom: 48 }}>
          <div style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#7a2637", fontWeight: 800 }}>Established commercial menu</div>
            <h2 style={{ fontFamily: "Georgia, serif", margin: "8px 0 18px" }}>Starter rates</h2>
            <div>{starterRates.map(([label, price]) => <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "11px 0", borderBottom: "1px solid #eee5e0" }}><span>{label}</span><strong style={{ whiteSpace: "nowrap", color: "#66192b" }}>{price}</strong></div>)}</div>
            <p style={{ fontSize: 12, color: "#7a6a6e", lineHeight: 1.5, marginTop: 16 }}>Final scope may change for size, condition, materials, access, travel, regulated work or special requirements. Materials are handled separately where applicable.</p>
          </div>
          <div style={{ background: "#2a0b12", color: "white", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#d7b980", fontWeight: 800 }}>Account expansion</div>
            <h2 style={{ fontFamily: "Georgia, serif", margin: "8px 0 18px" }}>Recurring property relationships</h2>
            {retainers.map(([label, price]) => <div key={label} style={{ padding: "15px 0", borderBottom: "1px solid #60323c" }}><div style={{ fontWeight: 800, fontSize: 18 }}>{label}</div><div style={{ color: "#d7b980", marginTop: 4 }}>{price}</div></div>)}
            <p style={{ color: "#dbcdd0", lineHeight: 1.6, marginTop: 18 }}>Retainers are separate CH02 commercial relationships. Scope is defined by property need, service mix, capacity and fulfillment readiness.</p>
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
            <Link to="/request-service" style={{ background: "white", color: "#6b1426", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>Request service</Link>
            <a href="tel:+14704857173" style={{ border: "1px solid #ead5da", color: "white", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}>(470) 485-7173</a>
          </div>
        </section>
      </main>
    </div>
  );
}

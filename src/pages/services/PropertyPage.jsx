import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const MENU = [
  { category: "Turnover & Make-Ready", problem: "Compress the turn window and get a vacant unit back toward leasing-ready condition.", skus: ["DNI-02A-025", "DNI-02A-026", "DNI-02A-027"] },
  { category: "Eviction / Abandonment Recovery", problem: "Coordinate the operational response when a unit must be cleared, secured and documented under a compressed timeline.", composed: true },
  { category: "Property Condition & Documentation", problem: "Create independent, timestamped condition evidence for move-in, move-out and damage records.", skus: ["DNI-02A-031", "DNI-02A-029", "DNI-02A-033"] },
  { category: "Pre-Audit Property Readiness", problem: "Prepare the physical property and documentation picture before an inspection or readiness review.", skus: ["DNI-03A-015", "DNI-02A-017", "DNI-02A-024"] },
  { category: "Property Operations Dispatch", problem: "Resolve structured field tasks that are too small for a major contractor but still require accountable execution.", skus: ["DNI-02A-023", "DNI-02A-034", "DNI-02A-035", "DNI-02A-036"] },
  { category: "Property Logistics", problem: "Keep leasing and maintenance teams from losing productive hours to structured property errands and document movement.", skus: ["DNI-02A-036"] },
  { category: "Administrative Operations Support", problem: "Clear leasing-office backlogs, records drift and compliance tracking work.", skus: ["DNI-04A-036", "DNI-04A-040", "DNI-04A-017", "DNI-04A-039"] },
  { category: "Recurring Property Operations Support", problem: "Build predictable operational support around a property's recurring needs.", skus: ["DNI-04A-034"] },
  { category: "Vendor Coordination", problem: "Keep property teams from becoming the dispatcher between multiple outside vendors.", skus: ["DNI-02A-020"] },
];

const priceLabel = (service) => {
  if (!service) return "Request a quote";
  if (service.publicPriceDisplay) return service.publicPriceDisplay;
  if (service.baseCustomerPrice != null) {
    const value = Number(service.baseCustomerPrice);
    return service.model === "RECURRING"
      ? `Starting at $${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} / month`
      : `Starting at $${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
  return "Request a quote";
};

const requestLink = (sku) => "/request-service?channelType=B2B_APT&service=" + encodeURIComponent(sku);

export default function PropertyPage() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/verify-commercial-intent?catalog=1")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "We could not load the property catalog.");
        setCatalog(data.services || []);
      })
      .catch((err) => setError(err.message || "We could not load the property catalog."))
      .finally(() => setLoading(false));
  }, []);

  const catalogBySku = useMemo(() => new Map(catalog.map((service) => [service.serviceId, service])), [catalog]);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#211417", background: "#fbf8f4", minHeight: "100vh" }}>
      <section style={{ background: "linear-gradient(135deg,#250b12,#5b1424)", color: "white", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 22 }}>
          <div style={{ color: "#d7b980", textTransform: "uppercase", letterSpacing: 3, fontSize: 12, fontWeight: 800 }}>Property Management & Apartments</div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem,6vw,4.6rem)", lineHeight: 1.02 }}>Property Operations</h1>
          <p style={{ maxWidth: 800, fontSize: 19, lineHeight: 1.65, color: "#eadfe0", margin: 0 }}>
            Outcome-based support for apartment and property-management teams: turnover, condition documentation, field dispatch, office rescue and coordinated property operations.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/request-service?channelType=B2B_APT" style={{ background: "#d7b980", color: "#2a0b12", padding: "14px 22px", borderRadius: 7, fontWeight: 800, textDecoration: "none" }}>Request Property Support</Link>
            <a href="tel:+14704857173" style={{ border: "1px solid #d7b980", color: "white", padding: "14px 22px", borderRadius: 7, fontWeight: 700, textDecoration: "none" }}>Call (470) 485-7173</a>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3.5rem 1.5rem 5rem" }}>
        <section style={{ marginBottom: 42 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2.4, fontWeight: 800, color: "#7a2637" }}>The Property Operations Menu</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 10px" }}>Start with the outcome. We’ll scope the work and confirm the quote.</h2>
          <p style={{ maxWidth: 820, color: "#66565a", lineHeight: 1.7, margin: 0 }}>
            This is the property-management menu—not the resident cleaning catalog. The outcome menu is fixed; service names and current pricing are read from the governed commercial catalog so this page cannot quietly drift from the quote system.
          </p>
        </section>

        {loading && <div style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 22, color: "#66565a", marginBottom: 28 }}>Loading the current property catalog…</div>}
        {error && <div style={{ background: "#fff4f4", border: "1px solid #efcaca", borderRadius: 12, padding: 22, color: "#8b1e2e", marginBottom: 28 }}>{error}</div>}

        {!loading && !error && (
          <div style={{ display: "grid", gap: 30 }}>
            {MENU.map((section) => {
              const services = (section.skus || []).map((sku) => catalogBySku.get(sku)).filter(Boolean);
              if (!section.composed && services.length === 0) return null;
              return (
                <section key={section.category} style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 26 }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#9a741f", fontWeight: 800 }}>Property solution</div>
                  <h2 style={{ fontFamily: "Georgia, serif", color: "#5b1424", fontSize: 28, margin: "7px 0 8px" }}>{section.category}</h2>
                  <p style={{ color: "#66565a", lineHeight: 1.6, maxWidth: 780, marginTop: 0 }}>{section.problem}</p>

                  {section.composed ? (
                    <>
                      <div style={{ background: "#f7f1ec", borderRadius: 9, padding: 18, marginTop: 18, color: "#5b1424", lineHeight: 1.6 }}>
                        A composed response may combine trash-out coordination, access logistics, condition documentation and turnover work. We will scope the actual property situation instead of pretending a multi-vendor emergency is one generic SKU.
                      </div>
                      <Link to="/request-service?channelType=B2B_APT" style={{ display: "inline-flex", marginTop: 16, background: "#6b1426", color: "white", padding: "11px 15px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}>Request Emergency Property Quote</Link>
                    </>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12, marginTop: 18 }}>
                      {services.map((service) => (
                        <article key={service.serviceId} style={{ border: "1px solid #eee5e0", borderRadius: 9, padding: 18, background: "#fdfbf9" }}>
                          <div style={{ fontSize: 11, color: "#80666b", letterSpacing: 1, fontWeight: 800 }}>{service.serviceId}</div>
                          <h3 style={{ margin: "6px 0 8px", color: "#66192b", fontSize: 19 }}>{service.name}</h3>
                          <div style={{ fontWeight: 900, color: "#5b1424", marginBottom: 14 }}>{priceLabel(service)}</div>
                          <Link to={requestLink(service.serviceId)} style={{ display: "inline-block", background: "#6b1426", color: "white", padding: "10px 14px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}>Request a Quote</Link>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        <section style={{ marginTop: 40, background: "#f7f1ec", borderRadius: 12, padding: 26 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#7a2637", fontWeight: 800 }}>What happens next</div>
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

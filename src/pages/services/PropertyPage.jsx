import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const serviceGroup = (name = "") => {
  const n = name.toLowerCase();
  if (/turn|make-ready|move-in|move-out|vacant/.test(n)) return "Turnover & Make-Ready";
  if (/clean|reset|amenity|office|common area|supply/.test(n)) return "Cleaning & Property Readiness";
  if (/inspection|photo|condition|documentation|verification|status/.test(n)) return "Inspections & Documentation";
  if (/vendor|handyman|punch|work order|field|courier|notice|run|support/.test(n)) return "Field & Vendor Support";
  if (/resident|leasing|packet|document collection/.test(n)) return "Resident & Leasing Support";
  return "Property Operations";
};

const groupOrder = [
  "Turnover & Make-Ready",
  "Cleaning & Property Readiness",
  "Inspections & Documentation",
  "Field & Vendor Support",
  "Resident & Leasing Support",
  "Property Operations",
];

const priceLabel = (service) => {
  if (service?.model === "VARIABLE_QUOTE" || service?.model === "SOW" || service?.model === "SOW_PROCUREMENT" || service?.model === "QUOTE") {
    return "Quote required";
  }
  if (service?.publicPriceDisplay) return service.publicPriceDisplay;
  if (service?.baseCustomerPrice != null) return `Starting at $${Number(service.baseCustomerPrice).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return "Request a quote";
};

export default function PropertyPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/verify-commercial-intent?catalog=1")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "We could not load property services.");
        setServices(
          (data.services || [])
            .filter((service) => service.division === "02" && service.commercialOfferStatus === "SELL_NOW")
            .sort((a, b) => String(a.name).localeCompare(String(b.name)))
        );
      })
      .catch((err) => setError(err.message || "We could not load property services."))
      .finally(() => setLoading(false));
  }, []);

  const groupedServices = useMemo(() => {
    const groups = new Map();
    services.forEach((service) => {
      const group = serviceGroup(service.name);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(service);
    });
    return groupOrder
      .filter((group) => groups.has(group))
      .map((group) => ({ group, services: groups.get(group) }));
  }, [services]);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#211417", background: "#fbf8f4", minHeight: "100vh" }}>
      <section style={{ background: "linear-gradient(135deg,#250b12,#5b1424)", color: "white", padding: "5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 24 }}>
          <div style={{ color: "#d7b980", textTransform: "uppercase", letterSpacing: 3, fontSize: 12, fontWeight: 800 }}>
            Property Management & Apartments
          </div>
          <h1 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem,6vw,4.6rem)", lineHeight: 1.02 }}>
            Property operations, built around the work you actually need handled.
          </h1>
          <p style={{ maxWidth: 790, fontSize: 19, lineHeight: 1.65, color: "#eadfe0", margin: 0 }}>
            Start with one property need, one unit, one inspection or one field assignment. DANI DECLARES can scope the work, coordinate the appropriate fulfillment lane and build the relationship from there.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              to="/request-service?channelType=B2B_APT"
              style={{ background: "#d7b980", color: "#2a0b12", padding: "14px 22px", borderRadius: 7, fontWeight: 800, textDecoration: "none" }}
            >
              Request Property Support
            </Link>
            <a
              href="tel:+14704857173"
              style={{ border: "1px solid #d7b980", color: "white", padding: "14px 22px", borderRadius: 7, fontWeight: 700, textDecoration: "none" }}
            >
              Call (470) 485-7173
            </a>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "3.5rem 1.5rem 5rem" }}>
        <section style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2.4, fontWeight: 800, color: "#7a2637" }}>
            Property Operations
          </div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "8px 0 10px" }}>
            Choose the work. We’ll confirm the scope and quote.
          </h2>
          <p style={{ maxWidth: 790, color: "#66565a", lineHeight: 1.7 }}>
            These options are loaded from DANI DECLARES’ governed property catalog rather than a separate website price list. Select the service that best matches the need and we’ll collect the property details required to quote it.
          </p>

          {loading && (
            <div style={{ marginTop: 22, background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 22, color: "#66565a" }}>
              Loading current property services…
            </div>
          )}

          {error && (
            <div style={{ marginTop: 22, background: "#fff4f4", border: "1px solid #efcaca", borderRadius: 12, padding: 22, color: "#8b1e2e" }}>
              {error}
            </div>
          )}

          {!loading && !error && groupedServices.length === 0 && (
            <div style={{ marginTop: 22, background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 22, color: "#66565a" }}>
              Property service options are being reconciled. You can still send the property scope through Request Property Support.
            </div>
          )}

          <div style={{ display: "grid", gap: 34, marginTop: 28 }}>
            {groupedServices.map(({ group, services: groupServices }) => (
              <section key={group}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 26, margin: "0 0 14px", color: "#5b1424" }}>{group}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 14 }}>
                  {groupServices.map((service) => (
                    <article
                      key={service.serviceId}
                      style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column" }}
                    >
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, color: "#9a741f" }}>
                        Property service
                      </div>
                      <h4 style={{ margin: "7px 0 8px", color: "#66192b", fontSize: 20 }}>{service.name}</h4>
                      <p style={{ margin: 0, lineHeight: 1.55, color: "#6c5c60", flex: 1 }}>
                        {service.description || "Property operations support scoped to the requested work."}
                      </p>
                      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #eee5e0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#6b1426" }}>{priceLabel(service)}</span>
                        <Link
                          to={"/request-service?channelType=B2B_APT&service=" + encodeURIComponent(service.serviceId)}
                          style={{ background: "#6b1426", color: "white", padding: "10px 14px", borderRadius: 7, textDecoration: "none", fontWeight: 900, whiteSpace: "nowrap" }}
                        >
                          Request a Quote
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <div style={{ background: "white", border: "1px solid #e4d9d3", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#7a2637", fontWeight: 800 }}>
              How property quoting works
            </div>
            <h2 style={{ fontFamily: "Georgia, serif", margin: "8px 0 14px" }}>Start small. Prove the work. Expand the account.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
              {[
                ["1", "Choose the service or describe the property need."],
                ["2", "Tell us the property, location, quantities, condition and timing."],
                ["3", "We confirm scope, availability and the appropriate quote path."],
                ["4", "We handle and document the work."],
                ["5", "Expand support when the relationship proves useful."],
              ].map(([number, text]) => (
                <div key={number} style={{ background: "#f7f1ec", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#8d6418" }}>{number}</div>
                  <div style={{ marginTop: 5, fontWeight: 800, color: "#5b1424" }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: "#2a0b12", color: "white", borderRadius: 12, padding: 28, marginBottom: 48 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#d7b980", fontWeight: 800 }}>Ongoing support</div>
          <h2 style={{ fontFamily: "Georgia, serif", margin: "8px 0 12px" }}>Build a relationship that grows with the property.</h2>
          <p style={{ color: "#dbcdd0", lineHeight: 1.6, maxWidth: 760 }}>
            For recurring relationships, we review the property's needs, service mix and expected cadence before presenting a tailored proposal.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 18 }}>
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
          <Link
            to="/request-service?channelType=B2B_APT"
            style={{ display: "inline-flex", marginTop: 20, background: "#d7b980", color: "#2a0b12", padding: "11px 16px", borderRadius: 7, textDecoration: "none", fontWeight: 900 }}
          >
            Discuss Ongoing Support
          </Link>
        </section>

        <section style={{ textAlign: "center", background: "#6b1426", color: "white", padding: "38px 24px", borderRadius: 12 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, margin: "0 0 10px" }}>Need something handled this week?</h2>
          <p style={{ color: "#eddde1", maxWidth: 660, margin: "0 auto 20px", lineHeight: 1.6 }}>
            Send the property scope. We’ll confirm the appropriate service, availability and next step.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link
              to="/request-service?channelType=B2B_APT"
              style={{ background: "white", color: "#6b1426", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}
            >
              Request Property Support
            </Link>
            <a
              href="tel:+14704857173"
              style={{ border: "1px solid #ead5da", color: "white", padding: "13px 20px", borderRadius: 7, textDecoration: "none", fontWeight: 800 }}
            >
              (470) 485-7173
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

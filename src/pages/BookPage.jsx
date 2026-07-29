import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import TidyCalEmbed from "../components/TidyCalEmbed.jsx";
import { bookingServices } from "../data/services.js";
import { buildTidyCalPath, buildTidyCalUrl } from "../data/tidycal.js";
import "./BookPage.css";

const getSelectedService = (serviceId) =>
  bookingServices.find((service) => service.id === serviceId);

export default function BookPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("service");

  const selectedService = useMemo(
    () => getSelectedService(selectedId),
    [selectedId]
  );

  const displayedServices = useMemo(() => {
    if (selectedService) {
      return [selectedService];
    }
    return bookingServices;
  }, [selectedService]);

  return (
    <>
      <Helmet>
        <title>Book Appointment &amp; Schedule Service • Dani Declares LLC</title>
        <meta
          name="description"
          content="Schedule mobile notary, apostille, loan signing, and legal compliance appointments with Dani Declares LLC."
        />
      </Helmet>

      <main className="book-page">
        {/* Hero Banner */}
        <header className="book-hero" style={{ backgroundColor: "#8B1E2E", color: "#fff", padding: "60px 20px 40px 20px", textAlign: "center", borderBottom: "5px solid #D4AF37" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <p className="eyebrow" style={{ color: "#D4AF37", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>
              Time-Specific Appointments
            </p>
            <h1 style={{ fontSize: "36px", fontWeight: "800", margin: "0 0 12px 0" }}>Schedule Your Appointment</h1>
            <p style={{ fontSize: "16px", opacity: 0.9, lineHeight: "1.5", marginBottom: "24px" }}>
              Select a time slot below for mobile notary signings, living trust execution, or apostille coordination.
            </p>

            <div style={{ display: "inline-flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link
                to="/request-service"
                style={{
                  backgroundColor: "#D4AF37",
                  color: "#111",
                  padding: "10px 24px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  fontSize: "14px",
                  textDecoration: "none"
                }}
              >
                Need a Custom Project Quote Instead? Click Here &rarr;
              </Link>
            </div>
          </div>
        </header>

        {/* Appointment Filtering Chips */}
        <section className="book-service-selector" style={{ padding: "30px 20px", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", margin: 0 }}>Select Appointment Category:</h2>
            {selectedService && (
              <button
                onClick={() => setSearchParams({})}
                style={{ backgroundColor: "#E5E0DA", border: "none", padding: "6px 14px", borderRadius: "4px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
              >
                ✕ View All Appointment Types
              </button>
            )}
          </div>

          <div className="service-chip-grid" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {bookingServices.map((service) => (
              <button
                key={service.id}
                onClick={() => setSearchParams({ service: service.id })}
                className={`service-chip ${selectedService?.id === service.id ? "active" : ""}`}
                style={{
                  padding: "10px 18px",
                  borderRadius: "20px",
                  border: selectedService?.id === service.id ? "2px solid #8B1E2E" : "1px solid #CCC",
                  backgroundColor: selectedService?.id === service.id ? "#8B1E2E" : "#fff",
                  color: selectedService?.id === service.id ? "#fff" : "#333",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                {service.title}
              </button>
            ))}
          </div>
        </section>

        {/* Calendar Embeds */}
        <section className="booking-embeds" style={{ padding: "20px 20px 60px 20px", maxWidth: "1000px", margin: "0 auto" }}>
          {displayedServices.map((service) => {
            const tidycalPath = buildTidyCalPath(service.tidycalSlug);
            const tidycalUrl = buildTidyCalUrl(service.tidycalSlug);

            return (
              <article
                key={service.id}
                id={`booking-${service.id}`}
                className="booking-card"
                style={{ backgroundColor: "#fff", border: "1px solid #E5E0DA", borderRadius: "8px", padding: "28px", marginBottom: "30px", boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}
              >
                <div className="booking-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px", borderBottom: "1px solid #EEE", pb: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "22px", color: "#8B1E2E", margin: "0 0 6px 0", fontWeight: "700" }}>{service.title}</h3>
                    <p style={{ color: "#555", margin: 0, fontSize: "15px" }}>{service.shortDescription}</p>
                  </div>
                  {service.priceLabel && (
                    <span className="price-pill" style={{ backgroundColor: "#D4AF37", color: "#111", padding: "6px 14px", borderRadius: "16px", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap" }}>
                      {service.priceLabel}
                    </span>
                  )}
                </div>

                <div className="booking-card__primary" style={{ marginBottom: "24px" }}>
                  <a
                    className="btn btn--primary btn--block"
                    href={tidycalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", textAlign: "center", backgroundColor: "#8B1E2E", color: "#fff", padding: "12px", borderRadius: "6px", fontWeight: "700", textDecoration: "none", fontSize: "15px" }}
                  >
                    Book Appointment on TidyCal &rarr;
                  </a>
                  <p className="booking-card__note" style={{ fontSize: "12px", color: "#777", textAlign: "center", marginTop: "8px" }}>
                    Appointments are pending until payment is completed.
                  </p>
                </div>

                <div className="booking-card__embed" style={{ marginBottom: "24px", minHeight: "350px", backgroundColor: "#FAF7F4", padding: "16px", borderRadius: "6px" }}>
                  <TidyCalEmbed path={tidycalPath} />
                  <div className="booking-card__fallback" style={{ marginTop: "16px", textAlign: "center" }}>
                    <p style={{ fontSize: "13px", color: "#666" }}>
                      If the embedded calendar does not load, use the direct link below:
                    </p>
                    <a
                      className="btn btn--secondary btn--block"
                      href={tidycalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-block", backgroundColor: "#E5E0DA", color: "#111", padding: "8px 20px", borderRadius: "4px", fontWeight: "600", textDecoration: "none", fontSize: "13px" }}
                    >
                      Open TidyCal Scheduling Window
                    </a>
                  </div>
                </div>

                <div className="booking-card__payment" style={{ backgroundColor: "#F8F5F1", padding: "20px", borderRadius: "6px", borderLeft: "4px solid #D4AF37" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#111" }}>Step 2 — Complete Payment to Confirm</h4>
                  <p style={{ fontSize: "14px", color: "#555", margin: "0 0 12px 0" }}>
                    After selecting your appointment time above, complete payment to hold your reservation time slot.
                  </p>
                  <a 
                    href={`/pay?service=${service.id}`}
                    style={{ display: "inline-block", backgroundColor: "#8B1E2E", color: "#fff", padding: "10px 20px", borderRadius: "4px", fontWeight: "700", textDecoration: "none", fontSize: "14px" }}
                  >
                    Proceed to Checkout Page &rarr;
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}

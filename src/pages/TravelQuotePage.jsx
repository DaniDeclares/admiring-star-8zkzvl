import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { travelFeeDefaults } from "../data/services.js";
import ServiceCta from "../components/ServiceCta.jsx";
import "./TravelQuotePage.css";

export default function TravelQuotePage() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!address.trim()) {
      setError("Please enter a destination address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/travel-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationAddress: address.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to calculate travel fee.");
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="travel-quote-page">
      <Helmet>
        <title>Travel Fee Calculator • Dani Declares</title>
        <meta
          name="description"
          content="Calculate your travel fee using Google-based mileage for mobile services."
        />
      </Helmet>

      <header className="travel-quote-hero">
        <h1>Calculate Your Travel Fee</h1>
        <p>
          Enter the destination address to get an instant travel fee estimate
          for mobile notary, real estate, and officiant services.
        </p>
      </header>

      <section className="travel-quote-form">
        <form onSubmit={handleSubmit}>
          <label htmlFor="destination-address">Destination address</label>
          <input
            id="destination-address"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="123 Main St, City, State"
          />
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Calculating..." : "Calculate travel fee"}
          </button>
        </form>

        {error && <p className="travel-quote-error">{error}</p>}

        {result && (
          <div className="travel-quote-result">
            <h2>Travel fee breakdown</h2>
            <ul>
              <li>Base travel fee: ${travelFeeDefaults.baseTravelFee}</li>
              <li>
                Billable miles: {result.billableMiles} mi (round trip)
              </li>
              <li>Rate: ${travelFeeDefaults.mileageRate.toFixed(2)} per mile</li>
            </ul>
            <p className="travel-quote-total">
              Total travel fee: <strong>${result.travelFee}</strong>
            </p>
            <p className="travel-quote-note">
              Includes the first {travelFeeDefaults.baseRadiusMiles} miles round trip.
            </p>
          </div>
        )}
      </section>

      <ServiceCta
        serviceId="notary"
        bookingLabel="Book a Mobile Appointment"
      />
    </main>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { travelFeeDefaults } from "../data/services.js";
import "./TravelFeesBlock.css";

export default function TravelFeesBlock() {
  return (
    <section className="travel-fees">
      <h2>Travel & Fees</h2>
      <p>{travelFeeDefaults.note}</p>
      <ul>
        <li>Base travel fee: ${travelFeeDefaults.baseTravelFee}</li>
        <li>Included radius: first {travelFeeDefaults.baseRadiusMiles} miles round trip</li>
        <li>Additional mileage: ${travelFeeDefaults.mileageRate.toFixed(2)} per mile</li>
      </ul>
      <Link to="/travel-quote" className="btn btn--secondary">
        Calculate travel fee
      </Link>
    </section>
  );
}

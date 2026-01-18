import React from "react";
import { Helmet } from "react-helmet-async";
import "./PackagesPage.css";
import { SHOW_FESTIVAL } from "../data/siteConfig.js";
import {
  getServiceSections,
  serviceBundles,
  servicePages,
} from "../data/services.js";
import TravelFeesBlock from "../components/TravelFeesBlock.jsx";
import ServiceCta from "../components/ServiceCta.jsx";

export default function PackagesPage() {
  const categories = getServiceSections(servicePages.packages);

  return (
    <main className="packages-page">
      <Helmet>
        <title>All Services & Pricing • Dani Declares</title>
        <meta
          name="description"
          content={
            SHOW_FESTIVAL
              ? "Explore Dani Declares full service catalog: notary, real estate, legal, wedding, financial, festival, merch & bundles."
              : "Explore Dani Declares full service catalog: notary, real estate, legal, wedding, financial, merch & bundles."
          }
        />
      </Helmet>

      <header className="packages-hero">
        <h1>All Services & Pricing</h1>
        <p>Browse every service and package offered by Dani Declares LLC.</p>
      </header>

      {categories.map((category) => (
        <section key={category.id} className="category-section">
          <h2>{category.title}</h2>
          <p className="category-desc">{category.description}</p>
          <div className="items-grid">
            {category.items.map((item) => (
              <div key={item.name} className="item-card">
                <h3>{item.name}</h3>
                <p className="price">{item.price}</p>
                {item.details && <p className="notes">{item.details}</p>}
              </div>
            ))}
          </div>
          {category.addOns && (
            <div className="category-addons">
              <h3>Add-ons</h3>
              <ul>
                {category.addOns.map((addon) => (
                  <li key={addon.name}>
                    {addon.name}: <strong>{addon.price}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}

      <TravelFeesBlock />

      {serviceBundles.length > 0 && (
        <section className="bundles-section">
          <h2>Bundled Packages</h2>
          <div className="bundles-grid">
            {serviceBundles.map((bundle) => (
              <div key={bundle.name} className="bundle-card">
                <h3>{bundle.name}</h3>
                <p className="bundle-price">{bundle.price}</p>
                <p className="bundle-notes">Includes: {bundle.includes}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <ServiceCta
        serviceId="notary"
        bookingLabel="Book an Appointment"
      />
    </main>
  );
}

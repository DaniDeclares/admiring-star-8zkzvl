import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { SEO_LANDING_PAGES } from "../data/seoLandingPagesData.js";
import ServiceCta from "../components/ServiceCta.jsx";

export default function SeoLandingPage() {
  const { slug } = useParams();
  const page = SEO_LANDING_PAGES.find((entry) => entry.slug === slug);

  if (!page) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Service area page not found</h1>
        <p className="mt-4">Return to our <Link className="underline" to="/services">services</Link>.</p>
      </main>
    );
  }

  const canonical = `https://danideclares.com/service-areas/${page.slug}`;
  const description = page.description;
  const serviceType = page.serviceName;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonical}#service`,
    name: serviceType,
    serviceType,
    description,
    url: canonical,
    provider: { "@id": "https://danideclares.com/#organization" },
    areaServed: { "@type": "Place", name: page.targetCity }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://danideclares.com/" },
      { "@type": "ListItem", position: 2, name: "Service Areas", item: "https://danideclares.com/services" },
      { "@type": "ListItem", position: 3, name: page.title, item: canonical }
    ]
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <nav aria-label="Breadcrumb" className="mb-8 text-sm">
        <Link className="underline" to="/">Home</Link>
        <span className="mx-2">/</span>
        <Link className="underline" to="/services">Services</Link>
        <span className="mx-2">/</span>
        <span>{page.targetCity}</span>
      </nav>

      <header>
        <p className="text-sm font-semibold uppercase tracking-wide">DANI DECLARES LLC</p>
        <h1 className="mt-2 text-4xl font-bold">{page.title.replace(" | DANI DECLARES", "")}</h1>
        <p className="mt-5 max-w-3xl text-lg">{description}</p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">What we handle</h2>
          <p className="mt-3">
            DANI DECLARES coordinates the scope, timing, execution and evidence needed for the requested service.
            Availability, final scope and pricing are confirmed before work begins.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Service area</h2>
          <p className="mt-3">{page.targetCity}</p>
          <p className="mt-2 text-sm">Travel and service-area requirements are confirmed during intake.</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Common questions</h2>
        <div className="mt-4 space-y-4">
          {page.faqs.map((faq) => (
            <details key={faq.q} className="rounded border p-4">
              <summary className="cursor-pointer font-semibold">{faq.q}</summary>
              <p className="mt-3">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <ServiceCta />
      </section>
    </main>
  );
}

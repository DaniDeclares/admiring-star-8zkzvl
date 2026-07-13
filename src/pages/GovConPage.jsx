import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../data/siteConfig.js";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import { isValidEmail, submitLeadIntake } from "../lib/secureIntake.js";
import "./GovConPage.css";

const initialForm = {
  primeCompanyName: "",
  corporateEmail: "",
  solicitationNumber: "",
  scopingNotes: "",
};

const corporateIdentificationRows = [
  ["Legal Entity Name", "Dani Declares LLC"],
  ["State of Incorporation", "Georgia"],
  ["Target Service Footprint", "Georgia, South Carolina"],
  ["SAM.gov Registration Status", "[Pending Verification]"],
  ["CAGE Code", "[Pending Verification or Assignment]"],
  ["UEI Number", "[Pending Verification]"],
];

const capabilities = [
  "Office administrative support",
  "Document preparation and lifecycle support",
  "Project coordination and vendor readiness support",
  "Local operational coordination",
];

const buildInquirySummary = (form) =>
  [
    `Prime Company Name: ${form.primeCompanyName}`,
    `Corporate Email: ${form.corporateEmail}`,
    `Solicitation Number: ${form.solicitationNumber}`,
    `Scoping Notes: ${form.scopingNotes}`,
  ].join("\n");

export default function GovConPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [referenceCode, setReferenceCode] = useState("");

  const vendorEmail = siteConfig.emails.vendor;
  const successMessage = useMemo(
    () =>
      `Your teaming inquiry was received. Dani Declares will follow up using the corporate email provided. For alternate outreach, email ${vendorEmail}.`,
    [vendorEmail]
  );
  const submissionUnavailableMessage = useMemo(
    () =>
      `Teaming inquiry submission is temporarily unavailable. Please email ${vendorEmail}.`,
    [vendorEmail]
  );
  const saveErrorMessage = useMemo(
    () =>
      `We couldn't save your teaming inquiry right now. Please try again or email ${vendorEmail}.`,
    [vendorEmail]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    setReferenceCode("");

    if (!isValidEmail(form.corporateEmail)) {
      setStatus("error");
      setMessage("Enter a valid corporate email address.");
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage(submissionUnavailableMessage);
      return;
    }

    try {
      const inquirySummary = buildInquirySummary(form);
      const lead = await submitLeadIntake({
        contextTag: "govcon_teaming_inquiry",
        leadPayload: {
          full_name: "GovCon Teaming Inquiry",
          organization_name: form.primeCompanyName,
          email: form.corporateEmail,
          source_text: "GovCon Teaming Inquiry",
          status: "new",
          notes: inquirySummary,
        },
        requestPayload: {
          service_needed: "GovCon Teaming Inquiry",
          request_details: inquirySummary,
          status: "new",
          priority: "normal",
        },
      });

      if (!lead?.id) {
        throw new Error("Missing lead reference");
      }

      const nextReferenceCode = `GOVCON-${String(lead.id)
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 8)
        .toUpperCase()}`;

      setForm(initialForm);
      setStatus("success");
      setMessage(successMessage);
      setReferenceCode(nextReferenceCode);
    } catch {
      setStatus("error");
      setMessage(saveErrorMessage);
    }
  };

  return (
    <>
      <Helmet>
        <title>GovCon Teaming Inquiries | Dani Declares LLC</title>
        <meta
          name="description"
          content="GovCon teaming inquiries for administrative support, document lifecycle support, project coordination, and local operational coordination."
        />
        <link rel="canonical" href="https://danideclares.com/govcon" />
      </Helmet>

      <main className="govcon-page">
        <section className="govcon-hero" aria-labelledby="govcon-title">
          <div className="govcon-shell">
            <p className="govcon-eyebrow">Dani Declares LLC GovCon Sub-Portal</p>
            <h1 id="govcon-title">Vendor Readiness Support for Prime Contractor Teaming</h1>
            <p className="govcon-hero__lead">
              This isolated sub-portal supports business-to-business teaming inquiries for
              administrative support, document lifecycle support, project coordination, and
              local operational coordination across Georgia and South Carolina.
            </p>
          </div>
        </section>

        <section className="govcon-section govcon-section--ivory" aria-labelledby="govcon-corporate-title">
          <div className="govcon-shell govcon-layout">
            <div className="govcon-panel">
              <p className="govcon-section-label">Corporate profile</p>
              <h2 id="govcon-corporate-title">Corporate Identification</h2>
              <div className="govcon-table-wrap">
                <table className="govcon-table" aria-label="Corporate Identification">
                  <tbody>
                    {corporateIdentificationRows.map(([label, value]) => (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="govcon-panel">
              <p className="govcon-section-label">Approved capabilities</p>
              <h2>Capabilities Matrix</h2>
              <ul className="govcon-capabilities" aria-label="Approved service categories">
                {capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="govcon-section govcon-section--burgundy" aria-labelledby="govcon-inquiry-title">
          <div className="govcon-shell govcon-inquiry-layout">
            <div className="govcon-inquiry-copy">
              <p className="govcon-section-label govcon-section-label--light">Teaming inquiries</p>
              <h2 id="govcon-inquiry-title">Structured B2B Intake for Vendor Readiness Support</h2>
              <p>
                Use this form for prime-contractor and partner outreach related to solicitation
                support, teaming alignment, and scoped operational coordination.
              </p>
              <p className="govcon-inquiry-copy__contact">
                Alternate contact: <a href={`mailto:${vendorEmail}`}>{vendorEmail}</a>
              </p>
            </div>

            <form className="govcon-form" onSubmit={handleSubmit} noValidate>
              <label className="govcon-field">
                <span>Prime Company Name</span>
                <input
                  name="primeCompanyName"
                  type="text"
                  value={form.primeCompanyName}
                  onChange={handleChange}
                  autoComplete="organization"
                  required
                />
              </label>

              <label className="govcon-field">
                <span>Corporate Email</span>
                <input
                  name="corporateEmail"
                  type="email"
                  value={form.corporateEmail}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="govcon-field">
                <span>Solicitation Number</span>
                <input
                  name="solicitationNumber"
                  type="text"
                  value={form.solicitationNumber}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="govcon-field govcon-field--full">
                <span>Scoping Notes</span>
                <textarea
                  name="scopingNotes"
                  value={form.scopingNotes}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </label>

              <button className="govcon-submit" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Submitting Inquiry..." : "Submit Teaming Inquiry"}
              </button>

              {message ? (
                <div
                  className={`govcon-form-status govcon-form-status--${status === "success" ? "success" : "error"}`}
                  role="status"
                >
                  <p>{message}</p>
                  {status === "success" && referenceCode ? (
                    <p className="govcon-form-status__reference">Confirmation Reference: {referenceCode}</p>
                  ) : null}
                </div>
              ) : null}
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./PartnerNetwork.module.css"; // kept: its global element styles predate this page
import styles from "./BuildWithMe.module.css";
import { octoberCampaignLink } from "../lib/octoberContentTracks.js";
import { CONSENT_TEXT, INTEREST_AREAS, PARTICIPATION_INTERESTS, hireDaniLink } from "../lib/buildWithMeInterest.js";

const SUBMIT_TIMEOUT_MS = 20000;

const PARTICIPATION_HELP = {
  SERVICE_PROVIDER: "You do the work: cleaning, property, errands, events, notary and more.",
  MAKER_CREATOR: "You make things: design, print, merch, content, products.",
  BUSINESS_PARTNER: "You already run a business and want to work alongside DANI.",
  COMMUNITY_CONTRIBUTOR: "You want to help, share ideas or connect people.",
  SKILL_BUILDER: "You're starting out and want to build skills toward paid work.",
};

function attributionFrom(search, pathname) {
  const params = new URLSearchParams(search);
  const out = { landing_path: pathname };
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"]) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 120);
  }
  out.campaign_code = out.utm_campaign || (pathname.startsWith("/build-with-me") ? "build-with-me" : "");
  return out;
}

export default function PartnerNetwork() {
  const location = useLocation();
  const attribution = useMemo(() => attributionFrom(location.search, location.pathname), [location.search, location.pathname]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", participationInterest: "", interestAreas: [], skillsAndEquipment: "", locationArea: "", message: "", contactConsent: false, website: "" });
  const [state, setState] = useState({ loading: false, error: "", done: null });

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const toggleArea = (area) => set("interestAreas", form.interestAreas.includes(area) ? form.interestAreas.filter(a => a !== area) : [...form.interestAreas, area]);

  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: "", done: null });
    // Never leave the button stuck: abort after SUBMIT_TIMEOUT_MS and say exactly what to do.
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS) : null;
    try {
      const response = await fetch("/api/partner-inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, attribution }), signal: controller?.signal });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.success) throw new Error(body.error || "We could not save your interest.");
      setState({ loading: false, error: "", done: body });
    } catch (err) {
      const message = err?.name === "AbortError" ? "This is taking too long, so we stopped. Your interest may not have been saved." : (err.message || "We could not save your interest.");
      setState({ loading: false, error: `${message} Please try again, or email vendors@danideclares.com.`, done: null });
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Operation $1 Million Dollar Company</p>
          <h1 className={styles.headline}>You can watch me build it, or you can build it with me.</h1>
          <p className={styles.lede}>Start with what you've got. Build toward what you want. Tell DANI DECLARES what you bring, and we'll follow up about where it could fit.</p>
        </header>

        <section className={styles.steps} aria-label="How it works">
          <div className={styles.step}><h3>SEE IT</h3><p>DANI DECLARES handles home, property and business execution across Metro Atlanta and South Carolina.</p></div>
          <div className={styles.step}><h3>WANT IT</h3><p>Skills, equipment, a business or just drive: there are different ways to take part.</p></div>
          <div className={styles.step}><h3>JOIN IT</h3><p>Raise your hand below. It takes about two minutes and no documents.</p></div>
          <div className={styles.step}><h3>GROW WITH IT</h3><p>If there's a fit, we'll guide you through the next steps, including verification for paid service work.</p></div>
        </section>

        <section className={styles.card}>
          <h2>See what DANI does</h2>
          <p className={styles.muted}>Real services and packages, live today.</p>
          <div className={styles.links}>
            <Link to="/services">Services</Link><span aria-hidden="true">·</span>
            <Link to="/packages">Packages</Link><span aria-hidden="true">·</span>
            <Link to="/resident-concierge">Resident concierge</Link><span aria-hidden="true">·</span>
            <Link to="/services/business-solutions">Business solutions</Link>
          </div>
        </section>

        <section className={styles.card} aria-labelledby="hire-title">
          <p className={styles.eyebrow}>For business owners</p>
          <h2 id="hire-title">Let DANI Build You — business-building help for customers</h2>
          <p className={styles.muted}>DANI DECLARES is building its own company in public. We also take on paid work helping other businesses get organized and handled: admin backlog, digital setup, marketing support and day-to-day coordination. Tell us what you need and we'll confirm scope, timing and a quote before any work starts. No outcome or revenue is guaranteed.</p>
          <a className={styles.primaryLink} href={octoberCampaignLink("LET_DANI_BUILD_YOU", { source: attribution.utm_source || "website", medium: attribution.utm_medium || "organic", content: "build-with-dani-page" }) || hireDaniLink(attribution)}>Hire DANI to help build my business →</a>
        </section>

        <section className={styles.card} aria-labelledby="join-title">
          <h2 id="join-title">Build With DANI — providers and collaborators</h2>
          <p className={styles.muted}>This is a first step, not an application or a job offer. Paid service work only comes after DANI's provider application, agreement and verification.</p>

          {state.done ? (
            <div className={styles.success} role="status">
              <strong>Thanks, {form.name.split(" ")[0] || "friend"}. We've got your interest.</strong>
              <p>{state.done.nextStepText || "Danielle's team reviews every submission and will reach out by email if there's a fit."}</p>
              <p>{state.done.duplicate ? "We already have your recent submission, so we won't email you again today." : "We've also emailed you a copy."} Nothing has been promised or scheduled yet.</p>
              {state.done.nextStep && <>
                <p>Ready to go further as a service provider? The full application covers your services, agreement and verification. You can save it and come back.</p>
                <a className={styles.primaryLink} href={state.done.nextStep}>Start the provider application →</a>
              </>}
            </div>
          ) : (
            <form className={styles.form} onSubmit={submit} noValidate>
              {state.error && <div className={styles.error} role="alert">{state.error}</div>}
              <div className={styles.hp} aria-hidden="true"><label>Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => set("website", e.target.value)} /></label></div>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>How would you like to take part?</legend>
                <div className={styles.choices}>
                  {Object.entries(PARTICIPATION_INTERESTS).map(([key, label]) => (
                    <label key={key} className={`${styles.choice} ${form.participationInterest === key ? styles.choiceOn : ""}`}>
                      <input type="radio" name="participationInterest" value={key} checked={form.participationInterest === key} onChange={() => set("participationInterest", key)} />
                      <span><strong>{label}</strong><br /><small>{PARTICIPATION_HELP[key]}</small></span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className={styles.label}>What do you bring? Skills, equipment, experience or a business.
                <textarea className={`${styles.field} ${styles.textarea}`} value={form.skillsAndEquipment} onChange={e => set("skillsAndEquipment", e.target.value)} placeholder="e.g. 3 years residential cleaning, own vacuum and car; or heat press and Canva; or I'm new and want to learn" maxLength={1500} required />
              </label>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Which areas interest you? (optional, pick any)</legend>
                <div className={styles.choices}>
                  {Object.entries(INTEREST_AREAS).map(([key, label]) => (
                    <label key={key} className={`${styles.choice} ${form.interestAreas.includes(key) ? styles.choiceOn : ""}`}>
                      <input type="checkbox" checked={form.interestAreas.includes(key)} onChange={() => toggleArea(key)} /> <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className={styles.row}>
                <label className={styles.label}>Name<input className={styles.field} value={form.name} onChange={e => set("name", e.target.value)} autoComplete="name" required maxLength={120} /></label>
                <label className={styles.label}>Email<input className={styles.field} type="email" value={form.email} onChange={e => set("email", e.target.value)} autoComplete="email" required maxLength={254} /></label>
              </div>
              <div className={styles.row}>
                <label className={styles.label}>Phone (optional)<input className={styles.field} type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} autoComplete="tel" maxLength={40} /></label>
                <label className={styles.label}>City or area<input className={styles.field} value={form.locationArea} onChange={e => set("locationArea", e.target.value)} placeholder="e.g. Decatur, GA" maxLength={120} /></label>
              </div>
              <label className={styles.label}>Anything else? (optional)
                <textarea className={`${styles.field} ${styles.textarea}`} value={form.message} onChange={e => set("message", e.target.value)} maxLength={2000} />
              </label>

              <label className={styles.consent}>
                <input type="checkbox" checked={form.contactConsent} onChange={e => set("contactConsent", e.target.checked)} required />
                <span>{CONSENT_TEXT}</span>
              </label>

              <button className={styles.submit} type="submit" disabled={state.loading}>{state.loading ? "Sending…" : "I want to build with DANI"}</button>
            </form>
          )}
          <p className={styles.fine}>DANI DECLARES LLC does not promise jobs, clients or income. Paid service work requires an approved provider application, signed agreement, tax form and any required documents. See our <Link to="/privacy">privacy policy</Link>.</p>
        </section>
      </div>
    </main>
  );
}

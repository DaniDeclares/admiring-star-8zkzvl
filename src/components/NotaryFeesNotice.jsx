import React from "react";

export default function NotaryFeesNotice({ className = "" }) {
  return (
    <div className={className}>
      <p>
        <strong>Notarial act fees are capped by state law.</strong>
        <br />
        <strong>Georgia (GA):</strong> $2.00 per notarial act.
        <br />
        <strong>South Carolina (SC):</strong> Up to $5.00 per notarial act (fees
        vary by act type; for example, acknowledgments/jurats/signature witnessing
        are $5 per signature).
      </p>
      <p>
        <strong>Mobile service fees (travel/dispatch) are separate from notarial act fees</strong>{" "}
        and are quoted and agreed to in advance. Any printing, courier, or document
        prep fees (if requested) are also disclosed upfront.
      </p>
      <p>
        <strong>Preferred client rates, volume pricing, multi-appointment bundles, and retainers</strong>{" "}
        are available for law firms, tax professionals, and recurring clients for
        mobile/service logistics (notarial act fees remain capped by law). After-hours
        and urgent requests may include an expedited service fee, disclosed before
        booking.
      </p>
    </div>
  );
}

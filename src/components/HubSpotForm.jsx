import React, { useEffect } from "react";
import "./HubSpotForm.css";

export default function HubSpotForm({
  region = "na2",
  portalId = "242764935",
  formId = "d4cd290e-7766-4bf5-91a2-c1274ddd882e",
}) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://js-${region}.hsforms.net/forms/embed/v2.js`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.hbspt) {
        window.hbspt.forms.create({
          region,
          portalId,
          formId,
          target: "#hubspot-form",
        });
      }
    };

    return () => {
      const node = document.querySelector("script[src*='hsforms']");
      if (node) document.body.removeChild(node);
    };
  }, [region, portalId, formId]);

  return <div id="hubspot-form" className="hs-form-frame" />;
}

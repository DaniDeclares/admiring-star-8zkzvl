import React, { useEffect } from "react";
import "./HubSpotForm.css";

export default function HubSpotForm({
  region = "na2",
  portalId = "242764935",
  formId = "d4cd290e-7766-4bf5-91a2-c1274ddd882e",
  targetId = "hubspot-form",
  prefill = {},
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
          target: `#${targetId}`,
          onFormReady: (form) => {
            if (prefill.message) {
              const messageField = form.find(
                "textarea[name='message'], input[name='message'], [name='message']"
              );
              if (messageField && messageField.length) {
                messageField.val(prefill.message);
                messageField.change();
              }
            }
          },
        });
      }
    };

    return () => {
      const node = document.querySelector("script[src*='hsforms']");
      if (node) document.body.removeChild(node);
    };
  }, [region, portalId, formId, targetId, prefill.message]);

  return <div id={targetId} className="hs-form-frame"></div>;
}

import React, { useEffect } from "react";

export default function HubSpotForm({
  region = "na2",
  portalId = "242764935",
  formId = "d4cd290e-7766-4bf5-91a2-c1274ddd882e",
}) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://js-${region}.hsforms.net/forms/embed/${portalId}.js`;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [region, portalId]);

  return (
    <div
      className="hs-form-frame"
      data-region={region}
      data-portal-id={portalId}
      data-form-id={formId}
    />
  );
}

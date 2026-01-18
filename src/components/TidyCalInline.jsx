import React, { useEffect } from "react";

export default function TidyCalInline({ service }) {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[data-tidycal-inline="true"]'
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://asset-tidycal.b-cdn.net/js/embed.js";
    script.async = true;
    script.dataset.tidycalInline = "true";
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ minHeight: 600 }}>
      <tidy-link
        flow={service}
        style={{ display: "block", height: "100%", width: "100%" }}
      />
    </div>
  );
}

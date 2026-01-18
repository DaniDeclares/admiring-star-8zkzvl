import React, { useEffect } from "react";

export default function TidyCalInline({ service }) {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[data-tidycal-embed="true"]'
    );

    if (existingScript) {
      return undefined;
    }

    // Once-only load of TidyCal embed script
    const script = document.createElement("script");
    script.src = "https://asset-tidycal.b-cdn.net/js/embed.js";
    script.async = true;
    script.dataset.tidycalEmbed = "true";
    document.body.appendChild(script);

    return undefined;
  }, []);

  return (
    <div style={{ minHeight: 600 }}>
      {/* The <tidy-link> tag is provided by TidyCal's script */}
      <tidy-link
        flow={service}
        style={{ display: "block", height: "100%", width: "100%" }}
      />
    </div>
  );
}

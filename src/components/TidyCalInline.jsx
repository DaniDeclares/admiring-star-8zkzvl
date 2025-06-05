import React, { useEffect } from "react";

export default function TidyCalInline({ service }) {
  useEffect(() => {
    // Once-only load of TidyCal embed script
    const script = document.createElement("script");
    script.src = "https://assets.tidycal.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
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

import React, { useEffect } from "react";

export default function TidyCalEmbed({ path, className }) {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[data-tidycal-embed="true"]'
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://asset-tidycal.b-cdn.net/js/embed.js";
    script.async = true;
    script.dataset.tidycalEmbed = "true";
    document.body.appendChild(script);
  }, []);

  return (
    <div
      className={`tidycal-embed ${className || ""}`.trim()}
      data-path={path}
    />
  );
}

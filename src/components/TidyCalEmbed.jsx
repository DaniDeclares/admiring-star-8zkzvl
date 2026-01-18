import React, { useEffect } from "react";

export default function TidyCalEmbed({ path, className }) {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[data-tidycal-embed="true"]'
    );

    if (existingScript) {
      return undefined;
    }

    const script = document.createElement("script");
    script.src = "https://assets.tidycal.com/embed.js";
    script.async = true;
    script.dataset.tidycalEmbed = "true";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div className={`tidycal-embed ${className || ""}`.trim()} data-path={path} />;
}

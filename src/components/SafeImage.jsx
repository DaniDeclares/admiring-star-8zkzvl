import React, { useState } from "react";

/**
 * SafeImage
 * - Shows a lightweight skeleton while loading
 * - On error, shows an inline SVG brand placeholder
 * - Accepts optional fallback, alt, className, style
 */
export default function SafeImage({
  src,
  alt = "",
  className = "",
  style = {},
  fallback = null,
  ...rest
}) {
  const [loading, setLoading] = useState(Boolean(src));
  const [error, setError] = useState(false);

  const placeholder = fallback || (
    <svg
      viewBox="0 0 200 120"
      width="200"
      height="120"
      role="img"
      aria-label={alt || "Dani Declares placeholder"}
    >
      <rect width="200" height="120" rx="8" fill="#F8F5F1" />
      <g transform="translate(20,20)">
        <rect
          x="0"
          y="0"
          width="160"
          height="80"
          rx="6"
          fill="#8B1E2E"
          opacity="0.12"
        />
        <text
          x="80"
          y="46"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          fontSize="18"
          fill="#21191A"
        >
          Dani Declares
        </text>
      </g>
    </svg>
  );

  return (
    <div
      className={className}
      style={{ position: "relative", ...style }}
    >
      {loading && !error && (
        <div
          aria-hidden="true"
          style={{
            width: "100%",
            paddingTop: "56%",
            background: "#FAF8F5",
            borderRadius: 6,
          }}
        />
      )}

      {!error && src && (
        <img
          src={src}
          alt={alt}
          style={{
            display: loading ? "none" : "block",
            width: "100%",
            height: "auto",
            borderRadius: 6,
            objectFit: "cover",
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          {...rest}
        />
      )}

      {error && (
        <div
          style={{
            width: "100%",
            borderRadius: 6,
            overflow: "hidden",
            background: "var(--brand-ivory, #F8F5F1)",
          }}
        >
          {placeholder}
        </div>
      )}

      {!src && !error && (
        <div
          style={{
            width: "100%",
            borderRadius: 6,
            overflow: "hidden",
            background: "var(--brand-ivory, #F8F5F1)",
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}

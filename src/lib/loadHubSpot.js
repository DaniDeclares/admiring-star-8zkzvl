export function loadHubSpotTracking() {
  if (typeof document === "undefined") return;
  if (document.getElementById("hs-script-loader")) return;

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.id = "hs-script-loader";
  script.async = true;
  script.defer = true;
  script.src = "https://js-na2.hs-scripts.com/242764935.js";
  document.body.appendChild(script);
}

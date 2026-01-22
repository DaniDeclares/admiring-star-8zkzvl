export function loadHubSpotTracking() {
  if (typeof document === "undefined") return;
  if (document.getElementById("hs-script-loader")) return;

  const s = document.createElement("script");
  s.type = "text/javascript";
  s.id = "hs-script-loader";
  s.async = true;
  s.defer = true;
  s.src = "https://js-na2.hs-scripts.com/242764935.js";
  document.body.appendChild(s);
}

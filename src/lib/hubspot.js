export const loadHubSpotTracking = (portalId) => {
  if (!portalId) {
    console.warn("HubSpot tracking portal ID is missing.");
    return;
  }

  if (document.getElementById("hs-script-loader")) {
    return;
  }

  const script = document.createElement("script");
  script.id = "hs-script-loader";
  script.src = `https://js.hs-scripts.com/${portalId}.js`;
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
};

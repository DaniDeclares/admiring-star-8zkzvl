export function loadTidycalScript() {
  if (document.getElementById("tidycal-embed-script")) return;
  const s = document.createElement("script");
  s.id = "tidycal-embed-script";
  s.src = "https://asset-tidycal.b-cdn.net/js/embed.js";
  s.async = true;
  document.body.appendChild(s);
}

/* Capture Chromium's install event BEFORE worker data finishes loading.
 * Runs only on the worker-owned handover / installed-app pages. Never changes
 * normal customer / Admin / landing page navigation.
 */
(function () {
  if (typeof window === "undefined" || window.__infixoPwaInstall?.initialized) return;
  var state = window.__infixoPwaInstall = {
    initialized: true,
    prompt: null,
    path: "",
    installed: false,
  };
  function ownerPage() {
    var segments = window.location.pathname.split("/").filter(Boolean);
    if (segments[0] === "pwa" && segments[1] === "worker" && segments[2]) return true;
    if (segments[0] !== "w" || !segments[1]) return false;
    if (segments.length === 2) return new URLSearchParams(window.location.search).has("me");
    return segments.length === 3 && /^IPUC-[A-Za-z0-9-]+$/i.test(segments[2]);
  }
  window.addEventListener("beforeinstallprompt", function (event) {
    if (!ownerPage()) return;
    event.preventDefault();
    state.prompt = event;
    state.path = window.location.pathname;
    window.dispatchEvent(new Event("infixo-pwa-install-ready"));
  });
  window.addEventListener("appinstalled", function () {
    state.prompt = null;
    state.installed = true;
    window.dispatchEvent(new Event("infixo-pwa-installed"));
  });

  // Start the scoped, network-only SW as early as possible. Do not cache or
  // control other workers' public pages / Admin.
  var pieces = window.location.pathname.split("/").filter(Boolean);
  if (pieces[0] === "pwa" && pieces[1] === "worker" && pieces[2] &&
      "serviceWorker" in navigator) {
    var scope = "/pwa/worker/" + encodeURIComponent(pieces[2]);
    navigator.serviceWorker.register("/worker-pwa-sw.js", { scope: scope })
      .catch(function () { /* Browser and protected preview may refuse SW. */ });
  }
})();

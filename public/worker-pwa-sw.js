/* INFIXO Worker PWA: network-only service worker.
 * Registration is restricted to /pwa/worker/<worker-id> for each installed
 * worker. This never caches worker/customer/admin data and never runs on
 * landing, Admin, or public customer pages.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  // Chromium installability: a real fetch handler, but no offline cache.
  event.respondWith(fetch(request));
});

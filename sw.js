// Offline support. The app shell is cached on install; index.html is fetched fresh when online
// (so updates arrive), and everything else is served from the cache first.
const VERSION = "48c9565960";
const CACHE = "ccb-" + VERSION;
const SHELL = [
  "./", "index.html", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "firebase-config.js", "vendor/firebase-app-compat.js", "vendor/firebase-auth-compat.js", "vendor/firebase-firestore-compat.js",
  "vendor/jspdf.umd.min.js", "vendor/jszip.min.js", "vendor/pdf.min.js", "vendor/pdf.worker.min.js",
  ...["AtkinsonHyperlegible", "Lato", "OpenSans", "SourceSans3", "Merriweather", "CourierPrime"]
    .flatMap(f => ["fonts/" + f + "-Regular.ttf", "fonts/" + f + "-Bold.ttf"])
];
self.addEventListener("install", (e) => {
  // cache: "reload" skips the browser's HTTP cache so a new version never caches old files.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("ccb-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    // GitHub Pages lets browsers reuse a page for 10 minutes; "no-cache" asks the server every time (cheap: unchanged pages return "not modified").
    e.respondWith(fetch(req, { cache: "no-cache" }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html", { ignoreSearch: true })));
    return;
  }
  const sameOrigin = url.origin === location.origin;
  const fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const cdn = url.hostname === "cdnjs.cloudflare.com";
  if (!sameOrigin && !fonts && !cdn) return;
  e.respondWith(caches.match(req, { ignoreSearch: sameOrigin }).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});

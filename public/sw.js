// CLOTHING X Service Worker — basic offline support
const CACHE_NAME = "clothingx-v1";
const STATIC_ASSETS = [
  "/",
  "/shop",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network-first for pages, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin requests (Supabase, Google Translate, Unsplash, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip API routes and auth — always go to network
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  // Cache-first for static assets (images, fonts, CSS, JS)
  if (request.destination === "image" || request.destination === "font" || request.destination === "style" || request.destination === "script") {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for pages (with offline fallback)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => cached || caches.match("/"));
      })
  );
});

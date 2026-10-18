const VERSION = "v1";
const STATIC_CACHE = `bd-static-${VERSION}`;
const PAGES_CACHE = `bd-pages-${VERSION}`;
const OFFLINE_CACHE = `bd-offline-${VERSION}`;
const CURRENT = [STATIC_CACHE, PAGES_CACHE, OFFLINE_CACHE];
const LOCALES = ["en", "ar", "es"];
const OFFLINE_ASSETS = [
  "/offline.css",
  "/offline-en.html",
  "/offline-ar.html",
  "/offline-es.html",
  "/icon-192.png",
];
const STATIC_PREFIXES = ["/_next/static/", "/illustrations/", "/audio/"];
const PAGE_PATTERN = /^\/(en|ar|es)\/(learn\/[^/]+\/?|saved\/?)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("bd-") && !CURRENT.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "clear-pages") {
    event.waitUntil(caches.delete(PAGES_CACHE));
  }
});

function isBypassed(url) {
  return url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin");
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.status === 200) {
    cache.put(request, response.clone());
  }
  return response;
}

async function offlinePage(url) {
  const locale = LOCALES.find((l) => url.pathname === `/${l}` || url.pathname.startsWith(`/${l}/`)) || "en";
  const cache = await caches.open(OFFLINE_CACHE);
  return (
    (await cache.match(`/offline-${locale}.html`)) ||
    new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
  );
}

async function networkFirstPage(request, url) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200 && !response.redirected) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || offlinePage(url);
  }
}

async function navigation(request, url) {
  try {
    return await fetch(request);
  } catch {
    return offlinePage(url);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isBypassed(url)) return;

  if (STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    if (request.headers.has("range")) return;
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    if (PAGE_PATTERN.test(url.pathname)) {
      event.respondWith(networkFirstPage(request, url));
    } else {
      event.respondWith(navigation(request, url));
    }
  }
});

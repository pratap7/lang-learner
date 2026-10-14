/* -----------------------------------------------------------------------------
   DeutschPfad Service Worker (v2) — High-Performance Mobile Caching & Offline Sync
   ----------------------------------------------------------------------------- */

const CACHE_VERSION = "deutschpfad-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const PRECACHE_ASSETS = [
  "/",
  "/dashboard",
  "/courses",
  "/courses/a1",
  "/lesson/a1-u1-l1",
  "/flashcards",
  "/practice",
  "/progress",
  "/goals",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

// Install: pre-cache critical app shell routes and PWA manifests
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn("[SW] Some precache assets failed to load (normal in development):", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: purge obsolete cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map((k) => caches.delete(k))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Strategy:
// 1. Static chunks & fonts: Cache-First (immutable)
// 2. Navigation / HTML pages: Stale-While-Revalidate with rich offline fallback
// 3. API calls: Network-First with timeout fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and non-http schemes (e.g. chrome-extension)
  if (req.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // Strategy A: Static Next.js assets, SVG icons, and Fonts (Cache-First)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(req, clone));
            }
            return networkRes;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // Strategy B: Page Navigations (HTML documents) - Stale-While-Revalidate
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedPage = await caches.match(req);
          if (cachedPage) return cachedPage;

          // If requesting an offline lesson, try nearest cached lesson
          if (url.pathname.startsWith("/lesson/")) {
            const fallbackLesson = await caches.match("/lesson/a1-u1-l1");
            if (fallbackLesson) return fallbackLesson;
          }

          const fallbackCourses = await caches.match("/courses");
          if (fallbackCourses) return fallbackCourses;

          const rootFallback = await caches.match("/");
          if (rootFallback) return rootFallback;

          return new Response(
            `<!DOCTYPE html>
            <html lang="en" class="dark">
              <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <title>Offline — DeutschPfad</title>
                <style>
                  body { background: #090D16; color: #F8FAFC; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; }
                  .card { background: #111827; border: 1px solid #1E293B; border-radius: 20px; padding: 36px; max-width: 440px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
                  .icon { font-size: 38px; margin-bottom: 16px; }
                  h1 { margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #F8FAFC; }
                  p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
                  .btn-group { display: flex; flex-direction: column; gap: 10px; }
                  a { display: block; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s; }
                  .primary { background: linear-gradient(135deg, #4338CA, #6366F1); color: white; }
                  .secondary { background: #1E293B; color: #CBD5E1; border: 1px solid #334155; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="icon">📡</div>
                  <h1>Offline-Modus Aktiv</h1>
                  <p>You are currently disconnected. You can continue practicing cached lessons, flashcard reviews, and writing exercises.</p>
                  <div class="btn-group">
                    <a href="/courses/a1" class="primary">Open Offline Lesson</a>
                    <a href="/flashcards" class="secondary">Review Flashcards</a>
                  </div>
                </div>
              </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // Strategy C: Generic API & dynamic requests (Network with dynamic cache fallback)
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      })
      .catch(() => caches.match(req))
  );
});

// Background Sync handler
self.addEventListener("sync", (event) => {
  if (event.tag === "deutschpfad-sync" || event.tag === "sync-queue") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "DEUTSCHPFAD_TRIGGER_SYNC" });
        });
      })
    );
  }
});

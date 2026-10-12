/* -----------------------------------------------------------------------------
   DeutschPfad Service Worker — PWA & Offline Lesson Caching
   ----------------------------------------------------------------------------- */

const CACHE_NAME = "deutschpfad-cache-v1";

const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/courses",
  "/courses/a1",
  "/lesson/a1-u1-l1",
  "/flashcards",
  "/practice",
  "/progress",
  "/goals",
  "/leaderboard",
  "/badges",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

// Install: pre-cache shell routes and assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS).catch((err) => {
          console.warn("[SW] Some precache assets failed to load (normal in dev):", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch handler: Stale-While-Revalidate & Offline lesson fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and non-http schemes
  if (req.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // Handle HTML document navigation requests
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          // Offline fallback
          const cachedRes = await caches.match(req);
          if (cachedRes) return cachedRes;

          // If requesting another lesson while offline, try closest cached course/lesson
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
                  body { background: #0b0f19; color: #f1f5f9; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
                  .card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; max-width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                  h1 { margin-top: 0; font-size: 22px; }
                  p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
                  a { display: inline-block; margin-top: 16px; padding: 10px 20px; background: #6366f1; color: white; border-radius: 10px; text-decoration: none; font-weight: 500; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>📡 Du bist offline</h1>
                  <p>You are currently offline. You can still access previously opened lessons, flashcards, and practice drills from your cached library.</p>
                  <a href="/courses">Open Cached Courses</a>
                </div>
              </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // Handle static assets & API (Next.js chunks, fonts, images)
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && networkRes.type === "basic") {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

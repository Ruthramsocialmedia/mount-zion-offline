/* ═══════════════════════════════════════════════════════════════
   Mount Zion 360° Virtual Campus — Master Service Worker (PWA)
   Caches Landing Portal + CBSE Tour + Matriculation Tour
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'mountzion-offline-v2';

// Critical app shell files across Hub, CBSE, and Matriculation
const CORE_SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './fonts.css',
  './fonts/Satoshi Regular.woff2',
  './fonts/Satoshi Medium.woff2',
  './lib/fontawesome/css/all.min.css',
  './lib/fontawesome/webfonts/fa-solid-900.woff2',
  './lib/fontawesome/webfonts/fa-regular-400.woff2',
  './lib/fontawesome/webfonts/fa-brands-400.woff2',
  './assets/index-6Zf204t4.css',
  './assets/index-B4feVYdk.js',
  './Logo1.png',
  './logo.png',
  './Matric.png',
  './Internationsl.png',
  './campus_tour.png',
  './facilities_tour.png',

  // CBSE Tour Core Shell
  '../Mountzion-CBSE/index.htm',
  '../Mountzion-CBSE/fonts.css',
  '../Mountzion-CBSE/fonts/Satoshi Regular.woff2',
  '../Mountzion-CBSE/fonts/Satoshi Medium.woff2',
  '../Mountzion-CBSE/lib/tdvplayer.js',
  '../Mountzion-CBSE/lib/fontawesome/css/all.min.css',
  '../Mountzion-CBSE/script.js',
  '../Mountzion-CBSE/script_general.js',
  '../Mountzion-CBSE/locale/en.txt',
  '../Mountzion-CBSE/Components/component.js',
  '../Mountzion-CBSE/Components/Music/music.js',
  '../Mountzion-CBSE/Components/Music/music.css',
  '../Mountzion-CBSE/Components/Music/chillout-7-1350.mp3',
  '../Mountzion-CBSE/Components/Menu/menu.js',
  '../Mountzion-CBSE/Components/WidgetDock/widget_dock.js',
  '../Mountzion-CBSE/Components/WidgetDock/widget_dock.css',
  '../Mountzion-CBSE/Components/WidgetDock/gsv-popup.js',
  '../Mountzion-CBSE/Components/Panolist/Panolist.js',
  '../Mountzion-CBSE/Components/Search/search.js',
  '../Mountzion-CBSE/Components/Contact Us/contact.js',
  '../Mountzion-CBSE/Components/Location/location.js',
  '../Mountzion-CBSE/Components/Logo/Logo.js',

  // Matriculation Tour Core Shell
  '../Mountzion-Matriculation/index.htm',
  '../Mountzion-Matriculation/fonts.css',
  '../Mountzion-Matriculation/fonts/Satoshi Regular.woff2',
  '../Mountzion-Matriculation/fonts/Satoshi Medium.woff2',
  '../Mountzion-Matriculation/lib/tdvplayer.js',
  '../Mountzion-Matriculation/lib/fontawesome/css/all.min.css',
  '../Mountzion-Matriculation/script.js',
  '../Mountzion-Matriculation/script_general.js',
  '../Mountzion-Matriculation/script_mobile.js',
  '../Mountzion-Matriculation/locale/en.txt',
  '../Mountzion-Matriculation/Components/component.js',
  '../Mountzion-Matriculation/Components/Music/music.js',
  '../Mountzion-Matriculation/Components/Music/music.css',
  '../Mountzion-Matriculation/Components/Music/chillout-7-1350.mp3',
  '../Mountzion-Matriculation/Components/Menu/menu.js',
  '../Mountzion-Matriculation/Components/WidgetDock/widget_dock.js',
  '../Mountzion-Matriculation/Components/WidgetDock/widget_dock.css',
  '../Mountzion-Matriculation/Components/WidgetDock/gsv-popup.js',
  '../Mountzion-Matriculation/Components/Panolist/Panolist.js',
  '../Mountzion-Matriculation/Components/Search/search.js',
  '../Mountzion-Matriculation/Components/Contact Us/contact.js',
  '../Mountzion-Matriculation/Components/Location/location.js',
  '../Mountzion-Matriculation/Components/Logo/Logo.js'
];

// ─── 1. Install & Pre-cache ─────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core shell assets...');
      // Use individual cache additions to ensure missing optional assets don't block install
      return Promise.allSettled(
        CORE_SHELL_FILES.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[SW] Non-critical precache skip:', url, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ─── 2. Activate & Purge Stale Caches ───────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── 3. Intercept Requests (Cache-First Strategy) ───────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Handle external Maps/StreetView offline fallback
  if (url.hostname.includes('google.com') && (url.pathname.includes('/maps') || url.pathname.includes('/streetview'))) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          `<div style="font-family:sans-serif;text-align:center;padding:40px;background:#1E3A5F;color:#fff;border-radius:12px;">
            <h3>Live Maps Unavailable in Offline Mode</h3>
            <p style="color:#96C0E6;">You are currently browsing the Mount Zion 360° tour offline.</p>
          </div>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
    );
    return;
  }

  // Cache-First for all local tour assets and 360 media
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not in cache -> Fetch from network and store in cache
      return fetch(req).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }

        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, clonedResponse);
        });

        return networkResponse;
      }).catch((err) => {
        console.warn('[SW] Offline fetch fallback for:', req.url, err.message);
      });
    })
  );
});

/* Mount Zion Matriculation Tour - Service Worker */
const CACHE_NAME = 'mountzion-matric-offline-v1';

const CORE_FILES = [
  './',
  './index.htm',
  './manifest.json',
  './fonts.css',
  './fonts/Satoshi Regular.woff2',
  './fonts/Satoshi Medium.woff2',
  './lib/tdvplayer.js',
  './lib/fontawesome/css/all.min.css',
  './lib/fontawesome/webfonts/fa-solid-900.woff2',
  './lib/fontawesome/webfonts/fa-regular-400.woff2',
  './lib/fontawesome/webfonts/fa-brands-400.woff2',
  './script.js',
  './script_general.js',
  './script_mobile.js',
  './locale/en.txt',
  './thumbnail.png',
  './Components/component.js',
  './Components/Music/music.js',
  './Components/Music/music.css',
  './Components/Music/chillout-7-1350.mp3',
  './Components/Menu/menu.js',
  './Components/WidgetDock/widget_dock.js',
  './Components/WidgetDock/widget_dock.css',
  './Components/WidgetDock/gsv-popup.js',
  './Components/Panolist/Panolist.js',
  './Components/Search/search.js',
  './Components/Contact Us/contact.js',
  './Components/Location/location.js',
  './Components/Logo/Logo.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        CORE_FILES.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[SW-Matric] Skip precache item:', url, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }
        const cloned = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cloned);
        });
        return networkResponse;
      }).catch((err) => {
        console.warn('[SW-Matric] Offline fetch fallback:', event.request.url);
      });
    })
  );
});

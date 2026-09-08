# 🌐 Complete Blueprint: Converting a 360° Virtual Tour into an Offline-First Progressive Web App (PWA)

> **A comprehensive technical guide to converting virtual tours (3DVista, Krpano, WebXR) into full-screen, installable, cross-platform web applications capable of running 100% offline.**

---

## 📋 Table of Contents
1. [Architecture Overview & Core Concepts](#1-architecture-overview--core-concepts)
2. [Phase 1: Asset Localization & Offline-First Preparation](#phase-1-asset-localization--offline-first-preparation)
3. [Phase 2: Progressive Web App (PWA) Engineering](#phase-2-progressive-web-app-pwa-engineering)
4. [Phase 3: Multi-Tour Hub & In-App Navigation](#phase-3-multi-tour-hub--in-app-navigation)
5. [Phase 4: Smart Cross-Platform Install Prompt (UI/UX)](#phase-4-smart-cross-platform-install-prompt-uiux)
6. [Phase 5: Local Desktop Offline Runner](#phase-5-local-desktop-offline-runner)
7. [Phase 6: Web Hosting & Overcoming Large Asset Limits](#phase-6-web-hosting--overcoming-large-asset-limits)
8. [Summary Checklist & Best Practices](#summary-checklist--best-practices)

---

## 1. Architecture Overview & Core Concepts

Virtual tours exported from software like **3DVista** or **Krpano** generate thousands of multiresolution panorama image tiles (`.webp`/`.jpg`), JavaScript players, and configuration scripts. 

To convert this static export into a true **Native-feeling Web App (PWA)**, three layers are required:

```
┌─────────────────────────────────────────────────────────────┐
│                 Smart UI Install Banner                     │
│  (Detects OS, catches beforeinstallprompt, iOS guidelines)  │
├─────────────────────────────────────────────────────────────┤
│                 Web App Manifest (.json)                    │
│      (App Name, Icons, Standalone Display, Master Scope)    │
├─────────────────────────────────────────────────────────────┤
│                 Service Worker (sw.js)                      │
│   (Cache-First Engine: Static Shell + Dynamic Tile Caching) │
├─────────────────────────────────────────────────────────────┤
│                 Localized Tour Assets                       │
│    (100% Local Fonts, Webfonts, Zero External CDN Calls)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Asset Localization & Offline-First Preparation

A web app cannot run offline if it depends on external CDNs. Every single font, icon, and script must be bundled locally.

### 1.1 Localize Font Awesome & Webfonts
Replace external CDN `<link>` tags (e.g., `cdnjs.cloudflare.com/ajax/libs/font-awesome/...`) with local files:
1. Download Font Awesome 6 core CSS (`all.min.css`) and webfonts (`.woff2`).
2. Place them in `lib/fontawesome/css/` and `lib/fontawesome/webfonts/`.
3. Update all HTML headers:
```html
<link rel="stylesheet" href="./lib/fontawesome/css/all.min.css" />
```

### 1.2 Localize Google / Custom Web Fonts
Instead of importing fonts from `fonts.googleapis.com`, define local `@font-face` rules in `fonts.css`:
```css
@font-face {
  font-family: 'Satoshi';
  src: url('./fonts/Satoshi-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Satoshi';
  src: url('./fonts/Satoshi-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### 1.3 Convert Absolute URLs to Relative Paths
Search the entire project for hardcoded domain URLs (e.g., `https://example.com/tour/index.htm`) and convert them to relative paths:
```javascript
// ❌ BAD: Hardcoded to a specific domain
window.location.href = "https://uandi.media/Virtual-tour/Mount-zion/Mountzion-CBSE/index.htm";

// ✅ GOOD: Relative routing works on localhost, staging, and any production domain
window.location.href = "../Mountzion-CBSE/index.htm";
```

### 1.4 Handle External APIs Gracefully
If your tour contains dynamic web features like Google Street View or live maps, add an offline fallback check:
```javascript
if (!navigator.onLine) {
  showNotice("This feature requires an active internet connection.");
}
```

---

## Phase 2: Progressive Web App (PWA) Engineering

### 2.1 The Master Web App Manifest (`manifest.json`)
The manifest tells the operating system (Windows, macOS, Android, iOS) how to install and display your app.

Create `dist/manifest.json`:
```json
{
  "name": "Mount Zion 360° Virtual Campus",
  "short_name": "MountZion 360",
  "description": "Immersive 360° Virtual Campus Tour",
  "start_url": "./index.html",
  "scope": "../",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#060a12",
  "theme_color": "#1E3A5F",
  "icons": [
    {
      "src": "./Logo1.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "./Logo1.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

> [!IMPORTANT]
> Setting `"scope": "../"` allows the installed app window to navigate into sub-tour folders (like `Mountzion-CBSE/` and `Mountzion-Matriculation/`) without breaking out into a web browser tab!

### 2.2 The Service Worker (`sw.js`)
Virtual tours have tens of thousands of image tiles. Pre-caching 35,000 files on the first second will freeze the browser. 

Instead, use a **Hybrid Strategy**:
1. **Pre-cache Core App Shell**: HTML, CSS, JS players, UI icons, and logos.
2. **Dynamic Cache-First for Panorama Tiles**: As the user explores different rooms and panoramas, the Service Worker dynamically saves every tile into Cache Storage. Next time they visit that room, it loads instantly from disk with 0ms network latency.

```javascript
const CACHE_NAME = 'mz-vtour-cache-v2';
const CORE_ASSETS = [
  './index.html',
  './fonts.css',
  './manifest.json',
  './Logo1.png',
  './lib/fontawesome/css/all.min.css',
  './assets/index-B4feVYdk.js',
  './assets/index-6Zf204t4.css'
];

// Install: Cache essential shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Cache-First with Dynamic Tile Caching
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for offline if not cached
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
```

### 2.3 Service Worker Registration
Add to your HTML:
```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.warn('PWA registration failed:', err));
    });
  }
</script>
```

---

## Phase 3: Multi-Tour Hub & In-App Navigation

When a project has multiple virtual tours (e.g., CBSE Campus + Matriculation Campus), organize them under a central landing portal.

### 3.1 Folder Structure
```
project-root/
│
├── index.html                   # Root entry redirect to dist/index.html
├── _redirects                   # SPA routing rules for Netlify/Cloudflare
├── netlify.toml                 # Build and header configuration
│
├── dist/                        # Central Landing Page Hub
│   ├── index.html
│   ├── manifest.json            # Master PWA manifest
│   ├── sw.js                    # Master Service Worker
│   ├── pwa-install.js           # Smart Install Prompt
│   └── Logo1.png
│
├── Mountzion-CBSE/              # Tour 1
│   ├── index.htm
│   ├── manifest.json            # Points start_url to ../dist/index.html
│   ├── sw.js
│   ├── pwa-install.js
│   └── media/                   # 360 Panorama tiles
│
└── Mountzion-Matriculation/     # Tour 2
    ├── index.htm
    ├── manifest.json            # Points start_url to ../dist/index.html
    ├── sw.js
    ├── pwa-install.js
    └── media/                   # 360 Panorama tiles
```

### 3.2 In-App Window Transitions
Ensure that when a user clicks between the landing page and the tours, they stay inside the same window instead of popping open a new browser tab:
- Use `target="_self"` on all links.
- In tour menus, provide a **"Return to Main Hub"** button pointing back to `../dist/index.html`.

---

## Phase 4: Smart Cross-Platform Install Prompt (UI/UX)

Most users do not notice the small install icon in the browser address bar. A polite, non-intrusive floating prompt significantly increases installation rates.

### 4.1 Features of `pwa-install.js`
1. **Timing**: Waits **3.5 seconds** before appearing so visitors see the campus first.
2. **Chromium Support (Chrome, Edge, Android)**: Captures `beforeinstallprompt` event and opens native install modal upon clicking "Install App".
3. **Apple iOS Support (Safari)**: Detects iPhone/iPad and displays: *"Tap Share [⎋] ➔ Add to Home Screen [⊞]"*.
4. **Standalone Detection**: Automatically hides if the app is already opened in installed PWA mode.
5. **Memory**: Stores dismissal in `localStorage` for **7 days** so it never spams returning users.

```javascript
// Standalone check
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
if (isStandalone) return;

// Listen for install trigger
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showBanner();
});
```

---

## Phase 5: Local Desktop Offline Runner

To run the tour offline on Windows PC/laptops without internet or hosting, use a lightweight background web server launcher.

Create [`run_offline.bat`](file:///d:/Mountzion/Offline/run_offline.bat):
```bat
@echo off
title Mount Zion 360 Virtual Campus Launcher
cd /d "%~dp0"

echo Starting Mount Zion Local Server...

:: 1. Try Python 3
python -m http.server 8080 --bind 127.0.0.1 >nul 2>&1
if %ERRORLEVEL% EQU 0 goto OPEN_BROWSER

:: 2. Try Node.js npx serve
npx serve -p 8080 . >nul 2>&1
if %ERRORLEVEL% EQU 0 goto OPEN_BROWSER

:: 3. Try PHP Built-in server
php -S 127.0.0.1:8080 >nul 2>&1

:OPEN_BROWSER
:: Launch in Dedicated Application Window Mode (Edge or Chrome)
start msedge --app="http://127.0.0.1:8080/dist/index.html" || start chrome --app="http://127.0.0.1:8080/dist/index.html" || start http://127.0.0.1:8080/dist/index.html
```

---

## Phase 6: Web Hosting & Overcoming Large Asset Limits

### 6.1 The 25,000 File Limit Problem
Because 360° virtual tours slice panoramas into thousands of multiresolution tiles across zoom levels, a project easily contains **30,000 to 50,000+ files**.

- **Netlify Drop (Browser Drag-and-Drop)** has a hard limit of **25,000 files per zip** and will fail with: `Build zip has 37,209 files, over the limit of 25,000`.

### 6.2 The Solutions

#### Solution A: Connect GitHub Repository to Netlify (Recommended)
1. Push project to GitHub:
```bash
git init
git add .
git commit -m "Mount Zion Virtual Tour PWA"
git branch -M main
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```
2. In Netlify Dashboard: **Add new site ➔ Import from GitHub**.
3. Set **Publish directory** to `.` (dot) and leave Build command empty.
4. Netlify builds directly from Git without file count limits.

#### Solution B: Netlify CLI Direct Deploy
```bash
npx netlify deploy --prod --dir=.
```

#### Solution C: Cloudflare Pages / Vercel
```bash
npx wrangler pages deploy . --project-name=my-tour
```

#### Solution D: Traditional Web Hosting (cPanel / Apache / Nginx / S3)
Zip your project files on your computer, upload to your server's `public_html`, and extract. Standard web hosting has zero file-count caps.

---

## Summary Checklist & Best Practices

| Category | Requirement | Done |
| :--- | :--- | :---: |
| **Localization** | All fonts & icons loaded locally (no CDN URLs) | ✅ |
| **Paths** | All internal links use relative URLs (`../` or `./`) | ✅ |
| **PWA Manifest** | `manifest.json` configured with `display: standalone` & `"scope": "../"` | ✅ |
| **Service Worker** | `sw.js` with Cache-First static shell + dynamic tile caching | ✅ |
| **Install UI** | Smart install banner with 7-day memory and iOS Safari support | ✅ |
| **Offline Tool** | `run_offline.bat` for offline desktop double-click execution | ✅ |
| **Hosting** | Git-backed deployment or direct server upload bypassing zip limits | ✅ |

---

*Mount Zion 360° Virtual Campus — Engineered for High Performance, Offline-First Reliability, and Seamless PWA Delivery.*

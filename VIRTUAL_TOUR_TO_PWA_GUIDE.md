# 🌐 Universal Standard Blueprint: Converting Any 360° Virtual Tour into an Offline-First Progressive Web App (PWA)

> **Audience:** Human Developers & AI Coding Agents (Claude, Gemini, Antigravity, Cursor, ChatGPT).  
> **Applicable Engines:** 3DVista, Krpano, Marzipano, Pannellum, Matterport exports, Three.js / WebXR tours.  
> **Objective:** Transform any static virtual tour into a 100% offline-ready, full-screen installable app for Windows, macOS, iOS, and Android.

---

## 🤖 AI Agent Quick-Start Prompt

If you are an **AI Agent** reading this file to execute a conversion, or a **Human** prompting an AI Agent on a new project, use this prompt:

```markdown
You are an expert Frontend & PWA Systems Engineer. 
Please convert this 360° Virtual Tour project into an Offline-First Progressive Web App (PWA) by following the standard operating procedure defined in `VIRTUAL_TOUR_TO_PWA_GUIDE.md`:
1. Audit all HTML, JS, and CSS files for external CDN links (fonts, icons, polyfills) and localize them 100%.
2. Convert all hardcoded absolute domain URLs into relative paths (`../` or `./`).
3. Generate the universal `manifest.json` with `display: standalone` and master scope.
4. Implement the Hybrid Cache-First Service Worker (`sw.js`) for static app shell + dynamic multiresolution panorama tile caching.
5. Inject the Smart Install Prompt (`pwa-install.js`) with Chromium 1-click install and iOS Safari guidance.
6. Create the offline desktop launcher (`run_offline.bat`).
7. Verify all scripts with syntax checks and prepare for Git/hosting deployment.
```

---

## 📋 Universal Variable Matrix

When applying this guide to any project, identify or define these project variables:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `{{PROJECT_NAME}}` | Full name of the school / organization / campus | `Mount Zion 360° Virtual Campus` |
| `{{SHORT_NAME}}` | Short name for desktop/mobile home screens (max 12 chars) | `MountZion 360` |
| `{{APP_DESCRIPTION}}` | 1-sentence description for app stores and metadata | `Immersive 360° Virtual Campus Tour` |
| `{{THEME_COLOR}}` | Primary brand hex color for status bar & header | `#1E3A5F` |
| `{{BG_COLOR}}` | Background loading hex color | `#060a12` |
| `{{APP_ICON_192}}` | Relative path to 192x192 PNG square logo | `./Logo1.png` |
| `{{APP_ICON_512}}` | Relative path to 512x512 PNG square logo | `./Logo1.png` |
| `{{START_URL}}` | Entry point relative to the manifest file | `./index.html` (or `../dist/index.html`) |
| `{{APP_SCOPE}}` | Master scope encompassing all sub-tours | `./` (or `../`) |
| `{{CACHE_NAME}}` | Unique cache storage identifier | `vtour-cache-v1` |

---

## 🏗️ Standard Architecture Overview

Virtual tour software (like 3DVista or Krpano) chops high-resolution 360° equirectangular panoramas into multiresolution cubic tiles (often **20,000 to 50,000+ `.webp`/`.jpg` files**). 

The PWA Architecture bridges static tour files with native app capabilities:

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

## 🛠️ Step-by-Step Implementation Procedure

---

### Step 1: Pre-Flight Audit & Complete Asset Localization

A PWA **cannot run offline** if it depends on external CDNs or hardcoded web domains.

#### 1.1 Find & Localize External CDNs
Search the project for external dependencies (`cdnjs`, `googleapis`, `jsdelivr`, `unpkg`, `fontawesome`):

**PowerShell Command to Audit:**
```powershell
Get-ChildItem -Recurse -Include *.html,*.htm,*.js,*.css | Select-String -Pattern "https?://(cdnjs|fonts\.googleapis|cdn|unpkg)" | Select-Object Path, LineNumber, Line
```

**Actions:**
1. **Font Awesome**: Download `all.min.css` and `.woff2` font files into `lib/fontawesome/css/` and `lib/fontawesome/webfonts/`.
2. **Web Fonts**: Download Google / custom fonts locally and define `@font-face` rules in `fonts.css`.
3. **Polyfills**: Download `webxr-polyfill.js` or `tdvplayer.js` into local `lib/` folders.

#### 1.2 Convert Absolute URLs to Relative Paths
Search for hardcoded domain URLs (e.g. `https://my-domain.com/tour/index.htm`) and replace them with relative navigation:
```javascript
// ❌ BAD: Breaks offline mode and fails when domain changes
window.location.href = "https://my-domain.com/Tour-A/index.htm";

// ✅ GOOD: Works on localhost, file system, offline, and any hosted domain
window.location.href = "../Tour-A/index.htm";
```

---

### Step 2: Create the Universal Web App Manifest (`manifest.json`)

The Web App Manifest informs the OS how to display the application (window mode, app icons, theme colors).

#### Template: `manifest.json`
```json
{
  "name": "{{PROJECT_NAME}}",
  "short_name": "{{SHORT_NAME}}",
  "description": "{{APP_DESCRIPTION}}",
  "start_url": "{{START_URL}}",
  "scope": "{{APP_SCOPE}}",
  "display": "standalone",
  "orientation": "any",
  "background_color": "{{BG_COLOR}}",
  "theme_color": "{{THEME_COLOR}}",
  "icons": [
    {
      "src": "{{APP_ICON_192}}",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "{{APP_ICON_512}}",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

> [!IMPORTANT]
> **Multi-Tour Hub Scope Rule:** If you have multiple tour subfolders (e.g., `Tour-1/` and `Tour-2/`) under a central landing page (`dist/`), set `"scope": "../"` in all manifests. This ensures navigating between tours stays **inside the standalone app window** rather than opening an external browser tab.

---

### Step 3: Implement the Hybrid Service Worker (`sw.js`)

#### Why a Hybrid Cache Strategy?
Attempting to pre-cache 30,000+ multiresolution panorama images on page load will freeze the browser and exhaust memory.

**The Solution:**
1. **Pre-Cache Core Shell (Install phase):** Cache HTML, CSS, core JS players, UI icons, and logos immediately.
2. **Dynamic Cache-First (Fetch phase):** As the visitor explores rooms and looks around in 360°, dynamically cache every requested panorama tile on the fly. Once viewed, that room loads 100% offline forever.

#### Template: `sw.js`
```javascript
/**
 * Universal Offline-First Service Worker for 360° Virtual Tours
 */
const CACHE_NAME = '{{CACHE_NAME}}';

// Core assets to cache immediately during installation
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './fonts.css',
  './{{APP_ICON_192}}',
  './lib/fontawesome/css/all.min.css'
];

// 1. Install Event: Cache Core App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core app shell');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up outdated cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[Service Worker] Removing old cache:', key);
          return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// 3. Fetch Event: Cache-First with Dynamic Multiresolution Tile Caching
self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached asset with 0ms network latency
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // If response is invalid or an opaque error, return it as-is
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }

          // Clone response and dynamically cache new panorama tiles / assets
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Fallback for HTML page navigation when fully offline
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('./index.htm');
          }
        });
    })
  );
});
```

---

### Step 4: Inject the Universal Smart Install Prompt (`pwa-install.js`)

Most users never notice the small install icon in the browser address bar. A polite, responsive floating prompt increases app install rates dramatically.

#### Key UX Rules:
- **Polite Delay**: Wait 3.5 seconds before appearing so the visitor first enjoys the campus view.
- **Cross-Platform**:
  - **Desktop Chrome / Edge & Android**: 1-Click native install prompt trigger.
  - **Apple iOS (iPhone/iPad Safari)**: Shows animated visual guide (*"Tap Share [⎋] ➔ Add to Home Screen [⊞]"*).
- **Standalone App Detection**: Hides automatically if running inside the installed app.
- **7-Day Memory**: Remembers dismissals in `localStorage` to prevent user annoyance.

#### Template: `pwa-install.js`
```javascript
/**
 * Universal Smart PWA Install Banner Component
 * Zero external dependencies. Self-injected CSS and cross-platform logic.
 */
(function () {
  'use strict';

  // 1. Standalone / Installed App Check
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');

  if (isStandalone) return;

  // 2. 7-Day Dismissal Suppression
  const STORAGE_KEY = 'mz_pwa_install_dismissed';
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const lastDismissed = localStorage.getItem(STORAGE_KEY);

  if (lastDismissed && Date.now() - parseInt(lastDismissed, 10) < SEVEN_DAYS_MS) {
    return;
  }

  // 3. Platform Detection
  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream;

  let deferredPrompt = null;
  let bannerElement = null;

  // 4. Scoped Stylesheet Injection
  const styles = `
    .mz-pwa-banner-wrapper {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(140%);
      z-index: 999999;
      width: calc(100% - 32px);
      max-width: 480px;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
      opacity: 0;
      pointer-events: none;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .mz-pwa-banner-wrapper.mz-show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }
    .mz-pwa-banner {
      background: rgba(10, 16, 28, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 16px 20px;
      box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.15);
      display: flex;
      flex-direction: column;
      gap: 14px;
      color: #ffffff;
    }
    .mz-pwa-header { display: flex; align-items: center; gap: 14px; }
    .mz-pwa-icon-box {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(245, 158, 11, 0.2));
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
    }
    .mz-pwa-icon-box img { width: 100%; height: 100%; object-fit: cover; }
    .mz-pwa-info { flex: 1; min-width: 0; }
    .mz-pwa-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
    .mz-pwa-title { font-size: 15px; font-weight: 700; color: #ffffff; margin: 0; }
    .mz-pwa-badge {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; padding: 2px 7px; border-radius: 999px;
      background: rgba(245, 158, 11, 0.18); color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .mz-pwa-desc { font-size: 12.5px; color: rgba(255, 255, 255, 0.72); margin: 0; }
    .mz-pwa-close-btn {
      background: rgba(255, 255, 255, 0.08); border: none; color: rgba(255, 255, 255, 0.6);
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .mz-pwa-actions { display: flex; align-items: center; gap: 10px; }
    .mz-pwa-btn-secondary {
      flex: 1; padding: 10px 14px; background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
      color: rgba(255, 255, 255, 0.85); font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .mz-pwa-btn-primary {
      flex: 1.5; padding: 10px 16px; background: linear-gradient(135deg, #0284c7, #0369a1);
      border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px;
      color: #ffffff; font-size: 13px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 7px;
    }
    .mz-pwa-ios-instructions {
      font-size: 12px; color: rgba(255, 255, 255, 0.85); background: rgba(255, 255, 255, 0.05);
      padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);
      line-height: 1.4;
    }
    @media (max-width: 480px) {
      .mz-pwa-banner-wrapper { bottom: 16px; width: calc(100% - 24px); }
    }
  `;

  function injectCSS() {
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }

  function createBanner(type = 'default') {
    if (bannerElement) return;

    let iconSrc = './Logo1.png';
    if (document.querySelector('link[rel="icon"]')) {
      iconSrc = document.querySelector('link[rel="icon"]').href;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'mz-pwa-banner-wrapper';

    let actionHTML = '';
    if (type === 'ios') {
      actionHTML = `
        <div class="mz-pwa-ios-instructions">
          <span>📲 Tap the <strong>Share</strong> button at the bottom, then choose <strong>"Add to Home Screen"</strong>.</span>
        </div>
        <div class="mz-pwa-actions">
          <button class="mz-pwa-btn-primary" id="mz-pwa-dismiss-btn" style="flex:1;">Got it</button>
        </div>
      `;
    } else {
      actionHTML = `
        <div class="mz-pwa-actions">
          <button class="mz-pwa-btn-secondary" id="mz-pwa-later-btn">Later</button>
          <button class="mz-pwa-btn-primary" id="mz-pwa-install-btn">Install App</button>
        </div>
      `;
    }

    wrapper.innerHTML = `
      <div class="mz-pwa-banner" role="dialog">
        <div class="mz-pwa-header">
          <div class="mz-pwa-icon-box">
            <img src="${iconSrc}" alt="Logo" onerror="this.src='./thumbnail.png'">
          </div>
          <div class="mz-pwa-info">
            <div class="mz-pwa-title-row">
              <h3 class="mz-pwa-title">{{PROJECT_NAME}}</h3>
              <span class="mz-pwa-badge">Offline Ready</span>
            </div>
            <p class="mz-pwa-desc">Install for full screen & instant offline campus tours.</p>
          </div>
          <button class="mz-pwa-close-btn" id="mz-pwa-close-btn">✕</button>
        </div>
        ${actionHTML}
      </div>
    `;

    document.body.appendChild(wrapper);
    bannerElement = wrapper;

    const dismissHandler = () => {
      wrapper.classList.remove('mz-show');
      setTimeout(() => wrapper.remove(), 600);
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    };

    const closeBtn = wrapper.querySelector('#mz-pwa-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', dismissHandler);

    const laterBtn = wrapper.querySelector('#mz-pwa-later-btn');
    if (laterBtn) laterBtn.addEventListener('click', dismissHandler);

    const dismissBtn = wrapper.querySelector('#mz-pwa-dismiss-btn');
    if (dismissBtn) dismissBtn.addEventListener('click', dismissHandler);

    const installBtn = wrapper.querySelector('#mz-pwa-install-btn');
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
          alert('Open your browser menu (⋮) and tap "Install app" or "Add to Home Screen".');
          dismissHandler();
          return;
        }
        try {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
        } catch (err) {
          console.warn('[PWA Install Error]', err);
        }
        dismissHandler();
      });
    }

    setTimeout(() => wrapper.classList.add('mz-show'), 3500);
  }

  injectCSS();

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    createBanner('default');
  });

  if (isIOS) createBanner('ios');

  setTimeout(() => {
    if (!bannerElement && !isIOS && !isStandalone) {
      if (/Chrome|Edg/.test(navigator.userAgent) && !/Android|Mobile/.test(navigator.userAgent)) {
        createBanner('default');
      }
    }
  }, 5000);
})();
```

---

### Step 5: Connect Everything in HTML Files

Add these tags to the `<head>` and `<body>` of all tour `index.html` / `index.htm` files:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>{{PROJECT_NAME}}</title>
  
  <!-- PWA Meta & Manifest -->
  <link rel="manifest" href="./manifest.json" />
  <meta name="theme-color" content="{{THEME_COLOR}}" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="{{SHORT_NAME}}" />
  <link rel="apple-touch-icon" href="./{{APP_ICON_192}}" />
</head>
<body>
  <!-- Tour Viewer Container -->
  <div id="viewer"></div>

  <!-- Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
          .then((reg) => console.log('[PWA SW Active]:', reg.scope))
          .catch((err) => console.warn('[PWA SW Error]:', err));
      });
    }
  </script>

  <!-- Smart Install Banner -->
  <script src="./pwa-install.js" defer></script>
</body>
</html>
```

---

### Step 6: Create Desktop Offline Launchers

For users who want to run the tour on offline Windows PCs / laptops without hosting:

#### Template: `run_offline.bat` (Windows Launcher)
```bat
@echo off
title {{PROJECT_NAME}} - Offline Launcher
cd /d "%~dp0"

echo [1/2] Starting Local Web Engine...

:: Check for Python 3
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start /B python -m http.server 8080 --bind 127.0.0.1 >nul 2>&1
    goto LAUNCH_APP
)

:: Check for Node.js
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start /B npx serve -p 8080 . >nul 2>&1
    goto LAUNCH_APP
)

:: Check for PHP
where php >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start /B php -S 127.0.0.1:8080 >nul 2>&1
    goto LAUNCH_APP
)

echo Warning: No Python/Node/PHP found. Launching default browser directly...
start "" "dist/index.html"
exit /b

:LAUNCH_APP
timeout /t 1 /nobreak >nul
echo [2/2] Opening Application Window...
start msedge --app="http://127.0.0.1:8080/dist/index.html" || start chrome --app="http://127.0.0.1:8080/dist/index.html" || start http://127.0.0.1:8080/dist/index.html
exit
```

---

## 🚀 Step 7: Web Hosting & Overcoming Production Limits

### 7.1 The 25,000 File Upload Limit (Netlify / Free Hosts)
3DVista tours contain 30,000 to 50,000+ files due to multiresolution tiles.  
Netlify's web browser drag-and-drop ("Netlify Drop") will **fail** with:
`Build zip has 37,209 files, over the limit of 25,000.`

### 7.2 The 3 Guaranteed Hosting Workarounds

| Method | How to Deploy | File Limit |
| :--- | :--- | :---: |
| **1. Git Integration (Recommended)** | Push folder to **GitHub / GitLab** and connect repository to **Netlify / Cloudflare Pages / Vercel**. | **Unlimited** |
| **2. Netlify CLI Stream** | Run in project root: `npx netlify deploy --prod --dir=.` | **Unlimited** |
| **3. cPanel / VPS / Apache / Nginx** | Compress into `.zip` on PC, upload via cPanel File Manager / SFTP, and click **Extract**. | **Unlimited** |

---

## ⚠️ Common Edge Cases & Troubleshooting Guide

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **`fatal: No url found for submodule in .gitmodules`** | Sub-tour folders originally contained a `.git` folder, registering them as broken submodules. | Delete internal `.git` folders in subdirectories, run `git rm --cached -f <folder>`, then `git add .` and push. |
| **Navigating to Tour 2 opens an external browser tab** | The manifest scope was restricted to `./` of Tour 1. | Set `"scope": "../"` in all manifests so the entire root is covered by the standalone window. |
| **PWA Install Button does not appear** | Page is not served over HTTPS, Service Worker failed to register, or `display-mode: standalone` is already active. | Test on `localhost` or an HTTPS domain. Inspect Console and Application tab in Chrome DevTools. |
| **360° Panoramas black / not loading offline** | Tiles were requested across cross-origin CDNs or Service Worker missed caching. | Verify all media requests use relative paths and Service Worker dynamic tile caching is enabled. |

---

## 📊 Universal Quality Assurance Checklist

Run this verification checklist before delivering any converted project:

- [ ] **Zero CDN Dependencies**: No network calls to external fonts, styles, or scripts.
- [ ] **Relative Links**: All internal transitions use relative paths (`../` or `./`).
- [ ] **Valid Manifest**: `manifest.json` passes Chrome DevTools Application ➔ Manifest validation.
- [ ] **Service Worker Active**: `sw.js` registered and active in DevTools Application ➔ Service Workers.
- [ ] **Install Prompt Responsive**: Tested and smooth on both desktop and mobile viewports.
- [ ] **Single Standalone Window**: Navigating between tours stays within the installed app window.
- [ ] **Offline Verification**: Open DevTools ➔ Network ➔ Check **Offline** ➔ Refresh page (Tour must load smoothly).
- [ ] **Clean Git Index**: No broken submodules or untracked `.git` artifacts.

---

*Standard Operating Blueprint — Engineered for 100% Offline Resilience, Frictionless PWA Installation, and High-Performance 360° Virtual Delivery.*

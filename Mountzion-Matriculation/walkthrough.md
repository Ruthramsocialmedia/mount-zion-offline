# All Changes — Yesterday + Today

## Yesterday (Mar 17) — 3DVista Popup Styling

### [3dvista.js](file:///d:/Mountzion/Mountzion-Matriculation/3dvista.js)
- Replaced external CDN dependencies (Font Awesome, Satoshi) with self-contained inline SVGs and system fonts
- Styled the welcome popup to match the "Premium Navy Theme" used across Menu, GSV Explore, and Panolist
- Popup offers two choices: **Continue Virtual Tour** or **Switch to Google Street View**

---

## Today (Mar 19) — All Changes

### 1. [3dvista.js](file:///d:/Mountzion/Mountzion-Matriculation/3dvista.js) — GSV Iframe Popup
- **"Switch to Google Street View" button** — changed from `window.open()` (new tab) to an **in-page iframe popup**
- Added [openIframePopup()](file:///d:/Mountzion/Mountzion-Matriculation/3dvista.js#381-475) function with:
  - 95% width/height glassmorphism overlay
  - Floating close button with blur effect
  - ESC key + backdrop click to dismiss
  - `allowfullscreen`, `loading="lazy"`, `referrerpolicy` attributes
- Removed the old header from iframe popup (no title bar)
- Updated the Google Maps embed URL to the Street View version

---

### 2. [widget_dock.js](file:///d:/Mountzion/Mountzion-Matriculation/Components/WidgetDock/widget_dock.js) — Full Rewrite
**Old:** Chat + Music + Language buttons (with stale Chatbot references)  
**New:** Two widgets only:
- **GSV button** — dispatches `menuItemClick` with `menu-street-view`
- **Mute/Unmute button** — migrated from standalone MusicToggle:
  - Toggles `window.bgAudio.play()` / `.pause()`
  - Listens for `musicStateChanged` events
  - Icon switches between `fa-volume-high` and `fa-volume-xmark`
  - Tooltip updates ("Music: On" / "Music: Off")
- Auto-open via `setTimeout(600ms)` (script loads after consent resolves)

---

### 3. [widget_dock.css](file:///d:/Mountzion/Mountzion-Matriculation/Components/WidgetDock/widget_dock.css) — Full Rewrite
- Removed Chat/Language/pulse ring styles
- **Dock container** — Premium Navy glassmorphism (`rgba(30, 58, 95, 0.65)`)
- **GSV button** — Primary Blue (`#2F5E8E`) / Sky Blue (`#96C0E6`) tint
- **Mute button active** — Academic Orange (`#F47C20`) glow when playing
- Compact pill layout (6px padding, 46px buttons)
- Refined tooltips with `backdrop-filter: blur(12px)`
- All original animations preserved (dockReveal, btnPop, divPop)

---

### 4. [gsv-popup.js](file:///d:/Mountzion/Mountzion-Matriculation/Components/WidgetDock/gsv-popup.js) — NEW FILE
- Standalone GSV iframe popup (same style as [3dvista.js](file:///d:/Mountzion/Mountzion-Matriculation/3dvista.js) iframe)
- 95% fullscreen glassmorphism overlay
- Glassmorphism close button (top-right)
- ESC key + backdrop click dismiss
- Listens for `menuItemClick` with `menu-street-view` (from WidgetDock + Menu)
- Exposes `window.openGsvPopup()` as public API

---

### 5. [menu.js](file:///d:/Mountzion/Mountzion-Matriculation/Components/Menu/menu.js) — Two Changes
1. Renamed "Panorama" label → **"Explore Classrooms & Facilities"**
2. **Google Street View** — removed `url` property so it no longer opens a new tab. Now dispatches `menuItemClick` event → [gsv-popup.js](file:///d:/Mountzion/Mountzion-Matriculation/Components/WidgetDock/gsv-popup.js) opens the iframe popup

---

### 6. [index.htm](file:///d:/Mountzion/Mountzion-Matriculation/index.htm) — Loader Updates
```diff
-"Components/MusicToggle/music_toggle.js",
+"Components/WidgetDock/widget_dock.js",
+"Components/WidgetDock/gsv-popup.js",
```

---

## Summary Table

| File | Action | What Changed |
|------|--------|-------------|
| [3dvista.js](file:///d:/Mountzion/Mountzion-Matriculation/3dvista.js) | Modified | GSV opens in iframe popup instead of new tab |
| [widget_dock.js](file:///d:/Mountzion/Mountzion-Matriculation/Components/WidgetDock/widget_dock.js) | Rewritten | GSV + Mute/Unmute widgets |
| [widget_dock.css](file:///d:/Mountzion/Mountzion-Matriculation/Components/WidgetDock/widget_dock.css) | Rewritten | Navy glassmorphism, brand colors, modern UI |
| [gsv-popup.js](file:///d:/Mountzion/Mountzion-Matriculation/Components/WidgetDock/gsv-popup.js) | **NEW** | Standalone GSV iframe popup component |
| [menu.js](file:///d:/Mountzion/Mountzion-Matriculation/Components/Menu/menu.js) | Modified | Panorama label renamed, GSV opens popup |
| [index.htm](file:///d:/Mountzion/Mountzion-Matriculation/index.htm) | Modified | Swapped MusicToggle → WidgetDock + gsv-popup |

> [!NOTE]
> The standalone `MusicToggle` component files still exist on disk but are no longer loaded. The mute/unmute logic now lives inside the WidgetDock.

/**
 * Mount Zion 360° Virtual Campus - Smart PWA Install Prompt
 * Designed with modern glassmorphic UI, smooth micro-animations, and cross-platform logic.
 */
(function () {
  'use strict';

  // 1. Check if already running in standalone / installed PWA mode
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');

  if (isStandalone) {
    console.log('[PWA Install] App already running in standalone mode.');
    return;
  }

  // 2. Check 7-day dismissal memory
  const STORAGE_KEY = 'mz_pwa_install_dismissed';
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const lastDismissed = localStorage.getItem(STORAGE_KEY);

  if (lastDismissed && Date.now() - parseInt(lastDismissed, 10) < SEVEN_DAYS_MS) {
    console.log('[PWA Install] Prompt recently dismissed by user. Suppressing for 7 days.');
    return;
  }

  // 3. Platform detection
  const isIOS =
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream;

  let deferredPrompt = null;
  let bannerElement = null;

  // 4. Inject Scoped Stylesheet
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
      font-family: 'Satoshi', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    .mz-pwa-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .mz-pwa-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(245, 158, 11, 0.2));
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .mz-pwa-icon-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .mz-pwa-icon-box svg {
      width: 26px;
      height: 26px;
      fill: #38bdf8;
    }
    .mz-pwa-info {
      flex: 1;
      min-width: 0;
    }
    .mz-pwa-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }
    .mz-pwa-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .mz-pwa-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
      flex-shrink: 0;
    }
    .mz-pwa-desc {
      font-size: 12.5px;
      color: rgba(255, 255, 255, 0.72);
      margin: 0;
      line-height: 1.35;
    }
    .mz-pwa-close-btn {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: rgba(255, 255, 255, 0.6);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .mz-pwa-close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      transform: scale(1.05);
    }
    .mz-pwa-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mz-pwa-btn-secondary {
      flex: 1;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.85);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }
    .mz-pwa-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }
    .mz-pwa-btn-primary {
      flex: 1.5;
      padding: 10px 16px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 12px;
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .mz-pwa-btn-primary:hover {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(14, 165, 233, 0.45);
    }
    .mz-pwa-btn-primary:active {
      transform: translateY(0);
    }
    .mz-pwa-ios-instructions {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(255, 255, 255, 0.05);
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 8px;
      line-height: 1.4;
    }
    .mz-pwa-ios-icon {
      font-size: 16px;
      flex-shrink: 0;
    }
    @media (max-width: 480px) {
      .mz-pwa-banner-wrapper {
        bottom: 16px;
        width: calc(100% - 24px);
      }
      .mz-pwa-banner {
        padding: 14px 16px;
        border-radius: 18px;
      }
    }
  `;

  function injectCSS() {
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }

  function createBanner(type = 'default') {
    if (bannerElement) return;

    // Detect icon path based on current directory
    let iconSrc = './Logo1.png';
    if (!location.pathname.includes('/dist/')) {
      if (document.querySelector('link[rel="icon"]')) {
        iconSrc = document.querySelector('link[rel="icon"]').href;
      } else {
        iconSrc = './thumbnail.png';
      }
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'mz-pwa-banner-wrapper';

    let actionHTML = '';

    if (type === 'ios') {
      actionHTML = `
        <div class="mz-pwa-ios-instructions">
          <span class="mz-pwa-ios-icon">📲</span>
          <span>Tap the <strong>Share</strong> button <svg style="display:inline-block;vertical-align:middle;width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 2l4 4h-3v9h-2V6H8l4-4zm-8 11v7h16v-7h2v9H2v-9h2z"/></svg> at the bottom, then choose <strong>"Add to Home Screen"</strong>.</span>
        </div>
        <div class="mz-pwa-actions">
          <button class="mz-pwa-btn-primary" id="mz-pwa-dismiss-btn" style="flex:1;">Got it</button>
        </div>
      `;
    } else {
      actionHTML = `
        <div class="mz-pwa-actions">
          <button class="mz-pwa-btn-secondary" id="mz-pwa-later-btn">Later</button>
          <button class="mz-pwa-btn-primary" id="mz-pwa-install-btn">
            <svg style="width:16px;height:16px;fill:currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
            Install App
          </button>
        </div>
      `;
    }

    wrapper.innerHTML = `
      <div class="mz-pwa-banner" role="dialog" aria-label="Install Mount Zion App">
        <div class="mz-pwa-header">
          <div class="mz-pwa-icon-box">
            <img src="${iconSrc}" alt="Mount Zion Logo" onerror="this.onerror=null;this.parentElement.innerHTML='<svg viewBox=\\'0 0 24 24\\'><path d=\\'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM3.89 15.67L12 20.09l8.11-4.42-1.41-2.48L12 17.09l-6.7-3.9-1.41 2.48z\\'/></svg>'">
          </div>
          <div class="mz-pwa-info">
            <div class="mz-pwa-title-row">
              <h3 class="mz-pwa-title">Mount Zion 360°</h3>
              <span class="mz-pwa-badge">Offline Ready</span>
            </div>
            <p class="mz-pwa-desc">Install for full screen & instant offline campus tours.</p>
          </div>
          <button class="mz-pwa-close-btn" id="mz-pwa-close-btn" aria-label="Close">✕</button>
        </div>
        ${actionHTML}
      </div>
    `;

    document.body.appendChild(wrapper);
    bannerElement = wrapper;

    // Attach button listeners
    const closeBtn = wrapper.querySelector('#mz-pwa-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', dismissBanner);

    const laterBtn = wrapper.querySelector('#mz-pwa-later-btn');
    if (laterBtn) laterBtn.addEventListener('click', dismissBanner);

    const dismissBtn = wrapper.querySelector('#mz-pwa-dismiss-btn');
    if (dismissBtn) dismissBtn.addEventListener('click', dismissBanner);

    const installBtn = wrapper.querySelector('#mz-pwa-install-btn');
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
          // Fallback if browser prompt isn't directly triggerable
          alert('To install, open your browser menu (⋮ or ...) and click "Install Mount Zion Virtual Campus" or "Add to Home Screen".');
          dismissBanner();
          return;
        }

        try {
          deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          console.log('[PWA Install] User choice:', choiceResult.outcome);
          deferredPrompt = null;
        } catch (err) {
          console.warn('[PWA Install] Prompt error:', err);
        }
        dismissBanner();
      });
    }

    // Reveal with smooth 3.5s delay
    setTimeout(() => {
      wrapper.classList.add('mz-show');
    }, 3500);
  }

  function dismissBanner() {
    if (bannerElement) {
      bannerElement.classList.remove('mz-show');
      setTimeout(() => {
        if (bannerElement && bannerElement.parentNode) {
          bannerElement.parentNode.removeChild(bannerElement);
        }
      }, 600);
    }
    // Remember dismissal for 7 days
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  // Initialize CSS
  injectCSS();

  // Listen for beforeinstallprompt on Chromium (Desktop Chrome/Edge, Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA Install] beforeinstallprompt captured.');
    createBanner('default');
  });

  // Handle iOS Safari
  if (isIOS) {
    createBanner('ios');
  }

  // Fallback for Desktop where beforeinstallprompt may not fire or was already fired
  setTimeout(() => {
    if (!bannerElement && !isIOS && !isStandalone) {
      // Check if user is on Chrome or Edge desktop
      const isDesktopChromium = /Chrome|Edg/.test(navigator.userAgent) && !/Android|Mobile/.test(navigator.userAgent);
      if (isDesktopChromium) {
        createBanner('default');
      }
    }
  }, 4500);
})();

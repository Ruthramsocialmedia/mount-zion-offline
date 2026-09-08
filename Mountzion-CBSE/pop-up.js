(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════════
     AUTO OPEN POPUP
     Directly loads the Playground GSV without confirmation
     ═══════════════════════════════════════════════════════ */

  /* ─── Load own CDNs (self-contained) ─── */
  // Font Awesome 6
  if (!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]')) {
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    fa.crossOrigin = "anonymous";
    document.head.appendChild(fa);
  }

  // Satoshi Font
  if (!document.querySelector('link[href*="satoshi"]')) {
    const satoshi = document.createElement("link");
    satoshi.rel = "stylesheet";
    satoshi.href = "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800&display=swap";
    document.head.appendChild(satoshi);
  }

  /* ─── Keyframes (inject once) ─── */
  if (!document.getElementById("dv-popup-iframe-styles")) {
    const style = document.createElement("style");
    style.id = "dv-popup-iframe-styles";
    style.textContent = `
      @keyframes dvFadeIn   { from { opacity: 0; } to { opacity: 1; } }
      @keyframes dvFadeOut  { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  /* ─── Helpers ─── */
  function s(el, styles) { Object.assign(el.style, styles); }

  /* ─── Iframe Popup Builder ─── */
  function openIframePopup(url) {
    const backdrop = document.createElement("div");
    s(backdrop, {
      position: "fixed",
      top: "0", left: "0", width: "100%", height: "100%",
      background: "rgba(15, 23, 42, 0.4)", // Darkish glassmorphism
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      zIndex: "100030",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "dvFadeIn 0.35s ease forwards",
      boxSizing: "border-box"
    });

    const box = document.createElement("div");
    s(box, {
      width: "95%",
      height: "95%",
      position: "relative",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "24px",
      boxShadow: "0 32px 64px rgba(0, 0, 0, 0.3)",
      overflow: "hidden",
      transform: "translateY(30px) scale(0.95)",
      opacity: "0",
      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      display: "flex",
      flexDirection: "column"
    });

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    s(closeBtn, {
      position: "absolute",
      top: "20px", right: "20px",
      width: "48px", height: "48px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      color: "#FFFFFF",
      display: "grid", placeItems: "center",
      cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      padding: "0", zIndex: "10"
    });
    closeBtn.onmouseenter = () => { s(closeBtn, { background: "rgba(255, 255, 255, 0.35)", transform: "scale(1.1) rotate(90deg)" }); };
    closeBtn.onmouseleave = () => { s(closeBtn, { background: "rgba(255, 255, 255, 0.2)", transform: "scale(1) rotate(0deg)" }); };

    closeBtn.onclick = closeIframePopup;
    box.appendChild(closeBtn);

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    s(iframe, {
      width: "100%", height: "100%",
      border: "none", flex: "1", background: "transparent",
      borderRadius: "24px"
    });
    box.appendChild(iframe);

    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        s(box, { transform: "translateY(0) scale(1)", opacity: "1" });
      });
    });

    const escIframeHandler = (e) => {
      if (e.key === "Escape") closeIframePopup();
    };
    document.addEventListener("keydown", escIframeHandler);

    function closeIframePopup() {
      s(box, { transform: "translateY(30px) scale(0.95)", opacity: "0" });
      backdrop.style.animation = "dvFadeOut 0.4s ease forwards";
      setTimeout(() => { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); }, 400);
      document.removeEventListener("keydown", escIframeHandler);
    }

    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeIframePopup(); });
  }

  // --- Auto-open Playground GSV directly ---
  const PLAYGROUND_GSV_URL = "https://www.google.com/maps/embed?pb=!4v1777956212487!6m8!1m7!1sCAoSHENJQUJJaEJsNFJUV1h1RnRVbUw0Y2hZaFdDRk0.!2m2!1d10.36481887887262!2d78.80652094182369!3f313.5526187210199!4f-4.769998163748056!5f0.7820865974627469";
  const AUTO_OPEN_DELAY = 800; // 800ms delay to match the original feel

  const go = () => setTimeout(() => openIframePopup(PLAYGROUND_GSV_URL), AUTO_OPEN_DELAY);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }

})();

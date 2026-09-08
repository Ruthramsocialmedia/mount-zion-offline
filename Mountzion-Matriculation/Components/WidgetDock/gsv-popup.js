// ═══════════════════════════════════════════════════════════
//  GSV POPUP — Google Street View Iframe Popup
//  Glassmorphism overlay with embedded Google Maps Street View
//  Same style as 3dvista.js iframe popup
// ═══════════════════════════════════════════════════════════
(function () {

    /* ─── Keyframes (inject once) ─── */
    const style = document.createElement("style");
    style.id = "gsv-popup-styles";
    style.textContent = `
        @keyframes gsvFadeIn   { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gsvFadeOut  { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(style);

    /* ─── Helpers ─── */
    function s(el, styles) { Object.assign(el.style, styles); }

    /* ─── GSV Iframe URL ─── */
    const GSV_URL = "https://www.google.com/maps/embed?pb=!4v1777869963655!6m8!1m7!1sCAoSHENJQUJJaER4bkZXYnRKVFpXUGYwREp4c1pzSzY.!2m2!1d10.36419836975969!2d78.8052162336929!3f111.6034466903604!4f12.59047100930843!5f0.7820865974627469";

    /* ─── Open Popup ─── */
    function openGsvPopup() {
        const backdrop = document.createElement("div");
        s(backdrop, {
            position: "fixed",
            top: "0", left: "0", width: "100%", height: "100%",
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: "100030",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "gsvFadeIn 0.35s ease forwards",
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
        closeBtn.onmouseenter = function () { s(closeBtn, { background: "rgba(255, 255, 255, 0.35)", transform: "scale(1.1) rotate(90deg)" }); };
        closeBtn.onmouseleave = function () { s(closeBtn, { background: "rgba(255, 255, 255, 0.2)", transform: "scale(1) rotate(0deg)" }); };
        closeBtn.onclick = closePopup;
        box.appendChild(closeBtn);

        if (!navigator.onLine) {
            const offlineNotice = document.createElement("div");
            s(offlineNotice, {
                flex: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                textAlign: "center",
                padding: "24px",
                fontFamily: "'Satoshi', sans-serif"
            });
            offlineNotice.innerHTML = `
                <div style="font-size: 52px; margin-bottom: 16px; color: #96C0E6;"><i class="fa-solid fa-cloud-slash"></i></div>
                <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #FFFFFF;">Google Street View is Offline</h2>
                <p style="margin: 0 0 24px; max-width: 460px; color: #D4E8F7; font-size: 15px; line-height: 1.6;">
                    Live Google Street View requires an active internet connection. The complete 360° Virtual Tour of classrooms and campus facilities is available offline.
                </p>
                <button id="gsv-offline-close-btn" style="
                    background: linear-gradient(135deg, #2F5E8E, #1E3A5F);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.25);
                    padding: 14px 28px;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 8px 24px rgba(30, 58, 95, 0.4);
                ">
                    <i class="fa-solid fa-panorama"></i> Continue 360° Virtual Tour
                </button>
            `;
            box.appendChild(offlineNotice);
            setTimeout(function () {
                const btn = offlineNotice.querySelector("#gsv-offline-close-btn");
                if (btn) btn.addEventListener("click", closePopup);
            }, 50);
        } else {
            const iframe = document.createElement("iframe");
            iframe.src = GSV_URL;
            iframe.setAttribute("allowfullscreen", "");
            iframe.setAttribute("loading", "lazy");
            iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
            s(iframe, {
                width: "100%", height: "100%",
                border: "none", flex: "1", background: "transparent",
                borderRadius: "24px"
            });
            box.appendChild(iframe);
        }

        backdrop.appendChild(box);
        document.body.appendChild(backdrop);

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                s(box, { transform: "translateY(0) scale(1)", opacity: "1" });
            });
        });

        var escHandler = function (e) {
            if (e.key === "Escape") closePopup();
        };
        document.addEventListener("keydown", escHandler);

        function closePopup() {
            s(box, { transform: "translateY(30px) scale(0.95)", opacity: "0" });
            backdrop.style.animation = "gsvFadeOut 0.4s ease forwards";
            setTimeout(function () {
                if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
            }, 400);
            document.removeEventListener("keydown", escHandler);
        }

        backdrop.addEventListener("click", function (e) {
            if (e.target === backdrop) closePopup();
        });
    }

    /* ─── Public API ─── */
    window.openGsvPopup = openGsvPopup;

    /* ─── Listen for WidgetDock GSV button click ─── */
    document.addEventListener("menuItemClick", function (e) {
        if (e.detail && e.detail.id === "menu-street-view") {
            openGsvPopup();
        }
    });

})();

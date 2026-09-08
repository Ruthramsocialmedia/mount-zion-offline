// ═══════════════════════════════════════════════════════════
//  GSV MULTI POPUP — Google Street View Sports Category
//  Opens a glassmorphism iframe popup for each sports GSV link
// ═══════════════════════════════════════════════════════════
(function () {

    /* ─── Keyframes (inject once) ─── */
    if (!document.getElementById("gsv-multi-popup-styles")) {
        const style = document.createElement("style");
        style.id = "gsv-multi-popup-styles";
        style.textContent = `
            @keyframes gsvMultiFadeIn  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes gsvMultiFadeOut { from { opacity: 1; } to { opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    /* ─── Helpers ─── */
    function s(el, styles) { Object.assign(el.style, styles); }

    /* ─── GSV Sports URL Map ─── */
    const GSV_ITEMS = {
        "menu-gsv-playground": {
            label: "Playground",
            url: "https://www.google.com/maps/embed?pb=!4v1777956212487!6m8!1m7!1sCAoSHENJQUJJaEJsNFJUV1h1RnRVbUw0Y2hZaFdDRk0.!2m2!1d10.36481887887262!2d78.80652094182369!3f313.5526187210199!4f-4.769998163748056!5f0.7820865974627469"
        }
    };

    /* ─── Open Popup ─── */
    function openGsvMultiPopup(iframeSrc, titleLabel, menuItemId) {
        const backdrop = document.createElement("div");
        s(backdrop, {
            position: "fixed",
            top: "0", left: "0", width: "100%", height: "100%",
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
            zIndex: "100030",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "gsvMultiFadeIn 0.4s ease forwards",
            boxSizing: "border-box"
        });

        const box = document.createElement("div");
        s(box, {
            width: "95%",
            height: "95%",
            position: "relative",
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(150, 192, 230, 0.2)",
            borderRadius: "20px",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
            transform: "translateY(40px) scale(0.95)",
            opacity: "0",
            transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            display: "flex",
            flexDirection: "column"
        });

        /* ─── Premium Title Bar ─── */
        if (titleLabel) {
            const titleBar = document.createElement("div");
            s(titleBar, {
                padding: "16px 24px",
                background: "linear-gradient(135deg, rgba(47, 94, 142, 0.9), rgba(30, 58, 95, 0.95))",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(150, 192, 230, 0.15)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                flexShrink: "0",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                zIndex: "2"
            });

            const iconContainer = document.createElement("div");
            s(iconContainer, {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(150, 192, 230, 0.15)",
                border: "1px solid rgba(150, 192, 230, 0.25)",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.1)"
            });

            const icon = document.createElement("i");
            icon.className = "fa-solid fa-street-view";
            s(icon, { color: "#96C0E6", fontSize: "18px" });
            iconContainer.appendChild(icon);

            const titleWrapper = document.createElement("div");
            s(titleWrapper, {
                display: "flex",
                flexDirection: "column",
                gap: "2px"
            });

            const subtitleText = document.createElement("span");
            subtitleText.textContent = "Google Street View";
            s(subtitleText, {
                color: "#96C0E6",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.8px"
            });

            const titleText = document.createElement("span");
            titleText.textContent = titleLabel;
            s(titleText, {
                color: "#FFFFFF",
                fontSize: "17px",
                fontWeight: "700",
                fontFamily: "'Satoshi', 'Inter', sans-serif",
                letterSpacing: "-0.2px"
            });

            titleWrapper.appendChild(subtitleText);
            titleWrapper.appendChild(titleText);

            titleBar.appendChild(iconContainer);
            titleBar.appendChild(titleWrapper);
            box.appendChild(titleBar);
        }

        /* ─── Premium Close Button ─── */
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        s(closeBtn, {
            position: "absolute",
            top: "16px", right: "20px",
            width: "40px", height: "40px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            color: "#FFFFFF",
            fontSize: "18px",
            display: "grid", placeItems: "center",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            padding: "0", zIndex: "10"
        });
        closeBtn.onmouseenter = function () { 
            s(closeBtn, { 
                background: "rgba(244, 124, 32, 0.9)", // Brand Orange
                borderColor: "rgba(244, 124, 32, 1)",
                color: "#FFF",
                transform: "scale(1.1) rotate(90deg)" 
            }); 
        };
        closeBtn.onmouseleave = function () { 
            s(closeBtn, { 
                background: "rgba(255, 255, 255, 0.1)", 
                borderColor: "rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                transform: "scale(1) rotate(0deg)" 
            }); 
        };
        closeBtn.onclick = closePopup;
        box.appendChild(closeBtn);

        /* ─── Iframe ─── */
        const iframe = document.createElement("iframe");
        iframe.src = iframeSrc;
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("loading", "lazy");
        iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
        s(iframe, {
            width: "100%", height: "100%",
            border: "none", flex: "1", background: "#0F172A",
            borderRadius: titleLabel ? "0 0 20px 20px" : "20px"
        });
        box.appendChild(iframe);

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
            backdrop.style.animation = "gsvMultiFadeOut 0.4s ease forwards";
            setTimeout(function () {
                if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
            }, 400);
            document.removeEventListener("keydown", escHandler);
            // ── Deactivate the menu item that opened this popup ──
            if (menuItemId) {
                document.dispatchEvent(new CustomEvent("menuItemDeactivate", {
                    detail: { id: menuItemId }
                }));
            }
        }

        backdrop.addEventListener("click", function (e) {
            if (e.target === backdrop) closePopup();
        });
    }

    /* ─── Listen for Menu Item Clicks ─── */
    document.addEventListener("menuItemClick", function (e) {
        if (e.detail && GSV_ITEMS[e.detail.id]) {
            const item = GSV_ITEMS[e.detail.id];
            openGsvMultiPopup(item.url, item.label, e.detail.id);
        }
    });

    /* ─── Public API ─── */
    window.openGsvMultiPopup = openGsvMultiPopup;
    window.GSV_MULTI_ITEMS = GSV_ITEMS;

})();

// ═══════════════════════════════════════════════════════════
//  GSV MULTI POPUP — Google Street View Sports Category
//  Opens a glassmorphism iframe popup for each sports GSV link
//  Same style as gsv-popup.js
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
        "menu-gsv-tennis": {
            label: "Tennis Court",
            url: "https://www.google.com/maps/embed?pb=!4v1777894267978!6m8!1m7!1sCAoSHENJQUJJaEJoZEpHa3FERE02VXY4elVFVmNPWWg.!2m2!1d10.29344841876125!2d78.76173498488328!3f129.6701289131716!4f-1.2718029085130098!5f0.7820865974627469"
        },
        "menu-gsv-football1": {
            label: "Handball Ground",
            url: "https://www.google.com/maps/embed?pb=!4v1777894321135!6m8!1m7!1sCAoSHENJQUJJaEF4NC1rN1N3dmVaNHUwcWhSMHZPRTg.!2m2!1d10.29311186816861!2d78.76162775977497!3f124.6612843728737!4f-9.763624475498972!5f0.7820865974627469"
        },
        "menu-gsv-volleyball1": {
            label: "Volleyball Court I",
            url: "https://www.google.com/maps/embed?pb=!4v1777894352317!6m8!1m7!1sCAoSHENJQUJJaENsTDd1MFFHcnptLWE1cW5DdTJJZDk.!2m2!1d10.29275923879309!2d78.76163424516788!3f144.89378273663644!4f-5.509546864980322!5f0.7820865974627469"
        },
        "menu-gsv-volleyball2": {
            label: "Volleyball Court II",
            url: "https://www.google.com/maps/embed?pb=!4v1777894386606!6m8!1m7!1sCAoSHENJQUJJaEFIRHlfUFgwZ0FwZzNOV1ZSSmhHSmM.!2m2!1d10.29248903316379!2d78.76160519060429!3f138.6977928195187!4f-1.5937425600103694!5f0.7820865974627469"
        },
        "menu-gsv-basketball2": {
            label: "Basketball Court I",
            url: "https://www.google.com/maps/embed?pb=!4v1777894436662!6m8!1m7!1sCAoSHENJQUJJaEJoWEJpX2tiVllZMWU1UGtSYUd5eWw.!2m2!1d10.29236872702032!2d78.76150652608504!3f228.76439567327904!4f-7.864898537591628!5f0.7820865974627469"
        },
        "menu-gsv-basketball3": {
            label: "Basketball Court II",
            url: "https://www.google.com/maps/embed?pb=!4v1777894458973!6m8!1m7!1sCAoSHENJQUJJaERZQ0tRaktXQmZhMjRCUDVoZzQ5RWk.!2m2!1d10.2922732866054!2d78.7613309877399!3f247.40538989399607!4f-7.2165060694833585!5f0.7820865974627469"
        },
        "menu-gsv-swimming": {
            label: "Swimming Pool",
            url: "https://www.google.com/maps/embed?pb=!4v1777894614349!6m8!1m7!1sCAoSHENJQUJJaERwOXUzbVBSNHg4SFo1V09BNEpNODQ.!2m2!1d10.29202825268553!2d78.7608478665572!3f347.80534028209905!4f-10.51158349566451!5f0.7820865974627469"
        },
        "menu-gsv-running": {
            label: "Running Track",
            url: "https://www.google.com/maps/embed?pb=!4v1777894853077!6m8!1m7!1sCAoSHENJQUJJaERYMmZFUFZ4S2pFc1MycnFlamFHWlc.!2m2!1d10.29249878264672!2d78.76149355528203!3f134.93511360312485!4f-9.107459215280187!5f0.7820865974627469"
        },
        "menu-gsv-football": {
            label: "Football Ground",
            url: "https://www.google.com/maps/embed?pb=!4v1777895279052!6m8!1m7!1sCAoSHENJQUJJaEFwazhCUmoxSDQ1YUNtWi1yaTVxUEo.!2m2!1d10.29331093732107!2d78.76160778476212!3f268.48028284503766!4f-10.00818542014673!5f0.7820865974627469"
        },
        "menu-gsv-cricket": {
            label: "Cricket Net Practice Area",
            url: "https://www.google.com/maps/embed?pb=!4v1777967520110!6m8!1m7!1sCAoSHENJQUJJaENXTXNZRE5uRzN3NHhMMWhpNmdtZGo.!2m2!1d10.29351978718858!2d78.76170376855326!3f192.36326804611366!4f-5.9878901322478555!5f0.7820865974627469"
        }
    };

    /* ─── Open Popup ─── */
    function openGsvMultiPopup(iframeSrc, titleLabel) {
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
        }

        backdrop.addEventListener("click", function (e) {
            if (e.target === backdrop) closePopup();
        });
    }

    /* ─── Listen for Menu Item Clicks ─── */
    document.addEventListener("menuItemClick", function (e) {
        if (e.detail && GSV_ITEMS[e.detail.id]) {
            const item = GSV_ITEMS[e.detail.id];
            openGsvMultiPopup(item.url, item.label);
        }
    });

    /* ─── Public API ─── */
    window.openGsvMultiPopup = openGsvMultiPopup;
    window.GSV_MULTI_ITEMS = GSV_ITEMS;

})();

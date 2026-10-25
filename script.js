(() => {
    "use strict";

    const CONFIG = Object.freeze({
        dailyRefreshMs: 24 * 60 * 60 * 1000,
        themeStorageKey: "theme",
        themes: Object.freeze({
            dark: Object.freeze({
                name: "dark",
                icon: "☀",
                metaColor: "#28282B",
            }),
            light: Object.freeze({
                name: "light",
                icon: "🌙",
                metaColor: "#f8f9fb",
            }),
        }),
    });

    const root = document.documentElement;
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    function getStoredTheme() {
        try {
            return window.localStorage.getItem(CONFIG.themeStorageKey);
        } catch (_error) {
            return null;
        }
    }

    function setStoredTheme(theme) {
        try {
            window.localStorage.setItem(CONFIG.themeStorageKey, theme);
        } catch (_error) {
            // Storage can be unavailable in private browsing or locked-down environments.
        }
    }

    function normalizeTheme(theme) {
        return theme === CONFIG.themes.light.name ? CONFIG.themes.light : CONFIG.themes.dark;
    }

    function syncTheme(theme, toggleButton = document.getElementById("themeToggle")) {
        const activeTheme = normalizeTheme(theme);
        const isLight = activeTheme.name === CONFIG.themes.light.name;

        if (isLight) {
            root.setAttribute("data-theme", CONFIG.themes.light.name);
        } else {
            root.removeAttribute("data-theme");
        }

        if (toggleButton) {
            toggleButton.textContent = activeTheme.icon;
            toggleButton.setAttribute("aria-pressed", String(isLight));
        }

        if (themeMeta) {
            themeMeta.setAttribute("content", activeTheme.metaColor);
        }
    }

    function initThemeToggle() {
        const toggleButton = document.getElementById("themeToggle");
        syncTheme(getStoredTheme(), toggleButton);

        if (!toggleButton) return;

        toggleButton.addEventListener("click", () => {
            const nextTheme = root.getAttribute("data-theme") === CONFIG.themes.light.name
                ? CONFIG.themes.dark.name
                : CONFIG.themes.light.name;

            setStoredTheme(nextTheme);
            syncTheme(nextTheme, toggleButton);
        });
    }

    function initSharedTodayDate() {
        const nodes = document.querySelectorAll("[data-today-date], #today-date");
        if (!nodes.length) return;

        let dailyIntervalId = null;
        let midnightTimeoutId = null;

        function formatToday(date = new Date()) {
            return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        }

        function renderToday() {
            const value = formatToday();
            nodes.forEach((node) => {
                node.textContent = value;
            });
        }

        function scheduleNextUpdate() {
            const now = new Date();
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);

            if (midnightTimeoutId !== null) {
                window.clearTimeout(midnightTimeoutId);
            }

            midnightTimeoutId = window.setTimeout(() => {
                renderToday();

                if (dailyIntervalId !== null) {
                    window.clearInterval(dailyIntervalId);
                }

                dailyIntervalId = window.setInterval(renderToday, CONFIG.dailyRefreshMs);
            }, nextMidnight.getTime() - now.getTime());
        }

        renderToday();
        scheduleNextUpdate();
    }

    // Randomise card order on every page load (Fisher-Yates shuffle).
    function shuffleCards(track) {
        const cards = Array.from(track.querySelectorAll(":scope > .blog-card"));
        for (let i = cards.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        cards.forEach((card) => track.appendChild(card));
        track.scrollLeft = 0;
    }

    function initBlogCarousel() {
        const carousels = document.querySelectorAll("[data-carousel]");

        carousels.forEach((carousel) => {
            const track = carousel.querySelector("[data-carousel-track]");
            const prevButton = carousel.querySelector("[data-carousel-prev]");
            const nextButton = carousel.querySelector("[data-carousel-next]");
            if (!track || !prevButton || !nextButton) return;

            shuffleCards(track);

            let buttonFrameId = null;

            function getScrollAmount() {
                const firstCard = track.querySelector(".blog-card");
                if (!firstCard) return track.clientWidth;

                const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
                return firstCard.getBoundingClientRect().width + gap;
            }

            function updateButtons() {
                const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
                prevButton.disabled = track.scrollLeft <= 2;
                nextButton.disabled = track.scrollLeft >= maxScroll;
            }

            function requestButtonUpdate() {
                if (buttonFrameId !== null) return;

                buttonFrameId = window.requestAnimationFrame(() => {
                    buttonFrameId = null;
                    updateButtons();
                });
            }

            prevButton.addEventListener("click", () => {
                track.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
            });

            nextButton.addEventListener("click", () => {
                track.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
            });

            track.addEventListener("scroll", requestButtonUpdate, { passive: true });
            window.addEventListener("resize", requestButtonUpdate, { passive: true });
            updateButtons();
        });
    }

    function initBackButtons() {
        document.querySelectorAll("[data-history-back]").forEach((button) => {
            button.addEventListener("click", () => {
                const cameFromThisSite = document.referrer.startsWith(window.location.origin);

                if (cameFromThisSite && window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = "/";
                }
            });
        });
    }

    function initFooterConfetti() {
        const footer = document.querySelector(".site-footer");
        if (!footer || typeof Element.prototype.animate !== "function") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const motto = document.querySelector(".motto-section blockquote");
        let armed = true;

        function burst() {
            const rect = footer.getBoundingClientRect();
            let startX;
            let spread;
            if (motto) {
                const mottoRect = motto.getBoundingClientRect();
                startX = mottoRect.left;
                spread = mottoRect.width;
            } else {
                // Pages without the motto: measure a hidden copy so the confetti matches its width.
                const probe = document.createElement("section");
                probe.className = "motto-section";
                probe.style.cssText = "visibility:hidden;height:0;overflow:hidden;margin:0;";
                probe.innerHTML = "<blockquote>WORK HARD &amp; BE NICE TO PEOPLE</blockquote>";
                (document.querySelector("main") || document.body).appendChild(probe);
                spread = probe.firstElementChild.getBoundingClientRect().width;
                probe.remove();
                startX = rect.left + (rect.width - spread) / 2;
            }
            for (let i = 0; i < 40; i += 1) {
                const piece = document.createElement("span");
                const size = 4 + Math.random() * 5;
                piece.setAttribute("aria-hidden", "true");
                piece.style.cssText = `position:fixed;left:${startX + Math.random() * spread}px;top:${rect.top}px;`
                    + `width:${size}px;height:${size * 0.6}px;background:var(--accent);border-radius:1px;`
                    + "pointer-events:none;z-index:9999;";
                document.body.appendChild(piece);

                const dx = (Math.random() - 0.5) * 120;
                const dy = -(60 + Math.random() * 120);
                const spin = (Math.random() - 0.5) * 720;
                piece.animate([
                    { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
                    { transform: `translate(${dx}px, ${dy}px) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.5 },
                    { transform: `translate(${dx * 1.4}px, ${dy * 0.4}px) rotate(${spin}deg)`, opacity: 0 },
                ], { duration: 1200 + Math.random() * 500, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" })
                    .onfinish = () => piece.remove();
            }
        }

        window.addEventListener("scroll", () => {
            const distanceFromBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
            if (armed && distanceFromBottom <= 2) {
                armed = false;
                burst();
            } else if (distanceFromBottom > 100) {
                armed = true;
            }
        }, { passive: true });
    }

    syncTheme(getStoredTheme());

    document.addEventListener("DOMContentLoaded", () => {
        initThemeToggle();
        initSharedTodayDate();
        initBlogCarousel();
        initBackButtons();
        initFooterConfetti();
    });
})();

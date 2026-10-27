(() => {
    "use strict";

    // ==========================================================================
    //   The one list of blog posts.
    //
    //   Every blog card on the site (the Blog Hub grid and every
    //   "More Blog Posts" / "Blog" carousel) is built from this list.
    //   To publish a new article, add an entry here. No other page
    //   needs editing.
    //
    //   url       Page address, e.g. "/LavaLamps" for LavaLamps.html
    //   image     Card image file in the site folder
    //   tag       Small yellow label above the title
    //   title     Card heading
    //   summary   One or two sentences shown on the card
    //   carousel  false = Blog Hub grid only (e.g. placeholders)
    //
    //   The Blog Hub grid shows posts in the order below.
    //   Carousels shuffle them on every load and leave out the page you're on.
    // ==========================================================================

    const POSTS = [
        {
            url: "/velocihacktor",
            image: "velocihacktor.webp",
            tag: "Insider Threats",
            title: "Jurassic Park was an inside job.",
            summary: "In the classic 1994 movie Jurassic Park, deliberate power sabotage causes the physical security system to fail and chaos to follow.",
        },
        {
            url: "/IoTBlockchain",
            image: "IoT.webp",
            tag: "Blockchain + IoT",
            title: "Ethereum Blockchain for IoT Node Transaction Authentication",
            summary: "Can blockchain be used to authenticate communications between IoT devices in a simulated network? Yes, but it is complicated.",
        },
        {
            url: "/PiHole",
            image: "pihole-top.webp",
            tag: "Networking",
            title: "Shut your Pi-hole. Adkiller Writeup",
            summary: "Last year I set up a Pi-hole and since then my life has significantly improved. Bricking the internet in my home and scrambling to fix my home network at 08:59 before starting work. No pain no gain.",
        },
        {
            url: "/",
            image: "image.png",
            tag: "Infrastructure",
            title: "We're gonna need a bigger cable",
            summary: "The internet is under the ocean. This article highlights the genuine problem of undersea cables getting eaten by sharks. Genuinely. Writing coming soon.",
        },
        {
            url: "/LavaLamps",
            image: "lavalamps-waves.webp",
            tag: "Encryption",
            title: "The internet is protected by lava lamps",
            summary: "A write-up on Cloudflare's obscure yet effective lava lamp wall encryption method, highlighting strength in randomisation.",
        },
        {
            url: "/SecurityHeaders",
            image: "securityheaders.webp",
            tag: "Web Security",
            title: "Top of the class. A+ security headers",
            summary: "hamiltonhacks.com now scores an A+ on securityheaders.com. What security headers are, what that grade means, and how Cloudflare added them for free.",
        },
        {
            url: "/",
            image: "image.png",
            tag: "Lorem Ipsum Dolor Sit Amet",
            title: "Lorem Ipsum Dolor Sit Amet",
            summary: "Lorem Ipsum Dolor Sit Amet",
            carousel: false,
        },
        {
            url: "/",
            image: "image.png",
            tag: "Lorem Ipsum Dolor Sit Amet",
            title: "Lorem Ipsum Dolor Sit Amet",
            summary: "Lorem Ipsum Dolor Sit Amet",
            carousel: false,
        },
        {
            url: "/",
            image: "image.png",
            tag: "Lorem Ipsum Dolor Sit Amet",
            title: "Lorem Ipsum Dolor Sit Amet",
            summary: "Lorem Ipsum Dolor Sit Amet",
            carousel: false,
        },
        {
            url: "/",
            image: "image.png",
            tag: "Lorem Ipsum Dolor Sit Amet",
            title: "Lorem Ipsum Dolor Sit Amet",
            summary: "Lorem Ipsum Dolor Sit Amet",
            carousel: false,
        },
        {
            url: "/",
            image: "image.png",
            tag: "Lorem Ipsum Dolor Sit Amet",
            title: "Lorem Ipsum Dolor Sit Amet",
            summary: "Lorem Ipsum Dolor Sit Amet",
            carousel: false,
        },
    ];

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
        } catch {
            return null;
        }
    }

    function setStoredTheme(theme) {
        try {
            window.localStorage.setItem(CONFIG.themeStorageKey, theme);
        } catch {
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
        const nodes = document.querySelectorAll("[data-today-date]");
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

    // ----------------------------------------------------------------------
    // Blog cards, built from POSTS at the top of this file.
    // ----------------------------------------------------------------------

    // Card images are resolved relative to script.js, so they work on every
    // page (including the 404 page at any address) and when opened locally.
    const ASSET_BASE = (document.querySelector('script[src$="script.js"]') || {}).src || window.location.href;

    function pageName(path) {
        const last = path.split("/").filter(Boolean).pop() || "";
        return last.replace(/\.html$/i, "").toLowerCase();
    }

    const CURRENT_PAGE = pageName(window.location.pathname);

    function buildCard(post) {
        const card = document.createElement("a");
        card.className = "blog-card";
        card.href = post.url;
        card.setAttribute("aria-label", `Read blog post: ${post.title}`);

        const image = document.createElement("img");
        image.className = "blog-card-image";
        image.src = new URL(post.image, ASSET_BASE).href;
        image.alt = "";
        image.loading = "lazy";

        const tag = document.createElement("p");
        tag.className = "blog-meta";
        tag.textContent = post.tag;

        const title = document.createElement("h3");
        title.textContent = post.title;

        const summary = document.createElement("p");
        summary.textContent = post.summary;

        const more = document.createElement("span");
        more.className = "blog-card-link";
        more.setAttribute("aria-hidden", "true");
        more.textContent = "Read More";

        card.append(image, tag, title, summary, more);
        return card;
    }

    // Fisher-Yates shuffle: a fresh random order on every load.
    function shuffled(list) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // Blog Hub grid: every post, in list order.
    function renderPostGrid() {
        document.querySelectorAll("[data-post-grid]").forEach((grid) => {
            grid.replaceChildren(...POSTS.map(buildCard));
        });
    }

    // Placeholder cards link to "/" and are never treated as the current page.
    function isCurrentPage(post) {
        return post.url !== "/" && pageName(post.url) === CURRENT_PAGE;
    }

    // Carousels: shuffled, without placeholders or the page you're on.
    function renderCarouselCards(track) {
        const posts = POSTS.filter((post) => post.carousel !== false && !isCurrentPage(post));
        track.replaceChildren(...shuffled(posts).map(buildCard));
        track.scrollLeft = 0;
    }

    function initBlogCarousel() {
        const carousels = document.querySelectorAll("[data-carousel]");

        carousels.forEach((carousel) => {
            const track = carousel.querySelector("[data-carousel-track]");
            const prevButton = carousel.querySelector("[data-carousel-prev]");
            const nextButton = carousel.querySelector("[data-carousel-next]");
            if (!track || !prevButton || !nextButton) return;

            renderCarouselCards(track);

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

    // Click / tap an article image to view it full screen.
    // Closes with the X button, a click / tap outside the image, or Escape.
    function initImageLightbox() {
        const images = document.querySelectorAll(".blog-post-shell .blog-post-hero-image img");
        if (!images.length) return;

        const overlay = document.createElement("div");
        overlay.className = "lightbox";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Expanded image");
        overlay.hidden = true;
        overlay.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image">&times;</button>'
            + '<img class="lightbox-image" alt="">';
        document.body.appendChild(overlay);

        const closeButton = overlay.querySelector(".lightbox-close");
        const bigImage = overlay.querySelector(".lightbox-image");
        let opener = null;

        function open(img) {
            opener = img;
            bigImage.src = img.currentSrc || img.src;
            bigImage.alt = img.alt;
            overlay.hidden = false;
            document.body.classList.add("lightbox-open");
            closeButton.focus();
        }

        function close() {
            if (overlay.hidden) return;
            overlay.hidden = true;
            bigImage.removeAttribute("src");
            document.body.classList.remove("lightbox-open");
            if (opener) opener.focus();
        }

        images.forEach((img) => {
            img.classList.add("is-expandable");
            img.setAttribute("tabindex", "0");
            img.setAttribute("role", "button");
            img.setAttribute("aria-label", `Expand image: ${img.alt || "article image"}`);
            img.addEventListener("click", () => open(img));
            img.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open(img);
                }
            });
        });

        // Anything except the image itself closes it (backdrop or X).
        overlay.addEventListener("click", (event) => {
            if (event.target !== bigImage) close();
        });

        document.addEventListener("keydown", (event) => {
            if (overlay.hidden) return;
            if (event.key === "Escape") close();
            if (event.key === "Tab") {
                event.preventDefault();
                closeButton.focus();
            }
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
        renderPostGrid();
        initBlogCarousel();
        initBackButtons();
        initImageLightbox();
        initFooterConfetti();
    });
})();

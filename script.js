(() => {
    "use strict";

    const CONFIG = Object.freeze({
        mobileBackgroundQuery: "(max-width: 768px)",
        reducedMotionQuery: "(prefers-reduced-motion: reduce)",
        particleCount: 90,
        particleConnectionDistance: 140,
        particleMouseDistance: 160,
        particleMouseRepelStrength: 0.35,
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
            document.body?.setAttribute("data-theme", CONFIG.themes.light.name);
        } else {
            root.removeAttribute("data-theme");
            document.body?.setAttribute("data-theme", CONFIG.themes.dark.name);
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

    function addMediaChangeListener(mediaQuery, handler) {
        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", handler);
            return;
        }

        if (typeof mediaQuery.addListener === "function") {
            mediaQuery.addListener(handler);
        }
    }

    function initializeMovingBackground() {
        const canvas = document.getElementById("bg");
        if (!canvas) return;

        const mobileMedia = window.matchMedia(CONFIG.mobileBackgroundQuery);
        const reducedMotionMedia = window.matchMedia(CONFIG.reducedMotionQuery);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const particles = [];
        const mouse = { x: -9999, y: -9999, active: false };

        let width = 0;
        let height = 0;
        let animationId = null;
        let isRunning = false;
        let gradientTopColor = "#323236";
        let gradientBottomColor = "#28282b";
        let particleColor = "#ffc300";
        let lineColorRgb = "253,240,213";
        let resizeFrameId = null;

        function shouldRunBackground() {
            return !mobileMedia.matches && !reducedMotionMedia.matches;
        }

        function refreshBackgroundColors() {
            const styles = window.getComputedStyle(root);
            gradientTopColor = styles.getPropertyValue("--bg-secondary").trim() || "#323236";
            gradientBottomColor = styles.getPropertyValue("--bg-primary").trim() || "#28282b";
            particleColor = styles.getPropertyValue("--background-particle").trim() || "#ffc300";
            lineColorRgb = root.getAttribute("data-theme") === CONFIG.themes.light.name
                ? "30,31,35"
                : "253,240,213";
        }

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;

            const devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);
            canvas.width = Math.round(width * devicePixelRatio);
            canvas.height = Math.round(height * devicePixelRatio);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        }

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.r = Math.random() * 2 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (mouse.active) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < CONFIG.particleMouseDistance && dist > 0) {
                        this.x -= (dx / dist) * CONFIG.particleMouseRepelStrength;
                        this.y -= (dy / dist) * CONFIG.particleMouseRepelStrength;
                    }
                }

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
            }
        }

        function drawLine(a, b) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);

            if (dist >= CONFIG.particleConnectionDistance) return;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${lineColorRgb},${1 - dist / CONFIG.particleConnectionDistance})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        function drawGradient() {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, gradientTopColor);
            gradient.addColorStop(1, gradientBottomColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        function renderFrame() {
            if (!shouldRunBackground() || document.hidden) {
                stopAnimation();
                return;
            }

            drawGradient();

            for (const particle of particles) {
                particle.update();
                particle.draw();
            }

            for (let i = 0; i < particles.length; i += 1) {
                for (let j = i + 1; j < particles.length; j += 1) {
                    drawLine(particles[i], particles[j]);
                }
            }

            animationId = window.requestAnimationFrame(renderFrame);
        }

        function ensureParticles() {
            if (particles.length) return;

            for (let i = 0; i < CONFIG.particleCount; i += 1) {
                particles.push(new Particle());
            }
        }

        function startAnimation() {
            if (isRunning || !shouldRunBackground() || document.hidden) return;

            canvas.hidden = false;
            resizeCanvas();
            refreshBackgroundColors();
            ensureParticles();

            isRunning = true;
            renderFrame();
        }

        function stopAnimation() {
            if (animationId !== null) {
                window.cancelAnimationFrame(animationId);
            }

            animationId = null;
            isRunning = false;

            if (!shouldRunBackground()) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.hidden = true;
            }
        }

        function handleEnvironmentChange() {
            if (shouldRunBackground()) {
                startAnimation();
                return;
            }

            stopAnimation();
        }

        function handleResize() {
            if (resizeFrameId !== null) return;

            resizeFrameId = window.requestAnimationFrame(() => {
                resizeFrameId = null;
                resizeCanvas();
                handleEnvironmentChange();
            });
        }

        window.addEventListener("resize", handleResize, { passive: true });

        window.addEventListener("mousemove", (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
            mouse.active = true;
        }, { passive: true });

        window.addEventListener("mouseleave", () => {
            mouse.active = false;
        });

        window.addEventListener("mouseout", (event) => {
            if (!event.relatedTarget) mouse.active = false;
        });

        new MutationObserver(refreshBackgroundColors).observe(root, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopAnimation();
                return;
            }

            handleEnvironmentChange();
        });

        addMediaChangeListener(mobileMedia, handleEnvironmentChange);
        addMediaChangeListener(reducedMotionMedia, handleEnvironmentChange);

        handleEnvironmentChange();
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

    function initBlogCarousel() {
        const carousels = document.querySelectorAll("[data-carousel]");

        carousels.forEach((carousel) => {
            const track = carousel.querySelector("[data-carousel-track]");
            const prevButton = carousel.querySelector("[data-carousel-prev]");
            const nextButton = carousel.querySelector("[data-carousel-next]");
            if (!track || !prevButton || !nextButton) return;

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

    syncTheme(getStoredTheme());

    document.addEventListener("DOMContentLoaded", () => {
        initThemeToggle();
        initializeMovingBackground();
        initSharedTodayDate();
        initBlogCarousel();
    });
})();

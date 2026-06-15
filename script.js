const MOBILE_BACKGROUND_QUERY = "(max-width: 768px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const toggle = document.getElementById("themeToggle");
const root = document.documentElement;
const body = document.body;

function syncTheme(theme) {
    const isLight = theme === "light";

    if (isLight) {
        root.setAttribute("data-theme", "light");
        body.setAttribute("data-theme", "light");
        if (toggle) toggle.textContent = "🌙";
    } else {
        root.removeAttribute("data-theme");
        body.setAttribute("data-theme", "dark");
        if (toggle) toggle.textContent = "☀";
    }
}

syncTheme(localStorage.getItem("theme"));

if (toggle) {
    toggle.addEventListener("click", () => {
        const nextTheme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
        localStorage.setItem("theme", nextTheme);
        syncTheme(nextTheme);
    });
}

function initializeMovingBackground() {
    const canvas = document.getElementById("bg");
    if (!canvas) return;

    const mobileMedia = window.matchMedia(MOBILE_BACKGROUND_QUERY);
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const particles = [];
    const PARTICLE_COUNT = 90;
    const MAX_DIST = 140;
    let animationId = null;
    let isRunning = false;
    let gradientTopColor = "#323236";
    let gradientBottomColor = "#28282b";
    let particleColor = "#FFC300";
    let lineColorRgb = "253,240,213";
    let mouse = { x: -9999, y: -9999, active: false };

    function shouldRunBackground() {
        return !mobileMedia.matches && !reducedMotionMedia.matches;
    }

    function refreshBackgroundColors() {
        const styles = getComputedStyle(root);
        gradientTopColor = styles.getPropertyValue("--bg-secondary").trim() || "#323236";
        gradientBottomColor = styles.getPropertyValue("--bg-primary").trim() || "#28282b";
        particleColor = styles.getPropertyValue("--background-particle").trim() || "#FFC300";
        const activeTheme = root.getAttribute("data-theme") || "dark";
        lineColorRgb = activeTheme === "light" ? "30,31,35" : "253,240,213";
    }

    function resizeCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
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
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 160 && dist > 0) {
                    this.x -= (dx / dist) * 0.35;
                    this.y -= (dy / dist) * 0.35;
                }
            }

            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
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
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${lineColorRgb},${1 - dist / MAX_DIST})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    function drawGradient() {
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, gradientTopColor);
        gradient.addColorStop(1, gradientBottomColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
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

    function startAnimation() {
        if (isRunning || !shouldRunBackground() || document.hidden) return;

        canvas.hidden = false;
        resizeCanvas();
        refreshBackgroundColors();

        if (!particles.length) {
            for (let i = 0; i < PARTICLE_COUNT; i += 1) particles.push(new Particle());
        }

        isRunning = true;
        renderFrame();
    }

    function stopAnimation() {
        if (animationId !== null) window.cancelAnimationFrame(animationId);
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
        } else {
            stopAnimation();
        }
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        handleEnvironmentChange();
    });

    window.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.active = true;
    });

    window.addEventListener("mouseleave", () => {
        mouse.active = false;
    });

    window.addEventListener("mouseout", (event) => {
        if (!event.relatedTarget) mouse.active = false;
    });

    new MutationObserver(() => {
        refreshBackgroundColors();
    }).observe(root, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAnimation();
        } else {
            handleEnvironmentChange();
        }
    });

    mobileMedia.addEventListener("change", handleEnvironmentChange);
    reducedMotionMedia.addEventListener("change", handleEnvironmentChange);

    handleEnvironmentChange();
}

function initSharedTodayDate() {
    const nodes = document.querySelectorAll("[data-today-date], #today-date");
    if (!nodes.length) return;

    let dailyIntervalId = null;

    function formatToday() {
        const d = new Date();
        return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
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
        const msUntilMidnight = nextMidnight.getTime() - now.getTime();

        setTimeout(() => {
            renderToday();
            if (dailyIntervalId) clearInterval(dailyIntervalId);
            dailyIntervalId = setInterval(renderToday, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    renderToday();
    scheduleNextUpdate();
}

document.addEventListener("DOMContentLoaded", () => {
    initializeMovingBackground();
    initSharedTodayDate();
});

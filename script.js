function $(selector, scope = document) {
    return scope.querySelector(selector);
}

function $all(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

function setTheme(theme) {
    const icon = $("#themeToggle i");
    document.body.classList.toggle("dark-theme", theme === "dark");
    localStorage.setItem("theme", theme);
    if (icon) {
        icon.classList.toggle("fa-sun", theme === "dark");
        icon.classList.toggle("fa-moon", theme !== "dark");
    }
}

function initTheme() {
    const toggle = $("#themeToggle");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
    setTheme(savedTheme);
    if (!toggle) {
        return;
    }

    toggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark-theme");
        setTheme(isDark ? "light" : "dark");
    });
}

function initYear() {
    const year = $("#currentYear");
    if (year) {
        year.textContent = String(new Date().getFullYear());
    }
}

function initReveal() {
    const items = $all("[data-reveal]");
    if (!items.length || !("IntersectionObserver" in window)) {
        items.forEach((item) => item.classList.add("in"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, activeObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    activeObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    items.forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index * 80, 240)}ms`;
        observer.observe(item);
    });
}

function initCounters() {
    const counters = $all("[data-counter]");
    if (!counters.length) {
        return;
    }

    const animateCounter = (el) => {
        const target = Number(el.dataset.counter || "0");
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const duration = 1100;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased);
            el.textContent = `${prefix}${value}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
        counters.forEach(animateCounter);
        return;
    }

    const observer = new IntersectionObserver(
        (entries, activeObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    activeObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
}

function initProjectFilter() {
    const buttons = $all("[data-filter]");
    const cards = $all(".project-card[data-tags]");
    if (!buttons.length || !cards.length) {
        return;
    }

    const updateFilter = (filterValue) => {
        buttons.forEach((button) => {
            button.classList.toggle("active", button.dataset.filter === filterValue);
        });

        cards.forEach((card) => {
            const tags = (card.dataset.tags || "").split(" ");
            const isVisible = filterValue === "all" || tags.includes(filterValue);
            card.classList.toggle("hidden", !isVisible);
        });
    };

    buttons.forEach((button) => {
        button.addEventListener("click", () => updateFilter(button.dataset.filter || "all"));
    });
}

function initLightbox() {
    const modal = $("#lightbox");
    if (!modal) {
        return;
    }

    const modalImage = $("#lightboxImage");
    const modalCaption = $("#lightboxCaption");
    const closeButton = $("#lightboxClose");

    const closeModal = () => {
        modal.classList.remove("open");
        if (modalImage) {
            modalImage.src = "";
        }
    };

    $all("[data-lightbox]").forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            if (trigger.tagName === "A") {
                event.preventDefault();
            }
            const imageSrc = trigger.getAttribute("data-lightbox");
            const caption = trigger.getAttribute("data-caption") || "";
            if (!imageSrc || !modalImage) {
                return;
            }

            modalImage.src = imageSrc;
            if (modalCaption) {
                modalCaption.textContent = caption;
            }
            modal.classList.add("open");
        });
    });

    if (closeButton) {
        closeButton.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
        }
    });
}

function initContactForm() {
    const form = $("#contactForm");
    const toast = $("#toast");
    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = $("#name")?.value.trim() || "";
        const subject = $("#subject")?.value.trim() || "Portfolio inquiry";
        const message = $("#message")?.value.trim() || "";
        const emailSubject = encodeURIComponent(`${subject} - from ${name || "website visitor"}`);
        const emailBody = encodeURIComponent(message || "Hello Yany,\n\n");
        window.location.href = `mailto:yykwanaa@connect.ust.hk?subject=${emailSubject}&body=${emailBody}`;
        if (toast) {
            toast.classList.add("show");
            window.setTimeout(() => toast.classList.remove("show"), 2200);
        }
    });
}

function initCopyButtons() {
    $all("[data-copy]").forEach((button) => {
        button.addEventListener("click", async (event) => {
            if (button.tagName === "A") {
                event.preventDefault();
            }
            const text = button.dataset.copy || "";
            const toast = $("#toast");
            try {
                await navigator.clipboard.writeText(text);
                if (toast) {
                    toast.textContent = "Copied to clipboard";
                    toast.classList.add("show");
                    window.setTimeout(() => {
                        toast.classList.remove("show");
                        toast.textContent = "Message drafted in your email app.";
                    }, 1800);
                }
            } catch (error) {
                // Clipboard access can fail on non-secure origins.
                console.warn("Clipboard copy failed", error);
            }
        });
    });
}

function initCatFollower() {
    const follower = $("#catCursorFollower");
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
        return;
    }

    if (!follower) {
        return;
    }

    if (!follower.textContent.trim()) {
        follower.textContent = "🐱";
    }

    const storedX = Number(sessionStorage.getItem("catCursorX"));
    const storedY = Number(sessionStorage.getItem("catCursorY"));
    const hasStoredPosition = Number.isFinite(storedX) && Number.isFinite(storedY);

    let currentX = hasStoredPosition ? storedX : window.innerWidth * 0.5;
    let currentY = hasStoredPosition ? storedY : window.innerHeight * 0.5;
    let targetX = currentX;
    let targetY = currentY;

    follower.style.left = `${currentX}px`;
    follower.style.top = `${currentY}px`;

    const persistPosition = (x, y) => {
        sessionStorage.setItem("catCursorX", String(x));
        sessionStorage.setItem("catCursorY", String(y));
    };

    const updateFollower = () => {
        currentX += (targetX - currentX) * 0.2;
        currentY += (targetY - currentY) * 0.2;
        follower.style.left = `${currentX}px`;
        follower.style.top = `${currentY}px`;
        requestAnimationFrame(updateFollower);
    };

    document.addEventListener("mousemove", (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        persistPosition(targetX, targetY);
    });

    document.addEventListener("pointerdown", (event) => {
        if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
            return;
        }
        targetX = event.clientX;
        targetY = event.clientY;
        currentX = event.clientX;
        currentY = event.clientY;
        persistPosition(targetX, targetY);
    });

    document.addEventListener("click", (event) => {
        if (event.clientX === 0 && event.clientY === 0) {
            return;
        }
        targetX = event.clientX;
        targetY = event.clientY;
        persistPosition(targetX, targetY);
    });

    updateFollower();
}

function initSmoothAnchors() {
    $all("a[href^='#']").forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const href = anchor.getAttribute("href");
            if (!href || href === "#") {
                return;
            }
            const target = $(href);
            if (!target) {
                return;
            }
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initYear();
    initReveal();
    initCounters();
    initProjectFilter();
    initLightbox();
    initContactForm();
    initCopyButtons();
    initCatFollower();
    initSmoothAnchors();
});
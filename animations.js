/* =====================================================================
   animations.js — GSAP + ScrollTrigger polish layer
   ---------------------------------------------------------------------
   - Dodaje suptilne fade/slide-up reveal animacije dok se skroluje.
   - Glatka animacija hero sekcije pri učitavanju.
   - Poštuje prefers-reduced-motion (animacije se potpuno gase).
   - Fail-safe: ako GSAP nije učitan (npr. CDN blokiran) ili je uključen
     reduced-motion, uklanja se klasa `anim` sa <html> tako da CSS koji
     unapred sakriva elemente prestaje da važi i sav sadržaj ostaje vidljiv.
   - Ne dira postojeću funkcionalnost (slideri, meni, fullscreen) — to je
     u script.js i radi nezavisno.
   ===================================================================== */
(function () {
    "use strict";

    var root = document.documentElement;

    var reduceMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Ako nema GSAP-a ili korisnik traži smanjene animacije — ništa ne animiramo
    // i osiguravamo da sve bude vidljivo.
    if (!window.gsap || !window.ScrollTrigger || reduceMotion) {
        root.classList.remove("anim");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    function qa(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
    }
    function q(selector) {
        return document.querySelector(selector);
    }

    /* Grupni reveal: elementi se pojavljuju (opciono uz stagger) kada
       njihov okidač uđe u vidno polje. */
    function reveal(selector, o) {
        var els = qa(selector);
        if (!els.length) return;
        o = o || {};
        gsap.fromTo(
            els,
            { opacity: 0, y: o.y == null ? 26 : o.y },
            {
                opacity: 1,
                y: 0,
                duration: o.duration || 0.7,
                ease: "power2.out",
                stagger: o.stagger || 0,
                scrollTrigger: {
                    trigger: o.trigger || els[0],
                    start: o.start || "top 85%",
                    once: true
                }
            }
        );
    }

    /* Batch reveal: svaki element se animira posebno kako ulazi u vidno
       polje — idealno za duge mreže (galerija, jelovnik). */
    function batch(selector, o) {
        var els = qa(selector);
        if (!els.length) return;
        o = o || {};
        gsap.set(els, { opacity: 0, y: o.y == null ? 26 : o.y });
        ScrollTrigger.batch(els, {
            start: o.start || "top 88%",
            once: true,
            onEnter: function (b) {
                gsap.to(b, {
                    opacity: 1,
                    y: 0,
                    duration: o.duration || 0.6,
                    ease: "power2.out",
                    stagger: o.stagger || 0.08,
                    overwrite: true
                });
            }
        });
    }

    function run() {
        /* ---------------- HERO (pri učitavanju) ---------------- */
        if (q(".hero-content h1") || q(".hero-content-bottom")) {
            var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            if (q(".hero-content h1")) {
                tl.fromTo(
                    ".hero-content h1",
                    { opacity: 0, y: 34, scale: 0.97 },
                    { opacity: 1, y: 0, scale: 1, duration: 1.0 },
                    0.1
                );
            }
            if (q(".hero-content-bottom")) {
                tl.fromTo(
                    ".hero-content-bottom",
                    { opacity: 0, y: 22 },
                    { opacity: 1, y: 0, duration: 0.8 },
                    0.45
                );
            }
        }

        /* ---------------- POČETNA ---------------- */
        reveal(".image-link", { trigger: ".image-links", stagger: 0.15 });
        reveal(".home-about h1", { stagger: 0.1 });
        reveal(".home-about .divider, .home-about .divider2", {});
        reveal(".home-about p", { stagger: 0.12 });
        reveal(".about-slider-div", {});
        reveal(".recommended-heading", {});
        reveal(".recommended-item", { trigger: ".recommended", stagger: 0.15 });
        reveal(".recommended-button", {});
        batch(".footer .footer-item", { stagger: 0.12 });

        /* ---------------- O NAMA ---------------- */
        reveal(".page-about-paragraph", { stagger: 0.1 });
        batch(".page-about-slider-div", {});
        reveal(".about-container h2", {});
        reveal(".img-page-about", {});

        /* ---------------- GALERIJA ---------------- */
        reveal(".gallery h1", {});
        reveal(".gallery-navigation-container", {});
        batch(".gallery-grid-item", { stagger: 0.06, y: 20 });

        /* ---------------- JELOVNIK ---------------- */
        reveal(".menu-section h1", {});
        reveal(".menu-header", {});
        batch(".menu-grid-item", { stagger: 0.06, y: 20 });

        /* ---------------- LOKACIJE ---------------- */
        reveal(".h1loc", {});
        batch(".location", { stagger: 0.1 });
        reveal(".location-mail", {});

        /* ---------------- Footer (ostale stranice) ---------------- */
        batch(".footer-other .footer-other-item", { stagger: 0.12 });

        ScrollTrigger.refresh();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();

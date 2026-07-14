/* =====================================================================
   animations.js — GSAP + ScrollTrigger polish layer
   ---------------------------------------------------------------------
   - Dodaje suptilne fade/slide-up reveal animacije dok se skroluje.
   - Glatka animacija hero sekcije pri učitavanju.
   - NAPOMENA: po odluci klijenta animacije se prikazuju SVIMA, bez obzira
     na prefers-reduced-motion (namerno se ignoriše). Da se pristupačnost
     vrati, vidi guard ispod i @media blokove u style.css.
   - Fail-safe: ako GSAP nije učitan (npr. CDN blokiran), uklanja se klasa
     `anim` sa <html> tako da CSS koji unapred sakriva elemente prestaje da
     važi i sav sadržaj ostaje vidljiv.
   - Ne dira postojeću funkcionalnost (slideri, meni, fullscreen) — to je
     u script.js i radi nezavisno.
   ===================================================================== */
(function () {
    "use strict";

    var root = document.documentElement;

    // Ako nema GSAP-a (npr. CDN blokiran/offline) — ništa ne animiramo i
    // osiguravamo da sve bude vidljivo. (reduced-motion se NAMERNO ne proverava
    // — animacije idu svima; vrati proveru ovde ako zatreba pristupačnost.)
    if (!window.gsap || !window.ScrollTrigger) {
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

    /* Grupni reveal: elementi „uleću" (fade + pomeraj/zum) kada njihov
       okidač uđe u vidno polje. Podržava y (podizanje), x (smer), scale
       (rast slike) i rotate za izražajnije ulaske. */
    function reveal(selector, o) {
        var els = qa(selector);
        if (!els.length) return;
        o = o || {};
        gsap.fromTo(
            els,
            {
                opacity: 0,
                y: o.y == null ? 28 : o.y,
                x: o.x || 0,
                scale: o.scale == null ? 1 : o.scale,
                rotate: o.rotate || 0
            },
            {
                opacity: 1,
                y: 0,
                x: 0,
                scale: 1,
                rotate: 0,
                duration: o.duration || 0.85,
                ease: o.ease || "power3.out",
                stagger: o.stagger || 0,
                // Očisti inline transform kad reveal završi: sprečava
                // (1) da rezidualni transform postane containing block
                //     za position:fixed (razbijao fullscreen slika), i
                // (2) sub-pixel "poskakivanje" kartica nakon sletanja.
                clearProps: "transform",
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
        gsap.set(els, {
            opacity: 0,
            y: o.y == null ? 22 : o.y,
            scale: o.scale == null ? 1 : o.scale
        });
        ScrollTrigger.batch(els, {
            start: o.start || "top 88%",
            once: true,
            onEnter: function (b) {
                gsap.to(b, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: o.duration || 0.6,
                    ease: o.ease || "power3.out",
                    stagger: o.stagger || 0.08,
                    overwrite: true,
                    // vidi komentar u reveal(): čisti transform po završetku
                    // (ključno za fullscreen na galeriji/jelovniku)
                    clearProps: "transform"
                });
            }
        });
    }

    /* Parallax: element se pomera vezano za scroll (scrub) radi osećaja
       dubine. Koristi se SAMO za dekorativne slojeve (hero pozadina/tekst),
       nikad za mreže sa fullscreen slikama (transform bi razbio fixed). */
    function parallax(selector, o) {
        var el = q(selector);
        if (!el) return;
        o = o || {};
        gsap.to(el, {
            yPercent: o.yPercent,
            ease: "none",
            scrollTrigger: {
                trigger: o.trigger || el,
                start: o.start || "top top",
                end: o.end || "bottom top",
                scrub: o.scrub == null ? 0.6 : o.scrub
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
                    { opacity: 0, y: 44, scale: 0.94 },
                    { opacity: 1, y: 0, scale: 1, duration: 1.1 },
                    0.1
                );
            }
            if (q(".hero-content-bottom")) {
                tl.fromTo(
                    ".hero-content-bottom",
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.9 },
                    0.5
                );
            }
        }

        var isPhone = window.matchMedia("(max-width: 768px)").matches;

        /* ---------------- HERO parallax (pomeranje pri skrolu) ----------------
           Pozadina se pomera sporije, tekst brže -> osećaj dubine.
           yPercent se KOMBINUJE sa intro `y` (px) jer GSAP čuva odvojeno.

           Slider parallax NE radi na telefonu: pomera slider 8% naviše, a na desktopu
           to pokriva overscan (top:-11%, height:122%). Na telefonu je overscan ugašen
           (zumirao je uspravni kadar), pa bi parallax ogolio crnu pozadinu na dnu hera. */
        if (!isPhone) {
            parallax(".hero-slider", { yPercent: -8, trigger: ".hero", scrub: 0.6 });
        }
        parallax(".hero-content", { yPercent: -48, trigger: ".hero", scrub: 0.5 });
        parallax(".hero-content-bottom", { yPercent: -26, trigger: ".hero", scrub: 0.5 });

        /* ---------------- POČETNA ---------------- */
        /* Kartice: na desktopu stoje u redu (leva/sredina/desna) pa ulaze ka centru.
           Na telefonu su naslagane naizmenično, pa svaka ulazi sa one strane na kojoj
           joj je slika: Jelovnik s leva, Galerija s desna, Kontakt s leva. */
        if (isPhone) {
            /* JEDAN okidač za sve tri kartice, na celoj sekciji. Ranije je svaka
               imala svoj (trigger: sama kartica, "top 85%"), pa su se pri sporom
               skrolu palile jedna po jedna i animacija se stalno preklapala sa
               skrolom -> seckanje. Sad se okine jednom i odigra do kraja, a razmak
               između kartica pravi stagger, ne scroll pozicija. */
            var cards = qa(".image-links .image-link");
            if (cards.length) {
                gsap.fromTo(
                    cards,
                    {
                        opacity: 0,
                        // Galerija (srednja) ulazi s desna, ostale s leva
                        x: function (i) { return i === 1 ? 110 : -110; }
                    },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.9,
                        ease: "power3.out",
                        stagger: 0.12,
                        clearProps: "transform",
                        scrollTrigger: {
                            trigger: ".image-links",
                            start: "top 80%",
                            once: true
                        }
                    }
                );
            }
        } else {
            reveal(".image-links .image-link:nth-child(1)", { x: -50, y: 20, scale: 0.94 });
            reveal(".image-links .image-link:nth-child(2)", { y: 44, scale: 0.94, duration: 0.95 });
            reveal(".image-links .image-link:nth-child(3)", { x: 50, y: 20, scale: 0.94 });
        }
        reveal(".home-about h1", { y: 42, scale: 0.96, stagger: 0.1 });
        reveal(".home-about .divider, .home-about .divider2", { scale: 0.8, duration: 0.9 });
        reveal(".home-about p", { y: 34, stagger: 0.12 });
        reveal(".about-slider-div", { y: 40, scale: 0.96 });
        reveal(".recommended-heading", { y: 42, scale: 0.96 });
        reveal(".recommended-item", { trigger: ".recommended", stagger: 0.18, y: 46, scale: 0.9 });
        reveal(".recommended-button", { y: 24 });
        batch(".footer .footer-item", { stagger: 0.12, y: 26 });

        /* ---------------- O NAMA ---------------- */
        reveal(".page-about-paragraph", { y: 34, stagger: 0.12 });
        batch(".page-about-slider-div", { y: 40, scale: 0.96 });
        reveal(".about-container h2", { y: 40, scale: 0.96 });
        reveal(".img-page-about", { y: 40, scale: 0.93 });

        /* ---------------- GALERIJA ---------------- */
        reveal(".gallery h1", { y: 44, scale: 0.96 });
        reveal(".gallery-navigation-container", { y: 20 });
        batch(".gallery-grid-item", { stagger: 0.06, y: 24, scale: 0.94 });

        /* ---------------- JELOVNIK ---------------- */
        reveal(".menu-section h1", { y: 44, scale: 0.96 });
        reveal(".menu-header", { y: 26 });
        batch(".menu-grid-item", { stagger: 0.05, y: 24, scale: 0.94 });

        /* ---------------- LOKACIJE ---------------- */
        reveal(".h1loc", { y: 44, scale: 0.96 });
        batch(".location", { stagger: 0.12, y: 34, scale: 0.97 });
        reveal(".location-mail", { y: 24 });

        /* ---------------- KONTAKT ---------------- */
        reveal(".contact-intro", { y: 24 });
        batch(".contact-card", { stagger: 0.1, y: 34, scale: 0.97 });
        reveal(".contact-social", { y: 34, scale: 0.98 });

        /* ---------------- Footer (ostale stranice) ---------------- */
        batch(".footer-other .footer-other-item", { stagger: 0.12, y: 26 });

        ScrollTrigger.refresh();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();

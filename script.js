document.addEventListener("DOMContentLoaded", () => {

    /* -------------------- LIGHTBOX (Gallery + Menu) -------------------- */
    // Slika se prikazuje u zasebnom overlay sloju umesto da se sama ćelija iz
    // mreže diže u position:fixed — tako grid ostaje netaknut iza overlay-a, a
    // veličinu ne diktiraju height pravila iz mreže (portret vs. pejzаж).
    const zoomableImages = document.querySelectorAll(
        ".gallery-grid-item img, .menu-grid-item img, .menu-section img"
    );

    if (zoomableImages.length) {
        const lightbox = document.createElement("div");
        lightbox.className = "lightbox";
        lightbox.setAttribute("aria-hidden", "true");

        const lightboxImg = document.createElement("img");
        lightbox.appendChild(lightboxImg);

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "lightbox-close";
        closeBtn.setAttribute("aria-label", "Затвори");
        closeBtn.innerHTML = "&times;";
        lightbox.appendChild(closeBtn);

        document.body.appendChild(lightbox);

        // Čeka da <img> bude spreman za prikaz. `load` je univerzalno podržan;
        // `decode()` je posle njega best-effort jer garantuje da je slika i
        // dekodirana, ne samo preuzeta (bez toga velik JPEG zna da zastruže na
        // prvom paintu). Na već keširanoj slici resolve je trenutan.
        const whenReady = (el) => {
            if (el.complete && el.naturalWidth) return Promise.resolve();
            return new Promise((resolve) => {
                el.addEventListener("load", resolve, { once: true });
                el.addEventListener("error", resolve, { once: true });
            }).then(() =>
                typeof el.decode === "function" ? el.decode().catch(() => {}) : undefined
            );
        };

        // Raste na svakom otvaranju I zatvaranju. Služi da učitavanje koje je
        // u toku ne „iskoči" posle toga — ako se token promenio, odustajemo.
        let openToken = 0;

        const openLightbox = async (thumb) => {
            const fullResolutionSrc = thumb.dataset.fullsrc || thumb.currentSrc || thumb.src;
            const token = ++openToken;

            // Ovde je bio bug: <img> se reciklira, a postavljanje `src` ne briše
            // prethodni dekodirani kadar — dok se nova slika ne učita, browser
            // prikazuje STARU. Zato je krijemo klasom `loading` (uz spinner) i
            // otkrivamo je tek kad je nova spremna. Ne diramo `src` unaprijed:
            // prazan/uklonjen src pali ikonicu slomljene slike.
            lightbox.classList.add("open", "loading");
            lightbox.setAttribute("aria-hidden", "false");
            lightboxImg.alt = thumb.alt || "";
            document.body.style.overflow = "hidden";

            lightboxImg.src = fullResolutionSrc;
            await whenReady(lightboxImg);

            // Zatvoreno je ili je otvorena druga slika dok se ova učitavala.
            if (token !== openToken) return;
            lightbox.classList.remove("loading");
        };

        const closeLightbox = () => {
            openToken++; // otkazuje otkrivanje ako je učitavanje još u toku
            lightbox.classList.remove("open", "loading");
            lightbox.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        };

        zoomableImages.forEach((img) => {
            img.addEventListener("click", (event) => {
                event.stopPropagation();
                openLightbox(img);
            });
        });

        lightbox.addEventListener("click", closeLightbox);
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeLightbox();
        });
    }

    /* -------------------- MAPE: graceful loading (fade-in) -------------------- */
    // Prikazuje suptilan spinner dok se Google Maps embed ne učita, pa mapu
    // blago „utopi". Fail-safe: ako `load` ne okine, tajmer svejedno otkrije mapu.
    const mapWraps = document.querySelectorAll(".location-map");
    mapWraps.forEach((wrap) => {
        const iframe = wrap.querySelector("iframe");
        if (!iframe) return;
        wrap.classList.add("map-fade");
        const reveal = () => wrap.classList.add("map-ready");
        iframe.addEventListener("load", reveal, { once: true });
        // Rezerva: ako je iframe već keširan/učitao se pre listenera ili load ne okine.
        setTimeout(reveal, 4000);
    });

    /* -------------------- DROPDOWN MENUS -------------------- */
    const dropdowns = document.querySelectorAll(".dropdown");
    dropdowns.forEach((dropdown) => {
        const trigger = dropdown.querySelector("a");
        if (!trigger) return;
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            dropdowns.forEach(d => { if (d !== dropdown) d.classList.remove("open"); });
            dropdown.classList.toggle("open");
        });
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown")) {
            dropdowns.forEach(d => d.classList.remove("open"));
        }
    });

    /* -------------------- HOMEPAGE SLIDER -------------------- */
    const homeSliderDiv = document.querySelector('.about-slider-container');
    if (homeSliderDiv) {
        const slider = homeSliderDiv.querySelector('.about-slider');
        const slides = homeSliderDiv.querySelectorAll('.about-slide');
        const prevBtn = homeSliderDiv.querySelector('.about-prev');
        const nextBtn = homeSliderDiv.querySelector('.about-next');
        const dots = document.querySelectorAll('.about-dot');

        let currentIndex = 0;
        let autoSlideInterval = null;
        let isHovered = false;

        // 4000 je bilo prekratko — slika se menjala pre nego što se pogleda.
        const SLIDE_MS = 6500;

        const updateDots = function() {
            dots.forEach((dot, index) => dot.classList.toggle('active', index === currentIndex));
        };

        const showSlides = function(index) {
            if (index >= slides.length) currentIndex = 0;
            else if (index < 0) currentIndex = slides.length - 1;
            else currentIndex = index;
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
        };

        const nextSlide = function() { showSlides(currentIndex + 1); };
        const prevSlide = function() { showSlides(currentIndex - 1); };

        const stopAutoSlide = function() {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        };

        /* Uvek prvo gasi postojeći tajmer, pa pravi novi. Ovde je bio bug:
           startAutoSlide je pravio setInterval BEZ brisanja prethodnog, a
           mouseover/mouseout BUBBLE-uju — svaki prelaz miša sa jednog slajda
           (ili strelice) na drugi unutar kontejnera pravio je još jedan tajmer.
           Posle par pokreta mišem radilo je više tajmera paralelno, pa je
           slajder „ubrzavao"; stopAutoSlide je gasio samo poslednji, zato je
           klik na strelicu preskakao dva slajda. */
        const restartAutoSlide = function() {
            stopAutoSlide();
            if (!isHovered) autoSlideInterval = setInterval(nextSlide, SLIDE_MS);
        };

        /* Ručna promena resetuje tajmer — bez toga klik pri kraju intervala
           odmah dobije i automatski prelaz, pa se preskoči jedan slajd. */
        const manual = function(change) {
            return function() { change(); restartAutoSlide(); };
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", manual(() => showSlides(index)));
        });

        if (nextBtn) nextBtn.addEventListener("click", manual(nextSlide));
        if (prevBtn) prevBtn.addEventListener("click", manual(prevSlide));

        /* mouseenter/mouseleave, NE mouseover/mouseout — ovi ne bubble-uju, pa
           se pale tačno jednom na ulazu/izlazu iz kontejnera. Vežemo ih samo
           tamo gde hover stvarno postoji: na touch ekranu se mouseenter emulira
           na dodir, pa bi slajder ostao trajno pauziran posle prvog tapa. */
        if (window.matchMedia("(hover: hover)").matches) {
            homeSliderDiv.addEventListener("mouseenter", () => {
                isHovered = true;
                stopAutoSlide();
            });
            homeSliderDiv.addEventListener("mouseleave", () => {
                isHovered = false;
                restartAutoSlide();
            });
        }

        showSlides(currentIndex);
        restartAutoSlide();
    }

    /* -------------------- ABOUT PAGE SLIDERS -------------------- */
    const aboutSliders = document.querySelectorAll('.page-about-slider-div');
    aboutSliders.forEach((sliderDiv) => {
        const slider = sliderDiv.querySelector('.page-about-slider');
        const slides = sliderDiv.querySelectorAll('.page-about-slide');
        const prevBtn = sliderDiv.querySelector('.page-about-prev');
        const nextBtn = sliderDiv.querySelector('.page-about-next');
        const dots = sliderDiv.querySelectorAll('.page-about-dot');

        let currentIndex = 0;

        const updateDots = function() {
            dots.forEach((dot, index) => dot.classList.toggle('active', index === currentIndex));
        };

        const showSlides = function(index) {
            if (index >= slides.length) currentIndex = 0;
            else if (index < 0) currentIndex = slides.length - 1;
            else currentIndex = index;
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
        };

        const nextSlide = function() { showSlides(currentIndex + 1); };
        const prevSlide = function() { showSlides(currentIndex - 1); };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => showSlides(index));
        });

        if (nextBtn) nextBtn.addEventListener("click", nextSlide);
        if (prevBtn) prevBtn.addEventListener("click", prevSlide);

        showSlides(currentIndex);
    });

    /* -------------------- BURGER MENU WITH MOBILE SIDEBAR -------------------- */
    const burger = document.getElementById('burger');
    const burgerImg = burger ? burger.querySelector('img') : null;
    const sidebar = document.querySelector('.mobile-sidebar') || document.getElementById('mobileSidebar') || document.querySelector('.sidebar');
    const navbar = document.querySelector('.navbar');

    if (!burger) console.warn('Burger button not found (#burger).');
    if (!burgerImg) console.warn('Burger img not found inside button.');
    if (!sidebar) console.warn('Mobile sidebar element not found (.mobile-sidebar or #mobileSidebar).');
    if (!navbar) console.warn('Navbar element not found (.navbar).');

    if (burger && burgerImg && sidebar && navbar) {
        const imgDefault = 'burger1.png';
        const imgActive  = 'burger2.png';

        burger.setAttribute('aria-expanded', sidebar.classList.contains('active') ? 'true' : 'false');

        const toggleBurgerImage = (isOpen) => {
            burgerImg.style.opacity = 0;
            setTimeout(() => {
                burgerImg.src = isOpen ? imgActive : imgDefault;
                burgerImg.style.opacity = 1;
            }, 150);
        };

        burger.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('active');
            navbar.classList.toggle('menu-open', isOpen);
            document.body.classList.toggle('no-scroll', isOpen);
            burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            toggleBurgerImage(isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !burger.contains(e.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                navbar.classList.remove('menu-open');
                document.body.classList.remove('no-scroll');
                burger.setAttribute('aria-expanded', 'false');
                toggleBurgerImage(false);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                navbar.classList.remove('menu-open');
                document.body.classList.remove('no-scroll');
                burger.setAttribute('aria-expanded', 'false');
                toggleBurgerImage(false);
            }
        });
    }
});

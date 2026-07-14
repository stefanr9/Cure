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

        const openLightbox = (img) => {
            lightboxImg.src = img.currentSrc || img.src;
            lightboxImg.alt = img.alt || "";
            lightbox.classList.add("open");
            lightbox.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        };

        const closeLightbox = () => {
            lightbox.classList.remove("open");
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
        let autoSlideInterval;

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
        const startAutoSlide = function() { autoSlideInterval = setInterval(nextSlide, 4000); };
        const stopAutoSlide = function() { clearInterval(autoSlideInterval); };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                showSlides(index);
                stopAutoSlide();
                startAutoSlide();
            });
        });

        if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); stopAutoSlide(); startAutoSlide(); });
        if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); stopAutoSlide(); startAutoSlide(); });

        homeSliderDiv.addEventListener("mouseover", stopAutoSlide);
        homeSliderDiv.addEventListener("mouseout", startAutoSlide);

        showSlides(currentIndex);
        startAutoSlide();
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

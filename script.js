document.addEventListener("DOMContentLoaded", () => {

    /* -------------------- IMAGE FULLSCREEN TOGGLE (Gallery + Menu) -------------------- */
    const fullscreenableImages = document.querySelectorAll(
        ".gallery-grid-item img, .menu-grid-item img, .menu-section img"
    );

    fullscreenableImages.forEach((img) => {
        img.addEventListener("click", (event) => {
            event.stopPropagation();

            const isFullscreen = img.classList.contains("fullscreen");

            // Close all fullscreen images first
            fullscreenableImages.forEach(i => i.classList.remove("fullscreen"));

            // Roditeljski grid-item može imati rezidualni transform od reveal
            // animacije, što bi (kao containing block) razbilo position:fixed
            // fullscreen. Neutralši ga pri ulasku, vrati pri izlasku.
            const cell = img.closest(".gallery-grid-item, .menu-grid-item");

            if (!isFullscreen) {
                // Enter fullscreen
                if (cell) cell.style.transform = "none";
                img.classList.add("fullscreen");
                document.body.style.overflow = "hidden";
            } else {
                // Exit fullscreen
                img.classList.remove("fullscreen");
                if (cell) cell.style.transform = "";
                document.body.style.overflow = "";
            }
            // MAP FIX: No need to explicitly set pointerEvents: auto here, 
            // the CSS !important rule handles it.
        });
    });

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

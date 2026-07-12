/* =====================================================================
   floating-dock.js — mobilna navigacija „Floating Dock" (Aceternity stil)
   ---------------------------------------------------------------------
   Vanilla port React/framer-motion komponente. Ponašanje, dimenzije,
   pozicije i ARIA atributi su isti kao u referenci:
     - FAB dole-desno, vidljiv samo na telefonu (header je tamo sakriven)
     - klik otvara vertikalni stack [pill sa tekstom] + [okrugla ikonica]
     - stavke ulaze staggered (0.05s), izlaze obrnutim redosledom (0.03s)
     - hamburger se rotira 45° i postaje „+"
     - klik na stavku zatvara meni

   Spring iz framer-motiona (stiffness 400, damping 26) je u CSS-u
   aproksimiran cubic-bezier krivom sa prebačajem — vidi .fdock u style.css.

   STAVKE SE MENJAJU ISPOD, u DOCK_ITEMS.
   ===================================================================== */
(function () {
    "use strict";

    /* Iste strane kao u desktop headeru. Јеловник vodi na Ресторан (menu.html);
       ostale tri podstrane (Кафана/Брза храна/Пицерија) nisu u docku jer dock
       nema podmeni — vidi napomenu u odgovoru. */
    var DOCK_ITEMS = [
        { title: "Почетна",  href: "index.html",    icon: "home" },
        { title: "Јеловник", href: "menu.html",     icon: "utensils" },
        { title: "Локације", href: "location.html", icon: "pin" },
        { title: "Галерија", href: "gallery.html",  icon: "image" },
        { title: "Контакт",  href: "location.html", icon: "phone" },
        { title: "О нама",   href: "about.html",    icon: "info" }
    ];

    /* Inline stroke SVG, 24x24 viewBox (lucide stil) */
    var ICONS = {
        home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
        utensils: '<path d="M4 3v6a3 3 0 0 0 6 0V3"/><path d="M7 12v9"/><path d="M17 3c2 2 2 6 0 8v10"/>',
        pin: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
        image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
        phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
        info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
    };

    function svg(paths, cls) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
               'stroke-linecap="round" stroke-linejoin="round" class="' + cls + '" aria-hidden="true">' +
               paths + '</svg>';
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (document.querySelector(".fdock")) return; // već postoji

        var dock = document.createElement("div");
        dock.className = "fdock";

        var list = document.createElement("div");
        list.className = "fdock-list";

        DOCK_ITEMS.forEach(function (item, i) {
            var a = document.createElement("a");
            a.className = "fdock-item";
            a.href = item.href;
            // stagger: ulaz 0.05s po stavci; izlaz 0.03s obrnutim redosledom
            a.style.setProperty("--in-delay", (i * 0.05) + "s");
            a.style.setProperty("--out-delay", ((DOCK_ITEMS.length - 1 - i) * 0.03) + "s");
            a.innerHTML =
                '<span class="fdock-pill">' + item.title + "</span>" +
                '<span class="fdock-icon">' + svg(ICONS[item.icon] || "", "fdock-svg") + "</span>";
            a.addEventListener("click", function () { setOpen(false); });
            list.appendChild(a);
        });

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fdock-btn";
        btn.setAttribute("aria-expanded", "false");
        btn.innerHTML =
            svg('<path class="fdock-bars" d="M4 6h16M4 12h16M4 18h16"/>' +
                '<path class="fdock-plus" d="M12 5v14M5 12h14"/>', "fdock-svg fdock-btn-svg");

        dock.appendChild(list);
        dock.appendChild(btn);
        document.body.appendChild(dock);

        var open = false;
        function setOpen(v) {
            open = v;
            dock.classList.toggle("is-open", open);
            btn.setAttribute("aria-expanded", open ? "true" : "false");
            btn.setAttribute("aria-label", open ? "Затвори мени" : "Отвори мени");
            list.setAttribute("aria-hidden", open ? "false" : "true");
        }
        setOpen(false);

        btn.addEventListener("click", function () { setOpen(!open); });

        // van specifikacije, ali bezbolno: Esc i klik van dock-a zatvaraju meni
        document.addEventListener("keyup", function (e) {
            if (e.key === "Escape" && open) setOpen(false);
        });
        document.addEventListener("click", function (e) {
            if (open && !dock.contains(e.target)) setOpen(false);
        });
    });
})();

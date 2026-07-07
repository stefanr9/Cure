Šta treba ručno da testiraš

  1. Internet/CDN — GSAP se povlači sa cdnjs.cloudflare.com. Otvori stranice online (GitHub Pages) i proveri da
  animacije rade. Ako je mreža offline, sajt i dalje radi, samo bez animacija.
  2. Telefon i desktop — proveri hero uvod, pojavljivanje kartica na scroll, i posebno duge mreže (galerija, jelovnici)
  da se lepo „nižu".
  3. Reduced motion — uključi u OS-u (Windows: Settings → Accessibility → Visual effects → Animation effects: Off) i
  osveži: animacija ne sme da bude, a hero slika mora ostati vidljiva.
  4. Postojeće funkcije — klik na sliku (fullscreen), dropdown „Јеловник", burger meni na telefonu, slideri sa
  strelicama i tačkicama — da sve radi kao pre.
  5. Bez treptaja — na sporijem učitavanju proveri da nema momenta gde sadržaj bljesne pa nestane.

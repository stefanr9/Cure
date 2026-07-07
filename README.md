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

Rezultati testiranja:

1. Sajt je live na https://stefanr9.github.io/Cure/index.html, sve animacije rade.
2. Na desktop verziji nizanje u jelovniku ne radi smooth (mislim da je problem rezolucija slika, u galeriji sam ih već ranije smanjio zbog sporog učitavanja).
2.2 Učitavanje google mapa na stranici lokacija ima primetan delay, i na desktop i na mobile verziji
3. Hero slika postoji nakon isključivanja animacija, hero slike se ne smenjuju 
4. Funkcija fullscreen ne radi, ostale funkcije rade.
5. Nije primećen momenat bljeska sadržaja.

Primećeno (nije bug ali je primetno):

Desktop verzija, početna strana, horizontalni div-ovi u nizu od 3 nakon nizanja poskoče za još par pixela 

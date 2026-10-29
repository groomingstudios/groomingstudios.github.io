/* Gemeinsames Menü für alle Seiten: Menü-Symbol + Ausklappmenü werden neben den Buchen-Button gesetzt */
(() => {
  const LINKS = {
    book: 'https://www.phorest.com/salon/groomingstudios',
    voucher: 'https://gift-cards.phorest.com/salons/groomingstudios'
  };
  window.GS_LINKS = LINKS;

  // Rechtliche Links (Menü + Fußzeile aller Seiten)
  const LEGAL = [['impressum.html', 'Impressum'], ['datenschutz.html', 'Datenschutz'], ['widerrufsrecht.html', 'Widerrufsrecht']];
  const legalLinks = () => LEGAL.map(([h, t]) => `<a href="${h}"${location.pathname.endsWith('/' + h) ? ' aria-current="page"' : ''}>${t}</a>`).join('');

  const page = document.body.dataset.page;   // 'home' | 'team' | 'leistungen'
  const book = document.querySelector('.btn.book');

  const toggle = document.createElement('button');
  toggle.className = 'menu-toggle'; toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Menü öffnen');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'menu');
  toggle.innerHTML = '<span></span><span></span><span></span>';

  const menu = document.createElement('div');
  menu.className = 'menu'; menu.id = 'menu'; menu.setAttribute('aria-hidden', 'true');
  menu.innerHTML = `
    <nav aria-label="Hauptmenü">
      <a href="team.html"${page === 'team' ? ' aria-current="page"' : ''}>Team</a>
      <a href="leistungen.html"${page === 'leistungen' ? ' aria-current="page"' : ''}>Dienstleistungen</a>
      <a href="${LINKS.voucher}" target="_blank" rel="noopener">Gutschein</a>
      <a href="${LINKS.book}" target="_blank" rel="noopener">Buchen</a>
    </nav>
    <div class="m-info">
      <div>
        <h3>Kontakt</h3>
        Endersbacher Str. 50<br>71334 Waiblingen<br>
        <a class="m-route" href="https://www.google.com/maps/dir/?api=1&amp;destination=Endersbacher+Str.+50,+71334+Waiblingen" target="_blank" rel="noopener">Route planen →</a>
      </div>
      <div>
        <h3>&nbsp;</h3>
        <a href="tel:+4915560077101">+49 155 60077101</a><br>
        <a href="mailto:hello@groomingstudios.de">hello@groomingstudios.de</a>
      </div>
      <div>
        <h3>Öffnungszeiten</h3>
        Di – Fr: 9 – 21 Uhr<br>Sa: 8 – 18 Uhr<br>So &amp; Mo: Ruhetag
      </div>
    </div>
    <div class="m-legal" data-legal></div>`;

  // gleicher Stapelkontext wie Logo und Buchen-Button
  book.before(toggle);
  book.parentNode.append(menu);
  document.querySelectorAll('[data-legal]').forEach(el => { el.innerHTML = legalLinks(); });

  const root = document.documentElement;
  const isOpen = () => root.classList.contains('menu-open');
  function setMenu(open) {
    if (open) dispatchEvent(new Event('gs:menuopen'));   // z. B. Barber-Panel schließen
    root.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    menu.setAttribute('aria-hidden', !open);
  }
  toggle.addEventListener('click', () => setMenu(!isOpen()));
  menu.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) setMenu(false); });
})();

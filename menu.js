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

  // Buchen-Button mit dem Schrägschnitt aus dem Logo (das „OO“ in GROOMING):
  // zwei deckungsgleiche Hälften, beim Hover setzt der Schnitt oben an, beim Klick geht er durch
  const label = book.textContent.trim();
  book.classList.add('cut');
  book.setAttribute('aria-label', label);
  book.innerHTML = `<span class="half a" aria-hidden="true"><span>${label}</span></span>` +
                   `<span class="half b" aria-hidden="true"><span>${label}</span></span><i class="slit" aria-hidden="true"></i>`;
  const SLANT = 0.2;   // Schnitt oben 20 % rechts der Mitte, unten 20 % links
  function sizeCut() {
    const w = book.offsetWidth, h = book.offsetHeight, dx = 2 * SLANT * w;
    book.style.setProperty('--cut-a', Math.atan2(dx, h) + 'rad');
    book.style.setProperty('--cut-h', Math.hypot(dx, h) * 1.25 + 'px');
    // Hälften rücken senkrecht zum Schnitt auseinander
    const l = Math.hypot(dx, h);
    book.style.setProperty('--cut-x', (5 * h / l).toFixed(2) + 'px');
    book.style.setProperty('--cut-y', (5 * dx / l).toFixed(2) + 'px');
  }
  addEventListener('resize', sizeCut);
  document.fonts.ready.then(sizeCut);
  sizeCut();
  let rejoin;
  book.addEventListener('click', () => {
    book.classList.remove('split'); void book.offsetWidth; book.classList.add('split');
    clearTimeout(rejoin);
    rejoin = setTimeout(() => book.classList.remove('split'), 2200);   // wenn man aus der Buchung zurückkommt, ist er wieder ganz
  });

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

  // Rasierklinge schneidet Buttons an: Schnitt folgt genau dem Weg der Maus, heilt beim Verlassen wieder zu
  const NS = 'http://www.w3.org/2000/svg', CUTTABLE = '.btn, .q-btn';
  let cutting = null;   // { el, svg, path, pts }
  function endCut() {
    if (!cutting) return;
    const { svg } = cutting;
    svg.classList.add('heal');
    setTimeout(() => svg.remove(), 700);
    cutting = null;
  }
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest?.(CUTTABLE);
    if (cutting && cutting.el !== el) endCut();
    if (!el) return;
    const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (!cutting) {
      const svg = document.createElementNS(NS, 'svg'), path = document.createElementNS(NS, 'path');
      svg.setAttribute('class', 'razor-cut'); svg.setAttribute('aria-hidden', 'true');
      svg.append(path); el.append(svg);
      cutting = { el, svg, path, pts: [] };
    }
    const p = cutting.pts, last = p[p.length - 1];
    if (last && Math.hypot(x - last[0], y - last[1]) < 1.5) return;
    p.push([x, y]);
    if (p.length > 400) p.shift();
    cutting.path.setAttribute('d', p.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(''));
  }, { passive: true });
  document.addEventListener('pointerleave', endCut);
})();

/* Team-Daten: gemeinsam für Startseite und Teamseite */
(() => {
  // Texte & Bilder von groomingstudios.de/team; Bewertungen: Nikola von Google Maps, Viktor und Daniel vom Betreiber geliefert (alle 5 Sterne)
  // Buchung direkt beim Barber: Phorest-Mitarbeiter-ID (staffId). Ohne ID → allgemeine Buchungsseite
  const BOOK = 'https://www.phorest.com/salon/groomingstudios';
  const bookFor = t => t.staffId ? BOOK + '/book/services?staffId=' + t.staffId : BOOK;
  const GOOGLE = { score: '4,9', count: 153, url: 'https://www.google.com/maps/place/GROOMING+STUDIOS/@48.819324,9.347832,17z/data=!4m6!3m5!1s0x4799c79a33bdcf1d:0x62634af16cdffdab' };
  const TEAM = [
    {
      name: 'Nikola', img: 'team/nikola.webp', role: 'Barber', lang: 'Englisch', staffId: '9Z7c9TQfJz-wwr1aImciYg',
      bio: ['Erst seit Kurzem in Deutschland, bringt Nikola aber jahrelange Erfahrung als Barbershop-Inhaber aus Serbien mit. Schon in jungen Jahren hat er sein Talent für präzise Herrenhaarschnitte entdeckt und perfektioniert.',
            'Mit seiner direkten Art, scharfem Humor und Leidenschaft fürs Handwerk bringt er jeden Mann in Bestform.'],
      reviews: [
        { text: 'War mein erster Besuch und wurde sehr gut von Nikola beraten. Er hat einen super Job gemacht, ich komme wieder!', by: 'Marc B.', when: 'vor 3 Monaten' },
        { text: 'Ich hatte eigentlich nicht vor den Friseur zu wechseln, aber Nikola ist einfach grandios. Seine Beratung ist offen, ehrlich und sehr kompetent. Seine Leistung toppt aber alles, ein absoluter Meister seines Handwerks!', by: 'Jonas T.', when: 'vor 2 Monaten' }
      ]
    },
    {
      name: 'Viktor', img: 'team/viktor.webp', role: 'Barber', lang: 'Ukrainisch, Russisch, Rumänisch, Deutsch und Englisch', staffId: 'm9IrGuxzFQbQgBhh15AHNQ',
      bio: ['Viktor kommt aus der Ukraine und hat sein Handwerk von der Pike auf gelernt. Sein Werkzeug der Wahl: die Schere – ob klassischer Herrenschnitt, weich ausgearbeitete Übergänge oder ein Look mit Textur und Bewegung.',
            'Er nimmt sich Zeit, hört genau zu und findet den Schnitt, der zu Kopfform, Haarstruktur und Typ passt. Das Ergebnis sitzt nicht nur am ersten Tag, sondern auch noch Wochen später.'],
      reviews: [
        { text: 'Ich war heute zum ersten Mal hier und bin rundum begeistert! Viktor hat Haarschnitt und Bart sehr sorgfältig und präzise gemacht. Er ist ganz individuell auf meine Wünsche eingegangen, und das Ergebnis entspricht genau meinen Vorstellungen. Sehr professionell und persönlich – ich komme definitiv wieder. Klare Empfehlung!', by: 'Andrei' },
        { text: 'Viktor arbeitet sehr präzise. Das Ergebnis ist jedes Mal hervorragend! Weiter so', by: 'Božo' },
        { text: 'Super auf alle Wünsche eingegangen und perfekt umgesetzt! Vielen Dank und bis zum nächsten Mal.', by: 'Manuel' },
        { text: 'War alles perfekt. Man fühlt sich wirklich wohl und gut aufgehoben! Ich komme gerne wieder!', by: 'Philipp' },
        { text: 'Top geschnitten und auf alle Wünsche eingegangen. Gerne wieder.', by: 'Kai' }
      ]
    },
    {
      name: 'Daniel', img: 'team/daniel.webp', role: 'Barber', staffId: 'kAs8I7RBnYFwCMKihCFysA',
      bio: ['Daniel bringt nicht nur handwerkliches Können, sondern auch echtes Feingefühl für Stil und Ästhetik mit. Als Barber mit Gespür für aktuelle Trends und zeitlose Looks schafft er es, jeden Kunden individuell abzuholen und zu begeistern.',
            'Seine ruhige, konzentrierte Art gepaart mit technischer Präzision macht jeden Besuch bei ihm zu einem echten Erlebnis – für Männer, die mehr wollen als nur einen Haarschnitt.'],
      reviews: [
        { text: 'Wurde bestens bedient – vielen Dank Daniel! Und die Musikauswahl ist ausgezeichnet!', by: 'Thomas' },
        { text: 'Das Grooming Studio, besonders Daniel, ist ein toller sehr freundlicher Friseur. Ich bin zum Stammkunden geworden und bin froh, ein so gut strukturiertes und kundenorientiertes Studio gefunden zu haben.', by: 'Oliver' },
        { text: 'Sehr freundlicher und kompetenter Friseur, der sich Zeit für einen Haarschnitt nimmt und sehr sorgfältig arbeitet. Vielen Dank, bis zum nächsten Mal!', by: 'Matthias' },
        { text: 'Sehr freundlich, sauber, einfach gut', by: 'Metin' }
      ]
    }
  ];
  window.GS_TEAM = { TEAM, GOOGLE, bookFor };
})();

/* Barber-Stuhl Takara Belmont Apollo 2 – gemeinsam für Startseite und Teamseite.
   Baut Umgebung, Licht und Materialien in die Szene und liefert den Stuhl-Bausatz. */
window.GSChair = (renderer, scene) => {
  /* ---------- Studio-Umgebung für Chrom-Reflexionen ---------- */
  (function buildEnv() {
    const env = new THREE.Scene();
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(20, 32, 16),
      new THREE.MeshBasicMaterial({ color: 0x0d0d0f, side: THREE.BackSide })
    );
    env.add(dome);
    const panel = (w, h, x, y, z, k) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k * 0.96), side: THREE.DoubleSide })
      );
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(10, 6, -9, 6, 6, 7);
    panel(10, 6, 9, 5, 5, 5);
    panel(14, 2.5, 0, 11, -2, 6);
    panel(6, 8, 0, 3, -10, 3);
    panel(18, 1.5, 0, -2, 12, 1.5);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.03).texture;
    pm.dispose();
  })();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 0.25));
  const key = new THREE.DirectionalLight(0xfff2dc, 2.4); key.position.set(-4, 7, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd0ff, 1.1); rim.position.set(5, 4, -6); scene.add(rim);

  /* ---------- Materialien ---------- */
  function noiseTex(size, rep, contrast) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'), d = x.createImageData(size, size);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 255 * contrast;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    x.putImageData(d, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
    return t;
  }
  const leather = new THREE.MeshPhysicalMaterial({
    color: 0x24252a, roughness: 0.33, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.3,
    bumpMap: noiseTex(128, 14, 0.9), bumpScale: 0.35
  });
  const piping  = new THREE.MeshStandardMaterial({ color: 0xf6f4ef, roughness: 0.42 });
  const chrome  = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.06 });
  const brushed = new THREE.MeshStandardMaterial({ color: 0xdcdde0, metalness: 1, roughness: 0.3 });
  const casting = new THREE.MeshStandardMaterial({
    color: 0x0b0b0c, metalness: 0.5, roughness: 0.55,
    bumpMap: noiseTex(128, 6, 1), bumpScale: 1.2
  });
  const gloss   = new THREE.MeshPhysicalMaterial({ color: 0x050506, metalness: 0.4, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const rubber  = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.95 });

  /* ---------- Hilfsfunktionen ---------- */
  // Abgerundete Box mit Fase: w (x), h (y), d (z)
  function rbox(w, h, d, r = 0.08, b = 0.03) {
    const iw = w - 2 * b, ih = h - 2 * b, rr = Math.min(r, iw / 2 - 0.001, ih / 2 - 0.001);
    const s = new THREE.Shape();
    const x = -iw / 2, y = -ih / 2;
    s.moveTo(x + rr, y);
    s.lineTo(x + iw - rr, y); s.quadraticCurveTo(x + iw, y, x + iw, y + rr);
    s.lineTo(x + iw, y + ih - rr); s.quadraticCurveTo(x + iw, y + ih, x + iw - rr, y + ih);
    s.lineTo(x + rr, y + ih); s.quadraticCurveTo(x, y + ih, x, y + ih - rr);
    s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 5, curveSegments: 10 });
    g.center();
    return g;
  }
  const cyl = (rt, rb, h, mat, y = 0, seg = 48) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.y = y; return m;
  };
  const mesh = (g, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); return m; };

  // Band entlang einer Mittellinie (u = Tiefe z, v = Höhe y), in X-Richtung extrudiert
  function ribbon(pts, width, depth, bevel = 0.012) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], 0)));
    const n = 56, L = [], R = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = curve.getPoint(t), tg = curve.getTangent(t);
      const w = typeof width === 'function' ? width(t) : width;
      L.push(new THREE.Vector2(p.x - tg.y * w / 2, p.y + tg.x * w / 2));
      R.push(new THREE.Vector2(p.x + tg.y * w / 2, p.y - tg.x * w / 2));
    }
    const g = new THREE.ExtrudeGeometry(new THREE.Shape([...L, ...R.reverse()]),
      { depth: depth - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3 });
    g.translate(0, 0, -(depth - 2 * bevel) / 2);
    g.rotateY(-Math.PI / 2);   // u → z, v → y
    return g;
  }

  const line = (a, b, rad, mat) => {
    const v = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, v.length(), 8), mat);
    m.position.copy(a).addScaledVector(v, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
    return m;
  };
  const screw = (parent, x, y, z, side) => {
    const s = cyl(0.016, 0.016, 0.01, chrome, 0, 16); s.rotation.z = Math.PI / 2;
    s.position.set(x + side * 0.004, y, z); parent.add(s);
  };

  // Schriftzug als Textur; wird nach dem Laden von Inter neu gezeichnet
  function labelTex(text, { w = 1024, h = 128, size = 62, weight = 600, spacing = 14, color = '#d8d8dc', rule = false } = {}) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      const x = c.getContext('2d'); x.clearRect(0, 0, w, h);
      x.fillStyle = color; x.font = `${weight} ${size}px "Inter", system-ui, sans-serif`;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      if ('letterSpacing' in x) x.letterSpacing = spacing + 'px';
      x.fillText(text, w / 2 + spacing / 2, rule ? h * 0.4 : h / 2);
      if (rule) x.fillRect(40, h - 20, w - 80, 3);
      t.needsUpdate = true;
    };
    draw();
    document.fonts.load(`${weight} ${size}px "Inter"`).then(draw);
    return t;
  }

  // Glatte Kontur (u = z nach vorn, v = y Höhe) durch Stützpunkte – abgenommen aus Schnitten des Originalmodells
  function contour(pts, n = 180) {
    const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], 0)), true, 'centripetal');
    return new THREE.Shape(c.getSpacedPoints(n).slice(0, -1).map(p => new THREE.Vector2(p.x, p.y)));
  }
  // Seitenkontur mit Breite w in X-Richtung extrudiert, Kanten gerundet, Außenmaß bleibt erhalten
  function slab(shape, w, mat, x = 0, b = 0.012, seg = 4) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(w - 2 * b, 0.001), bevelEnabled: true, bevelSize: b, bevelOffset: -b, bevelThickness: b, bevelSegments: seg
    });
    g.translate(0, 0, -(w - 2 * b) / 2); g.rotateY(-Math.PI / 2);
    return mesh(g, mat, x, 0, 0);
  }
  // Gepolsterte Kanäle: Kontur n-mal nebeneinander über die Breite extrudiert (Fasen bilden die Nähte)
  function channels(parent, prof, width, n, mat, b = 0.016) {
    const cw = width / n;
    const geo = new THREE.ExtrudeGeometry(prof, {
      depth: Math.max(cw - 2 * b, 0.001), bevelEnabled: true,
      bevelSize: b * 0.6, bevelOffset: -b * 0.6, bevelThickness: b, bevelSegments: 4
    });
    geo.translate(0, 0, -(cw - 2 * b) / 2); geo.rotateY(-Math.PI / 2);
    for (let i = 0; i < n; i++) parent.add(mesh(geo, mat, (i - (n - 1) / 2) * cw, 0, 0));
  }
  // Paspel entlang einer Seitenkontur bei x
  function profilePiping(parent, prof, x, rad = 0.0075) {
    const pts = prof.getSpacedPoints(200).slice(0, -1).map(p => new THREE.Vector3(x, p.y, p.x));
    parent.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 280, rad, 8, true), piping));
  }
  const tube = (pts, rad, mat, seg = 48) =>
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), seg, rad, 10), mat);
  const lathe = (pts, mat, seg = 72) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(...p)), seg), mat);
  // Teile an einem Gelenk: Gruppe sitzt im Drehpunkt, Kinder behalten ihre Modellkoordinaten
  function pivot(group, at) {
    group.children.forEach(ch => ch.position.sub(at));
    group.position.copy(at);
    return group;
  }

  /* ---------- Takara Belmont Apollo 2 (Blick nach +z) ----------
     Maße aus dem 3D-Warehouse-Modell „Takara Belmont Apollo 2“, Maßstab 1 m = 1.6 Einheiten,
     Ursprung = Mitte der Säule. Sitz-, Lehnen-, Rahmen- und Fußstützen-Konturen sind Schnitte bei x = 0 bzw. am Rahmen. */
  function buildModel() {
    const g = new THREE.Group();

    // Fuß: flache Gummischeibe, gestufte Glanzschale, Chromring, konische Säule
    g.add(lathe([[0, 0], [0.515, 0], [0.532, 0.012], [0.532, 0.032], [0.516, 0.046], [0, 0.046]], rubber));
    g.add(lathe([[0, 0.142], [0.223, 0.142], [0.3, 0.127], [0.356, 0.104], [0.38, 0.068], [0.45, 0.054], [0.503, 0.044], [0.503, 0.04]], gloss));
    g.add(lathe([[0.122, 0.177], [0.208, 0.161], [0.229, 0.142], [0.226, 0.136]], chrome));
    g.add(cyl(0.151, 0.126, 0.46, gloss, 0.36, 48));
    g.add(cyl(0.1, 0.132, 0.03, gloss, 0.6, 48));
    g.add(cyl(0.09, 0.09, 0.06, gloss, 0.64, 40));

    // Hydraulikpedal: Chrombügel von beiden Seiten der Säule nach hinten
    g.add(tube([[0.135, 0.423, 0.064], [0.18, 0.41, 0.0], [0.185, 0.36, -0.2], [0.16, 0.315, -0.345], [0.09, 0.302, -0.38],
                [-0.09, 0.302, -0.38], [-0.16, 0.315, -0.345], [-0.185, 0.36, -0.2], [-0.18, 0.41, 0.0], [-0.135, 0.423, 0.064]], 0.012, chrome, 96));
    for (const s of [-1, 1]) g.add(mesh(rbox(0.11, 0.036, 0.04, 0.01, 0.006), chrome, s * 0.13, 0.423, 0.064));

    // Sitzwanne unter dem Polster und vordere Querstrebe
    g.add(slab(contour([[0.469, 0.78], [0.497, 0.763], [0.49, 0.737], [0.387, 0.703], [-0.053, 0.654], [-0.332, 0.607], [-0.426, 0.621],
                        [-0.493, 0.649], [-0.545, 0.692], [-0.586, 0.752], [-0.586, 0.781], [-0.44, 0.801], [0.0, 0.795]]), 1.05, casting, 0, 0.012));
    g.add(mesh(rbox(0.98, 0.046, 0.048, 0.012, 0.008), casting, 0, 0.66, 0.472));

    // Gegossene Seitenrahmen: unten unter dem Sitz, hinten im Bogen hoch bis unter die Armlehne
    const frameS = contour([[-0.676, 1.046], [-0.653, 0.861], [-0.594, 0.721], [-0.527, 0.655], [-0.409, 0.606], [-0.111, 0.59], [0.151, 0.621],
      [0.456, 0.719], [0.458, 0.776], [0.475, 0.798], [0.495, 0.8], [0.52, 0.77], [0.513, 0.809], [0.476, 0.829], [0.131, 0.792],
      [-0.134, 0.783], [-0.281, 0.793], [-0.415, 0.841], [-0.463, 0.883], [-0.496, 0.94], [-0.509, 1.01], [-0.495, 1.108],
      [-0.457, 1.167], [-0.386, 1.231], [-0.34, 1.258], [-0.255, 1.283], [-0.45, 1.272], [-0.631, 1.237], [-0.661, 1.161]], 320);
    const deco = new THREE.MeshBasicMaterial({ map: labelTex('BELMONT', { size: 70, spacing: 22, color: '#c9cacd' }), transparent: true, depthWrite: false, toneMapped: false });
    for (const s of [-1, 1]) {
      g.add(slab(frameS, 0.059, casting, s * 0.556, 0.014));
      // Chromleiste mit BELMONT-Schriftzug auf der Außenseite
      for (const [u0, u1] of [[-0.568, -0.335], [0.165, 0.381]]) g.add(mesh(rbox(0.006, 0.009, u1 - u0, 0.002, 0.001), chrome, s * 0.587, 0.703, (u0 + u1) / 2));
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.0575), deco);
      d.position.set(s * 0.5875, 0.704, -0.085); d.rotation.y = s * Math.PI / 2; g.add(d);
      // Lagerbolzen Fußstütze und Lehne
      screw(g, s * 0.584, 0.777, 0.467, s);
      const bolt = cyl(0.014, 0.014, 0.03, chrome, 0, 16); bolt.rotation.z = Math.PI / 2; bolt.position.set(s * 0.475, 0.817, -0.667); g.add(bolt);
    }

    // Sitzpolster: dick, vorn rund, nach hinten leicht abfallend; Kanäle in der Mitte, glatte Seitenwangen, Paspel
    const seatS = contour([[-0.24, 0.734], [-0.339, 0.742], [-0.369, 0.755], [-0.383, 0.776], [-0.391, 0.841], [-0.382, 0.926], [-0.367, 0.953],
      [-0.335, 0.971], [-0.118, 1.012], [0.268, 1.049], [0.527, 1.054], [0.567, 1.046], [0.585, 1.026], [0.59, 0.867], [0.571, 0.801],
      [0.538, 0.767], [0.169, 0.737]]);
    channels(g, seatS, 0.6, 9, leather);
    for (const s of [-1, 1]) g.add(slab(seatS, 0.23, leather, s * 0.415, 0.035, 6));
    profilePiping(g, seatS, 0.531); profilePiping(g, seatS, -0.531);

    // Rückenlehne: Drehpunkt an den hinteren Lagerbolzen; dicke Lordose unten, schmaler nach oben
    const back = new THREE.Group(); back.name = 'back'; g.add(back);
    const backS = contour([[-0.769, 1.235], [-0.867, 1.767], [-0.843, 1.796], [-0.747, 1.818], [-0.697, 1.803], [-0.639, 1.75], [-0.581, 1.664],
      [-0.521, 1.53], [-0.427, 1.218], [-0.404, 1.085], [-0.398, 0.951], [-0.414, 0.838], [-0.456, 0.802], [-0.611, 0.79], [-0.652, 0.803],
      [-0.687, 0.852], [-0.706, 0.905]]);
    channels(back, backS, 0.62, 10, leather);
    for (const s of [-1, 1]) back.add(slab(backS, 0.18, leather, s * 0.4, 0.03, 6));
    profilePiping(back, backS, 0.491); profilePiping(back, backS, -0.491);
    // Rückwand mit sechs Chromschrauben; hier sitzt der Barber-Name
    const rear = new THREE.Group(); rear.position.set(0, 1.315, -0.8); rear.rotation.x = -0.185; back.add(rear);
    rear.add(mesh(rbox(0.94, 0.9, 0.03, 0.05, 0.01), casting));
    for (const sx of [-1, 1]) for (const y of [-0.4, 0, 0.4]) {
      const sc = cyl(0.013, 0.013, 0.008, chrome, 0, 16); sc.rotation.x = Math.PI / 2; sc.position.set(sx * 0.43, y, -0.017); rear.add(sc);
    }
    const nameAnchor = new THREE.Object3D(); nameAnchor.name = 'nameAnchor'; nameAnchor.position.set(0, 0.12, -0.018); rear.add(nameAnchor);
    // Verstellhebel rechts an der Lehne
    const knuckle = cyl(0.03, 0.03, 0.025, chrome, 0, 24); knuckle.rotation.z = Math.PI / 2; knuckle.position.set(0.5, 1.49, -0.678); back.add(knuckle);
    back.add(mesh(new THREE.CylinderGeometry(0.009, 0.02, 0.19, 20), chrome, 0.513, 1.515, -0.678));
    back.add(mesh(new THREE.SphereGeometry(0.016, 16, 12), chrome, 0.513, 1.612, -0.678));
    back.add(mesh(new THREE.SphereGeometry(0.02, 16, 12), chrome, 0.513, 1.42, -0.678));

    // Kopfstütze: Polsterrolle mit Paspel, Chromplatte mit Seitenwangen, Flachstange in die Lehne
    const headS = contour([[-0.716, 1.928], [-0.721, 1.853], [-0.76, 1.837], [-0.802, 1.892], [-0.815, 1.954], [-0.796, 1.985], [-0.76, 1.99], [-0.731, 1.965]], 90);
    back.add(slab(headS, 0.29, leather, 0, 0.035, 6));
    profilePiping(back, headS, 0.146, 0.006); profilePiping(back, headS, -0.146, 0.006);
    back.add(mesh(rbox(0.33, 0.123, 0.05, 0.02, 0.01), brushed, 0, 1.905, -0.818));
    for (const s of [-1, 1]) back.add(mesh(rbox(0.008, 0.145, 0.117, 0.004, 0.002), chrome, s * 0.167, 1.907, -0.808));
    back.add(mesh(rbox(0.04, 0.14, 0.038, 0.006, 0.004), chrome, 0, 1.85, -0.842));
    pivot(back, new THREE.Vector3(0, 0.817, -0.667));

    // Armlehnen: lange Polster, hinten leicht abfallend, Chromkappe vorn
    const armS = contour([[0.141, 1.321], [-0.25, 1.282], [-0.654, 1.242], [-0.638, 1.345], [-0.602, 1.367], [-0.125, 1.417], [0.089, 1.426], [0.118, 1.406]]);
    for (const s of [-1, 1]) {
      g.add(slab(armS, 0.116, leather, s * 0.548, 0.028, 6));
      g.add(line(new THREE.Vector3(s * 0.607, 1.3, 0.1), new THREE.Vector3(s * 0.607, 1.255, -0.6), 0.0055, piping));
      g.add(mesh(rbox(0.122, 0.106, 0.214, 0.024, 0.012), chrome, s * 0.551, 1.372, 0.217));
    }
    // Chrombügel unter der linken Armlehne
    g.add(tube([[-0.612, 1.3, 0.03], [-0.612, 1.2, 0.02], [-0.612, 1.158, -0.04], [-0.612, 1.158, -0.5], [-0.612, 1.2, -0.555], [-0.612, 1.3, -0.56]], 0.008, chrome, 64));

    // Fußstütze: zwei Gussbeine, breites Polster mit Chromleisten, gerippte Trittplatte mit Stellfuß
    const foot = new THREE.Group(); foot.name = 'foot'; g.add(foot);
    const legG = ribbon([[0.5, 0.79], [0.53, 0.66], [0.585, 0.45], [0.645, 0.235]], 0.085, 0.05);
    for (const s of [-1, 1]) foot.add(mesh(legG, casting, s * 0.5, 0, 0));
    foot.add(mesh(rbox(0.9, 0.09, 0.045, 0.015, 0.01), casting, 0, 0.318, 0.658));
    const padS = contour([[0.674, 0.289], [0.677, 0.262], [0.662, 0.252], [0.645, 0.256], [0.632, 0.285], [0.494, 0.639], [0.519, 0.67], [0.559, 0.674], [0.579, 0.656]], 90);
    foot.add(slab(padS, 0.95, leather, 0, 0.02, 5));
    for (const [y, z] of [[0.655, 0.555], [0.29, 0.665]]) {
      const tr = mesh(rbox(0.97, 0.022, 0.05, 0.006, 0.004), chrome, 0, y, z); tr.rotation.x = -0.29; foot.add(tr);
    }
    const hinge = new THREE.Group(); hinge.name = 'footplate'; foot.add(hinge);
    hinge.add(slab(contour([[0.892, 0.271], [1.179, 0.313], [1.213, 0.311], [1.235, 0.267], [0.689, 0.181], [0.683, 0.243]], 90), 0.86, brushed, 0, 0.01));
    const rib = new THREE.CapsuleGeometry(0.0065, 0.46, 4, 8).rotateX(Math.PI / 2 - 0.134);
    for (let i = -10; i <= 10; i++) hinge.add(mesh(rib, chrome, i * 0.039, 0.293, 0.95));
    hinge.add(cyl(0.012, 0.012, 0.2, chrome, 0.13, 16).translateZ(0.996));
    hinge.add(cyl(0.037, 0.03, 0.032, rubber, 0.016, 24).translateZ(0.996));
    for (const s of [-1, 1]) { const p = cyl(0.014, 0.014, 0.03, chrome, 0, 16); p.rotation.z = Math.PI / 2; p.position.set(s * 0.457, 0.227, 0.77); hinge.add(p); }
    pivot(hinge, new THREE.Vector3(0, 0.212, 0.686));
    pivot(foot, new THREE.Vector3(0, 0.777, 0.467));

    return g;
  }

  return { buildModel, labelTex };
};

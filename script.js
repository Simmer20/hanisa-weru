// register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// shared registry so the theme toggle can retint the hero globe's 3D scene
const LP_SCENES = {};
const HERO_BG_LIGHT = 0xE9E3DA;
const HERO_BG_DARK = 0x16283D;

// ---------- HERO GLOBE (Three.js) ----------
(function initHeroGlobe() {
  const container = document.getElementById('hero-3d');
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;

  const tooltip = document.createElement('div');
  tooltip.className = 'globe-tooltip';
  container.appendChild(tooltip);

  const scene = new THREE.Scene();
  const startDark = document.documentElement.getAttribute('data-theme') === 'dark';
  scene.background = new THREE.Color(startDark ? HERO_BG_DARK : HERO_BG_LIGHT);
  LP_SCENES.hero = scene;

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  camera.position.set(0, 0, 12);
  const MIN_ZOOM = 8.2;
  const MAX_ZOOM = 15.5;
  let targetCameraZ = camera.position.z;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // light
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(1, 2, 4);
  scene.add(dirLight);

  // globe group
  const group = new THREE.Group();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hoveredNode = null;
  const BASE_ROT_Y = 1.1;
  const MIN_ROT_Y = 0.45;
  const MAX_ROT_Y = 1.85;
  const MIN_ROT_X = -0.42;
  const MAX_ROT_X = 0.42;
  let targetRotX = 0.02;
  let targetRotY = BASE_ROT_Y;
  group.rotation.y = targetRotY;
  group.rotation.x = targetRotX;
  scene.add(group);
  let isDragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragRotStartX = 0;
  let dragRotStartY = 0;
  let inertiaX = 0;
  let inertiaY = 0;

  // sphere
  const radius = 3.2;
  const segments = 48;
  const sphereGeo = new THREE.SphereGeometry(radius, segments, segments);
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0x214E7A,
    emissive: 0x0E2A47,
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.65,
    wireframe: false,
    shininess: 20,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphere);

  // wireframe overlay
  const wireGeo = new THREE.SphereGeometry(radius * 1.005, 28, 28);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xB68D40,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  group.add(wire);

  function latLonToVector3(lat, lon, r = radius + 0.05) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function makeTextSprite(text, size = 92, bg = 'rgba(8,20,35,0.8)', fg = '#f6f7f8') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 176;

    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(14, 14, canvas.width - 28, canvas.height - 28, 22);
    ctx.fill();

    ctx.fillStyle = fg;
    ctx.font = '600 54px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size * 0.015, size * 0.0052, 1);
    return sprite;
  }

  const countries = [
    { name: 'Kenya', lat: -1.2864, lon: 36.8172 },
    { name: 'Ghana', lat: 5.6037, lon: -0.1870 },
    { name: 'Nigeria', lat: 9.0765, lon: 7.3986 },
    { name: 'South Africa', lat: -26.2041, lon: 28.0473 },
    { name: 'Egypt', lat: 30.0444, lon: 31.2357 },
    { name: 'UAE', lat: 25.2048, lon: 55.2708 },
    { name: 'Spain', lat: 40.4168, lon: -3.7038 },
    { name: 'United Kingdom', lat: 51.5072, lon: -0.1276 },
    { name: 'United States', lat: 40.7128, lon: -74.0060 }
  ];

  const nodeMeshes = [];
  const pulseOffsets = [];
  const nodeGeo = new THREE.SphereGeometry(0.11, 14, 14);

  countries.forEach((country, i) => {
    const pos = latLonToVector3(country.lat, country.lon);
    const node = new THREE.Mesh(
      nodeGeo,
      new THREE.MeshStandardMaterial({
        color: 0xF7F5F2,
        emissive: 0xD4B06A,
        emissiveIntensity: 0.35,
      })
    );

    node.position.copy(pos);
    node.userData = { ...country, baseScale: 1 };
    group.add(node);
    nodeMeshes.push(node);
    pulseOffsets.push(i * 0.8);

    const pinLine = new THREE.BufferGeometry().setFromPoints([
      pos.clone().multiplyScalar(0.92),
      pos.clone()
    ]);
    group.add(new THREE.Line(pinLine, new THREE.LineBasicMaterial({ color: 0xB68D40, transparent: true, opacity: 0.38 })));

    const countryLabel = makeTextSprite(country.name, 74, 'rgba(10,22,38,0.72)', '#EDE4D2');
    countryLabel.position.copy(pos.clone().multiplyScalar(1.12));
    group.add(countryLabel);
  });

  const routes = [
    { from: 'Kenya', to: 'Ghana' },
    { from: 'Kenya', to: 'UAE' },
    { from: 'Ghana', to: 'United Kingdom' },
    { from: 'Nigeria', to: 'United States' },
    { from: 'South Africa', to: 'Spain' },
    { from: 'Egypt', to: 'UAE' }
  ];

  routes.forEach((route) => {
    const fromNode = nodeMeshes.find((node) => node.userData.name === route.from);
    const toNode = nodeMeshes.find((node) => node.userData.name === route.to);
    if (!fromNode || !toNode) return;

    const arcMid = fromNode.position.clone().add(toNode.position).multiplyScalar(0.5).normalize().multiplyScalar(radius + 1.05);
    const curve = new THREE.QuadraticBezierCurve3(fromNode.position.clone(), arcMid, toNode.position.clone());
    const points = curve.getPoints(34);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xD4B06A, transparent: true, opacity: 0.4 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    group.add(line);

    const connectionLabel = makeTextSprite('Interconnection', 60, 'rgba(12, 26, 44, 0.72)', '#FFFFFF');
    connectionLabel.position.copy(curve.getPoint(0.52));
    group.add(connectionLabel);
  });

  function setTooltip(node, clientX, clientY) {
    if (!node) {
      tooltip.style.opacity = '0';
      return;
    }

    tooltip.innerHTML = `<strong>${node.userData.name}</strong>Connected country node`;
    const bounds = container.getBoundingClientRect();
    const x = clientX - bounds.left;
    const y = clientY - bounds.top;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${Math.max(14, y - 12)}px`;
    tooltip.style.opacity = '1';
  }

  container.addEventListener('pointerdown', (event) => {
    isDragging = true;
    dragMoved = false;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragRotStartX = targetRotX;
    dragRotStartY = targetRotY;
    inertiaX = 0;
    inertiaY = 0;
    container.setPointerCapture(event.pointerId);
    container.style.cursor = 'grabbing';
  });

  container.addEventListener('pointermove', (event) => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    if (isDragging) {
      const dx = event.clientX - dragStartX;
      const dy = event.clientY - dragStartY;
      dragMoved = Math.abs(dx) > 2 || Math.abs(dy) > 2;

      targetRotY = dragRotStartY + dx * 0.0085;
      targetRotX = dragRotStartX + dy * 0.0045;
      targetRotY = Math.max(MIN_ROT_Y, Math.min(MAX_ROT_Y, targetRotY));
      targetRotX = Math.max(MIN_ROT_X, Math.min(MAX_ROT_X, targetRotX));

      inertiaY = dx * 0.00008;
      inertiaX = dy * 0.00004;
    }

    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(nodeMeshes, false);
    hoveredNode = intersections.length ? intersections[0].object : null;
    if (!isDragging) {
      container.style.cursor = hoveredNode ? 'pointer' : 'grab';
    }
    setTooltip(hoveredNode, event.clientX, event.clientY);
  });

  container.addEventListener('pointerup', (event) => {
    isDragging = false;
    container.releasePointerCapture(event.pointerId);
    container.style.cursor = hoveredNode ? 'pointer' : 'grab';
  });

  container.addEventListener('pointerleave', () => {
    hoveredNode = null;
    isDragging = false;
    setTooltip(null);
    container.style.cursor = 'grab';
  });

  container.addEventListener('wheel', (event) => {
    event.preventDefault();
    const zoomStep = event.deltaY * 0.01;
    targetCameraZ = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetCameraZ + zoomStep));
  }, { passive: false });

  container.addEventListener('click', () => {
    if (dragMoved || !hoveredNode) return;
    gsap.fromTo(
      hoveredNode.scale,
      { x: 1, y: 1, z: 1 },
      { x: 1.8, y: 1.8, z: 1.8, yoyo: true, repeat: 1, duration: 0.24, ease: 'power2.out' }
    );
  });

  // animation loop
  function animate() {
    requestAnimationFrame(animate);

    const t = performance.now() * 0.001;

    if (!isDragging) {
      targetRotY += inertiaY;
      targetRotX += inertiaX;
      inertiaY *= 0.94;
      inertiaX *= 0.94;

      targetRotY = Math.max(MIN_ROT_Y, Math.min(MAX_ROT_Y, targetRotY));
      targetRotX = Math.max(MIN_ROT_X, Math.min(MAX_ROT_X, targetRotX));
    }

    group.rotation.y += (targetRotY - group.rotation.y) * 0.028;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.03;

    nodeMeshes.forEach((node, i) => {
      const pulse = 1 + Math.sin(t * 2.2 + pulseOffsets[i]) * 0.12;
      node.scale.setScalar(hoveredNode === node ? 1.5 : pulse);
      node.material.emissiveIntensity = hoveredNode === node ? 0.95 : 0.35;
    });

    camera.position.z += (targetCameraZ - camera.position.z) * 0.09;

    renderer.render(scene, camera);
  }
  animate();

  // resize
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
})();

// ---------- NETWORK VISUAL (Three.js) ----------
(function initNetwork() {
  const container = document.getElementById('network-3d-container');
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1A3348);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dl = new THREE.DirectionalLight(0xffffff, 0.9);
  dl.position.set(2, 3, 5);
  scene.add(dl);

  // nodes with labels (sectors)
  const sectors = [
    { label: 'Banking', color: 0xB68D40, pos: [-2.5, 1.8, 0] },
    { label: 'Fintech', color: 0xEFEAE3, pos: [2.2, 1.6, 0] },
    { label: 'Clean Energy', color: 0x7DAF6A, pos: [-1.2, -2.0, 1.5] },
    { label: 'Infrastructure', color: 0x6A9BBF, pos: [1.8, -1.8, -1.2] },
    { label: 'Carbon Markets', color: 0xD4B06A, pos: [0.0, 0.0, -2.8] },
  ];

  const group = new THREE.Group();
  scene.add(group);

  // create nodes
  const nodeMeshes = [];
  sectors.forEach(s => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshStandardMaterial({ color: s.color, emissive: s.color, emissiveIntensity: 0.2 })
    );
    sphere.position.set(s.pos[0], s.pos[1], s.pos[2]);
    group.add(sphere);
    nodeMeshes.push(sphere);
  });

  // draw connecting lines
  for (let i = 0; i < sectors.length; i++) {
    for (let j = i + 1; j < sectors.length; j++) {
      const p1 = new THREE.Vector3(sectors[i].pos[0], sectors[i].pos[1], sectors[i].pos[2]);
      const p2 = new THREE.Vector3(sectors[j].pos[0], sectors[j].pos[1], sectors[j].pos[2]);
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const mat = new THREE.LineBasicMaterial({ color: 0xB68D40, transparent: true, opacity: 0.25 });
      const line = new THREE.Line(geo, mat);
      group.add(line);
    }
  }

  // animation
  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.002;
    group.rotation.x = Math.sin(Date.now() * 0.0002) * 0.05;
    renderer.render(scene, camera);
  }
  animate();

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
})();

// ---------- PARTICLE CTA (Three.js) ----------
(function initParticles() {
  const container = document.getElementById('cta-3d-container');
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xB68D40);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // particles
  const count = 400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 16;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.001;
    particles.rotation.x = Math.sin(Date.now() * 0.00015) * 0.02;
    renderer.render(scene, camera);
  }
  animate();

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
})();

// ---------- GSAP SCROLL ANIMATIONS (three.js enhanced) ----------
// We use ScrollTrigger to animate 3D containers on scroll – subtle fade/scale
gsap.utils.toArray('#hero-3d, #network-3d-container, #cta-3d-container').forEach(el => {
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    opacity: 0.4,
    scale: 0.96,
    duration: 1.2,
    ease: 'power2.out',
  });
});

// fade up for engagement cards
gsap.utils.toArray('.engagement-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 88%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: i * 0.08,
    ease: 'power2.out',
  });
});

// fade up for stats
gsap.utils.toArray('.stat-item').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 90%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    x: -12,
    duration: 0.7,
    delay: i * 0.1,
    ease: 'power2.out',
  });
});

// audience tags stagger
gsap.utils.toArray('.audience-tag').forEach((tag, i) => {
  gsap.from(tag, {
    scrollTrigger: {
      trigger: '#audience .audience-grid',
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    scale: 0.92,
    duration: 0.5,
    delay: i * 0.04,
    ease: 'power1.out',
  });
});

// logo marks fade in
gsap.utils.toArray('.partner-card').forEach((mark, i) => {
  gsap.from(mark, {
    scrollTrigger: {
      trigger: '#logos .partner-grid',
      start: 'top 88%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    y: 10,
    duration: 0.5,
    delay: i * 0.05,
    ease: 'power1.out',
  });
});

// founder + field gallery reveal
gsap.utils.toArray('.founder-photo-col, .field-card').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 90%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    y: 24,
    duration: 0.7,
    delay: i * 0.07,
    ease: 'power2.out',
  });
});

// ---------- FOUNDER PHOTO SLIDER ----------
(function initFounderSlider() {
  const sliders = document.querySelectorAll('.founder-slider');
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('.founder-slide'));
    const dots = Array.from(slider.querySelectorAll('.founder-dot'));
    const prevBtn = slider.querySelector('.founder-slider-btn.prev');
    const nextBtn = slider.querySelector('.founder-slider-btn.next');

    if (!slides.length) return;

    let currentIndex = slides.findIndex((slide) => slide.classList.contains('active'));
    if (currentIndex < 0) currentIndex = 0;

    const autoplayEnabled = slider.dataset.autoplay === 'true';
    const autoplayInterval = Number(slider.dataset.interval) || 4200;
    let autoplayTimer = null;

    function showSlide(index) {
      const safeIndex = (index + slides.length) % slides.length;
      currentIndex = safeIndex;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === safeIndex);
      });

      dots.forEach((dot, i) => {
        const isActive = i === safeIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function stopAutoplay() {
      if (!autoplayTimer) return;
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    function startAutoplay() {
      if (!autoplayEnabled) return;
      stopAutoplay();
      autoplayTimer = setInterval(() => {
        showSlide(currentIndex + 1);
      }, autoplayInterval);
    }

    prevBtn?.addEventListener('click', () => {
      showSlide(currentIndex - 1);
      startAutoplay();
    });

    nextBtn?.addEventListener('click', () => {
      showSlide(currentIndex + 1);
      startAutoplay();
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = Number(dot.dataset.slide);
        if (Number.isNaN(target)) return;
        showSlide(target);
        startAutoplay();
      });
    });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);

    showSlide(currentIndex);
    startAutoplay();
  });
})();

// rate cards fade up
gsap.utils.toArray('.rate-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 88%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: i * 0.1,
    ease: 'power2.out',
  });
});

// ---------- LIGHT / DARK MODE TOGGLE ----------
// Note: theme choice is kept in memory only (no localStorage), since
// browser storage APIs aren't supported inside Claude.ai artifact previews.
// Once this site is deployed on its own domain, feel free to swap the
// in-memory `currentTheme` variable below for localStorage so the
// preference persists across visits.
(function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  const icon = toggleBtn.querySelector('i');
  let currentTheme = 'light';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (LP_SCENES.hero) {
      LP_SCENES.hero.background = new THREE.Color(theme === 'dark' ? HERO_BG_DARK : HERO_BG_LIGHT);
    }
  }

  toggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
  });

  applyTheme(currentTheme);
})();

console.log('North Star · LynchPin · Go‑to‑Market Authority');
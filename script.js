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

  const scene = new THREE.Scene();
  const startDark = document.documentElement.getAttribute('data-theme') === 'dark';
  scene.background = new THREE.Color(startDark ? HERO_BG_DARK : HERO_BG_LIGHT);
  LP_SCENES.hero = scene;

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  camera.position.set(0, 0, 12);

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
  scene.add(group);

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

  // nodes (small spheres) on globe surface
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0xFCFBF8, emissive: 0xB68D40, emissiveIntensity: 0.3 });
  const positions = [
    [1.2, 1.8, 2.2], [-1.8, 1.2, 2.0], [2.4, -0.8, 1.6], [-2.2, -1.0, 1.8],
    [0.5, 2.6, 1.0], [-0.3, -2.4, 1.4], [2.0, 1.0, -2.0], [-2.6, 0.6, -1.2],
    [1.6, -1.8, -1.8], [-1.0, -2.0, -1.6], [2.8, -0.2, -0.8], [-2.4, 0.2, -1.8],
    [0.0, 0.0, 3.0], [0.0, 0.0, -3.0], [1.0, 2.0, -1.8], [-1.6, 1.6, -1.8]
  ];
  positions.forEach(pos => {
    const [x, y, z] = pos;
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), nodeMat);
    node.position.set(x, y, z);
    group.add(node);
    // tiny connecting line to origin
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(x, y, z)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xB68D40, transparent: true, opacity: 0.12 });
    const line = new THREE.Line(lineGeo, lineMat);
    group.add(line);
  });

  // animation loop
  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.0018;
    group.rotation.x = Math.sin(Date.now() * 0.0003) * 0.08;
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
gsap.utils.toArray('.logo-mark').forEach((mark, i) => {
  gsap.from(mark, {
    scrollTrigger: {
      trigger: '#logos .logos-strip',
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

// gallery tiles fade + scale in
gsap.utils.toArray('.gallery-tile').forEach((tile, i) => {
  gsap.from(tile, {
    scrollTrigger: {
      trigger: tile,
      start: 'top 90%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    scale: 0.94,
    duration: 0.7,
    delay: i * 0.07,
    ease: 'power2.out',
  });
});

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
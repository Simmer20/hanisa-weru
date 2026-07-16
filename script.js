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
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin('anonymous');

  const earthDayMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
  const earthNormalMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
  const earthSpecularMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');

  earthDayMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  earthDayMap.colorSpace = THREE.SRGBColorSpace;

  const sphereGeo = new THREE.SphereGeometry(radius, segments, segments);
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: earthDayMap,
    normalMap: earthNormalMap,
    normalScale: new THREE.Vector2(0.75, 0.75),
    specularMap: earthSpecularMap,
    specular: new THREE.Color(0x324657),
    emissive: 0x10213B,
    emissiveIntensity: 0.08,
    transparent: true,
    opacity: 0.96,
    wireframe: false,
    shininess: 18,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphere);

  const cloudMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
  const cloudGeo = new THREE.SphereGeometry(radius * 1.012, 48, 48);
  const cloudMat = new THREE.MeshLambertMaterial({
    map: cloudMap,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  const clouds = new THREE.Mesh(cloudGeo, cloudMat);
  group.add(clouds);

  // wireframe overlay
  const wireGeo = new THREE.SphereGeometry(radius * 1.005, 28, 28);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xB68D40,
    wireframe: true,
    transparent: true,
    opacity: 0.09,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  group.add(wire);

  const glowGeo = new THREE.SphereGeometry(radius * 1.065, 42, 42);
  const glowMat = new THREE.MeshPhongMaterial({
    color: 0x5B8DBF,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  const starsGeo = new THREE.BufferGeometry();
  const starCount = 550;
  const starArray = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 24 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starArray[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starArray[i * 3 + 1] = r * Math.cos(phi);
    starArray[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starArray, 3));
  const stars = new THREE.Points(
    starsGeo,
    new THREE.PointsMaterial({
      color: 0xC9D7E4,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    })
  );
  scene.add(stars);

  function latLonToVector3(lat, lon, r = radius + 0.05) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  const regionColors = {
    Africa: 0xD4B06A,
    'Middle East': 0x5EA8A2,
    Europe: 0x93B4D6,
    'United States': 0xF2D6A8,
  };

  const markets = [
    { name: 'Kenya', region: 'Africa', lat: -1.2864, lon: 36.8172 },
    { name: 'Ghana', region: 'Africa', lat: 5.6037, lon: -0.1870 },
    { name: 'Nigeria', region: 'Africa', lat: 9.0765, lon: 7.3986 },
    { name: 'South Africa', region: 'Africa', lat: -26.2041, lon: 28.0473 },
    { name: 'Egypt', region: 'Africa', lat: 30.0444, lon: 31.2357 },
    { name: 'Morocco', region: 'Africa', lat: 33.5731, lon: -7.5898 },
    { name: 'Tunisia', region: 'Africa', lat: 36.8065, lon: 10.1815 },
    { name: 'Ethiopia', region: 'Africa', lat: 8.9806, lon: 38.7578 },
    { name: 'Tanzania', region: 'Africa', lat: -6.7924, lon: 39.2083 },
    { name: 'Uganda', region: 'Africa', lat: 0.3476, lon: 32.5825 },
    { name: 'Rwanda', region: 'Africa', lat: -1.9706, lon: 30.1044 },
    { name: 'Zambia', region: 'Africa', lat: -15.3875, lon: 28.3228 },
    { name: 'Zimbabwe', region: 'Africa', lat: -17.8252, lon: 31.0335 },
    { name: 'Botswana', region: 'Africa', lat: -24.6282, lon: 25.9231 },
    { name: 'Namibia', region: 'Africa', lat: -22.5609, lon: 17.0658 },
    { name: 'Senegal', region: 'Africa', lat: 14.7167, lon: -17.4677 },
    { name: 'Cote d\'Ivoire', region: 'Africa', lat: 5.3600, lon: -4.0083 },
    { name: 'Cameroon', region: 'Africa', lat: 3.8480, lon: 11.5021 },
    { name: 'DR Congo', region: 'Africa', lat: -4.4419, lon: 15.2663 },
    { name: 'Angola', region: 'Africa', lat: -8.8383, lon: 13.2344 },
    { name: 'Algeria', region: 'Africa', lat: 36.7538, lon: 3.0588 },
    { name: 'Mozambique', region: 'Africa', lat: -25.9692, lon: 32.5732 },
    { name: 'Dubai', region: 'Middle East', lat: 25.2048, lon: 55.2708 },
    { name: 'Kuwait', region: 'Middle East', lat: 29.3759, lon: 47.9774 },
    { name: 'Qatar', region: 'Middle East', lat: 25.2854, lon: 51.5310 },
    { name: 'Spain', region: 'Europe', lat: 40.4168, lon: -3.7038 },
    { name: 'London', region: 'Europe', lat: 51.5072, lon: -0.1276 },
    { name: 'Denmark', region: 'Europe', lat: 55.6761, lon: 12.5683 },
    { name: 'New York', region: 'United States', lat: 40.7128, lon: -74.0060 },
    { name: 'Washington DC', region: 'United States', lat: 38.9072, lon: -77.0369 },
    { name: 'Baltimore', region: 'United States', lat: 39.2904, lon: -76.6122 },
    { name: 'Delaware', region: 'United States', lat: 39.7447, lon: -75.5484 },
  ];

  const nodeMeshes = [];
  const pulseOffsets = [];
  const nodeGeo = new THREE.SphereGeometry(0.09, 12, 12);
  const heatmapMeshes = [];
  const nodeIndex = new Map();
  let activeRegion = null;

  markets.forEach((market, i) => {
    const pos = latLonToVector3(market.lat, market.lon);
    const color = regionColors[market.region] || 0xD4B06A;
    const node = new THREE.Mesh(
      nodeGeo,
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.42,
      })
    );

    node.position.copy(pos);
    node.userData = { ...market, baseScale: 1 };
    group.add(node);
    nodeMeshes.push(node);
    nodeIndex.set(market.name, node);
    pulseOffsets.push(i * 0.41);

    const pinLine = new THREE.BufferGeometry().setFromPoints([
      pos.clone().multiplyScalar(0.95),
      pos.clone(),
    ]);
    group.add(
      new THREE.Line(
        pinLine,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 })
      )
    );
  });

  const hotspotDefs = [
    { name: 'Kenya', intensity: 1.0, tint: 0xFF4D4D },
    { name: 'Nigeria', intensity: 0.92, tint: 0xFF3838 },
    { name: 'Egypt', intensity: 0.88, tint: 0xFF5454 },
    { name: 'South Africa', intensity: 0.84, tint: 0xFF5C5C },
    { name: 'London', intensity: 0.76, tint: 0xFF7070 },
    { name: 'Spain', intensity: 0.68, tint: 0xFF7A7A },
    { name: 'Dubai', intensity: 1.0, tint: 0xFF1F1F },
    { name: 'Qatar', intensity: 0.9, tint: 0xFF2A2A },
    { name: 'Kuwait', intensity: 0.86, tint: 0xFF3434 },
  ];

  hotspotDefs.forEach((spot, i) => {
    const node = nodeIndex.get(spot.name);
    if (!node) return;

    const ring = new THREE.Mesh(
      new THREE.CircleGeometry(0.14 + spot.intensity * 0.055, 40),
      new THREE.MeshBasicMaterial({
        color: spot.tint,
        transparent: true,
        opacity: 0.36,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );

    ring.position.copy(node.position.clone().multiplyScalar(1.012));
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    ring.rotateX(Math.PI);
    group.add(ring);

    const core = new THREE.Mesh(
      new THREE.CircleGeometry(0.06 + spot.intensity * 0.03, 28),
      new THREE.MeshBasicMaterial({
        color: 0xFFB3B3,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    core.position.copy(node.position.clone().multiplyScalar(1.018));
    core.lookAt(new THREE.Vector3(0, 0, 0));
    core.rotateX(Math.PI);
    group.add(core);

    heatmapMeshes.push({ ring, core, region: node.userData.region, intensity: spot.intensity, offset: i * 0.61 });
  });

  function setTooltip(node, clientX, clientY) {
    if (!node) {
      tooltip.style.opacity = '0';
      return;
    }

    tooltip.innerHTML = `<strong>${node.userData.name}</strong>${node.userData.region} coverage node`;
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
    activeRegion = activeRegion === hoveredNode.userData.region ? null : hoveredNode.userData.region;
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
    sphere.rotation.y += 0.0009;
    clouds.rotation.y += 0.00125;

    stars.rotation.y += 0.00015;

    nodeMeshes.forEach((node, i) => {
      const pulse = 1 + Math.sin(t * 2.2 + pulseOffsets[i]) * 0.12;
      const selected = activeRegion ? node.userData.region === activeRegion : true;
      const isHovered = hoveredNode === node;
      node.scale.setScalar(isHovered ? 1.55 : pulse * (selected ? 1 : 0.72));
      node.material.emissiveIntensity = isHovered ? 0.95 : selected ? 0.45 : 0.18;
      node.material.opacity = selected ? 1 : 0.55;
      node.material.transparent = true;
    });

    heatmapMeshes.forEach((heat) => {
      const selected = activeRegion ? heat.region === activeRegion : true;
      const pulse = 0.84 + Math.sin(t * 2.6 + heat.offset) * 0.26;
      const scale = 1 + pulse * heat.intensity * 0.34;

      heat.ring.scale.set(scale, scale, 1);
      heat.core.scale.set(0.95 + pulse * 0.22, 0.95 + pulse * 0.22, 1);
      heat.ring.material.opacity = selected ? 0.38 : 0.11;
      heat.core.material.opacity = selected ? 0.62 : 0.22;
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

// ---------- ABOUT STORY TIMELINE ----------
(function initAboutTimeline() {
  const nav = document.querySelector('.timeline-nav');
  const steps = Array.from(document.querySelectorAll('.timeline-step'));
  const cards = Array.from(document.querySelectorAll('.timeline-story-card'));
  if (!nav || !steps.length || !cards.length) return;

  const inlineHost = document.createElement('div');
  inlineHost.className = 'timeline-inline-host';

  function renderInlineCard(step, id) {
    const activeCard = cards.find((card) => card.dataset.story === id);
    if (!activeCard || !step) return;

    if (inlineHost.parentElement) {
      inlineHost.parentElement.removeChild(inlineHost);
    }

    step.insertAdjacentElement('afterend', inlineHost);
    inlineHost.appendChild(activeCard);
    activeCard.hidden = false;
  }

  function showStory(id) {
    let activeStep = null;

    steps.forEach((step) => {
      const isActive = step.dataset.timeline === id;
      step.classList.toggle('active', isActive);
      step.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) activeStep = step;
    });

    cards.forEach((card) => {
      const isActive = card.dataset.story === id;
      card.classList.toggle('active', isActive);
      card.hidden = !isActive;
    });

    renderInlineCard(activeStep, id);
  }

  steps.forEach((step, index) => {
    step.addEventListener('click', () => {
      showStory(step.dataset.timeline);
    });

    step.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      const dir = event.key === 'ArrowDown' ? 1 : -1;
      const targetIndex = (index + dir + steps.length) % steps.length;
      const targetStep = steps[targetIndex];
      targetStep.focus();
      showStory(targetStep.dataset.timeline);
    });
  });

  const activeStep = steps.find((step) => step.classList.contains('active'));
  showStory(activeStep?.dataset.timeline || steps[0].dataset.timeline);
})();

gsap.utils.toArray('.timeline-step').forEach((step, i) => {
  gsap.from(step, {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    x: -20,
    duration: 0.6,
    delay: i * 0.1,
    ease: 'power2.out',
  });
});

gsap.utils.toArray('.timeline-story-card').forEach((card) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    y: 24,
    duration: 0.7,
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
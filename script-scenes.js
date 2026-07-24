window.LP_SCENES = window.LP_SCENES || {};
window.HERO_BG_LIGHT = window.HERO_BG_LIGHT || 0xE9E3DA;
window.HERO_BG_DARK = window.HERO_BG_DARK || 0x16283D;

const LP_SCENES = window.LP_SCENES;
const HERO_BG_LIGHT = window.HERO_BG_LIGHT;
const HERO_BG_DARK = window.HERO_BG_DARK;

// ---------- HERO GLOBE (Three.js) ----------
(function initHeroGlobe() {
  if (document.getElementById('worldMap')) return;

  let container = document.getElementById('hero-3d');
  if (!container) {
    const heroVisual = document.querySelector('#hero .hero-visual');
    if (heroVisual) {
      // Restore globe mount point for older hero markup that omitted #hero-3d.
      container = document.createElement('div');
      container.id = 'hero-3d';
      container.setAttribute('aria-label', 'Interactive globe showing priority markets');
      const coverageGrid = heroVisual.querySelector('.coverage-grid');
      if (coverageGrid) {
        heroVisual.insertBefore(container, coverageGrid);
      } else {
        heroVisual.appendChild(container);
      }
    }
  }
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

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(1, 2, 4);
  scene.add(dirLight);

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
  const kenyaLinkMeshes = [];
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

  const kenyaNode = nodeIndex.get('Kenya');
  if (kenyaNode) {
    markets
      .filter((market) => market.name !== 'Kenya')
      .forEach((market, i) => {
        const targetNode = nodeIndex.get(market.name);
        if (!targetNode) return;

        const start = kenyaNode.position.clone();
        const end = targetNode.position.clone();
        const mid = start
          .clone()
          .add(end)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(radius + 1.1 + (i % 4) * 0.08);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const curvePoints = curve.getPoints(72);
        const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const curveColor = regionColors[market.region] || 0xD4B06A;
        const curveLine = new THREE.Line(
          curveGeo,
          new THREE.LineBasicMaterial({
            color: curveColor,
            transparent: true,
            opacity: 0.34,
          })
        );

        curveLine.userData = {
          region: market.region,
          pulseOffset: i * 0.37,
        };
        group.add(curveLine);
        kenyaLinkMeshes.push(curveLine);
      });
  }

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

    kenyaLinkMeshes.forEach((line) => {
      const pulse = 0.1 + Math.sin(t * 2.2 + line.userData.pulseOffset) * 0.08;
      if (!activeRegion) {
        line.material.opacity = 0.34 + pulse;
        return;
      }

      const selected = line.userData.region === activeRegion || activeRegion === 'Africa';
      line.material.opacity = selected ? 0.5 + pulse : 0.08;
    });

    camera.position.z += (targetCameraZ - camera.position.z) * 0.09;

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

// ---------- NETWORK VISUAL (Three.js) ----------
(function initNetwork() {
  const container = document.getElementById('network-3d-container');
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  const isMobile = window.matchMedia('(max-width: 700px)').matches;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0E2A47); // Your navy blue

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, isMobile ? 14 : 11);
  const minZoomZ = isMobile ? 8.5 : 6.8;
  const maxZoomZ = isMobile ? 20 : 15;
  let targetCameraZ = camera.position.z;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.cursor = 'grab';
  container.appendChild(renderer.domElement);

  // Premium lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const main = new THREE.DirectionalLight(0xffffff, 1.2);
  main.position.set(2, 3, 5);
  scene.add(main);
  const fill = new THREE.DirectionalLight(0x4EA8FF, 0.6);
  fill.position.set(-3, -1, 4);
  scene.add(fill);

  // Your 7 pillars
  const sectors = [
    { label: 'Fintech', color: 0x6D8BFF, pos: [-2.8, 1.6, 0] },
    { label: 'Clean Energy', color: 0x38BDF8, pos: [2.8, 1.6, 0] },
    { label: 'Infrastructure', color: 0x22D3EE, pos: [-2.2, -1.8, 0.8] },
    { label: 'InsureTech', color: 0x60A5FA, pos: [2.2, -1.8, 0.8] },
    { label: 'Water & Sanitation', color: 0x7DD3FC, pos: [0.0, 2.8, -0.8] },
    { label: 'Banking', color: 0x4EA8FF, pos: [0.0, -2.8, -0.8] },
    { label: 'B2B Frameworks', color: 0x93C5FD, pos: [0.0, 0.0, -3.0] },
  ];

  const group = new THREE.Group();
  scene.add(group);
  let dragActive = false;
  let dragPointerId = null;
  let lastDragX = 0;
  let lastDragY = 0;
  let touchRotateActive = false;
  let rotateVelocityY = 0;
  let userTiltX = 0;

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w * 0.5, h * 0.5);
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  // Premium center node
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xB68D40,
      emissive: 0xB68D40,
      emissiveIntensity: 0.3,
      metalness: 0.3,
      roughness: 0.2,
    })
  );
  group.add(core);

  // Subtle glow ring
  const glowRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.03, 16, 60),
    new THREE.MeshBasicMaterial({
      color: 0xB68D40,
      transparent: true,
      opacity: 0.3,
    })
  );
  glowRing.rotation.x = Math.PI * 0.5;
  group.add(glowRing);

  // Create pillars and connections
  const pillarGroup = new THREE.Group();
  group.add(pillarGroup);

  sectors.forEach((s, i) => {
    // Pillar base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.55, 0.15, 16),
      new THREE.MeshPhysicalMaterial({
        color: s.color,
        emissive: s.color,
        emissiveIntensity: 0.2,
        metalness: 0.2,
        roughness: 0.3,
      })
    );
    base.position.set(s.pos[0], s.pos[1] - 0.4, s.pos[2]);
    pillarGroup.add(base);

    // Pillar top
    const top = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshPhysicalMaterial({
        color: s.color,
        emissive: s.color,
        emissiveIntensity: 0.4,
        metalness: 0.1,
        roughness: 0.2,
      })
    );
    top.position.set(s.pos[0], s.pos[1] + 0.4, s.pos[2]);
    pillarGroup.add(top);

    // Connecting rod (center to pillar)
    const from = new THREE.Vector3(0, 0, 0);
    const to = new THREE.Vector3(s.pos[0], s.pos[1], s.pos[2]);
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, len, 8),
      new THREE.MeshPhysicalMaterial({
        color: s.color,
        emissive: s.color,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.6,
      })
    );
    rod.position.copy(from).add(to).multiplyScalar(0.5);
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    pillarGroup.add(rod);

    // Label - high contrast and crisp text for readability
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontSize = isMobile ? 34 : 30;
    const lineHeight = Math.round(fontSize * 1.25);
    const paddingX = 22;
    const paddingY = 14;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const words = s.label.split(' ');
    const lines = [];
    let currentLine = '';

    ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", "Segoe UI", sans-serif`;
    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width > 280 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = candidate;
      }
    });
    if (currentLine) lines.push(currentLine);

    const textWidth = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
    const boxWidth = Math.ceil(textWidth + paddingX * 2);
    const boxHeight = Math.ceil(lines.length * lineHeight + paddingY * 2);

    canvas.width = Math.max(1, Math.ceil(boxWidth * dpr));
    canvas.height = Math.max(1, Math.ceil(boxHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, boxWidth, boxHeight);
    ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const gradient = ctx.createLinearGradient(0, 0, boxWidth, boxHeight);
    gradient.addColorStop(0, 'rgba(7, 25, 45, 0.94)');
    gradient.addColorStop(1, 'rgba(10, 35, 61, 0.92)');
    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(182, 141, 64, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;
    drawRoundedRect(ctx, 1, 1, boxWidth - 2, boxHeight - 2, 10);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.fillStyle = '#F9FCFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 5;
    const startY = boxHeight / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, lineIndex) => {
      ctx.fillText(line, boxWidth / 2, startY + lineIndex * lineHeight);
    });
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    );
    texture.needsUpdate = true;
    const labelScale = isMobile ? 1.35 : 1.5;
    sprite.scale.set((boxWidth / 300) * labelScale, (boxHeight / 300) * labelScale, 1);
    sprite.position.set(s.pos[0], s.pos[1] + 1.0, s.pos[2]);
    pillarGroup.add(sprite);
  });

  function applyZoom(delta) {
    targetCameraZ = THREE.MathUtils.clamp(targetCameraZ + delta, minZoomZ, maxZoomZ);
  }

  function onWheel(event) {
    event.preventDefault();
    applyZoom(event.deltaY * 0.012);
  }

  function onPointerDown(event) {
    if (event.pointerType === 'touch') return;
    dragActive = true;
    dragPointerId = event.pointerId;
    lastDragX = event.clientX;
    lastDragY = event.clientY;
    renderer.domElement.style.cursor = 'grabbing';
  }

  function onPointerMove(event) {
    if (!dragActive || dragPointerId !== event.pointerId) return;
    const dx = event.clientX - lastDragX;
    const dy = event.clientY - lastDragY;
    lastDragX = event.clientX;
    lastDragY = event.clientY;

    rotateVelocityY += dx * 0.00026;
    userTiltX = THREE.MathUtils.clamp(userTiltX - dy * 0.0018, -0.42, 0.42);
  }

  function onPointerUp(event) {
    if (dragPointerId !== event.pointerId) return;
    dragActive = false;
    dragPointerId = null;
    renderer.domElement.style.cursor = 'grab';
  }

  let pinchDistance = null;
  let lastTouchX = 0;
  let lastTouchY = 0;
  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function onTouchStart(event) {
    if (event.touches.length === 2) {
      touchRotateActive = false;
      pinchDistance = getTouchDistance(event.touches);
      return;
    }

    if (event.touches.length === 1) {
      pinchDistance = null;
      touchRotateActive = true;
      lastTouchX = event.touches[0].clientX;
      lastTouchY = event.touches[0].clientY;
    }
  }

  function onTouchMove(event) {
    if (event.touches.length === 2 && pinchDistance !== null) {
      event.preventDefault();
      const currentDistance = getTouchDistance(event.touches);
      const delta = (pinchDistance - currentDistance) * 0.02;
      applyZoom(delta);
      pinchDistance = currentDistance;
      return;
    }

    if (event.touches.length === 1 && touchRotateActive) {
      event.preventDefault();
      const touch = event.touches[0];
      const dx = touch.clientX - lastTouchX;
      const dy = touch.clientY - lastTouchY;
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;

      rotateVelocityY += dx * 0.00026;
      userTiltX = THREE.MathUtils.clamp(userTiltX - dy * 0.0018, -0.42, 0.42);
    }
  }

  function onTouchEnd(event) {
    if (event.touches.length < 2) pinchDistance = null;
    if (event.touches.length === 1) {
      touchRotateActive = true;
      lastTouchX = event.touches[0].clientX;
      lastTouchY = event.touches[0].clientY;
      return;
    }
    touchRotateActive = false;
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointerleave', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerUp);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
  renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
  renderer.domElement.addEventListener('touchend', onTouchEnd);
  renderer.domElement.addEventListener('touchcancel', onTouchEnd);

  // Animation
  function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    const autoSpin = 0.0012;
    const ambientTilt = Math.sin(t * 0.1) * 0.05;

    group.rotation.y += autoSpin + rotateVelocityY;
    group.rotation.x += (ambientTilt + userTiltX - group.rotation.x) * 0.14;
    rotateVelocityY *= 0.92;
    userTiltX *= 0.985;

    core.rotation.y += 0.01;
    glowRing.rotation.z += 0.005;
    glowRing.material.opacity = 0.25 + Math.sin(t * 0.8) * 0.1;

    camera.position.z += (targetCameraZ - camera.position.z) * 0.12;

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

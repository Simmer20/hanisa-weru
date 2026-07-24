function initWorldGlobe() {
  const mapEl = document.getElementById('worldMap');
  if (!mapEl || typeof Globe === 'undefined' || mapEl.dataset.globeReady === '1') return false;
  mapEl.dataset.globeReady = '1';
  mapEl.style.background = 'radial-gradient(circle at 30% 20%, rgba(18, 46, 82, 0.32), rgba(9, 20, 34, 0.98) 56%)';

  const isMobile = window.matchMedia('(max-width: 700px)').matches;

  const hubs = [
    { name: 'Nairobi, Kenya', region: 'Africa', lat: -1.2921, lng: 36.8219, color: '#C8A46A' },
    { name: 'Dubai, UAE', region: 'Middle East', lat: 25.2048, lng: 55.2708, color: '#E5C97C' },
    { name: 'London, UK', region: 'Europe', lat: 51.5074, lng: -0.1278, color: '#8FA9C7' },
    { name: 'New York, US', region: 'United States', lat: 40.7128, lng: -74.006, color: '#B9CBD8' }
  ];

  const nairobi = hubs[0];
  const routes = hubs.slice(1).map((hub) => ({
    startLat: nairobi.lat,
    startLng: nairobi.lng,
    endLat: hub.lat,
    endLng: hub.lng,
    color: [nairobi.color, hub.color]
  }));

  const globe = Globe()(mapEl)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .pointsData(hubs)
    .pointLat('lat')
    .pointLng('lng')
    .pointColor('color')
    .pointAltitude(0.013)
    .pointRadius(isMobile ? 0.3 : 0.24)
    .pointLabel(d => '<b>' + d.name + '</b><br/>' + d.region + ' Hub')
    .arcsData(routes)
    .arcStartLat('startLat')
    .arcStartLng('startLng')
    .arcEndLat('endLat')
    .arcEndLng('endLng')
    .arcColor('color')
    .arcAltitude(0.3)
    .arcStroke(isMobile ? 0.65 : 0.8)
    .arcDashLength(0.6)
    .arcDashGap(0.18)
    .arcDashInitialGap(() => Math.random())
    .arcDashAnimateTime(isMobile ? 2100 : 1700)
    .arcsTransitionDuration(0)
    .atmosphereColor('#5E93C3')
    .atmosphereAltitude(0.16)
    .showAtmosphere(true);

  const globeMaterial = globe.globeMaterial();
  if (globeMaterial) {
    globeMaterial.color.set('#C8DDF0');
    globeMaterial.emissive.set('#214F7A');
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 18;
    globeMaterial.depthWrite = true;
    globeMaterial.transparent = false;
    globeMaterial.opacity = 1;
  }

  globe.width(mapEl.clientWidth);
  globe.height(mapEl.clientHeight);
  globe.pointOfView({ lat: 12, lng: 12, altitude: isMobile ? 2.3 : 2.08 });

  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = isMobile ? 0.28 : 0.38;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.rotateSpeed = isMobile ? 0.75 : 0.9;
  controls.minDistance = isMobile ? 175 : 145;
  controls.maxDistance = isMobile ? 420 : 360;
  controls.minPolarAngle = Math.PI / 3.3;
  controls.maxPolarAngle = Math.PI - Math.PI / 3.3;

  mapEl.addEventListener('pointerdown', () => {
    controls.autoRotate = false;
  }, { once: true });

  window.addEventListener('resize', () => {
    globe.width(mapEl.clientWidth);
    globe.height(mapEl.clientHeight);
  });

  return true;
}

function bootWorldGlobe() {
  if (initWorldGlobe()) return;

  const shell = document.getElementById('site-shell');
  if (!shell) return;

  const observer = new MutationObserver(() => {
    if (initWorldGlobe()) observer.disconnect();
  });

  observer.observe(shell, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootWorldGlobe);
} else {
  bootWorldGlobe();
}

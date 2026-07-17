function initWorldGlobe() {
  const mapEl = document.getElementById('worldMap');
  if (!mapEl || typeof Globe === 'undefined' || mapEl.dataset.globeReady === '1') return false;
  mapEl.dataset.globeReady = '1';

  const isMobile = window.matchMedia('(max-width: 700px)').matches;

  const hubs = [
    { name: 'Nairobi, Kenya', region: 'Africa', lat: -1.2921, lng: 36.8219, color: '#C8A46A' },
    { name: 'Dubai, UAE', region: 'Middle East', lat: 25.2048, lng: 55.2708, color: '#E5C97C' },
    { name: 'London, UK', region: 'Europe', lat: 51.5074, lng: -0.1278, color: '#8FA9C7' },
    { name: 'New York, US', region: 'United States', lat: 40.7128, lng: -74.006, color: '#B9CBD8' }
  ];

  const nairobi = hubs[0];
  const routes = hubs.slice(1).map(hub => ({
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
    .pointRadius(isMobile ? 0.28 : 0.22)
    .pointLabel(d => '<b>' + d.name + '</b><br/>' + d.region + ' Hub')
    .arcsData(routes)
    .arcStartLat('startLat')
    .arcStartLng('startLng')
    .arcEndLat('endLat')
    .arcEndLng('endLng')
    .arcColor('color')
    .arcDashLength(isMobile ? 0.38 : 0.45)
    .arcDashGap(isMobile ? 0.28 : 0.35)
    .arcDashAnimateTime(isMobile ? 2800 : 2400)
    .atmosphereColor('#9CC7EE')
    .atmosphereAltitude(0.22)
    .showAtmosphere(true);

  const globeMaterial = globe.globeMaterial();
  if (globeMaterial && typeof THREE !== 'undefined') {
    globeMaterial.color = new THREE.Color('#C8E0F4');
    globeMaterial.emissive = new THREE.Color('#2F6EA0');
    globeMaterial.emissiveIntensity = 0.2;
    globeMaterial.shininess = 0.6;
  }

  globe.width(mapEl.clientWidth);
  globe.height(mapEl.clientHeight);
  globe.pointOfView({ lat: 9, lng: 16, altitude: isMobile ? 2.35 : 2.15 });

  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = isMobile ? 0.32 : 0.45;
  controls.enablePan = false;
  controls.minDistance = isMobile ? 175 : 145;
  controls.maxDistance = isMobile ? 420 : 360;

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

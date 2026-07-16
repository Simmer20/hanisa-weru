(function initPageLoader() {
  const loader = document.getElementById('page-loader');
  const fill = document.getElementById('loader-progress-fill');
  const percentText = document.getElementById('loader-percent');
  if (!loader || !fill || !percentText) return;

  let progress = 0;
  let completed = false;
  const startTime = performance.now();
  const minVisibleMs = 1600;

  function render(value) {
    const safeValue = Math.max(0, Math.min(100, Math.round(value)));
    fill.style.width = `${safeValue}%`;
    percentText.textContent = `${safeValue}%`;
  }

  function tick() {
    if (completed) return;
    const elapsed = performance.now() - startTime;
    const target = Math.min(99, 20 + elapsed * 0.11);
    progress += (target - progress) * 0.09;
    render(progress);
    requestAnimationFrame(tick);
  }

  function finish() {
    if (completed) return;
    completed = true;
    render(100);

    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      window.setTimeout(() => {
        loader.setAttribute('aria-hidden', 'true');
      }, 760);
    }, 260);
  }

  requestAnimationFrame(tick);

  window.addEventListener('load', () => {
    const elapsed = performance.now() - startTime;
    const waitMore = Math.max(0, minVisibleMs - elapsed);
    window.setTimeout(finish, waitMore);
  });
})();

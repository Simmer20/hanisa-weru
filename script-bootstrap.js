(function bootstrapSite() {
  const shell = document.getElementById('site-shell');
  if (!shell) return;

  const partialPath = shell.dataset.partial;
  if (!partialPath) return;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.async = false;
      el.onload = resolve;
      el.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.body.appendChild(el);
    });
  }

  async function init() {
    try {
      const res = await fetch(partialPath);
      if (!res.ok) {
        throw new Error(`Failed to load partial: ${partialPath}`);
      }

      shell.innerHTML = await res.text();

      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
      await loadScript('script-scenes.js');
      await loadScript('script-interactions.js');
      await loadScript('script-animations.js');
    } catch (error) {
      console.error(error);
      shell.innerHTML = '<section><div class="container"><p>Failed to load site content. Please run this site via a local server.</p></div></section>';
      document.body.classList.remove('is-loading');
      const loader = document.getElementById('page-loader');
      if (loader) loader.classList.add('is-hidden');
    }
  }

  init();
})();

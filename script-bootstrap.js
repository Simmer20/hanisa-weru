(function bootstrapSite() {
  const shell = document.getElementById('site-shell');

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
      const hasInlineContent = shell
        ? shell.children.length > 0 || shell.textContent.trim().length > 0
        : document.body.children.length > 0;

      if (!hasInlineContent) {
        throw new Error('No inlined site shell content found in index.html.');
      }

      await loadScript('https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/globe.gl@2.32.0/dist/globe.gl.min.js');
      await loadScript('js/map.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
      await loadScript('script-scenes.js');
      await loadScript('script-interactions.js');
      await loadScript('script-animations.js');
    } catch (error) {
      console.error(error);
      if (shell) {
        shell.innerHTML = '<section><div class="container"><p>Failed to load site content. Please run this site via a local server.</p></div></section>';
      }
      document.body.classList.remove('is-loading');
      const loader = document.getElementById('page-loader');
      if (loader) loader.classList.add('is-hidden');
    }
  }

  init();
})();

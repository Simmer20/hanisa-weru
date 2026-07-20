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

  async function loadScriptWithFallback(sources) {
    let lastError = null;

    for (const src of sources) {
      try {
        await loadScript(src);
        return true;
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) {
      console.warn(lastError);
    }

    return false;
  }

  async function init() {
    try {
      const hasInlineContent = shell
        ? shell.children.length > 0 || shell.textContent.trim().length > 0
        : document.body.children.length > 0;

      if (!hasInlineContent) {
        throw new Error('No inlined site shell content found in index.html.');
      }

      await loadScript('script-interactions.js');

      const threeLoaded = await loadScriptWithFallback([
        'js/vendor/three-152.min.js',
        'js/vendor/three.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r152/three.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
      ]);

      const globeLoaded = await loadScriptWithFallback([
        'js/vendor/globe.gl.min.js',
        'https://unpkg.com/globe.gl@2.32.0/dist/globe.gl.min.js',
        'https://cdn.jsdelivr.net/npm/globe.gl@2.32.0/dist/globe.gl.min.js',
      ]);

      if (threeLoaded && globeLoaded) {
        await loadScript('js/map.js');
        await loadScript('script-scenes.js');
      }

      const gsapLoaded = await loadScriptWithFallback([
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
        'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
      ]);

      const scrollTriggerLoaded = gsapLoaded
        ? await loadScriptWithFallback([
            'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
            'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js',
          ])
        : false;

      if (gsapLoaded && scrollTriggerLoaded) {
        await loadScript('script-animations.js');
      }
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

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

(function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!navToggle || !navLinks) return;

  const navAnchors = Array.from(navLinks.querySelectorAll('a'));

  function closeMenu() {
    document.body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navAnchors.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('nav-open')) return;
    if (event.target instanceof Element && (navLinks.contains(event.target) || navToggle.contains(event.target))) return;
    closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      closeMenu();
    }
  });
})();

(function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  const icon = toggleBtn.querySelector('i');
  const storageKey = 'lp-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function getSystemTheme() {
    return media.matches ? 'dark' : 'light';
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return saved;
    return getSystemTheme();
  }

  let currentTheme = getInitialTheme();

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    if (window.LP_SCENES?.hero) {
      const bgColor = theme === 'dark' ? window.HERO_BG_DARK : window.HERO_BG_LIGHT;
      window.LP_SCENES.hero.background = new THREE.Color(bgColor);
    }
  }

  toggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem(storageKey, currentTheme);
    applyTheme(currentTheme);
  });

  media.addEventListener('change', () => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return;

    currentTheme = getSystemTheme();
    applyTheme(currentTheme);
  });

  applyTheme(currentTheme);
})();

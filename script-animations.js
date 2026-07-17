gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('#worldMap, #network-3d-container, #cta-3d-container').forEach((el) => {
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

// Efeito de animacao ao rolar a pagina.
(function initScrollReveal() {
  document.documentElement.classList.add('js');

  const revealElements = Array.from(document.querySelectorAll('.reveal'));
  if (!revealElements.length) return;

  function revealByScroll() {
    const viewportHeight = window.innerHeight;
    revealElements.forEach(function (element) {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top <= viewportHeight * 0.85 && rect.bottom >= 0;
      if (isVisible) {
        element.classList.add('active');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });

    // Ativa o que ja estiver visivel no primeiro frame.
    revealByScroll();
    return;
  }

  revealByScroll();
  window.addEventListener('scroll', revealByScroll, { passive: true });
  window.addEventListener('resize', revealByScroll);
})();

(function initGsapAnimations() {
  const gsapRef = window.gsap;
  if (!gsapRef) return;

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
  if (hasScrollTrigger) {
    gsapRef.registerPlugin(window.ScrollTrigger);
  }

  function setupScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar || !hasScrollTrigger) return;

    const setScaleX = gsapRef.quickSetter(progressBar, 'scaleX');
    window.ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        setScaleX(self.progress);
      },
    });
  }

  function animateTopbar() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;

    const brand = topbar.querySelector('.brand');
    const navLinks = gsapRef.utils.toArray('.nav a');
    const navIndicator = topbar.querySelector('.nav-indicator');

    if (navLinks.length) {
      gsapRef.from(navLinks, {
        y: -8,
        autoAlpha: 0,
        duration: 0.42,
        stagger: 0.045,
        ease: 'power2.out',
        delay: 0.1,
        clearProps: 'opacity,visibility,transform',
      });
    }

    if (navIndicator) {
      gsapRef.from(navIndicator, {
        autoAlpha: 0,
        scaleX: 0.3,
        transformOrigin: 'left center',
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.2,
        clearProps: 'opacity,visibility,transform',
      });
    }

    if (!hasScrollTrigger) return;

    window.ScrollTrigger.create({
      start: 56,
      onEnter: function () {
        gsapRef.to(topbar, {
          paddingTop: '0.68rem',
          paddingBottom: '0.68rem',
          borderColor: 'rgba(93, 240, 255, 0.3)',
          boxShadow: '0 16px 36px rgba(1, 8, 23, 0.56)',
          duration: 0.34,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        if (brand) {
          gsapRef.to(brand, {
            scale: 0.97,
            transformOrigin: 'left center',
            duration: 0.34,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      },
      onLeaveBack: function () {
        gsapRef.to(topbar, {
          paddingTop: '0.86rem',
          paddingBottom: '0.86rem',
          borderColor: 'rgba(93, 240, 255, 0.16)',
          boxShadow: '0 10px 28px rgba(1, 8, 23, 0.45)',
          duration: 0.34,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        if (brand) {
          gsapRef.to(brand, {
            scale: 1,
            duration: 0.34,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      },
    });
  }

  function animateIntro() {
    const topbar = document.querySelector('.topbar');
    const hero = document.querySelector('.hero');
    const thanksCard = document.querySelector('.thanks-card');
    const intro = gsapRef.timeline({ defaults: { ease: 'power3.out' } });

    if (topbar) {
      intro.from(topbar, { y: -24, autoAlpha: 0, duration: 0.65 });
    }

    if (hero) {
      const heroItems = [
        '.hero__content .eyebrow',
        '.hero__signal',
        '.hero__content h1 .hero-line',
        '.hero__content > p:not(.hero__signal)',
        '.hero__actions a',
        '.hero__stats article',
        '.hero__badge',
      ];

      gsapRef.set(heroItems, { autoAlpha: 0, y: 22 });
      intro
        .from(
          '.hero__fx',
          {
            autoAlpha: 0,
            duration: 0.65,
          },
          0.1
        )
        .from(
          '.hero__rings',
          {
            autoAlpha: 0,
            scale: 0.86,
            duration: 0.95,
          },
          0.18
        )
        .to(heroItems, {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.09,
          clearProps: 'opacity,visibility,transform',
        });
      intro.to(
        '.hero__badge',
        {
          boxShadow: '0 24px 48px rgba(3, 8, 23, 0.42)',
          duration: 0.65,
          ease: 'power2.out',
        },
        '-=0.28'
      );
      intro.to(
        '.hero__signal span',
        {
          boxShadow: '0 0 22px rgba(93, 240, 255, 1)',
          duration: 0.42,
          yoyo: true,
          repeat: 1,
        },
        '-=0.48'
      );
      return;
    }

    if (thanksCard) {
      const thanksItems = gsapRef.utils.toArray('.thanks-card > *');
      if (!thanksItems.length) return;
      gsapRef.set(thanksItems, { autoAlpha: 0, y: 18 });
      intro.to(thanksItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.07,
        clearProps: 'opacity,visibility,transform',
      });
    }
  }

  function animateSectionHeadings() {
    const headings = gsapRef.utils.toArray('.section-heading');
    if (!headings.length) return;

    headings.forEach(function (heading) {
      const targets = heading.querySelectorAll('.eyebrow, h2, p');
      if (!targets.length) return;

      if (hasScrollTrigger) {
        gsapRef.set(heading, { '--heading-line-scale': 0.2 });
        gsapRef.from(targets, {
          y: 20,
          autoAlpha: 0,
          duration: 0.64,
          stagger: 0.07,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
          scrollTrigger: {
            trigger: heading,
            start: 'top 84%',
            once: true,
          },
        });

        gsapRef.to(heading, {
          '--heading-line-scale': 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 86%',
            once: true,
          },
        });
        return;
      }

      gsapRef.from(targets, {
        y: 18,
        autoAlpha: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: 'power2.out',
      });
    });
  }

  function animateCardBatches() {
    const cardSelector =
      '.service-card, .portfolio-card, .skills-grid article, .contact-grid > *, .thanks-highlights article';
    const cards = gsapRef.utils.toArray(cardSelector);
    if (!cards.length) return;

    if (hasScrollTrigger) {
      window.ScrollTrigger.batch(cards, {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsapRef.from(batch, {
            y: 28,
            autoAlpha: 0,
            duration: 0.75,
            ease: 'power3.out',
            stagger: 0.1,
            clearProps: 'opacity,visibility,transform',
          });
        },
      });
      return;
    }

    gsapRef.from(cards, {
      y: 24,
      autoAlpha: 0,
      duration: 0.65,
      stagger: 0.08,
      ease: 'power2.out',
    });
  }

  function animateParallax() {
    if (!hasScrollTrigger) return;

    const heroContent = document.querySelector('.hero__content');
    const heroBadge = document.querySelector('.hero__badge');
    const heroRings = document.querySelector('.hero__rings');

    if (heroContent) {
      gsapRef.to(heroContent, {
        yPercent: -5,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    if (heroBadge) {
      gsapRef.to(heroBadge, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    if (heroRings) {
      gsapRef.to(heroRings, {
        yPercent: -16,
        rotation: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    gsapRef.utils.toArray('.portfolio-card__media').forEach(function (media) {
      gsapRef.fromTo(
        media,
        { backgroundPosition: '50% 42%' },
        {
          backgroundPosition: '50% 58%',
          ease: 'none',
          scrollTrigger: {
            trigger: media,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });
  }

  function animateHeroAtmosphere() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;

    gsapRef.to('.hero-glow--one', {
      xPercent: -7,
      yPercent: 8,
      scale: 1.08,
      duration: 7.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    gsapRef.to('.hero-glow--two', {
      xPercent: 8,
      yPercent: -8,
      scale: 1.09,
      duration: 8.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    if (isMobile) return;

    gsapRef.to('.hero-grain', {
      backgroundPosition: '160px 120px',
      duration: 12,
      ease: 'none',
      repeat: -1,
    });

    gsapRef.to('.ring--outer', {
      rotation: 360,
      transformOrigin: '50% 50%',
      duration: 36,
      ease: 'none',
      repeat: -1,
    });

    gsapRef.to('.ring--middle', {
      rotation: -360,
      transformOrigin: '50% 50%',
      duration: 28,
      ease: 'none',
      repeat: -1,
    });

    gsapRef.to('.ring--inner', {
      rotation: 360,
      transformOrigin: '50% 50%',
      duration: 22,
      ease: 'none',
      repeat: -1,
    });

    gsapRef.to('.orbit--one', {
      rotation: 360,
      transformOrigin: '50% 50%',
      duration: 14,
      ease: 'none',
      repeat: -1,
    });

    gsapRef.to('.orbit--two', {
      rotation: -360,
      transformOrigin: '50% 50%',
      duration: 9,
      ease: 'none',
      repeat: -1,
    });
  }

  function setupMagneticButtons() {
    const canUsePointer =
      window.matchMedia &&
      window.matchMedia('(pointer: fine)').matches &&
      window.matchMedia('(min-width: 900px)').matches;
    if (!canUsePointer) return;

    const buttons = gsapRef.utils.toArray('.hero__actions a, .thanks-actions a, .btn-outline');
    if (!buttons.length) return;

    buttons.forEach(function (button) {
      const moveX = gsapRef.quickTo(button, 'x', { duration: 0.28, ease: 'power3.out' });
      const moveY = gsapRef.quickTo(button, 'y', { duration: 0.28, ease: 'power3.out' });

      button.addEventListener('pointermove', function (event) {
        const rect = button.getBoundingClientRect();
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        moveX(relX * 0.18);
        moveY(relY * 0.2);
      });

      button.addEventListener('pointerleave', function () {
        moveX(0);
        moveY(0);
      });
    });
  }

  function initResponsiveTweaks() {
    if (!hasScrollTrigger || !gsapRef.matchMedia) return;

    const media = gsapRef.matchMedia();
    media.add('(max-width: 899px)', function () {
      const heroBadge = document.querySelector('.hero__badge');
      if (!heroBadge) return;

      gsapRef.from(heroBadge, {
        y: 14,
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform',
      });
    });
  }

  setupScrollProgress();
  animateTopbar();
  animateIntro();
  animateSectionHeadings();
  animateCardBatches();
  animateParallax();
  animateHeroAtmosphere();
  setupMagneticButtons();
  initResponsiveTweaks();
})();

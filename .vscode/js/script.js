document.documentElement.classList.add('js');

function initSite() {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('menu-toggle');
  const icon = navToggle ? navToggle.querySelector('i') : null;
  const gsapRef = window.gsap || null;
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const observedSections = [];
  let lastActiveLink = null;
  let navIndicator = null;

  function moveNavIndicator(targetLink, instant) {
    if (!nav || !navIndicator || !targetLink) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = targetLink.getBoundingClientRect();
    if (!navRect.width || !linkRect.width) return;

    const x = linkRect.left - navRect.left;
    const width = linkRect.width;

    if (gsapRef && !instant) {
      gsapRef.to(navIndicator, {
        x: x,
        width: width,
        duration: 0.34,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      return;
    }

    navIndicator.style.transform = 'translateX(' + x + 'px)';
    navIndicator.style.width = width + 'px';
  }

  if (nav && navLinks.length) {
    navIndicator = nav.querySelector('.nav-indicator');
    if (!navIndicator) {
      navIndicator = document.createElement('span');
      navIndicator.className = 'nav-indicator';
      navIndicator.setAttribute('aria-hidden', 'true');
      nav.appendChild(navIndicator);
    }
  }

  function setNavState(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    if (icon) {
      icon.classList.toggle('bx-x', open);
      icon.classList.toggle('bx-menu', !open);
    }
    if (open && lastActiveLink) {
      window.requestAnimationFrame(function () {
        moveNavIndicator(lastActiveLink, true);
      });
    }
  }

  if (navToggle) {
    setNavState(false);
    navToggle.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setNavState(!nav.classList.contains('active'));
    });
  }

  // Fallback para ambientes mobile onde o click no botao pode falhar.
  document.addEventListener('click', function (event) {
    if (!nav || !navToggle) return;
    const toggleClicked = event.target.closest && event.target.closest('#menu-toggle');
    if (!toggleClicked) return;
    event.preventDefault();
    setNavState(!nav.classList.contains('active'));
  });

  document.querySelectorAll('.nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      setNavState(false);
    });
  });

  function setCurrentLink(sectionId, options) {
    let activeLink = null;
    navLinks.forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const isCurrent = href === '#' + sectionId;
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) {
        activeLink = link;
      }
    });

    if (!activeLink && navLinks.length) {
      activeLink = navLinks[0];
      activeLink.classList.add('is-current');
    }

    if (!activeLink) return;
    lastActiveLink = activeLink;
    moveNavIndicator(activeLink, options && options.instant);
  }

  navLinks.forEach(function (link) {
    const targetSelector = link.getAttribute('href');
    if (!targetSelector || targetSelector === '#') return;
    const section = document.querySelector(targetSelector);
    if (!section) return;
    observedSections.push(section);
  });

  if (navLinks.length) {
    navLinks.forEach(function (link) {
      link.addEventListener('pointerenter', function () {
        moveNavIndicator(link, false);
      });
      link.addEventListener('pointerleave', function () {
        if (lastActiveLink) {
          moveNavIndicator(lastActiveLink, false);
        }
      });
    });

    window.addEventListener('resize', function () {
      if (lastActiveLink) {
        moveNavIndicator(lastActiveLink, true);
      }
    });
  }

  if (observedSections.length) {
    setCurrentLink(observedSections[0].id, { instant: true });
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            setCurrentLink(entry.target.id);
          });
        },
        {
          threshold: 0.35,
          rootMargin: '-20% 0px -45% 0px',
        }
      );

      observedSections.forEach(function (section) {
        sectionObserver.observe(section);
      });
    }
  } else if (navLinks.length) {
    const firstSectionId = (navLinks[0].getAttribute('href') || '#').replace('#', '');
    if (firstSectionId) {
      setCurrentLink(firstSectionId, { instant: true });
    }
  }

  document.querySelectorAll('[data-toggle]').forEach(function (button) {
    const targetId = button.dataset.toggle;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', function () {
      const isOpen = target.classList.toggle('is-visible');
      button.textContent = isOpen ? 'Ler menos' : 'Leia mais';
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });

  document.addEventListener('click', function (event) {
    if (!nav || !navToggle) return;
    if (
      !nav.contains(event.target) &&
      !navToggle.contains(event.target) &&
      nav.classList.contains('active')
    ) {
      setNavState(false);
    }
  });

  const form = document.querySelector('.contact-form');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;

  function renderFormFeedback(type, message) {
    if (!form) return;
    let feedback = form.querySelector('.form-feedback');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'form-feedback';
      feedback.setAttribute('role', 'alert');
      form.prepend(feedback);
    }
    feedback.className = 'form-feedback form-feedback--' + type;
    feedback.textContent = message;
  }

  const query = new URLSearchParams(window.location.search);
  if (query.get('status') === 'erro') {
    if (form) {
      renderFormFeedback(
        'error',
        'Nao foi possivel enviar agora. Tente novamente em instantes ou use o e-mail direto.'
      );
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (form && window.fetch) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.label = submitButton.textContent || 'Enviar mensagem';
        submitButton.textContent = 'Enviando...';
      }

      try {
        const formPayload = new URLSearchParams(new FormData(form));
        const response = await fetch(form.action, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: formPayload.toString(),
        });

        if (response.redirected && response.url) {
          window.location.href = response.url;
          return;
        }

        if (response.ok) {
          window.location.href = 'obrigado.html';
          return;
        }

        if (response.status === 404 && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          renderFormFeedback(
            'error',
            'Backend de e-mail nao esta ativo localmente. Use Netlify deploy ou netlify dev.'
          );
          return;
        }

        let message = 'Nao foi possivel enviar agora. Tente novamente em instantes ou use o e-mail direto.';
        try {
          const data = await response.json();
          if (data && data.message) {
            message = data.message;
          }
        } catch (_error) {
          // ignore parse errors and keep default message
        }

        renderFormFeedback('error', message);
      } catch (_error) {
        renderFormFeedback(
          'error',
          'Nao foi possivel conectar ao servico de envio. Verifique a rede e tente novamente.'
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.dataset.label || 'Enviar mensagem';
        }
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}

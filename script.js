/* ============================================================
   MARIA BEAUTY SALON — JAVASCRIPT
   Interactions: Loader | Nav | Particles | Slider | Animations
   ============================================================ */

'use strict';

// ─── UTILITY ───────────────────────────────────────────────

const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── LOADER ────────────────────────────────────────────────

function initLoader() {
  const loader = qs('#loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loaded');
      document.body.style.overflow = '';
      initAnimations();
    }, 1800);
  });

  // Prevent scroll during load
  document.body.style.overflow = 'hidden';
}

// ─── SCROLL PROGRESS ───────────────────────────────────────

function initScrollProgress() {
  const bar = qs('#scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const pct          = docHeight ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = pct + '%';
  }, { passive: true });
}

// ─── NAVBAR ────────────────────────────────────────────────

function initNavbar() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  function updateNav() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Active link on scroll
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link');

  function updateActiveLink() {
    let currentId = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentId);
    });
  }

  window.addEventListener('scroll', debounce(updateActiveLink, 80), { passive: true });
}

// ─── HAMBURGER / MOBILE MENU ───────────────────────────────

function initMobileMenu() {
  const hamburger  = qs('#hamburger');
  const mobileMenu = qs('#mobileMenu');
  const overlay    = createOverlay();

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  function toggleMenu() {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  }

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  document.closeMobileMenu = closeMenu;

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function createOverlay() {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      z-index: 998; opacity: 0; pointer-events: none;
      transition: opacity 0.4s ease; backdrop-filter: blur(4px);
    `;
    el.addEventListener('transitionend', () => {
      if (!el.classList.contains('active')) el.style.pointerEvents = 'none';
    });
    document.body.appendChild(el);

    // Active class toggler
    const origAdd = el.classList.add.bind(el.classList);
    const origRem = el.classList.remove.bind(el.classList);

    el.classList.add = (cls) => {
      origAdd(cls);
      if (cls === 'active') { el.style.opacity = '1'; el.style.pointerEvents = 'all'; }
    };
    el.classList.remove = (cls) => {
      origRem(cls);
      if (cls === 'active') { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
    };

    return el;
  }
}

// Global close function for inline onclick
function closeMobileMenu() {
  document.closeMobileMenu && document.closeMobileMenu();
}

// ─── PARTICLES ─────────────────────────────────────────────

function initParticles() {
  const container = qs('#particles');
  if (!container) return;

  const count = window.innerWidth < 640 ? 15 : 28;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size     = Math.random() * 6 + 2;
    const left     = Math.random() * 100;
    const duration = Math.random() * 8 + 6;
    const delay    = Math.random() * 8;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: -20px;
      --duration: ${duration}s;
      --delay: ${delay}s;
    `;

    container.appendChild(p);
  }
}

// ─── COUNTER ANIMATION ─────────────────────────────────────

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ─── SCROLL REVEAL + INTERSECTION OBSERVER ─────────────────

function initAnimations() {
  const revealEls    = qsa('.reveal-up, .reveal-left, .reveal-right');
  const counterEls   = qsa('.stat-number');
  let   countersRan  = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Stagger siblings
        const siblings = qsa('.reveal-up.visible', entry.target.parentElement);
        siblings.forEach((el, i) => {
          el.style.transitionDelay = `${i * 60}ms`;
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // Counters observer
  const heroSection  = qs('#home');
  const heroObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !countersRan) {
      countersRan = true;
      counterEls.forEach((el, i) => setTimeout(() => animateCounter(el), i * 200));
      heroObserver.disconnect();
    }
  }, { threshold: 0.5 });

  if (heroSection) heroObserver.observe(heroSection);
}

// ─── GALLERY FILTER ────────────────────────────────────────

function initGallery() {
  const filterBtns  = qsa('.filter-btn');
  const galleryItems = qsa('.gallery-item');
  const galleryCols  = qsa('.gallery-col');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show / hide individual items
      galleryItems.forEach(item => {
        const cat  = item.dataset.category;
        const show = filter === 'all' || cat === filter;
        item.setAttribute('data-visible', show ? 'true' : 'false');
      });

      // Hide columns that have NO visible items (avoids empty column gaps)
      galleryCols.forEach(col => {
        const hasVisible = [...col.querySelectorAll('.gallery-item')]
          .some(item => item.getAttribute('data-visible') !== 'false');
        col.style.display = hasVisible ? '' : 'none';
      });
    });
  });
}

// ─── LIGHTBOX ──────────────────────────────────────────────

function openLightbox(btn) {
  const lightbox = qs('#lightbox');
  const img      = qs('#lightboxImg');
  const srcImg   = btn.closest('.gallery-img-wrap').querySelector('img');

  if (!lightbox || !img || !srcImg) return;

  img.src = srcImg.src;
  img.alt = srcImg.alt;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightbox.focus?.();
}

function initLightbox() {
  const lightbox = qs('#lightbox');
  const closeBtn = qs('#lightboxClose');

  if (!lightbox) return;

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
}

// ─── TESTIMONIALS SLIDER ───────────────────────────────────

function initSlider() {
  const track   = qs('#testimonialsTrack');
  const prevBtn = qs('#sliderPrev');
  const nextBtn = qs('#sliderNext');
  const dotsContainer = qs('#sliderDots');

  if (!track) return;

  const cards    = qsa('.testimonial-card', track);
  let   current  = 0;
  let   autoPlay = null;
  let   perView  = getPerView();

  // Build dots
  const totalSlides = Math.ceil(cards.length / perView);
  let dots = [];

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer?.appendChild(dot);
    dots.push(dot);
  }

  function getPerView() {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, totalSlides - 1));

    const cardWidth = cards[0].offsetWidth + 24; // gap
    track.style.transform = `translateX(-${current * cardWidth * perView}px)`;

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  function next() { goTo(current >= totalSlides - 1 ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? totalSlides - 1 : current - 1); }

  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);

  // Touch/Swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });

  // Autoplay
  function startAutoPlay() {
    autoPlay = setInterval(next, 5000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlay);
  }

  startAutoPlay();
  track.closest('.testimonials-slider')?.addEventListener('mouseenter', stopAutoPlay);
  track.closest('.testimonials-slider')?.addEventListener('mouseleave', startAutoPlay);

  // Recalc on resize
  window.addEventListener('resize', debounce(() => {
    perView = getPerView();
    goTo(0);
  }, 200));
}

// ─── APPOINTMENT FORM ──────────────────────────────────────

function initForm() {
  const form       = qs('#appointmentForm');
  const successMsg = qs('#formSuccess');
  const dateInput  = qs('#preferredDate');

  if (!form) return;

  // Set min date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = qs('#formSubmitBtn');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    // Simulate submission
    setTimeout(() => {
      form.hidden = true;
      successMsg.hidden = false;

      // Scroll to success message
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1200);
  });
}

// ─── WHATSAPP INQUIRY FROM FORM ────────────────────────────

function sendWhatsAppInquiry() {
  const name    = qs('#clientName')?.value.trim();
  const phone   = qs('#clientPhone')?.value.trim();
  const service = qs('#serviceSelect')?.value;
  const date    = qs('#preferredDate')?.value;
  const message = qs('#clientMessage')?.value.trim();

  const parts = ['Hello Maria Beauty Salon! I would like to book an appointment.'];
  if (name)    parts.push(`Name: ${name}`);
  if (phone)   parts.push(`Phone: ${phone}`);
  if (service) parts.push(`Service: ${service}`);
  if (date)    parts.push(`Preferred Date: ${date}`);
  if (message) parts.push(`Message: ${message}`);

  const text = encodeURIComponent(parts.join('\n'));
  window.open(`https://wa.me/923214129928?text=${text}`, '_blank', 'noopener,noreferrer');
}

// ─── BACK TO TOP ───────────────────────────────────────────

function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── PARALLAX (subtle) ─────────────────────────────────────

function initParallax() {
  const heroBg = qs('.hero-img');
  if (!heroBg || window.innerWidth < 768) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.2}px)`;
    }
  }, { passive: true });
}

// ─── SMOOTH ANCHOR SCROLL ──────────────────────────────────

function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = qs(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ─── HOVER SHIMMER ON SERVICE CARDS ────────────────────────

function initCardShimmer() {
  qsa('.service-card, .why-card, .feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });
}

// ─── INIT ALL ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initParticles();
  initGallery();
  initLightbox();
  initSlider();
  initForm();
  initBackToTop();
  initParallax();
  initSmoothScroll();
  initCardShimmer();
});

// Expose globals needed for inline handlers
window.openLightbox       = openLightbox;
window.closeMobileMenu    = closeMobileMenu;
window.sendWhatsAppInquiry = sendWhatsAppInquiry;

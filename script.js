/**
 * script.js – Mangalam HDPE Pipes Product Page
 * Interactive features:
 *  1. Sticky product bar (scroll-triggered)
 *  2. Navbar offset when sticky bar is visible
 *  3. Image carousel (prev/next + thumbnails)
 *  4. Image zoom on hover (lens + result panel)
 *  5. FAQ accordion
 *  6. Applications slider (prev/next scroll)
 *  7. Manufacturing process tabs
 *  8. Modal open / close
 *  9. Hamburger mobile menu
 * 10. Catalogue email field enables Download Brochure button
 */

'use strict';

/* =============================================================
   HELPERS
============================================================= */
/** Shorthand querySelector */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
/** Shorthand querySelectorAll */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =============================================================
   1. STICKY PRODUCT BAR
   Shows when user scrolls past the hero section first fold.
   Hides when scrolling back up.
============================================================= */
(function initStickyBar() {
  const stickyBar = $('#stickyBar');
  const navbar    = $('#navbar');
  const heroSection = $('#heroSection');
  if (!stickyBar || !heroSection) return;

  let lastScrollY = window.scrollY;

  function onScroll() {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    const scrollingDown = window.scrollY > lastScrollY;
    lastScrollY = window.scrollY;

    // Show sticky bar after scrolling past hero
    if (heroBottom < 0) {
      stickyBar.classList.add('is-visible');
      stickyBar.setAttribute('aria-hidden', 'false');
      // Push navbar below sticky bar
      navbar.classList.add('sticky-offset');
    } else {
      stickyBar.classList.remove('is-visible');
      stickyBar.setAttribute('aria-hidden', 'true');
      navbar.classList.remove('sticky-offset');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
})();

/* =============================================================
   2. IMAGE CAROUSEL
   Handles main image switching via prev/next buttons and
   thumbnail clicks.
============================================================= */
const carouselImages = [
  './assets/Fishnet.jpg',
  './assets/91928c6beda9d501d1c26ae0cac9daf21cf34169.jpg',
  './assets/c86f8dae3967ca8220a06b7745aa763ed9a1437a.jpg',
  './assets/Fishnet.jpg',
  './assets/91928c6beda9d501d1c26ae0cac9daf21cf34169.jpg',
  './assets/c86f8dae3967ca8220a06b7745aa763ed9a1437a.jpg',
];

let currentSlide = 0;

function changeSlide(direction) {
  const total = carouselImages.length;
  currentSlide = (currentSlide + direction + total) % total;
  updateCarousel(currentSlide);
}

function updateCarousel(index) {
  const mainImg   = $('#mainCarouselImg');
  const zoomImg   = $('#zoomResultImg');
  const thumbs    = $$('.carousel__thumb');
  if (!mainImg) return;

  // Fade transition
  mainImg.style.opacity = '0';
  mainImg.style.transition = 'opacity 0.25s ease';
  setTimeout(() => {
    mainImg.src = carouselImages[index];
    if (zoomImg) zoomImg.src = carouselImages[index];
    mainImg.style.opacity = '1';
  }, 150);

  // Update thumbnails
  thumbs.forEach((t, i) => {
    t.classList.toggle('active', i === index);
  });

  currentSlide = index;
}

// Expose globally for inline onclick
window.changeSlide = changeSlide;

(function initCarousel() {
  // Prev / Next buttons
  const prevBtn = $('#carouselPrev');
  const nextBtn = $('#carouselNext');
  if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

  // Thumbnail clicks
  $$('.carousel__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.index, 10);
      updateCarousel(idx);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  changeSlide(-1);
    if (e.key === 'ArrowRight') changeSlide(1);
  });

  // Touch / swipe support on carousel
  const carouselMain = $('#carouselMain');
  if (carouselMain) {
    let touchStartX = 0;
    carouselMain.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    carouselMain.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) changeSlide(dx < 0 ? 1 : -1);
    }, { passive: true });
  }
})();

/* =============================================================
   3. IMAGE ZOOM (lens + result panel)
   Implements a magnifier that tracks mouse position over the
   main carousel image and projects a zoomed region into the
   result panel shown to the right.
============================================================= */
(function initZoom() {
  const zoomWrap   = $('#zoomWrap');
  const mainImg    = $('#mainCarouselImg');
  const lens       = $('#zoomLens');
  const result     = $('#zoomResult');
  const resultImg  = $('#zoomResultImg');
  if (!zoomWrap || !mainImg || !lens || !result || !resultImg) return;

  const ZOOM_FACTOR = 3; // magnification level

  function positionLensAndResult(e) {
    const rect       = zoomWrap.getBoundingClientRect();
    const lensW      = lens.offsetWidth;
    const lensH      = lens.offsetHeight;

    // Mouse position relative to image
    let x = e.clientX - rect.left - lensW / 2;
    let y = e.clientY - rect.top  - lensH / 2;

    // Clamp lens within image bounds
    x = Math.max(0, Math.min(x, rect.width  - lensW));
    y = Math.max(0, Math.min(y, rect.height - lensH));

    lens.style.left = x + 'px';
    lens.style.top  = y + 'px';

    // Calculate zoom ratios
    const imgNatW = mainImg.naturalWidth  || mainImg.offsetWidth  * ZOOM_FACTOR;
    const imgNatH = mainImg.naturalHeight || mainImg.offsetHeight * ZOOM_FACTOR;

    const ratioX = imgNatW / rect.width;
    const ratioY = imgNatH / rect.height;

    // Result image size
    const resultW = result.offsetWidth;
    const resultH = result.offsetHeight;

    const scaledW  = rect.width  * ZOOM_FACTOR;
    const scaledH  = rect.height * ZOOM_FACTOR;

    // Background position for result (CSS background-image approach)
    resultImg.style.width     = scaledW + 'px';
    resultImg.style.height    = scaledH + 'px';
    resultImg.style.left      = -(x * ZOOM_FACTOR) + 'px';
    resultImg.style.top       = -(y * ZOOM_FACTOR) + 'px';
    resultImg.style.maxWidth  = 'none';
  }

  zoomWrap.addEventListener('mousemove', positionLensAndResult);

  zoomWrap.addEventListener('mouseenter', () => {
    lens.style.display   = 'block';
    result.style.display = 'block';
    // Sync result image src with current main image
    resultImg.src = mainImg.src;
  });

  zoomWrap.addEventListener('mouseleave', () => {
    lens.style.display   = 'none';
    result.style.display = 'none';
  });
})();

/* =============================================================
   4. FAQ ACCORDION
   Clicking a question toggles its answer. Only one open at a time.
============================================================= */
(function initFAQ() {
  const faqItems = $$('.faq__item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq__question');
    const ans = item.querySelector('.faq__answer');
    if (!btn || !ans) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq__item--open');

      // Close all
      faqItems.forEach(fi => {
        fi.classList.remove('faq__item--open');
        fi.querySelector('.faq__question')?.setAttribute('aria-expanded', 'false');
      });

      // Open clicked (toggle)
      if (!isOpen) {
        item.classList.add('faq__item--open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* =============================================================
   5. APPLICATIONS SLIDER (horizontal scroll)
   Prev/next buttons scroll the slider by one card width.
============================================================= */
(function initAppsSlider() {
  const slider  = $('#appsSlider');
  const prevBtn = $('#appsPrev');
  const nextBtn = $('#appsNext');
  if (!slider) return;

  const CARD_W  = 280 + 16; // card width + gap

  if (prevBtn) prevBtn.addEventListener('click', () => {
    slider.scrollBy({ left: -CARD_W, behavior: 'smooth' });
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    slider.scrollBy({ left:  CARD_W, behavior: 'smooth' });
  });
})();

/* =============================================================
   6. MANUFACTURING PROCESS TABS
   Clicking a tab shows the corresponding panel.
============================================================= */
(function initProcessTabs() {
  const tabs   = $$('.process-tab');
  const panels = $$('.process-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.tab, 10);

      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('process-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('process-tab--active');
      tab.setAttribute('aria-selected', 'true');

      // Update panels
      panels.forEach(p => p.classList.remove('process-panel--active'));
      const activePanel = panels[idx];
      if (activePanel) activePanel.classList.add('process-panel--active');
    });
  });
})();

/* =============================================================
   7. MANUFACTURING PROCESS IMAGE SHIFT
   Prev/next arrows inside the process panel (decorative –
   would swap process images if we had multiple per step).
============================================================= */
window.shiftProcessImg = function(direction) {
  // For now, this is a visual affordance placeholder.
  // In production, each tab would have a set of images to cycle.
  const activePanel = $('.process-panel--active');
  if (!activePanel) return;
  const img = activePanel.querySelector('img');
  if (!img) return;
  // Briefly pulse the image
  img.style.transition = 'opacity 0.2s ease';
  img.style.opacity = '0.5';
  setTimeout(() => { img.style.opacity = '1'; }, 200);
};

/* =============================================================
   8. MODALS
   openModal(id)  – show overlay
   closeModal(id) – hide overlay
   Clicking the backdrop closes the modal.
   ESC key closes any open modal.
============================================================= */
function openModal(id) {
  const overlay = $('#' + id);
  if (!overlay) return;
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus first focusable element
  const focusable = overlay.querySelector('input, button, select');
  if (focusable) setTimeout(() => focusable.focus(), 50);
}

function closeModal(id) {
  const overlay = $('#' + id);
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Expose globally (used by inline onclick)
window.openModal  = openModal;
window.closeModal = closeModal;

(function initModals() {
  // Click backdrop to close
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // ESC key closes any open modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $$('.modal-overlay.is-open').forEach(o => closeModal(o.id));
    }
  });

  // Catalogue modal: enable Download Brochure when email entered
  const catEmail = $('#catEmail');
  const dlBtn    = $('#downloadBrochureBtn');
  if (catEmail && dlBtn) {
    catEmail.addEventListener('input', () => {
      const valid = catEmail.validity.valid && catEmail.value.trim() !== '';
      dlBtn.disabled = !valid;
      dlBtn.classList.toggle('btn--muted', !valid);
      dlBtn.classList.toggle('btn--primary', valid);
    });
  }
})();

/* =============================================================
   9. HAMBURGER / MOBILE MENU
============================================================= */
(function initHamburger() {
  const btn  = $('#hamburgerBtn');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    btn.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden',  String(!isOpen));
  });

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('is-open');
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden',  'true');
    }
  });
})();

/* =============================================================
   10. SMOOTH ANCHOR SCROLL for "View Technical Specs"
============================================================= */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH     = $('#navbar')?.offsetHeight    || 72;
      const stickyH  = $('#stickyBar')?.offsetHeight || 0;
      const offset   = $('#stickyBar')?.classList.contains('is-visible') ? navH + stickyH : navH;
      const top      = target.getBoundingClientRect().top + window.scrollY - offset - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* =============================================================
   11. INTERSECTION OBSERVER – Fade-in sections on scroll
============================================================= */
(function initFadeIn() {
  const sections = $$('section');
  if (!('IntersectionObserver' in window)) return;

  // Add initial hidden state via JS (progressive enhancement)
  sections.forEach(sec => {
    sec.style.opacity    = '0';
    sec.style.transform  = 'translateY(20px)';
    sec.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(sec => observer.observe(sec));
})();

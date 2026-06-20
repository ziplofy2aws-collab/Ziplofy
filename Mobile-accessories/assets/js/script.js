(function () {
  var menuToggle = document.querySelector('[data-ma-menu-toggle]');
  var mobileNav = document.getElementById('ma-mobile-nav');
  var menuBackdrop = null;

  function createMenuBackdrop() {
    if (menuBackdrop || !mobileNav) return;
    menuBackdrop = document.createElement('div');
    menuBackdrop.className = 'ma-header__menu-backdrop';
    menuBackdrop.hidden = true;
    menuBackdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(menuBackdrop);
    menuBackdrop.addEventListener('click', closeMobileMenu);
  }

  function setMenuBackdropVisible(visible) {
    if (!menuBackdrop) return;
    menuBackdrop.classList.toggle('is-visible', visible);
    menuBackdrop.hidden = !visible;
    menuBackdrop.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function openMobileMenu() {
    if (!mobileNav || !menuToggle) return;
    mobileNav.hidden = false;
    requestAnimationFrame(function () {
      mobileNav.classList.add('is-open');
    });
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    setMenuBackdropVisible(true);
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileNav || !menuToggle) return;
    mobileNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    setMenuBackdropVisible(false);
    document.body.style.overflow = '';
    window.setTimeout(function () {
      if (!mobileNav.classList.contains('is-open')) mobileNav.hidden = true;
    }, 320);
  }

  if (menuToggle && mobileNav) {
    createMenuBackdrop();
    mobileNav.setAttribute('aria-hidden', 'true');

    menuToggle.addEventListener('click', function () {
      if (mobileNav.classList.contains('is-open')) closeMobileMenu();
      else openMobileMenu();
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) closeMobileMenu();
    });
  }

  function initProductCardLinks() {
    document.querySelectorAll('[data-ma-product-id]').forEach(function (card) {
      var id = card.getAttribute('data-ma-product-id');
      if (!id) return;
      var url = 'product.html?id=' + encodeURIComponent(id);
      card.querySelectorAll('a[href*="product.html"]').forEach(function (anchor) {
        anchor.href = url;
      });
      card.addEventListener('click', function (event) {
        if (event.target.closest('button')) return;
        if (event.target.closest('a')) return;
        window.location.href = url;
      });
      card.style.cursor = 'pointer';
    });
  }

  initProductCardLinks();

  var slider = document.querySelector('.ma-hero__slider');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.ma-hero__slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.ma-hero__dot'));
  var prevBtn = document.querySelector('.ma-hero__arrow--prev');
  var nextBtn = document.querySelector('.ma-hero__arrow--next');
  var heroSection = document.querySelector('.ma-hero');

  if (!slider || slides.length === 0) return;

  var activeSlide = Number(slider.dataset.currentSlide || 0);
  var autoplayDelay = 8000;
  var autoplayTimer = null;

  function goToSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    slider.dataset.currentSlide = String(activeSlide);

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === activeSlide;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setInterval(function () {
      goToSlide(activeSlide + 1);
    }, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    startAutoplay();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      goToSlide(activeSlide - 1);
      restartAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      goToSlide(activeSlide + 1);
      restartAutoplay();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      goToSlide(index);
      restartAutoplay();
    });
  });

  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoplay);
    heroSection.addEventListener('mouseleave', startAutoplay);
    heroSection.addEventListener('focusin', stopAutoplay);
    heroSection.addEventListener('focusout', function (event) {
      if (!heroSection.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  goToSlide(activeSlide);
  startAutoplay();
})();

(function () {
  var shopCat = document.querySelector('[data-ma-shop-cat]');
  if (!shopCat) return;

  var viewport = shopCat.querySelector('[data-ma-shop-cat-viewport]');
  var track = shopCat.querySelector('[data-ma-shop-cat-track]');
  var nextBtn = shopCat.querySelector('[data-ma-shop-cat-next]');
  var prevBtn = shopCat.querySelector('[data-ma-shop-cat-prev]');
  var cards = Array.prototype.slice.call(shopCat.querySelectorAll('.ma-shop-cat__card'));

  if (!viewport || !track || cards.length === 0) return;

  var scrollIndex = 0;

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function getGap() {
    return 18;
  }

  function getCardStep() {
    var card = cards[0];
    return card ? card.offsetWidth + getGap() : 0;
  }

  function getMaxIndex() {
    var visibleWidth = viewport.clientWidth;
    var totalWidth = track.scrollWidth;
    var step = getCardStep();
    if (!step) return 0;
    return Math.max(0, Math.ceil((totalWidth - visibleWidth) / step));
  }

  function goToIndex(index) {
    scrollIndex = Math.max(0, Math.min(index, getMaxIndex()));
    track.style.transform = 'translateX(-' + (scrollIndex * getCardStep()) + 'px)';
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (isMobile()) return;
      if (scrollIndex <= 0) {
        goToIndex(getMaxIndex());
      } else {
        goToIndex(scrollIndex - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (isMobile()) return;
      if (scrollIndex >= getMaxIndex()) {
        goToIndex(0);
      } else {
        goToIndex(scrollIndex + 1);
      }
    });
  }

  window.addEventListener('resize', function () {
    if (isMobile()) {
      track.style.transform = '';
      scrollIndex = 0;
    } else {
      goToIndex(scrollIndex);
    }
  });
})();

(function () {
  var section = document.querySelector('[data-ma-arrivals]');
  if (!section) return;

  var viewport = section.querySelector('[data-ma-arrivals-viewport]');
  var track = section.querySelector('[data-ma-arrivals-track]');
  var cards = section.querySelectorAll('.ma-arrivals__card');
  var prevBtn = section.querySelector('[data-ma-arrivals-prev]');
  var nextBtn = section.querySelector('[data-ma-arrivals-next]');
  var progress = section.querySelector('[data-ma-arrivals-progress]');
  var offset = 0;

  if (!viewport || !track || !cards.length) return;

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function getStep() {
    var gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function applyScroll(targetOffset) {
    if (isMobile()) return;

    var maxOffset = getMaxOffset();
    offset = Math.min(maxOffset, Math.max(0, targetOffset));
    track.style.transform = 'translateX(-' + offset + 'px)';

    if (progress) {
      progress.style.width = (maxOffset <= 0 ? 100 : (offset / maxOffset) * 100) + '%';
    }

    var edge = 2;
    var atStart = offset <= edge;
    var atEnd = offset >= maxOffset - edge;

    if (prevBtn) prevBtn.disabled = atStart || maxOffset <= 0;
    if (nextBtn) nextBtn.disabled = atEnd || maxOffset <= 0;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      applyScroll(offset - getStep());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      applyScroll(offset + getStep());
    });
  }

  window.addEventListener('resize', function () {
    if (isMobile()) {
      track.style.transform = '';
      offset = 0;
      if (progress) progress.style.width = '0%';
    } else {
      applyScroll(offset);
    }
  });

  applyScroll(0);
})();

(function () {
  var section = document.querySelector('[data-ma-collections]');
  if (!section) return;

  var viewport = section.querySelector('[data-ma-collections-viewport]');
  var track = section.querySelector('[data-ma-collections-track]');
  var cards = section.querySelectorAll('.ma-collections__card');
  var prevBtn = section.querySelector('[data-ma-collections-prev]');
  var nextBtn = section.querySelector('[data-ma-collections-next]');
  var progress = section.querySelector('[data-ma-collections-progress]');
  var filters = section.querySelectorAll('.ma-collections__filter');
  var offset = 0;

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function getStep() {
    var gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function applyScroll(targetOffset) {
    if (isMobile()) return;

    var maxOffset = getMaxOffset();
    offset = Math.min(maxOffset, Math.max(0, targetOffset));
    track.style.transform = 'translateX(-' + offset + 'px)';

    if (progress) {
      progress.style.width = (maxOffset <= 0 ? 100 : (offset / maxOffset) * 100) + '%';
    }

    var edge = 2;
    var atStart = offset <= edge;
    var atEnd = offset >= maxOffset - edge;

    if (prevBtn) prevBtn.disabled = atStart || maxOffset <= 0;
    if (nextBtn) nextBtn.disabled = atEnd || maxOffset <= 0;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      applyScroll(offset - getStep());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      applyScroll(offset + getStep());
    });
  }

  filters.forEach(function (filter) {
    filter.addEventListener('click', function () {
      filters.forEach(function (btn) {
        var isActive = btn === filter;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      applyScroll(0);
    });
  });

  window.addEventListener('resize', function () {
    if (isMobile()) {
      track.style.transform = '';
      offset = 0;
      if (progress) progress.style.width = '0%';
    } else {
      applyScroll(offset);
    }
  });

  applyScroll(0);
})();

(function () {
  var compareViewport = document.querySelector('[data-ma-snoot-compare]');
  if (!compareViewport) return;

  var compareBefore = compareViewport.querySelector('[data-ma-snoot-before]');
  var compareRevealFill = compareViewport.querySelector('[data-ma-snoot-reveal-fill]');
  var compareSourceImg = compareViewport.querySelector('.ma-snoot__img--dim');
  var compareDivider = compareViewport.querySelector('[data-ma-snoot-divider]');
  var compareHandle = compareViewport.querySelector('[data-ma-snoot-handle]');
  var compareRange = compareViewport.querySelector('[data-ma-snoot-range]');
  var compareDragging = false;

  function compareSyncReveal() {
    if (!compareRevealFill || !compareSourceImg) return;
    compareRevealFill.style.width = compareViewport.offsetWidth + 'px';
    compareRevealFill.style.height = compareViewport.offsetHeight + 'px';
    compareRevealFill.style.backgroundImage = 'url("' + compareSourceImg.currentSrc + '")';
  }

  function compareSetPosition(percent) {
    var pos = Math.max(0, Math.min(100, percent));
    if (compareBefore) compareBefore.style.width = pos + '%';
    if (compareDivider) compareDivider.style.left = pos + '%';
    if (compareRange) compareRange.value = String(pos);
  }

  function compareFromClientX(clientX) {
    var rect = compareViewport.getBoundingClientRect();
    if (!rect.width) return 50;
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function compareStartDrag() {
    compareDragging = true;
    compareViewport.classList.add('is-dragging');
  }

  function compareEndDrag() {
    compareDragging = false;
    compareViewport.classList.remove('is-dragging');
  }

  if (compareRange) {
    compareRange.addEventListener('input', function () {
      compareSetPosition(parseFloat(compareRange.value));
    });
  }

  compareViewport.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    compareStartDrag();
    compareSetPosition(compareFromClientX(e.clientX));
    if (compareViewport.setPointerCapture && e.target !== compareRange) {
      try {
        compareViewport.setPointerCapture(e.pointerId);
      } catch (err) { /* ignore */ }
    }
  });

  compareViewport.addEventListener('pointermove', function (e) {
    if (!compareDragging) return;
    compareSetPosition(compareFromClientX(e.clientX));
  });

  compareViewport.addEventListener('pointerup', compareEndDrag);
  compareViewport.addEventListener('pointercancel', compareEndDrag);

  if (compareHandle) {
    compareHandle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 2;
      var current = compareRange ? parseFloat(compareRange.value) : 50;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        compareSetPosition(current - step);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        compareSetPosition(current + step);
      }
    });
  }

  window.addEventListener('resize', function () {
    compareSyncReveal();
    if (compareRange) compareSetPosition(parseFloat(compareRange.value));
  });

  if (compareSourceImg) {
    compareSourceImg.addEventListener('load', compareSyncReveal);
  }

  compareSyncReveal();
  compareSetPosition(compareRange ? parseFloat(compareRange.value) : 50);
})();

(function () {
  var backToTop = document.querySelector('[data-ma-back-to-top]');
  if (!backToTop) return;

  function toggleBackToTop() {
    backToTop.classList.toggle('is-visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

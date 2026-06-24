(function () {
  var header = document.querySelector('[data-f2-header]');
  if (!header) return;

  var drawer = header.querySelector('[data-f2-drawer]');
  var backdrop = header.querySelector('[data-f2-backdrop]');
  var menuToggle = header.querySelector('[data-f2-menu-toggle]');
  var menuClose = header.querySelector('[data-f2-menu-close]');

  if (!drawer || !menuToggle) return;

  function openMenu() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add('is-visible');
    }
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (backdrop) {
      backdrop.classList.remove('is-visible');
    }
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    if (backdrop) {
      window.setTimeout(function () {
        if (!drawer.classList.contains('is-open')) {
          backdrop.hidden = true;
        }
      }, 260);
    }
  }

  menuToggle.addEventListener('click', function () {
    if (drawer.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  drawer.querySelectorAll('.f2-header__drawer-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();

(function () {
  var searchInput = document.getElementById('f2-header-search');
  var searchForm = searchInput && searchInput.closest('.f2-header__search');

  if (searchInput && searchForm) {
    function syncSearchPlaceholder() {
      searchForm.classList.toggle('is-filled', searchInput.value.trim().length > 0);
    }

    searchInput.addEventListener('input', syncSearchPlaceholder);
    searchInput.addEventListener('focus', syncSearchPlaceholder);
    searchInput.addEventListener('blur', syncSearchPlaceholder);
    syncSearchPlaceholder();
  }
})();

(function () {
  var slider = document.querySelector('[data-f2-hero-slider]');
  if (!slider) return;

  var track = slider.querySelector('.f2-hero__track');
  var slides = slider.querySelectorAll('.f2-hero__slide');
  var dots = slider.querySelectorAll('[data-f2-hero-dot]');
  var prevBtn = slider.querySelector('[data-f2-hero-prev]');
  var nextBtn = slider.querySelector('[data-f2-hero-next]');
  var counter = slider.querySelector('[data-f2-hero-counter]');
  var activeIndex = 0;
  var total = slides.length;

  if (!track || !total) return;

  function goTo(index) {
    activeIndex = (index + total) % total;
    track.style.transform = 'translateX(-' + (activeIndex * 100) + '%)';

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeIndex);
    });

    dots.forEach(function (dot, i) {
      var isActive = i === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (counter) {
      counter.textContent = (activeIndex + 1) + '/' + total;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      goTo(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      goTo(activeIndex + 1);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.getAttribute('data-f2-hero-dot'), 10);
      if (!isNaN(index)) goTo(index);
    });
  });

  goTo(0);
})();

(function () {
  var slider = document.querySelector('[data-f2-promo-slider]');
  if (!slider) return;

  var track = slider.querySelector('.f2-promo__track');
  var slides = slider.querySelectorAll('.f2-promo__slide');
  var dots = slider.querySelectorAll('[data-f2-promo-dot]');
  var activeIndex = 0;
  var total = slides.length;
  var delay = 5000;
  var timer = null;

  if (!track || total < 1) return;

  function goTo(index) {
    activeIndex = (index + total) % total;
    track.style.transform = 'translateX(-' + (activeIndex * 100) + '%)';

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeIndex);
    });

    dots.forEach(function (dot, i) {
      var isActive = i === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function next() {
    goTo(activeIndex + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    if (total > 1) {
      timer = window.setInterval(next, delay);
    }
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(dot.getAttribute('data-f2-promo-dot'), 10);
      if (!isNaN(index)) {
        goTo(index);
        startAutoplay();
      }
    });
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  slider.addEventListener('focusin', stopAutoplay);
  slider.addEventListener('focusout', function (e) {
    if (!slider.contains(e.relatedTarget)) startAutoplay();
  });

  goTo(0);
  startAutoplay();
})();

(function () {
  var carousel = document.querySelector('[data-f2-deals-carousel]');
  if (!carousel) return;

  var viewport = carousel.querySelector('[data-f2-deals-viewport]');
  var track = carousel.querySelector('[data-f2-deals-track]');
  var cards = track && track.querySelectorAll('.f2-deals__card');
  var prevBtn = carousel.querySelector('[data-f2-deals-prev]');
  var nextBtn = carousel.querySelector('[data-f2-deals-next]');
  var scrollOffset = 0;

  if (!viewport || !track || !cards.length) return;

  function isMobileCarousel() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function getGap() {
    var gap = parseFloat(getComputedStyle(track).gap || getComputedStyle(track).columnGap);
    return Number.isFinite(gap) ? gap : 14;
  }

  function getStep() {
    return cards[0].offsetWidth + getGap();
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function applyScroll(targetOffset) {
    if (isMobileCarousel()) {
      track.style.transform = 'none';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    var maxOffset = getMaxOffset();
    scrollOffset = Math.min(maxOffset, Math.max(0, targetOffset));
    track.style.transform = 'translateX(-' + scrollOffset + 'px)';

    if (prevBtn) prevBtn.disabled = scrollOffset <= 0;
    if (nextBtn) nextBtn.disabled = scrollOffset >= maxOffset - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      applyScroll(scrollOffset - getStep());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      applyScroll(scrollOffset + getStep());
    });
  }

  window.addEventListener('resize', function () {
    if (isMobileCarousel()) {
      track.style.transform = 'none';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
    } else {
      applyScroll(scrollOffset);
    }
  });

  applyScroll(0);
})();

(function () {
  var carousel = document.querySelector('[data-f2-justin-carousel]');
  if (!carousel) return;

  var viewport = carousel.querySelector('[data-f2-justin-viewport]');
  var track = carousel.querySelector('[data-f2-justin-track]');
  var cards = track && track.querySelectorAll('.f2-justin__card');
  var prevBtn = carousel.querySelector('[data-f2-justin-prev]');
  var nextBtn = carousel.querySelector('[data-f2-justin-next]');
  var filters = document.querySelectorAll('.f2-justin__filter');
  var scrollOffset = 0;

  if (!viewport || !track || !cards.length) return;

  function isMobileCarousel() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function getGap() {
    var gap = parseFloat(getComputedStyle(track).gap || getComputedStyle(track).columnGap);
    return Number.isFinite(gap) ? gap : 14;
  }

  function getStep() {
    return cards[0].offsetWidth + getGap();
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function applyScroll(targetOffset) {
    if (isMobileCarousel()) {
      track.style.transform = 'none';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    var maxOffset = getMaxOffset();
    scrollOffset = Math.min(maxOffset, Math.max(0, targetOffset));
    track.style.transform = 'translateX(-' + scrollOffset + 'px)';

    if (prevBtn) prevBtn.disabled = scrollOffset <= 0;
    if (nextBtn) nextBtn.disabled = scrollOffset >= maxOffset - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      applyScroll(scrollOffset - getStep());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      applyScroll(scrollOffset + getStep());
    });
  }

  filters.forEach(function (filter) {
    filter.addEventListener('click', function () {
      filters.forEach(function (item) {
        var isActive = item === filter;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    });
  });

  window.addEventListener('resize', function () {
    if (isMobileCarousel()) {
      track.style.transform = 'none';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
    } else {
      applyScroll(scrollOffset);
    }
  });

  applyScroll(0);
})();

(function () {
  var backTop = document.querySelector('[data-f2-back-top]');
  if (backTop) {
    backTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

(function () {
  function productPageUrl(id) {
    return 'product.html?id=' + encodeURIComponent(id);
  }

  function setupHomeProductCards() {
    document.querySelectorAll('.f2-deals__card[data-f2-product-id], .f2-justin__card[data-f2-product-id]').forEach(function (card) {
      var id = card.getAttribute('data-f2-product-id');
      if (!id) return;

      var linkClass = card.classList.contains('f2-deals__card')
        ? 'f2-deals__card-link'
        : 'f2-justin__card-link';
      var link = card.querySelector('.' + linkClass);

      if (!link) {
        link = document.createElement('a');
        link.className = linkClass;
        card.insertBefore(link, card.firstChild);
      }

      link.href = productPageUrl(id);
      link.setAttribute('aria-label', 'View product details');
    });

    document.querySelectorAll('.f2-deals__action, .f2-justin__action').forEach(function (btn) {
      if (btn.dataset.f2ActionBound) return;
      btn.dataset.f2ActionBound = '1';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var icon = btn.querySelector('i');
        if (icon && icon.classList.contains('fa-heart')) {
          icon.classList.toggle('fa-regular');
          icon.classList.toggle('fa-solid');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHomeProductCards);
  } else {
    setupHomeProductCards();
  }
})();

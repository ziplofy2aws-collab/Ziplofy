(function () {
  'use strict';

  // Mobile menu toggle
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mobileNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('is-active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Hero background slider (auto, 8s delay)
  var slider = document.getElementById('heroSlider');
  if (slider) {
    var slides = slider.querySelectorAll('.hero-slide');
    if (slides.length > 1) {
      var current = 0;
      setInterval(function () {
        slides[current].classList.remove('is-active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('is-active');
      }, 8000);
    }
  }

  // Arrow-navigation sliders (categories, testimonials, ...)
  var initArrowSlider = function (trackId, prevId, nextId, cardSelector) {
    var track = document.getElementById(trackId);
    var prevBtn = document.getElementById(prevId);
    var nextBtn = document.getElementById(nextId);
    if (!track || !prevBtn || !nextBtn) return;

    var scrollByAmount = function () {
      var card = track.querySelector(cardSelector);
      if (!card) return track.clientWidth;
      var gap = parseInt(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 24, 10) || 24;
      return card.getBoundingClientRect().width + gap;
    };
    prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -scrollByAmount(), behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: scrollByAmount(), behavior: 'smooth' });
    });
  };

  initArrowSlider('catTrack', 'catPrev', 'catNext', '.category-card');
  initArrowSlider('testiTrack', 'testiPrev', 'testiNext', '.testi-card');
  initArrowSlider('productThumbs', 'pdThumbPrev', 'pdThumbNext', '.pd-thumb');
  initArrowSlider('ymlTrack', 'ymlPrev', 'ymlNext', '.mp-card');

  // Menu category filter
  var menuFilters = document.getElementById('menuFilters');
  var menuGrid = document.getElementById('menuGrid');
  if (menuFilters && menuGrid) {
    var cards = menuGrid.querySelectorAll('.mp-card, .dish-card');
    menuFilters.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      var filter = btn.getAttribute('data-filter');
      menuFilters.querySelectorAll('[data-filter]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      cards.forEach(function (card) {
        var show = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !show);
      });
    });
  }

  // Mobile filter bottom sheet
  var filterToggle = document.getElementById('filterToggle');
  var menuSidebar = document.getElementById('menuSidebar');
  var filterBackdrop = document.getElementById('filterBackdrop');
  var filterClose = document.getElementById('filterClose');
  var filterApply = document.getElementById('filterApply');
  if (filterToggle && menuSidebar && filterBackdrop) {
    var openFilters = function () {
      menuSidebar.classList.add('open');
      filterBackdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    };
    var closeFilters = function () {
      menuSidebar.classList.remove('open');
      filterBackdrop.classList.remove('show');
      document.body.style.overflow = '';
    };
    filterToggle.addEventListener('click', openFilters);
    filterBackdrop.addEventListener('click', closeFilters);
    if (filterClose) filterClose.addEventListener('click', closeFilters);
    if (filterApply) filterApply.addEventListener('click', closeFilters);
  }

  // ===== Product card -> product page =====
  var PRODUCT_KEY = 'savoriaSelectedProduct';

  var readCardData = function (card) {
    var text = function (sel) {
      var el = card.querySelector(sel);
      return el ? el.textContent.trim() : '';
    };
    var imgEl = card.querySelector('.mp-card-img img, .dish-image img, img');
    return {
      name: text('.mp-name a') || text('.mp-name') || text('.dish-name'),
      desc: text('.mp-desc') || text('.dish-desc'),
      price: text('.mp-price') || text('.dish-price'),
      img: imgEl ? imgEl.getAttribute('src') : '',
      rateNum: text('.mp-rate-num'),
      rateCount: text('.mp-rate-count'),
      badge: text('.mp-badge'),
      category: card.getAttribute('data-category') || ''
    };
  };

  document.addEventListener('click', function (e) {
    var card = e.target.closest('.mp-card, .dish-card');
    if (!card) return;
    // Let action buttons (wishlist / add) behave normally
    if (e.target.closest('.mp-wish, .mp-add, .wishlist-btn, .add-btn')) return;
    e.preventDefault();
    try {
      sessionStorage.setItem(PRODUCT_KEY, JSON.stringify(readCardData(card)));
    } catch (err) {}
    window.location.href = 'product.html';
  });

  // Populate product page from the selected card
  var pdTitle = document.querySelector('.pd-title');
  if (pdTitle) {
    var stored = null;
    try {
      stored = JSON.parse(sessionStorage.getItem(PRODUCT_KEY));
    } catch (err) {}

    if (stored && stored.name) {
      pdTitle.textContent = stored.name;

      var crumb = document.querySelector('.pd-breadcrumb .current');
      if (crumb) crumb.textContent = stored.name;

      var pdDesc = document.querySelector('.pd-desc');
      if (pdDesc && stored.desc) pdDesc.textContent = stored.desc;

      var pdPrice = document.querySelector('.pd-price');
      if (pdPrice && stored.price) pdPrice.textContent = stored.price;

      var pdRateNum = document.querySelector('.pd-rate-num');
      if (pdRateNum && stored.rateNum) pdRateNum.textContent = stored.rateNum;

      var pdRateCount = document.querySelector('.pd-rate-count');
      if (pdRateCount && stored.rateCount) {
        var m = stored.rateCount.match(/\d+/);
        pdRateCount.textContent = m ? '(' + m[0] + ' Reviews)' : stored.rateCount;
      }

      var pdMainImg = document.getElementById('productMainImg');
      if (pdMainImg && stored.img) {
        pdMainImg.src = stored.img;
        pdMainImg.alt = stored.name;
      }

      var firstThumb = document.querySelector('#productThumbs .pd-thumb');
      if (firstThumb && stored.img) {
        firstThumb.setAttribute('data-img', stored.img);
        var ftImg = firstThumb.querySelector('img');
        if (ftImg) {
          ftImg.src = stored.img;
          ftImg.alt = stored.name;
        }
      }

      var pdBadge = document.querySelector('.pd-main-img .pd-badge');
      if (pdBadge) {
        if (stored.badge) {
          pdBadge.textContent = stored.badge;
          pdBadge.style.display = '';
        } else {
          pdBadge.style.display = 'none';
        }
      }

      document.title = 'Savoria — ' + stored.name;
    }
  }

  // Product gallery thumbnails
  var mainImg = document.getElementById('productMainImg');
  var thumbs = document.getElementById('productThumbs');
  if (mainImg && thumbs) {
    thumbs.addEventListener('click', function (e) {
      var thumb = e.target.closest('.product-thumb');
      if (!thumb) return;
      mainImg.src = thumb.getAttribute('data-img');
      thumbs.querySelectorAll('.product-thumb').forEach(function (t) {
        t.classList.toggle('active', t === thumb);
      });
    });
  }

  // Product description tabs
  var tabNav = document.querySelector('.pd-tabnav');
  if (tabNav) {
    var tabs = tabNav.querySelectorAll('.pd-tab');
    var panels = document.querySelectorAll('.pd-tabpanel');
    tabNav.addEventListener('click', function (e) {
      var tab = e.target.closest('.pd-tab');
      if (!tab) return;
      var name = tab.getAttribute('data-tab');
      tabs.forEach(function (t) {
        t.classList.toggle('active', t === tab);
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== name;
      });
    });
  }

  // Product quantity selector
  var qtyValue = document.getElementById('qtyValue');
  var qtyMinus = document.getElementById('qtyMinus');
  var qtyPlus = document.getElementById('qtyPlus');
  if (qtyValue && qtyMinus && qtyPlus) {
    var getQty = function () {
      return Math.max(1, parseInt(qtyValue.value, 10) || 1);
    };
    qtyMinus.addEventListener('click', function () {
      qtyValue.value = Math.max(1, getQty() - 1);
    });
    qtyPlus.addEventListener('click', function () {
      qtyValue.value = getQty() + 1;
    });
    qtyValue.addEventListener('change', function () {
      qtyValue.value = getQty();
    });
  }

  // Reservation form
  var reservationForm = document.getElementById('reservationForm');
  if (reservationForm) {
    var resSuccess = document.getElementById('resSuccess');
    reservationForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof reservationForm.reportValidity === 'function' && !reservationForm.reportValidity()) {
        return;
      }
      if (resSuccess) {
        resSuccess.classList.add('show');
        resSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      reservationForm.reset();
    });
  }

  // Scroll to top button
  var scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    var toggleScrollTop = function () {
      scrollTopBtn.classList.toggle('show', window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleScrollTop, { passive: true });
    toggleScrollTop();
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

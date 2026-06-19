(function () {
  "use strict";

  /* Announcement slider */
  var announceTrack = document.querySelector("[data-ca-announce-track]");
  if (announceTrack) {
    var slides = announceTrack.querySelectorAll("[data-ca-announce-slide]");
    if (slides.length >= 2) {
      var index = 0;

      function showSlide(i) {
        index = (i + slides.length) % slides.length;
        announceTrack.style.transform = "translateX(-" + index * 100 + "%)";
      }

      document.querySelector("[data-ca-announce-prev]")?.addEventListener("click", function () {
        showSlide(index - 1);
      });

      document.querySelector("[data-ca-announce-next]")?.addEventListener("click", function () {
        showSlide(index + 1);
      });
    }
  }

  /* Hero slider — auto fade */
  var heroRoot = document.querySelector("[data-ca-hero-slider]");
  if (heroRoot) {
    var heroSlides = heroRoot.querySelectorAll("[data-ca-hero-slide]");
    if (heroSlides.length >= 2) {
      var heroIndex = 0;
      var heroTimer = null;
      var heroInterval = 5000;

      function heroGoTo(i) {
        heroSlides[heroIndex].classList.remove("is-active");
        heroIndex = (i + heroSlides.length) % heroSlides.length;
        heroSlides[heroIndex].classList.add("is-active");
      }

      function heroSchedule() {
        if (heroTimer) window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
          heroGoTo(heroIndex + 1);
        }, heroInterval);
      }

      heroRoot.addEventListener("mouseenter", function () {
        if (heroTimer) window.clearInterval(heroTimer);
      });

      heroRoot.addEventListener("mouseleave", heroSchedule);

      heroSchedule();
    }
  }

  /* Collections scroll */
  var collectionsTrack = document.querySelector("[data-ca-collections-track]");
  var collectionsNext = document.querySelector("[data-ca-collections-next]");
  if (collectionsTrack && collectionsNext) {
    collectionsNext.addEventListener("click", function () {
      var card = collectionsTrack.querySelector(".ca-cat-card");
      var scrollAmount = card ? card.offsetWidth + 20 : 200;
      var maxScroll = collectionsTrack.scrollWidth - collectionsTrack.clientWidth;
      if (collectionsTrack.scrollLeft >= maxScroll - 4) {
        collectionsTrack.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        collectionsTrack.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    });
  }

  /* Section carousel — mobile: 1 card + swipe; desktop: CSS grid on track */
  function initCaSectionCarousel(opts) {
    var root = document.querySelector(opts.root);
    if (!root) return;

    var viewport = root.querySelector(opts.viewport);
    var track = root.querySelector(opts.track);
    var cardSel = opts.card || ".ca-product-card";
    var cards = track ? track.querySelectorAll(cardSel) : [];
    var nextBtn = root.querySelector(opts.next);
    var prevBtn = root.querySelector(opts.prev);
    var mobileMax = opts.mobileMax || 768;

    if (!viewport || !track || !cards.length) return;

    var index = 0;
    var dragging = false;
    var startX = 0;
    var deltaX = 0;
    var baseX = 0;

    function isMobile() {
      return window.innerWidth <= mobileMax;
    }

    function gap() {
      return parseFloat(getComputedStyle(track).gap) || 16;
    }

    function step() {
      var card = cards[0];
      return card ? card.offsetWidth + gap() : 0;
    }

    function clearSizes() {
      cards.forEach(function (card) {
        card.style.flex = "";
        card.style.width = "";
        card.style.minWidth = "";
      });
      track.style.transform = "";
    }

    function syncSizes() {
      if (!isMobile()) {
        clearSizes();
        return;
      }

      var viewW = viewport.getBoundingClientRect().width;
      cards.forEach(function (card) {
        card.style.flex = "0 0 " + viewW + "px";
        card.style.width = viewW + "px";
        card.style.minWidth = viewW + "px";
      });
    }

    function applyTransform(px, animate) {
      track.style.transition = animate === false ? "none" : "";
      track.style.transform = "translate3d(-" + px + "px, 0, 0)";
    }

    function maxIndex() {
      return Math.max(0, cards.length - 1);
    }

    function goTo(i, animate) {
      syncSizes();
      if (!isMobile()) {
        index = 0;
        applyTransform(0, false);
        return;
      }

      index = Math.max(0, Math.min(i, maxIndex()));
      applyTransform(index * step(), animate !== false);
    }

    function nextSlide() {
      if (!isMobile()) return;
      if (index >= maxIndex()) goTo(0);
      else goTo(index + 1);
    }

    function prevSlide() {
      if (!isMobile()) return;
      if (index <= 0) goTo(maxIndex());
      else goTo(index - 1);
    }

    nextBtn?.addEventListener("click", nextSlide);
    prevBtn?.addEventListener("click", prevSlide);

    window.addEventListener("resize", function () {
      goTo(index);
    });

    function pointerDown(clientX) {
      if (!isMobile()) return;
      dragging = true;
      startX = clientX;
      deltaX = 0;
      baseX = index * step();
      viewport.classList.add("is-dragging");
      applyTransform(baseX, false);
    }

    function pointerMove(clientX) {
      if (!dragging || !isMobile()) return;
      deltaX = clientX - startX;
      var max = maxIndex() * step();
      applyTransform(Math.max(0, Math.min(baseX - deltaX, max)), false);
    }

    function pointerUp() {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");

      if (!isMobile()) {
        goTo(0, false);
        return;
      }

      var threshold = Math.min(56, step() * 0.18);
      if (deltaX < -threshold) nextSlide();
      else if (deltaX > threshold) prevSlide();
      else goTo(index);
    }

    viewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target.closest("a, button")) return;
      pointerDown(e.clientX);
      if (viewport.setPointerCapture) viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener("pointermove", function (e) {
      pointerMove(e.clientX);
    });

    viewport.addEventListener("pointerup", pointerUp);
    viewport.addEventListener("pointercancel", pointerUp);

    goTo(0, false);
  }

  initCaSectionCarousel({
    root: "[data-ca-bestsellers]",
    viewport: "[data-ca-bestsellers-viewport]",
    track: "[data-ca-bestsellers-track]",
    card: ".ca-product-card",
    next: "[data-ca-bestsellers-next]",
    prev: "[data-ca-bestsellers-prev]"
  });

  initCaSectionCarousel({
    root: "[data-ca-blog]",
    viewport: "[data-ca-blog-viewport]",
    track: "[data-ca-blog-track]",
    card: ".ca-blog-card",
    next: "[data-ca-blog-next]",
    prev: "[data-ca-blog-prev]"
  });

  /* Products carousel — one card per click */
  var productsRoot = document.querySelector("[data-ca-products]");
  if (productsRoot) {
    var productsViewport = productsRoot.querySelector("[data-ca-products-viewport]");
    var productsTrack = productsRoot.querySelector("[data-ca-products-track]");
    var productsCards = productsTrack ? productsTrack.querySelectorAll(".ca-product-card") : [];
    var productsNext = productsRoot.querySelector("[data-ca-products-next]");
    var productsPrev = productsRoot.querySelector("[data-ca-products-prev]");

    if (productsViewport && productsTrack && productsCards.length && (productsNext || productsPrev)) {
      var productsIndex = 0;

      function productsVisibleCount() {
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 992) return 2;
        return 4;
      }

      function productsMaxIndex() {
        return Math.max(0, productsCards.length - productsVisibleCount());
      }

      function productsStep() {
        var card = productsCards[0];
        if (!card) return 0;
        var gap = parseFloat(getComputedStyle(productsTrack).gap) || 20;
        return card.offsetWidth + gap;
      }

      function productsSyncSizes() {
        var visible = productsVisibleCount();
        var gap = parseFloat(getComputedStyle(productsTrack).gap) || 20;
        var viewW = productsViewport.getBoundingClientRect().width;
        var cardW = (viewW - gap * (visible - 1)) / visible;

        productsCards.forEach(function (card) {
          card.style.flex = "0 0 " + cardW + "px";
          card.style.width = cardW + "px";
          card.style.minWidth = cardW + "px";
        });
      }

      function productsGoTo(i) {
        productsSyncSizes();
        var max = productsMaxIndex();
        productsIndex = Math.max(0, Math.min(i, max));
        productsTrack.style.transform = "translate3d(-" + productsIndex * productsStep() + "px, 0, 0)";
      }

      productsNext?.addEventListener("click", function () {
        if (productsIndex >= productsMaxIndex()) {
          productsGoTo(0);
        } else {
          productsGoTo(productsIndex + 1);
        }
      });

      productsPrev?.addEventListener("click", function () {
        if (productsIndex <= 0) {
          productsGoTo(productsMaxIndex());
        } else {
          productsGoTo(productsIndex - 1);
        }
      });

      window.addEventListener("resize", function () {
        productsGoTo(productsIndex);
      });

      productsGoTo(0);
    }
  }

  /* Featured product — thumbnails & options */
  var featuredRoot = document.querySelector(".ca-featured");
  if (featuredRoot) {
    var featuredMain = featuredRoot.querySelector("[data-ca-featured-main]");
    var featuredThumbs = featuredRoot.querySelectorAll("[data-ca-featured-thumb]");

    featuredThumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-ca-featured-src");
        if (!src || !featuredMain) return;

        featuredThumbs.forEach(function (t) {
          t.classList.remove("is-active");
          t.removeAttribute("aria-current");
        });
        thumb.classList.add("is-active");
        thumb.setAttribute("aria-current", "true");
        featuredMain.src = src;
      });
    });

    featuredRoot.querySelectorAll("[data-ca-featured-pill]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        var group = pill.closest(".ca-featured__pills");
        if (!group) return;
        group.querySelectorAll("[data-ca-featured-pill]").forEach(function (p) {
          p.classList.remove("is-active");
        });
        pill.classList.add("is-active");
      });
    });

    featuredRoot.querySelectorAll("[data-ca-featured-swatch]").forEach(function (swatch) {
      swatch.addEventListener("click", function () {
        var group = swatch.closest(".ca-featured__swatches");
        if (!group) return;
        group.querySelectorAll("[data-ca-featured-swatch]").forEach(function (s) {
          s.classList.remove("is-active");
          s.setAttribute("aria-pressed", "false");
        });
        swatch.classList.add("is-active");
        swatch.setAttribute("aria-pressed", "true");
      });
    });
  }

  /* Mobile nav toggle */
  var menuToggle = document.querySelector("[data-ca-menu-toggle]");
  var navMenu = document.getElementById("caNavMenu");
  var navBar = document.querySelector(".ca-nav");
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      if (navBar) navBar.classList.toggle("is-menu-open", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  /* Mobile header — search icon toggles search bar */
  var mobileSearchBtn = document.querySelector("[data-ca-mobile-search]");
  var headerSearch = document.querySelector(".ca-mainbar .ca-search");
  if (mobileSearchBtn && headerSearch) {
    mobileSearchBtn.addEventListener("click", function () {
      var open = headerSearch.classList.toggle("is-mobile-open");
      mobileSearchBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        var input = headerSearch.querySelector("input");
        if (input) input.focus();
      }
    });
  }

  /* Category page — filter sidebar & accordions */
  var catSidebar = document.querySelector("[data-ca-cat-sidebar]");
  var catBackdrop = document.querySelector("[data-ca-cat-backdrop]");
  var catFilterOpen = document.querySelector("[data-ca-cat-filter-open]");
  var catFilterClose = document.querySelector("[data-ca-cat-sidebar-close]");

  function catFiltersClose() {
    catSidebar?.classList.remove("is-open");
    catBackdrop?.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  function catFiltersOpenFn() {
    catSidebar?.classList.add("is-open");
    catBackdrop?.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  catFilterOpen?.addEventListener("click", catFiltersOpenFn);
  catFilterClose?.addEventListener("click", catFiltersClose);
  catBackdrop?.addEventListener("click", catFiltersClose);

  document.querySelectorAll("[data-ca-cat-filter]").forEach(function (filter) {
    var trigger = filter.querySelector(".ca-cat-filter__trigger");
    if (!trigger) return;

    trigger.addEventListener("click", function () {
      var open = filter.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  document.querySelector(".ca-cat-filter__clear")?.addEventListener("click", function () {
    document.querySelectorAll(".ca-cat-filter__check input").forEach(function (input) {
      input.checked = false;
    });
  });

  /* Product page — FAQ accordion & countdown */
  document.querySelectorAll("[data-ca-pdp-acc]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = btn.nextElementSibling;
      if (!panel) return;
      var open = btn.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("is-open", open);
    });
  });

  var pdpTimer = document.querySelector("[data-ca-pdp-timer]");
  if (pdpTimer) {
    var end = Date.now() + 9 * 60 * 1000 + 10 * 1000;
    var dEl = pdpTimer.querySelector("[data-ca-timer-days]");
    var hEl = pdpTimer.querySelector("[data-ca-timer-hrs]");
    var mEl = pdpTimer.querySelector("[data-ca-timer-mins]");
    var sEl = pdpTimer.querySelector("[data-ca-timer-secs]");

    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function tickTimer() {
      var diff = Math.max(0, end - Date.now());
      var totalSec = Math.floor(diff / 1000);
      var days = Math.floor(totalSec / 86400);
      var hrs = Math.floor((totalSec % 86400) / 3600);
      var mins = Math.floor((totalSec % 3600) / 60);
      var secs = totalSec % 60;
      if (dEl) dEl.textContent = pad(days);
      if (hEl) hEl.textContent = pad(hrs);
      if (mEl) mEl.textContent = pad(mins);
      if (sEl) sEl.textContent = pad(secs);
    }

    tickTimer();
    window.setInterval(tickTimer, 1000);
  }
})();

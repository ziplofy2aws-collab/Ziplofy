(function () {
  "use strict";

  var announceBar = document.querySelector("[data-grc-announce]");
  var announceClose = document.querySelector("[data-grc-announce-close]");
  var menuToggle = document.querySelector("[data-grc-menu-toggle]");
  var mobileNav = document.querySelector("[data-grc-mobile-nav]");
  var menuOverlay = document.querySelector("[data-grc-menu-overlay]");
  var locationBtn = document.querySelector("[data-grc-location-btn]");
  var locationText = document.querySelector("[data-grc-location-text]");

  var ANNOUNCE_KEY = "grc-announce-dismissed";

  function closeAnnounceBar() {
    if (!announceBar) return;
    announceBar.classList.add("is-hidden");
    try {
      sessionStorage.setItem(ANNOUNCE_KEY, "1");
    } catch (e) {
      /* ignore */
    }
  }

  function restoreAnnounceBar() {
    if (!announceBar) return;
    try {
      if (sessionStorage.getItem(ANNOUNCE_KEY) === "1") {
        announceBar.classList.add("is-hidden");
      }
    } catch (e) {
      /* ignore */
    }
  }

  function setMenuOpen(isOpen) {
    if (!menuToggle || !mobileNav || !menuOverlay) return;

    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

    var icon = menuToggle.querySelector("i");
    if (icon) {
      icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    }

    mobileNav.hidden = !isOpen;
    menuOverlay.hidden = !isOpen;

    requestAnimationFrame(function () {
      mobileNav.classList.toggle("is-open", isOpen);
      menuOverlay.classList.toggle("is-visible", isOpen);
    });

    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  function toggleMenu() {
    var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  }

  function simulateLocationFetch() {
    if (!locationText) return;

    setTimeout(function () {
      locationText.textContent = "Delhi NCR";
    }, 1800);
  }

  if (announceClose) {
    announceClose.addEventListener("click", closeAnnounceBar);
  }

  restoreAnnounceBar();

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener("click", function () {
      setMenuOpen(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menuToggle && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
    }
  });

  if (locationBtn) {
    locationBtn.addEventListener("click", function () {
      locationText.textContent = "Fetching Location";
      simulateLocationFetch();
    });
  }

  simulateLocationFetch();
})();

(function () {
  "use strict";

  var hero = document.querySelector("[data-grc-hero]");
  if (!hero) return;

  var slides = hero.querySelectorAll(".grc-hero__slide");
  var currentIndex = 0;
  var timerId = null;
  var intervalMs = 10000;

  if (!slides.length) return;

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });
  }

  function scheduleAutoplay() {
    if (timerId) window.clearInterval(timerId);

    timerId = window.setInterval(function () {
      goTo(currentIndex + 1);
    }, intervalMs);
  }

  hero.addEventListener("mouseenter", function () {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  });

  hero.addEventListener("mouseleave", function () {
    scheduleAutoplay();
  });

  goTo(0);
  scheduleAutoplay();
})();

(function () {
  "use strict";

  function initProductSlider(section, config) {
    var viewport = section.querySelector(config.viewport);
    var track = section.querySelector(config.track);
    var cards = section.querySelectorAll(config.card);
    var prevBtn = section.querySelector(config.prev);
    var nextBtn = section.querySelector(config.next);

    if (!viewport || !track || !cards.length || !prevBtn || !nextBtn) return;

    var index = 0;

    function getStep() {
      var card = cards[0];
      if (!card) return 0;

      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || "16") || 16;
      return card.getBoundingClientRect().width + gap;
    }

    function getMaxIndex() {
      var step = getStep();
      if (!step) return 0;

      var visible = Math.max(1, Math.floor(viewport.getBoundingClientRect().width / step));
      return Math.max(0, cards.length - visible);
    }

    function updateControls() {
      var maxIndex = getMaxIndex();
      index = Math.max(0, Math.min(index, maxIndex));

      track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";

      prevBtn.hidden = index <= 0;
      nextBtn.hidden = index >= maxIndex;
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= maxIndex;
    }

    prevBtn.addEventListener("click", function () {
      index -= 1;
      updateControls();
    });

    nextBtn.addEventListener("click", function () {
      index += 1;
      updateControls();
    });

    section.addEventListener("grc:slider-refresh", updateControls);
    updateControls();

    return updateControls;
  }

  var sliders = [];

  var farm = document.querySelector("[data-grc-farm]");
  if (farm) {
    sliders.push(
      initProductSlider(farm, {
        viewport: "[data-grc-farm-viewport]",
        track: "[data-grc-farm-track]",
        card: ".grc-farm__card",
        prev: "[data-grc-farm-prev]",
        next: "[data-grc-farm-next]"
      })
    );
  }

  var essentials = document.querySelector("[data-grc-essentials]");
  if (essentials) {
    sliders.push(
      initProductSlider(essentials, {
        viewport: "[data-grc-essentials-viewport]",
        track: "[data-grc-essentials-track]",
        card: ".grc-essentials__card",
        prev: "[data-grc-essentials-prev]",
        next: "[data-grc-essentials-next]"
      })
    );
  }

  var promoCards = document.querySelector("[data-grc-promo-cards]");
  if (promoCards) {
    sliders.push(
      initProductSlider(promoCards, {
        viewport: "[data-grc-promo-cards-viewport]",
        track: "[data-grc-promo-cards-track]",
        card: ".grc-promo-cards__card",
        prev: "[data-grc-promo-cards-prev]",
        next: "[data-grc-promo-cards-next]"
      })
    );
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      sliders.forEach(function (refresh) {
        if (typeof refresh === "function") refresh();
      });
    }, 120);
  });
})();

(function () {
  "use strict";

  var footer = document.querySelector("[data-grc-footer]");
  if (!footer || footer.dataset.grcFooterReady) return;
  footer.dataset.grcFooterReady = "true";

  var items = footer.querySelectorAll("[data-grc-footer-item]");
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "power2.out";

  function showAll() {
    footer.classList.add("is-ready");
    items.forEach(function (el) {
      el.style.opacity = "";
      el.style.transform = "";
    });
  }

  if (!items.length || prefersReduced) {
    showAll();
    return;
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    showAll();
    return;
  }

  gsap.set(items, { y: 25, opacity: 0 });

  gsap.to(items, {
    y: 0,
    opacity: 1,
    duration: 0.7,
    stagger: 0.1,
    ease: EASE,
    scrollTrigger: {
      trigger: footer,
      start: "top 88%",
      once: true,
    },
    onComplete: showAll,
  });
})();

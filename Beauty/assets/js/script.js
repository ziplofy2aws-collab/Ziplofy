(function () {
  var toggle = document.querySelector("[data-sb-menu-toggle]");
  var closeBtn = document.querySelector("[data-sb-menu-close]");
  var menu = document.getElementById("sb-primary-nav");
  var overlay = document.querySelector("[data-sb-menu-overlay]");

  if (toggle && menu) {
    function setOpen(isOpen) {
      menu.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (overlay) overlay.hidden = !isOpen;
      document.body.style.overflow = isOpen ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("is-open"));
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setOpen(false);
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        setOpen(false);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setOpen(false);
    });
  }
})();

(function () {
  function initCarousel(section) {
    var viewport = section.querySelector("[data-sb-carousel-viewport]");
    var track = section.querySelector("[data-sb-carousel-track]");
    var cards = track ? track.querySelectorAll(".sb-bs-card") : [];
    var prevBtn = section.querySelector("[data-sb-carousel-prev]");
    var nextBtn = section.querySelector("[data-sb-carousel-next]");
    var progress = section.querySelector("[data-sb-carousel-progress]");
    var index = 0;

    if (!viewport || !track || !cards.length) return;

    function getGap() {
      var styles = window.getComputedStyle(track);
      return parseFloat(styles.gap || styles.columnGap || "16") || 16;
    }

    function isPdpYmalMobile() {
      return (
        section.hasAttribute("data-sb-pdp-ymal") &&
        window.matchMedia("(max-width: 992px)").matches
      );
    }

    function syncPdpYmalSlides() {
      if (!isPdpYmalMobile()) {
        cards.forEach(function (card) {
          card.style.flexBasis = "";
          card.style.width = "";
          card.style.maxWidth = "";
        });
        return;
      }

      var slideW = viewport.clientWidth;
      cards.forEach(function (card) {
        card.style.flexBasis = slideW + "px";
        card.style.width = slideW + "px";
        card.style.maxWidth = slideW + "px";
      });
    }

    function getStep() {
      if (isPdpYmalMobile()) {
        return viewport.clientWidth + getGap();
      }
      if (!cards[0]) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function getMaxIndex() {
      var step = getStep();
      if (!step) return 0;
      var visibleCount = Math.max(1, Math.floor((viewport.clientWidth + getGap()) / step));
      return Math.max(0, cards.length - visibleCount);
    }

    function isPdpYmalDesktop() {
      return (
        section.hasAttribute("data-sb-pdp-ymal") &&
        !window.matchMedia("(max-width: 992px)").matches
      );
    }

    function updateCarousel() {
      if (isPdpYmalDesktop()) {
        index = 0;
        syncPdpYmalSlides();
        track.style.transform = "none";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        if (progress) progress.style.width = "0%";
        return;
      }

      syncPdpYmalSlides();

      var maxIndex = getMaxIndex();
      if (index > maxIndex) index = maxIndex;

      var offset = index * getStep();
      track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex;

      if (progress) {
        var width =
          section.hasAttribute("data-sb-pdp-ymal") && cards.length > 1
            ? ((index + 1) / cards.length) * 100
            : maxIndex <= 0
              ? 100
              : (index / maxIndex) * 100;
        progress.style.width = width + "%";
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (index > 0) {
          index -= 1;
          updateCarousel();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (index < getMaxIndex()) {
          index += 1;
          updateCarousel();
        }
      });
    }

    window.addEventListener("resize", updateCarousel);
    updateCarousel();

    if (section.hasAttribute("data-sb-pdp-ymal")) {
      window.addEventListener("load", updateCarousel);
      requestAnimationFrame(function () {
        requestAnimationFrame(updateCarousel);
      });
    }
  }

  document.querySelectorAll("[data-sb-carousel]").forEach(initCarousel);
})();

(function () {
  function initSwipeRow(section, selectors) {
    if (!section) return;

    var viewport = section.querySelector(selectors.viewport);
    var track = section.querySelector(selectors.track);
    var progress = section.querySelector(selectors.progress);
    var cards = track ? track.querySelectorAll(selectors.card) : [];

    if (!viewport || !track || !cards.length) return;

    function isMobile() {
      return window.matchMedia("(max-width: 992px)").matches;
    }

    function getGap() {
      var styles = window.getComputedStyle(track);
      return parseFloat(styles.gap || styles.columnGap || "12") || 12;
    }

    function getSlideWidth() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function updateProgress() {
      if (!progress || !isMobile()) return;

      var slideWidth = getSlideWidth();
      if (!slideWidth) return;

      var index = Math.round(viewport.scrollLeft / slideWidth);
      var maxIndex = Math.max(0, cards.length - 1);
      if (index > maxIndex) index = maxIndex;

      var percent = cards.length <= 1 ? 100 : ((index + 1) / cards.length) * 100;
      progress.style.width = percent + "%";
    }

    viewport.addEventListener(
      "scroll",
      function () {
        window.requestAnimationFrame(updateProgress);
      },
      { passive: true }
    );

    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  function bootSwipeRows() {
    initSwipeRow(document.querySelector("[data-sb-hero]"), {
      viewport: "[data-sb-hero-viewport]",
      track: "[data-sb-hero-track]",
      progress: "[data-sb-hero-progress]",
      card: ".sb-hero__card",
    });
    initSwipeRow(document.querySelector("[data-sb-coupons]"), {
      viewport: "[data-sb-coupons-viewport]",
      track: "[data-sb-coupons-track]",
      progress: "[data-sb-coupons-progress]",
      card: ".sb-coupons__card",
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSwipeRows);
  } else {
    bootSwipeRows();
  }
})();

(function () {
  var accordions = document.querySelectorAll("[data-sb-footer-accordion]");
  if (!accordions.length) return;

  var mq = window.matchMedia("(max-width: 992px)");

  function closeAll(except) {
    accordions.forEach(function (item) {
      if (except && item === except) return;
      var btn = item.querySelector("[data-sb-footer-accordion-toggle]");
      var panel = item.querySelector("[data-sb-footer-accordion-panel]");
      if (!btn || !panel) return;
      btn.setAttribute("aria-expanded", "false");
      btn.classList.remove("is-open");
      panel.hidden = true;
    });
  }

  function applyMode() {
    accordions.forEach(function (item) {
      var btn = item.querySelector("[data-sb-footer-accordion-toggle]");
      var panel = item.querySelector("[data-sb-footer-accordion-panel]");
      if (!btn || !panel) return;

      if (mq.matches) {
        if (btn.getAttribute("aria-expanded") !== "true") {
          panel.hidden = true;
        }
      } else {
        btn.setAttribute("aria-expanded", "true");
        btn.classList.remove("is-open");
        panel.hidden = false;
      }
    });

    if (mq.matches) {
      closeAll(null);
    }
  }

  accordions.forEach(function (item) {
    var btn = item.querySelector("[data-sb-footer-accordion-toggle]");
    var panel = item.querySelector("[data-sb-footer-accordion-panel]");
    if (!btn || !panel) return;

    btn.addEventListener("click", function () {
      if (!mq.matches) return;

      var isOpen = btn.getAttribute("aria-expanded") === "true";
      closeAll(item);

      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        btn.classList.add("is-open");
        panel.hidden = false;
      } else {
        btn.setAttribute("aria-expanded", "false");
        btn.classList.remove("is-open");
        panel.hidden = true;
      }
    });
  });

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", applyMode);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(applyMode);
  }

  applyMode();
})();

(function () {
  var scrollTop = document.querySelector("[data-sb-scroll-top]");
  if (!scrollTop) return;

  scrollTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

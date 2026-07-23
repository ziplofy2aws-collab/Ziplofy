(function () {
  "use strict";

  function initHeroSlider() {
    var stage = document.querySelector(".hero__stage");
    var slides = document.querySelectorAll(".hero__slide");
    var prevBtn = document.querySelector(".hero__arrow--prev");
    var nextBtn = document.querySelector(".hero__arrow--next");
    if (!stage || slides.length < 2) return;

    var current = 0;
    var total = slides.length;
    var delay = 8000;
    var timer = null;
    var isTransitioning = false;

    function goTo(index) {
      if (isTransitioning) return;
      var next = ((index % total) + total) % total;
      if (next === current) return;

      isTransitioning = true;

      slides[current].classList.remove("is-active");
      slides[current].setAttribute("aria-hidden", "true");

      current = next;

      slides[current].classList.add("is-active");
      slides[current].setAttribute("aria-hidden", "false");

      window.setTimeout(function () {
        isTransitioning = false;
      }, 1000);
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function startAutoplay() {
      stopAutoplay();
      timer = window.setInterval(next, delay);
    }

    function stopAutoplay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        restartAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        restartAutoplay();
      });
    }

    stage.addEventListener("mouseenter", stopAutoplay);
    stage.addEventListener("mouseleave", startAutoplay);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    startAutoplay();
  }

  function initNewArrivalsSlider() {
    initProductSlider({
      viewport: ".na-slider__viewport",
      track: ".na-slider__track",
      cards: ".na-card",
      prevBtn: ".na-slider__btn--prev",
      nextBtn: ".na-slider__btn--next"
    });
  }

  function initBestSellersSlider() {
    initProductSlider({
      viewport: ".bs-slider__viewport",
      track: ".bs-slider__track",
      cards: ".bs-card",
      prevBtn: ".bs-slider__btn--prev",
      nextBtn: ".bs-slider__btn--next"
    });
  }

  function initProductSlider(config) {
    var viewport = document.querySelector(config.viewport);
    var track = document.querySelector(config.track);
    var cards = document.querySelectorAll(config.cards);
    var prevBtn = document.querySelector(config.prevBtn);
    var nextBtn = document.querySelector(config.nextBtn);
    if (!viewport || !track || !cards.length) return;

    var index = 0;

    function getVisibleCount() {
      var width = window.innerWidth;
      if (width <= 480) return 1;
      if (width <= 768) return 2;
      if (width <= 1024) return 3;
      return 4;
    }

    function getGap() {
      return window.innerWidth <= 768 ? 16 : 20;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    function getStep() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function update() {
      var max = getMaxIndex();
      index = Math.min(index, max);
      index = Math.max(0, index);

      var offset = index * getStep();
      track.style.transform = "translateX(-" + offset + "px)";

      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= max;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (index <= 0) return;
        index -= 1;
        update();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (index >= getMaxIndex()) return;
        index += 1;
        update();
      });
    }

    window.addEventListener("resize", update);
    update();
  }

  function initGallerySlider() {
    var viewport = document.querySelector(".gallery-slider__viewport");
    var track = document.querySelector(".gallery-slider__track");
    var cards = document.querySelectorAll(".gallery-card");
    var prevBtn = document.querySelector(".gallery-slider__btn--prev");
    var nextBtn = document.querySelector(".gallery-slider__btn--next");
    var dots = document.querySelectorAll(".gallery-slider__dot");
    if (!viewport || !track || !cards.length) return;

    var index = 0;
    var pageCount = dots.length || 4;

    function getVisibleCount() {
      var width = window.innerWidth;
      if (width <= 480) return 1;
      if (width <= 768) return 2;
      if (width <= 1024) return 3;
      return 4;
    }

    function getGap() {
      return 14;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    function getStep() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function updateDots() {
      var max = getMaxIndex();
      var page = max <= 0 ? 0 : Math.round((index / max) * (pageCount - 1));
      page = Math.min(pageCount - 1, Math.max(0, page));

      dots.forEach(function (dot, i) {
        var active = i === page;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    function update() {
      var max = getMaxIndex();
      index = Math.min(index, max);
      index = Math.max(0, index);

      track.style.transform = "translateX(-" + index * getStep() + "px)";

      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= max;
      updateDots();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (index <= 0) return;
        index -= 1;
        update();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (index >= getMaxIndex()) return;
        index += 1;
        update();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var page = parseInt(dot.getAttribute("data-page"), 10);
        if (Number.isNaN(page)) return;
        var max = getMaxIndex();
        index = pageCount <= 1 ? 0 : Math.round((page / (pageCount - 1)) * max);
        update();
      });
    });

    window.addEventListener("resize", update);
    update();
  }

  function init() {
    initMobileNav();
    initShopFilters();
    initHeroSlider();
    initYogaCatsSlider();
    initNewArrivalsSlider();
    initBestSellersSlider();
    initGallerySlider();
    initProductPage();
  }

  function initYogaCatsSlider() {
    var track = document.getElementById("yogaCatsTrack");
    var dotsWrap = document.getElementById("yogaCatsDots");
    if (!track || !dotsWrap) return;

    var cards = track.querySelectorAll(".yoga-cat");
    if (!cards.length) return;

    dotsWrap.innerHTML = "";
    cards.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "yoga-cats__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Go to category " + (i + 1));
      if (i === 0) dot.setAttribute("aria-current", "true");
      dot.addEventListener("click", function () {
        var left = cards[i].offsetLeft - track.offsetLeft;
        track.scrollTo({ left: left, behavior: "smooth" });
      });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll(".yoga-cats__dot");

    function updateDots() {
      if (window.innerWidth > 700) return;
      var scrollLeft = track.scrollLeft;
      var cardWidth = cards[0].offsetWidth + 14;
      var index = Math.round(scrollLeft / cardWidth);
      index = Math.max(0, Math.min(cards.length - 1, index));

      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateDots();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener("resize", updateDots);
  }

  function initShopFilters() {
    var filters = document.getElementById("shopFilters");
    var openBtn = document.getElementById("shopFilterOpen");
    var closeBtn = document.getElementById("shopFilterClose");
    var applyBtn = document.getElementById("shopFilterApply");
    var clearBtn = document.getElementById("shopFilterClear");
    var overlay = document.getElementById("shopFilterOverlay");
    if (!filters || !openBtn) return;

    function openFilters() {
      filters.classList.add("is-open");
      if (overlay) {
        overlay.hidden = false;
        overlay.classList.add("is-open");
      }
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("filter-open");
      if (closeBtn) closeBtn.focus();
    }

    function closeFilters() {
      filters.classList.remove("is-open");
      if (overlay) {
        overlay.classList.remove("is-open");
        window.setTimeout(function () {
          if (!filters.classList.contains("is-open")) overlay.hidden = true;
        }, 350);
      }
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("filter-open");
      openBtn.focus();
    }

    openBtn.addEventListener("click", function () {
      if (filters.classList.contains("is-open")) {
        closeFilters();
      } else {
        openFilters();
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeFilters);
    if (applyBtn) applyBtn.addEventListener("click", closeFilters);
    if (overlay) overlay.addEventListener("click", closeFilters);

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        filters.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
          input.checked = false;
        });
        filters.querySelectorAll(".shop-size.is-active, .shop-color.is-active").forEach(function (el) {
          el.classList.remove("is-active");
        });
      });
    }

    filters.querySelectorAll(".shop-size").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.querySelectorAll(".shop-size").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });

    filters.querySelectorAll(".shop-color").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.classList.toggle("is-active");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && filters.classList.contains("is-open")) {
        closeFilters();
      }
    });
  }

  function initMobileNav() {
    var nav = document.getElementById("mobileNav");
    var openBtn = document.getElementById("navMenuOpen");
    var closeBtn = document.getElementById("navMenuClose");
    var overlay = document.getElementById("navMenuOverlay");
    var panel = document.getElementById("mobileNavPanel");
    if (!nav || !openBtn || !panel) return;

    function openNav() {
      nav.classList.add("is-open");
      nav.setAttribute("aria-hidden", "false");
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      if (closeBtn) closeBtn.focus();
    }

    function closeNav() {
      nav.classList.remove("is-open");
      nav.setAttribute("aria-hidden", "true");
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      openBtn.focus();
    }

    openBtn.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeNav);
    if (overlay) overlay.addEventListener("click", closeNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
      }
    });

    nav.querySelectorAll(".mobile-nav__links a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  function initProductPage() {
    var mainImg = document.getElementById("pdpMainImage");
    var thumbs = document.querySelectorAll(".pdp-gallery__thumb");
    var swatches = document.querySelectorAll(".pdp-swatch");
    var colorName = document.getElementById("pdpColorName");
    var stickyColor = document.getElementById("pdpStickyColor");
    var stickySize = document.getElementById("pdpStickySize");
    var sizes = document.querySelectorAll(".pdp-size");

    if (!mainImg && !swatches.length) return;

    if (mainImg && thumbs.length) {
      thumbs.forEach(function (thumb) {
        thumb.addEventListener("click", function () {
          var src = thumb.getAttribute("data-full");
          if (!src) return;
          mainImg.src = src;
          thumbs.forEach(function (t) {
            t.classList.remove("is-active");
          });
          thumb.classList.add("is-active");
        });
      });
    }

    swatches.forEach(function (swatch) {
      swatch.addEventListener("click", function () {
        swatches.forEach(function (s) {
          s.classList.remove("is-active");
        });
        swatch.classList.add("is-active");
        var name = swatch.getAttribute("data-color") || "";
        if (colorName) colorName.textContent = name;
        if (stickyColor) stickyColor.textContent = name;
      });
    });

    sizes.forEach(function (size) {
      size.addEventListener("click", function () {
        sizes.forEach(function (s) {
          s.classList.remove("is-active");
        });
        size.classList.add("is-active");
        if (stickySize) {
          stickySize.textContent = size.getAttribute("data-size") || size.textContent.trim();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

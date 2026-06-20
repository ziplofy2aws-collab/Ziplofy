(function () {
  "use strict";

  var STORAGE_KEY = "sg-announce-dismissed";

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function initCountdown() {
    var hoursEl = document.getElementById("countHours");
    var minsEl = document.getElementById("countMins");
    var secsEl = document.getElementById("countSecs");
    if (!hoursEl || !minsEl || !secsEl) return;

    var end = new Date();
    end.setHours(23, 59, 59, 999);

    function tick() {
      var now = Date.now();
      var diff = Math.max(0, end - now);
      var totalSec = Math.floor(diff / 1000);
      var h = Math.floor(totalSec / 3600);
      var m = Math.floor((totalSec % 3600) / 60);
      var s = totalSec % 60;

      hoursEl.textContent = pad(h);
      minsEl.textContent = pad(m);
      secsEl.textContent = pad(s);
    }

    tick();
    setInterval(tick, 1000);
  }

  function initAnnounceClose() {
    var bar = document.getElementById("announceBar");
    var closeBtn = document.getElementById("announceClose");
    if (!bar || !closeBtn) return;

    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      bar.classList.add("is-hidden");
      return;
    }

    closeBtn.addEventListener("click", function () {
      bar.classList.add("is-hidden");
      sessionStorage.setItem(STORAGE_KEY, "1");
    });
  }

  function initHeroCarousel() {
    var slides = document.querySelectorAll(".hero-carousel__slide");
    var dots = document.querySelectorAll(".hero-carousel__dot");
    if (!slides.length || !dots.length) return;

    var current = 0;

    function goTo(index) {
      if (index < 0 || index >= slides.length || index === current) return;

      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      dots[current].removeAttribute("aria-current");

      current = index;

      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
      dots[current].setAttribute("aria-current", "true");
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-slide"), 10);
        if (!Number.isNaN(index)) goTo(index);
      });
    });
  }

  function initPopularLifting() {
    var carousel = document.querySelector(".pls-carousel");
    var track = document.querySelector(".pls-track");
    var cards = document.querySelectorAll(".pls-card");
    var prevBtn = document.querySelector(".pls-nav__btn--prev");
    var nextBtn = document.querySelector(".pls-nav__btn--next");
    if (!carousel || !track || !cards.length) return;

    var offset = 0;
    var gap = 14;

    function getStep() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth + gap;
    }

    function getMaxOffset() {
      return Math.max(0, track.scrollWidth - carousel.clientWidth);
    }

    function update() {
      var max = getMaxOffset();
      offset = Math.min(max, Math.max(0, offset));
      track.style.transform = "translateX(-" + offset + "px)";

      if (prevBtn) prevBtn.disabled = offset <= 1;
      if (nextBtn) nextBtn.disabled = offset >= max - 1;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        offset -= getStep();
        update();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        offset += getStep();
        update();
      });
    }

    document.querySelectorAll(".pls-card__wish").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    window.addEventListener("resize", update);
    update();
  }

  function initCollection() {
    var carousel = document.querySelector(".coll-carousel");
    var track = document.querySelector(".coll-track");
    var cards = document.querySelectorAll(".coll-card");
    var prevBtn = document.querySelector(".coll-nav--prev");
    var nextBtn = document.querySelector(".coll-nav--next");
    if (!carousel || !track || !cards.length) return;

    var gap = 16;
    var offset = 0;
    var currentIndex = 0;
    var mq = window.matchMedia("(max-width: 768px)");

    function isMobileCarousel() {
      return mq.matches;
    }

    function getStep() {
      if (!cards[0]) return 0;
      return isMobileCarousel() ? cards[0].offsetWidth : cards[0].offsetWidth + gap;
    }

    function getMaxOffset() {
      return Math.max(0, track.scrollWidth - carousel.clientWidth);
    }

    function setTransform(px, animate) {
      if (!animate) track.classList.add("is-dragging");
      else track.classList.remove("is-dragging");
      track.style.transform = "translateX(-" + px + "px)";
    }

    function goToMobile(index, animate) {
      currentIndex = Math.max(0, Math.min(cards.length - 1, index));
      setTransform(currentIndex * getStep(), animate !== false);
    }

    function updateDesktop() {
      var max = getMaxOffset();
      offset = Math.min(max, Math.max(0, offset));
      track.classList.remove("is-dragging");
      track.style.transform = "translateX(-" + offset + "px)";
      if (prevBtn) prevBtn.disabled = offset <= 1;
      if (nextBtn) nextBtn.disabled = offset >= max - 1;
    }

    function update() {
      if (isMobileCarousel()) {
        goToMobile(currentIndex, false);
      } else {
        currentIndex = 0;
        updateDesktop();
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        offset -= getStep();
        updateDesktop();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        offset += getStep();
        updateDesktop();
      });
    }

    var pointer = {
      active: false,
      startX: 0,
      startY: 0,
      deltaX: 0,
      locked: false
    };

    function onPointerDown(clientX, clientY) {
      if (!isMobileCarousel()) return;
      pointer.active = true;
      pointer.startX = clientX;
      pointer.startY = clientY;
      pointer.deltaX = 0;
      pointer.locked = false;
    }

    function onPointerMove(clientX, clientY, ev) {
      if (!pointer.active || !isMobileCarousel()) return;

      var dx = clientX - pointer.startX;
      var dy = clientY - pointer.startY;

      if (!pointer.locked) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          pointer.active = false;
          return;
        }
        pointer.locked = true;
      }

      if (ev && ev.cancelable) ev.preventDefault();
      pointer.deltaX = dx;

      var base = currentIndex * getStep();
      var next = base - dx;
      var max = (cards.length - 1) * getStep();
      if (next < 0) next *= 0.35;
      else if (next > max) next = max + (next - max) * 0.35;

      setTransform(next, false);
    }

    function onPointerUp() {
      if (!pointer.active) return;
      pointer.active = false;

      if (!pointer.locked || !isMobileCarousel()) {
        goToMobile(currentIndex, true);
        return;
      }

      var threshold = getStep() * 0.2;
      if (Math.abs(pointer.deltaX) > 10) {
        carousel.setAttribute("data-swiped", "1");
        window.setTimeout(function () {
          carousel.removeAttribute("data-swiped");
        }, 350);
      }

      if (pointer.deltaX < -threshold && currentIndex < cards.length - 1) {
        goToMobile(currentIndex + 1, true);
      } else if (pointer.deltaX > threshold && currentIndex > 0) {
        goToMobile(currentIndex - 1, true);
      } else {
        goToMobile(currentIndex, true);
      }
    }

    carousel.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchmove",
      function (e) {
        if (!pointer.active || e.touches.length !== 1) return;
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY, e);
      },
      { passive: false }
    );

    carousel.addEventListener("touchend", onPointerUp);
    carousel.addEventListener("touchcancel", onPointerUp);

    carousel.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      onPointerDown(e.clientX, e.clientY);
    });

    window.addEventListener("mousemove", function (e) {
      if (!pointer.active) return;
      onPointerMove(e.clientX, e.clientY, e);
    });

    window.addEventListener("mouseup", onPointerUp);

    mq.addEventListener("change", function () {
      currentIndex = 0;
      offset = 0;
      update();
    });

    window.addEventListener("resize", update);
    update();
  }

  function initAccessories() {
    var carousel = document.querySelector(".acc-carousel");
    var track = document.querySelector(".acc-track");
    var cards = document.querySelectorAll(".acc-card");
    var prevBtn = document.querySelector(".acc-nav--prev");
    var nextBtn = document.querySelector(".acc-nav--next");
    if (!carousel || !track || !cards.length) return;

    var gap = 16;
    var offset = 0;
    var currentIndex = 0;
    var mq = window.matchMedia("(max-width: 768px)");

    function isMobileCarousel() {
      return mq.matches;
    }

    function getStep() {
      if (!cards[0]) return 0;
      return isMobileCarousel() ? cards[0].offsetWidth : cards[0].offsetWidth + gap;
    }

    function getMaxOffset() {
      return Math.max(0, track.scrollWidth - carousel.clientWidth);
    }

    function setTransform(px, animate) {
      if (!animate) track.classList.add("is-dragging");
      else track.classList.remove("is-dragging");
      track.style.transform = "translateX(-" + px + "px)";
    }

    function goToMobile(index, animate) {
      currentIndex = Math.max(0, Math.min(cards.length - 1, index));
      setTransform(currentIndex * getStep(), animate !== false);
    }

    function updateDesktop() {
      var max = getMaxOffset();
      offset = Math.min(max, Math.max(0, offset));
      track.classList.remove("is-dragging");
      track.style.transform = "translateX(-" + offset + "px)";
      if (prevBtn) prevBtn.disabled = offset <= 1;
      if (nextBtn) nextBtn.disabled = offset >= max - 1;
    }

    function update() {
      if (isMobileCarousel()) {
        goToMobile(currentIndex, false);
      } else {
        currentIndex = 0;
        updateDesktop();
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        offset -= getStep();
        updateDesktop();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        offset += getStep();
        updateDesktop();
      });
    }

    var pointer = {
      active: false,
      startX: 0,
      startY: 0,
      deltaX: 0,
      locked: false
    };

    function onPointerDown(clientX, clientY) {
      if (!isMobileCarousel()) return;
      pointer.active = true;
      pointer.startX = clientX;
      pointer.startY = clientY;
      pointer.deltaX = 0;
      pointer.locked = false;
    }

    function onPointerMove(clientX, clientY, ev) {
      if (!pointer.active || !isMobileCarousel()) return;

      var dx = clientX - pointer.startX;
      var dy = clientY - pointer.startY;

      if (!pointer.locked) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          pointer.active = false;
          return;
        }
        pointer.locked = true;
      }

      if (ev && ev.cancelable) ev.preventDefault();
      pointer.deltaX = dx;

      var base = currentIndex * getStep();
      var next = base - dx;
      var max = (cards.length - 1) * getStep();
      if (next < 0) next *= 0.35;
      else if (next > max) next = max + (next - max) * 0.35;

      setTransform(next, false);
    }

    function onPointerUp() {
      if (!pointer.active) return;
      pointer.active = false;

      if (!pointer.locked || !isMobileCarousel()) {
        goToMobile(currentIndex, true);
        return;
      }

      var threshold = getStep() * 0.2;
      if (Math.abs(pointer.deltaX) > 10) {
        carousel.setAttribute("data-swiped", "1");
        window.setTimeout(function () {
          carousel.removeAttribute("data-swiped");
        }, 350);
      }

      if (pointer.deltaX < -threshold && currentIndex < cards.length - 1) {
        goToMobile(currentIndex + 1, true);
      } else if (pointer.deltaX > threshold && currentIndex > 0) {
        goToMobile(currentIndex - 1, true);
      } else {
        goToMobile(currentIndex, true);
      }
    }

    carousel.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchmove",
      function (e) {
        if (!pointer.active || e.touches.length !== 1) return;
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY, e);
      },
      { passive: false }
    );

    carousel.addEventListener("touchend", onPointerUp);
    carousel.addEventListener("touchcancel", onPointerUp);

    carousel.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      onPointerDown(e.clientX, e.clientY);
    });

    window.addEventListener("mousemove", function (e) {
      if (!pointer.active) return;
      onPointerMove(e.clientX, e.clientY, e);
    });

    window.addEventListener("mouseup", onPointerUp);

    mq.addEventListener("change", function () {
      currentIndex = 0;
      offset = 0;
      update();
    });

    window.addEventListener("resize", update);
    update();
  }

  function initNewArrivals() {
    var tabs = document.querySelectorAll(".na-tab");
    var carousel = document.querySelector(".na-carousel");
    var track = document.querySelector(".na-grid");
    var cards = document.querySelectorAll(".na-card");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        tabs.forEach(function (t) {
          t.classList.remove("is-active");
        });
        tab.classList.add("is-active");
      });
    });

    document.querySelectorAll(".na-card__wish").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    if (!carousel || !track || !cards.length) return;

    var currentIndex = 0;
    var mq = window.matchMedia("(max-width: 768px)");

    function isMobileCarousel() {
      return mq.matches;
    }

    function getStep() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth;
    }

    function setTransform(px, animate) {
      if (!animate) track.classList.add("is-dragging");
      else track.classList.remove("is-dragging");
      track.style.transform = "translateX(-" + px + "px)";
    }

    function goTo(index, animate) {
      if (!isMobileCarousel()) {
        track.style.transform = "";
        track.classList.remove("is-dragging");
        return;
      }

      currentIndex = Math.max(0, Math.min(cards.length - 1, index));
      setTransform(currentIndex * getStep(), animate !== false);
    }

    var pointer = {
      active: false,
      startX: 0,
      startY: 0,
      deltaX: 0,
      locked: false
    };

    function onPointerDown(clientX, clientY) {
      if (!isMobileCarousel()) return;
      pointer.active = true;
      pointer.startX = clientX;
      pointer.startY = clientY;
      pointer.deltaX = 0;
      pointer.locked = false;
    }

    function onPointerMove(clientX, clientY, ev) {
      if (!pointer.active || !isMobileCarousel()) return;

      var dx = clientX - pointer.startX;
      var dy = clientY - pointer.startY;

      if (!pointer.locked) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          pointer.active = false;
          return;
        }
        pointer.locked = true;
      }

      if (ev && ev.cancelable) ev.preventDefault();
      pointer.deltaX = dx;

      var base = currentIndex * getStep();
      var next = base - dx;
      var max = (cards.length - 1) * getStep();
      if (next < 0) next *= 0.35;
      else if (next > max) next = max + (next - max) * 0.35;

      setTransform(next, false);
    }

    function onPointerUp() {
      if (!pointer.active) return;
      pointer.active = false;

      if (!pointer.locked || !isMobileCarousel()) {
        goTo(currentIndex, true);
        return;
      }

      var threshold = getStep() * 0.2;
      if (Math.abs(pointer.deltaX) > 10) {
        carousel.setAttribute("data-swiped", "1");
        window.setTimeout(function () {
          carousel.removeAttribute("data-swiped");
        }, 350);
      }

      if (pointer.deltaX < -threshold && currentIndex < cards.length - 1) {
        goTo(currentIndex + 1, true);
      } else if (pointer.deltaX > threshold && currentIndex > 0) {
        goTo(currentIndex - 1, true);
      } else {
        goTo(currentIndex, true);
      }
    }

    carousel.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchmove",
      function (e) {
        if (!pointer.active || e.touches.length !== 1) return;
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY, e);
      },
      { passive: false }
    );

    carousel.addEventListener("touchend", onPointerUp);
    carousel.addEventListener("touchcancel", onPointerUp);

    carousel.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      onPointerDown(e.clientX, e.clientY);
    });

    window.addEventListener("mousemove", function (e) {
      if (!pointer.active) return;
      onPointerMove(e.clientX, e.clientY, e);
    });

    window.addEventListener("mouseup", onPointerUp);

    mq.addEventListener("change", function () {
      currentIndex = 0;
      goTo(0, false);
    });

    window.addEventListener("resize", function () {
      goTo(currentIndex, false);
    });

    goTo(0, false);
  }

  function assignProductIds(selector, ids) {
    document.querySelectorAll(selector).forEach(function (card, index) {
      if (ids[index]) {
        card.setAttribute("data-product-id", ids[index]);
      }
    });
  }

  function initProductCardLinks() {
    if (!window.ProductCatalog) return;

    var catalog = window.ProductCatalog;

    assignProductIds(".na-card", [
      "revolve-glass-white",
      "revolve-community-black",
      "revolve-community-white",
      "revolve-script-black"
    ]);

    assignProductIds(".pls-card", [
      "power-tshirt-red",
      "power-tshirt-blue",
      "element-tank",
      "ribbed-tank"
    ]);

    assignProductIds(".coll-card", [
      "alx-grid-cargo",
      "alx-compression-sleeve-black",
      "alx-compression-tee",
      "alx-compression-sleeve-beige"
    ]);

    assignProductIds(".acc-card", [
      "roll-top-bag",
      "steel-tumbler",
      "coffee-mug",
      "hydra-bottle"
    ]);

    assignProductIds(".pdp-look__card", [
      "python-flex-duo",
      "seamless-division-set",
      "ash-relaxed-duo",
      "levitate-edge-duo"
    ]);

    assignProductIds(".pdp-complete__card", ["stride-straight-pants", "camoflex-t-shirt"]);

    var cardSelectors = [
      ".cat-card",
      ".na-card",
      ".pls-card",
      ".coll-card",
      ".acc-card",
      ".pdp-look__card",
      ".pdp-complete__card"
    ];

    document.querySelectorAll(cardSelectors.join(",")).forEach(function (card) {
      var id = catalog.getProductIdFromCard(card);
      if (!id || !catalog.PRODUCTS[id]) return;

      var url = catalog.getProductUrl(id);
      card.setAttribute("data-product-id", id);

      card.querySelectorAll("a[href]").forEach(function (link) {
        if (
          link.classList.contains("cat-card__emi-btn") ||
          link.classList.contains("pdp-look__emi-btn") ||
          link.closest(".pdp-share")
        ) {
          return;
        }
        link.setAttribute("href", url);
      });

      card.addEventListener("click", function (e) {
        var swipeCarousel = card.closest(".na-carousel, .coll-carousel, .acc-carousel, .pdp-look__carousel");
        if (swipeCarousel && swipeCarousel.getAttribute("data-swiped") === "1") return;

        if (
          e.target.closest("button") ||
          e.target.closest(".cat-card__emi-btn") ||
          e.target.closest(".pdp-look__emi-btn") ||
          e.target.closest(".na-card__wish") ||
          e.target.closest(".pls-card__wish")
        ) {
          return;
        }
        if (e.target.closest("a")) {
          return;
        }
        window.location.href = url;
      });
    });
  }

  function initMobileNav() {
    var nav = document.getElementById("mobileNav");
    var openBtn = document.getElementById("navMenuOpen");
    var closeBtn = document.getElementById("navMenuClose");
    var overlay = document.getElementById("mobileNavOverlay");
    if (!nav || !openBtn) return;

    function setOpen(isOpen) {
      nav.classList.toggle("is-open", isOpen);
      nav.setAttribute("aria-hidden", isOpen ? "false" : "true");
      openBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("is-nav-open", isOpen);
    }

    function openNav() {
      setOpen(true);
    }

    function closeNav() {
      setOpen(false);
    }

    openBtn.addEventListener("click", openNav);

    if (closeBtn) closeBtn.addEventListener("click", closeNav);
    if (overlay) overlay.addEventListener("click", closeNav);

    nav.querySelectorAll(".mobile-nav__links a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) closeNav();
    });
  }

  function initCategoryFilter() {
    var filter = document.getElementById("catFilter");
    var panel = document.getElementById("catFilterPanel");
    var openBtn = document.getElementById("catFilterOpen");
    var closeBtn = document.getElementById("catFilterClose");
    var overlay = document.getElementById("catFilterOverlay");
    var applyBtn = document.getElementById("catFilterApply");
    var priceMin = document.getElementById("catPriceMin");
    var priceMax = document.getElementById("catPriceMax");
    var priceFill = document.getElementById("catPriceFill");
    var priceMinLabel = document.getElementById("catPriceMinLabel");
    var priceMaxLabel = document.getElementById("catPriceMaxLabel");

    if (!filter || !panel || !openBtn) return;

    function setOpen(isOpen) {
      filter.classList.toggle("is-open", isOpen);
      filter.setAttribute("aria-hidden", isOpen ? "false" : "true");
      openBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("is-filter-open", isOpen);
    }

    function openFilter() {
      setOpen(true);
    }

    function closeFilter() {
      setOpen(false);
    }

    function updatePriceRange() {
      if (!priceMin || !priceMax || !priceFill) return;

      var minVal = parseInt(priceMin.value, 10);
      var maxVal = parseInt(priceMax.value, 10);
      var max = parseInt(priceMax.max, 10) || 1799;

      if (minVal > maxVal) {
        if (document.activeElement === priceMin) {
          maxVal = minVal;
          priceMax.value = String(maxVal);
        } else {
          minVal = maxVal;
          priceMin.value = String(minVal);
        }
      }

      if (priceMinLabel) priceMinLabel.textContent = String(minVal);
      if (priceMaxLabel) priceMaxLabel.textContent = String(maxVal);

      var left = (minVal / max) * 100;
      var right = 100 - (maxVal / max) * 100;
      priceFill.style.left = left + "%";
      priceFill.style.right = right + "%";
    }

    openBtn.addEventListener("click", openFilter);
    if (closeBtn) closeBtn.addEventListener("click", closeFilter);
    if (overlay) overlay.addEventListener("click", closeFilter);
    if (applyBtn) applyBtn.addEventListener("click", closeFilter);

    if (priceMin) priceMin.addEventListener("input", updatePriceRange);
    if (priceMax) priceMax.addEventListener("input", updatePriceRange);
    updatePriceRange();

    filter.querySelectorAll(".cat-filter__more").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.closest(".cat-filter__group");
        if (group) group.classList.add("is-expanded");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && filter.classList.contains("is-open")) closeFilter();
    });
  }

  function initCategoryGrid() {
    var grid = document.getElementById("catGrid");
    var buttons = document.querySelectorAll(".cat-toolbar__grid-btn");
    if (!grid || !buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cols = btn.getAttribute("data-cols");
        if (!cols) return;

        buttons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");

        grid.classList.remove("cat-grid--cols-2", "cat-grid--cols-3", "cat-grid--cols-4");
        grid.classList.add("cat-grid--cols-" + cols);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCountdown();
    initAnnounceClose();
    initMobileNav();
    initHeroCarousel();
    initNewArrivals();
    initPopularLifting();
    initCollection();
    initAccessories();
    initCategoryGrid();
    initCategoryFilter();
    initProductCardLinks();
  });
})();

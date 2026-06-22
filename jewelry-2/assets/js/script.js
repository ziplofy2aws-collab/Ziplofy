(function () {
  var toggle = document.querySelector("[data-jw2-menu-toggle]");
  var closeBtn = document.querySelector("[data-jw2-menu-close]");
  var overlay = document.querySelector("[data-jw2-menu-overlay]");
  var mobileNav = document.getElementById("jw2-mobile-nav");

  if (!toggle || !mobileNav) return;

  function openMenu() {
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("jw2-menu-open");
    if (overlay) overlay.hidden = false;
  }

  function closeMenu() {
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("jw2-menu-open");
    if (overlay) overlay.hidden = true;
  }

  toggle.addEventListener("click", function () {
    if (mobileNav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
      closeMenu();
    }
  });
})();

(function () {
  var heroRoot = document.querySelector("[data-jw2-hero-slider]");
  if (!heroRoot) return;

  var slides = heroRoot.querySelectorAll("[data-jw2-hero-slide]");
  if (slides.length < 2) return;

  var activeIndex = 0;
  var timerId = null;
  var intervalMs = 7000;

  function goToSlide(index) {
    slides[activeIndex].classList.remove("is-active");
    activeIndex = (index + slides.length) % slides.length;
    slides[activeIndex].classList.add("is-active");
  }

  function scheduleAutoplay() {
    if (timerId) window.clearInterval(timerId);
    timerId = window.setInterval(function () {
      goToSlide(activeIndex + 1);
    }, intervalMs);
  }

  heroRoot.addEventListener("mouseenter", function () {
    if (timerId) window.clearInterval(timerId);
  });

  heroRoot.addEventListener("mouseleave", scheduleAutoplay);

  scheduleAutoplay();
})();

(function () {
  var root = document.querySelector("[data-jw2-crafted-carousel]");
  if (!root) return;

  var track = root.querySelector("[data-jw2-crafted-track]");
  var viewport = root.querySelector("[data-jw2-crafted-viewport]");
  var cards = track ? track.querySelectorAll(".jw2-pcard") : [];
  var prevBtn = root.querySelector("[data-jw2-crafted-prev]");
  var nextBtn = root.querySelector("[data-jw2-crafted-next]");

  if (!track || !viewport || !cards.length) return;

  var page = 0;

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap || "0") || 20;
  }

  function getStep() {
    if (!cards.length) return 0;
    return cards[0].offsetWidth + getGap();
  }

  function getVisibleCount() {
    var step = getStep();
    if (!step) return 1;
    return Math.max(1, Math.floor((viewport.offsetWidth + getGap()) / step));
  }

  function getMaxPage() {
    var visible = getVisibleCount();
    return Math.max(0, Math.ceil(cards.length / visible) - 1);
  }

  function update() {
    var maxPage = getMaxPage();
    if (page > maxPage) page = maxPage;

    var visible = getVisibleCount();
    var offset = page * visible * getStep();
    track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

    if (prevBtn) prevBtn.disabled = page <= 0;
    if (nextBtn) nextBtn.disabled = page >= maxPage;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (page > 0) {
        page -= 1;
        update();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (page < getMaxPage()) {
        page += 1;
        update();
      }
    });
  }

  window.addEventListener("resize", function () {
    page = Math.min(page, getMaxPage());
    update();
  });
  window.addEventListener("load", update);

  cards.forEach(function (card) {
    card.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("load", update);
    });
  });

  update();
})();

(function () {
  var root = document.querySelector("[data-jw2-coll-carousel]");
  if (!root) return;

  var track = root.querySelector("[data-jw2-coll-track]");
  var viewport = root.querySelector("[data-jw2-coll-viewport]");
  var cards = track ? track.querySelectorAll(".jw2-coll-card") : [];
  var prevBtn = root.querySelector("[data-jw2-coll-prev]");
  var nextBtn = root.querySelector("[data-jw2-coll-next]");

  if (!track || !viewport || !cards.length) return;

  var index = 0;

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap || "0") || 18;
  }

  function getStep() {
    if (!cards.length) return 0;
    return cards[0].offsetWidth + getGap();
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function getMaxIndex() {
    var step = getStep();
    if (!step) return 0;

    var maxOffset = getMaxOffset();
    if (maxOffset <= 1) return 0;

    return Math.ceil(maxOffset / step);
  }

  function isAtEnd() {
    var step = getStep();
    if (!step) return true;

    return index * step >= getMaxOffset() - 2;
  }

  function update() {
    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;

    var step = getStep();
    var offset = Math.min(index * step, getMaxOffset());
    track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = isAtEnd();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (index > 0) {
        index -= 1;
        update();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!isAtEnd()) {
        index += 1;
        update();
      }
    });
  }

  window.addEventListener("resize", update);
  window.addEventListener("load", update);

  cards.forEach(function (card) {
    card.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("load", update);
    });
  });

  update();
})();

(function () {
  var root = document.querySelector("[data-jw2-bs-carousel]");
  if (!root) return;

  var track = root.querySelector("[data-jw2-bs-track]");
  var viewport = root.querySelector("[data-jw2-bs-viewport]");
  var cards = track ? track.querySelectorAll(".jw2-pcard") : [];
  var prevBtn = root.querySelector("[data-jw2-bs-prev]");
  var nextBtn = root.querySelector("[data-jw2-bs-next]");

  if (!track || !viewport || !cards.length) return;

  var page = 0;

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap || "0") || 20;
  }

  function getStep() {
    if (!cards.length) return 0;
    return cards[0].offsetWidth + getGap();
  }

  function getVisibleCount() {
    var step = getStep();
    if (!step) return 1;
    return Math.max(1, Math.floor((viewport.offsetWidth + getGap()) / step));
  }

  function getMaxPage() {
    var visible = getVisibleCount();
    return Math.max(0, Math.ceil(cards.length / visible) - 1);
  }

  function update() {
    var maxPage = getMaxPage();
    if (page > maxPage) page = maxPage;

    var visible = getVisibleCount();
    var offset = page * visible * getStep();
    track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

    if (prevBtn) prevBtn.disabled = page <= 0;
    if (nextBtn) nextBtn.disabled = page >= maxPage;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (page > 0) {
        page -= 1;
        update();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (page < getMaxPage()) {
        page += 1;
        update();
      }
    });
  }

  window.addEventListener("resize", function () {
    page = Math.min(page, getMaxPage());
    update();
  });
  window.addEventListener("load", update);

  cards.forEach(function (card) {
    card.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("load", update);
    });
  });

  update();
})();

(function () {
  var root = document.querySelector("[data-jw2-testimonials]");
  if (!root) return;

  var track = root.querySelector("[data-jw2-testimonials-track]");
  var viewport = root.querySelector("[data-jw2-testimonials-viewport]");
  var cards = track ? track.querySelectorAll(".jw2-testimonials__card") : [];
  var prevBtn = root.querySelector("[data-jw2-testimonials-prev]");
  var nextBtn = root.querySelector("[data-jw2-testimonials-next]");

  if (!track || !viewport || !cards.length) return;

  var index = 0;

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap || "0") || 18;
  }

  function getStep() {
    if (!cards.length) return 0;
    return cards[0].offsetWidth + getGap();
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function isAtEnd() {
    var step = getStep();
    if (!step) return true;
    return index * step >= getMaxOffset() - 2;
  }

  function update() {
    var step = getStep();
    var offset = Math.min(index * step, getMaxOffset());
    track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = isAtEnd();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (index > 0) {
        index -= 1;
        update();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!isAtEnd()) {
        index += 1;
        update();
      }
    });
  }

  window.addEventListener("resize", update);
  window.addEventListener("load", update);

  cards.forEach(function (card) {
    card.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("load", update);
    });
  });

  update();
})();

(function () {
  var scrollBtn = document.querySelector("[data-jw2-scroll-top]");
  if (!scrollBtn) return;

  function toggleScrollBtn() {
    scrollBtn.hidden = window.scrollY <= 400;
  }

  scrollBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggleScrollBtn, { passive: true });
  toggleScrollBtn();
})();

(function () {
  var shop = document.querySelector("[data-jw2-shop]");
  if (!shop) return;

  var filterToggle = shop.querySelector("[data-jw2-shop-filter-toggle]");
  var filterClose = shop.querySelector("[data-jw2-shop-filter-close]");
  var filterOverlay = shop.querySelector("[data-jw2-shop-filter-overlay]");
  var filters = shop.querySelector("#jw2-shop-filters");
  var clearBtn = shop.querySelector(".jw2-shop__filters-clear");
  var grid = shop.querySelector(".jw2-shop__grid");
  var viewBtns = shop.querySelectorAll("[data-jw2-shop-view]");

  function openFilters() {
    if (!filters) return;
    filters.classList.add("is-open");
    filters.setAttribute("aria-hidden", "false");
    if (filterToggle) filterToggle.setAttribute("aria-expanded", "true");
    if (filterOverlay) filterOverlay.removeAttribute("hidden");
    document.body.classList.add("jw2-shop-filter-open");
  }

  function closeFilters() {
    if (!filters) return;
    filters.classList.remove("is-open");
    filters.setAttribute("aria-hidden", "true");
    if (filterToggle) filterToggle.setAttribute("aria-expanded", "false");
    if (filterOverlay) filterOverlay.setAttribute("hidden", "");
    document.body.classList.remove("jw2-shop-filter-open");
  }

  if (filterToggle && filters) {
    filterToggle.addEventListener("click", function () {
      if (filters.classList.contains("is-open")) {
        closeFilters();
      } else {
        openFilters();
      }
    });
  }

  if (filterClose) {
    filterClose.addEventListener("click", closeFilters);
  }

  if (filterOverlay) {
    filterOverlay.addEventListener("click", closeFilters);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && filters && filters.classList.contains("is-open")) {
      closeFilters();
    }
  });

  if (clearBtn && filters) {
    clearBtn.addEventListener("click", function () {
      filters.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
        input.checked = false;
      });
    });
  }

  if (grid && viewBtns.length) {
    viewBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var view = btn.getAttribute("data-jw2-shop-view");
        viewBtns.forEach(function (b) {
          var isActive = b === btn;
          b.classList.toggle("is-active", isActive);
          b.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        grid.classList.toggle("is-list-view", view === "list");
      });
    });
  }
})();

(function () {
  var gallery = document.querySelector("[data-jw2-pdp-gallery]");
  if (!gallery) return;

  var tiles = gallery.querySelectorAll(".jw2-pdp__media-tile");

  tiles.forEach(function (tile) {
    tile.addEventListener("click", function () {
      tiles.forEach(function (t) {
        t.classList.remove("is-active");
      });
      tile.classList.add("is-active");
    });
  });
})();

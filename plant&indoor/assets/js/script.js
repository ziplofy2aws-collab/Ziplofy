(function () {
  var toggle = document.querySelector("[data-pi-menu-toggle]");
  var closeBtn = document.querySelector("[data-pi-menu-close]");
  var nav = document.querySelector(".pi-header__nav");
  var overlay = document.querySelector("[data-pi-menu-overlay]");

  if (!toggle || !nav) return;

  function openMenu() {
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    if (overlay) overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", function () {
    if (nav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) closeMenu();
  });
})();

(function () {
  var root = document.querySelector("[data-pi-hero-slider]");
  if (!root) return;

  var viewport = root.querySelector(".pi-hero__viewport");
  var track = root.querySelector("[data-pi-hero-track]");
  var slides = root.querySelectorAll("[data-pi-hero-slide]");
  var dots = root.querySelectorAll("[data-pi-hero-dot]");
  if (!viewport || !track || slides.length === 0) return;

  var total = slides.length;
  var index = 0;
  var timerId = null;
  var intervalMs = 5500;

  function slideWidth() {
    return viewport.getBoundingClientRect().width;
  }

  function syncSlides() {
    var w = slideWidth();
    if (w <= 0) return;
    slides.forEach(function (slide) {
      slide.style.flex = "0 0 " + w + "px";
      slide.style.width = w + "px";
      slide.style.minWidth = w + "px";
    });
  }

  function goTo(i) {
    syncSlides();
    var w = slideWidth();
    index = ((i % total) + total) % total;
    if (w > 0) {
      track.style.transform = "translate3d(-" + index * w + "px, 0, 0)";
    }
    dots.forEach(function (dot, di) {
      var active = di === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
      dot.setAttribute("tabindex", active ? "0" : "-1");
    });
  }

  function schedule() {
    if (timerId) window.clearInterval(timerId);
    timerId = window.setInterval(function () {
      goTo(index + 1);
    }, intervalMs);
  }

  function restart(i) {
    goTo(i);
    schedule();
  }

  dots.forEach(function (dot, di) {
    dot.addEventListener("click", function () {
      restart(di);
    });
    dot.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        restart(di);
      }
    });
  });

  root.addEventListener("mouseenter", function () {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  });

  root.addEventListener("mouseleave", schedule);

  function onResize() {
    goTo(index);
  }

  window.addEventListener("resize", onResize);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(onResize).observe(viewport);
  }

  goTo(0);
  schedule();
})();

(function () {
  var picksSection = document.querySelector("[data-pi-picks]");
  if (!picksSection) return;

  picksSection.querySelectorAll(".pi-picks-card__size-btns").forEach(function (group) {
    group.addEventListener("click", function (event) {
      var btn = event.target.closest(".pi-picks-card__size");
      if (!btn || !group.contains(btn)) return;
      group.querySelectorAll(".pi-picks-card__size").forEach(function (sizeBtn) {
        sizeBtn.classList.remove("is-active");
      });
      btn.classList.add("is-active");
    });
  });

  var viewport = picksSection.querySelector("[data-pi-picks-viewport]");
  var track = picksSection.querySelector("[data-pi-picks-track]");
  var prevBtn = picksSection.querySelector("[data-pi-picks-prev]");
  var nextBtn = picksSection.querySelector("[data-pi-picks-next]");
  var viewAllBtn = picksSection.querySelector("[data-pi-picks-view-all]");
  var cards = track ? track.querySelectorAll(".pi-picks-card") : [];
  var index = 0;

  function getVisibleCount() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 4;
  }

  function getGap() {
    if (!track) return 20;
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap || "20") || 20;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  function setArrowState(btn, disabled) {
    if (!btn) return;
    btn.disabled = disabled;
    btn.classList.toggle("is-disabled", disabled);
  }

  function updateCarousel() {
    if (!viewport || !track || !cards.length) return;

    var visible = getVisibleCount();
    var gap = getGap();
    var viewportWidth = viewport.clientWidth;
    var cardWidth = (viewportWidth - gap * (visible - 1)) / visible;

    cards.forEach(function (card) {
      card.style.flex = "0 0 " + cardWidth + "px";
      card.style.width = cardWidth + "px";
      card.style.minWidth = cardWidth + "px";
    });

    if (index > getMaxIndex()) index = getMaxIndex();
    if (index < 0) index = 0;

    track.style.transform = "translate3d(-" + index * (cardWidth + gap) + "px, 0, 0)";

    setArrowState(prevBtn, index <= 0);
    setArrowState(nextBtn, index >= getMaxIndex());
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

  if (typeof ResizeObserver !== "undefined" && viewport) {
    new ResizeObserver(updateCarousel).observe(viewport);
  }

  updateCarousel();

  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", function () {
      window.location.href = "category.html";
    });
  }
})();

(function () {
  document.querySelectorAll(".pi-planters-card__size-btns").forEach(function (group) {
    group.addEventListener("click", function (event) {
      var btn = event.target.closest(".pi-planters-card__size");
      if (!btn || !group.contains(btn)) return;
      group.querySelectorAll(".pi-planters-card__size").forEach(function (sizeBtn) {
        sizeBtn.classList.remove("is-active");
      });
      btn.classList.add("is-active");
    });
  });
})();

(function () {
  var section = document.querySelector("[data-pi-planters]");
  if (!section) return;

  var viewport = section.querySelector("[data-pi-planters-viewport]");
  var track = section.querySelector("[data-pi-planters-track]");
  var prevBtn = section.querySelector("[data-pi-planters-prev]");
  var nextBtn = section.querySelector("[data-pi-planters-next]");
  var cards = track ? track.querySelectorAll(".pi-planters-card") : [];
  var index = 0;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getGap() {
    if (!track) return 16;
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap || "16") || 16;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - 1);
  }

  function setArrowState(btn, disabled) {
    if (!btn) return;
    btn.disabled = disabled;
    btn.classList.toggle("is-disabled", disabled);
  }

  function resetDesktopLayout() {
    if (!track) return;
    track.style.transform = "";
    track.style.display = "";
    cards.forEach(function (card) {
      card.style.flex = "";
      card.style.width = "";
      card.style.minWidth = "";
    });
    index = 0;
    setArrowState(prevBtn, true);
    setArrowState(nextBtn, false);
  }

  function updateCarousel() {
    if (!viewport || !track || !cards.length) return;

    if (!isMobile()) {
      resetDesktopLayout();
      return;
    }

    var gap = getGap();
    var viewportWidth = viewport.clientWidth;
    var cardWidth = viewportWidth;

    track.style.display = "flex";

    cards.forEach(function (card) {
      card.style.flex = "0 0 " + cardWidth + "px";
      card.style.width = cardWidth + "px";
      card.style.minWidth = cardWidth + "px";
    });

    if (index > getMaxIndex()) index = getMaxIndex();
    if (index < 0) index = 0;

    track.style.transform = "translate3d(-" + index * (cardWidth + gap) + "px, 0, 0)";

    setArrowState(prevBtn, index <= 0);
    setArrowState(nextBtn, index >= getMaxIndex());
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (!isMobile() || index <= 0) return;
      index -= 1;
      updateCarousel();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!isMobile() || index >= getMaxIndex()) return;
      index += 1;
      updateCarousel();
    });
  }

  window.addEventListener("resize", updateCarousel);

  if (typeof ResizeObserver !== "undefined" && viewport) {
    new ResizeObserver(updateCarousel).observe(viewport);
  }

  updateCarousel();
})();

(function () {
  var scrollTopBtn = document.querySelector("[data-pi-scroll-top]");
  if (!scrollTopBtn) return;

  function toggleScrollTop() {
    if (window.scrollY > 400) {
      scrollTopBtn.hidden = false;
    } else {
      scrollTopBtn.hidden = true;
    }
  }

  scrollTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggleScrollTop, { passive: true });
  toggleScrollTop();
})();

(function () {
  var carousels = [
    { selector: "[data-pi-categories-viewport]", item: ".pi-categories__card" },
    { selector: "[data-pi-pots-viewport]", item: ".pi-pots__item" },
    { selector: "[data-pi-promo-viewport]", item: ".pi-promo__card" },
    { selector: "[data-pi-blog-viewport]", item: ".pi-blog-card" },
    { selector: "[data-pi-shop-cats-viewport]", item: ".pi-shop-cats__item" }
  ];

  function isMobile() {
    return window.innerWidth <= 768;
  }

  carousels.forEach(function (config) {
    var viewport = document.querySelector(config.selector);
    if (!viewport) return;

    var startX = 0;
    var startY = 0;
    var isDragging = false;

    viewport.addEventListener(
      "touchstart",
      function (event) {
        if (!isMobile() || !event.touches.length) return;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        isDragging = false;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      function (event) {
        if (!isMobile() || !event.touches.length) return;
        var deltaX = Math.abs(event.touches[0].clientX - startX);
        var deltaY = Math.abs(event.touches[0].clientY - startY);
        if (deltaX > deltaY && deltaX > 8) isDragging = true;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "click",
      function (event) {
        if (isDragging && event.target.closest(config.item)) {
          event.preventDefault();
          event.stopPropagation();
        }
        isDragging = false;
      },
      true
    );
  });
})();

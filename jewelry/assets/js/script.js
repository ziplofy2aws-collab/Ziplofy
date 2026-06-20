(function () {
  "use strict";

  /* Header scroll — transparent on hero, maroon when scrolled */
  var siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    function updateHeaderScroll() {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 48);
    }
    window.addEventListener("scroll", updateHeaderScroll, { passive: true });
    updateHeaderScroll();
  }

  /* Mobile navigation drawer */
  var menuToggle = document.querySelector(".menu-toggle");
  var drawer = document.getElementById("mobile-nav-drawer");

  if (menuToggle && drawer) {
    var backdrop = drawer.querySelector(".nav-drawer__backdrop");
    var closeBtn = drawer.querySelector(".nav-drawer__close");
    var panel = drawer.querySelector(".nav-drawer__panel");

    function setDrawerOpen(open) {
      drawer.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

      if (open) {
        drawer.removeAttribute("inert");
        drawer.setAttribute("aria-hidden", "false");
      } else {
        drawer.setAttribute("inert", "");
        drawer.setAttribute("aria-hidden", "true");
      }
    }

    function openDrawer() {
      setDrawerOpen(true);
      if (closeBtn) closeBtn.focus();
    }

    function closeDrawer() {
      setDrawerOpen(false);
      menuToggle.focus();
    }

    menuToggle.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (backdrop) backdrop.addEventListener("click", closeDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    drawer.querySelectorAll(".nav-drawer__nav a").forEach(function (link) {
      link.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        closeDrawer();
      }
    });

    if (panel) {
      panel.addEventListener("keydown", function (e) {
        if (e.key !== "Tab" || !drawer.classList.contains("is-open")) return;

        var focusable = panel.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    }

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && drawer.classList.contains("is-open")) {
        closeDrawer();
      }
    });
  }

  /* Hero banner slider */
  var slider = document.querySelector("[data-hero-slider]");
  if (!slider) return;

  var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
  var prevBtn = slider.querySelector(".hero-arrow--prev");
  var nextBtn = slider.querySelector(".hero-arrow--next");
  var counter = slider.querySelector("[data-hero-counter]");
  var total = slides.length;

  if (!slides.length || !prevBtn || !nextBtn) return;

  var activeSlide = Number(slider.getAttribute("data-current-slide") || 0);

  function updateCounter(index) {
    if (!counter) return;
    counter.textContent = String(index + 1) + "/" + String(total);
  }

  function goToSlide(index) {
    activeSlide = (index + total) % total;
    slider.setAttribute("data-current-slide", String(activeSlide));

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === activeSlide;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });

    updateCounter(activeSlide);
  }

  prevBtn.addEventListener("click", function () {
    goToSlide(activeSlide - 1);
  });

  nextBtn.addEventListener("click", function () {
    goToSlide(activeSlide + 1);
  });

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      goToSlide(index);
    });
  });

  goToSlide(activeSlide);
})();

(function () {
  "use strict";

  var carousel = document.querySelector("[data-collections-carousel]");
  if (!carousel) return;

  var cards = Array.prototype.slice.call(
    carousel.querySelectorAll("[data-collection-card]")
  );
  var prevBtn = carousel.querySelector(".collections-nav--prev");
  var nextBtn = carousel.querySelector(".collections-nav--next");

  if (!cards.length || !prevBtn || !nextBtn) return;

  var activeIndex = 1;

  function updateCollectionsSlider(nextIndex) {
    var total = cards.length;
    activeIndex = (nextIndex + total) % total;

    cards.forEach(function (card, index) {
      var rawDelta = index - activeIndex;
      var wrappedDelta = rawDelta;

      if (wrappedDelta > total / 2) wrappedDelta -= total;
      if (wrappedDelta < -total / 2) wrappedDelta += total;

      card.classList.remove("pos--1", "pos-0", "pos-1");

      if (wrappedDelta >= -1 && wrappedDelta <= 1) {
        var posClass =
          wrappedDelta === 0 ? "pos-0" : "pos-" + (wrappedDelta < 0 ? "-1" : "1");
        card.classList.add(posClass);
      }
    });
  }

  prevBtn.addEventListener("click", function () {
    updateCollectionsSlider(activeIndex - 1);
  });

  nextBtn.addEventListener("click", function () {
    updateCollectionsSlider(activeIndex + 1);
  });

  updateCollectionsSlider(activeIndex);
})();

(function () {
  "use strict";

  function initProductCarousel(carousel) {
    var track = carousel.querySelector("[data-product-track]");
    var cards = track
      ? Array.prototype.slice.call(track.querySelectorAll("[data-product-card]"))
      : [];
    var prevBtn = carousel.querySelector("[data-carousel-prev]");
    var nextBtn = carousel.querySelector("[data-carousel-next]");
    var viewport = carousel.querySelector("[data-carousel-viewport]");

    if (!track || !cards.length || !prevBtn || !nextBtn || !viewport) return;

    var index = 0;
    var gap = Number(carousel.getAttribute("data-carousel-gap") || 14);
    var activeBorder = carousel.getAttribute("data-carousel-active-border") || "#4b3669";

    function getStep() {
      var card = cards[0];
      if (!card) return 0;
      return card.offsetWidth + gap;
    }

    function getMaxIndex() {
      var visible = viewport.offsetWidth;
      var step = getStep();
      if (!step) return 0;

      var visibleCount = Math.max(1, Math.floor((visible + gap) / step));
      return Math.max(0, cards.length - visibleCount);
    }

    function updateCarousel() {
      var maxIndex = getMaxIndex();
      if (index > maxIndex) index = maxIndex;

      track.style.transform = "translateX(-" + index * getStep() + "px)";
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= maxIndex;

      cards.forEach(function (card, cardIndex) {
        var media = card.querySelector("[class*='__media']");
        if (!media) return;
        media.style.borderColor = cardIndex === index ? activeBorder : "transparent";
      });
    }

    prevBtn.addEventListener("click", function () {
      if (index > 0) {
        index -= 1;
        updateCarousel();
      }
    });

    nextBtn.addEventListener("click", function () {
      if (index < getMaxIndex()) {
        index += 1;
        updateCarousel();
      }
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
  }

  document.querySelectorAll("[data-product-carousel]").forEach(initProductCarousel);
})();

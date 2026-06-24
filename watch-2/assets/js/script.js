(function () {
  var header = document.querySelector("[data-wc2-header]");

  if (header) {
    var drawer = header.querySelector("[data-wc2-drawer]");
    var backdrop = header.querySelector("[data-wc2-backdrop]");
    var menuToggle = header.querySelector("[data-wc2-menu-toggle]");
    var menuClose = header.querySelector("[data-wc2-menu-close]");

    function openMenu() {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      backdrop.hidden = false;
      backdrop.classList.add("is-visible");
      menuToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      backdrop.classList.remove("is-visible");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      window.setTimeout(function () {
        if (!drawer.classList.contains("is-open")) {
          backdrop.hidden = true;
        }
      }, 260);
    }

    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        if (drawer.classList.contains("is-open")) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    if (menuClose) {
      menuClose.addEventListener("click", closeMenu);
    }

    if (backdrop) {
      backdrop.addEventListener("click", closeMenu);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  var hero = document.querySelector("[data-wc2-hero]");
  if (hero) {
    var slides = hero.querySelectorAll(".wc2-hero__slide");
    var lines = hero.querySelectorAll("[data-wc2-hero-line]");
    var prevBtn = hero.querySelector("[data-wc2-hero-prev]");
    var nextBtn = hero.querySelector("[data-wc2-hero-next]");
    var currentIndex = 0;

    if (slides.length) {
      function goTo(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === currentIndex);
        });

        lines.forEach(function (line, lineIndex) {
          var isActive = lineIndex === currentIndex;
          line.classList.toggle("is-active", isActive);
          line.setAttribute("aria-current", isActive ? "true" : "false");
        });
      }

      lines.forEach(function (line) {
        line.addEventListener("click", function () {
          var index = parseInt(line.getAttribute("data-wc2-hero-line"), 10);
          if (!isNaN(index)) {
            goTo(index);
          }
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          goTo(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          goTo(currentIndex + 1);
        });
      }
    }
  }

  var promoSlider = document.querySelector("[data-wc2-promo-slider]");
  if (promoSlider) {
    var promoTrack = promoSlider.querySelector(".wc2-hero__promo-track");
    var promoSlides = promoSlider.querySelectorAll(".wc2-hero__promo-slide");
    var promoIndex = 0;
    var promoTimer = null;
    var promoDelay = 4000;

    if (promoTrack && promoSlides.length > 1) {
      function goToPromo(index) {
        promoIndex = (index + promoSlides.length) % promoSlides.length;
        promoTrack.style.transform = "translateX(-" + promoIndex * 100 + "%)";

        promoSlides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === promoIndex);
        });
      }

      function startPromoAutoplay() {
        stopPromoAutoplay();
        promoTimer = window.setInterval(function () {
          goToPromo(promoIndex + 1);
        }, promoDelay);
      }

      function stopPromoAutoplay() {
        if (promoTimer) {
          window.clearInterval(promoTimer);
          promoTimer = null;
        }
      }

      promoSlider.addEventListener("mouseenter", stopPromoAutoplay);
      promoSlider.addEventListener("mouseleave", startPromoAutoplay);
      promoSlider.addEventListener("focusin", stopPromoAutoplay);
      promoSlider.addEventListener("focusout", startPromoAutoplay);

      window.addEventListener("resize", function () {
        goToPromo(promoIndex);
      });

      goToPromo(0);
      startPromoAutoplay();
    }
  }

  var luxeSlider = document.querySelector("[data-wc2-luxe-slider]");
  if (luxeSlider) {
    var luxeViewport = luxeSlider.querySelector("[data-wc2-luxe-viewport]");
    var luxeTrack = luxeSlider.querySelector("[data-wc2-luxe-track]");
    var luxeCards = luxeSlider.querySelectorAll(".wc2-luxe__card");
    var luxeProgress = luxeSlider.querySelector("[data-wc2-luxe-progress]");
    var luxeMq = window.matchMedia("(max-width: 900px)");

    function updateLuxeProgress() {
      if (!luxeViewport || !luxeTrack || !luxeProgress || !luxeCards.length) return;
      if (!luxeMq.matches) {
        luxeProgress.style.left = "";
        return;
      }

      var maxScroll = luxeTrack.scrollWidth - luxeViewport.clientWidth;
      var ratio = maxScroll > 0 ? luxeViewport.scrollLeft / maxScroll : 0;
      var segment = 100 / luxeCards.length;
      luxeProgress.style.width = segment + "%";
      luxeProgress.style.left = ratio * (100 - segment) + "%";
    }

    if (luxeViewport && luxeTrack && luxeProgress) {
      luxeViewport.addEventListener("scroll", updateLuxeProgress, { passive: true });
      window.addEventListener("resize", updateLuxeProgress);
      luxeMq.addEventListener("change", updateLuxeProgress);
      updateLuxeProgress();
    }
  }

  function initProductCarousel(section, options) {
    var viewport = section.querySelector(options.viewport);
    var track = section.querySelector(options.track);
    var cards = section.querySelectorAll(options.card);
    var prev = section.querySelector(options.prev);
    var next = section.querySelector(options.next);
    var cardIndex = 0;

    if (!viewport || !track || !cards.length) return;

    function getVisibleCount() {
      if (window.matchMedia("(max-width: 520px)").matches) return 1;
      if (window.matchMedia("(max-width: 768px)").matches) return 2;
      if (window.matchMedia("(max-width: 1100px)").matches) return 3;
      return 4;
    }

    function getStep() {
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    function updateCarousel() {
      var maxIndex = getMaxIndex();

      if (cardIndex > maxIndex) {
        cardIndex = maxIndex;
      }

      track.style.transform = "translateX(-" + cardIndex * getStep() + "px)";

      if (prev) {
        prev.disabled = cardIndex <= 0;
      }

      if (next) {
        next.disabled = cardIndex >= maxIndex;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        if (cardIndex > 0) {
          cardIndex -= 1;
          updateCarousel();
        }
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        if (cardIndex < getMaxIndex()) {
          cardIndex += 1;
          updateCarousel();
        }
      });
    }

    section.querySelectorAll(options.wish || ".wc2-arrivals__wish").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var icon = btn.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-regular");
          icon.classList.toggle("fa-solid");
        }
      });
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();

    return {
      goTo: function (index) {
        cardIndex = index;
        updateCarousel();
      }
    };
  }

  var arrivals = document.querySelector("[data-wc2-arrivals]");
  if (arrivals) {
    var arrivalsCarousel = initProductCarousel(arrivals, {
      viewport: "[data-wc2-arrivals-viewport]",
      track: "[data-wc2-arrivals-track]",
      card: ".wc2-arrivals__card",
      prev: "[data-wc2-arrivals-prev]",
      next: "[data-wc2-arrivals-next]",
      wish: ".wc2-arrivals__wish"
    });

    var tabs = arrivals.querySelectorAll("[data-wc2-arrivals-tab]");
    var activeTab = "new";

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var tabName = tab.getAttribute("data-wc2-arrivals-tab");
        if (!tabName || tabName === activeTab) return;

        activeTab = tabName;

        tabs.forEach(function (item) {
          var isActive = item.getAttribute("data-wc2-arrivals-tab") === tabName;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        if (arrivalsCarousel) {
          arrivalsCarousel.goTo(tabName === "best" ? 4 : 0);
        }
      });
    });
  }

  var reviewed = document.querySelector("[data-wc2-reviewed]");
  if (reviewed) {
    initProductCarousel(reviewed, {
      viewport: "[data-wc2-reviewed-viewport]",
      track: "[data-wc2-reviewed-track]",
      card: ".wc2-reviewed__card",
      prev: "[data-wc2-reviewed-prev]",
      next: "[data-wc2-reviewed-next]",
      wish: ".wc2-reviewed__wish"
    });
  }

  var testimonials = document.querySelector("[data-wc2-testimonials]");
  if (testimonials) {
    var testViewport = testimonials.querySelector("[data-wc2-testimonials-viewport]");
    var testTrack = testimonials.querySelector("[data-wc2-testimonials-track]");
    var testCards = testimonials.querySelectorAll(".wc2-testimonials__card");
    var testDots = testimonials.querySelectorAll("[data-wc2-testimonials-dot]");
    var testPage = 0;

    if (testViewport && testTrack && testCards.length) {
      var cardsPerPage = 3;

      function getTestStep() {
        var gap = parseFloat(getComputedStyle(testTrack).gap) || 0;
        return testCards[0].getBoundingClientRect().width + gap;
      }

      function updateTestimonials() {
        testTrack.style.transform = "translateX(-" + testPage * cardsPerPage * getTestStep() + "px)";

        testDots.forEach(function (dot, index) {
          var isActive = index === testPage;
          dot.classList.toggle("is-active", isActive);
          dot.setAttribute("aria-current", isActive ? "true" : "false");
        });
      }

      testDots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var page = parseInt(dot.getAttribute("data-wc2-testimonials-dot"), 10);
          if (!isNaN(page)) {
            testPage = page;
            updateTestimonials();
          }
        });
      });

      window.addEventListener("resize", updateTestimonials);
      updateTestimonials();
    }
  }

  var backTop = document.querySelector("[data-wc2-back-top]");
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();

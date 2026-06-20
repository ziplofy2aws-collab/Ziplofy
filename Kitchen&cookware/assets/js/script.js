(function () {
  "use strict";

  /* Announcement bar carousel */
  var slider = document.querySelector("[data-announcement-slider]");
  if (slider) {
    var slides = slider.querySelectorAll(".announcement-bar__slide");
    var prevBtn = slider.querySelector(".announcement-bar__arrow--prev");
    var nextBtn = slider.querySelector(".announcement-bar__arrow--next");
    var index = 0;
    var timer = null;
    var delay = 5000;

    function showSlide(i) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === index);
      });
    }

    function next() {
      showSlide(index + 1);
    }

    function prev() {
      showSlide(index - 1);
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

    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); startAutoplay(); });

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);

    showSlide(0);
    if (slides.length > 1) startAutoplay();
  }

  /* Hero image slider (fade) */
  var heroRoot = document.querySelector("[data-hero-slider]");
  if (heroRoot) {
    var heroSlides = heroRoot.querySelectorAll(".hero__slide");
    var heroIndex = 0;
    var heroTimer = null;
    var heroDelay = 5500;

    function showHeroSlide(i) {
      if (!heroSlides.length) return;
      heroIndex = (i + heroSlides.length) % heroSlides.length;
      heroSlides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === heroIndex);
      });
    }

    function startHeroAutoplay() {
      stopHeroAutoplay();
      if (heroSlides.length > 1) {
        heroTimer = window.setInterval(function () {
          showHeroSlide(heroIndex + 1);
        }, heroDelay);
      }
    }

    function stopHeroAutoplay() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      }
    }

    showHeroSlide(0);
    startHeroAutoplay();

    heroRoot.addEventListener("mouseenter", stopHeroAutoplay);
    heroRoot.addEventListener("mouseleave", startHeroAutoplay);
  }

  /* Shop Bestsellers carousel */
  var bsCarousel = document.querySelector("[data-bestsellers-carousel]");
  if (bsCarousel) {
    var bsTrack = bsCarousel.querySelector("[data-bs-track]");
    var bsViewport = bsCarousel.querySelector("[data-bs-viewport]");
    var bsCards = bsTrack ? bsTrack.querySelectorAll(".bestsellers-card") : [];
    var bsPrev = bsCarousel.querySelector("[data-bs-prev]");
    var bsNext = bsCarousel.querySelector("[data-bs-next]");
    var bsIndex = 0;
    var bsGap = 20;

    function bsGetStep() {
      if (!bsCards.length) return 0;
      return bsCards[0].offsetWidth + bsGap;
    }

    function bsGetMaxIndex() {
      if (!bsViewport || !bsCards.length) return 0;
      var visible = bsViewport.offsetWidth;
      var step = bsGetStep();
      if (!step) return 0;
      var visibleCount = Math.max(1, Math.floor((visible + bsGap) / step));
      return Math.max(0, bsCards.length - visibleCount);
    }

    function bsUpdateButtons() {
      var maxIndex = bsGetMaxIndex();
      if (bsIndex > maxIndex) bsIndex = maxIndex;

      if (bsTrack) {
        bsTrack.style.transform = "translate3d(-" + bsIndex * bsGetStep() + "px, 0, 0)";
      }

      if (bsPrev) {
        bsPrev.disabled = bsIndex <= 0;
        bsPrev.classList.toggle("is-disabled", bsIndex <= 0);
      }
      if (bsNext) {
        bsNext.disabled = bsIndex >= maxIndex;
        bsNext.classList.toggle("is-disabled", bsIndex >= maxIndex);
      }
    }

    if (bsPrev) {
      bsPrev.addEventListener("click", function () {
        if (bsIndex > 0) {
          bsIndex -= 1;
          bsUpdateButtons();
        }
      });
    }

    if (bsNext) {
      bsNext.addEventListener("click", function () {
        var maxIndex = bsGetMaxIndex();
        if (bsIndex < maxIndex) {
          bsIndex += 1;
          bsUpdateButtons();
        }
      });
    }

    window.addEventListener("resize", bsUpdateButtons);
    bsUpdateButtons();
  }

  /* New favourites product carousel */
  var nfCarousel = document.querySelector("[data-nf-carousel]");
  if (nfCarousel) {
    var nfTrack = nfCarousel.querySelector("[data-nf-track]");
    var nfViewport = nfCarousel.querySelector("[data-nf-viewport]");
    var nfCards = nfTrack ? nfTrack.querySelectorAll(".nf-card") : [];
    var nfPrev = nfCarousel.querySelector("[data-nf-prev]");
    var nfNext = nfCarousel.querySelector("[data-nf-next]");
    var nfIndex = 0;
    var nfGap = 16;

    function nfGetStep() {
      if (!nfCards.length) return 0;
      return nfCards[0].offsetWidth + nfGap;
    }

    function nfGetMaxIndex() {
      if (!nfViewport || !nfCards.length) return 0;
      var visible = nfViewport.offsetWidth;
      var step = nfGetStep();
      if (!step) return 0;
      var visibleCount = Math.max(1, Math.floor((visible + nfGap) / step));
      return Math.max(0, nfCards.length - visibleCount);
    }

    function nfUpdate() {
      var maxIndex = nfGetMaxIndex();
      if (nfIndex > maxIndex) nfIndex = maxIndex;

      if (nfTrack) {
        nfTrack.style.transform = "translate3d(-" + nfIndex * nfGetStep() + "px, 0, 0)";
      }

      if (nfPrev) {
        nfPrev.disabled = nfIndex <= 0;
        nfPrev.classList.toggle("is-disabled", nfIndex <= 0);
      }
      if (nfNext) {
        nfNext.disabled = nfIndex >= maxIndex;
        nfNext.classList.toggle("is-disabled", nfIndex >= maxIndex);
      }
    }

    if (nfPrev) {
      nfPrev.addEventListener("click", function () {
        if (nfIndex > 0) {
          nfIndex -= 1;
          nfUpdate();
        }
      });
    }

    if (nfNext) {
      nfNext.addEventListener("click", function () {
        var maxIndex = nfGetMaxIndex();
        if (nfIndex < maxIndex) {
          nfIndex += 1;
          nfUpdate();
        }
      });
    }

    window.addEventListener("resize", nfUpdate);
    nfUpdate();
  }

  /* Mobile nav toggle */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMenu = document.getElementById("primary-nav");
  var navCloseBtns = document.querySelectorAll("[data-nav-close]");

  function closeMobileNav() {
    if (!navMenu) return;
    navMenu.classList.remove("is-open");
    if (navToggle) {
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }
    document.body.classList.remove("is-mobile-menu-open");
    document.body.style.overflow = "";
  }

  function openMobileNav() {
    if (!navMenu) return;
    navMenu.classList.add("is-open");
    if (navToggle) {
      navToggle.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
    }
    document.body.classList.add("is-mobile-menu-open");
    document.body.style.overflow = "hidden";
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      if (navMenu.classList.contains("is-open")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    navCloseBtns.forEach(function (btn) {
      btn.addEventListener("click", closeMobileNav);
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (!navMenu.classList.contains("is-open")) return;
        closeMobileNav();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        closeMobileNav();
      }
    });
  }
})();

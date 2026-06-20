(function () {
  "use strict";

  var menuToggle = document.getElementById("aetMenuToggle");
  var mobileNav = document.getElementById("aetMobileNav");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      menuToggle.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        mobileNav.classList.remove("is-open");
        menuToggle.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* Hero slider — auto fade */
  var heroRoot = document.querySelector("[data-hero-slider]");
  if (heroRoot) {
    var heroSlides = heroRoot.querySelectorAll(".ank-hero__slide");
    var heroIndex = 0;
    var heroTimer = null;
    var heroDelay = 5000;

    function showHeroSlide(i) {
      if (!heroSlides.length) return;
      heroIndex = (i + heroSlides.length) % heroSlides.length;
      heroSlides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === heroIndex);
      });
    }

    function startHeroAutoplay() {
      if (heroTimer) window.clearInterval(heroTimer);
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

  /* Product carousels — one card per arrow click */
  document.querySelectorAll("[data-clearance-carousel]").forEach(function (clCarousel) {
    var clTrack = clCarousel.querySelector("[data-cl-track]");
    var clViewport = clCarousel.querySelector("[data-cl-viewport]");
    var clCards = clTrack ? clTrack.querySelectorAll(".aet-pcard") : [];
    var clPrev = clCarousel.querySelector("[data-cl-prev]");
    var clNext = clCarousel.querySelector("[data-cl-next]");
    var clIndex = 0;

    function clGetGap() {
      if (!clTrack) return 16;
      var styles = window.getComputedStyle(clTrack);
      return parseFloat(styles.gap) || 16;
    }

    function clGetStep() {
      if (!clCards.length) return 0;
      return clCards[0].offsetWidth + clGetGap();
    }

    function clGetMaxIndex() {
      if (!clViewport || !clCards.length) return 0;
      var visible = clViewport.offsetWidth;
      var step = clGetStep();
      if (!step) return 0;
      var visibleCount = Math.max(1, Math.floor((visible + clGetGap()) / step));
      return Math.max(0, clCards.length - visibleCount);
    }

    function clGoTo(index) {
      var maxIndex = clGetMaxIndex();
      clIndex = Math.max(0, Math.min(index, maxIndex));

      if (clTrack) {
        clTrack.style.transform = "translate3d(-" + clIndex * clGetStep() + "px, 0, 0)";
      }

      if (clPrev) {
        clPrev.disabled = clIndex <= 0;
        clPrev.classList.toggle("is-disabled", clIndex <= 0);
      }
      if (clNext) {
        clNext.disabled = clIndex >= maxIndex;
        clNext.classList.toggle("is-disabled", clIndex >= maxIndex);
      }
    }

    if (clPrev) {
      clPrev.addEventListener("click", function () {
        clGoTo(clIndex - 1);
      });
    }

    if (clNext) {
      clNext.addEventListener("click", function () {
        clGoTo(clIndex + 1);
      });
    }

    window.addEventListener("resize", function () {
      clGoTo(clIndex);
    });

    clGoTo(0);
  });

  /* Must-Have Anker Selections — tabs */
  var selectionsRoot = document.querySelector("[data-selections]");
  if (selectionsRoot) {
    var selectionTabs = selectionsRoot.querySelectorAll("[data-selections-tab]");
    var selectionPanels = selectionsRoot.querySelectorAll("[data-selections-panel]");

    selectionTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-selections-tab");
        if (!target) return;

        selectionTabs.forEach(function (t) {
          var isActive = t === tab;
          t.classList.toggle("is-active", isActive);
          t.setAttribute("aria-selected", isActive ? "true" : "false");
          t.tabIndex = isActive ? 0 : -1;
        });

        selectionPanels.forEach(function (panel) {
          var isActive = panel.getAttribute("data-selections-panel") === target;
          panel.classList.toggle("is-active", isActive);
          if (isActive) {
            panel.removeAttribute("hidden");
          } else {
            panel.setAttribute("hidden", "");
          }
        });
      });
    });
  }

  /* Image compare slider — banner-1 / banner-2 */
  var compareViewport = document.querySelector("[data-image-compare]");
  if (compareViewport) {
    var compareBefore = compareViewport.querySelector("[data-compare-before]");
    var compareBeforeImg = compareViewport.querySelector(".aet-compare__img--before");
    var compareDivider = compareViewport.querySelector("[data-compare-divider]");
    var compareHandle = compareViewport.querySelector("[data-compare-handle]");
    var compareRange = compareViewport.querySelector("[data-compare-range]");
    var compareDragging = false;

    function compareSyncImgWidth() {
      if (!compareBeforeImg) return;
      compareBeforeImg.style.width = compareViewport.offsetWidth + "px";
    }

    function compareSetPosition(percent) {
      var pos = Math.max(0, Math.min(100, percent));
      if (compareBefore) compareBefore.style.width = pos + "%";
      if (compareDivider) compareDivider.style.left = pos + "%";
      if (compareRange) compareRange.value = String(pos);
    }

    function compareFromClientX(clientX) {
      var rect = compareViewport.getBoundingClientRect();
      if (!rect.width) return 50;
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function compareStartDrag() {
      compareDragging = true;
      compareViewport.classList.add("is-dragging");
    }

    function compareEndDrag() {
      compareDragging = false;
      compareViewport.classList.remove("is-dragging");
    }

    if (compareRange) {
      compareRange.addEventListener("input", function () {
        compareSetPosition(parseFloat(compareRange.value));
      });
    }

    compareViewport.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      compareStartDrag();
      compareSetPosition(compareFromClientX(e.clientX));
      if (compareViewport.setPointerCapture && e.target !== compareRange) {
        try {
          compareViewport.setPointerCapture(e.pointerId);
        } catch (err) { /* ignore */ }
      }
    });

    compareViewport.addEventListener("pointermove", function (e) {
      if (!compareDragging) return;
      compareSetPosition(compareFromClientX(e.clientX));
    });

    compareViewport.addEventListener("pointerup", compareEndDrag);
    compareViewport.addEventListener("pointercancel", compareEndDrag);

    if (compareHandle) {
      compareHandle.addEventListener("keydown", function (e) {
        var step = e.shiftKey ? 10 : 2;
        var current = compareRange ? parseFloat(compareRange.value) : 50;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          compareSetPosition(current - step);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          compareSetPosition(current + step);
        }
      });
    }

    window.addEventListener("resize", function () {
      compareSyncImgWidth();
      if (compareRange) compareSetPosition(parseFloat(compareRange.value));
    });

    compareSyncImgWidth();
    compareSetPosition(compareRange ? parseFloat(compareRange.value) : 50);
  }
})();

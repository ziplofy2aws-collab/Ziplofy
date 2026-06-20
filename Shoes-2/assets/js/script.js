(function () {
  var toggle = document.querySelector("[data-sh2-menu-toggle]");
  var closeBtn = document.querySelector("[data-sh2-menu-close]");
  var nav = document.querySelector("[data-sh2-nav]");
  var overlay = document.querySelector("[data-sh2-menu-overlay]");

  if (!toggle || !nav || !overlay) return;

  nav.setAttribute("data-lenis-prevent", "");

  function openMenu() {
    nav.classList.add("is-open");
    overlay.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";

    if (window.lenis && typeof window.lenis.stop === "function") {
      window.lenis.stop();
    }
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    overlay.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";

    if (window.lenis && typeof window.lenis.start === "function") {
      window.lenis.start();
    }
  }

  toggle.addEventListener("click", function () {
    if (nav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  overlay.addEventListener("click", closeMenu);

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 992) {
      closeMenu();
    }
  });
})();

(function () {
  var hero = document.querySelector("[data-sh2-hero]");
  if (!hero) return;

  var slides = hero.querySelectorAll(".sh2-hero__slide");
  var dots = hero.querySelectorAll("[data-sh2-hero-dot]");
  var currentIndex = 0;
  var timerId = null;
  var intervalMs = 10000;

  if (!slides.length) return;

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.tabIndex = isActive ? 0 : -1;
    });

    hero.dispatchEvent(
      new CustomEvent("sh2:hero-slide", { detail: { index: currentIndex } })
    );
  }

  function scheduleAutoplay() {
    if (timerId) {
      window.clearInterval(timerId);
    }

    timerId = window.setInterval(function () {
      goTo(currentIndex + 1);
    }, intervalMs);
  }

  function restartAutoplay(index) {
    goTo(index);
    scheduleAutoplay();
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      restartAutoplay(index);
    });
  });

  hero.addEventListener("mouseenter", function () {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  });

  hero.addEventListener("mouseleave", function () {
    scheduleAutoplay();
  });

  scheduleAutoplay();
})();

(function () {
  var section = document.querySelector("[data-sh2-categories]");
  if (!section) return;

  var viewport = section.querySelector("[data-sh2-cat-viewport]");
  var track = section.querySelector("[data-sh2-cat-track]");
  var nextBtn = section.querySelector("[data-sh2-cat-next]");
  var prevBtn = section.querySelector("[data-sh2-cat-prev]");
  var cards = track ? track.querySelectorAll(".sh2-cat__card") : [];
  var filters = section.querySelectorAll(".sh2-cat__filter");
  var index = 0;
  var touchStartX = 0;
  var touchDeltaX = 0;
  var mqlTouch = window.matchMedia("(max-width: 768px)");

  if (!viewport || !track || !cards.length) return;

  function isTouchMode() {
    return mqlTouch.matches;
  }

  function getGap() {
    return parseFloat(window.getComputedStyle(track).gap) || 28;
  }

  function getStep() {
    if (!cards.length) return 0;
    return cards[0].getBoundingClientRect().width + getGap();
  }

  function getMaxIndex() {
    var visible = viewport.getBoundingClientRect().width;
    var total = track.scrollWidth;
    var step = getStep();
    if (step <= 0) return 0;
    return Math.max(0, Math.ceil((total - visible) / step));
  }

  function updateArrows() {
    if (isTouchMode()) return;
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= getMaxIndex();
  }

  function updateTrack() {
    if (isTouchMode()) {
      track.style.transform = "";
      updateArrows();
      return;
    }

    var step = getStep();
    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;
    track.style.transform = "translate3d(-" + index * step + "px, 0, 0)";
    updateArrows();
  }

  function scrollNext() {
    if (isTouchMode()) {
      viewport.scrollBy({ left: getStep(), behavior: "smooth" });
      return;
    }

    if (index < getMaxIndex()) {
      index += 1;
      updateTrack();
    }
  }

  function scrollPrev() {
    if (isTouchMode()) {
      viewport.scrollBy({ left: -getStep(), behavior: "smooth" });
      return;
    }

    if (index > 0) {
      index -= 1;
      updateTrack();
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", scrollPrev);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", scrollNext);
  }

  viewport.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    }
  });

  viewport.addEventListener(
    "touchstart",
    function (event) {
      if (!isTouchMode()) return;
      touchStartX = event.touches[0].clientX;
      touchDeltaX = 0;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    function (event) {
      if (!isTouchMode()) return;
      touchDeltaX = event.touches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    function () {
      if (!isTouchMode() || Math.abs(touchDeltaX) < 40) return;
      if (touchDeltaX < 0) {
        scrollNext();
      } else {
        scrollPrev();
      }
    },
    { passive: true }
  );

  filters.forEach(function (filter) {
    filter.addEventListener("click", function () {
      filters.forEach(function (btn) {
        var isActive = btn === filter;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
      index = 0;
      if (isTouchMode()) {
        viewport.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        updateTrack();
      }
    });
  });

  mqlTouch.addEventListener("change", function () {
    index = 0;
    updateTrack();
  });

  window.addEventListener("resize", updateTrack);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(updateTrack).observe(viewport);
  }

  updateTrack();
})();

(function () {
  var section = document.querySelector("[data-sh2-arrivals]");
  if (!section) return;

  var viewport = section.querySelector("[data-sh2-na-viewport]");
  var track = section.querySelector("[data-sh2-na-track]");
  var nextBtn = section.querySelector("[data-sh2-na-next]");
  var prevBtn = section.querySelector("[data-sh2-na-prev]");
  var cards = track ? track.querySelectorAll(".sh2-na__card") : [];
  var index = 0;
  var touchStartX = 0;
  var touchDeltaX = 0;
  var mqlTouch = window.matchMedia("(max-width: 768px)");

  if (!viewport || !track || !cards.length) return;

  section.querySelectorAll(".sh2-na__thumbs").forEach(function (thumbRow) {
    var card = thumbRow.closest(".sh2-na__card");
    var mainImg = card ? card.querySelector("[data-sh2-na-main]") : null;
    if (!mainImg) return;

    thumbRow.querySelectorAll(".sh2-na__thumb").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        thumbRow.querySelectorAll(".sh2-na__thumb").forEach(function (btn) {
          btn.classList.remove("is-active");
        });
        thumb.classList.add("is-active");
        var thumbImg = thumb.querySelector("img");
        if (thumbImg) {
          mainImg.src = thumbImg.src;
          mainImg.alt = thumbImg.alt || mainImg.alt;
        }
      });
    });
  });

  function isTouchMode() {
    return mqlTouch.matches;
  }

  function getGap() {
    return parseFloat(window.getComputedStyle(track).gap) || 16;
  }

  function getStep() {
    if (!cards.length) return 0;
    return cards[0].getBoundingClientRect().width + getGap();
  }

  function getMaxIndex() {
    var visible = viewport.getBoundingClientRect().width;
    var total = track.scrollWidth;
    var step = getStep();
    if (step <= 0) return 0;
    return Math.max(0, Math.ceil((total - visible) / step));
  }

  function updateArrows() {
    if (isTouchMode()) return;
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= getMaxIndex();
  }

  function updateTrack() {
    if (isTouchMode()) {
      track.style.transform = "";
      updateArrows();
      return;
    }

    var step = getStep();
    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;
    track.style.transform = "translate3d(-" + index * step + "px, 0, 0)";
    updateArrows();
  }

  function scrollNext() {
    if (isTouchMode()) {
      viewport.scrollBy({ left: getStep(), behavior: "smooth" });
      return;
    }

    if (index < getMaxIndex()) {
      index += 1;
      updateTrack();
    }
  }

  function scrollPrev() {
    if (isTouchMode()) {
      viewport.scrollBy({ left: -getStep(), behavior: "smooth" });
      return;
    }

    if (index > 0) {
      index -= 1;
      updateTrack();
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", scrollPrev);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", scrollNext);
  }

  viewport.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    }
  });

  viewport.addEventListener(
    "touchstart",
    function (event) {
      if (!isTouchMode()) return;
      touchStartX = event.touches[0].clientX;
      touchDeltaX = 0;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    function (event) {
      if (!isTouchMode()) return;
      touchDeltaX = event.touches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    function () {
      if (!isTouchMode() || Math.abs(touchDeltaX) < 40) return;
      if (touchDeltaX < 0) {
        scrollNext();
      } else {
        scrollPrev();
      }
    },
    { passive: true }
  );

  mqlTouch.addEventListener("change", function () {
    index = 0;
    updateTrack();
  });

  window.addEventListener("resize", updateTrack);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(updateTrack).observe(viewport);
  }

  updateTrack();
})();

(function () {
  var section = document.querySelector("[data-sh2-trending]");
  if (!section) return;

  var viewport = section.querySelector("[data-sh2-trend-viewport]");
  var track = section.querySelector("[data-sh2-trend-track]");
  var nextBtn = section.querySelector("[data-sh2-trend-next]");
  var progressBar = section.querySelector("[data-sh2-trend-progress]");
  var cards = track ? track.querySelectorAll(".sh2-trend__card") : [];
  var index = 0;
  var mqlTouch = window.matchMedia("(max-width: 768px)");

  if (!viewport || !track || !cards.length) return;

  function isTouchMode() {
    return mqlTouch.matches;
  }

  function getGap() {
    return parseFloat(window.getComputedStyle(track).gap) || 14;
  }

  function getStep() {
    if (!cards.length) return 0;
    return cards[0].getBoundingClientRect().width + getGap();
  }

  function getMaxIndex() {
    var visible = viewport.getBoundingClientRect().width;
    var total = track.scrollWidth;
    var step = getStep();
    if (step <= 0) return 0;
    return Math.max(0, Math.ceil((total - visible) / step));
  }

  function updateProgress() {
    if (!progressBar) return;

    var visible = viewport.getBoundingClientRect().width;
    var total = track.scrollWidth;
    var maxIndex = getMaxIndex();
    var visiblePercent = total > 0 ? (visible / total) * 100 : 100;

    progressBar.style.width = Math.min(100, visiblePercent) + "%";

    if (maxIndex > 0) {
      var offset = (index / maxIndex) * (100 - visiblePercent);
      progressBar.style.marginLeft = offset + "%";
    } else {
      progressBar.style.marginLeft = "0";
    }
  }

  function updateArrows() {
    if (!nextBtn || isTouchMode()) return;
    nextBtn.disabled = index >= getMaxIndex();
  }

  function updateTrack() {
    if (isTouchMode()) {
      track.style.transform = "";
      updateArrows();
      updateProgress();
      return;
    }

    var step = getStep();
    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;
    track.style.transform = "translate3d(-" + index * step + "px, 0, 0)";
    updateArrows();
    updateProgress();
  }

  function scrollNext() {
    if (isTouchMode()) {
      viewport.scrollBy({ left: getStep(), behavior: "smooth" });
      return;
    }

    if (index < getMaxIndex()) {
      index += 1;
      updateTrack();
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", scrollNext);
  }

  viewport.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  });

  mqlTouch.addEventListener("change", function () {
    index = 0;
    updateTrack();
  });

  window.addEventListener("resize", updateTrack);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(updateTrack).observe(viewport);
  }

  updateTrack();
})();

(function () {
  var section = document.querySelector("[data-sh2-banner-slider]");
  if (!section) return;

  var slides = section.querySelectorAll(".sh2-bslider__slide");
  var dots = section.querySelectorAll("[data-sh2-bslider-dot]");
  var prevBtn = section.querySelector("[data-sh2-bslider-prev]");
  var nextBtn = section.querySelector("[data-sh2-bslider-next]");
  var currentIndex = 0;

  if (!slides.length) return;

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.tabIndex = isActive ? 0 : -1;
    });

    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= slides.length - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (currentIndex > 0) goTo(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (currentIndex < slides.length - 1) goTo(currentIndex + 1);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      goTo(index);
    });
  });

  goTo(0);
})();

(function () {
  var section = document.querySelector("[data-sh2-walking]");
  if (!section) return;

  var viewport = section.querySelector("[data-sh2-walk-viewport]");
  var track = section.querySelector("[data-sh2-walk-track]");
  var nextBtn = section.querySelector("[data-sh2-walk-next]");
  var prevBtn = section.querySelector("[data-sh2-walk-prev]");
  var dotsWrap = section.querySelector("[data-sh2-walk-dots]");
  var cards = track ? track.querySelectorAll(".sh2-walk__card") : [];
  var index = 0;
  var touchStartX = 0;
  var touchDeltaX = 0;
  var mqlTouch = window.matchMedia("(max-width: 768px)");

  if (!viewport || !track || !cards.length) return;

  function isTouchMode() {
    return mqlTouch.matches;
  }

  function getGap() {
    return parseFloat(window.getComputedStyle(track).gap) || 14;
  }

  function getStep() {
    if (!cards.length) return 0;
    return cards[0].getBoundingClientRect().width + getGap();
  }

  function getMaxIndex() {
    var visible = viewport.getBoundingClientRect().width;
    var total = track.scrollWidth;
    var step = getStep();
    if (step <= 0) return 0;
    return Math.max(0, Math.ceil((total - visible) / step));
  }

  function renderDots() {
    if (!dotsWrap) return;

    var pageCount = getMaxIndex() + 1;
    dotsWrap.innerHTML = "";

    for (var i = 0; i < pageCount; i += 1) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "sh2-walk__dot" + (i === index ? " is-active" : "");
      dot.setAttribute("data-sh2-walk-dot", "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Page " + (i + 1));
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
      dot.tabIndex = i === index ? 0 : -1;
      dot.addEventListener("click", function (pageIndex) {
        return function () {
          goTo(pageIndex);
        };
      }(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;

    var dots = dotsWrap.querySelectorAll("[data-sh2-walk-dot]");
    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.tabIndex = isActive ? 0 : -1;
    });
  }

  function updateArrows() {
    if (isTouchMode()) return;
    var maxIndex = getMaxIndex();
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= maxIndex;
  }

  function goTo(targetIndex) {
    var maxIndex = getMaxIndex();
    index = Math.max(0, Math.min(targetIndex, maxIndex));

    if (isTouchMode()) {
      viewport.scrollTo({ left: index * getStep(), behavior: "smooth" });
      updateDots();
      return;
    }

    track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
    updateArrows();
    updateDots();
  }

  function updateTrack() {
    renderDots();

    if (isTouchMode()) {
      track.style.transform = "";
      updateArrows();
      return;
    }

    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;
    track.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";
    updateArrows();
    updateDots();
  }

  function scrollNext() {
    if (isTouchMode()) {
      viewport.scrollBy({ left: getStep(), behavior: "smooth" });
      return;
    }

    if (index < getMaxIndex()) {
      goTo(index + 1);
    }
  }

  function scrollPrev() {
    if (isTouchMode()) {
      viewport.scrollBy({ left: -getStep(), behavior: "smooth" });
      return;
    }

    if (index > 0) {
      goTo(index - 1);
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", scrollPrev);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", scrollNext);
  }

  viewport.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    }
  });

  viewport.addEventListener(
    "touchstart",
    function (event) {
      if (!isTouchMode()) return;
      touchStartX = event.touches[0].clientX;
      touchDeltaX = 0;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    function (event) {
      if (!isTouchMode()) return;
      touchDeltaX = event.touches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    function () {
      if (!isTouchMode() || Math.abs(touchDeltaX) < 40) return;
      if (touchDeltaX < 0) {
        scrollNext();
      } else {
        scrollPrev();
      }
    },
    { passive: true }
  );

  mqlTouch.addEventListener("change", function () {
    index = 0;
    updateTrack();
  });

  window.addEventListener("resize", updateTrack);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(updateTrack).observe(viewport);
  }

  updateTrack();
})();

(function () {
  var section = document.querySelector("[data-sh2-exclusive]");
  if (!section) return;

  var viewport = section.querySelector("[data-sh2-exclusive-viewport]");
  var track = section.querySelector("[data-sh2-exclusive-track]");
  var dotsWrap = section.querySelector("[data-sh2-exclusive-dots]");
  var cards = track ? track.querySelectorAll(".sh2-exclusive__card") : [];
  var index = 0;
  var touchStartX = 0;
  var touchDeltaX = 0;
  var scrollTimer = null;
  var mqlCarousel = window.matchMedia("(max-width: 768px)");

  if (!viewport || !track || !cards.length) return;

  function isCarouselMode() {
    return mqlCarousel.matches;
  }

  function getSlideWidth() {
    return viewport.getBoundingClientRect().width;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - 1);
  }

  function applySlideWidths() {
    if (!isCarouselMode()) {
      cards.forEach(function (card) {
        card.style.flexBasis = "";
        card.style.width = "";
      });
      return;
    }

    var slideWidth = getSlideWidth();
    cards.forEach(function (card) {
      card.style.flex = "0 0 " + slideWidth + "px";
      card.style.width = slideWidth + "px";
    });
  }

  function renderDots() {
    if (!dotsWrap) return;

    if (!isCarouselMode()) {
      dotsWrap.innerHTML = "";
      return;
    }

    dotsWrap.innerHTML = "";

    for (var i = 0; i < cards.length; i += 1) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "sh2-exclusive__dot" + (i === index ? " is-active" : "");
      dot.setAttribute("data-sh2-exclusive-dot", "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Slide " + (i + 1));
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
      dot.tabIndex = i === index ? 0 : -1;
      dot.addEventListener("click", function (slideIndex) {
        return function () {
          goTo(slideIndex);
        };
      }(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsWrap || !isCarouselMode()) return;

    var dots = dotsWrap.querySelectorAll("[data-sh2-exclusive-dot]");
    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.tabIndex = isActive ? 0 : -1;
    });
  }

  function syncIndexFromScroll() {
    if (!isCarouselMode()) return;

    var slideWidth = getSlideWidth();
    if (slideWidth <= 0) return;

    index = Math.round(viewport.scrollLeft / slideWidth);
    index = Math.max(0, Math.min(index, getMaxIndex()));
    updateDots();
  }

  function goTo(targetIndex) {
    if (!isCarouselMode()) return;

    index = Math.max(0, Math.min(targetIndex, getMaxIndex()));
    viewport.scrollTo({
      left: index * getSlideWidth(),
      behavior: "smooth",
    });
    updateDots();
  }

  function scrollNext() {
    if (!isCarouselMode()) return;
    if (index < getMaxIndex()) {
      goTo(index + 1);
    }
  }

  function scrollPrev() {
    if (!isCarouselMode()) return;
    if (index > 0) {
      goTo(index - 1);
    }
  }

  function updateCarousel() {
    applySlideWidths();
    renderDots();
    updateDots();

    if (isCarouselMode()) {
      viewport.scrollTo({ left: index * getSlideWidth(), behavior: "auto" });
    } else {
      viewport.scrollLeft = 0;
      index = 0;
    }
  }

  viewport.addEventListener("keydown", function (event) {
    if (!isCarouselMode()) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    }
  });

  viewport.addEventListener(
    "scroll",
    function () {
      if (!isCarouselMode()) return;
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(syncIndexFromScroll, 80);
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchstart",
    function (event) {
      if (!isCarouselMode()) return;
      touchStartX = event.touches[0].clientX;
      touchDeltaX = 0;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    function (event) {
      if (!isCarouselMode()) return;
      touchDeltaX = event.touches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    function () {
      if (!isCarouselMode() || Math.abs(touchDeltaX) < 40) return;
      if (touchDeltaX < 0) {
        scrollNext();
      } else {
        scrollPrev();
      }
    },
    { passive: true }
  );

  mqlCarousel.addEventListener("change", function () {
    index = 0;
    updateCarousel();
  });

  window.addEventListener("resize", updateCarousel);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(updateCarousel).observe(viewport);
  }

  updateCarousel();
})();

(function () {
  function productIdFromSrc(src) {
    if (!src) return null;
    var match = src.match(/\/(TN|NA)-(\d+)/i);
    if (!match) return null;
    return match[1].toLowerCase() + "-" + parseInt(match[2], 10);
  }

  function productHref(id) {
    return "product.html?id=" + encodeURIComponent(id);
  }

  document.querySelectorAll(".sh2-shop__card-link, .sh2-trend__card-link").forEach(function (link) {
    if (link.closest(".sh2-shop__card--promo")) return;
    var img = link.querySelector('img[src*="TN-"], img[src*="NA-"]');
    if (!img) return;
    var id = productIdFromSrc(img.getAttribute("src"));
    if (id) link.setAttribute("href", productHref(id));
  });

  document.querySelectorAll(".sh2-na__card").forEach(function (card) {
    var img = card.querySelector(".sh2-na__media img");
    if (!img) return;
    var id = productIdFromSrc(img.getAttribute("src"));
    if (!id) return;

    card.style.cursor = "pointer";
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");

    card.addEventListener("click", function (event) {
      if (event.target.closest("button")) return;
      window.location.href = productHref(id);
    });

    card.addEventListener("keydown", function (event) {
      if (event.target.closest("button")) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = productHref(id);
      }
    });
  });
})();

(function () {
  var footerAccordions = document.querySelectorAll("[data-sh2-footer-acc]");
  if (!footerAccordions.length) return;

  var mobileQuery = window.matchMedia("(max-width: 768px)");

  function closeAllExcept(current) {
    footerAccordions.forEach(function (item) {
      if (item === current) return;
      item.classList.remove("is-open");
      var toggle = item.querySelector("[data-sh2-footer-acc-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  function resetAccordions() {
    footerAccordions.forEach(function (item) {
      item.classList.remove("is-open");
      var toggle = item.querySelector("[data-sh2-footer-acc-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  footerAccordions.forEach(function (item) {
    var toggle = item.querySelector("[data-sh2-footer-acc-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      if (!mobileQuery.matches) return;

      var isOpen = item.classList.contains("is-open");

      if (isOpen) {
        item.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        return;
      }

      closeAllExcept(item);
      item.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    });
  });

  mobileQuery.addEventListener("change", resetAccordions);
})();

(function () {
  var footerAccordions = document.querySelectorAll("[data-sh2-footer-acc]");
  if (!footerAccordions.length) return;

  var mobileQuery = window.matchMedia("(max-width: 768px)");

  function closeAllExcept(current) {
    footerAccordions.forEach(function (item) {
      if (item === current) return;
      item.classList.remove("is-open");
      var toggle = item.querySelector("[data-sh2-footer-acc-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  function resetAccordions() {
    footerAccordions.forEach(function (item) {
      item.classList.remove("is-open");
      var toggle = item.querySelector("[data-sh2-footer-acc-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  footerAccordions.forEach(function (item) {
    var toggle = item.querySelector("[data-sh2-footer-acc-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      if (!mobileQuery.matches) return;

      var isOpen = item.classList.contains("is-open");

      if (isOpen) {
        item.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        return;
      }

      closeAllExcept(item);
      item.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    });
  });

  mobileQuery.addEventListener("change", resetAccordions);
})();

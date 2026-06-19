(function () {
  "use strict";

  /* Countdown timer in announcement bar */
  var countdownEls = document.querySelectorAll("[data-boj-countdown]");
  var saleEnd = new Date();
  saleEnd.setDate(saleEnd.getDate() + 6);
  saleEnd.setHours(saleEnd.getHours() + 1);
  saleEnd.setMinutes(saleEnd.getMinutes() + 39);
  saleEnd.setSeconds(saleEnd.getSeconds() + 45);

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    var now = Date.now();
    var diff = Math.max(0, saleEnd - now);
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);

    countdownEls.forEach(function (el) {
      var d = el.querySelector("[data-boj-days]");
      var h = el.querySelector("[data-boj-hours]");
      var m = el.querySelector("[data-boj-minutes]");
      var s = el.querySelector("[data-boj-seconds]");
      if (d) d.textContent = pad(days);
      if (h) h.textContent = pad(hours);
      if (m) m.textContent = pad(minutes);
      if (s) s.textContent = pad(seconds);
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* Mobile menu */
  var toggle = document.querySelector("[data-boj-menu-toggle]");
  var closeBtn = document.querySelector("[data-boj-menu-close]");
  var mobileNav = document.getElementById("boj-mobile-nav");
  var overlay = document.querySelector("[data-boj-menu-overlay]");

  function openMenu() {
    if (!mobileNav) return;
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("boj-menu-open");
  }

  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    if (overlay) overlay.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("boj-menu-open");
  }

  if (toggle) toggle.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);
})();

(function () {
  "use strict";

  var root = document.querySelector("[data-boj-hero]");
  var slider = document.querySelector("[data-boj-hero-slider]");
  var slides = document.querySelectorAll("[data-boj-hero-slide]");
  var prevBtn = document.querySelector("[data-boj-hero-prev]");
  var nextBtn = document.querySelector("[data-boj-hero-next]");

  if (!root || !slider || slides.length === 0 || !prevBtn || !nextBtn) {
    return;
  }

  var imageExtensions = ["png", "webp", "jpg", "jpeg"];
  var activeSlide = Number(slider.dataset.currentSlide || 0);
  var timerId = null;
  var intervalMs = 8000;

  slides.forEach(function (slide) {
    var img = slide.querySelector("img[data-banner]");
    if (!img) return;

    var bannerNo = img.dataset.banner;
    var attempt = 1;

    img.addEventListener("error", function () {
      if (attempt >= imageExtensions.length) return;
      img.src = "assets/img/hero-banner-" + bannerNo + "." + imageExtensions[attempt];
      attempt += 1;
    });
  });

  function goToSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    slider.dataset.currentSlide = String(activeSlide);

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
  }

  function scheduleAutoplay() {
    if (timerId) window.clearInterval(timerId);
    timerId = window.setInterval(function () {
      goToSlide(activeSlide + 1);
    }, intervalMs);
  }

  function restartAutoplay(index) {
    goToSlide(index);
    scheduleAutoplay();
  }

  prevBtn.addEventListener("click", function () {
    restartAutoplay(activeSlide - 1);
  });

  nextBtn.addEventListener("click", function () {
    restartAutoplay(activeSlide + 1);
  });

  root.addEventListener("mouseenter", function () {
    if (timerId) window.clearInterval(timerId);
  });

  root.addEventListener("mouseleave", scheduleAutoplay);

  goToSlide(activeSlide);
  scheduleAutoplay();
})();

(function () {
  "use strict";

  var section = document.querySelector("[data-boj-concern]");
  if (!section) return;

  var viewport = section.querySelector("[data-boj-concern-viewport]");
  var track = section.querySelector("[data-boj-concern-track]");
  var cards = track ? track.querySelectorAll(".boj-concern__card") : [];
  var prevBtn = section.querySelector("[data-boj-concern-prev]");
  var nextBtn = section.querySelector("[data-boj-concern-next]");
  var tabs = section.querySelectorAll("[data-boj-concern-tab]");
  var index = 0;

  if (!viewport || !track || !cards.length) return;

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap || "14") || 14;
  }

  function getStep() {
    if (!cards[0]) return 0;
    return cards[0].offsetWidth + getGap();
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function getOffset() {
    var step = getStep();
    if (!step) return 0;
    return Math.min(index * step, getMaxOffset());
  }

  function updateCarousel() {
    var step = getStep();
    var maxOffset = getMaxOffset();
    var offset = getOffset();

    if (step && offset < maxOffset && index * step > maxOffset) {
      index = Math.ceil(maxOffset / step);
      offset = getOffset();
    }

    track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

    if (prevBtn) prevBtn.disabled = offset <= 0;
    if (nextBtn) nextBtn.disabled = offset >= maxOffset - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (getOffset() > 0) {
        index -= 1;
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (getOffset() < getMaxOffset() - 1) {
        index += 1;
        updateCarousel();
      }
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (item) {
        var isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    });
  });

  window.addEventListener("resize", updateCarousel);
  window.addEventListener("load", updateCarousel);

  cards.forEach(function (card) {
    var img = card.querySelector("img");
    if (img) img.addEventListener("load", updateCarousel);
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(updateCarousel);
  });

  updateCarousel();
})();

(function () {
  "use strict";

  var footerAccordion = document.querySelector("[data-boj-footer-accordion]");
  if (!footerAccordion) return;

  var items = footerAccordion.querySelectorAll("[data-boj-footer-acc]");
  var mobileQuery = window.matchMedia("(max-width: 768px)");

  function isMobileFooter() {
    return mobileQuery.matches;
  }

  function closeAll(except) {
    items.forEach(function (item) {
      if (item === except) return;

      item.classList.remove("is-open");

      var toggle = item.querySelector("[data-boj-footer-acc-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  function resetAccordion() {
    items.forEach(function (item) {
      item.classList.remove("is-open");

      var toggle = item.querySelector("[data-boj-footer-acc-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  items.forEach(function (item) {
    var toggle = item.querySelector("[data-boj-footer-acc-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      if (!isMobileFooter()) return;

      var isOpen = item.classList.contains("is-open");

      if (isOpen) {
        item.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        return;
      }

      closeAll(item);
      item.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    });
  });

  function handleViewportChange() {
    if (!isMobileFooter()) resetAccordion();
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(handleViewportChange);
  }

  window.addEventListener("resize", handleViewportChange);
})();

(function () {
  "use strict";

  var section = document.querySelector("[data-boj-reviews]");
  if (!section) return;

  var viewport = section.querySelector("[data-boj-reviews-viewport]");
  var track = section.querySelector("[data-boj-reviews-track]");
  var cards = track ? track.querySelectorAll(".boj-reviews__card") : [];
  var prevBtn = section.querySelector("[data-boj-reviews-prev]");
  var nextBtn = section.querySelector("[data-boj-reviews-next]");
  var index = 0;
  var mobileQuery = window.matchMedia("(max-width: 768px)");

  if (!viewport || !track || !cards.length) return;

  function isMobileCarousel() {
    return mobileQuery.matches;
  }

  function getStep() {
    if (!cards[0]) return 0;
    return viewport.clientWidth;
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function getOffset() {
    var step = getStep();
    if (!step) return 0;
    return Math.min(index * step, getMaxOffset());
  }

  function updateCarousel() {
    if (!isMobileCarousel()) {
      track.style.transform = "";
      index = 0;
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    var maxOffset = getMaxOffset();
    var offset = getOffset();

    track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

    if (prevBtn) prevBtn.disabled = offset <= 0;
    if (nextBtn) nextBtn.disabled = offset >= maxOffset - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (!isMobileCarousel()) return;
      if (getOffset() > 0) {
        index -= 1;
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!isMobileCarousel()) return;
      if (getOffset() < getMaxOffset() - 1) {
        index += 1;
        updateCarousel();
      }
    });
  }

  function handleViewportChange() {
    index = 0;
    updateCarousel();
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(handleViewportChange);
  }

  window.addEventListener("resize", updateCarousel);
  window.addEventListener("load", updateCarousel);

  cards.forEach(function (card) {
    var img = card.querySelector("img");
    if (img) img.addEventListener("load", updateCarousel);
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(updateCarousel);
  });

  updateCarousel();
})();

(function () {
  "use strict";

  function initKeditSection(section) {
    var viewport = section.querySelector("[data-boj-kedit-viewport]");
    var track = section.querySelector("[data-boj-kedit-track]");
    var cards = track ? track.querySelectorAll(".boj-kedit__card") : [];
    var prevBtn = section.querySelector("[data-boj-kedit-prev]");
    var nextBtn = section.querySelector("[data-boj-kedit-next]");
    var progress = section.querySelector("[data-boj-kedit-progress]");
    var tabs = section.querySelectorAll(".boj-kedit__tab");
    var index = 0;

    if (!viewport || !track || !cards.length) return;

    function getGap() {
      var styles = window.getComputedStyle(track);
      return parseFloat(styles.gap || styles.columnGap || "14") || 14;
    }

    function getStep() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function getMaxOffset() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    function getOffset() {
      var step = getStep();
      if (!step) return 0;
      return Math.min(index * step, getMaxOffset());
    }

    function updateCarousel() {
      var step = getStep();
      var maxOffset = getMaxOffset();
      var offset = getOffset();

      if (step && offset < maxOffset && index * step > maxOffset) {
        index = Math.ceil(maxOffset / step);
        offset = getOffset();
      }

      track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

      if (prevBtn) prevBtn.disabled = offset <= 0;
      if (nextBtn) nextBtn.disabled = offset >= maxOffset - 1;

      if (progress) {
        progress.style.width = maxOffset <= 0 ? "100%" : (offset / maxOffset) * 100 + "%";
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (getOffset() > 0) {
          index -= 1;
          updateCarousel();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (getOffset() < getMaxOffset() - 1) {
          index += 1;
          updateCarousel();
        }
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (item) {
          var isActive = item === tab;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", isActive ? "true" : "false");
        });
      });
    });

    window.addEventListener("resize", updateCarousel);
    window.addEventListener("load", updateCarousel);

    cards.forEach(function (card) {
      var img = card.querySelector("img");
      if (img) img.addEventListener("load", updateCarousel);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(updateCarousel);
    });

    updateCarousel();
  }

  document.querySelectorAll("[data-boj-kedit]").forEach(initKeditSection);
})();

(function () {
  "use strict";

  var root = document.querySelector("[data-boj-promo]");
  var slider = document.querySelector("[data-boj-promo-slider]");
  var slides = document.querySelectorAll("[data-boj-promo-slide]");
  var dots = document.querySelectorAll("[data-boj-promo-dot]");

  if (!root || !slider || slides.length === 0) {
    return;
  }

  var imageExtensions = ["png", "webp", "jpg", "jpeg"];
  var activeSlide = Number(slider.dataset.currentSlide || 0);
  var timerId = null;
  var intervalMs = 10000;

  slides.forEach(function (slide) {
    var img = slide.querySelector("img[data-promo-banner]");
    if (!img) return;

    var bannerNo = img.dataset.promoBanner;
    var attempt = 1;

    img.addEventListener("error", function () {
      if (attempt >= imageExtensions.length) return;
      img.src = "assets/img/banner-" + bannerNo + "." + imageExtensions[attempt];
      attempt += 1;
    });
  });

  function goToSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    slider.dataset.currentSlide = String(activeSlide);

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === activeSlide;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      dot.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function scheduleAutoplay() {
    if (timerId) window.clearInterval(timerId);
    timerId = window.setInterval(function () {
      goToSlide(activeSlide + 1);
    }, intervalMs);
  }

  function restartAutoplay(index) {
    goToSlide(index);
    scheduleAutoplay();
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      restartAutoplay(dotIndex);
    });
  });

  root.addEventListener("mouseenter", function () {
    if (timerId) window.clearInterval(timerId);
  });

  root.addEventListener("mouseleave", scheduleAutoplay);

  goToSlide(activeSlide);
  scheduleAutoplay();
})();

(function () {
  "use strict";

  var section = document.querySelector("[data-boj-ingredient]");
  if (!section) return;

  var viewport = section.querySelector("[data-boj-ingredient-viewport]");
  var track = section.querySelector("[data-boj-ingredient-track]");
  var cards = track ? track.querySelectorAll(".boj-ingredient__card") : [];
  var prevBtn = section.querySelector("[data-boj-ingredient-prev]");
  var nextBtn = section.querySelector("[data-boj-ingredient-next]");
  var progress = section.querySelector("[data-boj-ingredient-progress]");
  var index = 0;

  if (!viewport || !track || !cards.length) return;

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap || "14") || 14;
  }

  function getStep() {
    if (!cards[0]) return 0;
    return cards[0].offsetWidth + getGap();
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function getOffset() {
    var step = getStep();
    if (!step) return 0;
    return Math.min(index * step, getMaxOffset());
  }

  function updateCarousel() {
    var step = getStep();
    var maxOffset = getMaxOffset();
    var offset = getOffset();

    if (step && offset < maxOffset && index * step > maxOffset) {
      index = Math.ceil(maxOffset / step);
      offset = getOffset();
    }

    track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

    if (prevBtn) prevBtn.disabled = offset <= 0;
    if (nextBtn) nextBtn.disabled = offset >= maxOffset - 1;

    if (progress) {
      progress.style.width = maxOffset <= 0 ? "100%" : (offset / maxOffset) * 100 + "%";
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (getOffset() > 0) {
        index -= 1;
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (getOffset() < getMaxOffset() - 1) {
        index += 1;
        updateCarousel();
      }
    });
  }

  window.addEventListener("resize", updateCarousel);
  window.addEventListener("load", updateCarousel);

  cards.forEach(function (card) {
    var img = card.querySelector("img");
    if (img) img.addEventListener("load", updateCarousel);
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(updateCarousel);
  });

  updateCarousel();
})();

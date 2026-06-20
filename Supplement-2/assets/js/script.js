(function () {
  var menuToggle = document.querySelector("[data-sp2-menu-toggle]");
  var menuClose = document.querySelector("[data-sp2-menu-close]");
  var nav = document.querySelector(".sp2-header__nav");
  var overlay = document.querySelector("[data-sp2-menu-overlay]");

  if (!menuToggle || !nav || !overlay) return;

  function openMenu() {
    nav.classList.add("is-open");
    overlay.hidden = false;
    overlay.classList.add("is-visible");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      if (!nav.classList.contains("is-open")) {
        overlay.hidden = true;
      }
    }, 300);
  }

  menuToggle.addEventListener("click", function () {
    if (nav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (menuClose) {
    menuClose.addEventListener("click", closeMenu);
  }

  overlay.addEventListener("click", closeMenu);

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
})();

(function () {
  var hero = document.querySelector("[data-sp2-hero]");
  if (!hero) return;

  var slides = hero.querySelectorAll(".sp2-hero__slide");
  var prevBtn = hero.querySelector("[data-sp2-hero-prev]");
  var nextBtn = hero.querySelector("[data-sp2-hero-next]");
  var currentIndex = 0;
  var timerId = null;
  var intervalMs = 7000;

  if (!slides.length) return;

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });
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

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      restartAutoplay(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      restartAutoplay(currentIndex + 1);
    });
  }

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
  var section = document.querySelector("[data-sp2-products]");
  if (!section) return;

  var viewport = section.querySelector("[data-sp2-products-viewport]");
  var grid = section.querySelector("[data-sp2-products-grid]");
  var prevBtn = section.querySelector("[data-sp2-products-prev]");
  var nextBtn = section.querySelector("[data-sp2-products-next]");
  var tabs = section.querySelectorAll("[data-sp2-products-tab]");
  if (!viewport || !grid || !prevBtn || !nextBtn || !tabs.length) return;

  var helpers = window.SP2Helpers;
  var catalog = window.SP2_PRODUCTS;

  if (!helpers || !catalog) return;

  var index = 0;
  var mobileQuery = window.matchMedia("(max-width: 640px)");

  var productSets = {
    trending: [1, 2, 3, 4],
    vitamins: [5, 6, 7, 8]
  };

  function isMobileCarousel() {
    return mobileQuery.matches;
  }

  function getProductsByIds(ids) {
    return ids
      .map(function (id) {
        return catalog.find(function (item) {
          return item.id === id;
        });
      })
      .filter(Boolean);
  }

  function getCards() {
    return grid.querySelectorAll(".sp2-product-card");
  }

  function getGap() {
    return parseFloat(window.getComputedStyle(grid).gap) || 12;
  }

  function getStep() {
    var cards = getCards();
    if (!cards.length) return 0;
    return cards[0].offsetWidth + getGap();
  }

  function getMaxIndex() {
    return Math.max(0, getCards().length - 1);
  }

  function syncCardWidths() {
    if (!isMobileCarousel()) {
      grid.style.removeProperty("--sp2-product-card-width");
      return;
    }

    grid.style.setProperty("--sp2-product-card-width", viewport.clientWidth + "px");
  }

  function updateArrows() {
    var maxIndex = getMaxIndex();
    var hidePrev = !isMobileCarousel() || index <= 0;
    var hideNext = !isMobileCarousel() || index >= maxIndex;

    prevBtn.disabled = hidePrev;
    nextBtn.disabled = hideNext;
    prevBtn.classList.toggle("is-hidden", hidePrev);
    nextBtn.classList.toggle("is-hidden", hideNext);
  }

  function updateCarousel(animate) {
    if (!isMobileCarousel()) {
      index = 0;
      grid.style.transform = "";
      grid.style.transition = "";
      grid.style.removeProperty("--sp2-product-card-width");
      updateArrows();
      return;
    }

    syncCardWidths();

    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;

    if (animate === false) {
      grid.style.transition = "none";
    } else {
      grid.style.transition = "";
    }

    grid.style.transform = "translate3d(-" + index * getStep() + "px, 0, 0)";

    if (animate === false) {
      window.requestAnimationFrame(function () {
        grid.style.transition = "";
      });
    }

    updateArrows();
  }

  function goTo(nextIndex) {
    index = Math.max(0, Math.min(getMaxIndex(), nextIndex));
    updateCarousel(true);
  }

  function renderTab(tabName) {
    index = 0;
    var ids = productSets[tabName] || [];
    grid.innerHTML = getProductsByIds(ids).map(helpers.cardHtml).join("");

    grid.querySelectorAll("img").forEach(function (img) {
      img.setAttribute("draggable", "false");
      if (!img.complete) {
        img.addEventListener("load", function () {
          updateCarousel(false);
        });
      }
    });

    window.requestAnimationFrame(function () {
      updateCarousel(false);
    });
    window.setTimeout(function () {
      updateCarousel(false);
    }, 120);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var tabName = tab.getAttribute("data-sp2-products-tab");
      if (!tabName) return;

      tabs.forEach(function (item) {
        var isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      renderTab(tabName);
    });
  });

  prevBtn.addEventListener("click", function () {
    goTo(index - 1);
  });

  nextBtn.addEventListener("click", function () {
    goTo(index + 1);
  });

  window.addEventListener("resize", function () {
    updateCarousel(false);
  });

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", function () {
      updateCarousel(false);
    });
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(function () {
      updateCarousel(false);
    });
  }

  renderTab("trending");
})();

(function () {
  var promo = document.querySelector("[data-sp2-promo]");
  if (!promo) return;

  var slides = promo.querySelectorAll(".sp2-promo__slide");
  var prevBtn = promo.querySelector("[data-sp2-promo-prev]");
  var nextBtn = promo.querySelector("[data-sp2-promo-next]");
  var currentIndex = 0;

  if (!slides.length) return;

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });
  }

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
})();

function bindCarouselSwipe(viewport, options) {
  options = options || {};
  var threshold = options.threshold || 36;
  var isEnabled = options.isEnabled || function () {
    return true;
  };
  var onSwipeLeft = options.onSwipeLeft || function () {};
  var onSwipeRight = options.onSwipeRight || function () {};

  var startX = 0;
  var startY = 0;
  var active = false;
  var touchMode = false;
  var didSwipe = false;
  var lastSwipeAt = 0;

  function finishSwipe(endX, endY) {
    if (!active) return;
    active = false;

    if (!isEnabled()) return;

    var deltaX = startX - endX;
    var deltaY = Math.abs(startY - endY);

    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < deltaY) return;

    var now = Date.now();
    if (now - lastSwipeAt < 280) return;
    lastSwipeAt = now;

    didSwipe = true;
    window.setTimeout(function () {
      didSwipe = false;
    }, 320);

    if (deltaX > 0) onSwipeLeft();
    else onSwipeRight();
  }

  function onPointerDown(event) {
    if (!isEnabled()) return;
    if (event.pointerType === "touch") return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    active = true;
    startX = event.clientX;
    startY = event.clientY;

    if (viewport.setPointerCapture) {
      try {
        viewport.setPointerCapture(event.pointerId);
      } catch (error) {
        /* ignore */
      }
    }
  }

  function onPointerUp(event) {
    if (event.pointerType === "touch") return;

    if (viewport.releasePointerCapture) {
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch (error) {
        /* ignore */
      }
    }

    finishSwipe(event.clientX, event.clientY);
  }

  function onPointerCancel() {
    active = false;
    touchMode = false;
  }

  function onTouchStart(event) {
    if (!isEnabled()) return;
    if (!event.touches || !event.touches.length) return;

    touchMode = true;
    active = true;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }

  function onTouchEnd(event) {
    if (!touchMode) return;
    if (!event.changedTouches || !event.changedTouches.length) return;

    touchMode = false;
    finishSwipe(
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY
    );
  }

  function onClick(event) {
    if (!didSwipe) return;
    event.preventDefault();
    event.stopPropagation();
  }

  viewport.addEventListener("pointerdown", onPointerDown, true);
  viewport.addEventListener("pointerup", onPointerUp, true);
  viewport.addEventListener("pointercancel", onPointerCancel, true);
  function onTouchCancel() {
    touchMode = false;
    active = false;
  }

  viewport.addEventListener("touchstart", onTouchStart, { passive: true });
  viewport.addEventListener("touchend", onTouchEnd, { passive: true });
  viewport.addEventListener("touchcancel", onTouchCancel, { passive: true });
  viewport.addEventListener("click", onClick, true);
}

(function () {
  var section = document.querySelector("[data-sp2-brand]");
  if (!section) return;

  var carousel = section.querySelector(".sp2-brand__carousel");
  var viewport = section.querySelector("[data-sp2-brand-viewport]");
  var track = section.querySelector("[data-sp2-brand-track]");
  if (!carousel || !viewport || !track) return;

  var products = [
    {
      id: 5,
      img: "product-5.png",
      name: "Muscle Xcel Pre-Workout + Burner",
      meta: "Molten Mango | 30 Servings",
      rating: 4.7,
      reviews: 10,
      price: 1495,
      mrp: 2969,
      off: "50% OFF",
      emi: 498,
      cta: "Choose Options"
    },
    {
      id: 6,
      img: "product-6.png",
      name: "Muscle Xcel Whey Protein Isolate",
      meta: "Rich Chocolate | 2 lbs",
      rating: 4.8,
      reviews: 24,
      price: 2299,
      mrp: 3499,
      off: "34% OFF",
      emi: 766,
      cta: "Add To Cart"
    },
    {
      id: 7,
      img: "product-7.png",
      name: "Muscle Xcel Creatine Monohydrate",
      meta: "Unflavoured | 60 Servings",
      rating: 4.6,
      reviews: 18,
      price: 899,
      mrp: 1499,
      off: "40% OFF",
      emi: 299,
      cta: "Choose Options"
    },
    {
      id: 8,
      img: "product-8.png",
      name: "Muscle Xcel BCAA Recovery",
      meta: "Fruit Punch | 30 Servings",
      rating: 4.5,
      reviews: 12,
      price: 1199,
      mrp: 1999,
      off: "40% OFF",
      emi: 399,
      cta: "Add To Cart"
    },
    {
      id: 9,
      img: "product-9.png",
      name: "Muscle Xcel Serious Mass Gainer",
      meta: "Vanilla | 3 kg",
      rating: 4.7,
      reviews: 31,
      price: 2499,
      mrp: 3999,
      off: "37% OFF",
      emi: 833,
      cta: "Choose Options"
    },
    {
      id: 10,
      img: "product-10.png",
      name: "Muscle Xcel Fish Oil Omega 3",
      meta: "60 Softgel Capsules",
      rating: 4.4,
      reviews: 9,
      price: 699,
      mrp: 999,
      off: "30% OFF",
      emi: 233,
      cta: "Add To Cart"
    },
    {
      id: 11,
      img: "product-11.png",
      name: "Muscle Xcel Daily Multivitamin",
      meta: "90 Tablets | One Daily",
      rating: 4.6,
      reviews: 15,
      price: 549,
      mrp: 799,
      off: "31% OFF",
      emi: 183,
      cta: "Choose Options"
    }
  ];

  var index = 0;
  var gap = 14;
  var mobileQuery = window.matchMedia("(max-width: 640px)");

  function isMobileCarousel() {
    return mobileQuery.matches;
  }

  function formatRs(amount) {
    return "Rs." + amount.toLocaleString("en-IN");
  }

  function productLink(id) {
    if (window.SP2Helpers && window.SP2Helpers.productUrl) {
      return window.SP2Helpers.productUrl(id);
    }
    return "product.html?id=" + id;
  }

  function cardHtml(product) {
    var url = productLink(product.id);

    return (
      '<article class="sp2-brand-card">' +
      '<a href="' +
      url +
      '" class="sp2-brand-card__media">' +
      '<img src="assets/img/' +
      product.img +
      '" alt="' +
      product.name +
      '" loading="lazy" decoding="async" draggable="false" />' +
      "</a>" +
      '<div class="sp2-brand-card__body">' +
      '<div class="sp2-brand-card__rating">' +
      '<i class="fa-solid fa-star" aria-hidden="true"></i>' +
      "<span>" +
      product.rating +
      " (" +
      product.reviews +
      ")</span>" +
      "</div>" +
      '<h3 class="sp2-brand-card__name"><a href="' +
      url +
      '">' +
      product.name +
      "</a></h3>" +
      '<p class="sp2-brand-card__meta">' +
      product.meta +
      "</p>" +
      '<div class="sp2-brand-card__pricing">' +
      '<span class="sp2-brand-card__price">' +
      formatRs(product.price) +
      "</span>" +
      '<span class="sp2-brand-card__mrp">' +
      formatRs(product.mrp) +
      "</span>" +
      '<span class="sp2-brand-card__off">' +
      product.off +
      "</span>" +
      "</div>" +
      '<div class="sp2-brand-card__emi">' +
      "<span>or ₹" +
      product.emi +
      "/Month</span>" +
      '<button type="button" class="sp2-brand-card__emi-btn">Buy on EMI <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>' +
      "</div>" +
      '<div class="sp2-brand-card__actions">' +
      '<button type="button" class="sp2-brand-card__wish" aria-label="Add to wishlist">' +
      '<i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
      '<a href="' +
      url +
      '" class="sp2-brand-card__cta">' +
      (product.cta === "Add To Cart"
        ? '<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> '
        : '<i class="fa-solid fa-sliders" aria-hidden="true"></i> ') +
      product.cta +
      "</a>" +
      "</div></div></article>"
    );
  }

  function getCards() {
    return track.querySelectorAll(".sp2-brand-card");
  }

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap) || gap;
  }

  function getStep() {
    var cards = getCards();
    if (!cards.length) return 0;
    return cards[0].offsetWidth + getGap();
  }

  function getMaxScroll() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function getMaxIndex() {
    var step = getStep();
    var maxScroll = getMaxScroll();
    if (!step) return 0;
    return Math.max(0, Math.ceil(maxScroll / step));
  }

  function getOffsetForIndex(i) {
    var maxScroll = getMaxScroll();
    var maxIndex = getMaxIndex();
    if (i >= maxIndex) return maxScroll;
    return i * getStep();
  }

  function updateCarousel(animate) {
    if (!isMobileCarousel()) {
      index = 0;
      track.style.transform = "";
      track.style.transition = "";
      return;
    }

    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;

    if (animate === false) {
      track.style.transition = "none";
    } else {
      track.style.transition = "";
    }

    track.style.transform = "translate3d(-" + getOffsetForIndex(index) + "px, 0, 0)";

    if (animate === false) {
      window.requestAnimationFrame(function () {
        track.style.transition = "";
      });
    }
  }

  function goTo(nextIndex) {
    index = Math.max(0, Math.min(getMaxIndex(), nextIndex));
    updateCarousel(true);
  }

  function refreshCarousel() {
    window.requestAnimationFrame(function () {
      updateCarousel(false);
    });
  }

  track.innerHTML = products.map(cardHtml).join("");

  bindCarouselSwipe(viewport, {
    isEnabled: isMobileCarousel,
    onSwipeLeft: function () {
      goTo(index + 1);
    },
    onSwipeRight: function () {
      goTo(index - 1);
    }
  });

  track.querySelectorAll("img").forEach(function (img) {
    if (!img.complete) {
      img.addEventListener("load", refreshCarousel);
    }
  });

  window.addEventListener("resize", refreshCarousel);

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", refreshCarousel);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(refreshCarousel);
  }

  refreshCarousel();
  window.setTimeout(refreshCarousel, 120);
})();

(function () {
  var section = document.querySelector("[data-sp2-categories]");
  if (!section) return;

  var viewport = section.querySelector("[data-sp2-categories-viewport]");
  var track = section.querySelector("[data-sp2-categories-track]");
  if (!viewport || !track) return;

  var index = 0;
  var mobileQuery = window.matchMedia("(max-width: 640px)");

  function isMobileCarousel() {
    return mobileQuery.matches;
  }

  function getCards() {
    return track.querySelectorAll(".sp2-categories__card");
  }

  function getMaxIndex() {
    var cards = getCards();
    if (!cards.length) return 0;
    return Math.max(0, Math.ceil(cards.length / 2) - 1);
  }

  function getPageStep() {
    var cards = getCards();
    if (cards.length >= 2) {
      var gap = parseFloat(window.getComputedStyle(track).gap) || 10;
      return cards[0].offsetWidth + gap + cards[1].offsetWidth;
    }
    if (cards.length === 1) return cards[0].offsetWidth;
    return viewport.clientWidth;
  }

  function getOffsetForIndex(i) {
    return i * getPageStep();
  }

  function syncCardWidths() {
    if (!isMobileCarousel()) {
      track.style.removeProperty("--sp2-cat-card-width");
      return;
    }

    var gap = parseFloat(window.getComputedStyle(track).gap) || 10;
    var cardWidth = (viewport.clientWidth - gap) / 2;
    track.style.setProperty("--sp2-cat-card-width", cardWidth + "px");
  }

  function updateCarousel(animate) {
    if (!isMobileCarousel()) {
      index = 0;
      track.style.transform = "";
      track.style.transition = "";
      track.style.removeProperty("--sp2-cat-card-width");
      return;
    }

    syncCardWidths();

    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;

    if (animate === false) {
      track.style.transition = "none";
    } else {
      track.style.transition = "";
    }

    track.style.transform = "translate3d(-" + getOffsetForIndex(index) + "px, 0, 0)";

    if (animate === false) {
      window.requestAnimationFrame(function () {
        track.style.transition = "";
      });
    }
  }

  function goTo(nextIndex) {
    index = Math.max(0, Math.min(getMaxIndex(), nextIndex));
    updateCarousel(true);
  }

  function refreshCarousel() {
    window.requestAnimationFrame(function () {
      updateCarousel(false);
    });
  }

  bindCarouselSwipe(viewport, {
    isEnabled: isMobileCarousel,
    onSwipeLeft: function () {
      goTo(index + 1);
    },
    onSwipeRight: function () {
      goTo(index - 1);
    }
  });

  window.addEventListener("resize", refreshCarousel);

  track.querySelectorAll("img").forEach(function (img) {
    img.setAttribute("draggable", "false");
    if (!img.complete) {
      img.addEventListener("load", refreshCarousel);
    }
  });

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", refreshCarousel);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(refreshCarousel);
  }

  refreshCarousel();
  window.setTimeout(refreshCarousel, 120);
})();

(function () {
  var section = document.querySelector("[data-sp2-promos]");
  if (!section) return;

  var viewport = section.querySelector("[data-sp2-promos-viewport]");
  var track = section.querySelector("[data-sp2-promos-track]");
  var nextBtn = section.querySelector("[data-sp2-promos-next]");
  if (!viewport || !track || !nextBtn) return;

  var index = 0;
  var gap = 14;

  function getCards() {
    return track.querySelectorAll(".sp2-promos__card");
  }

  function getGap() {
    var styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap) || gap;
  }

  function getStep() {
    var cards = getCards();
    if (!cards.length) return 0;
    return cards[0].offsetWidth + getGap();
  }

  function getMaxScroll() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function getMaxIndex() {
    var step = getStep();
    var maxScroll = getMaxScroll();
    if (!step) return 0;
    return Math.max(0, Math.ceil(maxScroll / step));
  }

  function getOffsetForIndex(i) {
    var maxScroll = getMaxScroll();
    var maxIndex = getMaxIndex();
    if (i >= maxIndex) return maxScroll;
    return i * getStep();
  }

  function updateCarousel(animate) {
    var maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;
    if (index < 0) index = 0;

    if (animate === false) {
      track.style.transition = "none";
    } else {
      track.style.transition = "";
    }

    track.style.transform = "translate3d(-" + getOffsetForIndex(index) + "px, 0, 0)";

    if (animate === false) {
      window.requestAnimationFrame(function () {
        track.style.transition = "";
      });
    }

    var hideArrow = maxIndex === 0 || index >= maxIndex;
    nextBtn.disabled = hideArrow;
    nextBtn.classList.toggle("is-hidden", hideArrow);
  }

  function goTo(nextIndex) {
    index = Math.max(0, Math.min(getMaxIndex(), nextIndex));
    updateCarousel(true);
  }

  nextBtn.addEventListener("click", function () {
    goTo(index + 1);
  });

  window.addEventListener("resize", function () {
    updateCarousel(false);
  });

  track.querySelectorAll("img").forEach(function (img) {
    if (!img.complete) {
      img.addEventListener("load", function () {
        updateCarousel(false);
      });
    }
  });

  window.requestAnimationFrame(function () {
    updateCarousel(false);
  });
})();

(function () {
  var cols = document.querySelectorAll("[data-sp2-footer-col]");
  if (!cols.length) return;

  var mobileQuery = window.matchMedia("(max-width: 640px)");

  function isMobileFooter() {
    return mobileQuery.matches;
  }

  cols.forEach(function (col) {
    var btn = col.querySelector(".sp2-footer__accordion-btn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      if (!isMobileFooter()) return;

      var isOpen = col.classList.contains("is-open");

      col.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
    });
  });

  function resetFooterAccordions() {
    if (isMobileFooter()) return;

    cols.forEach(function (col) {
      col.classList.remove("is-open");
      var btn = col.querySelector(".sp2-footer__accordion-btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", resetFooterAccordions);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(resetFooterAccordions);
  }

  resetFooterAccordions();
})();

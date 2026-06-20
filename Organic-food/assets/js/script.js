(function () {
  "use strict";

  var viewport = document.querySelector("[data-org-categories-viewport]");
  var track = document.querySelector("[data-org-categories-track]");
  var nextBtn = document.querySelector("[data-org-categories-next]");

  if (viewport && track && nextBtn) {
    var scrollStep = 280;

    nextBtn.addEventListener("click", function () {
      var maxScroll = track.scrollWidth - viewport.clientWidth;
      var current = viewport.scrollLeft || 0;
      var next = current + scrollStep;

      if (next >= maxScroll - 4) {
        viewport.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        viewport.scrollTo({ left: next, behavior: "smooth" });
      }
    });
  }

  var heroSlider = document.querySelector("[data-org-hero-slider]");

  if (heroSlider) {
    var slides = heroSlider.querySelectorAll(".org-hero__slide");
    var dots = heroSlider.querySelectorAll("[data-org-hero-dot]");
    var activeIndex = 0;
    var autoplayTimer;

    function showSlide(index) {
      var total = slides.length;
      activeIndex = (index + total) % total;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === activeIndex);
      });

      dots.forEach(function (dot, i) {
        var isActive = i === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
        dot.tabIndex = isActive ? 0 : -1;
      });
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-org-hero-dot"));
        showSlide(index);
        startAutoplay();
      });
    });

    heroSlider.addEventListener("mouseenter", stopAutoplay);
    heroSlider.addEventListener("mouseleave", startAutoplay);

    showSlide(0);
    startAutoplay();
  }

  var products = document.querySelector("[data-org-products]");

  if (products) {
    var productsViewport = products.querySelector("[data-org-products-viewport]");
    var productsTrack = products.querySelector("[data-org-products-track]");
    var productsCards = products.querySelectorAll(".org-product-card");
    var productsNext = products.querySelector("[data-org-products-next]");
    var productsPrev = products.querySelector("[data-org-products-prev]");
    var productsIndex = 0;

    function getProductsVisible() {
      var styles = window.getComputedStyle(products);
      var visible = parseInt(styles.getPropertyValue("--org-product-visible"), 10);
      return Number.isFinite(visible) && visible > 0 ? visible : 4;
    }

    function getProductsStep() {
      var card = productsCards[0];
      if (!card) return 0;

      var styles = window.getComputedStyle(productsTrack);
      var gap = parseFloat(styles.columnGap || styles.gap || "16") || 16;
      return card.getBoundingClientRect().width + gap;
    }

    function getProductsMaxIndex() {
      var step = getProductsStep();
      if (!step) return 0;

      var visible = getProductsVisible();
      return Math.max(0, productsCards.length - visible);
    }

    function updateProductsSlider() {
      var maxIndex = getProductsMaxIndex();
      productsIndex = Math.max(0, Math.min(productsIndex, maxIndex));

      productsTrack.style.transform = "translate3d(-" + productsIndex * getProductsStep() + "px, 0, 0)";

      if (productsPrev) {
        productsPrev.disabled = productsIndex <= 0;
      }

      if (productsNext) {
        productsNext.disabled = productsIndex >= maxIndex;
      }
    }

    if (productsPrev) {
      productsPrev.addEventListener("click", function () {
        if (productsIndex > 0) {
          productsIndex -= 1;
          updateProductsSlider();
        }
      });
    }

    if (productsNext) {
      productsNext.addEventListener("click", function () {
        if (productsIndex < getProductsMaxIndex()) {
          productsIndex += 1;
          updateProductsSlider();
        }
      });
    }

    var productsResizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(productsResizeTimer);
      productsResizeTimer = window.setTimeout(updateProductsSlider, 120);
    });

    updateProductsSlider();
  }

  var bestsellers = document.querySelector("[data-org-bs]");

  if (bestsellers) {
    var bsViewport = bestsellers.querySelector("[data-org-bs-viewport]");
    var bsTrack = bestsellers.querySelector("[data-org-bs-track]");
    var bsCards = bestsellers.querySelectorAll(".org-product-card");
    var bsPrev = bestsellers.querySelector("[data-org-bs-prev]");
    var bsNext = bestsellers.querySelector("[data-org-bs-next]");
    var bsIndex = 0;

    function getBsVisible() {
      var styles = window.getComputedStyle(bestsellers);
      var visible = parseInt(styles.getPropertyValue("--org-bs-visible"), 10);
      return Number.isFinite(visible) && visible > 0 ? visible : 4;
    }

    function getBsStep() {
      var card = bsCards[0];
      if (!card) return 0;

      var styles = window.getComputedStyle(bsTrack);
      var gap = parseFloat(styles.columnGap || styles.gap || "16") || 16;
      return card.getBoundingClientRect().width + gap;
    }

    function getBsMaxIndex() {
      var step = getBsStep();
      if (!step) return 0;

      return Math.max(0, bsCards.length - getBsVisible());
    }

    function updateBsSlider() {
      var maxIndex = getBsMaxIndex();
      bsIndex = Math.max(0, Math.min(bsIndex, maxIndex));

      bsTrack.style.transform = "translate3d(-" + bsIndex * getBsStep() + "px, 0, 0)";

      if (bsPrev) {
        bsPrev.disabled = bsIndex <= 0;
      }

      if (bsNext) {
        bsNext.disabled = bsIndex >= maxIndex;
      }
    }

    if (bsPrev) {
      bsPrev.addEventListener("click", function () {
        if (bsIndex > 0) {
          bsIndex -= 1;
          updateBsSlider();
        }
      });
    }

    if (bsNext) {
      bsNext.addEventListener("click", function () {
        if (bsIndex < getBsMaxIndex()) {
          bsIndex += 1;
          updateBsSlider();
        }
      });
    }

    var bsResizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(bsResizeTimer);
      bsResizeTimer = window.setTimeout(updateBsSlider, 120);
    });

    updateBsSlider();
  }

  var testimonials = document.querySelector("[data-org-testimonials]");

  if (testimonials) {
    var tViewport = testimonials.querySelector("[data-org-testimonials-viewport]");
    var tTrack = testimonials.querySelector("[data-org-testimonials-track]");
    var tCards = testimonials.querySelectorAll("[data-org-testimonial-card]");
    var tPrev = testimonials.querySelector("[data-org-testimonials-prev]");
    var tNext = testimonials.querySelector("[data-org-testimonials-next]");
    var tDots = testimonials.querySelectorAll("[data-org-testimonials-dot]");
    var tIndex = 1;

    if (tIndex >= tCards.length) {
      tIndex = 0;
    }

    function centerTestimonial(i) {
      var card = tCards[i];
      if (!card || !tViewport) {
        return;
      }

      var offset = card.offsetLeft - (tViewport.clientWidth - card.offsetWidth) / 2;
      tTrack.style.transform = "translate3d(-" + Math.max(0, offset) + "px, 0, 0)";
    }

    function goToTestimonial(i) {
      if (!tCards.length) {
        return;
      }

      tIndex = ((i % tCards.length) + tCards.length) % tCards.length;

      tCards.forEach(function (card, ci) {
        card.classList.toggle("is-active", ci === tIndex);
      });

      tDots.forEach(function (dot, di) {
        var active = di === tIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
        dot.tabIndex = active ? 0 : -1;
      });

      centerTestimonial(tIndex);
    }

    if (tPrev) {
      tPrev.addEventListener("click", function () {
        goToTestimonial(tIndex - 1);
      });
    }

    if (tNext) {
      tNext.addEventListener("click", function () {
        goToTestimonial(tIndex + 1);
      });
    }

    tDots.forEach(function (dot, di) {
      dot.addEventListener("click", function () {
        goToTestimonial(di);
      });
    });

    var tResizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(tResizeTimer);
      tResizeTimer = window.setTimeout(function () {
        centerTestimonial(tIndex);
      }, 120);
    });

    window.addEventListener("load", function () {
      centerTestimonial(tIndex);
    });

    goToTestimonial(tIndex);
  }

  var shopCat = document.querySelector("[data-org-shop-cat]");

  if (shopCat) {
    var shopCatViewport = shopCat.querySelector("[data-org-shop-cat-viewport]");
    var shopCatSlides = shopCat.querySelectorAll(".org-shop-cat__slide");
    var shopCatIndex = 0;
    var shopCatTouchStartX = 0;
    var shopCatTouchDelta = 0;

    function isShopCatMobile() {
      return window.matchMedia("(max-width: 768px)").matches;
    }

    function getShopCatSlideWidth() {
      return shopCatViewport ? shopCatViewport.clientWidth : 0;
    }

    function goToShopCatSlide(index) {
      if (!shopCatViewport || !shopCatSlides.length || !isShopCatMobile()) {
        return;
      }

      shopCatIndex = Math.max(0, Math.min(index, shopCatSlides.length - 1));
      shopCatViewport.scrollTo({
        left: shopCatIndex * getShopCatSlideWidth(),
        behavior: "smooth"
      });
    }

    if (shopCatViewport) {
      shopCatViewport.addEventListener(
        "touchstart",
        function (event) {
          if (!isShopCatMobile()) {
            return;
          }
          shopCatTouchStartX = event.touches[0].clientX;
          shopCatTouchDelta = 0;
        },
        { passive: true }
      );

      shopCatViewport.addEventListener(
        "touchmove",
        function (event) {
          if (!isShopCatMobile()) {
            return;
          }
          shopCatTouchDelta = event.touches[0].clientX - shopCatTouchStartX;
        },
        { passive: true }
      );

      shopCatViewport.addEventListener(
        "touchend",
        function () {
          if (!isShopCatMobile() || Math.abs(shopCatTouchDelta) < 40) {
            return;
          }

          if (shopCatTouchDelta < 0) {
            goToShopCatSlide(shopCatIndex + 1);
          } else {
            goToShopCatSlide(shopCatIndex - 1);
          }
        },
        { passive: true }
      );

      shopCatViewport.addEventListener("scroll", function () {
        if (!isShopCatMobile()) {
          return;
        }

        var width = getShopCatSlideWidth();
        if (!width) {
          return;
        }

        shopCatIndex = Math.round(shopCatViewport.scrollLeft / width);
      });
    }

    var shopCatResizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(shopCatResizeTimer);
      shopCatResizeTimer = window.setTimeout(function () {
        if (isShopCatMobile()) {
          goToShopCatSlide(shopCatIndex);
        } else if (shopCatViewport) {
          shopCatViewport.scrollLeft = 0;
          shopCatIndex = 0;
        }
      }, 120);
    });
  }

  var promoStrip = document.querySelector("[data-org-promo-strip]");

  if (promoStrip) {
    var promoViewport = promoStrip.querySelector("[data-org-promo-strip-viewport]");
    var promoCards = promoStrip.querySelectorAll(".org-promo-strip__card");
    var promoIndex = 0;
    var promoTouchStartX = 0;
    var promoTouchDelta = 0;

    function isPromoStripMobile() {
      return window.matchMedia("(max-width: 768px)").matches;
    }

    function getPromoSlideWidth() {
      return promoViewport ? promoViewport.clientWidth : 0;
    }

    function goToPromoSlide(index) {
      if (!promoViewport || !promoCards.length || !isPromoStripMobile()) {
        return;
      }

      promoIndex = Math.max(0, Math.min(index, promoCards.length - 1));
      promoViewport.scrollTo({
        left: promoIndex * getPromoSlideWidth(),
        behavior: "smooth"
      });
    }

    if (promoViewport) {
      promoViewport.addEventListener(
        "touchstart",
        function (event) {
          if (!isPromoStripMobile()) {
            return;
          }
          promoTouchStartX = event.touches[0].clientX;
          promoTouchDelta = 0;
        },
        { passive: true }
      );

      promoViewport.addEventListener(
        "touchmove",
        function (event) {
          if (!isPromoStripMobile()) {
            return;
          }
          promoTouchDelta = event.touches[0].clientX - promoTouchStartX;
        },
        { passive: true }
      );

      promoViewport.addEventListener(
        "touchend",
        function () {
          if (!isPromoStripMobile()) {
            return;
          }

          if (Math.abs(promoTouchDelta) > 40) {
            goToPromoSlide(promoIndex + (promoTouchDelta < 0 ? 1 : -1));
          } else {
            goToPromoSlide(promoIndex);
          }

          promoTouchDelta = 0;
        },
        { passive: true }
      );

      promoViewport.addEventListener("scroll", function () {
        if (!isPromoStripMobile()) {
          return;
        }

        var width = getPromoSlideWidth();
        if (!width) {
          return;
        }

        promoIndex = Math.round(promoViewport.scrollLeft / width);
      });
    }

    var promoResizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(promoResizeTimer);
      promoResizeTimer = window.setTimeout(function () {
        if (isPromoStripMobile()) {
          goToPromoSlide(promoIndex);
        } else if (promoViewport) {
          promoViewport.scrollLeft = 0;
          promoIndex = 0;
        }
      }, 120);
    });
  }
})();

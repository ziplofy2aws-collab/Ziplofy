(function () {
  "use strict";

  var PRODUCTS = {
    "plunge-racerback-bra": {
      name: "aeroyama™ Plunge Racerback Bra",
      price: "₹ 1,999.00",
      image: "assets/img/NA-1.webp",
      images: ["assets/img/NA-1.webp", "assets/img/NA-5.webp", "assets/img/BS-6.webp", "assets/img/NA-4.webp"],
      colors: [
        { name: "Rust", hex: "#8b3a2f" },
        { name: "Charcoal", hex: "#4a4a4a" },
        { name: "Navy", hex: "#1e2a44" },
        { name: "Tan", hex: "#c4a882" },
        { name: "Black", hex: "#1a1a1a" },
        { name: "Blush", hex: "#e8b4b8" },
        { name: "White", hex: "#f5f5f5", border: true }
      ],
      about: "A deep plunge racerback bra with soft support for studio flow and everyday movement.",
      details: "Medium support · Racerback straps · Removable pads · Available in S–XXL",
      fabric: "Buttery-soft performance knit with 4-way stretch and sweat-wicking finish."
    },
    "henley-long-sleeve-tee": {
      name: "aeroyama™ Henley Long Sleeve Tee",
      price: "₹ 2,499.00",
      image: "assets/img/NA-2.webp",
      images: ["assets/img/NA-2.webp", "assets/img/BS-4.webp", "assets/img/BS-7.webp", "assets/img/NA-5.webp"],
      colors: [
        { name: "Charcoal", hex: "#5c5c5c" },
        { name: "Deep Red", hex: "#6b2d2d" },
        { name: "Black", hex: "#1a1a1a" },
        { name: "White", hex: "#f5f5f5", border: true }
      ],
      about: "A refined henley long sleeve built for warm-ups, cool-downs, and everyday wear.",
      details: "Button placket · Slim fit · Long sleeve · Available in S–XXL",
      fabric: "Soft stretch jersey with lasting recovery and a clean drape."
    },
    "foldover-capri": {
      name: "aeroyama™ Foldover Capri",
      price: "₹ 2,499.00",
      image: "assets/img/NA-3.webp",
      images: ["assets/img/NA-3.webp", "assets/img/BS-1.webp", "assets/img/BS-5.webp", "assets/img/NA-7.webp"],
      colors: [
        { name: "Brick", hex: "#a0522d" },
        { name: "Olive", hex: "#556b2f" },
        { name: "Grey", hex: "#7a7a7a" },
        { name: "Black", hex: "#1a1a1a" },
        { name: "Maroon", hex: "#5c1a2a" }
      ],
      about: "Foldover waistband capris designed for stretch, comfort, and a flattering silhouette.",
      details: "Foldover waist · Capri length · Flatlock seams · Available in S–XXL",
      fabric: "Performance knit with 4-way stretch and sweat-wicking finish."
    },
    "strappy-tank": {
      name: "flointense™ Strappy Tank",
      price: "₹ 2,199.00",
      image: "assets/img/NA-4.webp",
      images: ["assets/img/NA-4.webp", "assets/img/NA-5.webp", "assets/img/BS-2.webp", "assets/img/BS-3.webp"],
      colors: [
        { name: "Dark Green", hex: "#1e3d2f" },
        { name: "White", hex: "#f5f5f5", border: true },
        { name: "Black", hex: "#1a1a1a" }
      ],
      about: "A light strappy tank that moves with you through flow, strength, and training.",
      details: "Strappy back · Slim fit · Built-in soft support · Available in S–XXL",
      fabric: "Breathable stretch knit with a soft hand-feel and lasting recovery."
    },
    "overlay-zip-tank": {
      name: "aeroyama™ Overlay Zip Tank",
      price: "₹ 2,299.00",
      image: "assets/img/NA-5.webp",
      images: ["assets/img/NA-5.webp", "assets/img/NA-6.webp", "assets/img/BS-2.webp", "assets/img/NA-4.webp"],
      colors: [
        { name: "Sage", hex: "#5a6b4a" },
        { name: "Black", hex: "#1a1a1a" },
        { name: "Taupe", hex: "#8b7355" },
        { name: "White", hex: "#f5f5f5", border: true }
      ],
      about: "An overlay zip tank with clean lines for studio practice and everyday movement.",
      details: "Front zip · Overlay panels · Slim fit · Available in S–XXL",
      fabric: "Buttery-soft performance knit with 4-way stretch and sweat-wicking finish."
    },
    "quarter-zip-tank": {
      name: "flointense™ Quarter Zip Tank",
      price: "₹ 2,399.00",
      image: "assets/img/NA-6.webp",
      images: ["assets/img/NA-6.webp", "assets/img/NA-5.webp", "assets/img/BS-7.webp", "assets/img/BS-3.webp"],
      colors: [
        { name: "Taupe", hex: "#a08060" },
        { name: "Black", hex: "#1a1a1a" },
        { name: "Slate", hex: "#4a5568" },
        { name: "Burgundy", hex: "#6b2d2d" }
      ],
      about: "A quarter-zip tank for warm-ups, cool-downs, and layered studio looks.",
      details: "Quarter zip · Stand collar · Slim fit · Available in S–XXL",
      fabric: "Soft stretch knit with lasting recovery and a clean finish."
    },
    "performance-legging": {
      name: "aeroyama™ Performance Legging",
      price: "₹ 2,799.00",
      image: "assets/img/NA-7.webp",
      images: ["assets/img/NA-7.webp", "assets/img/BS-5.webp", "assets/img/BS-1.webp", "assets/img/NA-3.webp"],
      colors: [
        { name: "Black", hex: "#1a1a1a" },
        { name: "Forest", hex: "#3d4a3a" },
        { name: "Grey", hex: "#5c5c5c" },
        { name: "Indigo", hex: "#2c2c4a" },
        { name: "White", hex: "#f5f5f5", border: true }
      ],
      about: "High-performance leggings built for flow, strength, and all-day comfort.",
      details: "High rise · Full length · Hidden pocket · Available in S–XXL",
      fabric: "Buttery-soft performance knit with 4-way stretch and sweat-wicking finish."
    },
    "soft-stretch-short": {
      name: "flointense™ Soft Stretch Short",
      price: "₹ 1,799.00",
      image: "assets/img/NA-8.webp",
      images: ["assets/img/NA-8.webp", "assets/img/BS-8.webp", "assets/img/BS-2.webp", "assets/img/NA-3.webp"],
      colors: [
        { name: "Mauve", hex: "#8b6b8b" },
        { name: "Black", hex: "#1a1a1a" },
        { name: "Sand", hex: "#c4a882" },
        { name: "Teal", hex: "#4a6b6b" }
      ],
      about: "Soft stretch shorts made for warm practice, training, and easy everyday wear.",
      details: "Mid rise · Soft waistband · Short length · Available in S–XXL",
      fabric: "Breathable stretch knit with a soft hand-feel and lasting recovery."
    },
    "flared-yoga-pants": {
      name: "aeroyama™ Flared Yoga Pants",
      price: "₹ 2,999.00",
      image: "assets/img/BS-1.webp",
      images: ["assets/img/BS-1.webp", "assets/img/BS-5.webp", "assets/img/NA-3.webp", "assets/img/NA-7.webp"],
      colors: [
        { name: "Maroon", hex: "#6b2d3c" },
        { name: "Sky", hex: "#a8c4d4" },
        { name: "Navy", hex: "#1e2a44" },
        { name: "Olive", hex: "#5a6b3a" },
        { name: "Cream", hex: "#e8dcc8" },
        { name: "Black", hex: "#1a1a1a" }
      ],
      about: "Flared yoga pants with a clean silhouette for flow, strength, and everyday movement.",
      details: "High rise · Flared leg · Hidden pocket · Available in S–XXL",
      fabric: "Buttery-soft performance knit with 4-way stretch and sweat-wicking finish."
    },
    "muscle-tank": {
      name: "aeroyama™ Muscle Tank",
      price: "₹ 1,399.00",
      image: "assets/img/BS-2.webp",
      images: ["assets/img/BS-2.webp", "assets/img/BS-3.webp", "assets/img/NA-4.webp", "assets/img/BS-4.webp"],
      colors: [
        { name: "Taupe", hex: "#a89078" },
        { name: "Slate Blue", hex: "#7a8fa0" },
        { name: "Teal", hex: "#2f6b6b" },
        { name: "Black", hex: "#1a1a1a" },
        { name: "Burgundy", hex: "#6b2d2d" }
      ],
      about: "A classic muscle tank for training, warm-ups, and layered studio looks.",
      details: "Relaxed fit · Dropped armhole · Soft hem · Available in S–XXL",
      fabric: "Soft stretch jersey with lasting recovery and a clean drape."
    },
    "tank-top": {
      name: "aeroyama™ Tank Top",
      price: "₹ 1,499.00",
      image: "assets/img/BS-3.webp",
      images: ["assets/img/BS-3.webp", "assets/img/BS-2.webp", "assets/img/NA-5.webp", "assets/img/BS-4.webp"],
      colors: [
        { name: "Beige", hex: "#c4b09a" },
        { name: "Light Grey", hex: "#c8c8c8" },
        { name: "Charcoal", hex: "#3a3a3a" },
        { name: "Dark Red", hex: "#8b2a2a" },
        { name: "Brown Grey", hex: "#7a6b5a" }
      ],
      about: "An everyday tank top with a clean cut for practice and casual wear.",
      details: "Slim fit · Soft neckline · Lightweight · Available in S–XXL",
      fabric: "Breathable stretch knit with a soft hand-feel and lasting recovery."
    },
    "slim-fit-short-sleeve-tee": {
      name: "aeroyama™ Slim Fit Short Sleeve Tee",
      price: "₹ 1,799.00",
      image: "assets/img/BS-4.webp",
      images: ["assets/img/BS-4.webp", "assets/img/NA-2.webp", "assets/img/BS-2.webp", "assets/img/BS-7.webp"],
      colors: [
        { name: "Charcoal", hex: "#3d3d3d" },
        { name: "Dark Red", hex: "#7a2020" },
        { name: "Brown", hex: "#6b4a3a" },
        { name: "Light Grey", hex: "#c0c0c0" },
        { name: "Teal", hex: "#2f6b6b" },
        { name: "Navy", hex: "#1e2a55" }
      ],
      about: "A slim-fit short sleeve tee for training days and everyday layering.",
      details: "Slim fit · Short sleeve · Soft crew neck · Available in S–XXL",
      fabric: "Soft stretch jersey with lasting recovery and a clean drape."
    },
    "high-rise-legging": {
      name: "aeroyama™ High Rise Legging",
      price: "₹ 2,499.00",
      image: "assets/img/BS-5.webp",
      images: ["assets/img/BS-5.webp", "assets/img/NA-7.webp", "assets/img/BS-1.webp", "assets/img/NA-3.webp"],
      colors: [
        { name: "Black", hex: "#1a1a1a" },
        { name: "Slate", hex: "#4a5568" },
        { name: "Olive", hex: "#5a6b3a" },
        { name: "Wine", hex: "#6b2d3c" },
        { name: "Cream", hex: "#e8dcc8" }
      ],
      about: "High-rise leggings with a secure waistband for flow, strength, and everyday movement.",
      details: "High rise · Full length · Hidden zip pocket · Available in S–XXL",
      fabric: "Buttery-soft performance knit with 4-way stretch and sweat-wicking finish."
    },
    "soft-rib-bra": {
      name: "flointense™ Soft Rib Bra",
      price: "₹ 1,899.00",
      image: "assets/img/BS-6.webp",
      images: ["assets/img/BS-6.webp", "assets/img/NA-1.webp", "assets/img/NA-4.webp", "assets/img/NA-8.webp"],
      colors: [
        { name: "Clay", hex: "#8b5a4a" },
        { name: "Black", hex: "#1a1a1a" },
        { name: "White", hex: "#f5f5f5", border: true },
        { name: "Teal", hex: "#4a6b6b" },
        { name: "Blush", hex: "#e8b4b8" }
      ],
      about: "A soft rib bra with gentle support for studio flow and everyday comfort.",
      details: "Light-medium support · Soft rib · Removable pads · Available in S–XXL",
      fabric: "Soft rib knit with 4-way stretch and lasting recovery."
    },
    "everyday-hoodie": {
      name: "aeroyama™ Everyday Hoodie",
      price: "₹ 3,299.00",
      image: "assets/img/BS-7.webp",
      images: ["assets/img/BS-7.webp", "assets/img/NA-2.webp", "assets/img/BS-4.webp", "assets/img/NA-6.webp"],
      colors: [
        { name: "Grey", hex: "#5c5c5c" },
        { name: "Black", hex: "#1a1a1a" },
        { name: "Navy", hex: "#2c3a4a" },
        { name: "Ivory", hex: "#e8e4dc" },
        { name: "Burgundy", hex: "#6b2d2d" }
      ],
      about: "An everyday hoodie for warm-ups, cool-downs, and post-practice comfort.",
      details: "Relaxed fit · Kangaroo pocket · Soft fleece · Available in S–XXL",
      fabric: "Soft stretch fleece with lasting recovery and a clean finish."
    },
    "training-short": {
      name: "flointense™ Training Short",
      price: "₹ 1,599.00",
      image: "assets/img/BS-8.webp",
      images: ["assets/img/BS-8.webp", "assets/img/NA-8.webp", "assets/img/BS-2.webp", "assets/img/NA-3.webp"],
      colors: [
        { name: "Black", hex: "#1a1a1a" },
        { name: "Forest", hex: "#3d4a3a" },
        { name: "Grey", hex: "#7a7a7a" },
        { name: "Navy", hex: "#1e2a55" },
        { name: "Rust", hex: "#8b3a2f" }
      ],
      about: "Training shorts built for movement, breathability, and everyday workouts.",
      details: "Mid rise · Soft waistband · Short length · Available in S–XXL",
      fabric: "Breathable stretch knit with a soft hand-feel and lasting recovery."
    },
    "straight-fit-yoga-pants": {
      name: "aeroyama™ Straight Fit Yoga Pants",
      price: "₹ 2,299.00",
      image: "assets/img/BS-5.webp",
      images: ["assets/img/BS-5.webp", "assets/img/BS-1.webp", "assets/img/NA-2.webp", "assets/img/BS-8.webp"],
      colors: [
        { name: "Cocoa", hex: "#8b5a3c" },
        { name: "Sand", hex: "#c4a882" },
        { name: "Stone", hex: "#6b6b6b" },
        { name: "Ash", hex: "#9a9a9a" },
        { name: "Olive", hex: "#5a6b4a" },
        { name: "Forest", hex: "#3d4a3a" },
        { name: "Slate", hex: "#4a5568" },
        { name: "Navy", hex: "#1e2a55" },
        { name: "Charcoal", hex: "#2c2c2c" },
        { name: "Graphite", hex: "#5c5c5c" },
        { name: "Midnight Black", hex: "#111111" }
      ],
      about: "Straight-fit yoga pants built for flow, strength, and everyday movement. Clean silhouette with a soft stretch that holds through every practice.",
      details: "Mid-rise waistband · Straight leg · Hidden zip pocket · Flatlock seams · Available in S–XXL",
      fabric: "Buttery-soft performance knit with 4-way stretch, sweat-wicking finish, and lasting recovery."
    }
  };

  function getProductById(id) {
    if (id && PRODUCTS[id]) return PRODUCTS[id];
    return PRODUCTS["straight-fit-yoga-pants"];
  }

  function initHeroSlider() {
    var stage = document.querySelector(".hero__stage");
    var slides = document.querySelectorAll(".hero__slide");
    var prevBtn = document.querySelector(".hero__arrow--prev");
    var nextBtn = document.querySelector(".hero__arrow--next");
    if (!stage || slides.length < 2) return;

    var current = 0;
    var total = slides.length;
    var delay = 8000;
    var timer = null;
    var isTransitioning = false;

    function goTo(index) {
      if (isTransitioning) return;
      var next = ((index % total) + total) % total;
      if (next === current) return;

      isTransitioning = true;

      slides[current].classList.remove("is-active");
      slides[current].setAttribute("aria-hidden", "true");

      current = next;

      slides[current].classList.add("is-active");
      slides[current].setAttribute("aria-hidden", "false");

      window.setTimeout(function () {
        isTransitioning = false;
      }, 1000);
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
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

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        restartAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        restartAutoplay();
      });
    }

    stage.addEventListener("mouseenter", stopAutoplay);
    stage.addEventListener("mouseleave", startAutoplay);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    startAutoplay();
  }

  function initNewArrivalsSlider() {
    initProductSlider({
      viewport: ".na-slider__viewport",
      track: ".na-slider__track",
      cards: ".na-card",
      prevBtn: ".na-slider__btn--prev",
      nextBtn: ".na-slider__btn--next"
    });
  }

  function initBestSellersSlider() {
    initProductSlider({
      viewport: ".bs-slider__viewport",
      track: ".bs-slider__track",
      cards: ".bs-card",
      prevBtn: ".bs-slider__btn--prev",
      nextBtn: ".bs-slider__btn--next"
    });
  }

  function initProductSlider(config) {
    var viewport = document.querySelector(config.viewport);
    var track = document.querySelector(config.track);
    var cards = document.querySelectorAll(config.cards);
    var prevBtn = document.querySelector(config.prevBtn);
    var nextBtn = document.querySelector(config.nextBtn);
    if (!viewport || !track || !cards.length) return;

    var index = 0;

    function getVisibleCount() {
      var width = window.innerWidth;
      if (width <= 480) return 1;
      if (width <= 768) return 2;
      if (width <= 1024) return 3;
      return 4;
    }

    function getGap() {
      return window.innerWidth <= 768 ? 16 : 20;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    function getStep() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function update() {
      var max = getMaxIndex();
      index = Math.min(index, max);
      index = Math.max(0, index);

      var offset = index * getStep();
      track.style.transform = "translateX(-" + offset + "px)";

      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= max;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (index <= 0) return;
        index -= 1;
        update();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (index >= getMaxIndex()) return;
        index += 1;
        update();
      });
    }

    window.addEventListener("resize", update);
    update();
  }

  function initGallerySlider() {
    var viewport = document.querySelector(".gallery-slider__viewport");
    var track = document.querySelector(".gallery-slider__track");
    var cards = document.querySelectorAll(".gallery-card");
    var prevBtn = document.querySelector(".gallery-slider__btn--prev");
    var nextBtn = document.querySelector(".gallery-slider__btn--next");
    var dots = document.querySelectorAll(".gallery-slider__dot");
    if (!viewport || !track || !cards.length) return;

    var index = 0;
    var pageCount = dots.length || 4;

    function getVisibleCount() {
      var width = window.innerWidth;
      if (width <= 480) return 1;
      if (width <= 768) return 2;
      if (width <= 1024) return 3;
      return 4;
    }

    function getGap() {
      return 14;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    function getStep() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth + getGap();
    }

    function updateDots() {
      var max = getMaxIndex();
      var page = max <= 0 ? 0 : Math.round((index / max) * (pageCount - 1));
      page = Math.min(pageCount - 1, Math.max(0, page));

      dots.forEach(function (dot, i) {
        var active = i === page;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    function update() {
      var max = getMaxIndex();
      index = Math.min(index, max);
      index = Math.max(0, index);

      track.style.transform = "translateX(-" + index * getStep() + "px)";

      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= max;
      updateDots();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (index <= 0) return;
        index -= 1;
        update();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (index >= getMaxIndex()) return;
        index += 1;
        update();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var page = parseInt(dot.getAttribute("data-page"), 10);
        if (Number.isNaN(page)) return;
        var max = getMaxIndex();
        index = pageCount <= 1 ? 0 : Math.round((page / (pageCount - 1)) * max);
        update();
      });
    });

    window.addEventListener("resize", update);
    update();
  }

  function init() {
    initMobileNav();
    initShopFilters();
    initHeroSlider();
    initYogaCatsSlider();
    initNewArrivalsSlider();
    initBestSellersSlider();
    initGallerySlider();
    initProductPage();
  }

  function initYogaCatsSlider() {
    var track = document.getElementById("yogaCatsTrack");
    var dotsWrap = document.getElementById("yogaCatsDots");
    if (!track || !dotsWrap) return;

    var cards = track.querySelectorAll(".yoga-cat");
    if (!cards.length) return;

    dotsWrap.innerHTML = "";
    cards.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "yoga-cats__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Go to category " + (i + 1));
      if (i === 0) dot.setAttribute("aria-current", "true");
      dot.addEventListener("click", function () {
        var left = cards[i].offsetLeft - track.offsetLeft;
        track.scrollTo({ left: left, behavior: "smooth" });
      });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll(".yoga-cats__dot");

    function updateDots() {
      if (window.innerWidth > 700) return;
      var scrollLeft = track.scrollLeft;
      var cardWidth = cards[0].offsetWidth + 14;
      var index = Math.round(scrollLeft / cardWidth);
      index = Math.max(0, Math.min(cards.length - 1, index));

      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateDots();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener("resize", updateDots);
  }

  function initShopFilters() {
    var filters = document.getElementById("shopFilters");
    var openBtn = document.getElementById("shopFilterOpen");
    var closeBtn = document.getElementById("shopFilterClose");
    var applyBtn = document.getElementById("shopFilterApply");
    var clearBtn = document.getElementById("shopFilterClear");
    var overlay = document.getElementById("shopFilterOverlay");
    if (!filters || !openBtn) return;

    function openFilters() {
      filters.classList.add("is-open");
      if (overlay) {
        overlay.hidden = false;
        overlay.classList.add("is-open");
      }
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("filter-open");
      if (closeBtn) closeBtn.focus();
    }

    function closeFilters() {
      filters.classList.remove("is-open");
      if (overlay) {
        overlay.classList.remove("is-open");
        window.setTimeout(function () {
          if (!filters.classList.contains("is-open")) overlay.hidden = true;
        }, 350);
      }
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("filter-open");
      openBtn.focus();
    }

    openBtn.addEventListener("click", function () {
      if (filters.classList.contains("is-open")) {
        closeFilters();
      } else {
        openFilters();
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeFilters);
    if (applyBtn) applyBtn.addEventListener("click", closeFilters);
    if (overlay) overlay.addEventListener("click", closeFilters);

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        filters.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
          input.checked = false;
        });
        filters.querySelectorAll(".shop-size.is-active, .shop-color.is-active").forEach(function (el) {
          el.classList.remove("is-active");
        });
      });
    }

    filters.querySelectorAll(".shop-size").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.querySelectorAll(".shop-size").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });

    filters.querySelectorAll(".shop-color").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.classList.toggle("is-active");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && filters.classList.contains("is-open")) {
        closeFilters();
      }
    });
  }

  function initMobileNav() {
    var nav = document.getElementById("mobileNav");
    var openBtn = document.getElementById("navMenuOpen");
    var closeBtn = document.getElementById("navMenuClose");
    var overlay = document.getElementById("navMenuOverlay");
    var panel = document.getElementById("mobileNavPanel");
    if (!nav || !openBtn || !panel) return;

    function openNav() {
      nav.classList.add("is-open");
      nav.setAttribute("aria-hidden", "false");
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      if (closeBtn) closeBtn.focus();
    }

    function closeNav() {
      nav.classList.remove("is-open");
      nav.setAttribute("aria-hidden", "true");
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      openBtn.focus();
    }

    openBtn.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeNav);
    if (overlay) overlay.addEventListener("click", closeNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
      }
    });

    nav.querySelectorAll(".mobile-nav__links a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  function initProductPage() {
    if (!document.body.classList.contains("pdp-page")) return;

    var params = new URLSearchParams(window.location.search);
    var product = getProductById(params.get("id"));
    var mainImg = document.getElementById("pdpMainImage");
    var thumbsWrap = document.getElementById("pdpThumbs");
    var swatchesWrap = document.getElementById("pdpSwatches");
    var colorName = document.getElementById("pdpColorName");
    var stickyColor = document.getElementById("pdpStickyColor");
    var stickySize = document.getElementById("pdpStickySize");
    var sizes = document.querySelectorAll(".pdp-size");

    applyProduct(product);

    function applyProduct(item) {
      if (!item) return;

      document.title = item.name.replace("™", "") + " — YogaHaus";

      var title = document.getElementById("pdpTitle");
      var price = document.getElementById("pdpPrice");
      var breadcrumb = document.getElementById("pdpBreadcrumbName");
      var about = document.getElementById("pdpAbout");
      var details = document.getElementById("pdpDetails");
      var fabric = document.getElementById("pdpFabric");
      var stickyName = document.getElementById("pdpStickyName");
      var stickyPrice = document.getElementById("pdpStickyPrice");
      var stickyImage = document.getElementById("pdpStickyImage");

      if (title) title.textContent = item.name;
      if (price) price.textContent = item.price;
      if (breadcrumb) breadcrumb.textContent = item.name;
      if (about) about.textContent = item.about;
      if (details) details.textContent = item.details;
      if (fabric) fabric.textContent = item.fabric;
      if (stickyName) stickyName.textContent = item.name;
      if (stickyPrice) stickyPrice.textContent = item.price;
      if (stickyImage) stickyImage.src = item.image;

      if (mainImg) {
        mainImg.src = item.image;
        mainImg.alt = item.name.replace("™", "");
      }

      renderGallery(item.images || [item.image]);
      renderSwatches(item.colors || []);

      document.querySelectorAll(".pdp-review__product").forEach(function (el) {
        el.textContent = item.name;
      });
    }

    function renderGallery(images) {
      if (!thumbsWrap || !mainImg) return;
      thumbsWrap.innerHTML = "";

      images.forEach(function (src, index) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pdp-gallery__thumb" + (index === 0 ? " is-active" : "");
        btn.setAttribute("data-full", src);
        btn.setAttribute("aria-label", "View image " + (index + 1));

        var img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.width = 72;
        img.height = 72;
        img.decoding = "async";
        btn.appendChild(img);

        btn.addEventListener("click", function () {
          mainImg.src = src;
          thumbsWrap.querySelectorAll(".pdp-gallery__thumb").forEach(function (t) {
            t.classList.remove("is-active");
          });
          btn.classList.add("is-active");
        });

        thumbsWrap.appendChild(btn);
      });
    }

    function renderSwatches(colors) {
      if (!swatchesWrap) return;
      swatchesWrap.innerHTML = "";

      colors.forEach(function (color, index) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pdp-swatch" + (index === colors.length - 1 ? " is-active" : "");
        btn.style.background = color.hex;
        if (color.border) btn.style.borderColor = "#ccc";
        btn.setAttribute("data-color", color.name);
        btn.setAttribute("aria-label", color.name);

        btn.addEventListener("click", function () {
          swatchesWrap.querySelectorAll(".pdp-swatch").forEach(function (s) {
            s.classList.remove("is-active");
          });
          btn.classList.add("is-active");
          if (colorName) colorName.textContent = color.name;
          if (stickyColor) stickyColor.textContent = color.name;
        });

        swatchesWrap.appendChild(btn);
      });

      var active = colors[colors.length - 1];
      if (active) {
        if (colorName) colorName.textContent = active.name;
        if (stickyColor) stickyColor.textContent = active.name;
      }
    }

    sizes.forEach(function (size) {
      size.addEventListener("click", function () {
        sizes.forEach(function (s) {
          s.classList.remove("is-active");
        });
        size.classList.add("is-active");
        if (stickySize) {
          stickySize.textContent = size.getAttribute("data-size") || size.textContent.trim();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

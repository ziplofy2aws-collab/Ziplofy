/* ── Header — mobile menu ── */
(function () {
  var toggle = document.querySelector("[data-sh3-menu-toggle]");
  var closeBtn = document.querySelector("[data-sh3-menu-close]");
  var nav = document.getElementById("sh3-primary-nav");
  var overlay = document.querySelector("[data-sh3-menu-overlay]");

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

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
})();

/* ── Hero slider ── */
(function () {
  var hero = document.querySelector("[data-sh3-hero]");
  if (!hero) return;

  var slides = hero.querySelectorAll("[data-sh3-hero-slide]");
  var dots = hero.querySelectorAll("[data-sh3-hero-dot]");
  var currentIndex = 0;
  var timer = null;
  var delay = 5000;

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
    });
  }

  function next() {
    goTo(currentIndex + 1);
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

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var target = parseInt(dot.getAttribute("data-sh3-hero-dot"), 10);
      if (!isNaN(target)) {
        goTo(target);
        startAutoplay();
      }
    });
  });

  hero.addEventListener("mouseenter", stopAutoplay);
  hero.addEventListener("mouseleave", startAutoplay);
  hero.addEventListener("focusin", stopAutoplay);
  hero.addEventListener("focusout", startAutoplay);

  startAutoplay();
})();

/* ── Top Picks For You ── */
(function () {
  "use strict";

  var products = [
    {
      id: "nike-pegasus-42",
      badge: "BESTSELLER",
      badgeIcon: "fa-crown",
      image: "assets/img/Nike Pegasus 42.avif",
      alt: "Nike Pegasus 42 running shoes",
      name: "Nike Pegasus 42",
      count: 248,
      mrp: "₹12,999",
      price: "₹8,499",
      discount: "35% OFF",
      features: "Running | Cushioned Midsole",
      offer: "₹7,999",
    },
    {
      id: "nike-pegasus-premium",
      badge: "LIMITED EDITION",
      badgeIcon: "fa-gem",
      image: "assets/img/Nike Pegasus Premium.avif",
      alt: "Nike Pegasus Premium sneakers",
      name: "Nike Pegasus Premium",
      count: 312,
      mrp: "₹15,999",
      price: "₹10,499",
      discount: "34% OFF",
      features: "Mesh Upper | Lightweight",
      offer: "₹9,799",
    },
    {
      id: "nike-victori-one",
      badge: "TRENDING",
      badgeIcon: "fa-arrow-trend-up",
      image: "assets/img/Nike Victori One.avif",
      alt: "Nike Victori One lifestyle shoes",
      name: "Nike Victori One",
      count: 189,
      mrp: "₹9,999",
      price: "₹6,499",
      discount: "35% OFF",
      features: "All-Day Comfort | Retro Style",
      offer: "₹5,999",
    },
    {
      id: "nike-structure-26",
      badge: "NEW ARRIVAL",
      badgeIcon: "fa-sparkles",
      image: "assets/img/Nike Structure 26.avif",
      alt: "Nike Structure 26 stability runners",
      name: "Nike Structure 26",
      count: 156,
      mrp: "₹14,499",
      price: "₹9,999",
      discount: "31% OFF",
      features: "Premium Leather | Responsive Foam",
      offer: "₹9,299",
    },
    {
      id: "air-jordan-1-low",
      badge: "HOT PICK",
      badgeIcon: "fa-fire",
      image: "assets/img/Air Jordan 1 Low.avif",
      alt: "Air Jordan 1 Low sneakers",
      name: "Air Jordan 1 Low",
      count: 420,
      mrp: "₹10,999",
      price: "₹7,499",
      discount: "32% OFF",
      features: "Lifestyle Sneaker | Non-slip Outsole",
      offer: "₹6,999",
    },
    {
      id: "air-jordan-1-mid",
      badge: "BESTSELLER",
      badgeIcon: "fa-crown",
      image: "assets/img/Air Jordan 1 Mid.avif",
      alt: "Air Jordan 1 Mid basketball shoes",
      name: "Air Jordan 1 Mid",
      count: 421,
      mrp: "₹11,999",
      price: "₹8,499",
      discount: "29% OFF",
      features: "Premium Leather | Iconic Design",
      offer: "₹7,999",
    },
    {
      id: "nike-journey-run",
      badge: "LIMITED EDITION",
      badgeIcon: "fa-gem",
      image: "assets/img/Nike Journey Run.avif",
      alt: "Nike Journey Run cushioned shoes",
      name: "Nike Journey Run",
      count: 203,
      mrp: "₹13,999",
      price: "₹9,499",
      discount: "32% OFF",
      features: "Breathable Knit | Stability Support",
      offer: "₹8,899",
    },
    {
      id: "nike-revolution-8",
      badge: "TRENDING",
      badgeIcon: "fa-arrow-trend-up",
      image: "assets/img/Nike Revolution 8 EasyOn.avif",
      alt: "Nike Revolution 8 EasyOn running shoes",
      name: "Nike Revolution 8 EasyOn",
      count: 167,
      mrp: "₹8,499",
      price: "₹5,999",
      discount: "29% OFF",
      features: "Easy Slip-On | Max Cushion",
      offer: "₹5,499",
    },
    {
      id: "nike-air-force-1",
      badge: "NEW ARRIVAL",
      badgeIcon: "fa-sparkles",
      image: "assets/img/Nike Air Force 1 '07 LV8.avif",
      alt: "Nike Air Force 1 07 LV8 sneakers",
      name: "Nike Air Force 1 '07 LV8",
      count: 334,
      mrp: "₹9,499",
      price: "₹6,299",
      discount: "34% OFF",
      features: "Classic Low-Top | Everyday Wear",
      offer: "₹5,899",
    },
    {
      id: "nike-court-shot",
      badge: "HOT PICK",
      badgeIcon: "fa-fire",
      image: "assets/img/Nike Court Shot.avif",
      alt: "Nike Court Shot court sneakers",
      name: "Nike Court Shot",
      count: 126,
      mrp: "₹7,999",
      price: "₹4,999",
      discount: "38% OFF",
      features: "Court Ready | Flexible Sole",
      offer: "₹4,599",
    },
    {
      id: "air-jordan-skyline",
      badge: "BESTSELLER",
      badgeIcon: "fa-crown",
      image: "assets/img/Air Jordan Skyline Low.avif",
      alt: "Air Jordan Skyline Low sneakers",
      name: "Air Jordan Skyline Low",
      count: 198,
      mrp: "₹9,999",
      price: "₹6,999",
      discount: "30% OFF",
      features: "Street Style | Durable Outsole",
      offer: "₹6,499",
    },
  ];

  function createPickCard(product) {
    return (
      '<article class="swiper-slide sh3-pick-card" data-product-id="' +
      product.id +
      '">' +
      '<div class="sh3-pick-card__media">' +
      '<span class="sh3-pick-card__badge">' +
      '<i class="fa-solid ' +
      product.badgeIcon +
      '" aria-hidden="true"></i>' +
      product.badge +
      "</span>" +
      '<div class="sh3-pick-card__img-wrap">' +
      '<img class="sh3-pick-card__img" src="' +
      product.image +
      '" alt="' +
      product.alt +
      '" loading="lazy" decoding="async" />' +
      "</div>" +
      "</div>" +
      '<div class="sh3-pick-card__body">' +
      '<div class="sh3-pick-card__rating" aria-label="Rated 5 out of 5, ' +
      product.count +
      ' reviews">' +
      '<span class="sh3-pick-card__stars" aria-hidden="true">★★★★★</span>' +
      '<span class="sh3-pick-card__count">(' +
      product.count +
      ")</span>" +
      "</div>" +
      '<h3 class="sh3-pick-card__name" title="' +
      product.name +
      '">' +
      product.name +
      "</h3>" +
      '<p class="sh3-pick-card__price">' +
      "<del>" +
      product.mrp +
      "</del>" +
      "<strong>" +
      product.price +
      "</strong>" +
      "<em>" +
      product.discount +
      "</em>" +
      "</p>" +
      '<p class="sh3-pick-card__features">' +
      product.features +
      "</p>" +
      '<p class="sh3-pick-card__offer">' +
      '<i class="fa-solid fa-tag" aria-hidden="true"></i>' +
      "Offer Price <strong>" +
      product.offer +
      "</strong>" +
      "</p>" +
      '<label class="sh3-pick-card__compare">' +
      '<input type="checkbox" name="compare" value="' +
      product.id +
      '" />' +
      "Add to Compare" +
      "</label>" +
      "</div>" +
      "</article>"
    );
  }

  var track = document.querySelector("[data-sh3-picks-track]");
  var swiperEl = document.querySelector("[data-sh3-picks-swiper]");

  if (!track || !swiperEl || typeof Swiper === "undefined") return;

  track.innerHTML = products.map(createPickCard).join("");

  track
    .querySelectorAll(".sh3-pick-card[data-product-id]")
    .forEach(function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest(".sh3-pick-card__compare")) return;
        var id = card.getAttribute("data-product-id");
        if (id)
          window.location.href = "product.html?id=" + encodeURIComponent(id);
      });
    });

  new Swiper(swiperEl, {
    slidesPerView: 1.2,
    spaceBetween: 12,
    loop: true,
    speed: 450,
    grabCursor: true,
    watchOverflow: true,
    navigation: {
      nextEl: ".sh3-picks__arrow--next",
      prevEl: ".sh3-picks__arrow--prev",
    },
    breakpoints: {
      480: {
        slidesPerView: 2,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 14,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 16,
      },
    },
  });
})();

/* ── Promotional banner ── */
(function () {
  "use strict";

  document.querySelectorAll("[data-sh3-promo]").forEach(function (root) {
    var slides = root.querySelectorAll("[data-sh3-promo-slide]");
    var dots = root.querySelectorAll("[data-sh3-promo-dot]");
    var current = 0;
    var timer = null;

    if (!slides.length) return;

    function goTo(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });

      dots.forEach(function (dot, i) {
        var isActive = i === current;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = parseInt(dot.getAttribute("data-sh3-promo-dot"), 10);
        if (!isNaN(target)) goTo(target);
      });
    });

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        goTo(current + 1);
      }, 5000);

      root.addEventListener("mouseenter", function () {
        if (timer) window.clearInterval(timer);
      });

      root.addEventListener("mouseleave", function () {
        timer = window.setInterval(function () {
          goTo(current + 1);
        }, 5000);
      });
    }
  });
})();

/* ── Explore Bestsellers ── */
(function () {
  "use strict";

  var swiperEl = document.querySelector("[data-sh3-explore-swiper]");
  if (!swiperEl || typeof Swiper === "undefined") return;

  var sliderWrap = swiperEl.closest(".sh3-explore__slider-wrap");

  new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 16,
    speed: 450,
    grabCursor: true,
    watchOverflow: true,
    navigation: {
      nextEl: sliderWrap
        ? sliderWrap.querySelector(".sh3-explore__arrow--next")
        : null,
      prevEl: sliderWrap
        ? sliderWrap.querySelector(".sh3-explore__arrow--prev")
        : null,
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 22,
      },
    },
  });
})();

/* ── Be Limitless ── */
(function () {
  "use strict";

  var products = [
    {
      id: "kadam-velocity-pro",
      badge: "FREE SHOE BAG",
      badgeIcon: "fa-bag-shopping",
      image: "assets/img/Nike Court Shot.avif",
      alt: "Kadam Velocity Pro running shoes",
      name: "Kadam Velocity Pro",
      count: 25,
      mrp: "₹4,999",
      price: "₹2,999",
      discount: "40% OFF",
      features: "Lightweight Mesh | Cushioned Sole",
      offer: "₹2,799",
    },
    {
      id: "kadam-sprint-max",
      badge: "FREE INSOLES",
      badgeIcon: "fa-shoe-prints",
      image: "assets/img/Nike Revolution 8 EasyOn.avif",
      alt: "Kadam Sprint Max training shoes",
      name: "Kadam Sprint Max",
      count: 42,
      mrp: "₹5,499",
      price: "₹3,499",
      discount: "36% OFF",
      features: "Breathable Upper | Flexible Fit",
      offer: "₹3,199",
    },
    {
      id: "kadam-urban-flex",
      badge: "FREE LACES",
      badgeIcon: "fa-link",
      image: "assets/img/Nike Journey Run.avif",
      alt: "Kadam Urban Flex lifestyle sneakers",
      name: "Kadam Urban Flex",
      count: 18,
      mrp: "₹6,999",
      price: "₹4,499",
      discount: "36% OFF",
      features: "Street Style | All-Day Comfort",
      offer: "₹4,199",
    },
    {
      id: "kadam-trail-blaze",
      badge: "FREE SOCKS",
      badgeIcon: "fa-socks",
      image: "assets/img/Nike Structure 26.avif",
      alt: "Kadam Trail Blaze outdoor shoes",
      name: "Kadam Trail Blaze",
      count: 31,
      mrp: "₹7,999",
      price: "₹5,299",
      discount: "34% OFF",
      features: "Grip Outsole | Water Resistant",
      offer: "₹4,999",
    },
    {
      id: "kadam-air-glide",
      badge: "EXTRA 10% OFF",
      badgeIcon: "fa-percent",
      image: "assets/img/Nike Air Force 1 '07 LV8.avif",
      alt: "Kadam Air Glide classic sneakers",
      name: "Kadam Air Glide '07",
      count: 56,
      mrp: "₹8,499",
      price: "₹5,999",
      discount: "29% OFF",
      features: "Classic Design | Premium Leather",
      offer: "₹5,499",
    },
    {
      id: "kadam-power-step",
      badge: "FREE SHOE BAG",
      badgeIcon: "fa-bag-shopping",
      image: "assets/img/Air Jordan Skyline Low.avif",
      alt: "Kadam Power Step performance shoes",
      name: "Kadam Power Step",
      count: 22,
      mrp: "₹9,999",
      price: "₹6,999",
      discount: "30% OFF",
      features: "Responsive Foam | Stable Ride",
      offer: "₹6,499",
    },
    {
      id: "kadam-pace-runner",
      badge: "FREE INSOLES",
      badgeIcon: "fa-shoe-prints",
      image: "assets/img/Nike Victori One.avif",
      alt: "Kadam Pace Runner everyday shoes",
      name: "Kadam Pace Runner",
      count: 38,
      mrp: "₹5,999",
      price: "₹3,799",
      discount: "37% OFF",
      features: "Soft Cushion | Easy Wear",
      offer: "₹3,499",
    },
    {
      id: "kadam-elite-zoom",
      badge: "FREE LACES",
      badgeIcon: "fa-link",
      image: "assets/img/Nike Pegasus 42.avif",
      alt: "Kadam Elite Zoom running shoes",
      name: "Kadam Elite Zoom",
      count: 47,
      mrp: "₹11,999",
      price: "₹7,999",
      discount: "33% OFF",
      features: "Zoom Cushion | Speed Tuned",
      offer: "₹7,499",
    },
  ];

  function createCard(product) {
    return (
      '<article class="swiper-slide sh3-pick-card" data-product-id="' +
      product.id +
      '">' +
      '<div class="sh3-pick-card__media">' +
      '<span class="sh3-pick-card__badge">' +
      '<i class="fa-solid ' +
      product.badgeIcon +
      '" aria-hidden="true"></i>' +
      product.badge +
      "</span>" +
      '<div class="sh3-pick-card__img-wrap">' +
      '<img class="sh3-pick-card__img" src="' +
      product.image +
      '" alt="' +
      product.alt +
      '" loading="lazy" decoding="async" />' +
      "</div>" +
      "</div>" +
      '<div class="sh3-pick-card__body">' +
      '<div class="sh3-pick-card__rating" aria-label="Rated 5 out of 5, ' +
      product.count +
      ' reviews">' +
      '<span class="sh3-pick-card__stars" aria-hidden="true">★★★★★</span>' +
      '<span class="sh3-pick-card__count">(' +
      product.count +
      ")</span>" +
      "</div>" +
      '<h3 class="sh3-pick-card__name" title="' +
      product.name +
      '">' +
      product.name +
      "</h3>" +
      '<p class="sh3-pick-card__price">' +
      "<del>" +
      product.mrp +
      "</del>" +
      "<strong>" +
      product.price +
      "</strong>" +
      "<em>" +
      product.discount +
      "</em>" +
      "</p>" +
      '<p class="sh3-pick-card__features">' +
      product.features +
      "</p>" +
      '<p class="sh3-pick-card__offer sh3-pick-card__offer--coin">' +
      '<span class="sh3-pick-card__offer-coin" aria-hidden="true">%</span>' +
      "Offer Price <strong>" +
      product.offer +
      "</strong>" +
      "</p>" +
      "</div>" +
      "</article>"
    );
  }

  var track = document.querySelector("[data-sh3-limitless-track]");
  var swiperEl = document.querySelector("[data-sh3-limitless-swiper]");

  if (!track || !swiperEl || typeof Swiper === "undefined") return;

  track.innerHTML = products.map(createCard).join("");

  new Swiper(swiperEl, {
    slidesPerView: 1.2,
    spaceBetween: 12,
    loop: true,
    speed: 450,
    grabCursor: true,
    watchOverflow: true,
    navigation: {
      nextEl: ".sh3-limitless__arrow--next",
      prevEl: ".sh3-limitless__arrow--prev",
    },
    breakpoints: {
      480: {
        slidesPerView: 2,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 14,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 16,
      },
    },
  });
})();

/* ── Fresh Finds ── */
(function () {
  "use strict";

  var products = [
    {
      id: "kadam-air-runner-pro",
      badge: "FREE SHOE BAG",
      badgeIcon: "fa-bag-shopping",
      image: "assets/img/Air Jordan 1 Mid.avif",
      alt: "Kadam Air Runner Pro sneakers",
      name: "Kadam Air Runner Pro",
      count: 1812,
      mrp: "₹8,999",
      price: "₹5,999",
      discount: "33% OFF",
      features: "Breathable Mesh | Responsive Cushion",
      offer: "₹5,499",
      compare: true,
    },
    {
      id: "kadam-street-flex",
      image: "assets/img/Nike Pegasus Premium.avif",
      alt: "Kadam Street Flex running shoes",
      name: "Kadam Street Flex",
      count: 956,
      mrp: "₹7,499",
      price: "₹4,999",
      discount: "33% OFF",
      features: "Lightweight Build | Soft Insole",
      offer: "₹4,699",
      compare: true,
    },
    {
      id: "kadam-urban-glide",
      badge: "FREE INSOLES",
      badgeIcon: "fa-shoe-prints",
      image: "assets/img/Nike Pegasus 42.avif",
      alt: "Kadam Urban Glide trainers",
      name: "Kadam Urban Glide",
      count: 642,
      mrp: "₹9,999",
      price: "₹6,999",
      discount: "30% OFF",
      features: "Zoom Cushion | Speed Tuned",
      offer: "₹6,499",
      compare: true,
    },
    {
      id: "kadam-trail-master",
      image: "assets/img/Air Jordan 1 Low.avif",
      alt: "Kadam Trail Master outdoor shoes",
      name: "Kadam Trail Master",
      count: 428,
      mrp: "₹6,499",
      price: "₹4,299",
      discount: "34% OFF",
      features: "Grip Outsole | Durable Upper",
      offer: "₹3,999",
      compare: false,
    },
    {
      id: "kadam-comfort-plus",
      badge: "FREE LACES",
      badgeIcon: "fa-link",
      image: "assets/img/Nike Victori One.avif",
      alt: "Kadam Comfort Plus lifestyle shoes",
      name: "Kadam Comfort Plus",
      count: 315,
      mrp: "₹5,999",
      price: "₹3,999",
      discount: "33% OFF",
      features: "All-Day Comfort | Flexible Sole",
      offer: "₹3,699",
      compare: true,
    },
    {
      id: "kadam-sprint-lite",
      image: "assets/img/Nike Revolution 8 EasyOn.avif",
      alt: "Kadam Sprint Lite easy-on shoes",
      name: "Kadam Sprint Lite EasyOn",
      count: 267,
      mrp: "₹4,999",
      price: "₹3,299",
      discount: "34% OFF",
      features: "Slip-On Design | Max Cushion",
      offer: "₹2,999",
      compare: true,
    },
    {
      id: "kadam-court-edge",
      badge: "EXTRA 10% OFF",
      badgeIcon: "fa-percent",
      image: "assets/img/Nike Court Shot.avif",
      alt: "Kadam Court Edge basketball shoes",
      name: "Kadam Court Edge",
      count: 189,
      mrp: "₹7,999",
      price: "₹5,499",
      discount: "31% OFF",
      features: "Court Ready | Ankle Support",
      offer: "₹4,999",
      compare: false,
    },
    {
      id: "kadam-skyline-pro",
      image: "assets/img/Air Jordan Skyline Low.avif",
      alt: "Kadam Skyline Pro street sneakers",
      name: "Kadam Skyline Pro Low",
      count: 524,
      mrp: "₹8,499",
      price: "₹5,799",
      discount: "32% OFF",
      features: "Street Style | Premium Finish",
      offer: "₹5,399",
      compare: true,
    },
  ];

  function createCard(product) {
    var badgeHtml = product.badge
      ? '<span class="sh3-pick-card__badge">' +
        '<i class="fa-solid ' +
        product.badgeIcon +
        '" aria-hidden="true"></i>' +
        product.badge +
        "</span>"
      : "";

    var compareHtml = product.compare
      ? '<label class="sh3-pick-card__compare">' +
        '<input type="checkbox" name="compare" value="' +
        product.id +
        '" />' +
        "Add to Compare" +
        "</label>"
      : "";

    return (
      '<article class="swiper-slide sh3-pick-card" data-product-id="' +
      product.id +
      '">' +
      '<div class="sh3-pick-card__media">' +
      badgeHtml +
      '<div class="sh3-pick-card__img-wrap">' +
      '<img class="sh3-pick-card__img" src="' +
      product.image +
      '" alt="' +
      product.alt +
      '" loading="lazy" decoding="async" />' +
      "</div>" +
      "</div>" +
      '<div class="sh3-pick-card__body">' +
      '<div class="sh3-pick-card__rating" aria-label="Rated 5 out of 5, ' +
      product.count +
      ' reviews">' +
      '<span class="sh3-pick-card__stars" aria-hidden="true">★★★★★</span>' +
      '<span class="sh3-pick-card__count">(' +
      product.count +
      ")</span>" +
      "</div>" +
      '<h3 class="sh3-pick-card__name" title="' +
      product.name +
      '">' +
      product.name +
      "</h3>" +
      '<p class="sh3-pick-card__price">' +
      "<del>" +
      product.mrp +
      "</del>" +
      "<strong>" +
      product.price +
      "</strong>" +
      "<em>" +
      product.discount +
      "</em>" +
      "</p>" +
      '<p class="sh3-pick-card__features">' +
      product.features +
      "</p>" +
      '<p class="sh3-pick-card__offer sh3-pick-card__offer--coin sh3-pick-card__offer--green">' +
      '<span class="sh3-pick-card__offer-coin sh3-pick-card__offer-coin--green" aria-hidden="true">%</span>' +
      "Offer Price <strong>" +
      product.offer +
      "</strong>" +
      "</p>" +
      compareHtml +
      "</div>" +
      "</article>"
    );
  }

  var track = document.querySelector("[data-sh3-fresh-track]");
  var swiperEl = document.querySelector("[data-sh3-fresh-swiper]");

  if (!track || !swiperEl || typeof Swiper === "undefined") return;

  track.innerHTML = products.map(createCard).join("");

  new Swiper(swiperEl, {
    slidesPerView: 1.2,
    spaceBetween: 12,
    loop: true,
    speed: 450,
    grabCursor: true,
    watchOverflow: true,
    navigation: {
      nextEl: ".sh3-fresh__arrow--next",
      prevEl: ".sh3-fresh__arrow--prev",
    },
    breakpoints: {
      480: {
        slidesPerView: 2,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 14,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 16,
      },
    },
  });
})();

/* ── Blog posts ── */
(function () {
  "use strict";

  var swiperEl = document.querySelector("[data-sh3-blog-swiper]");
  if (!swiperEl || typeof Swiper === "undefined") return;

  var sliderWrap = swiperEl.closest(".sh3-blog__slider-wrap");

  new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 16,
    speed: 450,
    grabCursor: true,
    watchOverflow: true,
    navigation: {
      nextEl: sliderWrap
        ? sliderWrap.querySelector(".sh3-blog__arrow--next")
        : null,
      prevEl: sliderWrap
        ? sliderWrap.querySelector(".sh3-blog__arrow--prev")
        : null,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 18,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 22,
      },
    },
  });
})();

/* ── Footer promo tab ── */
(function () {
  var tab = document.querySelector("[data-sh3-promo-tab]");
  var closeBtn = document.querySelector("[data-sh3-promo-tab-close]");
  var storageKey = "sh3-promo-tab-dismissed";

  if (!tab) return;

  if (sessionStorage.getItem(storageKey) === "1") {
    tab.classList.add("is-hidden");
    tab.setAttribute("aria-hidden", "true");
    return;
  }

  if (!closeBtn) return;

  closeBtn.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    tab.classList.add("is-hidden");
    tab.setAttribute("aria-hidden", "true");
    sessionStorage.setItem(storageKey, "1");
  });
})();

(function () {
  "use strict";

  var DEFAULT_PRODUCT_ID = "baarbara-mixed-fruit";

  var PRODUCTS = {
    "baarbara-mixed-fruit": {
      id: "baarbara-mixed-fruit",
      name: "Baarbara Mixed Fruit Fermentation – Medium Light Roast",
      shortName: "Baarbara Mixed Fruit Fermentation – Medium Light Roast...",
      price: 1150,
      compareAt: null,
      image: "assets/img/BS-1.png",
      images: ["assets/img/BS-1.png", "assets/img/BS-2.png", "assets/img/BS-3.png"],
      rating: 5,
      reviews: 228,
      roast: "medium-light",
      origin: "India",
      grind: "whole-bean",
      description:
        "A vibrant microlot with layered fruit notes from controlled fermentation. Bright acidity, silky body, and a clean finish ideal for pour-over and AeroPress.",
    },
    "baarbara-intenso": {
      id: "baarbara-intenso",
      name: "Baarbara Intenso Naturals – Light Roast Microlot",
      shortName: "Baarbara Intenso Naturals – Light Roast Microlot",
      price: 1150,
      compareAt: null,
      image: "assets/img/BS-2.png",
      images: ["assets/img/BS-2.png", "assets/img/BS-1.png", "assets/img/BS-4.png"],
      rating: 5,
      reviews: 329,
      roast: "light",
      origin: "India",
      grind: "whole-bean",
      description:
        "Naturally processed beans with intense sweetness and florals. Light roast highlights clarity and a tea-like finish.",
    },
    "ratnagiri-whiskey": {
      id: "ratnagiri-whiskey",
      name: "Ratnagiri Whiskey Barrel Aged – Light Roast NanoLot",
      shortName: "Ratnagiri Whiskey Barrel Aged – Light Roast NanoLot",
      price: 2150,
      compareAt: 2450,
      image: "assets/img/BS-3.png",
      images: ["assets/img/BS-3.png", "assets/img/BS-4.png", "assets/img/BS-1.png"],
      rating: 4.5,
      reviews: 226,
      roast: "light",
      origin: "India",
      grind: "whole-bean",
      description:
        "Nano-lot aged in whiskey barrels for subtle oak and vanilla depth. Complex aromatics with a long, warming finish.",
    },
    "attikan-culture": {
      id: "attikan-culture",
      name: "Attikan Culture Process – Light Roast Microlot",
      shortName: "Attikan Culture Process – Light Roast Microlot",
      price: 1200,
      compareAt: null,
      image: "assets/img/BS-4.png",
      images: ["assets/img/BS-4.png", "assets/img/BS-3.png", "assets/img/BS-2.png"],
      rating: 4.5,
      reviews: 334,
      roast: "light",
      origin: "India",
      grind: "filter",
      description:
        "Culture-processed lot with tropical fruit and cocoa nib notes. Balanced sweetness perfect for filter coffee.",
    },
    "signature-espresso": {
      id: "signature-espresso",
      name: "Coffeeverse Signature Espresso Blend",
      shortName: "Coffeeverse Signature Espresso Blend",
      price: 999,
      compareAt: null,
      image: "assets/img/BS-1.png",
      images: ["assets/img/BS-1.png", "assets/img/BS-2.png"],
      rating: 5,
      reviews: 412,
      roast: "medium",
      origin: "Blend",
      grind: "espresso",
      description: "House espresso blend with chocolate, caramel, and a velvety crema.",
    },
    "cold-brew-pack": {
      id: "cold-brew-pack",
      name: "Cold Brew Summer Edit – Ground Coffee",
      shortName: "Cold Brew Summer Edit – Ground Coffee",
      price: 899,
      compareAt: 1099,
      image: "assets/img/BS-2.png",
      images: ["assets/img/BS-2.png", "assets/img/BS-4.png"],
      rating: 4.5,
      reviews: 156,
      roast: "medium-dark",
      origin: "Blend",
      grind: "cold-brew",
      description: "Coarse ground blend crafted for smooth, low-acid cold brew.",
    },
    "grand-reserve": {
      id: "grand-reserve",
      name: "Grand Reserve – High Altitude Microlot",
      shortName: "Grand Reserve – High Altitude Microlot",
      price: 1850,
      compareAt: null,
      image: "assets/img/BS-3.png",
      images: ["assets/img/BS-3.png", "assets/img/BS-1.png"],
      rating: 5,
      reviews: 98,
      roast: "light",
      origin: "India",
      grind: "whole-bean",
      description: "High-grown arabica with jasmine, bergamot, and honey sweetness.",
    },
    "sampler-pack": {
      id: "sampler-pack",
      name: "Taste the Terroir: Coffee Sampler Pack",
      shortName: "Taste the Terroir: Coffee Sampler Pack",
      price: 1499,
      compareAt: 1799,
      image: "assets/img/BS-4.png",
      images: ["assets/img/BS-4.png", "assets/img/BS-2.png", "assets/img/BS-3.png"],
      rating: 5,
      reviews: 267,
      roast: "mixed",
      origin: "India",
      grind: "whole-bean",
      description: "Four 50g bags showcasing our signature terroirs and roast profiles.",
    },
  };

  var REVIEW_ITEMS = [
    {
      date: "05/15/2026",
      author: "Nikhil Subramaniam",
      title: "Baarbara Estate this is my daily light roast now",
      body:
        "Bright, fruity, and incredibly clean in the cup. The natural sweetness comes through on pour-over and AeroPress. Easily one of the best light roasts I have tried from India.",
      rating: 5,
    },
    {
      date: "05/02/2026",
      author: "Priya Menon",
      title: "Perfect morning coffee",
      body:
        "Lovely aroma straight out of the bag. Brewed as V60 and got blueberry notes with a silky finish. Arrived fresh and well packed.",
      rating: 5,
    },
    {
      date: "04/28/2026",
      author: "Arjun Desai",
      title: "Complex and balanced",
      body:
        "The fermentation really shows — layered fruit without being overpowering. Works great as espresso too with a lighter extraction.",
      rating: 5,
    },
    {
      date: "04/19/2026",
      author: "Sneha Rao",
      title: "Great microlot for filter brewing",
      body:
        "Sweet, floral, and very consistent batch to batch. I have reordered twice already. Shipping was quick and the roast date was recent.",
      rating: 4,
    },
    {
      date: "04/08/2026",
      author: "Michael Fernandes",
      title: "Worth every rupee",
      body:
        "You can taste the care in processing. Chocolate undertones with a bright finish. My go-to weekend slow brew coffee.",
      rating: 5,
    },
  ];

  function getReviewDistribution(totalReviews) {
    var total = Math.max(totalReviews, 1);
    var five = Math.round(total * 0.559);
    var four = Math.max(total - five, 0);

    return {
      5: five,
      4: four,
      3: 0,
      2: 0,
      1: 0,
    };
  }

  function getAverageFromDistribution(distribution) {
    var total = 0;
    var count = 0;

    Object.keys(distribution).forEach(function (star) {
      var value = distribution[star];
      total += Number(star) * value;
      count += value;
    });

    if (!count) {
      return 5;
    }

    return Math.round((total / count) * 100) / 100;
  }

  var products = PRODUCTS;
  var defaultId = DEFAULT_PRODUCT_ID;
  var unitPrice = 0;

  function getProductId() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || defaultId;
  }

  function formatPrice(amount) {
    return (
      "Rs. " +
      amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function formatRoast(roast) {
    if (!roast) {
      return "Light";
    }

    return roast
      .split("-")
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function renderStars(container, rating) {
    if (!container) {
      return;
    }

    container.innerHTML = "";
    var full = Math.floor(rating);
    var half = rating % 1 >= 0.5;

    for (var i = 0; i < 5; i += 1) {
      var icon = document.createElement("i");

      if (i < full) {
        icon.className = "fa-solid fa-star";
      } else if (i === full && half) {
        icon.className = "fa-solid fa-star-half-stroke";
      } else {
        icon.className = "fa-regular fa-star";
      }

      icon.setAttribute("aria-hidden", "true");
      container.appendChild(icon);
    }
  }

  function buildGalleryImages(images) {
    var gallery = images.slice();

    while (gallery.length < 4 && images.length) {
      gallery.push(images[gallery.length % images.length]);
    }

    return gallery.slice(0, 5);
  }

  function initGallery(images, mainImg) {
    var thumbsWrap = document.querySelector("[data-cc-pdp-thumbs]");

    if (!thumbsWrap || !mainImg) {
      return;
    }

    thumbsWrap.innerHTML = "";
    var galleryImages = buildGalleryImages(images);

    galleryImages.forEach(function (src, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cc-pdp__thumb" + (index === 0 ? " is-active" : "");
      btn.setAttribute("aria-label", "View image " + (index + 1));

      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.width = 76;
      img.height = 76;
      img.decoding = "async";

      btn.appendChild(img);

      btn.addEventListener("click", function () {
        mainImg.src = src;
        thumbsWrap.querySelectorAll(".cc-pdp__thumb").forEach(function (thumb) {
          thumb.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });

      thumbsWrap.appendChild(btn);
    });
  }

  function getQtyValue() {
    var input = document.querySelector("[data-cc-pdp-qty]");
    return input ? Number(input.value) : 1;
  }

  function setQtyValue(value) {
    var next = Math.max(1, Math.min(10, value));
    var input = document.querySelector("[data-cc-pdp-qty]");
    var stickyQty = document.querySelector("[data-cc-pdp-sticky-qty]");

    if (input) {
      input.value = String(next);
    }

    if (stickyQty) {
      stickyQty.textContent = String(next);
    }

    updateSubtotal();
  }

  function updateSubtotal() {
    var subtotalEl = document.querySelector("[data-cc-pdp-subtotal]");

    if (!subtotalEl || !unitPrice) {
      return;
    }

    subtotalEl.textContent = formatPrice(unitPrice * getQtyValue());
  }

  function initQty() {
    var minus = document.querySelector("[data-cc-pdp-qty-minus]");
    var plus = document.querySelector("[data-cc-pdp-qty-plus]");

    if (minus) {
      minus.addEventListener("click", function () {
        setQtyValue(getQtyValue() - 1);
      });
    }

    if (plus) {
      plus.addEventListener("click", function () {
        setQtyValue(getQtyValue() + 1);
      });
    }
  }

  function initStickyQty() {
    var minus = document.querySelector("[data-cc-pdp-sticky-minus]");
    var plus = document.querySelector("[data-cc-pdp-sticky-plus]");

    if (minus) {
      minus.addEventListener("click", function () {
        setQtyValue(getQtyValue() - 1);
      });
    }

    if (plus) {
      plus.addEventListener("click", function () {
        setQtyValue(getQtyValue() + 1);
      });
    }
  }

  function initStickyBar(product) {
    var bar = document.querySelector("[data-cc-pdp-sticky]");
    var layout = document.querySelector("[data-cc-pdp-layout]");
    var img = document.querySelector("[data-cc-pdp-sticky-img]");
    var name = document.querySelector("[data-cc-pdp-sticky-name]");
    var price = document.querySelector("[data-cc-pdp-sticky-price]");

    if (!bar) {
      return;
    }

    if (img) {
      img.src = product.image;
      img.alt = product.name;
    }

    if (name) {
      name.textContent = product.name;
    }

    if (price) {
      price.textContent = formatPrice(product.price);
    }

    function toggleBar() {
      var show = false;

      if (layout) {
        var rect = layout.getBoundingClientRect();
        show = rect.bottom < 80;
      }

      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", show ? "false" : "true");
      document.body.classList.toggle("cc-pdp-has-sticky", show);
    }

    window.addEventListener("scroll", toggleBar, { passive: true });
    window.addEventListener("resize", toggleBar);
    toggleBar();
  }

  function initPills() {
    var grindWrap = document.querySelector('[data-cc-pdp-pills="grind"]');
    var grindLabel = document.querySelector("[data-cc-pdp-grind-label]");

    if (!grindWrap) {
      return;
    }

    var pills = grindWrap.querySelectorAll(".cc-pdp__pill");

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) {
          p.classList.remove("is-active");
        });
        pill.classList.add("is-active");

        if (grindLabel) {
          grindLabel.textContent = pill.textContent.trim();
        }
      });
    });
  }

  function initAccordion() {
    document.querySelectorAll("[data-cc-pdp-acc-toggle]").forEach(function (toggle) {
      var item = toggle.closest(".cc-pdp__acc-item");

      if (!item) {
        return;
      }

      toggle.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        item.classList.toggle("is-open", !isOpen);
        toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");

      });
    });
  }

  function renderSpecs(product) {
    var list = document.querySelector("[data-cc-pdp-specs]");

    if (!list) {
      return;
    }

    var originText =
      product.origin === "India"
        ? "Baarbara Estate, Chikmagalur, Karnataka"
        : product.origin + " – Specialty Selection";

    var rows = [
      ["Category", "CC Reserve – National Origins (Microlot)"],
      ["Origin", originText],
      ["Process", "Specialty Microlot – Small Batch"],
      ["Roast Level", formatRoast(product.roast)],
      ["Flavor Profile", "Berry-forward, chocolate undertones, floral complexity"],
      ["Best For", "Pour Over, Aeropress, Cold Brew, V60"],
      ["Acidity", "Medium-high, fruit-like"],
      ["Body", "Medium, juicy"],
    ];

    list.innerHTML = "";

    rows.forEach(function (row) {
      var li = document.createElement("li");
      li.innerHTML = "<strong>" + row[0] + ":</strong> " + row[1];
      list.appendChild(li);
    });
  }

  function buildStarsHtml(rating) {
    var full = Math.floor(rating);
    var half = rating % 1 >= 0.5;
    var html = "";

    for (var i = 0; i < 5; i += 1) {
      if (i < full) {
        html += '<i class="fa-solid fa-star"></i>';
      } else if (i === full && half) {
        html += '<i class="fa-solid fa-star-half-stroke"></i>';
      } else {
        html += '<i class="fa-regular fa-star"></i>';
      }
    }

    return html;
  }

  function renderReviewBars(distribution, total) {
    var wrap = document.querySelector("[data-cc-reviews-bars]");

    if (!wrap) {
      return;
    }

    wrap.innerHTML = "";
    var max = Math.max.apply(null, Object.keys(distribution).map(function (k) {
      return distribution[k];
    }));

    [5, 4, 3, 2, 1].forEach(function (star) {
      var count = distribution[star] || 0;
      var pct = max ? (count / max) * 100 : 0;
      var row = document.createElement("div");
      row.className = "cc-reviews__bar-row";

      var starsHtml = "";
      for (var i = 0; i < 5; i += 1) {
        starsHtml +=
          '<i class="' +
          (i < star ? "fa-solid fa-star" : "fa-regular fa-star") +
          '" aria-hidden="true"></i>';
      }

      row.innerHTML =
        '<span class="cc-reviews__bar-stars" aria-hidden="true">' +
        starsHtml +
        "</span>" +
        '<span class="cc-reviews__bar-track"><span class="cc-reviews__bar-fill" style="width:' +
        pct +
        '%"></span></span>' +
        '<span class="cc-reviews__bar-count">' +
        count +
        "</span>";

      wrap.appendChild(row);
    });
  }

  function renderReviewItem(review) {
    var article = document.createElement("article");
    article.className = "cc-reviews__item";

    article.innerHTML =
      '<div class="cc-reviews__item-top">' +
      '<span class="cc-reviews__item-stars" aria-hidden="true">' +
      buildStarsHtml(review.rating) +
      "</span>" +
      '<time class="cc-reviews__item-date" datetime="' +
      review.date +
      '">' +
      review.date +
      "</time>" +
      "</div>" +
      '<div class="cc-reviews__item-author">' +
      '<span class="cc-reviews__item-avatar" aria-hidden="true"><i class="fa-solid fa-user"></i></span>' +
      "<span>" +
      review.author +
      "</span>" +
      "</div>" +
      "<h3 class=\"cc-reviews__item-title\">" +
      review.title +
      "</h3>" +
      '<p class="cc-reviews__item-body">' +
      review.body +
      "</p>";

    return article;
  }

  function renderReviewsList(items) {
    var list = document.querySelector("[data-cc-reviews-list]");

    if (!list) {
      return;
    }

    list.innerHTML = "";
    items.forEach(function (review) {
      list.appendChild(renderReviewItem(review));
    });
  }

  function initReviewsSort(items) {
    var select = document.querySelector("[data-cc-reviews-sort]");

    if (!select) {
      return;
    }

    select.addEventListener("change", function () {
      var sorted = items.slice();

      if (select.value === "highest") {
        sorted.sort(function (a, b) {
          return b.rating - a.rating;
        });
      } else if (select.value === "lowest") {
        sorted.sort(function (a, b) {
          return a.rating - b.rating;
        });
      }

      renderReviewsList(sorted);
    });
  }

  function renderReviews(product) {
    var distribution = getReviewDistribution(product.reviews);
    var average = getAverageFromDistribution(distribution);
    var scoreEl = document.querySelector("[data-cc-reviews-score]");
    var countEl = document.querySelector("[data-cc-reviews-count]");
    var starsEl = document.querySelector("[data-cc-reviews-stars]");

    if (scoreEl) {
      scoreEl.textContent = average.toFixed(2) + " out of 5";
    }

    if (countEl) {
      countEl.textContent = String(product.reviews);
    }

    renderStars(starsEl, average);
    renderReviewBars(distribution, product.reviews);
    renderReviewsList(REVIEW_ITEMS);
    initReviewsSort(REVIEW_ITEMS);
  }

  function buildRelatedCard(item) {
    var card = document.createElement("article");
    var ratingLabel =
      item.rating + " out of 5 stars, " + item.reviews + " reviews";
    var productUrl = "product.html?id=" + item.id;

    card.className = "cc-pdp-related__card";
    card.innerHTML =
      '<div class="cc-pdp-related__media-wrap">' +
      '<a href="' +
      productUrl +
      '" class="cc-pdp-related__media-link">' +
      '<img src="' +
      item.image +
      '" alt="" width="280" height="280" loading="lazy" decoding="async" />' +
      "</a>" +
      '<div class="cc-pdp-related__overlay-btns">' +
      '<button type="button" class="cc-pdp-related__icon-btn" aria-label="Add to wishlist">' +
      '<i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
      '<a href="' +
      productUrl +
      '" class="cc-pdp-related__icon-btn" aria-label="Quick view">' +
      '<i class="fa-regular fa-eye" aria-hidden="true"></i></a>' +
      "</div></div>" +
      '<button type="button" class="cc-pdp-related__cart"><i class="fa-solid fa-cart-plus" aria-hidden="true"></i> Add to cart</button>' +
      '<a href="' +
      productUrl +
      '" class="cc-pdp-related__info">' +
      '<h3 class="cc-pdp-related__name">' +
      item.shortName +
      "</h3>" +
      '<div class="cc-pdp-related__rating" aria-label="' +
      ratingLabel +
      '">' +
      '<span class="cc-pdp-related__stars" aria-hidden="true">' +
      buildStarsHtml(item.rating) +
      "</span>" +
      '<span class="cc-pdp-related__count">' +
      item.reviews +
      "</span></div>" +
      '<span class="cc-pdp-related__reviews-label">reviews</span>' +
      '<p class="cc-pdp-related__price">' +
      formatPrice(item.price) +
      "</p></a>";

    var cartBtn = card.querySelector(".cc-pdp-related__cart");

    if (cartBtn) {
      cartBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
    }

    return card;
  }

  function initRelatedCarousel() {
    var root = document.querySelector("[data-cc-pdp-related]");
    var viewport = document.querySelector("[data-cc-pdp-related-viewport]");
    var track = document.querySelector("[data-cc-pdp-related-track]");
    var dotsWrap = document.querySelector("[data-cc-pdp-related-dots]");

    if (!root || !viewport || !track || !dotsWrap) {
      return;
    }

    var cards = track.querySelectorAll(".cc-pdp-related__card");
    var slideIndex = 0;
    var mobileQuery = window.matchMedia("(max-width: 768px)");
    var touchStartX = 0;
    var touchDeltaX = 0;
    var isDragging = false;

    function isCarouselMode() {
      return mobileQuery.matches && cards.length > 2;
    }

    function getSlideCount() {
      return Math.max(1, Math.ceil(cards.length / 2));
    }

    function buildDots() {
      dotsWrap.innerHTML = "";
      var count = getSlideCount();

      for (var i = 0; i < count; i += 1) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className =
          "cc-pdp-related__dot" + (i === slideIndex ? " is-active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Slide " + (i + 1));
        dot.setAttribute("aria-selected", i === slideIndex ? "true" : "false");
        dot.dataset.ccRelatedDot = String(i);
        dotsWrap.appendChild(dot);
      }
    }

    function syncDots() {
      var dots = dotsWrap.querySelectorAll("[data-cc-related-dot]");

      dots.forEach(function (dot, index) {
        var isActive = index === slideIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    function goToSlide(index) {
      if (!isCarouselMode()) {
        track.style.transform = "";
        return;
      }

      var slideCount = getSlideCount();
      slideIndex = Math.max(0, Math.min(index, slideCount - 1));
      track.style.transform =
        "translate3d(-" + slideIndex * viewport.offsetWidth + "px, 0, 0)";
      syncDots();
    }

    function refresh() {
      buildDots();

      if (!isCarouselMode()) {
        slideIndex = 0;
        track.style.transform = "";
        return;
      }

      goToSlide(Math.min(slideIndex, getSlideCount() - 1));
    }

    dotsWrap.addEventListener("click", function (event) {
      var dot = event.target.closest("[data-cc-related-dot]");

      if (!dot || !isCarouselMode()) {
        return;
      }

      goToSlide(Number(dot.dataset.ccRelatedDot));
    });

    viewport.addEventListener(
      "touchstart",
      function (event) {
        if (!isCarouselMode() || event.touches.length !== 1) {
          return;
        }

        touchStartX = event.touches[0].clientX;
        touchDeltaX = 0;
        isDragging = true;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      function (event) {
        if (!isDragging || !isCarouselMode() || event.touches.length !== 1) {
          return;
        }

        touchDeltaX = event.touches[0].clientX - touchStartX;

        if (Math.abs(touchDeltaX) > 8) {
          event.preventDefault();
        }
      },
      { passive: false }
    );

    viewport.addEventListener(
      "touchend",
      function () {
        if (!isDragging || !isCarouselMode()) {
          return;
        }

        isDragging = false;
        var threshold = 48;

        if (touchDeltaX <= -threshold) {
          goToSlide(slideIndex + 1);
        } else if (touchDeltaX >= threshold) {
          goToSlide(slideIndex - 1);
        } else {
          goToSlide(slideIndex);
        }

        touchDeltaX = 0;
      },
      { passive: true }
    );

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", refresh);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(refresh);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refresh, 120);
    });

    refresh();
  }

  function renderRelated(currentId) {
    var track = document.querySelector("[data-cc-pdp-related-track]");

    if (!track) {
      return;
    }

    track.innerHTML = "";

    Object.keys(products)
      .filter(function (id) {
        return id !== currentId;
      })
      .slice(0, 4)
      .forEach(function (id) {
        track.appendChild(buildRelatedCard(products[id]));
      });

    initRelatedCarousel();
  }

  function renderProduct(product) {
    document.title = product.name + " | Coffee Culture";
    unitPrice = product.price;

    var titleEl = document.querySelector("[data-cc-pdp-title]");
    var breadcrumbEl = document.querySelector("[data-cc-pdp-breadcrumb]");
    var priceEl = document.querySelector("[data-cc-pdp-price]");
    var compareEl = document.querySelector("[data-cc-pdp-compare]");
    var aboutEl = document.querySelector("[data-cc-pdp-about]");
    var tastingNotesEl = document.querySelector("[data-cc-pdp-tasting-notes]");
    var tastingDescEl = document.querySelector("[data-cc-pdp-tasting-desc]");
    var reviewsEl = document.querySelector("[data-cc-pdp-reviews]");
    var viewersEl = document.querySelector("[data-cc-pdp-viewers]");
    var mainImg = document.querySelector("[data-cc-pdp-main-img]");

    if (titleEl) {
      titleEl.textContent = product.name;
    }

    if (breadcrumbEl) {
      breadcrumbEl.textContent = product.shortName;
    }

    if (priceEl) {
      priceEl.textContent = formatPrice(product.price);
    }

    if (compareEl) {
      if (product.compareAt) {
        compareEl.textContent = formatPrice(product.compareAt);
        compareEl.hidden = false;
      } else {
        compareEl.hidden = true;
      }
    }

    if (aboutEl) {
      aboutEl.textContent = product.description;
    }

    if (tastingNotesEl) {
      tastingNotesEl.textContent =
        product.tastingNotes || "Blueberry | Raw Cacao | Marigold";
    }

    if (tastingDescEl) {
      tastingDescEl.textContent =
        product.tastingDesc ||
        "Berry-forward aromatics with chocolate undertones and a floral, juicy finish.";
    }

    if (reviewsEl) {
      reviewsEl.textContent = product.reviews + " reviews";
    }

    if (viewersEl) {
      viewersEl.textContent =
        60 + (product.reviews % 80) + " customers are viewing this product";
    }

    renderStars(document.querySelector("[data-cc-pdp-stars]"), product.rating);
    renderSpecs(product);

    if (mainImg) {
      mainImg.src = product.images[0];
      mainImg.alt = product.name;
    }

    initGallery(product.images, mainImg);
    renderReviews(product);
    renderRelated(product.id);
    initStickyBar(product);
    updateSubtotal();
  }

  var productId = getProductId();
  var product = products[productId] || products[defaultId];

  if (product) {
    renderProduct(product);
  }

  initQty();
  initStickyQty();
  initPills();
  initAccordion();
})();

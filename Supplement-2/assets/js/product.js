(function () {
  var root = document.querySelector("[data-sp2-product]");
  if (!root || !window.SP2_PRODUCTS || !window.SP2Helpers) return;

  var helpers = window.SP2Helpers;
  var params = new URLSearchParams(window.location.search);
  var productId = parseInt(params.get("id"), 10) || 1;
  var product = window.SP2_PRODUCTS.find(function (item) {
    return item.id === productId;
  });

  if (!product) {
    root.innerHTML =
      '<div class="sp2-pdp__not-found">' +
      "<h1>Product not found</h1>" +
      "<p>The product you are looking for does not exist.</p>" +
      '<a href="shop.html">Back to Shop</a>' +
      "</div>";
    document.title = "Product Not Found — Muscle Xcel";
    return;
  }

  document.title = product.name + " — Muscle Xcel";

  var SIZE_PRICES = {
    "250g": { price: product.price, was: product.was, save: product.save, perKg: 6796 },
    "1kg": { price: Math.round(product.price * 3.2), was: Math.round(product.was * 3.2), save: Math.round(product.save * 3.2), perKg: 5440 },
    "2.5kg": { price: Math.round(product.price * 7.5), was: Math.round(product.was * 7.5), save: Math.round(product.save * 7.5), perKg: 5090 },
    "5kg": { price: Math.round(product.price * 14), was: Math.round(product.was * 14), save: Math.round(product.save * 14), perKg: 4750 }
  };

  var FBT_ADDONS = [
    window.SP2_PRODUCTS.find(function (p) { return p.id === 3; }),
    window.SP2_PRODUCTS.find(function (p) { return p.id === 11; })
  ].filter(Boolean);

  var REVIEWS = [
    { stars: 5, title: "Impact Whey Protein", date: "07/05/26", author: "Vivek", text: "Excellent product! Mixes well and tastes great. Have been using it for 3 months and seeing good results." },
    { stars: 5, title: "Good stuff", date: "02/05/26", author: "Rahul", text: "Best whey protein at this price point. Delivery was fast and packaging was intact." },
    { stars: 4, title: "Solid choice", date: "28/04/26", author: "Priya", text: "Good quality protein. Kulfi flavour is unique and delicious. Would recommend to anyone starting out." },
    { stars: 5, title: "Great value", date: "15/04/26", author: "Amit", text: "Been ordering this regularly. Consistent quality every time. The savings on bulk orders are worth it." }
  ];

  var REVIEW_BARS = [
    { star: 5, count: 1400, pct: 52 },
    { star: 4, count: 767, pct: 28 },
    { star: 3, count: 89, pct: 3 },
    { star: 2, count: 12, pct: 0.5 },
    { star: 1, count: 4, pct: 0.2 }
  ];

  var currentSize = "250g";
  var qty = 1;
  var recIndex = 0;
  var reviewIndex = 0;

  function formatPerKg(amount) {
    return (
      "₹" +
      amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) +
      "/kg"
    );
  }

  function formatUnitPrice(amount) {
    return (
      "₹" +
      amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) +
      " per kg -"
    );
  }

  function setTextAll(selector, text) {
    root.querySelectorAll(selector).forEach(function (el) {
      el.textContent = text;
    });
  }

  function setHtmlAll(selector, html) {
    root.querySelectorAll(selector).forEach(function (el) {
      el.innerHTML = html;
    });
  }

  function updatePricing() {
    var sizeData = SIZE_PRICES[currentSize] || SIZE_PRICES["250g"];
    var total = sizeData.price * qty;

    setTextAll("[data-sp2-product-price]", helpers.formatPrice(total));
    setTextAll("[data-sp2-product-was]", helpers.formatWas(sizeData.was * qty));
    setTextAll("[data-sp2-product-save]", helpers.formatSave(sizeData.save * qty));
    setTextAll("[data-sp2-price-per]", formatPerKg(sizeData.perKg));
    setTextAll("[data-sp2-unit-price]", formatUnitPrice(sizeData.perKg));
  }

  function updateQtyDisplay() {
    root.querySelectorAll("[data-sp2-qty-val]").forEach(function (el) {
      el.textContent = String(qty);
    });
  }

  function initGallery() {
    var mainImg = root.querySelector("[data-sp2-product-main-img]");
    var thumbsCol = root.querySelector("[data-sp2-product-thumbs]");
    var imgSrc = "assets/img/" + product.img;

    if (mainImg) {
      mainImg.src = imgSrc;
      mainImg.alt = product.name;
    }

    if (!thumbsCol) return;

    thumbsCol.innerHTML = [0, 1, 2, 3, 4, 5]
      .map(function (i) {
        return (
          '<button type="button" class="sp2-pdp__thumb' +
          (i === 0 ? " is-active" : "") +
          '" data-sp2-thumb="' +
          i +
          '">' +
          '<img src="' +
          imgSrc +
          '" alt="' +
          product.name +
          " view " +
          (i + 1) +
          '" loading="lazy" decoding="async" />' +
          "</button>"
        );
      })
      .join("");

    thumbsCol.querySelectorAll("[data-sp2-thumb]").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        thumbsCol.querySelectorAll(".sp2-pdp__thumb").forEach(function (t) {
          t.classList.remove("is-active");
        });
        thumb.classList.add("is-active");
      });
    });
  }

  function initProductInfo() {
    setTextAll("[data-sp2-product-title]", product.name);
    setHtmlAll("[data-sp2-product-stars]", helpers.starsHtml(product.rating));
    setTextAll("[data-sp2-product-reviews-link]", product.reviews + " Reviews");
    setTextAll("[data-sp2-product-breadcrumb-name]", product.name);

    var descEl = root.querySelector("[data-sp2-product-desc]");
    if (descEl) descEl.textContent = product.desc;

    var scoreEl = root.querySelector("[data-sp2-review-score]");
    if (scoreEl) scoreEl.textContent = (product.rating - 0.29).toFixed(2);

    setHtmlAll("[data-sp2-review-stars]", helpers.starsHtml(product.rating - 0.29));
    setTextAll("[data-sp2-review-count]", "(" + product.reviews + " reviews)");

    updatePricing();
  }

  function fbtCardHtml(item, isAddon) {
    var url = helpers.productUrl(item.id);

    return (
      '<article class="sp2-pdp__fbt-card' +
      (isAddon ? " sp2-pdp__fbt-addon" : " sp2-pdp__fbt-card--current") +
      '">' +
      (isAddon
        ? '<input type="checkbox" class="sp2-pdp__fbt-check" checked data-sp2-fbt-item="' +
          item.id +
          '" />' +
          '<button type="button" class="sp2-pdp__fbt-edit" aria-label="Edit"><i class="fa-solid fa-pen"></i></button>'
        : "") +
      '<a href="' +
      url +
      '" class="sp2-pdp__fbt-card-img-link">' +
      '<img src="assets/img/' +
      item.img +
      '" alt="' +
      item.name +
      '" loading="lazy" decoding="async" />' +
      "</a>" +
      '<div class="sp2-pdp__fbt-card-body">' +
      '<h3 class="sp2-pdp__fbt-card-name"><a href="' +
      url +
      '">' +
      item.name +
      "</a></h3>" +
      '<p class="sp2-pdp__fbt-card-price">' +
      helpers.formatPrice(item.price) +
      "</p>" +
      '<div class="sp2-pdp__fbt-card-discount">' +
      '<span class="sp2-pdp__was">' +
      helpers.formatWas(item.was) +
      "</span>" +
      '<span class="sp2-pdp__save">' +
      helpers.formatSave(item.save) +
      "</span>" +
      "</div>" +
      '<p class="sp2-pdp__fbt-card-tax">Inclusive of all taxes</p>' +
      "</div></article>"
    );
  }

  function updateFbtTotal() {
    var total = product.price;
    var was = product.was;
    var checks = root.querySelectorAll("[data-sp2-fbt-item]:checked");

    checks.forEach(function (check) {
      var id = parseInt(check.getAttribute("data-sp2-fbt-item"), 10);
      var addon = FBT_ADDONS.find(function (p) { return p.id === id; });
      if (addon) {
        total += addon.price;
        was += addon.was;
      }
    });

    var save = was - total;
    var totalEl = root.querySelector("[data-sp2-fbt-total]");
    var wasEl = root.querySelector("[data-sp2-fbt-was]");
    var saveEl = root.querySelector("[data-sp2-fbt-save]");

    if (totalEl) {
      totalEl.textContent = helpers.formatPrice(total).replace("₹", "₹");
    }
    if (wasEl) {
      wasEl.textContent = helpers.formatPrice(was);
    }
    if (saveEl) {
      saveEl.textContent = helpers.formatSave(save).replace("Save ", "");
    }
  }

  function initFbt() {
    var currentEl = root.querySelector("[data-sp2-fbt-current]");
    var addonsEl = root.querySelector("[data-sp2-fbt-addons]");

    if (currentEl) currentEl.innerHTML = fbtCardHtml(product, false);
    if (addonsEl) {
      addonsEl.innerHTML = FBT_ADDONS.map(function (item) {
        return fbtCardHtml(item, true);
      }).join("");

      addonsEl.querySelectorAll("[data-sp2-fbt-item]").forEach(function (check) {
        check.addEventListener("change", updateFbtTotal);
      });
    }

    updateFbtTotal();
  }

  function initRecommended() {
    var track = root.querySelector("[data-sp2-product-related]");
    var viewport = root.querySelector("[data-sp2-rec-viewport]");
    var thumb = root.querySelector("[data-sp2-rec-thumb]");
    if (!track) return;

    var related = window.SP2_PRODUCTS.filter(function (item) {
      return item.id !== product.id;
    }).slice(0, 8);

    track.innerHTML = related.map(helpers.cardHtml).join("");

    var prevBtn = root.querySelector("[data-sp2-rec-prev]");
    var nextBtn = root.querySelector("[data-sp2-rec-next]");
    var visibleCount = 4;

    function getStep() {
      var card = track.querySelector(".sp2-product-card");
      if (!card) return 0;
      return card.offsetWidth + 16;
    }

    function getVisibleCount() {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 1100) return 2;
      return 4;
    }

    function updateScrollbar() {
      if (!thumb || !viewport) return;
      var cards = track.querySelectorAll(".sp2-product-card");
      var total = cards.length;
      if (total <= visibleCount) {
        thumb.style.width = "100%";
        thumb.style.left = "0";
        return;
      }

      var thumbWidth = (visibleCount / total) * 100;
      var maxIndex = total - visibleCount;
      var offset = maxIndex > 0 ? (recIndex / maxIndex) * (100 - thumbWidth) : 0;

      thumb.style.width = thumbWidth + "%";
      thumb.style.left = offset + "%";
    }

    function slideRec(dir) {
      var cards = track.querySelectorAll(".sp2-product-card");
      if (!cards.length) return;

      visibleCount = getVisibleCount();
      var maxIndex = Math.max(0, cards.length - visibleCount);
      recIndex = Math.max(0, Math.min(maxIndex, recIndex + dir));
      track.style.transform = "translateX(-" + recIndex * getStep() + "px)";
      updateScrollbar();
    }

    function resetCarousel() {
      visibleCount = getVisibleCount();
      var cards = track.querySelectorAll(".sp2-product-card");
      var maxIndex = Math.max(0, cards.length - visibleCount);
      recIndex = Math.min(recIndex, maxIndex);
      track.style.transform = "translateX(-" + recIndex * getStep() + "px)";
      updateScrollbar();
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { slideRec(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { slideRec(1); });

    window.addEventListener("resize", resetCarousel);
    resetCarousel();
  }

  function initReviewBars() {
    var barsEl = root.querySelector("[data-sp2-review-bars]");
    if (!barsEl) return;

    barsEl.innerHTML = REVIEW_BARS.map(function (row) {
      return (
        '<div class="sp2-pdp__review-bar-row">' +
        "<span>" +
        row.star +
        "</span>" +
        '<div class="sp2-pdp__review-bar"><div class="sp2-pdp__review-bar-fill" style="width:' +
        row.pct +
        '%"></div></div>' +
        "<span>" +
        (row.count >= 1000 ? Math.floor(row.count / 1000) + "K+" : row.count) +
        "</span></div>"
      );
    }).join("");
  }

  function reviewCardHtml(review) {
    var stars = "";
    var i;
    for (i = 1; i <= 5; i += 1) {
      stars += i <= review.stars
        ? '<i class="fa-solid fa-star"></i>'
        : '<i class="fa-regular fa-star"></i>';
    }

    return (
      '<article class="sp2-pdp__review-card">' +
      '<div class="sp2-pdp__review-card-top">' +
      '<span class="sp2-pdp__review-card-stars"><i class="fa-solid fa-star"></i> ' +
      review.stars +
      "</span>" +
      '<span class="sp2-pdp__review-verified">Verified Purchase</span>' +
      "</div>" +
      '<h3 class="sp2-pdp__review-card-title">' +
      review.title +
      "</h3>" +
      '<p class="sp2-pdp__review-card-meta">' +
      review.date +
      " by " +
      review.author +
      "</p>" +
      '<p class="sp2-pdp__review-card-text">' +
      review.text +
      "</p>" +
      '<button type="button" class="sp2-pdp__review-read-more">Read More</button>' +
      '<div class="sp2-pdp__review-card-actions">' +
      '<button type="button"><i class="fa-regular fa-thumbs-up"></i> Helpful (0)</button>' +
      '<button type="button"><i class="fa-regular fa-thumbs-down"></i> Unhelpful (0)</button>' +
      '<button type="button">Report</button>' +
      "</div></article>"
    );
  }

  function initReviews() {
    var track = root.querySelector("[data-sp2-review-track]");
    if (!track) return;

    track.innerHTML = REVIEWS.map(reviewCardHtml).join("");

    var prevBtn = root.querySelector("[data-sp2-review-prev]");
    var nextBtn = root.querySelector("[data-sp2-review-next]");

    function slideReview(dir) {
      var cards = track.querySelectorAll(".sp2-pdp__review-card");
      if (!cards.length) return;
      var maxIndex = Math.max(0, cards.length - 2);
      reviewIndex = Math.max(0, Math.min(maxIndex, reviewIndex + dir));
      var cardWidth = cards[0].offsetWidth + 16;
      track.style.transform = "translateX(-" + reviewIndex * cardWidth + "px)";
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { slideReview(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { slideReview(1); });

    root.querySelectorAll(".sp2-pdp__review-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        root.querySelectorAll(".sp2-pdp__review-filter").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    });
  }

  function initAccordions() {
    root.querySelectorAll(".sp2-pdp__accordion-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var panel = btn.parentElement.querySelector(".sp2-pdp__accordion-panel");

        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (panel) panel.classList.toggle("is-open", !expanded);
      });
    });
  }

  function initBuyControls() {
    root.querySelectorAll("[data-sp2-size-pill]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        var panel = pill.closest("[data-sp2-buy-panel], .sp2-pdp__hero-buy, .sp2-pdp__sidebar-buy") || root;
        var size = pill.getAttribute("data-sp2-size");
        currentSize = size;

        root.querySelectorAll("[data-sp2-size-pill]").forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-sp2-size") === size);
        });

        updatePricing();
      });
    });

    root.querySelectorAll("[data-sp2-qty-minus]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        qty = Math.max(1, qty - 1);
        updateQtyDisplay();
        updatePricing();
      });
    });

    root.querySelectorAll("[data-sp2-qty-plus]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        qty = Math.min(99, qty + 1);
        updateQtyDisplay();
        updatePricing();
      });
    });

    root.querySelectorAll("[data-sp2-flavour-select]").forEach(function (select) {
      select.addEventListener("change", function () {
        var val = select.value;
        root.querySelectorAll("[data-sp2-flavour-select]").forEach(function (s) {
          s.value = val;
        });
      });
    });

    root.querySelectorAll("[data-sp2-flavour-tab]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var tabName = tab.getAttribute("data-sp2-flavour-tab");
        root.querySelectorAll("[data-sp2-flavour-tab]").forEach(function (t) {
          var active = t.getAttribute("data-sp2-flavour-tab") === tabName;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
      });
    });
  }

  initGallery();
  initProductInfo();
  initFbt();
  initRecommended();
  initReviewBars();
  initReviews();
  initAccordions();
  initBuyControls();
})();

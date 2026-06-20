/**
 * Outdoor & Camping — product catalog, card links, product detail page
 */
(function (global) {
  "use strict";

  var IMG = "assets/img/";

  function createProduct(id, opts) {
    return {
      id: id,
      title: opts.title,
      subtitle: opts.subtitle || "Ultralight & compact trekking tee for trails and everyday wear.",
      series: opts.series || "Alpine Series",
      category: opts.category || "Trekking Apparel",
      image: opts.image,
      images: opts.images || [opts.image],
      price: opts.price,
      mrp: opts.mrp,
      rating: opts.rating != null ? opts.rating : 5,
      reviews: opts.reviews != null ? opts.reviews : 11,
      colors: opts.colors || []
    };
  }

  function imgPath(n) {
    return IMG + "product-" + n + ".webp";
  }

  function galleryFor(num) {
    var list = [];
    for (var i = 0; i < 4; i++) {
      var idx = ((num - 1 + i) % 7) + 1;
      list.push(imgPath(idx));
    }
    return list;
  }

  var catalog = [
    createProduct("product-1", {
      title: "Great Outdoors Trexy Unisex Full Sleeves Tshirt",
      image: imgPath(1),
      images: galleryFor(1),
      price: 999,
      mrp: 1499,
      colors: [
        { name: "Neon Green", image: imgPath(1) },
        { name: "Olive", image: imgPath(2) },
        { name: "Charcoal", image: imgPath(3) },
        { name: "Navy", image: imgPath(4) }
      ]
    }),
    createProduct("product-2", {
      title: "Great Outdoors Trexy Unisex Half Sleeves Tshirt",
      image: imgPath(2),
      images: galleryFor(2),
      price: 899,
      mrp: 1299,
      colors: [
        { name: "Charcoal", image: imgPath(2) },
        { name: "Blue", image: imgPath(3) },
        { name: "Black", image: imgPath(4) }
      ]
    }),
    createProduct("product-3", {
      title: "Great Outdoors Trexy Unisex Full Sleeves Tshirt",
      image: imgPath(3),
      images: galleryFor(3),
      price: 999,
      mrp: 1499,
      rating: 1,
      reviews: 1,
      colors: [
        { name: "Brown", image: imgPath(3) },
        { name: "Green", image: imgPath(4) },
        { name: "Navy", image: imgPath(5) }
      ]
    }),
    createProduct("product-4", {
      title: "Great Outdoors Trexy Unisex Full Sleeves Tshirt",
      image: imgPath(4),
      images: galleryFor(4),
      price: 999,
      mrp: 1499,
      colors: [
        { name: "Slate", image: imgPath(4) },
        { name: "Forest", image: imgPath(5) },
        { name: "Blue", image: imgPath(6) }
      ]
    }),
    createProduct("product-5", {
      title: "Great Outdoors Trexy Unisex Full Sleeves Tshirt",
      image: imgPath(5),
      images: galleryFor(5),
      price: 999,
      mrp: 1499,
      colors: [
        { name: "Grey", image: imgPath(5) },
        { name: "Olive", image: imgPath(6) },
        { name: "Orange", image: imgPath(7) }
      ]
    }),
    createProduct("product-6", {
      title: "Great Outdoors Trexy Unisex Full Sleeves Tshirt",
      image: imgPath(6),
      images: galleryFor(6),
      price: 999,
      mrp: 1499,
      colors: [
        { name: "Brown", image: imgPath(6) },
        { name: "Teal", image: imgPath(7) },
        { name: "Navy", image: imgPath(1) }
      ]
    }),
    createProduct("product-7", {
      title: "Great Outdoors Trexy Unisex Full Sleeves Tshirt",
      image: imgPath(7),
      images: galleryFor(7),
      price: 999,
      mrp: 1499,
      colors: [
        { name: "Slate", image: imgPath(7) },
        { name: "Olive", image: imgPath(1) },
        { name: "Gold", image: imgPath(2) }
      ]
    })
  ];

  var catalogById = {};
  var catalogByImage = {};

  catalog.forEach(function (item) {
    catalogById[item.id] = item;
    catalogByImage[item.image] = item;
    var base = item.image.split("/").pop();
    if (base) catalogByImage[base] = item;
  });

  global.et_PRODUCTS = catalog;
  global.et_PRODUCTS_BY_ID = catalogById;

  function formatRs(amount) {
    var n = Number(amount);
    if (isNaN(n)) return String(amount);
    return "₹ " + n.toLocaleString("en-IN");
  }

  function formatCompare(amount) {
    var n = Number(amount);
    if (isNaN(n)) return String(amount);
    return (
      "Rs. " +
      n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  }

  function buildProductUrl(id, imgSrc) {
    var url = "product.html?id=" + encodeURIComponent(id);
    if (imgSrc) url += "&img=" + encodeURIComponent(imgSrc);
    return url;
  }

  function normalizeTitle(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function findProductForCard(card) {
    var idAttr = card.getAttribute("data-et-product-id");
    if (idAttr && catalogById[idAttr]) return catalogById[idAttr];

    var titleEl = card.querySelector(".et-pcard__title");
    var titleText = "";
    if (titleEl) {
      var link = titleEl.querySelector("a");
      titleText = link ? link.textContent : titleEl.textContent;
    }
    titleText = titleText.replace(/\s+/g, " ").trim();
    if (titleText) {
      var norm = normalizeTitle(titleText);
      for (var i = 0; i < catalog.length; i++) {
        if (normalizeTitle(catalog[i].title) === norm) return catalog[i];
      }
    }

    var img = card.querySelector(".et-pcard__media img, .et-pcard__top img");
    if (!img) return null;
    var src = img.getAttribute("src") || "";
    return catalogByImage[src] || catalogByImage[src.split("/").pop()];
  }

  function setText(selector, text) {
    var el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  function wireProductCard(card, product) {
    if (!product || card.getAttribute("data-et-product-wired") === "true") return;

    var cardImg = card.querySelector(".et-pcard__media img, .et-pcard__top img");
    var cardImgSrc = cardImg ? cardImg.getAttribute("src") : "";
    var url = buildProductUrl(product.id, cardImgSrc);

    var media = card.querySelector(".et-pcard__media");
    if (media) media.href = url;

    var titleEl = card.querySelector(".et-pcard__title");
    if (titleEl) {
      var innerLink = titleEl.querySelector("a");
      if (innerLink) {
        innerLink.href = url;
      } else if (!titleEl.querySelector("a")) {
        var tLink = document.createElement("a");
        tLink.href = url;
        tLink.textContent = titleEl.textContent.trim();
        titleEl.textContent = "";
        titleEl.appendChild(tLink);
      }
    }

    card.setAttribute("data-et-product-id", product.id);
    card.setAttribute("data-et-product-wired", "true");
    card.style.cursor = "pointer";

    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button, select, input, textarea, label")) return;
      window.location.href = url;
    });
  }

  function initProductCardLinks(root) {
    var scope = root || document;
    scope.querySelectorAll(".et-pcard").forEach(function (card) {
      wireProductCard(card, findProductForCard(card));
    });
  }

  function buildThumbImages(images) {
    var thumbs = images.slice();
    while (thumbs.length < 8) {
      thumbs = thumbs.concat(images);
    }
    return thumbs.slice(0, 8);
  }

  function renderPdpGallery(product) {
    var thumbsWrap = document.querySelector("[data-et-pdp-thumbs]");
    var mainImg = document.querySelector("[data-et-pdp-main]");
    if (!thumbsWrap || !mainImg) return;

    var images = buildThumbImages(
      product.images && product.images.length ? product.images : [product.image]
    );

    thumbsWrap.innerHTML = images
      .map(function (src, i) {
        return (
          '<button type="button" class="et-pdp__thumb' +
          (i === 0 ? " is-active" : "") +
          '" data-et-pdp-thumb data-et-pdp-src="' +
          src +
          '" aria-label="View image ' +
          (i + 1) +
          '"' +
          (i === 0 ? ' aria-current="true"' : "") +
          '><img src="' +
          src +
          '" alt="" width="64" height="64" decoding="async" /></button>'
        );
      })
      .join("");

    mainImg.src = product.image;
    mainImg.alt = product.title;
  }

  function renderPdpColors(product) {
    var wrap = document.querySelector("[data-et-pdp-colors]");
    var label = document.querySelector("[data-et-color-label]");
    if (!wrap) return;

    var colors = product.colors && product.colors.length
      ? product.colors
      : [{ name: "Default", image: product.image }];

    wrap.innerHTML = colors
      .map(function (c, i) {
        return (
          '<button type="button" class="et-pdp__color-swatch' +
          (i === 0 ? " is-active" : "") +
          '" data-et-color-name="' +
          c.name +
          '" data-et-pdp-src="' +
          c.image +
          '" aria-label="' +
          c.name +
          '" aria-pressed="' +
          (i === 0 ? "true" : "false") +
          '"><img src="' +
          c.image +
          '" alt="" width="48" height="48" decoding="async" /></button>'
        );
      })
      .join("");

    if (label && colors[0]) label.textContent = colors[0].name;
  }

  function renderPdpRating(product) {
    var starsWrap = document.querySelector("[data-et-pdp-stars]");
    var reviewsEl = document.querySelector("[data-et-pdp-reviews-count]");
    if (!starsWrap) return;

    var rating = Math.max(0, Math.min(5, Math.round(product.rating)));
    var html = "";
    for (var s = 1; s <= 5; s++) {
      html +=
        '<i class="' +
        (s <= rating ? "fa-solid" : "fa-regular") +
        ' fa-star" aria-hidden="true"></i>';
    }
    starsWrap.innerHTML = html;

    if (reviewsEl) {
      reviewsEl.textContent =
        product.reviews + (product.reviews === 1 ? " review" : " reviews");
    }

    var ratingBlock = starsWrap.closest(".et-pdp__rating");
    if (ratingBlock) {
      ratingBlock.setAttribute(
        "aria-label",
        rating + " out of 5 stars, " + product.reviews + " reviews"
      );
    }
  }

  function initProductDetailPage() {
    if (!document.querySelector(".et-pdp")) return;

    var params = new URLSearchParams(window.location.search);
    var productId = params.get("id");
    var product =
      (productId && catalogById[productId]) || catalogById["product-1"] || catalog[0];

    var imgParam = params.get("img");
    if (imgParam) {
      var gallery = [imgParam].concat(
        (product.images || [product.image]).filter(function (src) {
          return src !== imgParam;
        })
      );
      product = Object.assign({}, product, {
        image: imgParam,
        images: gallery
      });
    }

    document.title = product.title + " — Outdoor & Camping";

    setText("[data-et-pdp-breadcrumb]", product.title);
    setText("[data-et-pdp-title]", product.title);
    setText("[data-et-pdp-subtitle]", product.subtitle);
    setText("[data-et-pdp-series]", product.series);
    setText("[data-et-pdp-price]", formatRs(product.price));

    renderPdpGallery(product);
    renderPdpColors(product);
    renderPdpRating(product);
  }

  /* PDP gallery & color swatches */
  function initPdpGallery() {
    var gallery = document.querySelector("[data-et-pdp-gallery]");
    if (!gallery) return;

    var mainImg = gallery.querySelector("[data-et-pdp-main]");
    var thumbs = gallery.querySelectorAll("[data-et-pdp-thumb]");
    if (!mainImg || !thumbs.length) return;

    function setMainImage(src) {
      if (!src) return;
      mainImg.src = src;
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-et-pdp-src");
        if (!src) return;

        thumbs.forEach(function (t) {
          t.classList.remove("is-active");
          t.removeAttribute("aria-current");
        });
        thumb.classList.add("is-active");
        thumb.setAttribute("aria-current", "true");
        setMainImage(src);
      });
    });
  }

  function initPdpColorSwatches() {
    var colorLabel = document.querySelector("[data-et-color-label]");
    var mainImg = document.querySelector("[data-et-pdp-main]");

    document.querySelectorAll(".et-pdp__color-swatches").forEach(function (group) {
      group.querySelectorAll(".et-pdp__color-swatch").forEach(function (swatch) {
        swatch.addEventListener("click", function () {
          group.querySelectorAll(".et-pdp__color-swatch").forEach(function (s) {
            s.classList.remove("is-active");
            s.setAttribute("aria-pressed", "false");
          });
          swatch.classList.add("is-active");
          swatch.setAttribute("aria-pressed", "true");

          var name = swatch.getAttribute("data-et-color-name");
          var src = swatch.getAttribute("data-et-pdp-src");
          if (colorLabel && name) colorLabel.textContent = name;
          if (mainImg && src) mainImg.src = src;
        });
      });
    });
  }

  function initPdpInteractions() {
    initPdpGallery();
    initPdpColorSwatches();
  }

  /* Size buttons */
  function initPdpSizes() {
    var sizeLabel = document.querySelector("[data-et-size-label]");

    document.querySelectorAll(".et-pdp__sizes").forEach(function (group) {
      group.querySelectorAll(".et-pdp__size").forEach(function (btn) {
        btn.addEventListener("click", function () {
          group.querySelectorAll(".et-pdp__size").forEach(function (b) {
            b.classList.remove("is-active");
            b.setAttribute("aria-pressed", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-pressed", "true");

          var val = btn.getAttribute("data-et-size-value");
          if (sizeLabel && val) sizeLabel.textContent = val;
        });
      });
    });
  }

  /* Quantity */
  function initPdpQuantity() {
    var qtyInput = document.getElementById("etPdpQty");
    var qtyMinus = document.querySelector("[data-et-qty-minus]");
    var qtyPlus = document.querySelector("[data-et-qty-plus]");

    if (!qtyInput || !qtyMinus || !qtyPlus) return;

    qtyMinus.addEventListener("click", function () {
      var val = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = Math.max(1, val - 1);
    });

    qtyPlus.addEventListener("click", function () {
      var val = parseInt(qtyInput.value, 10) || 1;
      var max = parseInt(qtyInput.getAttribute("max"), 10) || 99;
      qtyInput.value = Math.min(max, val + 1);
    });
  }

  /* Offers carousel */
  function initPdpOffers() {
    var offersRoot = document.querySelector("[data-et-pdp-offers]");
    if (!offersRoot) return;

    var track = offersRoot.querySelector("[data-et-offers-track]");
    var prevBtn = offersRoot.querySelector("[data-et-offers-prev]");
    var nextBtn = offersRoot.querySelector("[data-et-offers-next]");
    var cards = track ? offersRoot.querySelectorAll(".et-pdp__offer-card") : [];
    var offerIndex = 0;

    function getVisibleCount() {
      return window.innerWidth <= 640 ? 1 : 2;
    }

    function updateOffers() {
      if (!track || !cards.length) return;
      var visibleCount = getVisibleCount();
      var card = cards[0];
      var gap = 12;
      var step = card.offsetWidth + gap;
      var maxIndex = Math.max(0, cards.length - visibleCount);
      offerIndex = Math.min(offerIndex, maxIndex);
      track.style.transform = "translateX(-" + offerIndex * step + "px)";
      if (prevBtn) prevBtn.disabled = offerIndex <= 0;
      if (nextBtn) nextBtn.disabled = offerIndex >= maxIndex;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        offerIndex = Math.max(0, offerIndex - 1);
        updateOffers();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var maxIndex = Math.max(0, cards.length - getVisibleCount());
        offerIndex = Math.min(maxIndex, offerIndex + 1);
        updateOffers();
      });
    }

    window.addEventListener("resize", updateOffers);
    updateOffers();
  }

  /* Copy offer code */
  function initPdpCopyCode() {
    document.querySelectorAll("[data-et-copy-code]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var code = btn.getAttribute("data-et-copy-code");
        if (!code) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(function () {
            btn.textContent = "Copied!";
            setTimeout(function () {
              btn.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i> Copy';
            }, 1500);
          });
        }
      });
    });
  }

  /* Review sort */
  function initPdpReviewSort() {
    var reviewSort = document.querySelector("[data-et-review-sort]");
    var reviewsList = document.querySelector("[data-et-reviews-list]");

    if (!reviewSort || !reviewsList) return;

    reviewSort.addEventListener("change", function () {
      var items = Array.prototype.slice.call(
        reviewsList.querySelectorAll(".et-pdp-review")
      );

      items.sort(function (a, b) {
        var mode = reviewSort.value;
        var dateA = a.getAttribute("data-review-date") || "";
        var dateB = b.getAttribute("data-review-date") || "";
        var ratingA = parseInt(a.getAttribute("data-review-rating"), 10) || 0;
        var ratingB = parseInt(b.getAttribute("data-review-rating"), 10) || 0;

        if (mode === "highest") return ratingB - ratingA || dateB.localeCompare(dateA);
        if (mode === "lowest") return ratingA - ratingB || dateB.localeCompare(dateA);
        return dateB.localeCompare(dateA);
      });

      items.forEach(function (item) {
        reviewsList.appendChild(item);
      });
    });
  }

  /* Benefits / info tabs */
  function initPdpInfoTabs() {
    document.querySelectorAll("[data-et-pdp-info-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panelId = btn.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;

        var expanded = btn.getAttribute("aria-expanded") === "true";

        if (expanded) {
          btn.setAttribute("aria-expanded", "false");
          panel.hidden = true;
          return;
        }

        document.querySelectorAll("[data-et-pdp-info-tab]").forEach(function (otherBtn) {
          var otherId = otherBtn.getAttribute("aria-controls");
          var otherPanel = otherId ? document.getElementById(otherId) : null;
          otherBtn.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.hidden = true;
        });

        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      });
    });
  }

  function initPdpPageControls() {
    initPdpSizes();
    initPdpQuantity();
    initPdpOffers();
    initPdpCopyCode();
    initPdpReviewSort();
    initPdpInfoTabs();
  }

  function initProductModule() {
    initProductCardLinks();

    if (document.querySelector(".et-pdp")) {
      initProductDetailPage();
      initPdpInteractions();
      initPdpPageControls();
    }
  }

  global.et_initProductLinks = initProductCardLinks;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductModule);
  } else {
    initProductModule();
  }
})(typeof window !== "undefined" ? window : this);

/**
 * Ember Kitchen — product catalog, listing card links, and PDP (single file).
 */
(function () {
  "use strict";

var PRODUCT_CATALOG = {
  "mini-frypan": {
    title: "Mini Frypan 20cm",
    subtitle: "Ceramic Coating",
    desc: "Your everyday sidekick for eggs, pancakes, and more. Small, handy and effortlessly non-stick.",
    price: "₹2,500",
    mrp: "₹2,999",
    off: "16% OFF",
    reviews: "117 Reviews",
    category: "Cookware",
    image: "assets/img/category-5.webp",
    images: [
      "assets/img/category-5.webp",
      "assets/img/category-5-hover.webp",
      "assets/img/category-1.webp",
      "assets/img/category-2.webp",
      "assets/img/category-3.webp",
      "assets/img/category-4.webp",
      "assets/img/category-6.webp",
      "assets/img/category-7.webp"
    ]
  },
  "category-1": {
    title: "Titanium Pro Cookware Set",
    subtitle: "10 Piece Set",
    desc: "A full set of high-performance titanium cookware built for everyday Indian kitchens.",
    price: "$489.95",
    mrp: "$698",
    off: "30% OFF",
    reviews: "86 Reviews",
    category: "Cookware",
    image: "assets/img/category-1.webp",
    images: ["assets/img/category-1.webp", "assets/img/category-1-hover.webp"]
  },
  "category-2": {
    title: "Cookware Set",
    subtitle: "13 Piece Set",
    desc: "A 13-piece Always Pan and Perfect Pot set for versatile everyday cooking.",
    price: "$359.95",
    mrp: "$518",
    off: "31% OFF",
    reviews: "124 Reviews",
    category: "Cookware",
    image: "assets/img/category-2.webp",
    images: ["assets/img/category-2.webp", "assets/img/category-2-hover.webp"]
  },
  "category-3": {
    title: "Cookware + Bakeware Set",
    subtitle: "18 Piece Set",
    desc: "An 18-piece Always Pan, Perfect Pot, and Bakeware Set for complete meal prep.",
    price: "$499.95",
    mrp: "$717.95",
    off: "30% OFF",
    reviews: "92 Reviews",
    category: "Cookware",
    image: "assets/img/category-3.webp",
    images: ["assets/img/category-3.webp"]
  },
  "category-4": {
    title: "Cookware Set",
    subtitle: "16 Piece Set",
    desc: "A 16-piece ceramic nonstick cookware set designed for modern homes.",
    price: "$459.95",
    mrp: "$677",
    off: "32% OFF",
    reviews: "78 Reviews",
    category: "Cookware",
    image: "assets/img/category-4.webp",
    images: ["assets/img/category-4.webp", "assets/img/category-4-hover.webp"]
  },
  "category-5": {
    title: "Titanium Pro Cookware Set",
    subtitle: "Premium Titanium",
    desc: "Non-toxic, no-coating titanium cookware crafted for precision, durability, and lasting performance.",
    price: "$470.00",
    mrp: "$698",
    off: "33% OFF",
    reviews: "117 Reviews",
    category: "Cookware",
    image: "assets/img/category-5.webp",
    images: ["assets/img/category-5.webp", "assets/img/category-5-hover.webp"]
  },
  "category-6": {
    title: "Titanium Pro Cookware + Bakeware Set",
    subtitle: "15 Piece Set",
    desc: "A set of titanium cookware, plus nonstick bakeware for sweet and savoury recipes.",
    price: "$599.95",
    mrp: "$897.95",
    off: "33% OFF",
    reviews: "64 Reviews",
    category: "Cookware",
    image: "assets/img/category-6.webp",
    images: ["assets/img/category-6.webp", "assets/img/category-6-hover.webp"]
  },
  "category-7": {
    title: "Mini Cookware Duo",
    subtitle: "6 Piece Set",
    desc: "Mini yet multifunctional versions of our bestsellers — perfect for compact kitchens.",
    price: "$209.95",
    mrp: "$234",
    off: "10% OFF",
    reviews: "53 Reviews",
    category: "Cookware",
    image: "assets/img/category-7.webp",
    images: ["assets/img/category-7.webp", "assets/img/category-7-hover.webp"]
  },
  "category-8": {
    title: "Always Pan Trio",
    subtitle: "10 Piece Set",
    desc: "A trio of Always Pans for every cooking need — sear, simmer, and serve with ease.",
    price: "$299.95",
    mrp: "$403",
    off: "26% OFF",
    reviews: "71 Reviews",
    category: "Cookware",
    image: "assets/img/category-8.webp",
    images: ["assets/img/category-8.webp", "assets/img/category-8-hover.webp"]
  },
  "bs-1": {
    title: "Titanium Pro Cookware Set",
    subtitle: "10 Piece Set",
    desc: "A full set of high-performance titanium cookware for everyday excellence.",
    price: "$489.95",
    mrp: "$698",
    off: "30% OFF",
    reviews: "86 Reviews",
    category: "Bestsellers",
    image: "assets/img/BS-1.webp",
    images: ["assets/img/BS-1.webp", "assets/img/BS-1-hover.webp"]
  },
  "bs-2": {
    title: "Wonder Oven",
    subtitle: "Countertop Appliance",
    desc: "A versatile oven for baking, roasting, and reheating with even heat distribution.",
    price: "$195",
    mrp: "$245",
    off: "20% OFF",
    reviews: "142 Reviews",
    category: "Appliances",
    image: "assets/img/BS-2.webp",
    images: ["assets/img/BS-2.webp", "assets/img/BS-2-hover.webp"]
  },
  "bs-3": {
    title: "Griddle Pan",
    subtitle: "Ceramic Nonstick",
    desc: "Wide surface for pancakes, dosas, and grilled sandwiches with easy release.",
    price: "$85",
    mrp: "$110",
    off: "23% OFF",
    reviews: "98 Reviews",
    category: "Cookware",
    image: "assets/img/BS-3.webp",
    images: ["assets/img/BS-3.webp", "assets/img/BS-3-hover.webp"]
  },
  "bs-4": {
    title: "Cookware Set+",
    subtitle: "16 Piece Set",
    desc: "An expanded cookware collection with lids and tools for complete meal prep.",
    price: "$459.95",
    mrp: "$677",
    off: "32% OFF",
    reviews: "67 Reviews",
    category: "Cookware",
    image: "assets/img/BS-4.webp",
    images: ["assets/img/BS-4.webp", "assets/img/BS-4-hover.webp"]
  },
  "bs-5": {
    title: "Mini Always Pan",
    subtitle: "Ceramic Coating",
    desc: "Compact pan ideal for single servings, eggs, and quick weeknight meals.",
    price: "$95",
    mrp: "$120",
    off: "21% OFF",
    reviews: "203 Reviews",
    category: "Cookware",
    image: "assets/img/BS-5.webp",
    images: ["assets/img/BS-5.webp", "assets/img/BS-5-hover.webp"]
  },
  "bs-6": {
    title: "Perfect Pot",
    subtitle: "4 qt",
    desc: "Deep pot for curries, pasta, and one-pot meals with stay-cool handles.",
    price: "$120",
    mrp: "$165",
    off: "27% OFF",
    reviews: "156 Reviews",
    category: "Cookware",
    image: "assets/img/BS-6.webp",
    images: ["assets/img/BS-6.webp", "assets/img/BS-6-hover.webp"]
  },
  "bs-7": {
    title: "Bakeware Set",
    subtitle: "6 Piece Set",
    desc: "Nonstick bakeware for cakes, cookies, and roasting vegetables.",
    price: "$75",
    mrp: "$98",
    off: "23% OFF",
    reviews: "44 Reviews",
    category: "Bakeware",
    image: "assets/img/BS-7.webp",
    images: ["assets/img/BS-7.webp", "assets/img/BS-7-hover.webp"]
  },
  "bs-8": {
    title: "Tableware Bundle",
    subtitle: "Dinner for Four",
    desc: "Plates, bowls, and mugs designed to complement your Ember kitchen.",
    price: "$89",
    mrp: "$120",
    off: "26% OFF",
    reviews: "39 Reviews",
    category: "Tableware",
    image: "assets/img/BS-8.webp",
    images: ["assets/img/BS-8.webp", "assets/img/BS-8-hover.webp"]
  },
  "nf-1": {
    title: "Tawa 30cm",
    subtitle: "Cast Iron Series",
    desc: "Pre-seasoned tawa for rotis, parathas, and perfectly crisp dosas.",
    price: "₹4,000.00",
    mrp: "₹4,499.00",
    off: "11% OFF",
    reviews: "48 Reviews",
    category: "Cookware",
    image: "assets/img/NF-1.webp",
    images: ["assets/img/NF-1.webp"]
  },
  "nf-2": {
    title: "Karahi 25cm",
    subtitle: "Cast Iron Series",
    desc: "Deep karahi for curries, stir-fries, and family-sized portions.",
    price: "₹4,400.00",
    mrp: "₹4,999.00",
    off: "12% OFF",
    reviews: "36 Reviews",
    category: "Cookware",
    image: "assets/img/NF-2.webp",
    images: ["assets/img/NF-2.webp"]
  },
  "nf-3": {
    title: "Shallow Casserole 30cm",
    subtitle: "Cast Iron Series",
    desc: "Shallow casserole for biryanis, baked dishes, and table-to-stove serving.",
    price: "₹6,500.00",
    mrp: "₹7,299.00",
    off: "11% OFF",
    reviews: "29 Reviews",
    category: "Cookware",
    image: "assets/img/NF-3.webp",
    images: ["assets/img/NF-3.webp"]
  },
  "nf-4": {
    title: "Dutch Oven 24cm",
    subtitle: "Cast Iron Series",
    desc: "Heavy-duty Dutch oven for slow braises, breads, and one-pot comfort food.",
    price: "₹5,600.00",
    mrp: "₹6,299.00",
    off: "11% OFF",
    reviews: "41 Reviews",
    category: "Cookware",
    image: "assets/img/NF-4.webp",
    images: ["assets/img/NF-4.webp"]
  },
  "nf-5": {
    title: "Skillet 28cm",
    subtitle: "Cast Iron Series",
    desc: "Versatile skillet for searing, sautéing, and oven-to-table presentation.",
    price: "₹4,900.00",
    mrp: "₹5,499.00",
    off: "11% OFF",
    reviews: "33 Reviews",
    category: "Cookware",
    image: "assets/img/NF-5.webp",
    images: ["assets/img/NF-5.webp"]
  }
};

var DEFAULT_PRODUCT_ID = "mini-frypan";

function getProductById(id) {
  return PRODUCT_CATALOG[id] || PRODUCT_CATALOG[DEFAULT_PRODUCT_ID];
}

function getProductUrl(id) {
  var base = "product.html";
  var productId = id && PRODUCT_CATALOG[id] ? id : DEFAULT_PRODUCT_ID;
  return base + "?id=" + encodeURIComponent(productId);
}

function getProductIdFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  return id && PRODUCT_CATALOG[id] ? id : DEFAULT_PRODUCT_ID;
}

function resolveProductIdFromCard(card) {
  if (card.dataset.productId && PRODUCT_CATALOG[card.dataset.productId]) {
    return card.dataset.productId;
  }

  var img = card.querySelector(
    ".cat-card__img--default, .bestsellers-card__img--default, .nf-card__media img"
  );
  var src = img && img.getAttribute("src");

  if (src) {
    var file = src.split("/").pop() || "";
    var id = file.replace(/\.[^/.]+$/, "").toLowerCase();
    if (PRODUCT_CATALOG[id]) return id;
  }

  var titleEl = card.querySelector(
    ".cat-card__name, .bestsellers-card__name, .nf-card__name"
  );
  var title = titleEl && titleEl.textContent.replace(/\s+/g, " ").trim();

  if (title) {
    var entry = Object.keys(PRODUCT_CATALOG).find(function (key) {
      var productTitle = PRODUCT_CATALOG[key].title;
      return title.indexOf(productTitle) === 0 || productTitle === title;
    });
    if (entry) return entry;
  }

  return null;
}

  window.PRODUCT_CATALOG = PRODUCT_CATALOG;
  window.DEFAULT_PRODUCT_ID = DEFAULT_PRODUCT_ID;
  window.getProductById = getProductById;
  window.getProductUrl = getProductUrl;
  window.getProductIdFromUrl = getProductIdFromUrl;
  window.resolveProductIdFromCard = resolveProductIdFromCard;

  function initProductCardLinks() {
  var cardSelector = ".cat-card, .bestsellers-card, .nf-card";
    var skipClick = ".cat-card__quick-add, .nf-card__add";

    document.querySelectorAll(cardSelector).forEach(function (card) {
      var productId = resolveProductIdFromCard(card);

      if (!productId) return;

      card.dataset.productId = productId;
      card.classList.add("is-product-card");

      var productUrl = getProductUrl(productId);

      card.querySelectorAll('a[href="product.html"], a[href*="product.html"]').forEach(function (link) {
        link.setAttribute("href", productUrl);
      });

      var mainLink = card.querySelector(".cat-card__link");

      function navigateToProduct(event) {
        if (event.target.closest(skipClick)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        event.preventDefault();
        window.location.assign(productUrl);
      }

      if (mainLink) {
        mainLink.addEventListener("click", navigateToProduct);
        return;
      }

      card.addEventListener("click", function (event) {
        if (event.target.closest(skipClick)) return;
        if (event.target.closest("a")) return;
        window.location.assign(productUrl);
      });
    });

  }

  function initProductDetailPage() {
    if (!document.querySelector("[data-pdp-page]")) {
      return;
    }

    function renderProductFromUrl() {
        var product = getProductById(getProductIdFromUrl());
        var titleEl = document.querySelector(".pdp-info__title");
        var subtitleEl = document.querySelector(".pdp-info__subtitle");
        var descEl = document.querySelector(".pdp-info__desc");
        var reviewsEl = document.querySelector(".pdp-rating__count");
        var priceEl = document.querySelector(".pdp-price-block__current");
        var mrpEl = document.querySelector(".pdp-price-block__mrp s");
        var offEl = document.querySelector(".pdp-price-block__off");
        var breadcrumbEl = document.querySelector("[data-pdp-breadcrumb-name]");
        var mainImg = document.getElementById("pdp-main-image");
        var thumbsWrap = document.querySelector("[data-pdp-thumbs]");
        var addCartBtn = document.querySelector(".pdp-add-cart-btn");
        var personaliseThumb = document.querySelector(".pdp-personalise__thumb");

        if (titleEl) titleEl.textContent = product.title;
        if (subtitleEl) subtitleEl.textContent = product.subtitle;
        if (descEl) descEl.textContent = product.desc;
        if (reviewsEl) reviewsEl.textContent = product.reviews;
        if (priceEl) priceEl.textContent = product.price;
        if (mrpEl) mrpEl.textContent = product.mrp;
        if (offEl) offEl.textContent = product.off;
        if (breadcrumbEl) breadcrumbEl.textContent = product.title;
        if (addCartBtn) addCartBtn.textContent = "Add to cart - " + product.price;
        if (personaliseThumb && product.image) personaliseThumb.src = product.image;

        document.title = product.title + " | Ember Kitchen";

        var images = product.images && product.images.length ? product.images : [product.image];

        if (mainImg && images[0]) {
          mainImg.src = images[0];
          mainImg.alt = product.title;
        }

        if (thumbsWrap && images.length) {
          thumbsWrap.innerHTML = images
            .map(function (src, index) {
              return (
                '<button type="button" class="pdp-thumb' +
                (index === 0 ? " is-active" : "") +
                '" data-pdp-thumb data-image="' +
                src +
                '" role="listitem"><img src="' +
                src +
                '" alt="" width="64" height="64" /></button>'
              );
            })
            .join("");
        }

        return product;
      }

      renderProductFromUrl();

      var header = document.querySelector(".site-header");
      var gallery = document.querySelector("[data-pdp-sticky-gallery]");
      var layout = document.querySelector("[data-pdp-sticky-layout]");
      var wrap = document.querySelector(".pdp-gallery-wrap");
      var spacer = document.querySelector("[data-pdp-gallery-spacer]");
      var stickyMq = window.matchMedia("(min-width: 992px)");

      function stickyTopOffset() {
        return (header ? header.offsetHeight : 0) + 16;
      }

      function setPdpStickyTop() {
        document.documentElement.style.setProperty(
          "--pdp-sticky-top",
          stickyTopOffset() + "px"
        );
      }

      function resetGallerySticky() {
        if (!gallery) return;
        gallery.classList.remove("is-sticky-active", "is-sticky-end");
        gallery.style.position = "";
        gallery.style.top = "";
        gallery.style.left = "";
        gallery.style.width = "";
        gallery.style.zIndex = "";
        if (spacer) {
          spacer.style.display = "none";
          spacer.style.height = "";
        }
        if (wrap) wrap.style.minHeight = "";
      }

      function updateGallerySticky() {
        if (!gallery || !layout || !wrap) return;

        if (!stickyMq.matches) {
          resetGallerySticky();
          return;
        }

        var top = stickyTopOffset();
        var layoutRect = layout.getBoundingClientRect();
        var galleryHeight = gallery.offsetHeight;
        var wrapRect = wrap.getBoundingClientRect();

        if (layoutRect.top >= top) {
          resetGallerySticky();
          return;
        }

        if (layoutRect.bottom <= top + galleryHeight) {
          gallery.classList.remove("is-sticky-active");
          gallery.classList.add("is-sticky-end");
          gallery.style.position = "absolute";
          gallery.style.top = layout.offsetHeight - galleryHeight + "px";
          gallery.style.left = "0";
          gallery.style.width = "100%";
          gallery.style.zIndex = "15";
          if (spacer) spacer.style.display = "none";
          wrap.style.minHeight = layout.offsetHeight + "px";
          return;
        }

        gallery.classList.remove("is-sticky-end");
        gallery.classList.add("is-sticky-active");
        gallery.style.position = "fixed";
        gallery.style.top = top + "px";
        gallery.style.left = wrapRect.left + "px";
        gallery.style.width = wrapRect.width + "px";
        gallery.style.zIndex = "15";
        if (spacer) {
          spacer.style.display = "block";
          spacer.style.height = galleryHeight + "px";
        }
        wrap.style.minHeight = "";
      }

      var stickyTicking = false;
      function scheduleStickyUpdate() {
        if (stickyTicking) return;
        stickyTicking = true;
        window.requestAnimationFrame(function () {
          stickyTicking = false;
          updateGallerySticky();
        });
      }

      if (gallery && layout && wrap) {
        setPdpStickyTop();
        updateGallerySticky();
        window.addEventListener("scroll", scheduleStickyUpdate, { passive: true });
        window.addEventListener("resize", function () {
          setPdpStickyTop();
          resetGallerySticky();
          updateGallerySticky();
        });
        window.addEventListener("load", function () {
          setPdpStickyTop();
          updateGallerySticky();
        });
        setTimeout(updateGallerySticky, 100);
        if (stickyMq.addEventListener) {
          stickyMq.addEventListener("change", function () {
            resetGallerySticky();
            updateGallerySticky();
          });
        } else if (stickyMq.addListener) {
          stickyMq.addListener(function () {
            resetGallerySticky();
            updateGallerySticky();
          });
        }
      }

      var mainImg = document.getElementById("pdp-main-image");

      function bindThumbGallery() {
        var thumbs = document.querySelectorAll("[data-pdp-thumb]");
        thumbs.forEach(function (thumb) {
          thumb.addEventListener("click", function () {
            var src = thumb.getAttribute("data-image");
            if (!src || !mainImg) return;
            mainImg.src = src;
            thumbs.forEach(function (t) {
              t.classList.toggle("is-active", t === thumb);
            });
            scheduleStickyUpdate();
          });
        });
      }

      bindThumbGallery();

      var qtyInput = document.getElementById("pdp-qty");
      var qtyMinus = document.querySelector("[data-pdp-qty-minus]");
      var qtyPlus = document.querySelector("[data-pdp-qty-plus]");

      if (qtyInput && qtyMinus && qtyPlus) {
        qtyMinus.addEventListener("click", function () {
          var val = parseInt(qtyInput.value, 10) || 1;
          if (val > 1) qtyInput.value = String(val - 1);
        });
        qtyPlus.addEventListener("click", function () {
          var val = parseInt(qtyInput.value, 10) || 1;
          qtyInput.value = String(val + 1);
        });
      }

      var swatches = document.querySelectorAll("[data-pdp-swatch]");
      var colorLabel = document.getElementById("pdp-color-name");
      swatches.forEach(function (swatch) {
        swatch.addEventListener("click", function () {
          swatches.forEach(function (s) {
            s.classList.toggle("is-active", s === swatch);
          });
          if (colorLabel) {
            colorLabel.textContent = swatch.getAttribute("data-color-name") || "";
          }
        });
      });

      var sizeBtns = document.querySelectorAll("[data-pdp-size]");
      sizeBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          sizeBtns.forEach(function (b) {
            b.classList.toggle("is-active", b === btn);
          });
        });
      });

      var accordion = document.querySelector("[data-pdp-accordion]");
      if (accordion) {
        accordion.querySelectorAll(".pdp-accordion__trigger").forEach(function (trigger) {
          trigger.addEventListener("click", function () {
            var expanded = trigger.getAttribute("aria-expanded") === "true";
            var panel = trigger.nextElementSibling;
            trigger.setAttribute("aria-expanded", expanded ? "false" : "true");
            if (panel && panel.classList.contains("pdp-accordion__panel")) {
              panel.hidden = expanded;
            }
            scheduleStickyUpdate();
          });
        });
      }

      var reviewsCarousel = document.querySelector("[data-pdp-reviews-carousel]");
      if (reviewsCarousel) {
        var reviewsTrack = reviewsCarousel.querySelector("[data-reviews-track]");
        var reviewsViewport = reviewsCarousel.querySelector("[data-reviews-viewport]");
        var reviewCards = reviewsTrack ? reviewsTrack.querySelectorAll(".pdp-review-card") : [];
        var reviewsPrev = reviewsCarousel.querySelector("[data-reviews-prev]");
        var reviewsNext = reviewsCarousel.querySelector("[data-reviews-next]");
        var reviewsIndex = 0;
        var reviewsGap = 20;

        function reviewsGetStep() {
          if (!reviewCards.length) return 0;
          return reviewCards[0].offsetWidth + reviewsGap;
        }

        function reviewsGetMaxIndex() {
          if (!reviewsViewport || !reviewCards.length) return 0;
          var visible = reviewsViewport.offsetWidth;
          var step = reviewsGetStep();
          if (!step) return 0;
          var visibleCount = Math.max(1, Math.floor((visible + reviewsGap) / step));
          return Math.max(0, reviewCards.length - visibleCount);
        }

        function reviewsUpdate() {
          var maxIndex = reviewsGetMaxIndex();
          if (reviewsIndex > maxIndex) reviewsIndex = maxIndex;

          if (reviewsTrack) {
            reviewsTrack.style.transform = "translate3d(-" + reviewsIndex * reviewsGetStep() + "px, 0, 0)";
          }

          if (reviewsPrev) {
            reviewsPrev.disabled = reviewsIndex <= 0;
            reviewsPrev.classList.toggle("is-disabled", reviewsIndex <= 0);
          }
          if (reviewsNext) {
            reviewsNext.disabled = reviewsIndex >= maxIndex;
            reviewsNext.classList.toggle("is-disabled", reviewsIndex >= maxIndex);
          }
        }

        if (reviewsPrev) {
          reviewsPrev.addEventListener("click", function () {
            if (reviewsIndex > 0) {
              reviewsIndex -= 1;
              reviewsUpdate();
            }
          });
        }

        if (reviewsNext) {
          reviewsNext.addEventListener("click", function () {
            var maxIndex = reviewsGetMaxIndex();
            if (reviewsIndex < maxIndex) {
              reviewsIndex += 1;
              reviewsUpdate();
            }
          });
        }

        window.addEventListener("resize", reviewsUpdate);
        reviewsUpdate();
      }

  }

  initProductCardLinks();
  initProductDetailPage();
})();

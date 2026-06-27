(function () {
  "use strict";

  /* ===== Product helpers (shared across pages) ===== */
  function formatPrice(n) {
    return "\u20B9" + n.toLocaleString("en-IN");
  }

  function formatPriceDecimal(n) {
    return "Rs. " + n.toFixed(2);
  }

  function getProduct(id) {
    if (!window.BH_PRODUCTS) return null;
    var num = parseInt(id, 10);
    return (
      window.BH_PRODUCTS.find(function (p) {
        return p.id === num;
      }) || window.BH_PRODUCTS[0]
    );
  }

  function productUrl(id) {
    return "product.html?id=" + id;
  }

  function renderProductCard(product) {
    var ratingHtml = "";
    if (product.reviews) {
      ratingHtml =
        '<p class="bh-product__rating">' +
        '<span class="bh-product__stars" aria-hidden="true">\u2605\u2605\u2605\u2605\u2605</span>' +
        '<span class="bh-product__reviews">' +
        product.reviews +
        " reviews</span></p>";
    }

    var url = productUrl(product.id);

    return (
      '<li class="bh-product">' +
      '<div class="bh-product__media">' +
      '<a href="' +
      url +
      '" class="bh-product__imgwrap" aria-label="' +
      product.title +
      '">' +
      '<img class="bh-product__img bh-product__img--front" src="' +
      product.image +
      '" alt="' +
      product.title +
      '" width="300" height="320" loading="lazy" decoding="async" />' +
      '<img class="bh-product__img bh-product__img--back" src="' +
      product.imageHover +
      '" alt="" aria-hidden="true" width="300" height="320" loading="lazy" decoding="async" />' +
      "</a>" +
      '<button type="button" class="bh-product__quick" aria-label="Quick add">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />' +
      '<path d="M2 3h3l2.4 12.2a1 1 0 001 .8h9.2a1 1 0 001-.8L21 7H6" stroke-linecap="round" stroke-linejoin="round" />' +
      "</svg></button></div>" +
      '<div class="bh-product__body">' +
      '<h3 class="bh-product__name"><a href="' +
      url +
      '">' +
      product.title +
      "</a></h3>" +
      ratingHtml +
      '<p class="bh-product__price">' +
      '<span class="bh-product__price-old">' +
      formatPrice(product.mrp) +
      "</span>" +
      '<span class="bh-product__price-now">' +
      formatPrice(product.price) +
      "</span></p>" +
      '<a href="' +
      url +
      '" class="bh-product__cart">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />' +
      '<path d="M2 3h3l2.4 12.2a1 1 0 001 .8h9.2a1 1 0 001-.8L21 7H6" stroke-linecap="round" stroke-linejoin="round" />' +
      "</svg>Add to Cart</a></div></li>"
    );
  }

  function renderProductCards(products) {
    return products.map(renderProductCard).join("");
  }

  window.BHProducts = {
    formatPrice: formatPrice,
    formatPriceDecimal: formatPriceDecimal,
    getProduct: getProduct,
    productUrl: productUrl,
    renderProductCard: renderProductCard,
    renderProductCards: renderProductCards
  };

  /* ===== Product detail page ===== */
  function initProductPage() {
    if (!window.BH_PRODUCTS) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id") || params.get("p") || "1";
    var product = getProduct(id);

    if (!product) return;

    document.title = product.title + " — BabyHaat";

    var breadcrumb = document.querySelector("[data-bh-pdp-breadcrumb]");
    if (breadcrumb) breadcrumb.textContent = product.title;

    var gallery = document.querySelector("[data-bh-pdp-gallery]");
    if (gallery) {
      var wishHtml = "";
      var wishBtn = gallery.querySelector(".bh-pgallery__wish");
      if (wishBtn) wishHtml = wishBtn.outerHTML;

      var images = product.images && product.images.length ? product.images : [product.image];
      gallery.innerHTML =
        wishHtml +
        images
          .map(function (src, i) {
            return (
              '<a href="' +
              src +
              '" class="bh-pgallery__item">' +
              '<img src="' +
              src +
              '" alt="' +
              product.title +
              " view " +
              (i + 1) +
              '"' +
              (i === 0 ? ' decoding="async"' : ' loading="lazy" decoding="async"') +
              " /></a>"
            );
          })
          .join("");
    }

    var titleEl = document.querySelector("[data-bh-pdp-title]");
    if (titleEl) titleEl.textContent = product.title;

    var categoryEl = document.querySelector("[data-bh-pdp-category]");
    if (categoryEl) categoryEl.textContent = product.category;

    var ratingWrap = document.querySelector("[data-bh-pdp-rating]");
    if (ratingWrap) {
      if (product.reviews) {
        ratingWrap.hidden = false;
        var numEl = ratingWrap.querySelector("[data-bh-pdp-rating-num]");
        var linkEl = ratingWrap.querySelector("[data-bh-pdp-rating-link]");
        if (numEl) numEl.textContent = product.rating;
        if (linkEl) linkEl.textContent = product.reviews + " reviews";
      } else {
        ratingWrap.hidden = true;
      }
    }

    var priceEl = document.querySelector("[data-bh-pdp-price]");
    if (priceEl) priceEl.textContent = formatPriceDecimal(product.price);

    var skuEl = document.querySelector("[data-bh-pdp-sku]");
    if (skuEl) skuEl.textContent = "SKU: " + product.sku;

    var descEl = document.querySelector("[data-bh-pdp-description]");
    if (descEl) descEl.textContent = product.description;

    var relatedGrid = document.querySelector("[data-bh-related-grid]");
    if (relatedGrid) {
      var related = window.BH_PRODUCTS.filter(function (p) {
        return p.id !== product.id;
      }).slice(0, 4);
      relatedGrid.innerHTML = renderProductCards(related);
    }
  }

  if (document.querySelector("[data-bh-pdp-title]")) {
    initProductPage();

    var sizes = document.querySelector("[data-bh-sizes]");
    if (sizes) {
      sizes.addEventListener("click", function (e) {
        var btn = e.target.closest(".bh-pdp__size");
        if (!btn) return;
        sizes.querySelectorAll(".bh-pdp__size").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    }

    var qty = document.querySelector("[data-bh-qty]");
    if (qty) {
      var qtyInput = qty.querySelector("[data-bh-qty-input]");
      var qtyMinus = qty.querySelector("[data-bh-qty-minus]");
      var qtyPlus = qty.querySelector("[data-bh-qty-plus]");

      function clampQty(v) {
        v = parseInt(v, 10);
        if (isNaN(v) || v < 1) v = 1;
        if (v > 99) v = 99;
        return v;
      }

      if (qtyMinus) {
        qtyMinus.addEventListener("click", function () {
          qtyInput.value = clampQty(parseInt(qtyInput.value, 10) - 1);
        });
      }
      if (qtyPlus) {
        qtyPlus.addEventListener("click", function () {
          qtyInput.value = clampQty(parseInt(qtyInput.value, 10) + 1);
        });
      }
      if (qtyInput) {
        qtyInput.addEventListener("change", function () {
          qtyInput.value = clampQty(qtyInput.value);
        });
      }
    }

    var accordion = document.querySelector("[data-bh-accordion]");
    if (accordion) {
      var heads = accordion.querySelectorAll(".bh-accordion__head");
      heads.forEach(function (head) {
        head.addEventListener("click", function () {
          var item = head.closest(".bh-accordion__item");
          var open = item.classList.toggle("is-open");
          head.setAttribute("aria-expanded", open ? "true" : "false");
        });
      });
    }
  }
})();

/* ===== Nivaas – Product detail page ===== */
(function () {
  "use strict";

  function renderProduct(product) {
    if (!product || !window.FR2_PRODUCTS) return;

    var formatPrice = window.FR2_PRODUCTS.formatPrice;
    var shortTitle = product.shortTitle || product.title;

    document.title = shortTitle + " – Nivaas Furniture";

    var crumbCategory = document.querySelector("[data-fr2-crumb-category]");
    var crumbTitle = document.querySelector("[data-fr2-crumb-title]");
    if (crumbCategory) crumbCategory.textContent = product.category;
    if (crumbTitle) crumbTitle.textContent = shortTitle;

    var brand = document.querySelector("[data-fr2-product-brand]");
    var title = document.querySelector("[data-fr2-product-title]");
    if (brand) brand.textContent = product.brand;
    if (title) title.textContent = product.title;

    var now = document.querySelector("[data-fr2-product-now]");
    var was = document.querySelector("[data-fr2-product-was]");
    var off = document.querySelector("[data-fr2-product-off]");
    if (now) now.textContent = formatPrice(product.now);
    if (was) was.textContent = formatPrice(product.was);
    if (off) off.textContent = product.off;

    var reviews = document.querySelector("[data-fr2-product-reviews]");
    if (reviews) reviews.textContent = product.rating + " (" + product.reviews + " reviews)";

    var desc = document.querySelector("[data-fr2-product-desc]");
    if (desc) desc.textContent = product.description;

    var gallery = document.querySelector("[data-fr2-gallery]");
    if (gallery) {
      var images = product.images && product.images.length ? product.images : [product.image];
      var thumbsWrap = gallery.querySelector(".fr2-gallery__thumbs");
      var stage = gallery.querySelector("[data-fr2-stage]");

      if (thumbsWrap) {
        thumbsWrap.innerHTML = images
          .map(function (src, i) {
            return (
              '<button type="button" class="fr2-gallery__thumb' +
              (i === 0 ? " is-active" : "") +
              '" data-fr2-thumb="' +
              src +
              '">' +
              '<img src="' +
              src +
              '" alt="' +
              product.title +
              " – view " +
              (i + 1) +
              '" />' +
              "</button>"
            );
          })
          .join("");
      }

      if (stage) {
        stage.setAttribute("src", images[0]);
        stage.setAttribute("alt", product.title);
      }
    }
  }

  function initGallery() {
    var gallery = document.querySelector("[data-fr2-gallery]");
    if (!gallery) return;

    gallery.addEventListener("click", function (e) {
      var thumb = e.target.closest("[data-fr2-thumb]");
      if (!thumb) return;

      var src = thumb.getAttribute("data-fr2-thumb");
      var stage = gallery.querySelector("[data-fr2-stage]");
      if (stage && src) stage.setAttribute("src", src);

      gallery.querySelectorAll("[data-fr2-thumb]").forEach(function (t) {
        t.classList.remove("is-active");
      });
      thumb.classList.add("is-active");
    });
  }

  var params = new URLSearchParams(window.location.search);
  var productId = params.get("id");
  var product = productId && window.FR2_PRODUCTS ? window.FR2_PRODUCTS.get(productId) : null;

  if (!product && window.FR2_PRODUCTS) {
    product = window.FR2_PRODUCTS.get("bs-1");
  }

  renderProduct(product);
  initGallery();

  /* Generic single-select button groups (colour swatches + sizes) */
  function singleSelect(container, itemSelector) {
    var wrap = document.querySelector(container);
    if (!wrap) return;
    var items = wrap.querySelectorAll(itemSelector);
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        items.forEach(function (i) {
          i.classList.remove("is-active");
        });
        item.classList.add("is-active");
      });
    });
  }
  singleSelect("[data-fr2-swatches]", ".fr2-swatch");
  singleSelect("[data-fr2-sizes]", ".fr2-size");

  /* Quantity stepper */
  var qty = document.querySelector("[data-fr2-qty]");
  if (qty) {
    var input = qty.querySelector("[data-fr2-qty-input]");
    var dec = qty.querySelector("[data-fr2-qty-dec]");
    var inc = qty.querySelector("[data-fr2-qty-inc]");
    function getVal() {
      return Math.max(1, parseInt(input.value, 10) || 1);
    }
    if (dec)
      dec.addEventListener("click", function () {
        input.value = Math.max(1, getVal() - 1);
      });
    if (inc)
      inc.addEventListener("click", function () {
        input.value = getVal() + 1;
      });
  }

  /* Product info tabs (Features / Dimensions / Care) */
  var ptabs = document.querySelector("[data-fr2-ptabs]");
  if (ptabs) {
    var tabs = ptabs.querySelectorAll("[data-fr2-ptab]");
    var panels = ptabs.querySelectorAll("[data-fr2-ppanel]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-fr2-ptab");
        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
        panels.forEach(function (panel) {
          var match = panel.getAttribute("data-fr2-ppanel") === key;
          panel.classList.toggle("is-active", match);
          panel.hidden = !match;
        });
      });
    });
  }

  /* Wishlist button */
  var wish = document.querySelector(".fr2-btn--wish");
  if (wish) {
    wish.addEventListener("click", function () {
      wish.classList.toggle("is-active");
      var icon = wish.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");
      }
    });
  }

  /* Similar product links */
  if (window.FR2_PRODUCTS) {
    window.FR2_PRODUCTS.initLinks();
  }
})();

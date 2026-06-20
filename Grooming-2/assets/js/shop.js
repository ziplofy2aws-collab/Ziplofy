(function () {
  var grid = document.querySelector("[data-gr2-shop-grid]");
  var countEl = document.querySelector("[data-gr2-shop-count]");
  if (!grid || !window.GR2_PRODUCTS) return;

  var products = GR2_PRODUCTS.list();

  function buildCard(product) {
    var off = GR2_PRODUCTS.savePercent(product);
    var priceRow =
      off > 0
        ? '<strong class="gr2-shop__price">' +
          GR2_PRODUCTS.formatPrice(product.price) +
          "</strong>" +
          '<del class="gr2-shop__was">' +
          GR2_PRODUCTS.formatPrice(product.mrp) +
          "</del>" +
          '<span class="gr2-shop__save">Save ' +
          off +
          "%</span>"
        : '<span class="gr2-shop__mrp">MRP: ' + GR2_PRODUCTS.formatPrice(product.price) + "</span>";

    return (
      '<article class="gr2-shop__card">' +
      '<a href="' +
      GR2_PRODUCTS.productHref(product.id) +
      '" class="gr2-shop__card-link">' +
      '<div class="gr2-shop__media">' +
      '<img src="' +
      product.image +
      '" alt="' +
      product.name +
      '" width="320" height="320" loading="lazy" decoding="async" />' +
      "</div>" +
      '<div class="gr2-shop__body">' +
      "<h2 class=\"gr2-shop__name\">" +
      product.name +
      "</h2>" +
      '<p class="gr2-shop__feature">' +
      (product.feature || "") +
      "</p>" +
      '<div class="gr2-shop__rating">' +
      '<i class="fa-solid fa-star" aria-hidden="true"></i>' +
      "<span class=\"gr2-shop__rating-score\">" +
      product.rating +
      "</span>" +
      '<span class="gr2-shop__rating-sep">|</span>' +
      "<span class=\"gr2-shop__rating-count\">(" +
      product.reviews +
      ")</span>" +
      "</div>" +
      '<div class="gr2-shop__price-row">' +
      priceRow +
      "</div>" +
      "</div>" +
      "</a>" +
      '<a href="' +
      GR2_PRODUCTS.productHref(product.id) +
      '" class="gr2-shop__cart-btn">ADD TO CART</a>' +
      "</article>"
    );
  }

  grid.innerHTML = products.map(buildCard).join("");

  if (countEl) {
    countEl.textContent = products.length + " Products";
  }

  window.dispatchEvent(new CustomEvent("gr2:motion-refresh"));
})();

(function () {
  var grid = document.querySelector("[data-pi-shop-grid]");
  if (!grid || !window.PI_PRODUCTS) return;

  function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function renderBadges(badges) {
    return badges.map(function (badge) {
      var icon = "fa-leaf";
      if (badge.type === "gift") icon = "fa-gift";
      if (badge.type === "vastu") icon = "fa-house";
      if (badge.type === "pet") icon = "fa-paw";
      if (badge.type === "fast") icon = "fa-bolt";
      return (
        '<span class="pi-shop-card__badge pi-shop-card__badge--' + badge.type + '">' +
        '<i class="fa-solid ' + icon + '" aria-hidden="true"></i> ' + badge.text +
        "</span>"
      );
    }).join("");
  }

  function renderSizes(sizes) {
    return sizes.map(function (size, index) {
      return '<button type="button" class="pi-shop-card__size' + (index === 0 ? " is-active" : "") + '">' + size + "</button>";
    }).join("");
  }

  function renderColors(colors) {
    return colors.map(function (color, index) {
      return (
        '<button type="button" class="pi-shop-card__color' + (index === 0 ? " is-active" : "") + '" style="--swatch:' + color + '" aria-label="Color option"></button>'
      );
    }).join("");
  }

  function renderPromoBanner(banner) {
    if (!banner) return "";
    var icon = banner.style === "yellow" ? "fa-arrow-trend-up" : "fa-percent";
    return (
      '<div class="pi-shop-card__ribbon pi-shop-card__ribbon--' + banner.style + '">' +
      '<i class="fa-solid ' + icon + '" aria-hidden="true"></i>' +
      "<span>" + banner.text + "</span>" +
      "</div>"
    );
  }

  function renderProductCard(product) {
    var isFeatured = product.variant === "featured";
    var perItem = product.perItem
      ? '<span class="pi-shop-card__per-item">' + formatPrice(product.perItem) + " / item</span>"
      : "";

    var selector = "";
    if (product.selectorType === "color") {
      selector =
        '<div class="pi-shop-card__selector">' +
        '<span class="pi-shop-card__selector-label">Select Color</span>' +
        '<div class="pi-shop-card__color-btns" role="group" aria-label="Select color">' +
        renderColors(product.colors) +
        "</div></div>";
    } else if (product.sizes.length) {
      selector =
        '<div class="pi-shop-card__selector">' +
        '<span class="pi-shop-card__selector-label">Select Size</span>' +
        '<div class="pi-shop-card__size-btns" role="group" aria-label="Select size">' +
        renderSizes(product.sizes) +
        "</div></div>";
    }

    return (
      '<article class="pi-shop-card' + (isFeatured ? " pi-shop-card--featured" : "") + '" data-product-id="' + product.id + '">' +
      '<a href="product.html?id=' + product.id + '" class="pi-shop-card__media">' +
      (product.bestSeller
        ? '<span class="pi-shop-card__bestseller"><i class="fa-solid fa-heart" aria-hidden="true"></i> Best Seller</span>'
        : "") +
      '<img src="' + product.image + '" alt="' + product.name + '" width="400" height="400" loading="lazy" decoding="async" />' +
      "</a>" +
      renderPromoBanner(product.promoBanner) +
      '<div class="pi-shop-card__body">' +
      '<div class="pi-shop-card__rating" aria-label="Rated ' + product.rating + " out of 5 from " + product.reviews + ' reviews">' +
      '<span class="pi-shop-card__stars" aria-hidden="true">' +
      '<i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>' +
      "</span>" +
      '<span class="pi-shop-card__score">' + product.rating + " | " + product.reviews + "</span>" +
      "</div>" +
      '<h3 class="pi-shop-card__title"><a href="product.html?id=' + product.id + '">' + product.name + "</a></h3>" +
      '<p class="pi-shop-card__pricing">' +
      '<span class="pi-shop-card__price">' + formatPrice(product.price) + "</span>" +
      '<span class="pi-shop-card__mrp">' + formatPrice(product.mrp) + "</span>" +
      perItem +
      "</p>" +
      '<div class="pi-shop-card__badges">' + renderBadges(product.badges) + "</div>" +
      selector +
      '<button type="button" class="pi-shop-card__cta" data-product-link="' + product.id + '">Add to Basket</button>' +
      "</div></article>"
    );
  }

  function renderPromoCard(card) {
    if (!card) return "";
    return (
      '<article class="pi-shop-card pi-shop-card--promo">' +
      '<a href="' + card.link + '" class="pi-shop-card__promo-link">' +
      '<img src="' + card.image + '" alt="' + (card.title || "Shop promotion") + '" width="400" height="520" loading="lazy" decoding="async" />' +
      "</a></article>"
    );
  }

  var cardsHtml = window.PI_PRODUCTS.map(renderProductCard);

  if (window.PI_SHOP_PROMO_CARD && cardsHtml.length >= 7) {
    cardsHtml.splice(7, 0, renderPromoCard(window.PI_SHOP_PROMO_CARD));
  }

  grid.innerHTML = cardsHtml.join("");

  if (window.PI_initProductCards) window.PI_initProductCards();

  var countEl = document.querySelector("[data-pi-shop-count]");
  if (countEl) countEl.textContent = window.PI_PRODUCTS.length;

  grid.querySelectorAll(".pi-shop-card__size-btns, .pi-shop-card__color-btns").forEach(function (group) {
    group.addEventListener("click", function (event) {
      var sizeBtn = event.target.closest(".pi-shop-card__size");
      var colorBtn = event.target.closest(".pi-shop-card__color");
      var btn = sizeBtn || colorBtn;
      if (!btn || !group.contains(btn)) return;
      group.querySelectorAll(".pi-shop-card__size, .pi-shop-card__color").forEach(function (item) {
        item.classList.remove("is-active");
      });
      btn.classList.add("is-active");
    });
  });
})();

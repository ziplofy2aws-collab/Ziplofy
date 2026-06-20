(function () {
  if (!window.PI_PRODUCTS) return;

  var CARD_SELECTORS = [
    ".pi-picks-card",
    ".pi-planters-card",
    ".pi-shop-card:not(.pi-shop-card--promo)",
    ".pi-pdp-related-card"
  ];

  var INTERACTIVE_SELECTOR =
    ".pi-picks-card__size, .pi-planters-card__size, .pi-shop-card__size, .pi-shop-card__color, " +
    ".pi-pdp-related-card__size, .pi-pdp-related-card__color, " +
    ".pi-picks-card__size-btns, .pi-planters-card__size-btns, .pi-shop-card__size-btns, .pi-shop-card__color-btns, " +
    ".pi-pdp-related-card__size-btns, .pi-pdp-related-card__color-btns";

  function productUrl(id) {
    return "product.html?id=" + id;
  }

  function resolveProductId(card) {
    var existing = card.getAttribute("data-product-id");
    if (existing) return parseInt(existing, 10);

    var linked = card.querySelector('a[href*="product.html?id="]');
    if (linked) {
      var fromLink = linked.href.match(/[?&]id=(\d+)/);
      if (fromLink) return parseInt(fromLink[1], 10);
    }

    var img = card.querySelector(
      ".pi-picks-card__media img, .pi-planters-card__media img, .pi-shop-card__media img, .pi-pdp-related-card__media img"
    );
    if (img && img.getAttribute("src")) {
      var file = img.getAttribute("src").split("/").pop().split("?")[0];
      var matched = window.PI_PRODUCTS.find(function (item) {
        return item.image.indexOf(file) !== -1;
      });
      if (matched) return matched.id;
    }

    var track = card.parentElement;
    if (track) {
      var cardClass = card.classList[0];
      if (cardClass) {
        var siblings = track.querySelectorAll("." + cardClass);
        var index = Array.prototype.indexOf.call(siblings, card);
        if (index >= 0 && window.PI_PRODUCTS[index]) {
          return window.PI_PRODUCTS[index].id;
        }
      }
    }

    return null;
  }

  function initCard(card) {
    var productId = resolveProductId(card);
    if (!productId) return;

    var url = productUrl(productId);
    card.setAttribute("data-product-id", productId);

    card.querySelectorAll('a[href="product.html"], a[href*="product.html"]').forEach(function (anchor) {
      anchor.setAttribute("href", url);
    });

    card.querySelectorAll(
      ".pi-picks-card__cta, .pi-planters-card__cta, .pi-shop-card__cta, .pi-pdp-related-card__cta"
    ).forEach(function (cta) {
      cta.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        window.location.href = url;
      });
    });

    if (card.dataset.piCardNavBound === "true") return;
    card.dataset.piCardNavBound = "true";

    card.addEventListener("click", function (event) {
      if (event.target.closest("a")) return;
      if (event.target.closest(INTERACTIVE_SELECTOR)) return;
      if (event.target.closest("button")) return;
      window.location.href = url;
    });
  }

  function initAll() {
    CARD_SELECTORS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(initCard);
    });
  }

  initAll();
  window.PI_initProductCards = initAll;
})();

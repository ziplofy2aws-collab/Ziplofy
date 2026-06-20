/**
 * Listing pages — wire product cards to product.html?id=…
 */
(function () {
  "use strict";

  if (typeof window.AET_getProduct !== "function") return;

  var CARD_SEL = ".aet-cat-card, .aet-pcard, .aet-sel-card, .aet-pdp-fbt-card";

  function primaryImage(card) {
    var img = card.querySelector(
      ".aet-cat-card__media img, .aet-pcard__media img, .aet-sel-card__media img, .aet-pdp-fbt-card__img img"
    );
    if (img) return img.getAttribute("src");
    var any = card.querySelector("img[src*='assets/img/']");
    return any ? any.getAttribute("src") : null;
  }

  function productIdForCard(card) {
    if (card.dataset.productId) return card.dataset.productId;
    return window.AET_imageToProductId(primaryImage(card));
  }

  function isInteractiveTarget(el) {
    return !!el.closest(
      "button, .aet-cat-card__atc, .aet-cat-card__qv, .aet-pdp-fbt-card__btn, input, select, textarea, label"
    );
  }

  function wireCard(card) {
    var id = productIdForCard(card);
    if (!id || !window.AET_PRODUCTS || !window.AET_PRODUCTS[id]) return;

    card.dataset.productId = id;

    card.querySelectorAll('a[href="product.html"], a[href="./product.html"]').forEach(function (a) {
      a.setAttribute("href", window.AET_productUrl(id));
    });

    if (card.dataset.aetCardWired === "1") return;
    card.dataset.aetCardWired = "1";

    card.addEventListener("click", function (e) {
      if (isInteractiveTarget(e.target)) return;
      if (e.target.closest("a")) return;
      window.location.href = window.AET_productUrl(id);
    });
  }

  function init() {
    document.querySelectorAll(CARD_SEL).forEach(wireCard);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

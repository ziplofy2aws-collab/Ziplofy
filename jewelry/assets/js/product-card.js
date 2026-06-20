/**
 * Product card click → redirect to PDP with selected product data
 */
(function () {
  "use strict";

  var STORAGE_KEY = "avyra_selected_product";
  var CARD_SELECTOR =
    ".cat-card, .ps-card, .u30-card, .pdp-similar-card, [data-product-card]";
  var IGNORE_SELECTOR =
    "button, a.cat-card__delivery, .cat-card__compare, .cat-card__nav, .cat-card__nav-btn, .pdp-similar-card__wish";

  function getProductIdFromCard(card) {
    var dataId = card.getAttribute("data-product-id");
    if (dataId) return parseInt(dataId, 10);

    var link = card.querySelector('a[href*="product.html"]');
    if (link) {
      var match = link.getAttribute("href").match(/[?&]id=(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    return null;
  }

  function getProductName(card) {
    var el =
      card.querySelector(".cat-card__title a") ||
      card.querySelector(".cat-card__title") ||
      card.querySelector(".ps-card__name") ||
      card.querySelector(".u30-card__name") ||
      card.querySelector(".pdp-similar-card__title a") ||
      card.querySelector(".pdp-similar-card__title");
    return el ? el.textContent.trim() : "";
  }

  function getProductPrice(card) {
    var el =
      card.querySelector(".cat-card__price") ||
      card.querySelector(".ps-card__price") ||
      card.querySelector(".u30-card__price") ||
      card.querySelector(".pdp-similar-card__price");
    return el ? el.textContent.trim() : "";
  }

  function getProductPriceWas(card) {
    var el =
      card.querySelector(".cat-card__price-was") ||
      card.querySelector(".u30-card__compare") ||
      card.querySelector(".pdp-similar-card__price-was");
    return el ? el.textContent.trim() : "";
  }

  function getProductImage(card) {
    var img = card.querySelector("img");
    return img ? img.getAttribute("src") || "" : "";
  }

  function extractProductFromCard(card) {
    var name = getProductName(card);
    var id = getProductIdFromCard(card);

    if (!id && name && typeof window.findAvyraProductIdByName === "function") {
      id = window.findAvyraProductIdByName(name);
    }

    var data = {
      id: id,
      name: name,
      price: getProductPrice(card),
      priceWas: getProductPriceWas(card),
      img: getProductImage(card),
    };

    if (id && window.AVYRA_PRODUCTS && window.AVYRA_PRODUCTS[id]) {
      var catalog = window.AVYRA_PRODUCTS[id];
      data.desc = catalog.desc;
      data.sku = catalog.sku;
      data.lifestyle = catalog.lifestyle;
      if (!data.img) data.img = catalog.img;
    }

    return data;
  }

  function saveSelectedProduct(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      /* ignore quota errors */
    }
  }

  function goToProductPage(data) {
    saveSelectedProduct(data);
    var id = data.id;
    var url = id ? "product.html?id=" + id : "product.html";
    window.location.href = url;
  }

  function isIgnoredClick(target) {
    return Boolean(target.closest(IGNORE_SELECTOR));
  }

  function initCard(card) {
    card.classList.add("is-product-card");
    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
    }
    card.setAttribute("role", "link");
  }

  function handleActivate(card) {
    goToProductPage(extractProductFromCard(card));
  }

  function bindCards() {
    document.querySelectorAll(CARD_SELECTOR).forEach(initCard);
  }

  document.addEventListener("click", function (e) {
    if (isIgnoredClick(e.target)) return;

    var card = e.target.closest(CARD_SELECTOR);
    if (!card) return;

    var link = e.target.closest('a[href*="product.html"]');
    if (link && !card.contains(link)) return;

    e.preventDefault();
    handleActivate(card);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var card = e.target.closest(CARD_SELECTOR);
    if (!card || card !== e.target) return;
    e.preventDefault();
    handleActivate(card);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindCards);
  } else {
    bindCards();
  }
})();

(function () {
  "use strict";

  var STORAGE_KEY = "avyra_selected_product";
  var PRODUCTS = window.AVYRA_PRODUCTS || {};

  function readStoredProduct() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function mergeProduct(id, stored) {
    var base = Object.assign({}, PRODUCTS[id] || PRODUCTS[1]);
    if (!stored) return base;

    if (stored.name) base.name = stored.name;
    if (stored.price) base.price = stored.price;
    if (stored.priceWas) base.priceWas = stored.priceWas;
    if (stored.img) base.img = stored.img;
    if (stored.desc) base.desc = stored.desc;
    if (stored.sku) base.sku = stored.sku;
    if (stored.lifestyle) base.lifestyle = stored.lifestyle;

    return base;
  }

  function productFromStorage(stored) {
    return {
      id: stored.id || null,
      img: stored.img || "assets/img/category-1.jpg",
      lifestyle: stored.lifestyle || stored.img,
      name: stored.name || "Avyra Jewels",
      price: stored.price || "",
      priceWas: stored.priceWas || "",
      sku: stored.sku || "AVY-CUSTOM",
      desc: stored.desc || "Crafted with hallmarked gold and certified stones.",
    };
  }

  function getActiveProduct() {
    var params = new URLSearchParams(window.location.search);
    var urlId = parseInt(params.get("id"), 10);
    var stored = readStoredProduct();
    var storedId = stored && stored.id ? parseInt(stored.id, 10) : null;

    if (urlId && PRODUCTS[urlId]) {
      if (stored && storedId === urlId) {
        return mergeProduct(urlId, stored);
      }
      return Object.assign({}, PRODUCTS[urlId]);
    }

    if (stored) {
      if (storedId && PRODUCTS[storedId]) {
        return mergeProduct(storedId, stored);
      }
      return productFromStorage(stored);
    }

    return Object.assign({}, PRODUCTS[1]);
  }

  function applyProduct(p) {
    var mainImg = document.getElementById("pdp-main-image");
    var title = document.getElementById("pdp-title");
    var price = document.getElementById("pdp-price");
    var desc = document.getElementById("pdp-desc");
    var breadcrumb = document.getElementById("pdp-breadcrumb-name");
    var sku = document.getElementById("pdp-sku");
    var lifestyleTile = document.querySelector(".pdp-media__tile--lifestyle img");
    var priceWasEl = document.getElementById("pdp-price-was");

    if (mainImg) {
      mainImg.src = p.img;
      mainImg.alt = p.name;
    }
    if (lifestyleTile && p.lifestyle) {
      lifestyleTile.src = p.lifestyle;
      lifestyleTile.alt = p.name + " lifestyle";
    }
    if (title) title.textContent = p.name;
    if (price) price.textContent = p.price;
    if (priceWasEl) {
      if (p.priceWas) {
        priceWasEl.textContent = p.priceWas;
        priceWasEl.hidden = false;
      } else {
        priceWasEl.textContent = "";
        priceWasEl.hidden = true;
      }
    }
    if (desc) desc.textContent = p.desc;
    if (breadcrumb) breadcrumb.textContent = p.name;
    if (sku) sku.textContent = p.sku;
    document.title = p.name + " | Avyra Jewels";

    document.querySelectorAll(".pdp-media__tile--studio").forEach(function (tile, index) {
      if (index === 0) {
        tile.setAttribute("data-image", p.img);
        var thumb = tile.querySelector("img");
        if (thumb) {
          thumb.src = p.img;
          thumb.alt = p.name;
        }
      }
    });
  }

  applyProduct(getActiveProduct());

  document.querySelectorAll(".pdp-media__tile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      var src = tile.getAttribute("data-image");
      var mainImg = document.getElementById("pdp-main-image");
      if (!src || !mainImg) return;

      document.querySelectorAll(".pdp-media__tile").forEach(function (t) {
        t.classList.remove("is-active");
      });
      tile.classList.add("is-active");

      if (tile.classList.contains("pdp-media__tile--studio")) {
        mainImg.src = src;
      }
    });
  });

  document.querySelectorAll(".pdp-config__item").forEach(function (item) {
    item.addEventListener("click", function () {
      document.querySelectorAll(".pdp-config__item").forEach(function (el) {
        el.classList.remove("is-active");
      });
      item.classList.add("is-active");
    });
  });

  document.querySelectorAll(".pdp-tabs__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tab = btn.getAttribute("data-tab");
      document.querySelectorAll(".pdp-tabs__btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      var detailsPanel = document.getElementById("pdp-tab-details");
      var pricePanel = document.getElementById("pdp-tab-price");
      if (detailsPanel) {
        detailsPanel.classList.toggle("is-active", tab === "details");
        detailsPanel.hidden = tab !== "details";
      }
      if (pricePanel) {
        pricePanel.classList.toggle("is-active", tab === "price");
        pricePanel.hidden = tab !== "price";
      }
    });
  });

  var skuCopy = document.getElementById("pdp-sku-copy");
  var skuEl = document.getElementById("pdp-sku");
  if (skuCopy && skuEl) {
    skuCopy.addEventListener("click", function () {
      var text = skuEl.textContent || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
    });
  }

  var similarTrack = document.getElementById("pdp-similar-track");
  var similarPrev = document.getElementById("pdp-similar-prev");
  var similarNext = document.getElementById("pdp-similar-next");

  function scrollSimilar(direction) {
    if (!similarTrack) return;
    var card = similarTrack.querySelector(".pdp-similar-card");
    var amount = card ? card.offsetWidth + 16 : 200;
    similarTrack.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  if (similarPrev) {
    similarPrev.addEventListener("click", function () {
      scrollSimilar(-1);
    });
  }

  if (similarNext) {
    similarNext.addEventListener("click", function () {
      scrollSimilar(1);
    });
  }

  document.querySelectorAll(".pdp-similar-card__wish").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var icon = btn.querySelector("i");
      if (!icon) return;
      icon.classList.toggle("fa-regular");
      icon.classList.toggle("fa-solid");
    });
  });
})();

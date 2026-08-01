(function () {
  "use strict";

  var products = (window.RAAH_PRODUCTS || []).slice(0, 8);
  var formatPrice = window.RAAH_formatPrice;
  var params = new URLSearchParams(window.location.search);
  var urlCat = params.get("cat") || "";

  var state = {
    prices: [],
    discounts: [],
    sizes: [],
    genders: urlCat && ["Men", "Women", "Kids"].indexOf(urlCat) !== -1 ? [urlCat] : [],
    colors: [],
    types: [],
    sort: "recommended",
    view: "grid"
  };

  var grid = document.querySelector("[data-shop-grid]");
  var titleEl = document.querySelector("[data-shop-title]");
  var countEl = document.querySelector("[data-shop-count]");
  var crumbEl = document.querySelector("[data-shop-crumb]");
  var sortEl = document.querySelector("[data-shop-sort]");
  var sizePanel = document.querySelector("[data-filter-size]");
  var colorPanel = document.querySelector("[data-filter-color]");
  var typePanel = document.querySelector("[data-filter-type]");
  var filterToggle = document.querySelector("[data-shop-filter-toggle]");
  var filtersPanel = document.querySelector("[data-shop-filters]");

  function unique(arr) {
    var out = [];
    arr.forEach(function (v) {
      if (out.indexOf(v) === -1) out.push(v);
    });
    return out;
  }

  function starHtml(rating) {
    var html = "";
    var full = Math.floor(rating);
    var half = rating - full >= 0.4;
    var i;
    for (i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
    if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    for (i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="fa-regular fa-star"></i>';
    return html;
  }

  function cardHtml(p) {
    var badge =
      p.badge === "new"
        ? '<span class="product-card__badge product-card__badge--arrival">NEW ARRIVAL</span>'
        : '<span class="product-card__badge"><i class="fa-solid fa-star" aria-hidden="true"></i> BEST SELLER</span>';
    var href = "product.html?id=" + encodeURIComponent(p.id);
    return (
      '<article class="product-card" data-product-id="' + p.id + '" data-product-href="' + href + '" role="link" tabindex="0">' +
      '<div class="product-card__media">' +
      '<a href="' + href + '" class="product-card__link" aria-label="' + p.name + '">' +
      '<img src="' + p.image + '" alt="' + p.name + '" width="540" height="720" loading="lazy" decoding="async">' +
      "</a>" +
      '<span class="product-card__discount">' + p.discount + "% off</span>" +
      '<button type="button" class="product-card__wish" aria-label="Add to wishlist">' +
      '<i class="fa-regular fa-heart" aria-hidden="true"></i></button>' +
      badge +
      "</div>" +
      '<div class="product-card__body">' +
      '<h3 class="product-card__name"><a href="' + href + '">' + p.name + "</a></h3>" +
      '<div class="product-card__rating">' +
      '<span class="product-card__stars" aria-hidden="true">' + starHtml(p.rating) + "</span>" +
      '<span class="product-card__reviews">' + p.rating.toFixed(1) + " | " + p.reviews +
      (p.reviews === 1 ? " Review" : " Reviews") + "</span>" +
      "</div>" +
      '<div class="product-card__price">' +
      '<span class="product-card__price-now">' + formatPrice(p.price) + "</span>" +
      '<span class="product-card__price-was">' + formatPrice(p.mrp) + "</span>" +
      '<span class="product-card__sale">Sale</span>' +
      "</div>" +
      '<p class="product-card__sizes">' + p.sizes.join(" ") + "</p>" +
      "</div></article>"
    );
  }

  function buildDynamicFilters() {
    var sizes = [];
    var colors = [];
    var types = [];
    products.forEach(function (p) {
      (p.sizes || []).forEach(function (s) { sizes.push(s); });
      if (p.color) colors.push(p.color);
      if (p.type) types.push(p.type);
    });
    sizes = unique(sizes).sort(function (a, b) { return a - b; });
    colors = unique(colors).sort();
    types = unique(types).sort();

    if (sizePanel) {
      sizePanel.innerHTML = sizes
        .map(function (s) {
          return (
            '<button type="button" class="shop-size-chip" data-size="' + s + '" aria-pressed="false">' +
            s + "</button>"
          );
        })
        .join("");
    }

    if (colorPanel) {
      colorPanel.innerHTML = colors
        .map(function (c) {
          return (
            '<label class="shop-check"><input type="checkbox" value="' + c + '"> ' + c + "</label>"
          );
        })
        .join("");
    }

    if (typePanel) {
      typePanel.innerHTML = types
        .map(function (t) {
          return (
            '<label class="shop-check"><input type="checkbox" value="' + t + '"> ' + t + "</label>"
          );
        })
        .join("");
    }
  }

  function inPriceRange(price, ranges) {
    if (!ranges.length) return true;
    return ranges.some(function (r) {
      var parts = r.split("-");
      var min = Number(parts[0]);
      var max = Number(parts[1]);
      return price >= min && price <= max;
    });
  }

  function filtered() {
    var list = products.filter(function (p) {
      if (!inPriceRange(p.price, state.prices)) return false;

      if (state.discounts.length) {
        var okDisc = state.discounts.some(function (d) {
          return p.discount >= Number(d);
        });
        if (!okDisc) return false;
      }

      if (state.sizes.length) {
        var okSize = state.sizes.some(function (s) {
          return (p.sizes || []).indexOf(Number(s)) !== -1;
        });
        if (!okSize) return false;
      }

      if (state.genders.length && state.genders.indexOf(p.gender) === -1) return false;
      if (state.colors.length && state.colors.indexOf(p.color) === -1) return false;
      if (state.types.length && state.types.indexOf(p.type) === -1) return false;

      // Legacy category URL support for Sports etc.
      if (urlCat && ["Men", "Women", "Kids"].indexOf(urlCat) === -1) {
        if (p.category !== urlCat && p.type !== urlCat) return false;
      }

      return true;
    });

    list = list.slice();
    if (state.sort === "price-low") list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "price-high") list.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === "discount") list.sort(function (a, b) { return b.discount - a.discount; });
    else if (state.sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });
    return list;
  }

  function pageTitle() {
    if (state.genders.length === 1) return state.genders[0] + "'s Footwear";
    if (urlCat === "Sports") return "Sports Footwear";
    if (urlCat && ["Men", "Women", "Kids"].indexOf(urlCat) !== -1) return urlCat + "'s Footwear";
    return "All Shoes";
  }

  function renderGrid() {
    var list = filtered();
    var title = pageTitle();
    if (titleEl) titleEl.textContent = title;
    if (crumbEl) crumbEl.textContent = title.toUpperCase();
    if (countEl) {
      countEl.textContent = list.length + (list.length === 1 ? " product" : " products");
    }
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '<p class="shop-empty">No products match your selected filters.</p>';
      return;
    }
    grid.innerHTML = list.map(cardHtml).join("");
    bindWish();
    bindCardNavigation();
  }

  function bindWish() {
    if (!grid) return;
    grid.querySelectorAll(".product-card__wish").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var icon = btn.querySelector("i");
        var active = btn.classList.toggle("is-active");
        if (!icon) return;
        icon.classList.toggle("fa-regular", !active);
        icon.classList.toggle("fa-solid", active);
        icon.classList.add("fa-heart");
      });
    });
  }

  function bindCardNavigation() {
    if (!grid) return;
    grid.querySelectorAll(".product-card[data-product-href]").forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest(".product-card__wish")) return;
        if (e.target.closest("a")) return;
        var href = card.getAttribute("data-product-href");
        if (href) window.location.href = href;
      });
      card.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        if (e.target.closest(".product-card__wish")) return;
        e.preventDefault();
        var href = card.getAttribute("data-product-href");
        if (href) window.location.href = href;
      });
    });
  }

  function readCheckboxes(selector) {
    return Array.prototype.slice
      .call(document.querySelectorAll(selector + ' input[type="checkbox"]:checked'))
      .map(function (el) { return el.value; });
  }

  function syncFiltersFromUI() {
    state.prices = readCheckboxes("[data-filter-price]");
    state.discounts = readCheckboxes("[data-filter-discount]");
    state.genders = readCheckboxes("[data-filter-gender]");
    state.colors = readCheckboxes("[data-filter-color]");
    state.types = readCheckboxes("[data-filter-type]");
    renderGrid();
  }

  function precheckGender() {
    if (!state.genders.length) return;
    document.querySelectorAll("[data-filter-gender] input").forEach(function (input) {
      if (state.genders.indexOf(input.value) !== -1) input.checked = true;
    });
  }

  /* Accordion */
  document.querySelectorAll("[data-acc-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var acc = btn.closest("[data-acc]");
      if (!acc) return;
      var panel = acc.querySelector(".shop-acc__panel");
      var open = acc.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.hidden = !open;
    });
  });

  /* Filter change listeners */
  ["[data-filter-price]", "[data-filter-discount]", "[data-filter-gender]", "[data-filter-color]", "[data-filter-type]"]
    .forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.addEventListener("change", syncFiltersFromUI);
    });

  if (sizePanel) {
    sizePanel.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-size]");
      if (!btn) return;
      var size = Number(btn.getAttribute("data-size"));
      var idx = state.sizes.indexOf(size);
      if (idx === -1) state.sizes.push(size);
      else state.sizes.splice(idx, 1);
      btn.classList.toggle("is-active");
      btn.setAttribute("aria-pressed", btn.classList.contains("is-active") ? "true" : "false");
      renderGrid();
    });
  }

  if (sortEl) {
    sortEl.addEventListener("change", function () {
      state.sort = sortEl.value;
      renderGrid();
    });
  }

  document.querySelectorAll("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.view = btn.getAttribute("data-view");
      document.querySelectorAll("[data-view]").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (grid) grid.setAttribute("data-view-mode", state.view);
    });
  });

  if (filterToggle && filtersPanel) {
    filterToggle.addEventListener("click", function () {
      var open = filtersPanel.classList.toggle("is-open");
      filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  buildDynamicFilters();
  precheckGender();
  renderGrid();
})();

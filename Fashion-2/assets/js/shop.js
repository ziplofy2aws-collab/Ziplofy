(function () {
  "use strict";

  var FILTER_LABELS = {
    brand: "Brand",
    price: "Price",
    sizes: "Size",
    discount: "Discount",
    occasion: "Occasion",
    color: "Colour",
    productType: "Product Type",
    fit: "Fit",
    pattern: "Pattern",
    fabric: "Fabric Type"
  };

  var VALUE_LABELS = {
    "under-999": "Under \u20B9999",
    "1000-1999": "\u20B91,000 \u2013 \u20B91,999",
    "above-1999": "Above \u20B91,999",
    "on-sale": "On Sale",
    "no-discount": "Regular Price",
    casual: "Casual",
    formal: "Formal",
    athleisure: "Athleisure",
    multicolour: "Multicolour",
    green: "Green",
    black: "Black",
    blue: "Blue",
    white: "White",
    shirts: "Shirts",
    relaxed: "Relaxed",
    regular: "Regular",
    slim: "Slim",
    printed: "Printed",
    solid: "Solid",
    checked: "Checked",
    cotton: "Cotton",
    linen: "Linen Blend"
  };

  var drawer = document.querySelector("[data-f2-shop-filters]");
  var gridEl = document.querySelector("[data-f2-shop-grid]");
  if (!gridEl) return;

  var backdrop = document.querySelector("[data-f2-shop-backdrop]");
  var toggleBtn = document.querySelector("[data-f2-shop-filter-toggle]");
  var closeBtn = document.querySelector("[data-f2-shop-filters-close]");
  var applyBtn = document.querySelector("[data-f2-shop-apply]");
  var clearAllBtns = document.querySelectorAll("[data-f2-shop-clear-all]");
  var sortSelect = document.querySelector("[data-f2-shop-sort-select]");
  var countEl = document.querySelector("[data-f2-shop-count]");
  var chipsEl = document.querySelector("[data-f2-shop-chips]");
  var emptyEl = document.querySelector("[data-f2-shop-empty]");
  var sizeBtns = document.querySelectorAll("[data-f2-shop-size]");
  var cards = Array.prototype.slice.call(gridEl.querySelectorAll("[data-f2-product-id]"));

  var appliedFilters = {};
  var appliedSort = "popular";
  var selectedSizes = [];

  function getCatalog() {
    return window.F2_CATALOG || {};
  }

  function getProduct(id) {
    return getCatalog()[id];
  }

  function formatValue(value) {
    return VALUE_LABELS[value] || String(value).replace(/-/g, " ").replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  function getPrice(product) {
    return product.salePrice || product.price;
  }

  function matchesPrice(product, range) {
    var price = getPrice(product);
    if (range === "under-999") return price <= 999;
    if (range === "1000-1999") return price >= 1000 && price <= 1999;
    if (range === "above-1999") return price > 1999;
    return false;
  }

  function matchesDiscount(product, value) {
    var onSale = Boolean(product.salePrice);
    if (value === "on-sale") return onSale;
    if (value === "no-discount") return !onSale;
    return false;
  }

  function matchesSizes(product, sizes) {
    if (!sizes.length) return true;
    var productSizes = product.sizes || [];
    return sizes.some(function (s) {
      return productSizes.indexOf(s) !== -1;
    });
  }

  function productMatches(product, filters, sizes) {
    var f = product.filter || {};

    if (sizes.length && !matchesSizes(product, sizes)) return false;

    return Object.keys(filters).every(function (key) {
      var selected = filters[key];
      if (!selected || !selected.length) return true;

      if (key === "price") {
        return selected.some(function (v) { return matchesPrice(product, v); });
      }
      if (key === "discount") {
        return selected.some(function (v) { return matchesDiscount(product, v); });
      }
      if (key === "sizes") {
        return matchesSizes(product, selected);
      }

      return selected.indexOf(f[key]) !== -1;
    });
  }

  function getActiveFilterRoot() {
    if (drawer && drawer.classList.contains("is-open")) {
      return drawer.querySelector(".f2-shop__drawer-body");
    }
    return document.querySelector(".f2-shop__sidebar");
  }

  function collectFilterInputs() {
    var root = getActiveFilterRoot() || document;
    var filters = {};
    root.querySelectorAll("[data-f2-filter-group]").forEach(function (group) {
      var key = group.getAttribute("data-f2-filter-group");
      var checked = Array.prototype.slice.call(group.querySelectorAll("input:checked")).map(function (input) {
        return input.value;
      });
      if (checked.length) filters[key] = checked;
    });
    return filters;
  }

  function syncAllInputs(filters, sizes) {
    document.querySelectorAll("[data-f2-filter-group]").forEach(function (group) {
      var key = group.getAttribute("data-f2-filter-group");
      var selected = filters[key] || [];
      group.querySelectorAll("input").forEach(function (input) {
        input.checked = selected.indexOf(input.value) !== -1;
      });
    });

    sizeBtns.forEach(function (btn) {
      var size = btn.getAttribute("data-f2-shop-size");
      btn.classList.toggle("is-active", sizes.indexOf(size) !== -1);
    });

    document.querySelectorAll('[data-f2-filter-group="sizes"] input').forEach(function (input) {
      input.checked = sizes.indexOf(input.value) !== -1;
    });
  }

  function getAllActiveFilters() {
    var combined = JSON.parse(JSON.stringify(appliedFilters));
    if (selectedSizes.length) {
      combined.sizes = selectedSizes.slice();
    }
    return combined;
  }

  function renderChips() {
    if (!chipsEl) return;
    chipsEl.innerHTML = "";
    var combined = getAllActiveFilters();

    Object.keys(combined).forEach(function (key) {
      combined[key].forEach(function (value) {
        var chip = document.createElement("span");
        chip.className = "f2-shop__chip";
        chip.innerHTML =
          (FILTER_LABELS[key] || key) + " - " + formatValue(value) +
          ' <button type="button" class="f2-shop__chip-remove" aria-label="Remove filter" data-f2-chip-remove="' +
          key + ":" + value + '"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
        chipsEl.appendChild(chip);
      });
    });

    chipsEl.querySelectorAll("[data-f2-chip-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var parts = btn.getAttribute("data-f2-chip-remove").split(":");
        var key = parts[0];
        var value = parts.slice(1).join(":");
        removeFilter(key, value);
      });
    });
  }

  function removeFilter(key, value) {
    if (key === "sizes") {
      selectedSizes = selectedSizes.filter(function (s) { return s !== value; });
    } else if (appliedFilters[key]) {
      appliedFilters[key] = appliedFilters[key].filter(function (v) { return v !== value; });
      if (!appliedFilters[key].length) delete appliedFilters[key];
    }
    syncAllInputs(appliedFilters, selectedSizes);
    renderGrid();
  }

  function clearAllFilters() {
    appliedFilters = {};
    selectedSizes = [];
    syncAllInputs(appliedFilters, selectedSizes);
    renderGrid();
  }

  function sortProducts(products) {
    var list = products.slice();
    if (appliedSort === "price-asc") {
      list.sort(function (a, b) { return getPrice(a) - getPrice(b); });
    } else if (appliedSort === "price-desc") {
      list.sort(function (a, b) { return getPrice(b) - getPrice(a); });
    } else if (appliedSort === "newest") {
      list.sort(function (a, b) { return Number(b.isNew) - Number(a.isNew); });
    } else if (appliedSort === "discount") {
      list.sort(function (a, b) {
        var aOff = a.salePrice ? (1 - a.salePrice / a.price) : 0;
        var bOff = b.salePrice ? (1 - b.salePrice / b.price) : 0;
        return bOff - aOff;
      });
    }
    return list;
  }

  function updateCount(count) {
    if (countEl) countEl.textContent = count + " Product" + (count === 1 ? "" : "s");
  }

  function renderGrid() {
    var visible = sortProducts(cards.map(function (card) {
      return getProduct(card.getAttribute("data-f2-product-id"));
    }).filter(Boolean).filter(function (product) {
      return productMatches(product, appliedFilters, selectedSizes);
    }));

    var order = visible.map(function (p) { return p.id; });

    cards.forEach(function (card) {
      var id = card.getAttribute("data-f2-product-id");
      card.hidden = order.indexOf(id) === -1;
      card.style.order = "";
    });

    document.querySelectorAll(".f2-shop__row").forEach(function (row) {
      var visibleCards = row.querySelectorAll(".f2-shop__card:not([hidden])");
      row.hidden = visibleCards.length === 0;
    });

    if (emptyEl) emptyEl.hidden = visible.length > 0;
    updateCount(visible.length);
    renderChips();
  }

  function applyFiltersFromInputs() {
    appliedFilters = collectFilterInputs();
    if (appliedFilters.sizes) {
      selectedSizes = appliedFilters.sizes.slice();
      delete appliedFilters.sizes;
    }
    syncAllInputs(appliedFilters, selectedSizes);
    renderGrid();
  }

  function initAccordions(scope) {
    (scope || document).querySelectorAll(".f2-shop__acc-btn").forEach(function (btn) {
      if (btn.dataset.f2AccBound) return;
      btn.dataset.f2AccBound = "1";
      btn.addEventListener("click", function () {
        var item = btn.closest(".f2-shop__acc-item");
        var isOpen = item.classList.contains("is-open");
        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
    });
  }

  function openDrawer() {
    if (!drawer) return;
    syncAllInputs(appliedFilters, selectedSizes);
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (backdrop) backdrop.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  function bindFilterInputs(root) {
    if (!root) return;
    root.querySelectorAll("[data-f2-filter-group] input").forEach(function (input) {
      if (input.dataset.f2Bound) return;
      input.dataset.f2Bound = "1";
      input.addEventListener("change", applyFiltersFromInputs);
    });
  }

  var drawerFilters = document.querySelector("[data-f2-drawer-filters]");
  var accordion = document.querySelector("[data-f2-shop-accordion]");
  if (drawerFilters && accordion) {
    drawerFilters.innerHTML = accordion.innerHTML;
    var drawerHead = drawer && drawer.querySelector(".f2-shop__drawer-body");
    if (drawerHead) {
      var clearClone = document.createElement("div");
      clearClone.className = "f2-shop__filter-head";
      clearClone.innerHTML =
        '<span class="f2-shop__filter-head-title">FILTER BY</span>' +
        '<button type="button" class="f2-shop__filter-head-clear" data-f2-shop-clear-all>CLEAR ALL</button>';
      drawerFilters.insertBefore(clearClone, drawerFilters.firstChild);
    }
  }

  initAccordions();
  if (drawerFilters) initAccordions(drawerFilters);

  bindFilterInputs(document.querySelector(".f2-shop__sidebar"));
  bindFilterInputs(drawerFilters);

  clearAllBtns = document.querySelectorAll("[data-f2-shop-clear-all]");

  sizeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var size = btn.getAttribute("data-f2-shop-size");
      if (selectedSizes.indexOf(size) !== -1) {
        selectedSizes = selectedSizes.filter(function (s) { return s !== size; });
      } else {
        selectedSizes.push(size);
      }
      syncAllInputs(appliedFilters, selectedSizes);
      renderGrid();
    });
  });

  clearAllBtns.forEach(function (btn) {
    btn.addEventListener("click", clearAllFilters);
  });

  if (toggleBtn) toggleBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  if (applyBtn) {
    applyBtn.addEventListener("click", function () {
      applyFiltersFromInputs();
      closeDrawer();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      appliedSort = sortSelect.value;
      renderGrid();
    });
  }

  function productPageUrl(id) {
    return "product.html?id=" + encodeURIComponent(id);
  }

  function setupProductCards() {
    cards.forEach(function (card) {
      var id = card.getAttribute("data-f2-product-id");
      if (!id) return;

      var url = productPageUrl(id);
      var product = getProduct(id);
      var label = product ? "View " + product.title : "View product";

      if (!card.querySelector(".f2-shop__card-link")) {
        var link = document.createElement("a");
        link.href = url;
        link.className = "f2-shop__card-link";
        link.setAttribute("aria-label", label);
        card.insertBefore(link, card.firstChild);
      } else {
        card.querySelector(".f2-shop__card-link").href = url;
      }

      card.querySelectorAll(".f2-shop__media-link, .f2-shop__body").forEach(function (el) {
        if (el.tagName !== "A") return;
        var div = document.createElement(el.classList.contains("f2-shop__body") ? "div" : "div");
        div.className = el.className;
        div.innerHTML = el.innerHTML;
        el.parentNode.replaceChild(div, el);
      });
    });
  }

  setupProductCards();

  gridEl.querySelectorAll("[data-f2-shop-wish]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle("is-active");
      var icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");
      }
    });
  });

  gridEl.querySelectorAll("[data-f2-shop-similar]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  renderGrid();
})();
